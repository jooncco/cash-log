# Build Instructions

## Prerequisites

### Backend Requirements
- **Java**: JDK 21 or higher
- **Maven**: 3.6+ (included via mvnw wrapper)
- **Database**: MySQL 8.0+

### Frontend Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

### System Requirements
- **OS**: macOS, Linux, or Windows
- **Memory**: 4GB RAM minimum
- **Disk Space**: 2GB free space

## Environment Setup

### 1. Database Setup

**Using Infrastructure Scripts (Recommended)**:

```bash
# Initial setup (creates .env file)
./infrastructure/scripts/setup.sh

# Edit configuration (set secure passwords)
nano infrastructure/docker/.env

# Start MySQL database
./infrastructure/scripts/start.sh

# Verify database is running
cd infrastructure/docker && docker-compose ps
```

**Manual Docker Setup (Alternative)**:

```bash
# Start MySQL (if not using infrastructure scripts)
docker run -d \
  --name cashlog-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cashlog \
  -e MYSQL_USER=cashlog \
  -e MYSQL_PASSWORD=cashlog \
  -p 3306:3306 \
  mysql:8.0
```

**Verify Database Connection**:

```bash
# Connect to MySQL
mysql -h localhost -P 3306 -u cashlog -p
# Enter password from infrastructure/docker/.env

# Or check with Docker
docker exec -it cashlog-mysql mysql -u cashlog -p
```

### 2. Backend Configuration

Backend uses `application.yml` with environment variable support.

**Default Configuration** (already exists in `src/main/resources/application.yml`):
- Database credentials use environment variables: `DB_USER` and `DB_PASSWORD`
- Default values: `cashlog` / `<your-secure-password>`
- Flyway migrations enabled
- Actuator endpoints available at `/actuator`

**Set Environment Variables** (required before running):

```bash
# Export environment variables (must match infrastructure/docker/.env)
export DB_USER=cashlog
export DB_PASSWORD=<your-secure-password>

# Then run backend
cd apps/backend
./mvnw spring-boot:run
```

**Alternative: Pass as Maven Arguments**:
```bash
cd apps/backend
./mvnw spring-boot:run \
  -Dspring-boot.run.arguments="--spring.datasource.username=cashlog --spring.datasource.password=<your-secure-password>"
```

**For Development** (optional):
```bash
# Use application-dev.yml profile for verbose logging
export DB_USER=cashlog
export DB_PASSWORD=<your-secure-password>
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Verify Configuration**:
```bash
# Check database connection settings
cat apps/backend/src/main/resources/application.yml | grep -A 5 datasource

# Test database connection (use password from infrastructure/docker/.env)
mysql -h localhost -P 3306 -u cashlog -p
# Enter your password from infrastructure/docker/.env
```

### 3. Frontend Configuration
```bash
cd apps/frontend

# Create .env.local (if not exists)
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
```

## Build Steps

### Backend Build

```bash
cd apps/backend

# Install dependencies and build
./mvnw clean install

# Expected output:
# [INFO] BUILD SUCCESS
# [INFO] Total time: XX s
```

**Build Artifacts**:
- Location: `target/cashlog-backend-1.0.0.jar`
- Size: ~50MB

### Frontend Build

```bash
cd apps/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages
```

**Build Artifacts**:
- Location: `.next/` directory
- Static files: `.next/static/`

## Running the Application

### Start Backend
```bash
cd apps/backend
./mvnw spring-boot:run

# Or run the JAR directly
java -jar target/cashlog-backend-1.0.0.jar
```

**Expected**: Server starts on http://localhost:8080

### Start Frontend
```bash
cd apps/frontend

# Development mode
npm run dev

# Production mode
npm run build && npm start
```

**Expected**: Application available at http://localhost:3000

## Verify Build Success

### Backend Health Check
```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

### Frontend Health Check
```bash
curl http://localhost:3000
# Expected: HTML response with status 200
```

## Troubleshooting

### Backend Build Fails

**Issue**: Maven dependency resolution errors
```bash
# Clear Maven cache
rm -rf ~/.m2/repository
./mvnw clean install
```

**Issue**: Database connection errors
- Verify MySQL is running: `cd infrastructure/docker && docker-compose ps`
- Check connection: `mysql -h localhost -P 3306 -u cashlog -p`
- Ensure credentials match `infrastructure/docker/.env`
- Verify database 'cashlog' exists

### Frontend Build Fails

**Issue**: Node modules errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: TypeScript compilation errors
```bash
# Check TypeScript version
npm list typescript

# Rebuild
npm run build
```

### Port Already in Use

**Backend (8080)**:
```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9
```

**Frontend (3000)**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

## Build Performance

### Backend
- **Clean build**: ~30-60 seconds
- **Incremental build**: ~10-20 seconds

### Frontend
- **Clean build**: ~60-120 seconds
- **Incremental build**: ~5-10 seconds

## Next Steps

After successful build, proceed to:
1. Unit Test Execution
2. Integration Test Execution
3. End-to-End Testing
