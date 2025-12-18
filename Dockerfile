# Multi-stage build for React Frontend
# Stage 1: Build React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --production=false --silent

# Copy source code
COPY . .

# Build for production
ARG REACT_APP_API_PROTOCOL=https
ARG REACT_APP_API_HOST=apibeta.attech.com.vn
ARG REACT_APP_API_PORT=

ENV REACT_APP_API_PROTOCOL=${REACT_APP_API_PROTOCOL}
ENV REACT_APP_API_HOST=${REACT_APP_API_HOST}
ENV REACT_APP_API_PORT=${REACT_APP_API_PORT}
ENV GENERATE_SOURCEMAP=false

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=2 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
