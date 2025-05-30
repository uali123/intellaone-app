# Build stage
FROM node:20.18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend and backend
RUN npm run build

# Production stage
FROM node:20.18-alpine as production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Copy any other necessary files
COPY drizzle.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port 5050
EXPOSE 5050

# Set environment
ENV NODE_ENV=production
ENV PORT=5050

# Start the application
CMD ["npm", "start"]