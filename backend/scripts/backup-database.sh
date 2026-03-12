#!/bin/bash

# Script de Backup de Base de Datos PostgreSQL
# Uso: ./scripts/backup-database.sh

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔄 Iniciando Backup de Base de Datos${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no está configurada${NC}"
    echo "Ejecuta: export DATABASE_URL='tu-url-de-railway'"
    exit 1
fi

# Crear directorio de backups si no existe
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Nombre del archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo -e "${BLUE}📁 Directorio de backups: $BACKUP_DIR${NC}"
echo -e "${BLUE}📄 Archivo: $BACKUP_FILE${NC}"
echo ""

# Ejecutar pg_dump
echo -e "${BLUE}🔄 Ejecutando pg_dump...${NC}"
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Comprimir el backup
echo -e "${BLUE}📦 Comprimiendo backup...${NC}"
gzip "$BACKUP_FILE"
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

# Obtener tamaño del archivo
SIZE=$(ls -lh "$BACKUP_FILE_GZ" | awk '{print $5}')

echo ""
echo -e "${GREEN}✅ Backup completado exitosamente!${NC}"
echo -e "${GREEN}   Archivo: $BACKUP_FILE_GZ${NC}"
echo -e "${GREEN}   Tamaño: $SIZE${NC}"
echo ""

# Listar backups existentes
echo -e "${BLUE}📋 Backups existentes:${NC}"
ls -lh $BACKUP_DIR/*.sql.gz 2>/dev/null || echo "  (ninguno)"
echo ""

# Limpiar backups antiguos (mantener últimos 7)
echo -e "${BLUE}🧹 Limpiando backups antiguos (manteniendo últimos 7)...${NC}"
ls -t $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm
echo -e "${GREEN}✅ Limpieza completada${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Proceso finalizado${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
