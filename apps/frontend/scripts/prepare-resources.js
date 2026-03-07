#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '../../..');
const envPath = path.join(projectRoot, 'infrastructure/docker/.env');
const resourcesDir = path.join(__dirname, '../build/resources');

console.log('📦 Preparing resources for packaging...');

// Create resources directory
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Read .env file
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found at', envPath);
  console.error('Please run: ./infrastructure/scripts/setup.sh');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

console.log('✓ Loaded environment variables');

// Create docker-compose.yml with hardcoded values
const dockerCompose = `version: '3.8'

name: docker

services:
  mysql:
    image: mysql:8.0
    container_name: cashlog-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${env.MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ${env.MYSQL_USER}
      MYSQL_PASSWORD: ${env.MYSQL_PASSWORD}
      MYSQL_DATABASE: ${env.MYSQL_DATABASE}
    ports:
      - "${env.MYSQL_PORT}:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${env.MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  mysql-data:
`;

fs.writeFileSync(path.join(resourcesDir, 'docker-compose.yml'), dockerCompose);
console.log('✓ Created docker-compose.yml');

// Create config.json
const config = {
  db: {
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    rootPassword: env.MYSQL_ROOT_PASSWORD,
    database: env.MYSQL_DATABASE,
    port: env.MYSQL_PORT
  }
};

fs.writeFileSync(path.join(resourcesDir, 'config.json'), JSON.stringify(config, null, 2));
console.log('✓ Created config.json');

// Build backend JAR
console.log('🔨 Building backend JAR...');
const backendPath = path.join(projectRoot, 'apps/backend');
try {
  execSync('./mvnw clean package -DskipTests', {
    cwd: backendPath,
    stdio: 'inherit'
  });
  
  const jarSource = path.join(backendPath, 'target/cashlog-backend-1.0.0.jar');
  const jarDest = path.join(resourcesDir, 'backend.jar');
  
  if (fs.existsSync(jarSource)) {
    fs.copyFileSync(jarSource, jarDest);
    console.log('✓ Copied backend.jar');
  } else {
    console.error('❌ Error: JAR file not found at', jarSource);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error building backend:', error.message);
  process.exit(1);
}

console.log('✅ Resources prepared successfully!');
