# Cash Log Infrastructure

This directory contains Docker-based infrastructure setup for the Cash Log application.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Initial Setup

```bash
./infrastructure/scripts/setup.sh
```

This will:
- Check for Docker and Docker Compose installation
- Create `.env` file from template

### 2. Configure Environment

Edit `infrastructure/docker/.env` and set secure passwords:

```bash
# Example
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_USER=cashlog
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=cashlog
```

### 3. Start Services

```bash
./infrastructure/scripts/start.sh
```

This will start the MySQL database container.

### 4. Verify

Check that services are running:

```bash
cd infrastructure/docker
docker-compose ps
```

You should see the `cashlog-mysql` container with status "Up" and "healthy".

## Available Scripts

### `setup.sh`
Initial setup - creates `.env` file and verifies Docker installation.

```bash
./infrastructure/scripts/setup.sh
```

### `start.sh`
Start all infrastructure services.

```bash
./infrastructure/scripts/start.sh
```

### `stop.sh`
Stop all infrastructure services (data is preserved).

```bash
./infrastructure/scripts/stop.sh
```

### `clean.sh`
Stop services and remove all data (⚠️ destructive operation).

```bash
./infrastructure/scripts/clean.sh
```

## Connecting to MySQL

### From Host Machine

```bash
mysql -h localhost -P 3306 -u cashlog -p
# Enter password from .env file
```

### From Backend Application

Use these connection details in your backend configuration:

- **Host**: `localhost`
- **Port**: `3306`
- **Database**: `cashlog`
- **User**: `cashlog`
- **Password**: From `.env` file

Example Spring Boot `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/cashlog
    username: cashlog
    password: ${MYSQL_PASSWORD}
```

## Directory Structure

```
infrastructure/
├── docker/
│   ├── docker-compose.yml       # Docker Compose configuration
│   ├── .env.example             # Environment variables template
│   ├── .env                     # Actual environment variables (not in git)
│   └── mysql/
│       └── init.sql             # Database initialization script
├── scripts/
│   ├── setup.sh                 # Initial setup
│   ├── start.sh                 # Start services
│   ├── stop.sh                  # Stop services
│   └── clean.sh                 # Clean up (remove data)
└── README.md                    # This file
```

## Data Persistence

Database data is stored in a Docker volume named `mysql-data`. This volume persists even when containers are stopped or removed (unless you run `clean.sh`).

### Backup Database

```bash
docker exec cashlog-mysql mysqldump -u cashlog -p cashlog > backup.sql
```

### Restore Database

```bash
docker exec -i cashlog-mysql mysql -u cashlog -p cashlog < backup.sql
```

## Troubleshooting

### Port 3306 Already in Use

If you have another MySQL instance running:

1. Stop the other MySQL instance, or
2. Change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "3307:3306"  # Use port 3307 on host
   ```

### Container Won't Start

Check the logs:

```bash
cd infrastructure/docker
docker-compose logs mysql
```

Common issues:
- Invalid credentials in `.env`
- Insufficient disk space
- Port conflict

### Cannot Connect from Backend

Ensure:
1. Both containers are on the same Docker network
2. Use service name `mysql` as host (not `localhost`)
3. Backend container is started with `--network cashlog-network`

### Data Lost After Restart

If data disappears:
1. Check that the volume is properly mounted
2. Verify with: `docker volume ls | grep mysql-data`
3. Don't use `docker-compose down -v` unless you want to delete data

## Health Checks

The MySQL container includes a health check that runs every 10 seconds:

```bash
# Check health status
docker inspect cashlog-mysql | grep -A 10 Health
```

Status will be:
- `starting`: Container is starting up
- `healthy`: MySQL is ready to accept connections
- `unhealthy`: MySQL is not responding

## Maintenance

### View Logs

```bash
cd infrastructure/docker
docker-compose logs -f mysql
```

### Restart Services

```bash
./infrastructure/scripts/stop.sh
./infrastructure/scripts/start.sh
```

### Update MySQL Version

1. Edit `docker-compose.yml` and change the image version
2. Stop services: `./infrastructure/scripts/stop.sh`
3. Pull new image: `cd infrastructure/docker && docker-compose pull`
4. Start services: `./infrastructure/scripts/start.sh`

## Security Notes

⚠️ **This setup is for local development only**

For production:
- Use managed database services (e.g., AWS RDS, Google Cloud SQL)
- Enable SSL/TLS connections
- Use strong passwords and rotate them regularly
- Implement automated backups
- Set up monitoring and alerting
- Use network security groups and firewalls

## Support

For issues or questions:
1. Check the logs: `docker-compose logs mysql`
2. Verify Docker is running: `docker ps`
3. Check disk space: `df -h`
4. Review this README for common solutions
