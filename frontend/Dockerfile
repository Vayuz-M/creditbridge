# ==========================================
# CreditBridge Frontend Production Dockerfile
# Multi-stage: Node.js Builder -> Nginx Alpine
# ==========================================

FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# Build production bundle
RUN npm run build

# ==========================================
# Production Web Server (Nginx)
# ==========================================
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
