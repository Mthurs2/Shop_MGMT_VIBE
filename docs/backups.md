# Backups

## PostgreSQL
Use `infra/scripts/backup_db.sh` via cron:

```bash
0 2 * * * BACKUP_DIR=/var/backups/postgres DATABASE_URL=postgresql://shop_app:password@postgres:5432/shop_mgmt /opt/shop/infra/scripts/backup_db.sh
```

Restore example:
```bash
DATABASE_URL=postgresql://shop_app:password@postgres:5432/shop_mgmt /opt/shop/infra/scripts/restore_db.sh /var/backups/postgres/backup-2024-01-01.sql.gz
```

## MinIO
Use `infra/scripts/backup_minio.sh` with `mc` installed:

```bash
mc alias set local http://localhost:9000 <access> <secret>
BACKUP_DIR=/var/backups/minio /opt/shop/infra/scripts/backup_minio.sh
```
