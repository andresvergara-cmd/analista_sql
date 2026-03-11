# 🚀 Guía de Despliegue a Producción

Esta guía te ayudará a desplegar el proyecto en Railway (backend) y Vercel (frontend).

## 📋 Pre-requisitos

- Cuenta en [Railway](https://railway.app)
- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub: https://github.com/andresvergara-cmd/analista_sql.git

---

## 🔧 PASO 1: Desplegar Backend en Railway

### 1.1 Crear Proyecto en Railway

1. Ve a [Railway](https://railway.app) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu GitHub
5. Selecciona el repositorio: `andresvergara-cmd/analista_sql`

### 1.2 Configurar PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. Copia la variable `DATABASE_URL` que aparecerá en las variables del servicio PostgreSQL

### 1.3 Configurar el Servicio Backend

1. Click en el servicio del backend que se creó automáticamente
2. Ve a la pestaña **"Settings"**
3. En **"Root Directory"**, establece: `backend`
4. En **"Start Command"**, establece: `npm run start:migrate`

### 1.4 Configurar Variables de Entorno

1. Ve a la pestaña **"Variables"**
2. Agrega las siguientes variables:

```env
DATABASE_URL=<copiar del servicio PostgreSQL>
JWT_SECRET=tu-secreto-super-seguro-cambialo-en-produccion-12345678
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app
```

**Importante**:
- Cambia `JWT_SECRET` por una cadena aleatoria segura
- `FRONTEND_URL` se actualizará después de desplegar en Vercel

### 1.5 Deploy

1. Click en **"Deploy"** o espera a que inicie automáticamente
2. Railway ejecutará:
   - `npm install`
   - `npm run build`
   - `npx prisma migrate deploy` (migraciones)
   - `npm run start` (iniciar servidor)

3. Una vez desplegado, copia la URL del backend (ej: `https://tu-backend.up.railway.app`)

### 1.6 Ejecutar Seed (Opcional)

Para poblar la base de datos con datos iniciales:

1. Ve a la pestaña **"Settings"** del servicio backend
2. Scroll hasta **"Deploy Triggers"**
3. En **"Custom Start Command"**, temporalmente pon: `npx prisma db seed && npm start`
4. Redeploy el servicio
5. Después del seed, regresa el comando a: `npm run start:migrate`

---

## 🌐 PASO 2: Desplegar Frontend en Vercel

### 2.1 Importar Proyecto

1. Ve a [Vercel](https://vercel.com) e inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Importa el repositorio de GitHub: `andresvergara-cmd/analista_sql`

### 2.2 Configurar el Proyecto

1. **Framework Preset**: Next.js (detectado automáticamente)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (por defecto)
4. **Output Directory**: `.next` (por defecto)

### 2.3 Variables de Entorno

1. En **"Environment Variables"**, agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

**Importante**: Usa la URL de Railway del Paso 1.5

### 2.4 Deploy

1. Click en **"Deploy"**
2. Espera a que termine el build (~2-3 minutos)
3. Una vez desplegado, copia la URL de Vercel (ej: `https://tu-app.vercel.app`)

### 2.5 Actualizar CORS en Backend

1. Regresa a Railway → Variables del backend
2. Actualiza `FRONTEND_URL` con la URL de Vercel del paso 2.4
3. Redeploy el backend para aplicar cambios

---

## ✅ PASO 3: Verificación Post-Despliegue

### 3.1 Verificar Backend

1. Abre: `https://tu-backend.up.railway.app/api/health`
2. Deberías ver: `{"status":"ok"}`

### 3.2 Verificar Frontend

1. Abre tu URL de Vercel: `https://tu-app.vercel.app`
2. Deberías ver la página de login

### 3.3 Probar Login

1. Usuario por defecto (creado por seed):
   - **Email**: `admin@icesi.edu.co`
   - **Password**: `Admin123!`

2. Si el seed no se ejecutó, necesitarás:
   - Ejecutar `npx prisma db seed` en Railway (ver Paso 1.6)
   - O crear un usuario manualmente usando Prisma Studio

---

## 🔐 PASO 4: Seguridad Post-Despliegue

### 4.1 Cambiar JWT Secret

En Railway, actualiza `JWT_SECRET` con un valor seguro:

```bash
# Genera un secreto aleatorio de 64 caracteres
openssl rand -base64 64
```

### 4.2 Cambiar Contraseñas por Defecto

1. Inicia sesión como admin
2. Ve a **"Usuarios"** → Editar
3. Cambia las contraseñas de todos los usuarios por defecto

### 4.3 Configurar Dominio Personalizado (Opcional)

#### En Vercel:
1. Settings → Domains
2. Agrega tu dominio
3. Configura DNS según instrucciones

#### En Railway:
1. Settings → Networking
2. Genera un dominio Railway o configura uno personalizado

---

## 🐛 Troubleshooting

### Error: "No token provided"
- **Causa**: Frontend no puede conectarse al backend
- **Solución**: Verifica que `NEXT_PUBLIC_API_URL` esté correctamente configurado en Vercel

### Error: "Database connection failed"
- **Causa**: Backend no puede conectarse a PostgreSQL
- **Solución**: Verifica que `DATABASE_URL` esté correctamente configurado en Railway

### Error: "Migration failed"
- **Causa**: Las migraciones de Prisma fallaron
- **Solución**:
  1. Ve a Railway → Logs
  2. Busca errores de migración
  3. Puede necesitar resetear la BD: `npx prisma migrate reset --force`

### Error 500 en API calls
- **Causa**: Error en el backend
- **Solución**:
  1. Revisa logs en Railway
  2. Verifica que todas las variables de entorno estén configuradas
  3. Asegúrate que el seed se ejecutó correctamente

---

## 📊 Monitoreo

### Railway
- **Logs**: Railway Dashboard → Service → Logs
- **Métricas**: Railway Dashboard → Service → Metrics
- **Base de datos**: Railway Dashboard → PostgreSQL → Metrics

### Vercel
- **Logs**: Vercel Dashboard → Project → Deployments → View Function Logs
- **Analytics**: Vercel Dashboard → Project → Analytics
- **Performance**: Vercel Dashboard → Project → Speed Insights

---

## 🔄 Despliegues Futuros

Cada vez que hagas `git push` a la rama `main`:

- **Railway**: Redespliegue automático del backend
- **Vercel**: Redespliegue automático del frontend

---

## 📝 Checklist de Despliegue

- [ ] Backend desplegado en Railway
- [ ] PostgreSQL creado y conectado
- [ ] Variables de entorno configuradas en Railway
- [ ] Migraciones ejecutadas correctamente
- [ ] Seed ejecutado (datos iniciales)
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] CORS configurado correctamente
- [ ] Login funciona correctamente
- [ ] JWT Secret cambiado por uno seguro
- [ ] Contraseñas por defecto cambiadas
- [ ] Endpoints de API funcionando

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs de Railway y Vercel
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que el repositorio de GitHub esté actualizado
4. Contacta al desarrollador: andresvergara.cmd@gmail.com

---

**¡Listo!** Tu aplicación debería estar funcionando en producción. 🎉
