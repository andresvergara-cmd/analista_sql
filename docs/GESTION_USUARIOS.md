# 👥 Guía de Gestión de Usuarios

> Documentación completa para crear, editar y gestionar usuarios en la plataforma

---

## 📋 Índice

1. [Crear Usuarios](#crear-usuarios)
2. [Editar Usuarios](#editar-usuarios)
3. [Cambiar Contraseñas](#cambiar-contraseñas)
4. [Eliminar Usuarios](#eliminar-usuarios)
5. [Roles y Permisos](#roles-y-permisos)
6. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🔐 Autenticación Requerida

**IMPORTANTE:** Todos los endpoints de gestión de usuarios requieren autenticación mediante JWT.

### Obtener Token de Autenticación

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@icesi.edu.co",
    "password": "admin_password_123"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@icesi.edu.co",
    "name": "Administrador General",
    "role": "SUPERADMIN"
  }
}
```

**Usar el token en requests:**
```bash
-H "Authorization: Bearer <tu-token-aqui>"
```

---

## 1. Crear Usuarios

### Endpoint
```
POST /api/users
```

### Permisos Requeridos
- ✅ **SUPERADMIN** (solo)

### Request Body
```json
{
  "name": "Nombre Completo",
  "email": "email@icesi.edu.co",
  "password": "contraseña",
  "role": "ADMIN"
}
```

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | String | ✅ Sí | Nombre completo del usuario |
| `email` | String | ✅ Sí | Email único (será el username) |
| `password` | String | ✅ Sí | Contraseña (mínimo 6 caracteres) |
| `role` | String | ✅ Sí | Rol: `SUPERADMIN`, `ADMIN`, o `STUDENT` |

### Ejemplo de Uso

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "María García",
    "email": "maria.garcia@icesi.edu.co",
    "password": "maria123",
    "role": "ADMIN"
  }'
```

### Respuesta Exitosa (201)
```json
{
  "success": true,
  "user": {
    "id": "60193898-cec8-4d6e-b5d1-2d9a1adb975d",
    "email": "maria.garcia@icesi.edu.co",
    "name": "María García",
    "role": "ADMIN",
    "tenantId": "default-tenant",
    "createdAt": "2026-03-11T00:28:29.908Z"
  }
}
```

### Errores Comunes

| Código | Error | Solución |
|--------|-------|----------|
| 400 | "Todos los campos son requeridos" | Proporciona name, email, password y role |
| 400 | "El email ya está registrado" | Usa un email diferente |
| 401 | "No token provided" | Incluye el header Authorization |
| 403 | "Insufficient permissions" | Solo SUPERADMIN puede crear usuarios |

### Notas Importantes

✅ **Seguridad:**
- La contraseña se hashea automáticamente con bcrypt (salt rounds: 10)
- **NUNCA** se devuelve el campo `password` en la respuesta
- El hash tiene 60 caracteres y formato `$2b$10$...`

✅ **Validaciones:**
- El email debe ser único en el sistema
- La contraseña se hashea antes de guardar en BD
- El usuario se crea en el tenant del usuario autenticado

---

## 2. Editar Usuarios

### Endpoint
```
PUT /api/users/:id
```

### Permisos Requeridos
- ✅ **SUPERADMIN** (solo)

### Request Body
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo.email@icesi.edu.co",
  "role": "STUDENT"
}
```

### Campos Editables

| Campo | Tipo | Opcional | Descripción |
|-------|------|----------|-------------|
| `name` | String | ✅ Sí | Nuevo nombre completo |
| `email` | String | ✅ Sí | Nuevo email (debe ser único) |
| `role` | String | ✅ Sí | Nuevo rol |

**IMPORTANTE:** Este endpoint **NO** modifica la contraseña. Para cambiar contraseñas, usa el endpoint específico (ver sección 3).

### Ejemplo de Uso

```bash
curl -X PUT http://localhost:3001/api/users/60193898-cec8-4d6e-b5d1-2d9a1adb975d \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "María García López",
    "role": "SUPERADMIN"
  }'
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "user": {
    "id": "60193898-cec8-4d6e-b5d1-2d9a1adb975d",
    "email": "maria.garcia@icesi.edu.co",
    "name": "María García López",
    "role": "SUPERADMIN",
    "tenantId": "default-tenant",
    "createdAt": "2026-03-11T00:28:29.908Z"
  }
}
```

### Errores Comunes

| Código | Error | Solución |
|--------|-------|----------|
| 404 | "Usuario no encontrado" | Verifica que el ID sea correcto |
| 400 | "El email ya está registrado" | El nuevo email ya existe, usa otro |
| 403 | "Insufficient permissions" | Solo SUPERADMIN puede editar usuarios |

---

## 3. Cambiar Contraseñas

### Endpoint
```
POST /api/users/:id/change-password
```

### Permisos Requeridos
- ✅ **SUPERADMIN** - Puede cambiar cualquier contraseña (no requiere contraseña actual)
- ✅ **Cualquier usuario** - Puede cambiar su propia contraseña (requiere contraseña actual)

### Request Body

**Como SUPERADMIN (cambiar contraseña de otro):**
```json
{
  "newPassword": "nueva_contraseña"
}
```

**Como usuario normal (cambiar propia contraseña):**
```json
{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `newPassword` | String | ✅ Sí | Nueva contraseña (mínimo 6 caracteres) |
| `currentPassword` | String | Condicional | Solo si NO eres SUPERADMIN cambiando tu propia |

### Ejemplo 1: SUPERADMIN cambiando contraseña de otro usuario

```bash
curl -X POST http://localhost:3001/api/users/60193898-cec8-4d6e-b5d1-2d9a1adb975d/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-superadmin>" \
  -d '{
    "newPassword": "nueva_maria123"
  }'
```

### Ejemplo 2: Usuario cambiando su propia contraseña

```bash
curl -X POST http://localhost:3001/api/users/60193898-cec8-4d6e-b5d1-2d9a1adb975d/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-maria>" \
  -d '{
    "currentPassword": "maria123",
    "newPassword": "nueva_maria123"
  }'
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### Errores Comunes

| Código | Error | Solución |
|--------|-------|----------|
| 400 | "La nueva contraseña es requerida" | Proporciona el campo newPassword |
| 400 | "La contraseña debe tener al menos 6 caracteres" | Usa una contraseña más larga |
| 400 | "La contraseña actual es requerida" | Si no eres SUPERADMIN, debes proporcionar currentPassword |
| 401 | "Contraseña actual incorrecta" | La contraseña actual proporcionada es incorrecta |
| 403 | "No tienes permisos para cambiar esta contraseña" | Solo puedes cambiar tu propia contraseña (a menos que seas SUPERADMIN) |
| 404 | "Usuario no encontrado" | El ID del usuario no existe |

### Notas Importantes

✅ **Seguridad:**
- La nueva contraseña se hashea automáticamente con bcrypt
- SUPERADMIN puede resetear cualquier contraseña sin conocer la actual
- Usuarios normales deben proporcionar su contraseña actual para cambiarla

---

## 4. Eliminar Usuarios

### Endpoint
```
DELETE /api/users/:id
```

### Permisos Requeridos
- ✅ **SUPERADMIN** (solo)

### Restricciones
- ❌ No puedes eliminar tu propia cuenta

### Ejemplo de Uso

```bash
curl -X DELETE http://localhost:3001/api/users/60193898-cec8-4d6e-b5d1-2d9a1adb975d \
  -H "Authorization: Bearer <token>"
```

### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

### Errores Comunes

| Código | Error | Solución |
|--------|-------|----------|
| 400 | "No puedes eliminar tu propia cuenta" | Usa otra cuenta de SUPERADMIN |
| 404 | "Usuario no encontrado" | El ID del usuario no existe |
| 403 | "Insufficient permissions" | Solo SUPERADMIN puede eliminar usuarios |

---

## 5. Roles y Permisos

### Roles Disponibles

| Rol | Código | Permisos |
|-----|--------|----------|
| **Superadministrador** | `SUPERADMIN` | Acceso completo a todas las funciones |
| **Administrador** | `ADMIN` | Gestión de reportes y organizaciones |
| **Estudiante** | `STUDENT` | Solo lectura de propios diagnósticos |

### Matriz de Permisos

| Acción | SUPERADMIN | ADMIN | STUDENT |
|--------|:----------:|:-----:|:-------:|
| **Gestión de Usuarios** | | | |
| Ver usuarios | ✅ | ✅ | ❌ |
| Crear usuarios | ✅ | ❌ | ❌ |
| Editar usuarios | ✅ | ❌ | ❌ |
| Eliminar usuarios | ✅ | ❌ | ❌ |
| Cambiar cualquier contraseña | ✅ | ❌ | ❌ |
| Cambiar propia contraseña | ✅ | ✅ | ✅ |
| **Otros Módulos** | | | |
| Gestión de organizaciones | ✅ | ✅ | ❌ |
| Ver reportes | ✅ | ✅ | Solo propios |
| Crear evaluaciones | ✅ | ✅ | ✅ |

---

## 6. Ejemplos Prácticos

### Caso 1: Onboarding de Nuevo Administrador

```bash
# 1. Login como SUPERADMIN
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@icesi.edu.co","password":"admin_password_123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Crear nuevo usuario ADMIN
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Carlos Rodríguez",
    "email": "carlos.rodriguez@icesi.edu.co",
    "password": "carlos_temp_2026",
    "role": "ADMIN"
  }'

# 3. El nuevo usuario debe cambiar su contraseña en el primer login
```

### Caso 2: Usuario Olvida su Contraseña

```bash
# SUPERADMIN resetea la contraseña
curl -X POST http://localhost:3001/api/users/{user-id}/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin-token>" \
  -d '{
    "newPassword": "temporal_reset_123"
  }'

# Comunica al usuario su contraseña temporal
# Usuario debe cambiarla en el próximo login
```

### Caso 3: Promover Usuario a SUPERADMIN

```bash
curl -X PUT http://localhost:3001/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <superadmin-token>" \
  -d '{
    "role": "SUPERADMIN"
  }'
```

### Caso 4: Usuario Cambia su Propia Contraseña

```bash
# 1. Usuario se autentica
USER_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.garcia@icesi.edu.co","password":"maria123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Cambia su contraseña
curl -X POST http://localhost:3001/api/users/{user-id}/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "currentPassword": "maria123",
    "newPassword": "nueva_maria_2026"
  }'
```

---

## 🔒 Mejores Prácticas de Seguridad

### Para Administradores

1. ✅ **Contraseñas Temporales:** Al crear usuarios, usa contraseñas temporales y pide que las cambien
2. ✅ **Principio de Menor Privilegio:** Asigna el rol mínimo necesario
3. ✅ **Auditoría Regular:** Revisa la lista de usuarios periódicamente
4. ✅ **Elimina Usuarios Inactivos:** Borra cuentas que ya no se usen
5. ✅ **Múltiples SUPERADMIN:** Ten al menos 2 SUPERADMIN para respaldo

### Para Usuarios

1. ✅ **Contraseñas Seguras:** Mínimo 8 caracteres, combina letras, números y símbolos
2. ✅ **Cambio Regular:** Cambia tu contraseña cada 90 días
3. ✅ **No Compartas:** Nunca compartas tu contraseña con nadie
4. ✅ **Cierra Sesión:** Usa el botón de logout al terminar
5. ✅ **Reporta Actividad Sospechosa:** Informa inmediatamente al administrador

### Para Desarrolladores

1. ✅ **Nunca logguear contraseñas:** No imprimas passwords en logs
2. ✅ **HTTPS en Producción:** Siempre usa HTTPS para enviar credenciales
3. ✅ **Rate Limiting:** Implementa límites de intentos de login (próxima fase)
4. ✅ **Sesiones Cortas:** Tokens JWT expiran en 7 días

---

## 📝 Resumen de Endpoints

| Método | Endpoint | Rol Requerido | Descripción |
|--------|----------|---------------|-------------|
| `GET` | `/api/users` | SUPERADMIN, ADMIN | Listar todos los usuarios |
| `POST` | `/api/users` | SUPERADMIN | Crear nuevo usuario |
| `PUT` | `/api/users/:id` | SUPERADMIN | Editar usuario (sin password) |
| `DELETE` | `/api/users/:id` | SUPERADMIN | Eliminar usuario |
| `POST` | `/api/users/:id/change-password` | SUPERADMIN o propio usuario | Cambiar contraseña |

---

## ❓ Preguntas Frecuentes

### ¿Cómo creo el primer SUPERADMIN?

El primer SUPERADMIN se crea mediante el seed de la base de datos:
```bash
cd backend
npx prisma db seed
```

Esto crea:
- Email: `admin@icesi.edu.co`
- Contraseña: `admin_password_123`
- Rol: SUPERADMIN

### ¿Puedo tener múltiples SUPERADMIN?

✅ Sí, es recomendable tener al menos 2 SUPERADMIN para respaldo.

### ¿Qué pasa si olvido la contraseña del SUPERADMIN?

Puedes resetearla directamente en la base de datos:
```bash
cd backend
npx ts-node scripts/migrate-passwords.ts
```

O crear un nuevo SUPERADMIN mediante seed.

### ¿Las contraseñas se guardan encriptadas?

✅ Sí, se hashean con bcrypt (salt rounds: 10) antes de guardar.

### ¿Cuánto tiempo dura una sesión?

Los tokens JWT expiran después de **7 días**.

### ¿Puedo cambiar mi propio rol?

❌ No, solo un SUPERADMIN puede cambiar roles.

---

## 📞 Soporte

Para dudas o problemas:
- Revisa la documentación técnica en `/docs`
- Contacta al equipo de desarrollo
- Reporta issues en el repositorio

---

**Última actualización:** Marzo 2026
**Versión:** 1.0.0
