# Stage 1: Build the application
FROM oven/bun:1.3.14-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package.json bun.lock ./

# Install dependencies (including devDependencies for build and check commands)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Run build to generate production bundle
RUN bun run build

# Bundle the database migration script into dist/migrate.js
RUN bun build src/db/migrate.ts --target=bun --outfile=dist/migrate.js

# Stage 2: Production runtime
FROM oven/bun:1.3.14-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built application and required production files (NO node_modules needed!)
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Expose the application port
EXPOSE 3000

# Run database migrations (using bundled JS), then start the web server
CMD ["sh", "-c", "bun run dist/migrate.js && bun run .output/server/index.mjs"]
