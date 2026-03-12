# 🔄 Sistema de Backups Gratuito

Este documento explica cómo funciona el sistema de backups automáticos de la base de datos PostgreSQL.

---

## 📊 Opciones de Backup Disponibles

### 1. **GitHub Actions (AUTOMÁTICO - RECOMENDADO)** 🤖

✅ **Completamente GRATUITO**
- 2000 minutos/mes incluidos en plan gratuito de GitHub
- Backups automáticos diarios
- Almacenamiento por 30 días
- Sin costo adicional

### 2. **Scripts Manuales (BAJO DEMANDA)** 💻

✅ **Completamente GRATUITO**
- Ejecutar cuando necesites
- Control total
- Backups locales

---

## 🤖 Configuración de Backups Automáticos (GitHub Actions)

### ⚙️ Implementación Técnica

El sistema usa **Docker con PostgreSQL 17** para garantizar compatibilidad:

```yaml
container:
  image: postgres:17  # Misma versión que Railway (17.7)
```

**Ventajas de usar Docker:**
- ✅ Versión exacta garantizada (PostgreSQL 17)
- ✅ No depende de paquetes del sistema
- ✅ Más rápido (imagen preconstruida)
- ✅ Mismo comportamiento en todas las ejecuciones

### Paso 1: Agregar Secret en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **"New repository secret"**
4. Agrega el secret:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:NQqoanfNSuEfYHochOuAYXXVHAIivIJY@switchyard.proxy.rlwy.net:21454/railway`
5. Click en **"Add secret"**

### Paso 2: Habilitar GitHub Actions

El archivo `.github/workflows/database-backup.yml` ya está configurado. GitHub Actions se activará automáticamente al hacer push.

### Paso 3: Verificar que Funciona

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **"Actions"**
3. Verás el workflow **"Database Backup"**
4. Puedes ejecutarlo manualmente con **"Run workflow"**

---

## 📅 Programación de Backups Automáticos

### Frecuencia Actual

```yaml
schedule:
  - cron: '0 3 * * *'  # Diariamente a las 3:00 AM UTC
```

**Hora local Colombia**: 10:00 PM (22:00)

### Cambiar la Frecuencia

Edita `.github/workflows/database-backup.yml` y modifica el cron:

```yaml
# Ejemplos de frecuencias:
- cron: '0 */6 * * *'    # Cada 6 horas
- cron: '0 0 * * 0'      # Una vez por semana (domingos)
- cron: '0 2 * * 1-5'    # Lunes a Viernes a las 2:00 AM UTC
- cron: '0 0 1 * *'      # Primer día de cada mes
```

---

## 💾 Almacenamiento de Backups

### GitHub Artifacts (30 días gratis)

Los backups se almacenan automáticamente como "artifacts" en GitHub:

1. Ve a **Actions** en tu repositorio
2. Click en cualquier ejecución del workflow "Database Backup"
3. En la sección **"Artifacts"**, descarga el backup
4. Los artifacts se conservan por **30 días** (configurable hasta 90 días)

### Repositorio Git (Opcional)

También puedes commitear los backups al repositorio (comentado por defecto):

**Ventajas**:
- Histórico completo en Git
- Versionado automático

**Desventajas**:
- Aumenta el tamaño del repositorio
- Los archivos .sql.gz pueden ser grandes

Para habilitar, descomenta la última sección del workflow.

---

## 💻 Backups Manuales

### Hacer un Backup Manual

```bash
cd backend

# Exportar la URL de la base de datos
export DATABASE_URL="postgresql://postgres:NQqoanfNSuEfYHochOuAYXXVHAIivIJY@switchyard.proxy.rlwy.net:21454/railway"

# Ejecutar script de backup
./scripts/backup-database.sh
```

**Resultado**:
```
✅ Backup completado exitosamente!
   Archivo: backups/backup_20260312_153045.sql.gz
   Tamaño: 15K
```

### Listar Backups Existentes

```bash
ls -lh backend/backups/
```

---

## ♻️ Restaurar un Backup

### Restaurar desde Backup Local

```bash
cd backend

# Exportar la URL de la base de datos
export DATABASE_URL="postgresql://postgres:NQqoanfNSuEfYHochOuAYXXVHAIivIJY@switchyard.proxy.rlwy.net:21454/railway"

# Listar backups disponibles
ls -lh backups/

# Restaurar un backup específico
./scripts/restore-database.sh backups/backup_20260312_153045.sql.gz
```

⚠️ **ADVERTENCIA**: Esto sobrescribirá la base de datos actual. El script pedirá confirmación.

### Restaurar desde GitHub Artifacts

1. Ve a **Actions** → Ejecución del backup
2. Descarga el artifact (archivo .sql.gz)
3. Descomprime: `gunzip backup_*.sql.gz`
4. Restaura: `psql $DATABASE_URL < backup_*.sql`

---

## 🗂️ Gestión de Backups

### Retención de Backups

**Locales**: Se mantienen los últimos **7 backups** automáticamente.

**GitHub Artifacts**: Se conservan por **30 días** (2.5 GB de almacenamiento gratis).

### Limpiar Backups Antiguos Manualmente

```bash
# Eliminar backups de más de 30 días
find backend/backups/ -name "*.sql.gz" -mtime +30 -delete

# Mantener solo los últimos 10 backups
cd backend/backups
ls -t backup_*.sql.gz | tail -n +11 | xargs rm
```

---

## 🔍 Monitoreo de Backups

### Verificar Último Backup

En GitHub Actions:
1. Ve a **Actions** → **Database Backup**
2. Verifica que la última ejecución sea **✅ Success**
3. Revisa el timestamp en los artifacts

### Notificaciones de Fallo

Si un backup falla, GitHub te enviará un email automáticamente.

---

## 📈 Mejores Prácticas

### 1. **Verificar Backups Regularmente**

Haz una restauración de prueba mensualmente:

```bash
# En base de datos de desarrollo/local
export DATABASE_URL="postgresql://localhost:5432/test_restore"
./scripts/restore-database.sh backups/backup_latest.sql.gz
```

### 2. **Múltiples Ubicaciones**

Considera descargar backups importantes manualmente y guardarlos en:
- Disco externo
- Google Drive / Dropbox
- Otro servidor

### 3. **Antes de Cambios Importantes**

Siempre haz un backup manual antes de:
- Migraciones de base de datos
- Actualizaciones mayores
- Cambios en el schema

```bash
# Backup antes de migración
./scripts/backup-database.sh
npx prisma migrate deploy
```

---

## 🆘 Recuperación de Desastres

### Escenario 1: Base de Datos Corrompida

```bash
# 1. Obtener último backup
cd backend
ls -lh backups/ | head -n 2

# 2. Restaurar
export DATABASE_URL="tu-url-de-railway"
./scripts/restore-database.sh backups/backup_LATEST.sql.gz
```

### Escenario 2: Pérdida Total de Datos

1. Crear nueva base de datos en Railway
2. Descargar último backup de GitHub Artifacts
3. Restaurar con el script
4. Actualizar `DATABASE_URL` en Railway
5. Redeploy del backend

---

## 💰 Costos (TODOS GRATIS)

| Servicio | Costo | Límite |
|----------|-------|--------|
| GitHub Actions | **GRATIS** | 2000 min/mes |
| GitHub Artifacts | **GRATIS** | 2.5 GB storage |
| Scripts locales | **GRATIS** | Ilimitado |

**Total**: $0.00 USD/mes 💚

---

## 🔧 Troubleshooting

### Error: "pg_dump: command not found"

**Solución en Mac**:
```bash
brew install postgresql
```

**Solución en Linux/Ubuntu**:
```bash
sudo apt-get install postgresql-client
```

### Error: "Permission denied"

```bash
chmod +x backend/scripts/backup-database.sh
chmod +x backend/scripts/restore-database.sh
```

### Backup muy grande

Si el backup comprimido es >100MB:
1. Usa `.gitignore` para excluir de Git
2. Solo usa GitHub Artifacts
3. Considera backups incrementales (avanzado)

---

## 📞 Soporte

Si tienes problemas con los backups:
1. Revisa los logs en GitHub Actions
2. Verifica que `DATABASE_URL` esté configurada
3. Ejecuta el script de backup manualmente para debug

---

**Creado**: 2026-03-12
**Última actualización**: 2026-03-12
**Autor**: Sistema de Deployment Automatizado
