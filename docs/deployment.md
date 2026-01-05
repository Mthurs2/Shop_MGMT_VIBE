# Deployment

## Architecture
- PostgreSQL 16 with RLS enforced per tenant
- NestJS API with session cookies, CSRF, and rate limiting
- Next.js web frontend
- Redis + BullMQ worker
- MinIO for S3-compatible storage
- Caddy for HTTPS

## Production hardening
- Firewall: allow ports 22, 80, 443 only
- Ensure `SESSION_SECRET` and `ENCRYPTION_SECRET` are 64+ chars
- Rotate database credentials regularly
- Enable automatic OS security updates

## Database roles
- Use `shop_app` for runtime
- Use a separate migration role to run migrations

## Updates
1. Pull latest code
2. Rebuild containers
3. Run migrations
4. Restart services

```bash
docker compose -f infra/docker-compose.prod.yml pull
docker compose -f infra/docker-compose.prod.yml up -d --build
docker compose -f infra/docker-compose.prod.yml exec api npx prisma migrate deploy
```
