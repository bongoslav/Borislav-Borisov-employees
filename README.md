# Employee Management Application

## Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. Build and start the container:

```bash
docker-compose up -d
```

2. Stop the container:

```bash
docker-compose down
```

### Development with Docker

1. Build the image:

```bash
docker build -t employee-app .
```

2. Run in development mode:

```bash
docker run -p 3000:3000 -v $(pwd)/prisma/dev.db:/app/prisma/dev.db employee-app
```

## Database

This application uses SQLite with Prisma ORM. The database file is located at `prisma/dev.db`.

## API Documentation

The API is accessible at `/api/v1` endpoint.
