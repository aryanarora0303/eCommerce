# Docker Development Guide

This guide provides instructions for running the eCommerce API using Docker for development and practice.

## Prerequisites

-   Docker Engine 20.10+
-   Docker Compose 2.0+
-   Git (for cloning the repository)

## Quick Start with Docker

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd eCommerce
```

### 2. Run with Docker Compose

```bash
# Development mode with hot reload
docker-compose up --build

# Run in detached mode
docker-compose up --build -d
```

### 3. Seed the Database

```bash
docker-compose exec ecommerce-api ./scripts/seed-database.sh
```

### 4. Access the Application

-   API: http://localhost:3151
-   Health Check: http://localhost:3151/health
-   API Documentation: http://localhost:3151/api

## Docker Configuration Files

### Dockerfile

Development-focused configuration:

-   Uses Node.js 20 Alpine for small image size
-   Includes all dev dependencies for hot reload
-   Non-root user for security
-   Built-in health checks
-   Supports live code changes

### docker-compose.yml

Development environment:

-   Volume mounting for live reload
-   Development dependencies included
-   Database persistence
-   Health monitoring

## Available Docker Commands

### Using NPM Scripts (Recommended)

```bash
# Build and run
npm run docker:build          # Build image
npm run docker:up            # Start with compose
npm run docker:run           # Run standalone container

# Management
npm run docker:down          # Stop all services
npm run docker:logs          # View logs
npm run docker:clean         # Clean up resources

# Database and testing
npm run docker:seed          # Seed database
npm run docker:test          # Run tests in container
npm run docker:postman	     # Create Postman collection from OpenAPI spec
```

### Direct Docker Commands

```bash
# Build
docker build -t ecommerce-api .

# Run
docker run -p 3151:3151 -v $(pwd)/ecommerce.db:/app/ecommerce.db ecommerce-api

# Compose
docker-compose up --build -d

# Management
docker-compose logs -f ecommerce-api
docker-compose exec ecommerce-api /bin/sh
docker-compose down --rmi all --volumes
```

## Environment Configuration

### Development Environment Variables

Create a `.env` file in the project root if needed:

```env
NODE_ENV=development
PORT=3151
JWT_SECRET=your-jwt-secret-here
DATABASE_PATH=./ecommerce.db
```

Use with docker-compose:

```bash
docker-compose --env-file .env up
```

## Database Management

### SQLite Database Persistence

The SQLite database is mounted as a volume to ensure data persistence across container restarts:

```yaml
volumes:
    - ./ecommerce.db:/app/ecommerce.db
```

### Database Operations in Docker

```bash
# Seed database with test data
docker-compose exec ecommerce-api ./scripts/seed-database.sh

# Access database file
docker-compose exec ecommerce-api ls -la ecommerce.db

# Backup database
docker cp $(docker-compose ps -q ecommerce-api):/app/ecommerce.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db $(docker-compose ps -q ecommerce-api):/app/ecommerce.db
```

## Development Workflow

### Hot Reload Development

1. Start the development container:

    ```bash
    docker-compose up --build
    ```

2. Edit code in your local editor - changes will be reflected immediately

3. View logs in real-time:
    ```bash
    docker-compose logs -f ecommerce-api
    ```

### Testing in Docker

```bash
# Run all tests
npm run docker:test

# Run specific test suites
docker-compose exec ecommerce-api npm run test:unit
docker-compose exec ecommerce-api npm run test:integration
docker-compose exec ecommerce-api npm run test:coverage
```

### Debugging

1. Start the container:

    ```bash
    docker-compose up --build
    ```

2. Access container shell for debugging:
    ```bash
    docker-compose exec ecommerce-api /bin/sh
    ```

## Monitoring and Health Checks

### Built-in Health Check

The application includes a health check endpoint at `/health`:

```bash
# Check health from outside container
curl http://localhost:3151/health

# Check health from inside container
docker-compose exec ecommerce-api wget -qO- http://localhost:3151/health
```

### Container Health Status

```bash
# View health status
docker-compose ps

# Detailed health information
docker inspect <container-id> | jq '.[0].State.Health'
```

### Logs and Monitoring

```bash
# Follow logs
docker-compose logs -f ecommerce-api

# View specific log entries
docker-compose logs --tail=50 ecommerce-api

# Export logs
docker-compose logs ecommerce-api > app-logs.txt
```

## Troubleshooting

### Common Issues

1. **Port already in use**:

    ```bash
    # Find and kill process using port 3151
    lsof -ti:3151 | xargs kill -9
    ```

2. **Database permission issues**:

    ```bash
    # Fix file permissions
    chmod 664 ecommerce.db
    ```

3. **Container won't start**:

    ```bash
    # Check container logs
    docker-compose logs ecommerce-api

    # Rebuild without cache
    docker-compose build --no-cache
    ```

4. **Volume mounting issues**:
    ```bash
    # Ensure proper file paths and permissions
    ls -la $(pwd)/ecommerce.db
    ```

### Performance Tips

1. **Use .dockerignore**: Already configured to exclude unnecessary files
2. **Volume mounting**: Configured for optimal development experience
3. **Health checks**: Built-in monitoring for container status

## Resource Requirements

### Minimum Requirements (for practice/development)

-   CPU: 1 core
-   RAM: 512MB
-   Disk: 1GB free space

### Recommended Requirements

-   CPU: 2 cores
-   RAM: 1GB
-   Disk: 2GB free space

## Support

For Docker-related issues:

1. Check the troubleshooting section above
2. Review Docker and Docker Compose logs
3. Ensure Docker daemon is running
4. Verify system requirements are met

For application-specific issues, refer to the main README.md file.
