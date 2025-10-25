# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy workspace files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/admin/package.json ./apps/admin/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy admin source code
COPY apps/admin/src ./apps/admin/src/
COPY apps/admin/index.html ./apps/admin/
COPY apps/admin/vite.config.ts ./apps/admin/
COPY apps/admin/tsconfig*.json ./apps/admin/

# Build the application
WORKDIR /app/apps/admin
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY apps/admin/nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
