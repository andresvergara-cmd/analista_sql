# 🧠 Plataforma de Diagnóstico de Madurez Digital

> **Basada en el marco teórico de Kroh et al. (2020) — "Microfoundations of Digital Innovation Capabilities"**  
> Universidad Icesi · Curso: IA Aplicada a los Negocios

---

## 📌 Descripción General

Plataforma web integral para evaluar, diagnosticar y analizar la **madurez digital** de organizaciones, utilizando el instrumento científico de Kroh et al. (2020). Permite a facilitadores y analistas administrar evaluaciones, visualizar resultados por empresa y generar hojas de ruta de transformación digital personalizadas.

La plataforma incluye además un **servidor MCP** (Model Context Protocol) que expone las capacidades de la plataforma como herramientas para agentes de IA, y un módulo de **consulta en lenguaje natural** (NL-to-SQL) en desarrollo.

---

## ✨ Características Principales

### 1. 📋 Instrumento de Medición Científico
- Cuestionario Likert (1–5) con **32 ítems** validados
- **7 Micro-fundaciones** evaluadas (Kroh et al. 2020):

| Código | Dimensión | Ítems |
|--------|-----------|-------|
| `DIF` | Digital Focus | I3–I10 (8 ítems) |
| `DIP` | Digital Innovation Process | I11–I14 (4 ítems) |
| `DMI` | Digital Mindset | I17–I20 (4 ítems) |
| `DIN` | Digital Innovation Network | I22–I25 (4 ítems) |
| `DTC` | Digital Tech Capability | I26–I30 (5 ítems) |
| `DMA` | Data Management | I31–I33 (3 ítems) |
| `DIR` | Overcoming Resistance | I34–I38 (4 ítems, **escala invertida**) |

- **Cálculo automático**: inversión de escalas para ítems de resistencia y promedios en tiempo real.
- **Niveles de madurez**: Inicial → En Desarrollo → En Transformación Digital → Avanzado → Líder Digital.

### 2. 📊 Tableros de Control Duales
- **Modo Tabla**: Sábana de datos con respuestas individuales por respondente.
- **Modo Informe**: Vista consolidada por empresa con métricas agregadas.
- **Gráfico Radar**: Visualización de brechas entre las 7 micro-fundaciones.
- **Análisis de Brecha Perceptual**: Comparación por cargo/posición del respondente.

### 3. 🤖 Análisis Estratégico
- **Matriz de Priorización**: Visualización interactiva de Impacto vs Esfuerzo.
- **Motor de Casos de Uso**: Identifica Quick Wins, iniciativas Estratégicas, Mantenimiento y Soporte.
- **Hoja de Ruta Personalizada**: Acciones en 3 horizontes (Corto, Mediano, Largo Plazo) según el perfil de madurez.

### 4. 🔌 Servidor MCP (Model Context Protocol)
Expone la plataforma como herramientas de IA consumibles por Claude, Gemini u otros agentes:
- `create_assessment` — Crear evaluaciones
- `submit_answers` — Registrar respuestas
- `query_assessments` — Consulta en lenguaje natural

### 5. ⚙️ Gestión y Configuración
- Multi-organización: Registro y administración de empresas evaluadas.
- Gestión de usuarios con roles (`SUPERADMIN`, `STUDENT`).
- Soporte **Dark/Light Mode** adaptativo.
- Diseño glassmorphism con micro-animaciones.

---

## 🗂️ Estructura del Proyecto (Monorepo)

```
Agente Analista SQL/
├── backend/                    # Servidor Express.js + Prisma
│   ├── src/
│   │   ├── index.ts            # API RESTful principal (puerto 3001)
│   │   ├── mcp-server.ts       # Servidor MCP (stdio)
│   │   └── utils/
│   │       ├── kroh-logic.ts   # Motor de cálculo de madurez
│   │       └── roadmap-generator.ts  # Generador de hoja de ruta
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de datos
│   │   └── seed.ts             # Datos iniciales
│   ├── scripts/
│   │   ├── generate-test-data.ts  # Generador de datos sintéticos
│   │   └── check-data.ts          # Verificación de integridad
│   ├── pgdata/                 # Cluster PostgreSQL 17 local
│   └── .env                    # Variables de entorno
│
├── frontend/                   # Aplicación Next.js 16 + Tailwind CSS 4
│   └── src/
│       ├── app/
│       │   ├── page.tsx                    # Dashboard principal
│       │   ├── measurement-instrument/     # Selector de instrumentos
│       │   │   └── kroh-2020/              # Formulario de evaluación
│       │   ├── diagnosis/[id]/             # Vista de diagnóstico
│       │   ├── reports/                    # Tablero de reportes
│       │   ├── analysis/                   # Análisis estratégico IA
│       │   ├── organizations/              # Gestión de empresas
│       │   ├── models/                     # Modelos de referencia
│       │   ├── query/                      # Consulta NL-to-SQL
│       │   ├── users/                      # Gestión de usuarios
│       │   └── config/                     # Configuración del sistema
│       ├── components/
│       │   ├── Sidebar.tsx                 # Navegación lateral
│       │   ├── AssessmentSidebar.tsx       # Navegación del formulario
│       │   └── RadarChart.tsx              # Gráfico de radar SVG
│       └── utils/
│           └── kroh-logic.ts               # Lógica de cálculo (espejo frontend)
│
├── docs/                       # Documentación técnica
│   ├── ARQUITECTURA_SOLUCION.md
│   └── ARQUITECTURA_DATOS.md
│
└── README.md                   # Este archivo
```

---

## 🚀 Configuración Local

### Requisitos Previos
- **Node.js** v18+
- **PostgreSQL 17** (Homebrew: `brew install postgresql@17`)

### 1. Base de Datos

```bash
# Inicializar cluster (solo primera vez)
/opt/homebrew/opt/postgresql@17/bin/initdb -D backend/pgdata --locale=en_US.UTF-8 -U postgres

# Iniciar PostgreSQL
/opt/homebrew/opt/postgresql@17/bin/pg_ctl -D backend/pgdata -o "-p 51214" start

# Sincronizar schema
cd backend && npx prisma db push

# Poblar con datos de ejemplo
npx prisma db seed
```

### 2. Backend

```bash
cd backend
npm install
npm run dev          # Inicia en http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev          # Inicia en http://localhost:3000
```

---

## 🔗 URLs Locales

| Recurso | URL |
|---------|-----|
| 🌐 Aplicación Web | http://localhost:3000 |
| ⚙️ API REST | http://localhost:3001 |
| 🩺 Health Check | http://localhost:3001/api/health |
| 📊 Formulario Kroh | http://localhost:3000/measurement-instrument/kroh-2020 |
| 📋 Reportes | http://localhost:3000/reports |
| 🏢 Organizaciones | http://localhost:3000/organizations |

---

## 📡 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/assessment/submit` | Enviar respuestas y generar diagnóstico |
| `GET` | `/api/diagnosis/:id` | Obtener diagnóstico con hoja de ruta |
| `GET` | `/api/organizations` | Listar organizaciones |
| `POST` | `/api/organizations` | Crear organización |
| `GET` | `/api/organizations/:id` | Obtener organización |
| `PUT` | `/api/organizations/:id` | Actualizar organización |
| `DELETE` | `/api/organizations/:id` | Eliminar organización |
| `GET` | `/api/organizations/:id/report` | Reporte consolidado (con brecha perceptual) |
| `GET` | `/api/reports` | Todos los reportes |
| `PUT` | `/api/answers/:id` | Actualizar respuesta y recalcular |
| `GET` | `/api/users` | Listar usuarios |
| `POST` | `/api/users` | Crear usuario |
| `POST` | `/api/query` | Consulta NL-to-SQL (mock) |

---

## 🛠️ Scripts de Utilidad

```bash
# Backend
npm run dev                             # Servidor en modo desarrollo
npm run mcp                             # Servidor MCP (stdio)
npm run seed                            # Poblar BD con datos iniciales
npm run test-data                       # Generar datos sintéticos avanzados
npm run check-data                      # Verificar integridad de datos

# Prisma
npx prisma db push                      # Sincronizar schema → BD
npx prisma studio                       # GUI de base de datos
```

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend Framework | Next.js | 16.1.6 |
| UI Library | React | 19.2.3 |
| Estilos | Tailwind CSS | 4.x |
| Backend | Express.js | 5.2.1 |
| ORM | Prisma | 7.3.0 |
| Base de Datos | PostgreSQL | 17.x |
| Lenguaje | TypeScript | 5.x |
| MCP SDK | @modelcontextprotocol/sdk | 1.26.0 |
| Validación | Zod | 4.3.6 |

---

## 📐 Documentación Técnica

- 📄 [Arquitectura de Solución](./docs/ARQUITECTURA_SOLUCION.md) — Diagrama de componentes, flujos y decisiones de diseño.
- 🗄️ [Arquitectura de Datos](./docs/ARQUITECTURA_DATOS.md) — Modelo entidad-relación, esquemas y estrategia de datos.

---

## ⚠️ Consideraciones Técnicas

1. **NL-to-SQL simulado**: El endpoint `/api/query` devuelve datos mock. Requiere integración con LLM (Gemini/OpenAI) para traducción real.
2. **Pool de conexión limitado**: `max: 1` en el Pool de PG — suficiente para desarrollo, aumentar en producción.
3. **Contraseñas sin hash**: El modelo `User` almacena contraseñas en texto plano. **Implementar bcrypt antes de producción.**
4. **Tenant único**: Actualmente solo existe `default-tenant`. La arquitectura multi-tenant está modelada pero no completamente habilitada.
5. **PostgreSQL local**: Al reiniciar la Mac, recordar arrancar PostgreSQL manualmente (ver sección Configuración).
