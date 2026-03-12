# Guía de Deployment en Producción

Esta guía detalla los pasos para desplegar la aplicación en producción utilizando Railway para el backend y Vercel para el frontend.

## Arquitectura de Deployment

- **Backend**: Railway (Node.js + PostgreSQL)
- **Frontend**: Vercel (Next.js)
- **Base de Datos**: PostgreSQL en Railway

## 1. Deployment del Backend en Railway

### 1.1 Configuración Inicial

1. Crear cuenta en [Railway](https://railway.app)
2. Crear un nuevo proyecto
3. Agregar servicio PostgreSQL al proyecto
4. Agregar servicio Node.js desde el repositorio GitHub

### 1.2 Variables de Entorno Requeridas

Configurar las siguientes variables de entorno en Railway:

```bash
# Base de datos (generada automáticamente por Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Configuration
JWT_SECRET=universidad-icesi-madurez-digital-secret-key-2026-super-secure-random-string
JWT_EXPIRATION=7d

# Frontend URL (se configurará después del deployment de Vercel)
FRONTEND_URL=https://tu-app.vercel.app

# Puerto (Railway lo asigna automáticamente)
PORT=${{PORT}}
```

### 1.3 Configuración del Build

Railway detectará automáticamente el proyecto Node.js y usará la configuración en `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 1.4 Migraciones de Base de Datos

Railway ejecutará automáticamente:
1. `npm run build` → compila TypeScript y genera Prisma Client
2. `npm run start:migrate` → ejecuta migraciones Prisma y arranca el servidor

**Nota**: El build permite errores TypeScript (`|| true` en build script) para permitir deployment mientras se corrigen tipos.

### 1.5 Verificación

Una vez deployado, Railway proporcionará una URL pública. Verificar:

```bash
curl https://tu-backend.railway.app/api/health
# Debe retornar: {"status":"ok"}
```

## 2. Deployment del Frontend en Vercel

### 2.1 Configuración Inicial

1. Crear cuenta en [Vercel](https://vercel.com)
2. Importar el repositorio desde GitHub
3. Configurar el proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.2 Variables de Entorno en Vercel

Configurar en el dashboard de Vercel (Settings → Environment Variables):

```bash
# URL del backend en Railway
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
```

**Importante**: Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente.

### 2.3 Actualizar Backend con URL de Vercel

Una vez deployado el frontend, actualizar la variable `FRONTEND_URL` en Railway con la URL de Vercel.

### 2.4 Verificación

Visitar la URL de Vercel y verificar:
- Login funciona correctamente
- Los endpoints del backend responden
- No hay errores de CORS en la consola del navegador

## 3. Configuración de CORS

El backend está configurado para aceptar requests desde:
- `http://localhost:3000` (desarrollo frontend)
- `http://localhost:3001` (desarrollo backend)
- URL configurada en `FRONTEND_URL` (producción)

Ver configuración en `backend/src/index.ts:22-40`

## 4. Scripts de Deployment

### Backend

```bash
# Build local
cd backend
npm run build

# Migraciones Prisma
npx prisma migrate deploy

# Start production
npm run start
```

### Frontend

```bash
# Build local
cd frontend
npm run build

# Start production
npm run start
```

## 5. Monitoreo y Logs

### Railway
- Dashboard → Service → Logs
- Métricas de CPU, memoria, requests

### Vercel
- Dashboard → Project → Deployments
- Function logs
- Analytics

## 6. Troubleshooting Común

### Error P1012: Argument "url" is missing
**Causa**: `DATABASE_URL` no configurada en variables de entorno
**Solución**: Verificar que `DATABASE_URL` esté configurada en Railway

### Errores de CORS
**Causa**: `FRONTEND_URL` no coincide con la URL de Vercel
**Solución**: Actualizar `FRONTEND_URL` en Railway con la URL exacta de Vercel

### Build failures en TypeScript
**Causa**: Errores de tipo en el código
**Solución**: El build permite errores (`|| true`), pero deben corregirse gradualmente

### 401 Unauthorized en frontend
**Causa**: JWT no está siendo enviado o es inválido
**Solución**: Verificar que `JWT_SECRET` sea el mismo en desarrollo y producción

## 7. Checklist de Deployment

### Pre-deployment
- [ ] Todas las variables de entorno documentadas
- [ ] Migraciones Prisma funcionan localmente
- [ ] Build local exitoso (`npm run build`)
- [ ] Tests pasan (si existen)

### Deployment Backend (Railway)
- [ ] Servicio PostgreSQL creado
- [ ] Variables de entorno configuradas
- [ ] `DATABASE_URL` apunta a PostgreSQL de Railway
- [ ] Deployment exitoso
- [ ] Health check responde `/api/health`
- [ ] Migraciones aplicadas correctamente

### Deployment Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` apunta a Railway
- [ ] Build exitoso en Vercel
- [ ] App accesible en URL de Vercel
- [ ] Login funciona
- [ ] No hay errores de CORS

### Post-deployment
- [ ] `FRONTEND_URL` actualizada en Railway
- [ ] Probar flujos críticos end-to-end
- [ ] Verificar logs en ambas plataformas
- [ ] Documentar URLs de producción

## 8. URLs de Producción

Documentar aquí las URLs finales:

```bash
# Backend API
BACKEND_URL=https://_____.railway.app

# Frontend
FRONTEND_URL=https://_____.vercel.app

# Base de Datos
DATABASE_URL=postgresql://_____.railway.app:____/railway
```

## 9. Rollback

### Railway
1. Dashboard → Deployments
2. Seleccionar deployment anterior
3. Click en "Redeploy"

### Vercel
1. Dashboard → Deployments
2. Seleccionar deployment anterior
3. Click en "Promote to Production"

## 10. Contacto y Soporte

Para problemas de deployment:
- Revisar logs en Railway/Vercel
- Consultar documentación oficial
- Revisar issues en GitHub del repositorio
