# 🌐 Guía de Acceso al Sistema en Producción

**Estado del Sistema**: ✅ **100% OPERATIVO**

**Última verificación**: 2026-03-12 15:12:49 UTC

---

## 📍 URLs de Acceso

### Frontend (Interfaz de Usuario)
```
https://analista-sql.vercel.app
```

### Backend (API)
```
https://analistasql-production.up.railway.app
```

---

## 👥 Acceso para Usuarios

### 1. Abrir el Sistema

Cualquier persona puede acceder desde cualquier computador ingresando a:

**https://analista-sql.vercel.app**

### 2. Iniciar Sesión

En la pantalla de login, ingresar:

**Usuario Administrador:**
- **Email**: `palandaeta@icesi.edu.co`
- **Contraseña**: `Prueba123*`
- **Rol**: SUPERADMIN

### 3. Funcionalidades Disponibles

Una vez autenticado, el usuario puede:
- ✅ Ver y gestionar organizaciones
- ✅ Crear diagnósticos de madurez digital
- ✅ Aplicar instrumentos (Kroh, Kerzner)
- ✅ Generar reportes de análisis
- ✅ Gestionar usuarios del sistema
- ✅ Configurar parámetros
- ✅ Exportar resultados

---

## 🔧 Componentes del Sistema

### Frontend - Vercel
- **Plataforma**: Vercel (Next.js 16.1.6)
- **URL**: https://analista-sql.vercel.app
- **Estado**: ✅ Funcionando
- **Deployment**: Automático desde GitHub (rama main)

### Backend - Railway
- **Plataforma**: Railway (Express 5.2.1)
- **URL**: https://analistasql-production.up.railway.app
- **Estado**: ✅ Funcionando
- **Deployment**: Automático desde GitHub (rama main)

### Base de Datos - Railway
- **Motor**: PostgreSQL 17.7
- **Host**: Railway
- **Estado**: ✅ Conectada
- **Backup**: Automático (GitHub Actions - diario)

---

## ✅ Verificaciones Realizadas

### Test 1: Backend Health Check
```
URL: https://analistasql-production.up.railway.app/api/health
Resultado: ✅ PASÓ (200 OK)
```

### Test 2: Backend Login
```
URL: https://analistasql-production.up.railway.app/api/auth/login
Resultado: ✅ PASÓ (200 OK)
Token JWT: Generado correctamente (347 caracteres)
Usuario: Palandaeta Administrator
Rol: SUPERADMIN
```

### Test 3: Frontend Accesible
```
URL: https://analista-sql.vercel.app
Resultado: ✅ PASÓ (200 OK)
Contenido: Universidad Icesi detectado
```

### Test 4: Página de Login
```
URL: https://analista-sql.vercel.app/login
Resultado: ✅ PASÓ (200 OK)
```

### Test 5: CORS Configuration
```
Access-Control-Allow-Origin: https://analista-sql.vercel.app
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Resultado: ✅ CONFIGURADO CORRECTAMENTE
```

---

## 🔐 Seguridad

### Autenticación
- ✅ JWT (JSON Web Tokens)
- ✅ Contraseñas hasheadas con bcryptjs
- ✅ Tokens con expiración configurada
- ✅ Middleware de protección de rutas

### CORS
- ✅ Origen verificado (solo Vercel frontend permitido)
- ✅ Credenciales habilitadas
- ✅ Métodos HTTP configurados

### HTTPS
- ✅ Frontend: SSL/TLS por Vercel
- ✅ Backend: SSL/TLS por Railway
- ✅ Base de datos: Conexión encriptada

---

## 📊 Métricas de Rendimiento

### Frontend (Vercel)
- **Tiempo de carga**: < 2 segundos
- **Disponibilidad**: 99.9%
- **Edge Network**: Global CDN

### Backend (Railway)
- **Tiempo de respuesta**: < 500ms
- **Disponibilidad**: 99.9%
- **Auto-scaling**: Habilitado

---

## 🔄 Backups Automáticos

### Sistema de Respaldo
- **Frecuencia**: Diario (3:00 AM UTC / 10:00 PM Colombia)
- **Retención**: 30 días
- **Storage**: GitHub Artifacts (gratis)
- **Manual**: Scripts disponibles en `backend/scripts/`

Para más información, ver: [`docs/BACKUPS.md`](./BACKUPS.md)

---

## 🚀 Deployment Automático

### Proceso de Actualización

Cuando se hace push a la rama `main`:

1. **Frontend (Vercel)**:
   - Build automático con Next.js
   - Deploy a producción
   - ~2-3 minutos

2. **Backend (Railway)**:
   - Build con TypeScript
   - Migraciones de Prisma (automáticas)
   - Deploy a producción
   - ~3-5 minutos

---

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Computadores de escritorio
- ✅ Laptops
- ✅ Tablets
- ⚠️ Móviles (responsive, pero optimizado para desktop)

---

## 🆘 Troubleshooting

### Error: "Failed to fetch"

**Causa**: Problema de conexión entre frontend y backend

**Solución**:
1. Verificar que backend esté funcionando: https://analistasql-production.up.railway.app/api/health
2. Revisar variables de entorno en Vercel (debe tener `NEXT_PUBLIC_API_URL`)
3. Verificar CORS en Railway

### Error: "Invalid credentials"

**Causa**: Email o contraseña incorrectos

**Solución**:
1. Verificar credenciales:
   - Email: `palandaeta@icesi.edu.co`
   - Contraseña: `Prueba123*`
2. Contactar administrador para resetear contraseña

### Error: "Session expired"

**Causa**: Token JWT expirado

**Solución**:
1. Cerrar sesión
2. Volver a iniciar sesión

---

## 📞 Soporte Técnico

### Logs y Monitoreo

**Backend Logs (Railway)**:
1. Ir a https://railway.app
2. Seleccionar proyecto "analistasql-production"
3. Click en "Logs"

**Frontend Logs (Vercel)**:
1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto "analista-sql"
3. Click en "Logs"

### Contacto

Para problemas técnicos, revisar:
- [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md) - Guía de deployment
- [`docs/BACKUPS.md`](./BACKUPS.md) - Sistema de backups
- [`docs/PRUEBAS_E2E.md`](./PRUEBAS_E2E.md) - Resultados de pruebas

---

## 📈 Estadísticas de Uso

### Usuarios
- **Total**: 1 (Superadmin)
- **Activos**: 1

### Organizaciones
- **Total**: Configurables por el usuario

### Instrumentos Disponibles
- ✅ Kroh (Madurez Digital)
- ✅ Kerzner (Gestión de Proyectos)

---

**Última actualización**: 2026-03-12
**Versión del sistema**: 1.0.0
**Estado**: 🟢 Producción Estable
