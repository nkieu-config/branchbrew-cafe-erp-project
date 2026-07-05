# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS builder

WORKDIR /app

ENV HUSKY=0

COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/types/package.json ./packages/types/

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN npx prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build --workspace=backend

FROM node:22-alpine AS prod-deps

WORKDIR /app

ENV HUSKY=0
ENV NODE_ENV=production

COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/types/package.json ./packages/types/
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/prisma.config.ts

RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace=backend --include-workspace-root --omit=dev --ignore-scripts

FROM node:22-alpine AS migrate

WORKDIR /app

ENV HUSKY=0

COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/types/package.json ./packages/types/
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/prisma.config.ts

RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace=backend --include-workspace-root --ignore-scripts
RUN npx prisma generate --schema=backend/prisma/schema.prisma

CMD ["npm", "run", "migrate:deploy", "--workspace=backend"]

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0

RUN apk add --no-cache dumb-init \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --from=prod-deps --chown=nestjs:nodejs /app/package*.json ./
COPY --from=prod-deps --chown=nestjs:nodejs /app/backend/package.json ./backend/
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma.config.ts ./backend/prisma.config.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

USER nestjs

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/dist/src/main.js"]

FROM production AS development

ENV NODE_ENV=development
