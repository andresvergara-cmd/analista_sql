#!/bin/bash

# Script de Restauración de Base de Datos PostgreSQL
# Uso: ./scripts/restore-database.sh backups/backup_20260312_123456.sql.gz

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}♻️  Restauración de Base de Datos${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

# Verificar que se proporcionó el archivo de backup
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes especificar el archivo de backup${NC}"
    echo ""
    echo "Uso: $0 <archivo-backup>"
    echo ""
    echo "Backups disponibles:"
    ls -lh backups/*.sql.gz 2>/dev/null || echo "  (ninguno)"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: El archivo $BACKUP_FILE no existe${NC}"
    exit 1
fi

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no está configurada${NC}"
    echo "Ejecuta: export DATABASE_URL='tu-url-de-railway'"
    exit 1
fi

echo -e "${YELLOW}⚠️  ADVERTENCIA: Esta operación sobrescribirá la base de datos actual${NC}"
echo ""
echo -e "Archivo a restaurar: ${BLUE}$BACKUP_FILE${NC}"
echo -e "Base de datos: ${BLUE}$(echo $DATABASE_URL | sed 's/postgresql:\/\/.*@/postgresql:\/\/***@/')${NC}"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'si' para confirmar): " confirm

if [ "$confirm" != "si" ]; then
    echo -e "${YELLOW}❌ Restauración cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔄 Descomprimiendo backup...${NC}"

# Crear archivo temporal
TEMP_FILE=$(mktemp)
gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"

echo -e "${BLUE}🔄 Restaurando base de datos...${NC}"
psql "$DATABASE_URL" < "$TEMP_FILE"

# Limpiar archivo temporal
rm "$TEMP_FILE"

echo ""
echo -e "${GREEN}✅ Base de datos restaurada exitosamente!${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Restauración completada${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
