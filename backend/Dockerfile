# Use Node.js 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including dev dependencies for build
RUN npm ci

# Generate Prisma Client manually since postinstall script might not run successfully during docker builds
RUN npx prisma generate

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies to reduce image size
RUN npm prune --omit=dev

# Expose port 3001
EXPOSE 3001

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Start the application with migrations
CMD ["npm", "run", "start:migrate:prod"]