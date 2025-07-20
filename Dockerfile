# Development Docker configuration
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install Python and build dependencies for native modules, plus bash for scripts
RUN apk add --no-cache python3 make g++ wget bash curl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci && npm cache clean --force

# Copy the rest of the application
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose the port
EXPOSE 3151

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3151/health || exit 1

# Start in development mode with hot reload
CMD ["npm", "run", "start:dev"]
