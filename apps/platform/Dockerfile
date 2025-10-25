# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy workspace files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/platform/package.json ./apps/platform/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy platform source code
COPY apps/platform/src ./apps/platform/src/
COPY apps/platform/index.html ./apps/platform/
COPY apps/platform/vite.config.ts ./apps/platform/
COPY apps/platform/tsconfig*.json ./apps/platform/

# Build the application
WORKDIR /app/apps/platform
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY apps/platform/nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/apps/platform/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
