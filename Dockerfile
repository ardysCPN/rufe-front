# Stage 1 - Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Stage 2 - Run SSR server
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist/rufe-app ./dist

EXPOSE 4000

CMD ["node", "dist/rufe-app/server/server.mjs"]
