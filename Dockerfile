ARG BASE_IMAGE=node:20-alpine

FROM ${BASE_IMAGE} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1

# -------------------------------------------------------------- Installing dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# -------------------------------------------------------------- Building the app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV SKIP_ENV_VALIDATION=TRUE
RUN corepack enable pnpm && pnpm run build

# -------------------------------------------------------------- Running the app
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

CMD ["node", "server.js"]
