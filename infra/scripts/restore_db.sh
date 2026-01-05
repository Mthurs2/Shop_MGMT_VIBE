#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE=${1:-}
if [[ -z "$BACKUP_FILE" ]]; then
  echo "Usage: restore_db.sh <backup-file.sql.gz>"
  exit 1
fi

gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"

echo "Restore complete"
