FROM node:22-alpine AS builder

WORKDIR /app

ENV HUSKY=0

COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN npm ci

COPY . .

RUN npx prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build --workspace=backend

FROM builder AS prod-deps

ENV NODE_ENV=production

RUN npm prune --omit=dev --workspace=backend

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --from=prod-deps --chown=nestjs:nodejs /app/package*.json ./
COPY --from=prod-deps --chown=nestjs:nodejs /app/frontend/package*.json ./frontend/
COPY --from=prod-deps --chown=nestjs:nodejs /app/backend/package*.json ./backend/
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma.config.ts ./backend/prisma.config.ts

USER nestjs

EXPOSE 3000

CMD ["node", "backend/dist/src/main.js"]
