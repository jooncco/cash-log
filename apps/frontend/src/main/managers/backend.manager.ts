import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export class BackendManager {
  private dbProcess: ChildProcess | null = null;
  private backendProcess: ChildProcess | null = null;
  private projectRoot: string;
  private dbPassword: string = '';

  constructor() {
    this.projectRoot = process.env.CASHLOG_PROJECT_ROOT || path.join(app.getPath('home'), 'workspace', 'cash-log');
    this.loadEnvFile();
    console.log(`[BackendManager] Project root: ${this.projectRoot}`);
  }

  private loadEnvFile(): void {
    const envPath = path.join(this.projectRoot, 'infrastructure', 'docker', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const rootPasswordMatch = envContent.match(/MYSQL_ROOT_PASSWORD=(.+)/);
      const passwordMatch = envContent.match(/MYSQL_PASSWORD=(.+)/);
      
      if (rootPasswordMatch) {
        this.dbPassword = rootPasswordMatch[1].trim();
        console.log('[BackendManager] DB root password loaded from .env');
      } else if (passwordMatch) {
        this.dbPassword = passwordMatch[1].trim();
        console.log('[BackendManager] DB password loaded from .env');
      }
    }
  }

  async startInfrastructure(): Promise<boolean> {
    console.log('[BackendManager] Starting database...');
    
    const scriptPath = path.join(this.projectRoot, 'infrastructure', 'scripts', 'start.sh');
    if (!fs.existsSync(scriptPath)) {
      console.error(`[BackendManager] Script not found: ${scriptPath}`);
      return false;
    }

    return new Promise((resolve) => {
      this.dbProcess = spawn('bash', [scriptPath], {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      this.dbProcess.stdout?.on('data', (data) => {
        console.log(`[DB] ${data.toString().trim()}`);
      });

      this.dbProcess.stderr?.on('data', (data) => {
        console.error(`[DB Error] ${data.toString().trim()}`);
      });

      this.dbProcess.on('close', async (code) => {
        if (code === 0) {
          console.log('[BackendManager] Start script completed, waiting for MySQL...');
          const ready = await this.waitForDatabase();
          resolve(ready);
        } else {
          console.error(`[BackendManager] Start script failed with code ${code}`);
          resolve(false);
        }
      });

      this.dbProcess.on('error', (error) => {
        console.error(`[BackendManager] DB process error: ${error}`);
        resolve(false);
      });
    });
  }

  private async waitForDatabase(maxWaitMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 1000;

    while (Date.now() - startTime < maxWaitMs) {
      try {
        execSync('docker exec cashlog-mysql mysqladmin ping -h localhost -u root -p"' + this.dbPassword + '" 2>/dev/null', {
          stdio: 'pipe'
        });
        console.log('[BackendManager] Database is ready');
        return true;
      } catch (error) {
        // Database not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    console.error('[BackendManager] Database failed to start within timeout');
    return false;
  }

  private async waitForBackendReady(maxWaitMs: number = 60000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 1000;

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const response = await fetch('http://localhost:8080/actuator/health');
        if (response.ok) {
          console.log('[BackendManager] Backend is ready');
          return true;
        }
      } catch (error) {
        // Backend not ready yet, continue waiting
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    console.error('[BackendManager] Backend failed to start within timeout');
    return false;
  }

  async startBackend(): Promise<boolean> {
    console.log('[BackendManager] Starting backend...');
    
    const backendPath = path.join(this.projectRoot, 'apps', 'backend');
    if (!fs.existsSync(backendPath)) {
      console.error(`[BackendManager] Backend path not found: ${backendPath}`);
      return false;
    }

    const envPath = path.join(this.projectRoot, 'infrastructure', 'docker', '.env');
    let dbPassword = 'cashlog';
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/MYSQL_PASSWORD=(.+)/);
      if (match) {
        dbPassword = match[1].trim();
      }
    }

    this.backendProcess = spawn('./mvnw', ['spring-boot:run'], {
      cwd: backendPath,
      env: {
        ...process.env,
        DB_USER: 'cashlog',
        DB_PASSWORD: dbPassword
      },
      stdio: 'pipe'
    });

    this.backendProcess.stdout?.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    this.backendProcess.stderr?.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    this.backendProcess.on('error', (error) => {
      console.error(`[BackendManager] Backend process error: ${error}`);
    });

    return await this.waitForBackendReady();
  }

  async start(): Promise<void> {
    try {
      await this.startInfrastructure();
      await this.startBackend();
      console.log('Backend services started successfully');
    } catch (error) {
      console.error('Failed to start backend services:', error);
    }
  }

  stop(): void {
    console.log('[BackendManager] Stopping backend services...');
    
    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
      this.backendProcess = null;
      console.log('[BackendManager] Backend process terminated');
    }

    const dockerComposePath = path.join(this.projectRoot, 'infrastructure', 'docker');
    if (fs.existsSync(dockerComposePath)) {
      try {
        execSync('docker-compose down', {
          cwd: dockerComposePath,
          stdio: 'inherit'
        });
        console.log('[BackendManager] Docker containers stopped');
      } catch (error) {
        console.error('[BackendManager] Failed to stop docker containers:', error);
      }
    }
    
    this.dbProcess = null;
  }
}
