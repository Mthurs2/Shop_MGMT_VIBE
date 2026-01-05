# Security

- All tenant-scoped tables use PostgreSQL RLS with `app.tenant_id`.
- Sessions stored server-side with hashed tokens.
- CSRF protection via double-submit cookie.
- Rate limiting via NestJS Throttler.
- Audit log hashing with chained hashes per tenant.

## Secrets
- `SESSION_SECRET` for cookie signing.
- `ENCRYPTION_SECRET` for integration credential encryption.

## Data access
Admin-level operations must log to `AuditLog` with action, actor, and hash chaining.
