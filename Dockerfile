FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite

COPY package*.json ./
RUN npm ci

# Copy prisma files for database setup
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Build the TypeScript app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/prisma/dev.db

# Run database migrations and start the application
CMD npx prisma migrate deploy && node -r tsconfig-paths/register dist/app.js 