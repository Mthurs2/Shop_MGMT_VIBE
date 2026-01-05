FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/worker/package.json apps/worker/tsconfig.json ./apps/worker/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
RUN corepack enable && pnpm install
COPY apps/worker ./apps/worker
COPY packages/shared ./packages/shared
RUN pnpm --filter @shop/worker build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/worker/dist ./dist
COPY --from=builder /app/apps/worker/package.json ./package.json
COPY --from=builder /app/apps/worker/node_modules ./node_modules
CMD ["node", "dist/index.js"]
