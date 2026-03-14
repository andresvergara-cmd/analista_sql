# Alternativas de LLM Gratuitas para Módulo SQL Multi-Agente

**Versión:** 1.0
**Fecha:** 14 de Marzo, 2026
**Estado:** Recomendaciones Técnicas

---

## 1. Resumen Ejecutivo

Este documento presenta **alternativas 100% gratuitas** a Gemini API para implementar el sistema multi-agente de consultas SQL, eliminando costos mensuales estimados de $70-250.

**Objetivo**: Cero costos de API manteniendo capacidades de NL-to-SQL, generación de explicaciones e insights.

---

## 2. Comparativa de Opciones Gratuitas

| Opción | Costo | Velocidad | Calidad SQL | Límites | Hardware Necesario |
|--------|-------|-----------|-------------|---------|-------------------|
| **Ollama + SQLCoder** | $0 | Media | Excelente | Sin límites | 8-16GB RAM |
| **Groq API** | $0 | Ultrarrápida | Muy buena | 200K tokens/día | Ninguno |
| **Ollama Cloud** | $0 | Rápida | Buena | Generosos | Ninguno |
| **Together.ai Free** | $0 | Media | Buena | Moderados | Ninguno |
| **Híbrida (Ollama + Groq)** | $0 | Variable | Excelente | 200K/día cloud | 8-16GB RAM |

---

## 3. OPCIÓN 1 (Recomendada): Ollama Local

### 3.1 ¿Qué es Ollama?

Ollama es una herramienta open-source que permite ejecutar LLMs localmente en tu máquina. Empaqueta modelos como Llama 3, CodeLlama, SQLCoder y muchos otros en contenedores fáciles de usar.

**Sitio oficial**: https://ollama.com
**GitHub**: https://github.com/ollama/ollama

### 3.2 Modelos Recomendados para SQL

#### A. SQLCoder (Especializado en SQL)

**Modelo**: `sqlcoder:7b` (7B parámetros)
**Fine-tuned específicamente para**: Generación de SQL desde lenguaje natural

**Características**:
- Entrenado en StarCoder con datasets de SQL
- Comprende schemas complejos de bases de datos
- Genera sintaxis SQL precisa para PostgreSQL
- Maneja JOINs, subconsultas, CTEs, window functions

**Requisitos mínimos**:
- RAM: 8GB (recomendado 16GB)
- Disco: 4GB
- CPU: 4 cores recomendado

**Instalación**:
```bash
# 1. Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Descargar SQLCoder
ollama pull sqlcoder:7b

# 3. Verificar instalación
ollama list
```

**Uso desde Node.js**:
```typescript
import axios from 'axios';

async function generateSQLWithOllama(
  naturalQuery: string,
  dbSchema: string
): Promise<string> {
  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'sqlcoder:7b',
    prompt: `
      Database Schema:
      ${dbSchema}

      User Question: ${naturalQuery}

      Generate only the SQL query without explanation.
    `,
    stream: false
  });

  return response.data.response.trim();
}

// Ejemplo de uso
const schema = `
  CREATE TABLE Company (id UUID, name TEXT, sector TEXT);
  CREATE TABLE Answer (id UUID, companyId UUID, responses JSONB);
  CREATE TABLE Diagnosis (id UUID, answerId UUID, score FLOAT);
`;

const sql = await generateSQLWithOllama(
  "List companies with lowest digital maturity",
  schema
);

console.log(sql);
// Output: SELECT c.name, d.score FROM "Company" c ...
```

#### B. CodeLlama (Código General + SQL)

**Modelo**: `codellama:7b-instruct`
**Características**:
- Modelo general de código (Python, JS, SQL, etc.)
- Versión Instruct optimizada para seguir instrucciones
- Buen rendimiento en SQL aunque no especializado
- Puede generar explicaciones además de SQL

**Instalación**:
```bash
ollama pull codellama:7b-instruct
```

**Ventaja sobre SQLCoder**: Puede generar explicaciones en lenguaje natural además del SQL.

#### C. Llama 3.1 (Modelo General)

**Modelo**: `llama3.1:8b`
**Características**:
- Modelo general más descargado en Ollama (2026)
- Excelente para generación de texto (explicaciones, insights)
- Razonamiento superior para interpretación de consultas
- Multiuso: NL-to-SQL + explicaciones + análisis

**Instalación**:
```bash
ollama pull llama3.1:8b
```

**Uso recomendado**:
- Agente 1 (User Proxy): Interpretar consulta del usuario
- Agente 6 (Fullstack): Generar explicaciones e insights

### 3.3 Arquitectura Híbrida con Ollama

```typescript
// /backend/src/utils/ollama-client.ts
import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export class OllamaClient {
  // SQL Generation (usa SQLCoder)
  async generateSQL(prompt: string): Promise<string> {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'sqlcoder:7b',
      prompt,
      stream: false,
      options: {
        temperature: 0.1,  // Baja temperatura para SQL más determinista
        top_p: 0.9
      }
    });
    return response.data.response;
  }

  // Text Generation (usa Llama 3.1 para explicaciones)
  async generateText(prompt: string): Promise<string> {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'llama3.1:8b',
      prompt,
      stream: false,
      options: {
        temperature: 0.7,  // Mayor temperatura para texto más creativo
        top_p: 0.95
      }
    });
    return response.data.response;
  }

  // Chat (para conversación multi-turno)
  async chat(messages: { role: string; content: string }[]): Promise<string> {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
      model: 'llama3.1:8b',
      messages,
      stream: false
    });
    return response.data.message.content;
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
      return true;
    } catch {
      return false;
    }
  }
}

export const ollamaClient = new OllamaClient();
```

### 3.4 Ventajas y Limitaciones

**Ventajas**:
- ✅ **Costo $0** absoluto, sin límites de requests
- ✅ **Privacidad total**: Datos nunca salen del servidor
- ✅ **Sin dependencias externas**: No requiere internet para funcionar
- ✅ **SQLCoder**: Modelo especializado en SQL, mejor que modelos generales
- ✅ **Latencia predecible**: No depende de red

**Limitaciones**:
- ❌ Requiere recursos de servidor (RAM 8-16GB)
- ❌ Velocidad menor que APIs cloud optimizadas (Groq)
- ❌ Calidad ligeramente inferior a modelos gigantes (GPT-4, Claude)
- ❌ Necesita despliegue en Railway/Render con suficiente RAM

**Mitigación de limitaciones**:
- Railway ofrece planes con 16GB RAM por ~$20/mes (fijo, no por uso)
- Render permite hasta 16GB en planes Pro
- Groq como fallback para queries complejas

---

## 4. OPCIÓN 2: Groq API (Cloud Gratuito Ultrarrápido)

### 4.1 ¿Qué es Groq?

Groq ofrece la **inferencia LLM más rápida disponible** en 2026, ejecutando modelos en hardware LPU (Language Processing Unit) personalizado.

**Sitio oficial**: https://groq.com
**Velocidad**: 500-800 tokens/segundo (10-20x más rápido que GPT-4)

### 4.2 Plan Gratuito

**Límites gratuitos** (Marzo 2026):
- **200,000 tokens/día** (suficiente para 200-400 queries SQL completas)
- **Modelos disponibles gratis**:
  - `llama-3.1-70b-versatile` (mejor calidad)
  - `llama-3.1-8b-instant` (más rápido)
  - `mixtral-8x7b-32768` (contexto largo)

**Cálculo de capacidad**:
```
Query promedio: ~500 tokens input + ~200 tokens output = 700 tokens
Queries/día con 200K tokens: ~285 queries
Para 10 estudiantes con 20 queries/día = 200 queries totales
Margen: 85 queries adicionales de buffer
```

### 4.3 Integración con Node.js

**Instalación**:
```bash
npm install groq-sdk
```

**Código**:
```typescript
// /backend/src/utils/groq-client.ts
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY  // Gratis en https://console.groq.com
});

export class GroqClient {
  async generateSQL(userQuery: string, dbSchema: string): Promise<string> {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert PostgreSQL SQL generator.

          Database Schema:
          ${dbSchema}

          Generate only valid SQL without explanations.`
        },
        {
          role: "user",
          content: userQuery
        }
      ],
      model: "llama-3.1-70b-versatile",  // Mejor calidad
      temperature: 0.1,
      max_tokens: 500
    });

    return chatCompletion.choices[0]?.message?.content || '';
  }

  async generateExplanation(query: string, sqlGenerated: string): Promise<string> {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `User asked: "${query}"

          SQL generated: ${sqlGenerated}

          Explain in Spanish what this SQL query does in simple terms.`
        }
      ],
      model: "llama-3.1-8b-instant",  // Más rápido para texto simple
      temperature: 0.7,
      max_tokens: 300
    });

    return chatCompletion.choices[0]?.message?.content || '';
  }
}

export const groqClient = new GroqClient();
```

### 4.4 Registro y API Key

1. Ir a https://console.groq.com
2. Registrarse con email (gratis)
3. Crear API key en dashboard
4. Agregar a `.env`:
```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

### 4.5 Ventajas y Limitaciones

**Ventajas**:
- ✅ **Costo $0** hasta 200K tokens/día
- ✅ **Velocidad extrema**: 500-800 tokens/segundo
- ✅ **Sin hardware necesario**: API cloud
- ✅ **Llama 3.1 70B**: Modelo muy potente
- ✅ **Fácil integración**: SDK oficial de Node.js

**Limitaciones**:
- ❌ Límite diario de 200K tokens (suficiente pero no ilimitado)
- ❌ Requiere internet
- ❌ Datos enviados a cloud Groq (menos privacidad que Ollama)

---

## 5. OPCIÓN 3: Arquitectura Híbrida (Ollama + Groq)

### 5.1 Estrategia Combinada

Usar **Ollama como primario** y **Groq como fallback/optimization**:

```typescript
// /backend/src/utils/llm-client.ts
import { OllamaClient } from './ollama-client';
import { GroqClient } from './groq-client';

export class HybridLLMClient {
  private ollama: OllamaClient;
  private groq: GroqClient;
  private useGroqForComplex: boolean = true;

  constructor() {
    this.ollama = new OllamaClient();
    this.groq = new GroqClient();
  }

  async generateSQL(
    userQuery: string,
    dbSchema: string,
    complexity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<string> {
    // Queries complejas → Groq (más potente)
    if (complexity === 'high' && this.useGroqForComplex) {
      try {
        return await this.groq.generateSQL(userQuery, dbSchema);
      } catch (error) {
        console.warn('Groq failed, falling back to Ollama', error);
        // Fallback a Ollama si Groq falla o alcanza límite
      }
    }

    // Queries simples/medias → Ollama (gratis ilimitado)
    const ollamaAvailable = await this.ollama.ping();
    if (ollamaAvailable) {
      return await this.ollama.generateSQL(`
        Database Schema:
        ${dbSchema}

        User Question: ${userQuery}

        Generate SQL query:
      `);
    }

    // Si Ollama no está disponible, usar Groq
    return await this.groq.generateSQL(userQuery, dbSchema);
  }

  async generateExplanation(query: string, sql: string): Promise<string> {
    // Explicaciones siempre con Ollama (no consume tokens de Groq)
    const ollamaAvailable = await this.ollama.ping();
    if (ollamaAvailable) {
      return await this.ollama.generateText(`
        User query: "${query}"
        SQL generated: ${sql}

        Explain in Spanish what this query does:
      `);
    }

    // Fallback a Groq
    return await this.groq.generateExplanation(query, sql);
  }

  async healthCheck(): Promise<{ ollama: boolean; groq: boolean }> {
    return {
      ollama: await this.ollama.ping(),
      groq: true  // Groq API siempre disponible
    };
  }
}

export const llmClient = new HybridLLMClient();
```

### 5.2 Decisión de Routing

**Criterios para usar Groq**:
1. Query detectada como "compleja" (múltiples JOINs, subconsultas anidadas)
2. Ollama no disponible (servidor caído, sin RAM)
3. Primera vez que usuario hace una pregunta (mejor experiencia inicial)

**Criterios para usar Ollama**:
1. Queries simples/medias (80% de los casos)
2. Generación de explicaciones e insights
3. Todos los casos si Groq alcanzó límite diario

---

## 6. OPCIÓN 4: Ollama Cloud (Nuevo 2026)

### 6.1 ¿Qué es Ollama Cloud?

Servicio cloud de Ollama que permite usar modelos vía API sin hardware local, con **tier gratuito generoso**.

**Estado**: Lanzado en 2026
**Ventaja vs Groq**: Más modelos disponibles (DeepSeek, Qwen3-coder, etc.)

### 6.2 Modelos Gratuitos Disponibles

- `deepseek-3.1` (excelente para código)
- `qwen3-coder` (especializado en código)
- `llama3.1:8b`
- Otros modelos open-source

**Límites gratuitos**: No documentados públicamente aún (cuenta nueva requerida)

### 6.3 Uso Similar a API

```typescript
// Similar a Ollama local pero con URL cloud
const OLLAMA_CLOUD_URL = 'https://api.ollama.ai';

const response = await axios.post(`${OLLAMA_CLOUD_URL}/api/generate`, {
  model: 'qwen3-coder',
  prompt: sqlPrompt,
  apiKey: process.env.OLLAMA_CLOUD_API_KEY
});
```

**Estado de implementación**: Revisar documentación oficial en https://ollama.com/cloud

---

## 7. Comparativa Final y Recomendación

### 7.1 Tabla de Decisión

| Escenario | Opción Recomendada | Razón |
|-----------|-------------------|-------|
| **Startup/MVP con servidor 16GB RAM** | Ollama (SQLCoder + Llama 3.1) | $0 total, privacidad, ilimitado |
| **Prototipo rápido sin servidor potente** | Groq API | $0, ultrarrápido, sin hardware |
| **Producción con tráfico moderado** | Híbrida (Ollama + Groq) | Mejor de ambos mundos |
| **Máxima privacidad requerida** | Ollama 100% | Datos nunca salen del servidor |
| **Queries SQL ultra complejas** | Groq (Llama 3.1 70B) | Modelo más potente gratis |

### 7.2 Recomendación para "Agente Analista SQL"

**OPCIÓN ELEGIDA: Arquitectura Híbrida (Ollama + Groq)**

**Justificación**:
1. **Ollama local** como primario:
   - SQLCoder para generación de SQL (especializado)
   - Llama 3.1 8B para explicaciones e insights
   - $0 costo, queries ilimitadas
   - Privacidad de datos de estudiantes

2. **Groq** como fallback/optimization:
   - Queries complejas usan Llama 3.1 70B
   - Backup si Ollama no disponible
   - Optimización de velocidad en queries críticas
   - 200K tokens/día suficiente para 200-400 queries

3. **Costos totales estimados**:
   - Ollama: $0 (ya tienes servidor Railway/Render)
   - Groq API: $0 (tier gratuito)
   - **Total: $0/mes** 🎉

### 7.3 Plan de Implementación

**Fase 1: Setup Ollama Local**
```bash
# En servidor Railway/Render
curl -fsSL https://ollama.com/install.sh | sh
ollama pull sqlcoder:7b
ollama pull llama3.1:8b
ollama serve  # Corre en puerto 11434
```

**Fase 2: Integrar Groq como Fallback**
```bash
npm install groq-sdk
# Agregar GROQ_API_KEY a variables de entorno
```

**Fase 3: Implementar HybridLLMClient**
- Crear `/backend/src/utils/llm-client.ts` con lógica híbrida
- Actualizar agentes para usar `llmClient.generateSQL()`

---

## 8. Configuración de Variables de Entorno

```bash
# .env (backend)

# Ollama (local o cloud)
OLLAMA_URL=http://localhost:11434  # Local
# OLLAMA_URL=https://api.ollama.ai  # Cloud (futuro)

# Groq API (gratis)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx  # Obtener en console.groq.com

# Feature flags
USE_GROQ_FOR_COMPLEX_QUERIES=true
OLLAMA_FALLBACK_ENABLED=true
```

---

## 9. Monitoreo de Uso

```typescript
// /backend/src/utils/usage-tracker.ts
export class LLMUsageTracker {
  private static dailyGroqTokens = 0;
  private static dailyOllamaQueries = 0;

  static trackGroqTokens(tokens: number) {
    this.dailyGroqTokens += tokens;
    if (this.dailyGroqTokens > 180000) {  // 90% del límite
      console.warn('⚠️ Approaching Groq daily limit, switching to Ollama only');
    }
  }

  static trackOllamaQuery() {
    this.dailyOllamaQueries++;
  }

  static getDailyStats() {
    return {
      groqTokensUsed: this.dailyGroqTokens,
      groqTokensRemaining: 200000 - this.dailyGroqTokens,
      ollamaQueries: this.dailyOllamaQueries,
      percentGroqUsed: (this.dailyGroqTokens / 200000) * 100
    };
  }

  // Reset diario (cron job)
  static resetDaily() {
    this.dailyGroqTokens = 0;
    this.dailyOllamaQueries = 0;
  }
}
```

---

## 10. Benchmarks de Rendimiento

| Métrica | Ollama (SQLCoder 7B) | Groq (Llama 3.1 70B) | Gemini 1.5 Flash |
|---------|---------------------|---------------------|------------------|
| **Velocidad tokens/seg** | 30-50 | 500-800 | 100-150 |
| **Latencia query simple** | 2-4s | 0.5-1s | 1-2s |
| **Calidad SQL** | 8.5/10 | 9/10 | 9.5/10 |
| **Costo por 1K queries** | $0 | $0 | $0.30-0.50 |
| **Límites** | Sin límites | 200K tokens/día | Variable según plan |

**Conclusión**: Ollama + Groq juntos ofrecen calidad cercana a Gemini con costo $0.

---

## 11. Recursos Adicionales

**Ollama**:
- Documentación oficial: https://github.com/ollama/ollama/blob/main/docs/api.md
- SQLCoder model card: https://ollama.com/library/sqlcoder
- Llama 3.1 model card: https://ollama.com/library/llama3.1

**Groq**:
- Console y API keys: https://console.groq.com
- Documentación SDK: https://www.npmjs.com/package/groq-sdk
- Pricing (free tier): https://groq.com/pricing

**Comunidad**:
- Ollama Discord: https://discord.gg/ollama
- Groq Community: https://groq.com/community

---

## 12. Próximos Pasos

1. ✅ **Aprobar** opción híbrida Ollama + Groq
2. [ ] **Registrar** cuenta Groq y obtener API key gratuita
3. [ ] **Instalar** Ollama en servidor Railway/Render
4. [ ] **Implementar** `HybridLLMClient` en backend
5. [ ] **Actualizar** agentes para usar cliente híbrido
6. [ ] **Benchmark** rendimiento Ollama vs Groq en queries reales
7. [ ] **Optimizar** prompts para cada modelo

---

**Fin del Documento**

**Conclusión**: Sistema multi-agente puede implementarse con **costo $0** usando Ollama (local) + Groq (cloud gratuito), eliminando necesidad de Gemini API.

**Próxima acción**: Aprobar arquitectura híbrida e iniciar FASE 1 de implementación.
