# ==============================================================================
# CDP Analytics Service Dockerfile
# ==============================================================================
# Multi-stage build for production deployment
# ==============================================================================

# -----------------------------------------------------------------------------
# Dev stage: local development with hot-reload
# -----------------------------------------------------------------------------
FROM node:20-alpine AS dev
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV PORT=3003

EXPOSE 3003

CMD ["npm", "run", "dev"]

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 cdp

# Copy built application
COPY --from=builder --chown=cdp:nodejs /app/.next/standalone ./
COPY --from=builder --chown=cdp:nodejs /app/.next/static ./.next/static

USER cdp

EXPOSE 3003

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
