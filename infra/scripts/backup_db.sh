#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=${BACKUP_DIR:-/backups/postgres}
RETENTION_DAYS=${RETENTION_DAYS:-7}

mkdir -p "$BACKUP_DIR"

FILE="$BACKUP_DIR/backup-$(date +%F).sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$FILE"

find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -name '*.gz' -delete

echo "Backup saved to $FILE"
