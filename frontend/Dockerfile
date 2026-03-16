# Multi-stage build for Angular
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Nginx production image
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built Angular app
COPY --from=builder /app/dist/apqp-frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
