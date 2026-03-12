# 🚀 Configuración de Variables de Entorno en Vercel

**Fecha**: 2026-03-12
**Propósito**: Configurar `NEXT_PUBLIC_API_URL` para conectar frontend con backend en producción

---

## 🎯 Problema Resuelto

El frontend en producción (Vercel) necesita conocer la URL del backend (Railway) para funcionar correctamente.

**Antes:**
- ❌ URLs hardcodeadas: `http://localhost:3001`
- ❌ NO funciona en producción
- ❌ Organizaciones, reportes, diagnósticos NO operaban

**Ahora:**
- ✅ URLs dinámicas usando: `process.env.NEXT_PUBLIC_API_URL`
- ✅ Funciona en desarrollo Y producción
- ✅ Toda la aplicación operativa

---

## 📋 Pasos para Configurar en Vercel

### 1. Acceder a Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona el proyecto: **`analista-sql`** (o el nombre de tu frontend)

### 2. Configurar Variable de Entorno

1. Click en **Settings** (Configuración)
2. En el menú lateral, click en **Environment Variables**
3. Agregar nueva variable:

```
Key (Nombre):
NEXT_PUBLIC_API_URL

Value (Valor):
https://analistasql-production.up.railway.app

Environment (Entorno):
☑️ Production
☑️ Preview
☑️ Development
```

4. Click en **Save** (Guardar)

### 3. Redeploy del Proyecto

**IMPORTANTE:** Los cambios de variables de entorno NO se aplican automáticamente.

**Opción A: Redeploy Automático (Recomendado)**
1. Haz push de cualquier cambio al repositorio
2. Vercel automáticamente hará redeploy con la nueva variable

**Opción B: Redeploy Manual**
1. Ve a la pestaña **Deployments**
2. Click en el deployment más reciente
3. Click en los tres puntos `...` → **Redeploy**
4. Confirm **Redeploy**

### 4. Verificar Configuración

Después del redeploy, verifica que la variable está configurada:

1. Ve a **Deployments**
2. Click en el deployment más reciente
3. Busca la sección **Environment Variables**
4. Deberías ver: `NEXT_PUBLIC_API_URL` = `https://analistasql-production.up.railway.app`

---

## ✅ Verificación de Funcionamiento

Una vez configurado y redeployado, verifica que todo funciona:

### Test 1: Crear Organización

1. Abre: https://analista-sql.vercel.app
2. Login con credenciales de admin
3. Ve a **Organizaciones**
4. Click en **Nueva Organización**
5. Completa formulario y guarda
6. ✅ Debería aparecer en la lista

### Test 2: Generar Reporte

1. Selecciona una organización con diagnósticos
2. Click en **Ver Reporte**
3. ✅ Debería cargar el reporte sin errores

### Test 3: Consola del Navegador

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Recarga la página de organizaciones
4. Busca la petición a `/api/organizations`
5. ✅ La URL debería ser: `https://analistasql-production.up.railway.app/api/organizations`
6. ✅ Status: 200 OK

---

## 🔧 Troubleshooting

### Problema: Sigue usando localhost

**Síntoma:** En DevTools > Network veo peticiones a `http://localhost:3001`

**Solución:**
1. Verifica que la variable esté configurada en Vercel
2. Asegúrate de haber hecho **Redeploy** después de configurarla
3. Limpia el caché del navegador (Ctrl+Shift+R)
4. Prueba en modo incógnito

### Problema: Error 404 en las peticiones

**Síntoma:** Las peticiones a Railway retornan 404

**Solución:**
1. Verifica que el backend en Railway esté funcionando:
   ```bash
   curl https://analistasql-production.up.railway.app/api/organizations
   ```
2. Si el backend responde con 404, verifica las rutas en el backend
3. Si el backend no responde, verifica que esté desplegado en Railway

### Problema: Error CORS

**Síntoma:** Error de CORS en la consola del navegador

**Solución:**
1. El backend debe tener CORS configurado para permitir `https://analista-sql.vercel.app`
2. Verifica la configuración de CORS en `backend/src/index.ts`
3. Asegúrate de que el middleware CORS esté antes de las rutas

---

## 📊 Variables de Entorno por Ambiente

| Ambiente | Variable | Valor |
|----------|----------|-------|
| **Development** (Local) | `NEXT_PUBLIC_API_URL` | `http://localhost:3001` |
| **Production** (Vercel) | `NEXT_PUBLIC_API_URL` | `https://analistasql-production.up.railway.app` |

---

## 🎓 Archivos Modificados

Los siguientes archivos ahora usan `NEXT_PUBLIC_API_URL`:

1. ✅ `frontend/src/app/organizations/page.tsx` (4 URLs)
2. ✅ `frontend/src/app/reports/company/[id]/page.tsx` (7 URLs)
3. ✅ `frontend/src/app/diagnosis/[id]/page.tsx` (1 URL)
4. ✅ `frontend/src/app/measurement-instrument/kroh-2020/page.tsx` (2 URLs)

**Total**: 14 URLs hardcodeadas → Reemplazadas por variable dinámica

---

## 📝 Commit Realizado

```
fix: reemplazar URLs hardcodeadas por variable de entorno

PROBLEMA CRÍTICO (P0):
- 14 URLs hardcodeadas a http://localhost:3001
- Sistema NO funcionaba en producción
- Crear/editar organizaciones: FALLABA
- Generar reportes: FALLABA
- Aplicar diagnósticos: FALLABA

SOLUCIÓN:
- Agregada variable API_URL en 4 archivos
- Reemplazadas 14 URLs hardcodeadas
- Actualizado .env.example con documentación
- Creado docs/CONFIGURACION_VERCEL.md

ARCHIVOS MODIFICADOS:
- frontend/src/app/organizations/page.tsx
- frontend/src/app/reports/company/[id]/page.tsx
- frontend/src/app/diagnosis/[id]/page.tsx
- frontend/src/app/measurement-instrument/kroh-2020/page.tsx
- frontend/.env.example

PRÓXIMO PASO:
Configurar NEXT_PUBLIC_API_URL en Vercel:
https://analistasql-production.up.railway.app

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🔗 Links Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Frontend Production**: https://analista-sql.vercel.app
- **Backend Production**: https://analistasql-production.up.railway.app
- **Documentación Vercel**: https://vercel.com/docs/projects/environment-variables

---

**Documentación generada**: 2026-03-12
**Autor**: Claude Code
**Estado**: ✅ LISTO PARA CONFIGURAR
