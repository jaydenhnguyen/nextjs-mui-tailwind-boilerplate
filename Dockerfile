# Production image for hosting outside Vercel. Build it with your public settings, since Next.js bakes
# NEXT_PUBLIC_* values into the JavaScript at build time:
#   docker build -t my-app --build-arg NEXT_PUBLIC_SITE_URL=https://example.com --build-arg NEXT_PUBLIC_API_URL=https://api.example.com .
#   docker run -p 3000:3000 my-app

FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN HUSKY=0 npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_APP_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ACCESS_TOKEN_TTL
ARG NEXT_PUBLIC_REFRESH_TOKEN_TTL
RUN NEXT_OUTPUT=standalone npm run build

# Only the self-contained server Next.js traced, not node_modules, so the image stays small.
FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
