# syntax=docker/dockerfile:1
# Containerizes the *web* build of the Expo app. Native iOS/Android binaries
# are built with Expo's build service (EAS), not Docker. See the README.

# ---- 1. Export the web bundle ------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app
ENV CI=1 EXPO_NO_TELEMETRY=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx tsc --noEmit && npx expo export --platform web

# ---- 2. Serve it with nginx -------------------------------------------------
FROM nginx:1.27-alpine
COPY --from=docker nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
