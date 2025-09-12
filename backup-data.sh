#!/bin/bash

echo "💾 Starting TutorsPool Data Backup..."

# Configuration
BACKUP_DIR="/backups/tutorspool"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/path/to/tutorspool"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup JSON data files
if [ -f "$PROJECT_DIR/server/data.json" ]; then
    cp "$PROJECT_DIR/server/data.json" "$BACKUP_DIR/data_$DATE.json"
    echo "✅ Backup completed: data_$DATE.json"
    
    # Compress the backup
    gzip "$BACKUP_DIR/data_$DATE.json"
    echo "✅ Backup compressed: data_$DATE.json.gz"
    
    # Keep only last 30 days of backups
    find $BACKUP_DIR -name "data_*.json.gz" -mtime +30 -delete
    echo "✅ Old backups cleaned up (keeping last 30 days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/data_$DATE.json.gz" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
    
    # List all backups
    echo "📋 Available backups:"
    ls -lah $BACKUP_DIR/data_*.json.gz 2>/dev/null || echo "No backups found"
    
else
    echo "❌ Error: data.json file not found at $PROJECT_DIR/server/data.json"
    exit 1
fi

echo "🎉 Backup process completed successfully!"
