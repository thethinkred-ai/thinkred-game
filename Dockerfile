FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS server-builder
WORKDIR /app/server
RUN apk add --no-cache python3 make g++
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
COPY shared/ ../shared/
RUN npx tsc

FROM node:20-alpine
RUN apk add --no-cache nginx

WORKDIR /app

COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=server-builder /app/server/package.json ./server/
COPY --from=client-builder /app/client/dist ./client/dist

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD sh -c "nginx && node server/dist/index.js"
