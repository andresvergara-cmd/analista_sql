# 🗄️ Arquitectura de Datos

> Plataforma de Diagnóstico de Madurez Digital — Kroh et al. 2020  
> Última actualización: Febrero 2026

---

## 1. Motor de Base de Datos

| Parámetro | Valor |
|-----------|-------|
| Motor | **PostgreSQL 17** |
| ORM | **Prisma 7.3** con adaptador `@prisma/adapter-pg` |
| Modo de conexión | Pool de conexiones (`pg.Pool`, max: 1 en dev) |
| Puerto local | `51214` |
| Base de datos | `template1` |
| Schema | `public` |
| Directorio de datos | `backend/pgdata/` |

---

## 2. Modelo Entidad-Relación (Completo)

```
┌──────────────┐        ┌──────────────────┐        ┌────────────────┐
│   Tenant     │        │    Assessment    │        │    Course      │
│─────────────│        │─────────────────│        │───────────────│
│ id (PK)      │◄──1:N──│ id (PK)          │──N:1──►│ id (PK)        │
│ name         │        │ title            │        │ name           │
│ createdAt    │        │ tenantId (FK)    │        │ createdAt      │
└──────────────┘        │ courseId (FK)    │        └────────────────┘
       │                │ questions (JSON) │
       │                │ createdAt        │
       │                └──────────────────┘
       │                         │
       │                       1:N
       │                         │
       │                         ▼
       │                ┌──────────────────┐        ┌────────────────┐
       │                │     Answer       │        │   Diagnosis    │
       │                │─────────────────│        │───────────────│
       │                │ id (PK)          │◄──1:1──│ id (PK)        │
       │                │ assessmentId(FK) │        │ assessmentId(FK)│
       │                │ studentName      │        │ studentEmail   │
       │                │ studentEmail     │        │ answerId (FK)  │
       │                │ respondentName   │        │ result (JSON)  │
       │                │ respondentPosition│       │ score (Float?) │
       │                │ respondentEmail  │        │ createdAt      │
       │                │ responses (JSON) │        └────────────────┘
       │                │ submittedAt      │                 │
       │                │ companyId (FK)   │               1:N
       │                └──────────────────┘                 │
       │                         │                           ▼
       │                         │                  ┌────────────────┐
       │                         │                  │    Report      │
       │                         │                  │───────────────│
       │                       N:1                  │ id (PK)        │
       │                         │                  │ diagnosisId(FK)│
       │                         ▼                  │ content        │
       │                ┌──────────────────┐        │ createdAt      │
       ├──────1:N───────│    Company       │        └────────────────┘
       │                │─────────────────│
       │                │ id (PK)          │
       │                │ name             │
       │                │ legalId          │
       │                │ sector           │
       │                │ size             │
       │                │ contactEmail     │
       │                │ contactPhone     │
       │                │ address          │
       │                │ city             │
       │                │ status           │
       │                │ tenantId (FK)    │
       │                │ createdAt        │
       │                └──────────────────┘
       │
       └──────1:N───────┌──────────────────┐
                        │      User        │
                        │─────────────────│
                        │ id (PK)          │
                        │ email (UNIQUE)   │
                        │ password         │
                        │ name             │
                        │ role             │
                        │ tenantId (FK)    │
                        │ createdAt        │
                        └──────────────────┘
```

---

## 3. Descripción Detallada de Entidades

### 3.1 `Tenant` — Tenant (Organización Administradora)

> Representa la organización que administra la plataforma (e.g., Universidad Icesi).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK, UUID | Identificador único del tenant |
| `name` | `String` | NOT NULL | Nombre del tenant |
| `createdAt` | `DateTime` | DEFAULT now() | Fecha de creación |

**Relaciones:**
- 1:N con `Assessment` (un tenant tiene muchas evaluaciones)
- 1:N con `Company` (un tenant administra muchas empresas)
- 1:N con `User` (un tenant tiene muchos usuarios)

**Datos iniciales (seed):**
```json
{
  "id": "default-tenant",
  "name": "Universidad Icesi - Administrador"
}
```

---

### 3.2 `User` — Usuarios del Sistema

> Administradores y facilitadores que acceden a la plataforma.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK, UUID | Identificador único |
| `email` | `String` | UNIQUE, NOT NULL | Correo electrónico (login) |
| `password` | `String` | NOT NULL | ⚠️ Texto plano — pendiente bcrypt |
| `name` | `String` | NOT NULL | Nombre completo |
| `role` | `String` | DEFAULT `"STUDENT"` | Rol: `SUPERADMIN`, `ADMIN`, `STUDENT` |
| `tenantId` | `String` | FK → Tenant | Tenant al que pertenece |
| `createdAt` | `DateTime` | DEFAULT now() | Fecha de creación |

**Roles definidos:**

| Rol | Descripción |
|-----|-------------|
| `SUPERADMIN` | Acceso completo. Gestión de tenants. |
| `ADMIN` | Gestión de organizaciones y reportes. |
| `STUDENT` | Acceso de solo lectura a sus propios diagnósticos. |

---

### 3.3 `Company` — Organizaciones Evaluadas

> Empresas o unidades organizacionales que son objeto de diagnóstico.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK, UUID | Identificador único |
| `name` | `String` | NOT NULL | Nombre comercial |
| `legalId` | `String` | NULL | NIT / ID Legal |
| `sector` | `String` | NULL | Sector industrial |
| `size` | `String` | NULL | Tamaño: Micro, Pyme, Mediana, Grande |
| `contactEmail` | `String` | NULL | Correo de contacto principal |
| `contactPhone` | `String` | NULL | Teléfono de contacto |
| `address` | `String` | NULL | Dirección física |
| `city` | `String` | NULL | Ciudad |
| `status` | `String` | DEFAULT `"Activo"` | Estado: Activo, Inactivo |
| `tenantId` | `String` | FK → Tenant | Tenant administrador |
| `createdAt` | `DateTime` | DEFAULT now() | Fecha de registro |

**Relaciones:**
- N:1 con `Tenant`
- 1:N con `Answer` (una empresa tiene muchos respondentes)

---

### 3.4 `Assessment` — Instrumentos de Evaluación

> Define los cuestionarios disponibles en la plataforma.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK | ID semántico (e.g., `"kroh-2020"`) |
| `title` | `String` | NOT NULL | Nombre del instrumento |
| `tenantId` | `String` | FK → Tenant | Tenant propietario |
| `courseId` | `String` | FK → Course, NULL | Curso asociado (opcional) |
| `questions` | `Json` | NOT NULL | Definición de preguntas (estructura flexible) |
| `createdAt` | `DateTime` | DEFAULT now() | Fecha de creación |

**Dato relevante:** El Assessment `kroh-2020` es el principal instrumento activo. Su ID semántico permite referenciarlo directamente sin consultar la base de datos.

---

### 3.5 `Course` — Cursos Académicos

> Agrupador opcional de evaluaciones para contextos educativos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK, UUID | Identificador único |
| `name` | `String` | NOT NULL | Nombre del curso |
| `createdAt` | `DateTime` | DEFAULT now() | Fecha de creación |

---

### 3.6 `Answer` — Respuestas de Evaluados

> Registro de una sesión completa de respuestas de un evaluado.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK, UUID | Identificador único |
| `assessmentId` | `String` | FK → Assessment | Instrumento respondido |
| `studentName` | `String` | NOT NULL | Nombre del evaluador/facilitador |
| `studentEmail` | `String` | NOT NULL | Email del evaluador |
| `respondentName` | `String` | NULL | Nombre del respondente (ejecutivo de la empresa) |
| `respondentPosition` | `String` | NULL | Cargo del respondente |
| `respondentEmail` | `String` | NULL | Email del respondente |
| `responses` | `Json` | NOT NULL | Mapa `{ itemId: valor }` |
| `submittedAt` | `DateTime` | DEFAULT now() | Fecha de envío |
| `companyId` | `String` | FK → Company, NULL | Empresa evaluada |

#### Estructura del campo `responses` (JSON)

```json
{
  "I3": 4,
  "I4": 3,
  "I5": 5,
  "I6": 4,
  "I7": 3,
  "I8": 4,
  "I9": 5,
  "I10": 4,
  "I11": 3,
  "I12": 4,
  "I13": 5,
  "I14": 4,
  "I17": 3,
  "I18": 4,
  "I19": 3,
  "I20": 5,
  "I22": 2,
  "I23": 3,
  "I24": 4,
  "I25": 3,
  "I26": 4,
  "I27": 5,
  "I28": 4,
  "I29": 3,
  "I30": 4,
  "I31": 3,
  "I32": 4,
  "I33": 3,
  "I34": 2,
  "I35": 3,
  "I36": 2,
  "I38": 3
}
```

**Notas:**
- Los valores son enteros del 1 al 5 (escala Likert)
- El ítem `I38` no existe en la secuencia porque el instrumento original de Kroh tiene un ítem numerado `I38` (omitiendo `I37`)
- Los ítems `I34`, `I35`, `I36`, `I38` corresponden a la dimensión `DIR` (Overcoming Resistance) y se aplica inversión: `6 - valor`

---

### 3.7 `Diagnosis` — Diagnóstico Calculado

> Resultado del análisis de madurez generado automáticamente al enviar respuestas.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK, UUID | Identificador único |
| `assessmentId` | `String` | FK → Assessment | Instrumento evaluado |
| `studentEmail` | `String` | NOT NULL | Email del evaluador |
| `answerId` | `String` | FK → Answer, UNIQUE, NULL | Respuesta origen (1:1) |
| `result` | `String` | NOT NULL | JSON serializado con foundations + insights |
| `score` | `Float` | NULL | Score global (0.0 – 5.0) |
| `createdAt` | `DateTime` | DEFAULT now() | Fecha de generación |

#### Estructura del campo `result` (JSON serializado como String)

```json
{
  "foundations": [
    {
      "id": "DIF",
      "name": "Digital Focus",
      "score": 80,
      "average": 4.0,
      "description": "Estrategia, metas y recursos asignados."
    },
    {
      "id": "DIP",
      "name": "Digital Innovation Process",
      "score": 90,
      "average": 4.5,
      "description": "Agilidad y flexibilidad en el desarrollo."
    },
    {
      "id": "DMI",
      "name": "Digital Mindset",
      "score": 85,
      "average": 4.25,
      "description": "Cultura y entendimiento compartido."
    },
    {
      "id": "DIN",
      "name": "Digital Innovation Network",
      "score": 70,
      "average": 3.5,
      "description": "Colaboración con socios externos y ecosistemas."
    },
    {
      "id": "DTC",
      "name": "Digital Tech Capability",
      "score": 82,
      "average": 4.1,
      "description": "Capacidad para identificar tecnologías clave."
    },
    {
      "id": "DMA",
      "name": "Data Management",
      "score": 78,
      "average": 3.9,
      "description": "Gestión operativa y coordinación de datos."
    },
    {
      "id": "DIR",
      "name": "Overcoming Resistance",
      "score": 92,
      "average": 4.6,
      "description": "Superación de barreras (Escala Invertida)."
    }
  ],
  "aiInsights": [
    { "type": "strength", "text": "Tu enfoque estratégico es sólido." },
    { "type": "warning",  "text": "Falta agilidad en los procesos." }
  ]
}
```

**Campos calculados por `kroh-logic.ts`:**
- `score` (%): `(average / 5) * 100` — Para barras de progreso en UI
- `average` (1-5): Promedio de ítems de la dimensión
- `score` global (Diagnosis.score): Promedio de las 7 dimensiones (1.0 – 5.0)

---

### 3.8 `Report` — Reportes Generados

> Reportes personalizados opcionales generados a partir de un diagnóstico.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| `id` | `String` | PK, UUID | Identificador único |
| `diagnosisId` | `String` | FK → Diagnosis | Diagnóstico origen |
| `content` | `String` | NOT NULL | Contenido del reporte (HTML/Markdown) |
| `createdAt` | `DateTime` | DEFAULT now() | Fecha de creación |

> **Nota:** Esta entidad está modelada pero aún no se genera contenido automáticamente. Se reserva para la funcionalidad de exportación PDF futura.

---

## 4. Mapeo Dimensiones Kroh → Ítems del Cuestionario

| Código | Dimensión | Ítems | Items Totales | Inversión |
|--------|-----------|-------|:---:|:---:|
| `DIF` | Digital Focus | I3, I4, I5, I6, I7, I8, I9, I10 | 8 | No |
| `DIP` | Digital Innovation Process | I11, I12, I13, I14 | 4 | No |
| `DMI` | Digital Mindset | I17, I18, I19, I20 | 4 | No |
| `DIN` | Digital Innovation Network | I22, I23, I24, I25 | 4 | No |
| `DTC` | Digital Tech Capability | I26, I27, I28, I29, I30 | 5 | No |
| `DMA` | Data Management | I31, I32, I33 | 3 | No |
| `DIR` | Overcoming Resistance | I34, I35, I36, I38 | 4 | **Sí** (6 - valor) |
| | **Total** | | **32** | |

**Nota sobre ítems faltantes:** Los ítems I1, I2, I15, I16, I21, I37 están omitidos del instrumento original de Kroh because son preguntas categóricas/demográficas, no ítems Likert de la escala de madurez.

---

## 5. Escala de Madurez Global

| Score Global | Nivel | Descripción |
|:---:|-------|-------------|
| 4.5 – 5.0 | 🥇 **Líder Digital** | Capacidades digitales diferenciadas y estrategia de vanguardia |
| 3.5 – 4.4 | 🥈 **Avanzado** | Fundamentos sólidos, en optimización continua |
| 2.5 – 3.4 | 🔄 **En Transformación Digital** | Proceso activo de cambio, algunas brechas importantes |
| 1.5 – 2.4 | 📈 **En Desarrollo** | Características básicas establecidas, plan de crecimiento necesario |
| 1.0 – 1.4 | 🔰 **Inicial** | Primeras etapas, alta oportunidad de mejora |

---

## 6. Flujo de Datos — Del Cuestionario al Reporte

```
[Formulario Web]
Respuestas crudas: { I3: 4, I4: 3, ..., I34: 2, ... }
        │
        │ POST /api/assessment/submit
        ▼
[Answer en BD]
responses (JSONB): almacenamiento fiel de respuestas crudas
        │
        ▼
[kroh-logic.ts: calculateKrohMaturity()]
Para cada dimensión:
  · Filtrar ítems correspondientes
  · Aplicar inversión si isInverse = true: (6 - valor)
  · Calcular promedio por dimensión (1–5)
  · Calcular porcentaje para UI (× 20)
Calcular promedio global → score: Float (1.0–5.0)
Clasificar → status: String
        │
        ▼
[Diagnosis en BD]
result (TEXT): JSON.stringify({ foundations[], aiInsights[] })
score (FLOAT8): promedio global
        │
        │ GET /api/diagnosis/:id
        ▼
[roadmap-generator.ts: generateRoadmap()]
Por dimensión:
  · Score < 50%  → Quick Wins (acciones fundacionales)
  · Score < 80%  → Mediano Plazo (aceleración)
  · Score ≥ 80%  → Largo Plazo (liderazgo)
        │
        ▼
[Respuesta API]
{ ...diagnosis, roadmap: RoadmapItem[] }
        │
        ▼
[Frontend: /diagnosis/:id]
  · Radar Chart (7 ejes con average 1-5)
  · Score global y nivel de madurez
  · Hoja de ruta por horizonte temporal
```

---

## 7. Índices y Restricciones de Integridad

### Índices (Implícitos por Prisma)

| Tabla | Campo | Tipo |
|-------|-------|------|
| `User` | `email` | UNIQUE |
| `Diagnosis` | `answerId` | UNIQUE (relación 1:1) |
| Todas | `id` | PRIMARY KEY |

### Foreign Keys con Cascada

| Tabla Hijo | FK | Tabla Padre | Comportamiento |
|------------|-----|------------|----------------|
| `Assessment` | `tenantId` | `Tenant` | RESTRICT (no borrar tenant con assessments) |
| `Company` | `tenantId` | `Tenant` | RESTRICT |
| `User` | `tenantId` | `Tenant` | RESTRICT |
| `Answer` | `assessmentId` | `Assessment` | RESTRICT |
| `Answer` | `companyId` | `Company` | SET NULL |
| `Diagnosis` | `answerId` | `Answer` | SET NULL |
| `Diagnosis` | `assessmentId` | `Assessment` | RESTRICT |
| `Report` | `diagnosisId` | `Diagnosis` | RESTRICT |

---

## 8. Estrategia de Seed y Datos de Prueba

### Seed Base (`prisma/seed.ts`)

```
Tenant (default-tenant)
  └── User (admin@icesi.edu.co, SUPERADMIN)
  └── Company (Pyme Alpha Logistics)
  └── Assessment (kroh-2020)
        └── Answer (Juan Pérez, Gerente TI)
              └── Diagnosis (score: 4.2, foundations completo)
```

### Generación de Datos Sintéticos (`scripts/generate-test-data.ts`)

Genera datos avanzados con múltiples empresas y respondentes por empresa para probar los reportes consolidados y el análisis de brecha perceptual.

### Comando de Seed

```bash
cd backend
npx prisma db seed
# Equivale a: ts-node prisma/seed.ts
```

---

## 9. Consideraciones para Evolución del Esquema

### Multi-tenancy Real
Actualmente todos los registros usan `tenantId: "default-tenant"`. Para habilitar multi-tenancy real:
1. Agregar `tenantId` como filtro obligatorio en todos los queries de la API.
2. Implementar middleware de autenticación que inyecte el `tenantId` desde el JWT.

### Versionado de Instrumento
El campo `questions` en `Assessment` es `Json`, lo que permite evolucionar el cuestionario sin migración de schema. Sin embargo, las respuestas en `Answer.responses` quedan ligadas a la versión del instrumento en el momento de respuesta.

### Análisis Histórico
Para tendencias temporales, se puede:
- Comparar `Answer.submittedAt` entre evaluaciones de la misma empresa.
- Calcular `Diagnosis.score` promedios por trimestre/año con queries sobre `createdAt`.

### Escalabilidad del campo `result`
El campo `Diagnosis.result` es `String` (TEXT) con JSON serializado. Si el volumen crece, migrar a tipo `Json` nativo de PostgreSQL para aprovechar índices GIN sobre el JSONB.
