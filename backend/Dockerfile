# Stage 1: Build
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
ENV DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=dummy"
RUN pnpm prisma:generate

# Build TypeScript
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy package files and prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install production dependencies AND prisma CLI (needed for generate)
RUN pnpm install --prod --frozen-lockfile && pnpm add -D prisma

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma Client in production (creates generated/ folder)
ENV DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=dummy"
RUN pnpm prisma:generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown nodejs:nodejs /app

USER nodejs

EXPOSE 5000

CMD ["node", "dist/server.js"]
