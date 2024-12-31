FROM node:20-alpine AS base

RUN apk add --no-cache openssl

WORKDIR /app    

COPY package.json package-lock.json ./
COPY turbo.json ./
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY apps/http-backend/package.json ./apps/http-backend/package.json
COPY apps/upload-worker/package.json ./apps/upload-worker/package.json
COPY apps/wsServer/package.json ./apps/wsServer/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install dependencies
RUN npm install

COPY apps/wsServer ./apps/wsServer
COPY packages/db ./packages/db

RUN npm run db:generate

RUN cd apps/wsServer && npm run build && cd ../..


EXPOSE 8081

CMD ["npm", "run", "start-wsServer"]