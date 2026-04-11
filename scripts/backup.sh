#!/bin/bash

FILENAME=$1
DESTINATION=$2
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Starting backup..."

# compress
tar -czf "$BACKUP_DIR/${FILENAME}_${DATE}.tar.gz" "$DESTINATION"

# encrypt using ENV key
openssl enc -aes-256-cbc -salt \
-in "$BACKUP_DIR/${FILENAME}_${DATE}.tar.gz" \
-out "$BACKUP_DIR/${FILENAME}_${DATE}.enc" \
-k "$ENCRYPTION_KEY"

# remove tar
rm "$BACKUP_DIR/${FILENAME}_${DATE}.tar.gz"

# permission
chmod 600 "$BACKUP_DIR/${FILENAME}_${DATE}.enc"

echo "Backup done"