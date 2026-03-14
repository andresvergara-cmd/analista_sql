# Arquitectura Multi-Agente para Módulo de Consulta SQL

**Versión:** 1.0
**Fecha:** 14 de Marzo, 2026
**Estado:** Diseño Técnico

---

## 1. Resumen Ejecutivo

Este documento define la arquitectura de un sistema multi-agente especializado para transformar el módulo de consulta SQL de "Agente Analista SQL" en un sistema inteligente capaz de:

- Entender lenguaje natural con alta precisión
- Generar SQL válido y seguro
- Crear visualizaciones automáticas apropiadas
- Validar resultados y garantizar calidad
- Optimizar rendimiento de consultas

**Paradigma**: Orquestación de agentes especializados con integración MCP (Model Context Protocol)

---

## 2. Arquitectura General del Sistema

### 2.1 Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /query/page.tsx - Interfaz de Usuario                   │  │
│  │  - Input: Consulta en lenguaje natural                   │  │
│  │  - Output: SQL + Tabla + Gráfico + Explicación          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▼ HTTP POST /api/query
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express 5 + Node.js)                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           ORQUESTADOR PRINCIPAL (Orchestrator)           │  │
│  │  - Recibe consulta del usuario                           │  │
│  │  - Coordina flujo entre 6 agentes especializados        │  │
│  │  - Gestiona estado de conversación multi-turno          │  │
│  │  - Retorna resultado consolidado                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▼                                  │
│  ┌────────────────────┬────────────────────┬─────────────────┐ │
│  │  AGENTE 1:         │  AGENTE 2:         │  AGENTE 3:      │ │
│  │  Usuario Final     │  Ingeniero IA      │  Arq. Solución  │ │
│  │  (Interpretación)  │  (NL-to-SQL)       │  (Planificación)│ │
│  └────────────────────┴────────────────────┴─────────────────┘ │
│  ┌────────────────────┬────────────────────┬─────────────────┐ │
│  │  AGENTE 4:         │  AGENTE 5:         │  AGENTE 6:      │ │
│  │  Arq. Datos        │  QA Engineer       │  Fullstack Dev  │ │
│  │  (Optimización SQL)│  (Validación)      │  (Visualización)│ │
│  └────────────────────┴────────────────────┴─────────────────┘ │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              CAPA DE INTEGRACION MCP                      │  │
│  │  - MCP Client (protocolo Anthropic)                      │  │
│  │  - Conectores a servidores MCP externos                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ▼                                  │
│  ┌───────────────┬──────────────┬──────────────┬────────────┐ │
│  │ MCP: Fabi     │ MCP: DuckDB  │ MCP: Plotly  │ Gemini API │ │
│  │ (SQL Analyst) │ (Query Exec) │ (Charts)     │ (LLM)      │ │
│  └───────────────┴──────────────┴──────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE DATOS (PostgreSQL 17)                 │
│  - Tablas: Company, Answer, Diagnosis, Assessment              │
│  - ORM: Prisma Client                                           │
│  - Pool de conexiones gestionado                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Principios de Diseño

1. **Separación de Responsabilidades**: Cada agente tiene un rol claramente definido
2. **Comunicación Asíncrona**: Agentes se comunican via message passing con timeouts
3. **Tolerancia a Fallos**: Fallback a comportamiento base si agente falla
4. **Trazabilidad**: Logging completo de decisiones de cada agente
5. **Escalabilidad**: Arquitectura permite agregar nuevos agentes sin cambios mayores
6. **Seguridad**: Validación multi-capa antes de ejecutar SQL

---

## 3. Definición de Agentes Especializados

### 3.1 AGENTE 1: Usuario Final (User Proxy Agent)

**Rol**: Interfaz humano-sistema y refinamiento de intención

**Responsabilidades**:
- Interpretar la consulta en lenguaje natural del usuario
- Identificar ambigüedades o términos poco claros
- Solicitar aclaraciones cuando sea necesario
- Reformular la consulta en formato estructurado para otros agentes
- Validar que la respuesta final sea comprensible para usuarios no técnicos

**Input**:
```typescript
{
  query: string;              // "Muéstrame las empresas con peor madurez digital"
  companyId: string;          // UUID de empresa seleccionada
  userId: string;             // Usuario autenticado
  conversationHistory?: Message[];  // Contexto de conversación previa
}
```

**Output**:
```typescript
{
  refinedQuery: string;       // "Listar empresas ordenadas por globalScore ascendente"
  entities: {                 // Entidades identificadas
    metric: 'globalScore',
    ordering: 'asc',
    limit: 10
  },
  clarificationNeeded: boolean;
  suggestedClarifications?: string[];
}
```

**Tecnología**:
- LLM: Gemini 1.5 Flash (rápido, económico)
- Prompt engineering con few-shot examples

**Ejemplo de Prompt**:
```
Eres un agente que interpreta consultas de usuarios sobre madurez digital organizacional.

Schema disponible:
- Company: name, sector, size
- Answer: respondentName, respondentPosition, responses (JSON)
- Diagnosis: score, result (JSON con foundations/dimensions)

Consulta del usuario: "{query}"

Extrae:
1. Intención principal (listar, comparar, filtrar, agregar)
2. Entidades mencionadas (dimensión, empresa, cargo)
3. Filtros implícitos (ej: "peor" = ordenar por score asc)
4. Ambigüedades detectadas

Responde en JSON.
```

---

### 3.2 AGENTE 2: Ingeniero de IA (AI Engineer Agent)

**Rol**: Generación de SQL desde lenguaje natural

**Responsabilidades**:
- Convertir consulta refinada en SQL válido
- Inyectar schema de base de datos en contexto
- Generar consultas parametrizadas (prevenir SQL injection)
- Manejar consultas complejas con JOINs, subconsultas, CTEs
- Proporcionar SQL explicado paso a paso

**Input**:
```typescript
{
  refinedQuery: string;       // De Agente 1
  entities: Record<string, any>;
  dbSchema: DatabaseSchema;   // Inyectado por orquestador
  securityConstraints: {      // Validaciones de seguridad
    allowedTables: string[];
    allowedOperations: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
    maxRowsReturned: number;
  }
}
```

**Output**:
```typescript
{
  sql: string;                // Query SQL generado
  parameters: any[];          // Parámetros para prepared statement
  explanation: string;        // Explicación en lenguaje natural del SQL
  estimatedComplexity: 'low' | 'medium' | 'high';
  usedTables: string[];
  warnings?: string[];        // Ej: "Query puede ser lento en tablas grandes"
}
```

**Tecnología**:
- LLM: Gemini 1.5 Pro (mejor comprensión de schemas complejos)
- Schema injection vía prompt
- Validación sintáctica con `pg-query-parser` (opcional)

**Prompt Template**:
```
Eres un experto en PostgreSQL 17 y Prisma ORM.

DATABASE SCHEMA:
{prismaSchema}

USER QUERY (refinada): {refinedQuery}
ENTITIES: {entities}

CONSTRAINTS:
- Solo SELECT permitido
- Máximo 1000 filas
- Solo tablas: {allowedTables}

Genera:
1. SQL query parametrizado (usa $1, $2 para valores)
2. Array de parámetros
3. Explicación en español del query
4. Estimación de complejidad

Responde SOLO en JSON con: { sql, parameters, explanation, estimatedComplexity }
```

**Integración MCP**:
- **MCP Server: Fabi** (https://github.com/contextco/fabi-mcp)
  - Fabi es un agente analista que genera SQL/Python seguro
  - Puede complementar la generación de SQL con validación adicional

---

### 3.3 AGENTE 3: Arquitecto de Solución (Solution Architect Agent)

**Rol**: Planificación y optimización del flujo de ejecución

**Responsabilidades**:
- Decidir estrategia de ejecución (query directo vs múltiples queries)
- Identificar si se necesita caché o cómputo previo
- Determinar si query requiere agregación post-procesamiento
- Seleccionar tipo de visualización apropiada
- Gestionar fallbacks si query falla

**Input**:
```typescript
{
  sqlQuery: string;           // De Agente 2
  estimatedComplexity: string;
  userIntent: string;         // De Agente 1
}
```

**Output**:
```typescript
{
  executionPlan: {
    strategy: 'direct' | 'cached' | 'multi-step';
    steps: {
      order: number;
      action: string;         // "execute_sql", "aggregate_results", "cache_result"
      params: any;
    }[];
  },
  visualizationStrategy: {
    primaryChartType: 'table' | 'bar' | 'line' | 'pie' | 'radar' | 'scatter';
    fallbackChartType: 'table';
    chartConfig: Record<string, any>;  // Config específico para librería
  },
  cacheKey?: string;          // Si debe cachear resultado
  ttl?: number;               // Tiempo de vida del cache (segundos)
}
```

**Tecnología**:
- LLM: Gemini 1.5 Flash
- Reglas heurísticas + ML para decisión de caché
- Análisis de patterns históricos de queries

**Lógica de Decisión (Pseudocódigo)**:
```typescript
if (queryHistory.includes(similarQuery) && dataNotChanged) {
  return { strategy: 'cached', cacheKey: hash(query) };
}

if (estimatedComplexity === 'high' && canDecompose(query)) {
  return {
    strategy: 'multi-step',
    steps: decomposeQuery(query)
  };
}

const chartType = inferChartType(userIntent, queryColumns);
return {
  strategy: 'direct',
  visualizationStrategy: { primaryChartType: chartType }
};
```

---

### 3.4 AGENTE 4: Arquitecto de Datos (Data Architect Agent)

**Rol**: Optimización de consultas y gestión de esquema

**Responsabilidades**:
- Analizar y optimizar SQL generado
- Sugerir índices para mejorar performance
- Detectar N+1 queries o problemas de rendimiento
- Validar que query respete mejores prácticas
- Gestionar transformaciones de datos post-query

**Input**:
```typescript
{
  sql: string;                // SQL a optimizar
  dbSchema: DatabaseSchema;
  executionPlan: ExecutionPlan;  // De Agente 3
  historicalMetrics?: {       // Opcional: métricas de queries previos
    avgExecutionTime: number;
    rowsScanned: number;
  }
}
```

**Output**:
```typescript
{
  optimizedSql: string;       // SQL optimizado (puede ser igual si ya es óptimo)
  optimizations: {
    type: 'index_suggestion' | 'query_rewrite' | 'none';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  estimatedPerformance: {
    expectedExecutionTime: number;  // ms
    rowsToScan: number;
    usesCoveredIndex: boolean;
  },
  dataTransformations?: {     // Transformaciones post-query necesarias
    type: 'aggregate' | 'pivot' | 'normalize';
    config: any;
  }[]
}
```

**Tecnología**:
- PostgreSQL `EXPLAIN ANALYZE` para estimaciones
- LLM: Gemini 1.5 Pro para sugerencias de optimización
- Librería: `pgsql-ast-parser` para análisis AST del SQL

**Ejemplo de Optimización**:
```typescript
// SQL Original (Agente 2):
SELECT c.name, AVG(d.score)
FROM "Company" c
JOIN "Answer" a ON a."companyId" = c.id
JOIN "Diagnosis" d ON d."answerId" = a.id
GROUP BY c.name;

// SQL Optimizado (Agente 4):
WITH company_scores AS (
  SELECT
    c.id,
    c.name,
    AVG(d.score) FILTER (WHERE d.score IS NOT NULL) as avg_score
  FROM "Company" c
  LEFT JOIN "Answer" a ON a."companyId" = c.id
  LEFT JOIN "Diagnosis" d ON d."answerId" = a.id
  WHERE c."tenantId" = $1  -- Filtro temprano
  GROUP BY c.id, c.name
)
SELECT name, avg_score
FROM company_scores
WHERE avg_score IS NOT NULL;

// Optimizaciones aplicadas:
// 1. Agregado filtro por tenantId temprano (reduce rows escaneadas)
// 2. Cambiado a LEFT JOIN para capturar empresas sin diagnósticos
// 3. Agregado FILTER clause para ignorar NULL en promedio
// 4. CTE para mejor legibilidad y potencial caching de subresultado
```

**Integración MCP**:
- **MCP Server: DuckDB** (https://github.com/MotherDuck-Open-Source/mcp-server-duckdb)
  - DuckDB para SQL analytics ultrarrápido con engine OLAP
  - Puede ejecutar queries analíticos 10-100x más rápido que PostgreSQL
  - Útil para queries complejos de agregación

---

### 3.5 AGENTE 5: QA Engineer (Quality Assurance Agent)

**Rol**: Validación exhaustiva antes de ejecución

**Responsabilidades**:
- Validar sintaxis SQL final
- Detectar vulnerabilidades de seguridad (SQL injection, mass assignment)
- Simular ejecución en entorno sandbox
- Validar que resultados esperados coincidan con intención del usuario
- Aprobar o rechazar query para ejecución en producción

**Input**:
```typescript
{
  originalQuery: string;      // Query original del usuario
  refinedQuery: string;       // Query refinada (Agente 1)
  sql: string;                // SQL optimizado (Agente 4)
  parameters: any[];
  userPermissions: {
    role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT';
    companyAccess: string[];
  }
}
```

**Output**:
```typescript
{
  approved: boolean;
  validationResults: {
    syntaxValid: boolean;
    securityScore: number;    // 0-100 (100 = totalmente seguro)
    vulnerabilities: {
      type: 'sql_injection' | 'unauthorized_access' | 'resource_exhaustion';
      severity: 'critical' | 'high' | 'medium' | 'low';
      description: string;
    }[];
    permissionsValid: boolean;
  },
  sandboxResults?: {          // Resultados de ejecución en sandbox
    rowCount: number;
    executionTime: number;
    sampleRows: any[];        // Primeras 3 filas
  },
  rejectionReason?: string;   // Si approved = false
}
```

**Tecnología**:
- Librería: `sqlstring` para escape de valores
- Librería: `node-sql-parser` para validación sintáctica
- Sandbox: Docker container con PostgreSQL en modo readonly
- LLM: Gemini 1.5 Flash para detectar patrones maliciosos

**Proceso de Validación**:
```typescript
// 1. Validación Sintáctica
const ast = parseSql(sql);
if (!ast || ast.errors.length > 0) {
  return { approved: false, rejectionReason: 'Invalid SQL syntax' };
}

// 2. Validación de Seguridad
const securityChecks = [
  checkSqlInjection(sql, parameters),    // Regex patterns + AST analysis
  checkUnauthorizedTables(ast, allowedTables),
  checkDangerousOperations(ast),         // DROP, DELETE, UPDATE
  checkResourceExhaustion(ast)           // LIMIT verificado, no CROSS JOIN
];

// 3. Ejecución en Sandbox (con timeout de 5s)
const sandboxResult = await executeSqlInSandbox(sql, parameters, {
  timeout: 5000,
  maxRows: 100
});

// 4. Validación de Resultados
if (sandboxResult.rowCount === 0 && userExpectsData) {
  return {
    approved: true,  // Técnicamente válido
    warning: 'Query returned no results - verify filters'
  };
}

return { approved: true, validationResults: {...} };
```

**Criterios de Rechazo**:
- SQL syntax inválido
- Security score < 70
- Vulnerabilidad de severidad 'critical'
- Ejecución sandbox > 10s (timeout)
- Sandbox retorna error de PostgreSQL
- Usuario sin permisos para tabla accedida

---

### 3.6 AGENTE 6: Fullstack Developer (Visualization Agent)

**Rol**: Generación de visualizaciones y presentación de resultados

**Responsabilidades**:
- Ejecutar SQL aprobado contra base de datos real
- Transformar datos en formato apropiado para visualización
- Generar configuración de gráficos (Recharts config)
- Crear explicaciones textuales de insights encontrados
- Formatear respuesta final para frontend

**Input**:
```typescript
{
  sql: string;                // SQL validado y aprobado
  parameters: any[];
  visualizationStrategy: VisualizationStrategy;  // De Agente 3
  dataTransformations: DataTransformation[];     // De Agente 4
}
```

**Output**:
```typescript
{
  queryResult: {
    sql: string;              // SQL ejecutado (para display)
    rows: any[];              // Datos raw
    rowCount: number;
    executionTime: number;    // ms
  },
  visualization: {
    type: 'table' | 'bar' | 'line' | 'pie' | 'radar' | 'scatter';
    data: any[];              // Datos transformados para gráfico
    config: {                 // Configuración Recharts
      xAxis?: { dataKey: string; label: string };
      yAxis?: { label: string };
      series?: { dataKey: string; name: string; color: string }[];
      // ... más configuración según tipo de gráfico
    };
    chartHtml?: string;       // HTML del gráfico renderizado (para PDF export)
  },
  insights: {
    summary: string;          // Ej: "Se encontraron 12 empresas con madurez digital baja"
    keyFindings: string[];    // Ej: ["DIF es la dimensión más débil en promedio"]
    recommendations?: string[]; // Sugerencias basadas en resultados
  },
  explanation: string;        // Explicación completa en lenguaje natural
}
```

**Tecnología**:
- **Recharts** (librería de gráficos React)
- **Plotly.js** vía MCP para gráficos interactivos avanzados
- LLM: Gemini 1.5 Flash para generar insights textuales

**Integración MCP**:
- **MCP Server: Plotly** (https://github.com/modelcontextprotocol/servers/tree/main/src/charting)
  - Crea gráficos interactivos HTML con Plotly.js
  - Exportable a PNG/SVG para reportes
  - Configuración declarativa vía JSON

**Proceso de Generación de Visualización**:
```typescript
// 1. Ejecutar SQL
const startTime = Date.now();
const result = await prisma.$queryRawUnsafe(sql, ...parameters);
const executionTime = Date.now() - startTime;

// 2. Aplicar transformaciones de datos
let transformedData = result;
for (const transform of dataTransformations) {
  transformedData = applyTransformation(transformedData, transform);
}

// 3. Inferir tipo de gráfico si no especificado
const chartType = visualizationStrategy.primaryChartType ||
                  inferChartType(transformedData);

// 4. Generar configuración del gráfico
const chartConfig = generateChartConfig(chartType, transformedData);

// 5. Usar MCP Plotly para generar HTML interactivo
const plotlyResult = await mcpClient.callTool('plotly', 'create_chart', {
  data: transformedData,
  type: chartType,
  config: chartConfig
});

// 6. Generar insights con LLM
const insights = await generateInsights(transformedData, originalQuery);

return {
  queryResult: { sql, rows: result, rowCount: result.length, executionTime },
  visualization: { type: chartType, data: transformedData, config: chartConfig },
  insights
};
```

**Ejemplos de Transformación de Datos**:

```typescript
// Ejemplo 1: Datos para gráfico de barras (promedio por dimensión)
// SQL result:
[
  { dimension: 'Digital Focus', average: 3.2 },
  { dimension: 'Digital Mindset', average: 2.8 }
]

// Recharts config:
{
  type: 'bar',
  data: result,  // Sin transformación necesaria
  config: {
    xAxis: { dataKey: 'dimension', label: 'Dimensión' },
    yAxis: { label: 'Promedio (0-5)' },
    series: [{ dataKey: 'average', name: 'Puntaje Promedio', fill: '#3b82f6' }]
  }
}

// Ejemplo 2: Datos para radar chart (perfil de madurez)
// SQL result:
[
  { dimension: 'DIF', score: 64 },
  { dimension: 'DIP', score: 48 },
  ...
]

// Transformación: Normalizar a escala 0-100 y agregar fullMark
{
  type: 'radar',
  data: result.map(r => ({ ...r, fullMark: 100 })),
  config: {
    angleKey: 'dimension',
    radiusKey: 'score',
    maxValue: 100
  }
}
```

---

## 4. Flujo de Comunicación Entre Agentes

### 4.1 Secuencia de Ejecución (Flujo Happy Path)

```
Usuario → Frontend → POST /api/query
                      ▼
                 ORQUESTADOR
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
AGENTE 1          AGENTE 3          AGENTE 2
(Usuario)        (Arquitecto)      (IA Engineer)
Interpretación   En paralelo       NL-to-SQL
    │                 │                 │
    └────────►┌───────┴─────────┐◄─────┘
              │  ORQUESTADOR    │
              │  Consolidación  │
              └─────────┬───────┘
                        ▼
              ┌─────────────────┐
              │   AGENTE 4      │
              │ (Arq. Datos)    │
              │ Optimización    │
              └─────────┬───────┘
                        ▼
              ┌─────────────────┐
              │   AGENTE 5      │
              │     (QA)        │
              │  Validación     │
              └─────────┬───────┘
                        ▼
                   ¿Aprobado?
                 ┌──────┴──────┐
                No             Sí
                 │              │
            Rechazar         ┌──┴──────┐
            con error        │ AGENTE 6│
                             │(Fullstack)│
                             │Ejecución │
                             └─────┬───┘
                                   ▼
                             Resultado Final
                                   ▼
                             Frontend Display
```

### 4.2 Protocolo de Mensajes

**Formato estándar de comunicación**:
```typescript
interface AgentMessage {
  from: AgentRole;
  to: AgentRole | 'orchestrator';
  type: 'request' | 'response' | 'error';
  timestamp: number;
  conversationId: string;     // UUID para trazabilidad
  payload: any;               // Específico de cada agente
  metadata?: {
    executionTime?: number;
    tokensUsed?: number;      // Si usa LLM
    cacheHit?: boolean;
  }
}

type AgentRole =
  | 'user_proxy'
  | 'ai_engineer'
  | 'solution_architect'
  | 'data_architect'
  | 'qa_engineer'
  | 'fullstack_dev';
```

**Ejemplo de mensaje real**:
```typescript
// Orquestador → Agente 1 (User Proxy)
{
  from: 'orchestrator',
  to: 'user_proxy',
  type: 'request',
  timestamp: 1710432000000,
  conversationId: 'conv-abc123',
  payload: {
    query: "Muéstrame las empresas con peor madurez digital",
    companyId: "uuid-empresa",
    userId: "uuid-user"
  }
}

// Agente 1 → Orquestador
{
  from: 'user_proxy',
  to: 'orchestrator',
  type: 'response',
  timestamp: 1710432001200,
  conversationId: 'conv-abc123',
  payload: {
    refinedQuery: "Listar empresas ordenadas por globalScore ascendente",
    entities: {
      metric: 'globalScore',
      ordering: 'asc',
      limit: 10
    },
    clarificationNeeded: false
  },
  metadata: {
    executionTime: 1200,
    tokensUsed: 450
  }
}
```

### 4.3 Manejo de Errores

**Estrategia de tolerancia a fallos**:
1. **Timeout**: Cada agente tiene timeout de 30s
2. **Retry**: Máximo 2 reintentos con exponential backoff
3. **Fallback**: Si agente especializado falla, usar lógica simplificada
4. **Circuit Breaker**: Si agente falla >80% en últimos 10 requests, desactivar temporalmente

**Ejemplo de fallback**:
```typescript
// Si Agente 2 (IA Engineer) falla en generar SQL
try {
  const sqlResult = await aiEngineerAgent.generateSql(input);
} catch (error) {
  logger.error('AI Engineer agent failed, falling back to pattern-based');
  // Fallback: Usar query-engine.ts original (basado en regex)
  const sqlResult = await legacyQueryEngine.executeNaturalQuery(
    input.query,
    input.companyId
  );
}
```

---

## 5. Integración de Servidores MCP

### 5.1 ¿Qué es MCP (Model Context Protocol)?

MCP es un protocolo estándar abierto introducido por Anthropic para conectar modelos LLM con herramientas externas y fuentes de datos de forma segura y estandarizada.

**Beneficios**:
- Interoperabilidad entre diferentes LLMs (Gemini, Claude, GPT)
- Reutilización de servidores desarrollados por la comunidad
- Seguridad via sandboxing y validación de herramientas
- Escalabilidad horizontal

### 5.2 MCPs Recomendados para Integración

#### MCP 1: Fabi (SQL Analyst Agent)

**Repositorio**: https://github.com/contextco/fabi-mcp
**Funcionalidad**: Agente analista que genera SQL/Python seguro desde lenguaje natural

**Uso en arquitectura**:
- Complementar o validar SQL generado por Agente 2 (AI Engineer)
- Proporcionar segunda opinión en queries complejos
- Generar código Python para transformaciones avanzadas

**Instalación**:
```bash
npm install @context.co/fabi-mcp
```

**Configuración**:
```typescript
import { FabiMCPClient } from '@context.co/fabi-mcp';

const fabiClient = new FabiMCPClient({
  apiKey: process.env.FABI_API_KEY,
  schema: prismaSchemaString  // Inyectar schema de Prisma
});

// Uso en Agente 2
const fabiResult = await fabiClient.generateQuery({
  question: refinedQuery,
  dialect: 'postgresql',
  securityMode: 'strict'
});

console.log(fabiResult.sql);      // Query SQL generado
console.log(fabiResult.confidence);  // Score 0-1 de confianza
```

#### MCP 2: DuckDB (Fast SQL Analytics)

**Repositorio**: https://github.com/MotherDuck-Open-Source/mcp-server-duckdb
**Funcionalidad**: Motor OLAP ultrarrápido para queries analíticos

**Uso en arquitectura**:
- Ejecutar queries de agregación complejos (GROUP BY, WINDOW functions)
- Análisis ad-hoc de datasets grandes sin impactar PostgreSQL producción
- Exportar resultados a Parquet/CSV para ML pipelines

**Instalación**:
```bash
npm install @motherduck/mcp-duckdb
```

**Configuración**:
```typescript
import { DuckDBMCPClient } from '@motherduck/mcp-duckdb';

const duckClient = new DuckDBMCPClient({
  mode: 'memory',  // In-memory database (ultra rápido)
  extensions: ['json', 'postgres_scanner']
});

// Cargar datos desde PostgreSQL
await duckClient.execute(`
  INSTALL postgres_scanner;
  LOAD postgres_scanner;

  CREATE TABLE companies AS
  SELECT * FROM postgres_scan('${postgresConnectionString}', 'public', 'Company');
`);

// Ejecutar query analítico en DuckDB (mucho más rápido que Postgres)
const result = await duckClient.query(`
  SELECT
    sector,
    AVG(diagnosis_score) as avg_score,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY diagnosis_score) as median_score
  FROM companies_with_scores
  GROUP BY sector
  ORDER BY avg_score DESC
`);
```

**Cuándo usar DuckDB vs PostgreSQL**:
- **PostgreSQL**: Queries transaccionales, escrituras, < 10K filas
- **DuckDB**: Queries analíticos, agregaciones complejas, > 10K filas

#### MCP 3: Plotly (Charting & Visualization)

**Repositorio**: https://github.com/modelcontextprotocol/servers/tree/main/src/charting
**Funcionalidad**: Generación de gráficos interactivos con Plotly.js

**Uso en arquitectura**:
- Generar gráficos desde Agente 6 (Fullstack Dev)
- Exportar charts a PNG/SVG para PDFs
- Crear dashboards interactivos

**Instalación**:
```bash
npm install @modelcontextprotocol/server-charting
```

**Configuración**:
```typescript
import { PlotlyMCPClient } from '@modelcontextprotocol/server-charting';

const plotlyClient = new PlotlyMCPClient();

// Generar gráfico de barras
const chartHtml = await plotlyClient.createChart({
  type: 'bar',
  data: [{
    x: ['DIF', 'DIP', 'DMI', 'DIN', 'DTC', 'DMA', 'DIR', 'AIA'],
    y: [64, 48, 72, 56, 80, 45, 38, 52],
    type: 'bar',
    marker: { color: '#3b82f6' }
  }],
  layout: {
    title: 'Madurez Digital por Dimensión',
    xaxis: { title: 'Dimensión' },
    yaxis: { title: 'Puntaje (0-100)' },
    font: { family: 'Inter, sans-serif' }
  }
});

// chartHtml es un string HTML completo con el gráfico interactivo
// Puede embeberse en respuesta o convertirse a PNG con Puppeteer
```

### 5.3 Arquitectura de Cliente MCP Unificado

**Implementación en backend**:
```typescript
// /backend/src/utils/mcp-client.ts
import { FabiMCPClient } from '@context.co/fabi-mcp';
import { DuckDBMCPClient } from '@motherduck/mcp-duckdb';
import { PlotlyMCPClient } from '@modelcontextprotocol/server-charting';

export class UnifiedMCPClient {
  private fabi: FabiMCPClient;
  private duckdb: DuckDBMCPClient;
  private plotly: PlotlyMCPClient;

  constructor() {
    this.fabi = new FabiMCPClient({
      apiKey: process.env.FABI_API_KEY,
      schema: process.env.PRISMA_SCHEMA
    });

    this.duckdb = new DuckDBMCPClient({ mode: 'memory' });
    this.plotly = new PlotlyMCPClient();
  }

  async generateSql(query: string, schema: string): Promise<any> {
    return this.fabi.generateQuery({ question: query, schema });
  }

  async executeAnalyticQuery(sql: string): Promise<any> {
    return this.duckdb.query(sql);
  }

  async createVisualization(config: any): Promise<string> {
    return this.plotly.createChart(config);
  }

  async healthCheck(): Promise<Record<string, boolean>> {
    return {
      fabi: await this.fabi.ping(),
      duckdb: await this.duckdb.ping(),
      plotly: await this.plotly.ping()
    };
  }
}

export const mcpClient = new UnifiedMCPClient();
```

---

## 6. Stack Tecnológico Actualizado

### 6.1 Backend

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "express": "^5.2.1",
    "express-rate-limit": "^8.3.1",
    "helmet": "^8.1.0",
    "zod": "^4.3.6",
    "jsonwebtoken": "^9.0.3",

    // LLM Integration
    "@google/generative-ai": "^0.21.0",  // Gemini API

    // MCP Servers
    "@context.co/fabi-mcp": "^1.0.0",
    "@motherduck/mcp-duckdb": "^0.3.0",
    "@modelcontextprotocol/server-charting": "^0.2.0",

    // SQL Parsing & Validation
    "node-sql-parser": "^5.3.0",
    "sqlstring": "^2.3.3",
    "pg-query-parser": "^1.4.0",

    // Visualization
    "recharts": "^2.15.0",
    "plotly.js": "^2.35.0",

    // Caching
    "ioredis": "^5.4.1",           // Redis client

    // Utilities
    "uuid": "^11.0.6",
    "winston": "^3.18.1"           // Logging
  }
}
```

### 6.2 Frontend

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",

    // Visualización
    "recharts": "^2.15.0",         // Gráficos React nativos
    "react-plotly.js": "^2.6.0",   // Wrapper de Plotly para React
    "plotly.js": "^2.35.0",

    // UI Components
    "react-hot-toast": "^2.6.0",
    "@headlessui/react": "^2.2.0", // Componentes accesibles

    // Code Highlighting (para mostrar SQL generado)
    "react-syntax-highlighter": "^16.0.1",

    // Export
    "html2pdf.js": "^0.14.0"
  }
}
```

### 6.3 Infraestructura

**Base de Datos**:
- PostgreSQL 17 (Producción: Railway/Vercel Postgres)
- Redis 7.2 (Cache de queries, sessions)
  - Hosted: Upstash Redis (serverless, compatible con Vercel)

**Deployment**:
- Frontend: Vercel (Next.js 16 con App Router)
- Backend: Railway / Render (Node.js + Express)
- MCP Servers: Pueden ejecutarse en mismo backend o servicios externos

**Monitoreo**:
- Logging: Winston + Datadog
- Metrics: Prometheus + Grafana
- APM: New Relic (opcional)

---

## 7. Plan de Implementación por Fases

### FASE 1: Fundamentos (Sprint 1-2, 2 semanas)

**Objetivos**:
- Crear infraestructura base de orquestación multi-agente
- Integrar Gemini API para procesamiento de lenguaje natural
- Implementar Agente 1 (User Proxy) y Agente 2 (AI Engineer)

**Entregables**:
1. `/backend/src/agents/orchestrator.ts` - Orquestador principal
2. `/backend/src/agents/user-proxy.agent.ts` - Agente 1
3. `/backend/src/agents/ai-engineer.agent.ts` - Agente 2
4. `/backend/src/utils/gemini-client.ts` - Cliente de Gemini
5. Actualizar endpoint `POST /api/query` para usar orquestador
6. Tests unitarios para cada agente

**Criterios de Éxito**:
- Query en lenguaje natural → SQL generado (aunque no optimizado aún)
- Tasa de éxito > 70% en queries simples
- Tiempo de respuesta < 5s

---

### FASE 2: Optimización y Validación (Sprint 3-4, 2 semanas)

**Objetivos**:
- Implementar Agente 4 (Data Architect) y Agente 5 (QA)
- Agregar validación de seguridad y optimización de queries
- Integrar MCP Fabi para validación de SQL

**Entregables**:
1. `/backend/src/agents/data-architect.agent.ts` - Agente 4
2. `/backend/src/agents/qa-engineer.agent.ts` - Agente 5
3. `/backend/src/utils/mcp-client.ts` - Cliente MCP unificado
4. Sandbox de validación con Docker
5. Sistema de rate limiting por usuario
6. Dashboard de métricas de agentes

**Criterios de Éxito**:
- SQL generado pasa validación de seguridad en 100% de casos
- Optimizaciones de Agente 4 mejoran performance en 30%+
- Zero vulnerabilidades SQL injection en auditoría

---

### FASE 3: Visualización Inteligente (Sprint 5-6, 2 semanas)

**Objetivos**:
- Implementar Agente 3 (Solution Architect) y Agente 6 (Fullstack)
- Integrar Recharts y MCP Plotly
- Generar visualizaciones automáticas basadas en tipo de datos

**Entregables**:
1. `/backend/src/agents/solution-architect.agent.ts` - Agente 3
2. `/backend/src/agents/fullstack-dev.agent.ts` - Agente 6
3. `/frontend/src/components/charts/` - Componentes de gráficos
4. Integración MCP Plotly y DuckDB
5. Sistema de inferencia de tipo de gráfico
6. Exportación de gráficos a PNG/SVG

**Criterios de Éxito**:
- 80% de queries generan visualización apropiada automáticamente
- Gráficos interactivos funcionales en desktop y mobile
- Tiempo de generación de gráfico < 2s

---

### FASE 4: Performance y Escalabilidad (Sprint 7, 1 semana)

**Objetivos**:
- Implementar sistema de caché con Redis
- Optimizar flujo de comunicación entre agentes
- Paralelización de agentes independientes

**Entregables**:
1. Integración Redis para cache de queries
2. Rate limiting granular por usuario/empresa
3. Paralelización de Agente 1, 2, 3 (no dependen entre sí)
4. Índices de base de datos optimizados
5. Load testing con k6

**Criterios de Éxito**:
- Queries repetidas responden en < 500ms (cache hit)
- Sistema soporta 100 queries concurrentes sin degradación
- P95 latency < 3s

---

### FASE 5: UX y Features Avanzados (Sprint 8-9, 2 semanas)

**Objetivos**:
- Mejorar interfaz de usuario
- Agregar features de productividad (historial, favoritos, autocompletado)
- Implementar modo conversacional multi-turno

**Entregables**:
1. Historial de queries por usuario
2. Sistema de favoritos y compartir queries
3. Autocompletado inteligente basado en historial
4. Modo conversacional (seguimiento de contexto)
5. Exportación de resultados a CSV/Excel
6. Tour interactivo para nuevos usuarios

**Criterios de Éxito**:
- NPS de usuarios > 70
- 60% de queries son reutilización de historial/favoritos
- Tiempo de onboarding de nuevos usuarios < 5 min

---

## 8. Estimaciones y Recursos

### 8.1 Esfuerzo por Fase

| Fase | Duración | Desarrolladores | Puntos de Historia |
|------|----------|-----------------|-------------------|
| Fase 1: Fundamentos | 2 semanas | 2 devs | 40 pts |
| Fase 2: Optimización | 2 semanas | 2 devs | 35 pts |
| Fase 3: Visualización | 2 semanas | 2 devs + 1 designer | 45 pts |
| Fase 4: Performance | 1 semana | 1 backend dev | 20 pts |
| Fase 5: UX Avanzado | 2 semanas | 1 fullstack + 1 designer | 30 pts |
| **TOTAL** | **9 semanas** | - | **170 pts** |

### 8.2 Costos Estimados (API Calls)

**Gemini API** (precios al 14 de Marzo 2026):
- Gemini 1.5 Flash: $0.075 / 1M tokens input, $0.30 / 1M tokens output
- Gemini 1.5 Pro: $1.25 / 1M tokens input, $5.00 / 1M tokens output

**Estimación mensual** (1000 queries/día):
- Promedio 2 llamadas LLM por query (Agente 1 + Agente 2)
- Promedio 1000 tokens input + 500 tokens output por llamada
- Costo por query: ~$0.002 (Flash) o ~$0.008 (Pro)
- **Costo mensual**: $60 (Flash) o $240 (Pro)

**MCPs**:
- Fabi: Freemium (gratis hasta 1K queries/mes, luego $0.01/query)
- DuckDB: Open source, sin costo
- Plotly: Open source, sin costo

**Redis (Upstash)**:
- Free tier: 10K comandos/día
- Pro tier: $10/mes (1M comandos/día)

**Estimación total mensual**: $70-250 según volumen y modelo LLM

---

## 9. Métricas de Éxito

### 9.1 KPIs Técnicos

| Métrica | Baseline Actual | Objetivo Post-Implementación |
|---------|-----------------|------------------------------|
| Tasa de éxito de queries | 60% (solo patterns) | 90%+ (con LLM) |
| Latencia P95 | N/A (síncrono) | < 3s |
| Queries/segundo soportadas | ~5 | 100+ |
| Cobertura de tipos de consulta | 16 predefinidas | Ilimitada (generativa) |
| Tasa de SQL injection | 0% (Prisma ORM) | 0% (validación multi-capa) |

### 9.2 KPIs de Negocio

| Métrica | Baseline | Objetivo |
|---------|----------|----------|
| Adopción por estudiantes | 40% | 80% |
| Tiempo promedio de análisis | 15 min | 3 min |
| NPS de funcionalidad | N/A | > 70 |
| Queries exitosas sin intervención manual | 60% | 95% |

---

## 10. Riesgos y Mitigaciones

### 10.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Gemini API genera SQL incorrecto | Media | Alto | Agente 5 (QA) con sandbox + Fabi MCP para validación |
| Latencia de LLM > 5s | Media | Medio | Cache Redis + paralelización de agentes |
| Costos API excedan presupuesto | Baja | Alto | Rate limiting + uso de Flash vs Pro según complejidad |
| MCP servers inestables | Baja | Medio | Fallback a lógica local + circuit breaker |
| Schema de DB cambia y rompe prompts | Media | Alto | Versionado de schema + tests de integración |

### 10.2 Riesgos de Producto

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuarios prefieren queries manuales | Media | Medio | UX excelente + tour interactivo + ejemplos claros |
| Resultados de LLM confusos para usuarios | Media | Alto | Agente 6 genera explicaciones en lenguaje natural |
| Resistencia al cambio (vs sistema actual) | Alta | Bajo | Rollout gradual + feature flag + soporte híbrido |

---

## 11. Próximos Pasos Inmediatos

### Acciones para comenzar implementación:

1. **Setup de proyecto** (Día 1-2):
   - [ ] Crear branch `feature/multiagent-sql-query`
   - [ ] Agregar dependencias nuevas a `package.json`
   - [ ] Configurar variables de entorno (Gemini API key, Redis URL)
   - [ ] Crear estructura de carpetas `/backend/src/agents/`

2. **Spike técnico** (Día 3-5):
   - [ ] POC de Gemini API para NL-to-SQL (sin agentes aún)
   - [ ] POC de Fabi MCP para validación de SQL
   - [ ] POC de Recharts con datos de ejemplo
   - [ ] Decisión: ¿Gemini Flash o Pro? (basado en benchmarks)

3. **Arquitectura detallada** (Semana 2):
   - [ ] Diseñar schemas de mensajes entre agentes
   - [ ] Definir contratos de API para cada agente
   - [ ] Crear diagrama de secuencia detallado
   - [ ] Documentar prompts de cada agente en `/docs/prompts/`

4. **Inicio de desarrollo FASE 1** (Semana 3):
   - [ ] Implementar orquestador básico
   - [ ] Implementar Agente 1 (User Proxy)
   - [ ] Implementar Agente 2 (AI Engineer)
   - [ ] Tests unitarios + integración

---

## 12. Apéndices

### A. Ejemplo de Prompt para Agente 2 (AI Engineer)

```
You are an expert PostgreSQL 17 database engineer and Prisma ORM specialist.
Your task is to generate safe, efficient SQL queries from natural language questions.

DATABASE SCHEMA (Prisma format):
```prisma
model Company {
  id           String    @id @default(uuid())
  name         String
  sector       String?
  size         String?
  tenantId     String
  createdAt    DateTime  @default(now())
  answers      Answer[]
}

model Answer {
  id                 String    @id @default(uuid())
  assessmentId       String
  studentName        String
  studentEmail       String
  respondentName     String?
  respondentPosition String?
  respondentOrgLevel String?
  responses          Json      // { "I3": 4, "I4": 5, ... }
  submittedAt        DateTime  @default(now())
  companyId          String?
  company            Company?  @relation(fields: [companyId], references: [id])
  diagnosis          Diagnosis?
}

model Diagnosis {
  id           String    @id @default(uuid())
  assessmentId String
  answerId     String?   @unique
  answer       Answer?   @relation(fields: [answerId], references: [id])
  result       String    // JSON: { foundations: [...], globalScore: 3.5, status: "..." }
  score        Float?
  createdAt    DateTime  @default(now())
}
```

SECURITY CONSTRAINTS:
- ONLY SELECT queries allowed (no INSERT, UPDATE, DELETE, DROP)
- Maximum 1000 rows returned (always add LIMIT clause)
- Only access tables: Company, Answer, Diagnosis, Assessment
- Always filter by tenantId when querying Company

USER QUERY (refined from User Proxy Agent):
"{refinedQuery}"

ENTITIES EXTRACTED:
{JSON.stringify(entities, null, 2)}

TASK:
Generate a PostgreSQL query that answers the user's question accurately and safely.

OUTPUT FORMAT (JSON only, no markdown):
{
  "sql": "SELECT ... (use $1, $2 for parameterized values)",
  "parameters": [/* array of parameter values */],
  "explanation": "Plain Spanish explanation of what the query does",
  "estimatedComplexity": "low" | "medium" | "high",
  "usedTables": ["Company", "Answer"],
  "warnings": [/* optional array of warnings like 'May be slow on large datasets' */]
}

EXAMPLES:
Input: "List companies with lowest digital maturity"
Output:
{
  "sql": "SELECT c.name, d.score FROM \"Company\" c JOIN \"Answer\" a ON a.\"companyId\" = c.id JOIN \"Diagnosis\" d ON d.\"answerId\" = a.id WHERE c.\"tenantId\" = $1 ORDER BY d.score ASC LIMIT 10",
  "parameters": ["tenant-uuid"],
  "explanation": "Obtiene las 10 empresas con menor puntaje de madurez digital, uniendo las tablas Company, Answer y Diagnosis, filtradas por tenant.",
  "estimatedComplexity": "low",
  "usedTables": ["Company", "Answer", "Diagnosis"]
}

Now generate the query for the user's question.
```

### B. Glosario de Términos

- **Orquestador**: Componente central que coordina comunicación entre agentes
- **MCP (Model Context Protocol)**: Estándar abierto de Anthropic para conectar LLMs con herramientas
- **NL-to-SQL**: Natural Language to SQL, conversión de lenguaje natural a queries SQL
- **Prisma ORM**: Object-Relational Mapping para TypeScript/Node.js
- **RAG (Retrieval-Augmented Generation)**: Técnica de IA que combina retrieval de documentos con generación de texto
- **Sandbox**: Entorno aislado para ejecutar código sin afectar sistema principal
- **Circuit Breaker**: Patrón de diseño que previene llamadas a servicios fallidos

---

**Fin del Documento**

**Siguiente acción recomendada**: Revisar este diseño con equipo técnico, validar supuestos con stakeholders, y aprobar para iniciar FASE 1 de implementación.
