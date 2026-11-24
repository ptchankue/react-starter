# syntax=docker/dockerfile:1

# ---- 1. Build the static bundle --------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Type-checks, runs the tests, then builds into /app/dist.
RUN npm test -- --run && npm run build

# ---- 2. Serve it with nginx -------------------------------------------------
FROM nginx:1.27-alpine
COPY --from=docker nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
