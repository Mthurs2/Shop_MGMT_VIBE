# Shop Management SaaS

Production-ready multi-tenant auto shop management SaaS with strict PostgreSQL RLS and a monorepo architecture.

## Stack
- Next.js + TypeScript + Tailwind
- NestJS API + Prisma
- PostgreSQL 16 + RLS
- Redis + BullMQ
- MinIO (S3-compatible)

## Quick start (dev)
```bash
cp .env.example .env
pnpm install
pnpm dev
```

## Docs
- [First run](docs/FIRST_RUN.md)
- [Deployment](docs/deployment.md)
- [Security](docs/security.md)
- [Backups](docs/backups.md)
- [Integrations](docs/integrations.md)
- [Release checklist](docs/release-checklist.md)
