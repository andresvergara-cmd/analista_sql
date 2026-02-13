# Plataforma de Análisis de Madurez Digital (Kroh 2020)

Esta aplicación es una plataforma integral para la evaluación, diagnóstico y análisis de la madurez digital en organizaciones, basada en el marco teórico de Kroh et al. (2020).

## Características Principales

### 1. Evaluación Multidimensional
- Instrumento digital basado en Likert (1-5).
- 7 Micro-fundaciones evaluadas:
  - Digital Focus
  - Digital Innovation Process
  - Digital Mindset
  - Digital Innovation Network
  - Digital Tech Capability
  - Data Management
  - Overcoming Resistance
- **Cálculo Automático**: Inversión de escalas para ítems de resistencia y promedios en tiempo real.

### 2. Tableros de Control
- **Dual-View Reporting**:
  - **Modo Tabla**: Auditoría detallada de respuestas individuales (sábana de datos).
  - **Modo Informe**: Visión consolidada por empresa con métricas agregadas.
- **Visualización Avanzada**: Gráficos de Radar para identificar brechas en las micro-fundaciones.

### 3. Análisis Estratégico con IA
- **Matriz de Priorización**: Visualización interactiva de Impacto vs Esfuerzo.
- **Identificación de Casos de Uso**: Motor de IA (simulado en esta fase) que identifica y prioriza iniciativas:
  - **Quick Wins**: Ejemplo: Dashboards, Automatización de Facturación.
  - **Estratégicos**: Ejemplo: Predicción de Demanda, Mantenimiento Predictivo.
- **Hoja de Ruta Personalizada**: Acciones sugeridas basadas en el diagnóstico de las 7 micro-fundaciones.

### 4. Gestión y Configuración
- **Reorganización Modular**: Menú lateral jerarquizado para mejorar la experiencia de usuario.
- **Centro de Configuración Unificado**: Gestión de usuarios y seguridad agrupada en la sección de configuración.
- **Soporte Multi-tema**: Interfaz adaptativa (Dark/Light Mode) basada en las preferencias del sistema.

## Estructura del Proyecto

El proyecto es un monorepo dividido en:

- **`frontend/`**: Aplicación Next.js (React) con Tailwind CSS.
  - Pagina de Diagnóstico: `/diagnosis/[id]`
  - Tablero de Reportes: `/reports`
- **`backend/`**: Servidor Express.js con TypeScript y Prisma (PostgreSQL).
  - API RESTful en puerto 3001.
  - Base de datos gestionada con Prisma ORM.

## Configuración y Despliegue

### Requisitos Previo
- Node.js (v18+)
- PostgreSQL (o conexión a Supabase/Neon)

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push  # Sincronizar esquema
npm run dev         # Inicia en puerto 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # Inicia en puerto 3000
```

## Scripts de Utilidad (Backend)
- `npm run seed`: Poblar base de datos con información inicial.
- `npx tsx scripts/generate-test-data.ts`: Generar datos sintéticos avanzados (Empresas y Evaluaciones).

## Decisiones Técnicas Relevantes
- **Consolidación de Datos**: Los reportes se agrupan por nombre de empresa en el frontend para manejar registros históricos antes de la migración multi-tenant.
- **UI/UX**: Priorización del "Modo Informe" como vista predeterminada para facilitar la toma de decisiones ejecutivas.
- **Base de Datos**: Uso de pools de conexión optimizados y limpieza de registros huérfanos para mantener la integridad de la analítica.
- **Estética Premium**: Diseño basado en cristales (glassmorphism), micro-animaciones y tipografía moderna (Outfit/Inter).
