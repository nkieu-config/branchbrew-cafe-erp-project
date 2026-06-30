FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for the whole workspace
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client and build the backend application
RUN npx prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build --workspace=backend

# Production image
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# We only need the node_modules and the built backend
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/backend/package*.json ./backend/
COPY --from=builder --chown=nestjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nestjs:nodejs /app/backend/prisma.config.ts ./backend/prisma.config.ts

RUN chown nestjs:nodejs /app

USER nestjs

EXPOSE 3000

# Start the application via workspace command
CMD ["npm", "run", "start:prod", "--workspace=backend"]
