# Stage 1 - Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Stage 2 - Run SSR
FROM node:20-alpine
WORKDIR /app

# 👇 Copiar TODA la carpeta dist completa
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

RUN npm install --omit=dev

EXPOSE 4000

CMD ["node", "dist/rufe-app/server/server.mjs"]
