FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for the whole workspace
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the backend application
RUN npm run build --workspace=backend

# Production image
FROM node:20-alpine

WORKDIR /app

# We only need the node_modules and the built backend
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

EXPOSE 3000

# Start the application via workspace command
CMD ["npm", "run", "start:prod", "--workspace=backend"]
