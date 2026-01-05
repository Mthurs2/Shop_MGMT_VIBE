#!/usr/bin/env bash
set -euo pipefail

MINIO_ALIAS=${MINIO_ALIAS:-local}
MINIO_URL=${MINIO_URL:-http://minio:9000}
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minio}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY:-minio123}
BUCKET=${BUCKET:-shop-files}
BACKUP_DIR=${BACKUP_DIR:-/backups/minio}

mkdir -p "$BACKUP_DIR"

mc alias set "$MINIO_ALIAS" "$MINIO_URL" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"
mc mirror --overwrite "$MINIO_ALIAS/$BUCKET" "$BACKUP_DIR/$BUCKET"

