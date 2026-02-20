# 🏗️ Arquitectura de Solución

> Plataforma de Diagnóstico de Madurez Digital — Kroh et al. 2020  
> Última actualización: Febrero 2026

---

## 1. Visión General

La plataforma adopta una arquitectura **monorepo cliente-servidor de tres capas** con un componente adicional de integración con agentes de IA (MCP Server). El sistema está diseñado para ejecutarse localmente en entornos de demostración universitaria y pueda escalar hacia una solución Cloud cuando el volumen de organizaciones lo requiera.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                            │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │              Next.js 16 + React 19 + Tailwind CSS 4             │   │
│   │                    http://localhost:3000                         │   │
│   │                                                                  │   │
│   │  Dashboard │ Instrumento │ Diagnóstico │ Reportes │ Análisis IA │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP REST (fetch)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE NEGOCIO                                │
│                                                                         │
│   ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│   │   Express.js API REST        │  │      MCP Server (stdio)      │   │
│   │   http://localhost:3001      │  │   @modelcontextprotocol/sdk  │   │
│   │                              │  │                              │   │
│   │  ┌────────────────────────┐  │  │  Tools:                     │   │
│   │  │  kroh-logic.ts         │  │  │  · create_assessment        │   │
│   │  │  Cálculo 7 dimensiones │  │  │  · submit_answers           │   │
│   │  │  Escala 1-5 / Inversa  │  │  │  · query_assessments        │   │
│   │  └────────────────────────┘  │  └──────────────────────────────┘   │
│   │  ┌────────────────────────┐  │                                      │
│   │  │  roadmap-generator.ts  │  │                                      │
│   │  │  Hoja de ruta 3 capas  │  │                                      │
│   │  └────────────────────────┘  │                                      │
│   └──────────────────────────────┘                                      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ Prisma ORM
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE DATOS                                  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │            PostgreSQL 17  (puerto local 51214)                   │   │
│   │         Data directory: backend/pgdata/                          │   │
│   │                                                                  │   │
│   │   Tenant │ User │ Company │ Assessment │ Answer │ Diagnosis     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Componentes del Sistema

### 2.1 Frontend — Next.js Application

**Tecnologías:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript 5

El frontend es una **Single Page Application** enrutada por el sistema de ficheros de Next.js. Todas las páginas son componentes cliente (`"use client"`) que se conectan directamente a la API REST del backend.

#### Módulos de la Aplicación

```
src/app/
├── page.tsx                     # Dashboard: métricas en tiempo real
├── measurement-instrument/
│   ├── page.tsx                 # Selector de instrumentos de medición
│   └── kroh-2020/
│       └── page.tsx             # Formulario Kroh 2020 (32 ítems, 7 secciones)
├── diagnosis/[id]/
│   └── page.tsx                 # Resultados individuales + Radar Chart + Roadmap
├── reports/
│   └── page.tsx                 # Tablero dual: Sábana de datos / Informe ejecutivo
├── analysis/
│   └── page.tsx                 # Matriz Impacto vs Esfuerzo (IA hardcoded)
├── organizations/
│   └── page.tsx                 # CRUD de empresas evaluadas
├── models/
│   └── page.tsx                 # Modelos de referencia teórica
├── query/
│   └── page.tsx                 # Interfaz NL-to-SQL (mock)
├── users/
│   └── page.tsx                 # Gestión de usuarios
└── config/
    └── page.tsx                 # Configuración del sistema
```

#### Componentes Compartidos

| Componente | Responsabilidad |
|-----------|----------------|
| `Sidebar.tsx` | Navegación lateral con íconos Material Icons |
| `AssessmentSidebar.tsx` | Progreso de secciones en el formulario Kroh |
| `RadarChart.tsx` | Gráfico radar SVG puro (sin librería externa) |

#### Diseño Visual
- **Sistema de colores**: Variable CSS `--color-primary` con gradientes HSL
- **Tipografía**: Inter (Google Fonts)
- **Patrones**: Glassmorphism, micro-animaciones, dark/light mode adaptativo
- **Iconografía**: Material Icons (Google CDN)

---

### 2.2 Backend — Express.js REST API

**Tecnologías:** Express 5, TypeScript 5, Prisma 7.3, Zod 4

La API sigue un patrón **router-handler** sin capas adicionales (sin services/repositories), apropiado para la escala actual del proyecto. Cada ruta integra directamente con Prisma Client.

#### Configuración de Base de Datos

```typescript
// Patrón: Pool de conexión pg → Adaptador Prisma → PrismaClient
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1  // ⚠️ Apropiado para demos; aumentar en producción
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

#### Motor de Cálculo — `kroh-logic.ts`

```
Respuestas (Record<itemId, 1-5>)
         │
         ▼
[Para cada dimensión DIF, DIP, DMI, DIN, DTC, DMA, DIR]
         │
         ├── ¿Es escala inversa? → Aplicar: 6 - valor
         │
         ▼
  Promedio por dimensión (1–5)
         │
         ▼
  Porcentaje para UI: (promedio / 5) * 100
         │
         ▼
  Promedio global de las 7 dimensiones
         │
         ▼
  Clasificación:
    ≥ 4.5 → "Líder Digital"
    ≥ 3.5 → "Avanzado"
    ≥ 2.5 → "En Transformación Digital"
    ≥ 1.5 → "En Desarrollo"
     else → "Inicial"
```

#### Motor de Hoja de Ruta — `roadmap-generator.ts`

```
Por cada dimensión con score dado:
  │
  ├── score < 2.5  → Acciones de "Corto Plazo (Quick Win)"  [type: 'critical']
  ├── score < 4.0  → Acciones de "Mediano Plazo"            [type: 'improvement']
  └── score ≥ 4.0  → Acciones de "Largo Plazo (Estratégico)"[type: 'optimization']
```

---

### 2.3 MCP Server — Agente de IA

**Tecnologías:** @modelcontextprotocol/sdk 1.26.0, transporte: stdio

El MCP Server expone las capacidades de la plataforma como **herramientas consumibles por agentes de IA** (Claude, Gemini, etc.). Se conecta directamente a la base de datos con su propia instancia de PrismaClient.

```
Cliente IA (Claude/Gemini)
         │
         │  stdio (JSON-RPC)
         ▼
   MCP Server (mcp-server.ts)
         │
         ├── ListTools  → devuelve: [create_assessment, submit_answers, query_assessments]
         │
         └── CallTool:
               ├── create_assessment → prisma.assessment.create()
               ├── submit_answers    → prisma.answer.create()
               └── query_assessments → [MOCK] respuesta simulada
```

**Estado actual:** La herramienta `query_assessments` devuelve SQL simulado. La integración real requiere un LLM que traduzca el lenguaje natural al esquema Prisma.

---

## 3. Flujos Principales

### 3.1 Flujo de Evaluación Completo

```
Usuario (Respondente)
        │
        │  1. Navega a /measurement-instrument/kroh-2020
        ▼
[Formulario Kroh 2020]
  - Ingresa datos: nombre, email, empresa, cargo
  - Responde 32 ítems Likert (1-5) en 7 secciones
        │
        │  2. POST /api/assessment/submit
        │     { assessmentId, respondentName, responses, companyId, ... }
        ▼
[Backend: index.ts]
  - Upsert Assessment 'kroh-2020'
  - Create Answer (responses + metadata)
  - calculateKrohMaturity(responses) ──→ { foundations[], globalScore, status }
  - Create Diagnosis (result: JSON, score: float)
        │
        │  3. Response: { answerId, diagnosisId }
        ▼
[Frontend]
  - Redirige a /diagnosis/:diagnosisId
        │
        │  4. GET /api/diagnosis/:id
        ▼
[Backend]
  - findUnique Diagnosis + include Assessment + Answer
  - generateRoadmap(foundations) ──→ RoadmapItem[]
  - Response: { ...diagnosis, roadmap }
        │
        ▼
[Página de Diagnóstico]
  - Muestra: Score global, Nivel de madurez
  - Muestra: Radar Chart de las 7 dimensiones
  - Muestra: Hoja de ruta en 3 horizontes
```

### 3.2 Flujo de Reporte Organizacional

```
Analista
   │
   │  1. GET /api/organizations/:id/report
   ▼
[Backend]
  - findUnique Company + include Answers + Diagnoses
  - Por cada ítem de respuesta:
      · Promedia valores de TODOS los respondentes de la empresa
  - calculateKrohMaturity(averagedResponses)
      → Perfil consolidado de la empresa
  - generateRoadmap(foundations)
      → Hoja de ruta organizacional
  - Agrupa respuestas por cargo (perceptionByPosition)
      → calculateKrohMaturity() por cada cargo
  - Response: { company, consolidated, roadmap, perceptionByPosition, answers }
   │
   ▼
[Frontend: /reports]
  - Tab 1 (Modo Tabla): Sábana de datos por respondente
  - Tab 2 (Modo Informe): Radar consolidado + Brecha perceptual + Roadmap
```

---

## 4. Estrategia de Despliegue

### Ambiente Local (Actual)

```
Mac (arm64)
  ├── PostgreSQL 17 → pg_ctl en pgdata/ (puerto 51214)
  ├── Backend       → ts-node (puerto 3001)
  └── Frontend      → Next.js dev server (puerto 3000)
```

**Comando para iniciar PostgreSQL al reiniciar sistema:**
```bash
/opt/homebrew/opt/postgresql@17/bin/pg_ctl \
  -D "/Users/andres.vergara/proyectos personales/Agente Analista SQL/backend/pgdata" \
  -o "-p 51214" start
```

### Ambiente Producción (Futuro)

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel    │    │    Railway /    │    │  Supabase /     │
│  (Frontend) │◄──►│   Render        │◄──►│  Neon DB        │
│  Next.js    │    │  (Backend API)  │    │  PostgreSQL 17  │
└─────────────┘    └─────────────────┘    └─────────────────┘
```

**Variables de entorno requeridas en producción:**

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `PORT` | Puerto del backend (default 3001) |

---

## 5. Seguridad y Limitaciones Actuales

| Área | Estado | Acción Requerida |
|------|--------|-----------------|
| Autenticación | ❌ No implementada | JWT / NextAuth.js |
| Contraseñas | ❌ Texto plano en BD | Implementar bcrypt |
| CORS | ⚠️ Abierto (`*`) | Restringir a dominios permitidos |
| Multi-tenancy | ⚠️ Solo `default-tenant` | Activar filtros por tenant |
| NL-to-SQL | ⚠️ Mock | Integrar Gemini/OpenAI API |
| HTTPS | ❌ Solo HTTP local | Configurar en producción |
| Rate Limiting | ❌ No implementado | Agregar middleware |

---

## 6. Decisiones Técnicas Relevantes

### ¿Por qué Express 5 en lugar de NestJS o Fastify?
Simplicidad y velocidad de desarrollo. El volumen de endpoints es bajo y no justifica la sobrecarga de un framework opinionado. Se puede migrar a NestJS si la base de código crece.

### ¿Por qué Prisma con adaptador pg en lugar de Prisma directo?
El adaptador `@prisma/adapter-pg` permite usar un pool de conexiones explícito (`pg.Pool`), dando control total sobre el número de conexiones activas. Crítico para ambientes de demostración con recursos limitados.

### ¿Por qué lógica de cálculo duplicada en frontend y backend?
El módulo `kroh-logic.ts` existe en ambos lados para:
1. **Backend**: Persistir resultados calculados en base de datos.
2. **Frontend**: Validar respuestas y ofrecer preview en tiempo real sin round-trips al servidor.
*Mejora futura: Publicar como paquete npm compartido (`@kroh/logic`) en el monorepo.*

### ¿Por qué Radar Chart con SVG puro?
Evitar dependencias de librerías de gráficos (Chart.js, Recharts) que añaden peso. El radar de 7 dimensiones es suficientemente simple para implementar con trigonometría básica en SVG.

### ¿Por qué PostgreSQL local con pgdata en el repositorio?
Para facilitar onboarding en demos: el estado de la base de datos viaja con el código. En producción se migra a un servicio gestionado (Supabase/Neon).
