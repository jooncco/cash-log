import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

interface Config {
  db: {
    user: string;
    password: string;
    rootPassword: string;
    database: string;
    port: string;
  };
}

export class BackendManager {
  private dbProcess: ChildProcess | null = null;
  private backendProcess: ChildProcess | null = null;
  private resourcesPath: string;
  private config: Config;
  private logPath: string;

  constructor() {
    this.resourcesPath = app.isPackaged
      ? path.join(process.resourcesPath, 'resources')
      : path.join(__dirname, '../../build/resources');
    
    this.logPath = path.join(app.getPath('userData'), 'backend.log');
    this.config = this.loadConfig();
    this.log(`Resources path: ${this.resourcesPath}`);
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    try {
      fs.appendFileSync(this.logPath, logMessage);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  private loadConfig(): Config {
    const configPath = path.join(this.resourcesPath, 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      this.log('Config loaded');
      return config;
    }
    throw new Error('Config file not found');
  }

  async startInfrastructure(): Promise<boolean> {
    this.log('Starting database...');
    
    const dockerComposePath = this.resourcesPath;
    if (!fs.existsSync(path.join(dockerComposePath, 'docker-compose.yml'))) {
      this.log(`ERROR: docker-compose.yml not found at: ${dockerComposePath}`);
      return false;
    }

    // Clean up any existing containers first
    try {
      execSync('/usr/local/bin/docker-compose down', {
        cwd: dockerComposePath,
        stdio: 'pipe'
      });
      this.log('Cleaned up existing containers');
    } catch (error) {
      this.log('No existing containers to clean up');
    }

    return new Promise((resolve) => {
      this.dbProcess = spawn('/usr/local/bin/docker-compose', ['up', '-d'], {
        cwd: dockerComposePath,
        stdio: 'pipe'
      });

      this.dbProcess.stdout?.on('data', (data) => {
        this.log(`[DB] ${data.toString().trim()}`);
      });

      this.dbProcess.stderr?.on('data', (data) => {
        this.log(`[DB Error] ${data.toString().trim()}`);
      });

      this.dbProcess.on('close', async (code) => {
        if (code === 0) {
          this.log('Docker compose started, waiting for MySQL...');
          const ready = await this.waitForDatabase();
          resolve(ready);
        } else {
          this.log(`ERROR: Docker compose failed with code ${code}`);
          resolve(false);
        }
      });

      this.dbProcess.on('error', (error) => {
        this.log(`ERROR: DB process error: ${error}`);
        resolve(false);
      });
    });
  }

  private async waitForDatabase(maxWaitMs: number = 90000): Promise<boolean> {
    const startTime = Date.now();
    let checkInterval = 1000; // Start with 1 second
    const maxInterval = 5000; // Max 5 seconds

    while (Date.now() - startTime < maxWaitMs) {
      try {
        // Check Docker container health status
        const result = execSync('docker inspect --format="{{.State.Health.Status}}" cashlog-mysql', {
          stdio: 'pipe',
          encoding: 'utf-8',
          env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin' }
        }).trim();
        
        if (result === 'healthy') {
          this.log('Database is ready');
          return true;
        }
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        this.log(`Waiting for database... (${elapsed}s, status: ${result})`);
      } catch (error) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        this.log(`Waiting for database... (${elapsed}s) - ${error instanceof Error ? error.message : 'unknown error'}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      // Exponential backoff: double the interval, up to maxInterval
      checkInterval = Math.min(checkInterval * 2, maxInterval);
    }

    this.log('ERROR: Database failed to start within timeout');
    return false;
  }

  private async waitForBackendReady(maxWaitMs: number = 90000): Promise<boolean> {
    const startTime = Date.now();
    let checkInterval = 1000; // Start with 1 second
    const maxInterval = 5000; // Max 5 seconds

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const response = await fetch('http://localhost:8080/actuator/health');
        if (response.ok) {
          this.log('Backend is ready');
          return true;
        }
      } catch (error) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        this.log(`Waiting for backend... (${elapsed}s)`);
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      // Exponential backoff: double the interval, up to maxInterval
      checkInterval = Math.min(checkInterval * 2, maxInterval);
    }

    this.log('ERROR: Backend failed to start within timeout');
    return false;
  }

  async startBackend(): Promise<boolean> {
    this.log('Starting backend...');
    
    const jarPath = path.join(this.resourcesPath, 'backend.jar');
    if (!fs.existsSync(jarPath)) {
      this.log(`ERROR: Backend JAR not found at: ${jarPath}`);
      return false;
    }

    // Find Java executable
    let javaPath = 'java';
    const commonPaths = [
      '/opt/homebrew/opt/openjdk@21/bin/java',
      '/opt/homebrew/bin/java',
      '/usr/local/bin/java',
      '/Library/Java/JavaVirtualMachines/openjdk.jdk/Contents/Home/bin/java'
    ];
    
    for (const path of commonPaths) {
      if (fs.existsSync(path)) {
        javaPath = path;
        break;
      }
    }
    
    this.log(`Using Java: ${javaPath}`);

    this.backendProcess = spawn(javaPath, ['-jar', jarPath], {
      env: {
        ...process.env,
        DB_USER: this.config.db.user,
        DB_PASSWORD: this.config.db.password
      },
      stdio: 'pipe'
    });

    this.backendProcess.stdout?.on('data', (data) => {
      this.log(`[Backend] ${data.toString().trim()}`);
    });

    this.backendProcess.stderr?.on('data', (data) => {
      this.log(`[Backend Error] ${data.toString().trim()}`);
    });

    this.backendProcess.on('error', (error) => {
      this.log(`ERROR: Backend process error: ${error}`);
    });

    return await this.waitForBackendReady();
  }

  async start(): Promise<void> {
    try {
      this.log('=== Starting backend services ===');
      const dbStarted = await this.startInfrastructure();
      if (!dbStarted) {
        this.log('ERROR: Failed to start database');
        return;
      }
      
      const backendStarted = await this.startBackend();
      if (!backendStarted) {
        this.log('ERROR: Failed to start backend');
        return;
      }
      
      this.log('=== Backend services started successfully ===');
    } catch (error) {
      this.log(`ERROR: Failed to start backend services: ${error}`);
    }
  }

  stop(): void {
    this.log('Stopping backend services...');
    
    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
      this.backendProcess = null;
      this.log('Backend process terminated');
    }

    if (fs.existsSync(this.resourcesPath)) {
      try {
        execSync('/usr/local/bin/docker-compose down', {
          cwd: this.resourcesPath,
          stdio: 'inherit'
        });
        this.log('Docker containers stopped');
      } catch (error) {
        this.log(`ERROR: Failed to stop docker containers: ${error}`);
      }
    }
    
    this.dbProcess = null;
    
    // Clean up log file
    this.cleanupLog();
  }

  private cleanupLog(): void {
    try {
      if (fs.existsSync(this.logPath)) {
        fs.unlinkSync(this.logPath);
        console.log('Log file cleaned up');
      }
    } catch (error) {
      console.error('Failed to clean up log file:', error);
    }
  }
}
