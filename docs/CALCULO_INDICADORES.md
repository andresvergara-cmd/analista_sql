# Metodología de Cálculo de Indicadores de Madurez

Este documento describe la metodología completa de cálculo de los indicadores utilizados en los reportes de madurez organizacional.

---

## 1. Modelo de Madurez Digital (Kroh et al. 2020)

### 1.1 Descripción General

El modelo de Kroh evalúa la **madurez digital** de las organizaciones a través de 8 dimensiones fundamentales, utilizando una escala Likert de 5 puntos.

### 1.2 Dimensiones Evaluadas

| ID | Dimensión | Descripción | Ítems |
|----|-----------|-------------|-------|
| **DIF** | Digital Focus | Evalúa el compromiso estratégico de liderazgo hacia la transformación digital | I3-I10 (8 ítems) |
| **DIP** | Digital Innovation Process | Mide los procesos formales de innovación digital de la organización | I11-I14 (4 ítems) |
| **DMI** | Digital Mindset | Evalúa la mentalidad digital de equipos y cultura organizacional | I17-I20 (4 ítems) |
| **DIN** | Digital Innovation Network | Mide la red de alianzas para innovación digital (startups, universidades) | I22-I25 (4 ítems) |
| **DTC** | Digital Tech Capability | Evalúa capacidades tecnológicas y arquitectura digital | I26-I30 (5 ítems) |
| **DMA** | Data Management | Mide la madurez en gestión, análisis y uso estratégico de datos | I31-I33 (3 ítems) |
| **DIR** | Overcoming Resistance | Evalúa superación de resistencia al cambio digital (escala inversa) | I34-I36, I38 (4 ítems) |
| **AIA** | AI Attention Infrastructure | Mide la atención e infraestructura organizacional en inteligencia artificial | A1-A5 (5 ítems) |

### 1.3 Escala de Medición

**Escala Likert de 5 puntos:**
- **1** = Totalmente en desacuerdo
- **2** = En desacuerdo
- **3** = Neutral
- **4** = De acuerdo
- **5** = Totalmente de acuerdo
- **0** = No Sabe / No Aplica (excluido del cálculo)

### 1.4 Fórmulas de Cálculo

#### A. Cálculo por Dimensión

Para cada dimensión:

1. **Ajuste de Escala Inversa (solo dimensión DIR):**
   ```
   Valor Ajustado = 6 - Valor Original
   ```
   La dimensión DIR tiene ítems formulados negativamente, por lo que se invierte la escala.

2. **Filtrado de Respuestas:**
   - Se excluyen respuestas con valor `0` ("No Sabe")
   - Solo se consideran valores entre 1 y 5

3. **Promedio de la Dimensión:**
   ```
   Promedio Dimensión = Σ(Valores Ajustados) / N° de ítems respondidos
   ```

4. **Conversión a Porcentaje:**
   ```
   Porcentaje Dimensión = (Promedio Dimensión / 5) × 100
   ```

#### B. Cálculo Global de Madurez Digital

1. **Promedio Global:**
   ```
   Promedio Global = Σ(Promedios de 8 Dimensiones) / 8
   ```

2. **Clasificación de Madurez:**

| Promedio Global | Nivel de Madurez |
|-----------------|------------------|
| **≥ 4.5** | Líder Digital |
| **3.5 ≤ x < 4.5** | Avanzado |
| **2.5 ≤ x < 3.5** | En Transformación Digital |
| **1.5 ≤ x < 2.5** | En Desarrollo |
| **< 1.5** | Inicial |

### 1.5 Ejemplo de Cálculo

**Ejemplo práctico - Dimensión DIR (Overcoming Resistance):**

Supongamos las siguientes respuestas:
- I34: 4 (De acuerdo)
- I35: 5 (Totalmente de acuerdo)
- I36: 3 (Neutral)
- I38: 4 (De acuerdo)

**Paso 1: Aplicar escala inversa**
- I34: 6 - 4 = **2**
- I35: 6 - 5 = **1**
- I36: 6 - 3 = **3**
- I38: 6 - 4 = **2**

**Paso 2: Calcular promedio**
```
Promedio DIR = (2 + 1 + 3 + 2) / 4 = 2.00
```

**Paso 3: Convertir a porcentaje**
```
Porcentaje DIR = (2.00 / 5) × 100 = 40%
```

---

## 2. Modelo de Madurez en Gestión de Proyectos (Kerzner PMMM)

### 2.1 Descripción General

El modelo de Harold Kerzner evalúa la **madurez en gestión de proyectos** a través de 4 dimensiones clave, basado en el Project Management Maturity Model (PMMM). Utiliza una escala Likert de 7 puntos.

### 2.2 Dimensiones Evaluadas

| ID | Dimensión | Descripción | Ítems |
|----|-----------|-------------|-------|
| **K1** | Cultura y Lenguaje Común | Evalúa la existencia de un lenguaje compartido y roles claramente definidos en gestión de proyectos | K1-K5 (5 ítems) |
| **K2** | Metodología Institucionalizada | Mide la existencia de procesos estandarizados y sistemáticos en gestión de proyectos | K6-K10 (5 ítems) |
| **K3** | Gobernanza y Portafolio | Evalúa la priorización estratégica y gestión del portafolio de proyectos | K11-K15 (5 ítems) |
| **K4** | Mejora Continua Estratégica | Mide la capacidad de aprendizaje organizacional y adaptación estratégica | K16-K20 (5 ítems) |

### 2.3 Escala de Medición

**Escala Likert de 7 puntos:**
- **1** = Totalmente en desacuerdo
- **2** = En desacuerdo
- **3** = Ligeramente en desacuerdo
- **4** = Neutral
- **5** = Ligeramente de acuerdo
- **6** = De acuerdo
- **7** = Totalmente de acuerdo

**Nota:** Si no hay respuesta, se asume valor neutral (4).

### 2.4 Fórmulas de Cálculo

#### A. Cálculo por Dimensión

Para cada dimensión:

1. **Promedio de la Dimensión:**
   ```
   Promedio Dimensión = Σ(Valores de ítems) / 5
   ```

2. **Conversión a Porcentaje:**
   ```
   Porcentaje Dimensión = ((Promedio Dimensión - 1) / 6) × 100
   ```
   Esta fórmula normaliza la escala 1-7 a un rango 0-100%.

#### B. Cálculo Global de Madurez PM

1. **Promedio Global:**
   ```
   Promedio Global = Σ(Promedios de 4 Dimensiones) / 4
   ```

2. **Porcentaje Global:**
   ```
   Porcentaje Global = ((Promedio Global - 1) / 6) × 100
   ```

3. **Clasificación de Madurez PMMM:**

| Promedio Global | Nivel PMMM | Estado |
|-----------------|------------|--------|
| **≥ 6.5** | Nivel 5 - Mejora Continua | Optimizado |
| **5.5 ≤ x < 6.5** | Nivel 4 - Benchmarking | Gestionado |
| **4.5 ≤ x < 5.5** | Nivel 3 - Metodología Única | Definido |
| **3.5 ≤ x < 4.5** | Nivel 2 - Procesos Comunes | En Desarrollo |
| **< 3.5** | Nivel 1 - Lenguaje Común | Inicial |

### 2.5 Ejemplo de Cálculo

**Ejemplo práctico - Dimensión K1 (Cultura y Lenguaje Común):**

Supongamos las siguientes respuestas:
- K1: 6 (De acuerdo)
- K2: 5 (Ligeramente de acuerdo)
- K3: 7 (Totalmente de acuerdo)
- K4: 6 (De acuerdo)
- K5: 5 (Ligeramente de acuerdo)

**Paso 1: Calcular promedio**
```
Promedio K1 = (6 + 5 + 7 + 6 + 5) / 5 = 5.80
```

**Paso 2: Convertir a porcentaje**
```
Porcentaje K1 = ((5.80 - 1) / 6) × 100 = 80.0%
```

---

## 3. Validación de Datos

### 3.1 Validación de Entrada (Zod Schemas)

Todos los datos recibidos pasan por validación estricta usando Zod:

#### Respuestas Públicas (Survey)
- `respondentName`: String, 1-255 caracteres
- `respondentPosition`: String, 1-255 caracteres
- `respondentOrgLevel`: Enum: 'Estratégico', 'Táctico', 'Operativo'
- `respondentEmail`: Email válido, máximo 255 caracteres
- `responses`: Objeto con pares clave-valor (ítem: valor)

#### Respuestas Autenticadas (Instrumento)
Incluye campos adicionales:
- `assessmentId`: String no vacío
- `companyId`: UUID válido (opcional)
- `studentName`: String, 1-255 caracteres
- `studentEmail`: Email válido

### 3.2 Manejo de Valores Especiales

- **Valor 0 (No Sabe)**: Solo en modelo Kroh, se excluye del cálculo
- **Valores faltantes**: En modelo Kerzner, se asume valor neutral (4)
- **Valores fuera de rango**: Rechazados por validación Zod

---

## 4. Generación de Reportes

### 4.1 Datos Incluidos en el Reporte

Cada reporte contiene:

1. **Información de la Empresa:**
   - Nombre, sector, tamaño, ciudad
   - ID legal, contacto

2. **Información del Respondiente:**
   - Nombre, cargo, nivel organizacional
   - Email

3. **Información del Estudiante:**
   - Nombre, email

4. **Resultados por Dimensión:**
   - Promedio (escala original)
   - Porcentaje (0-100%)
   - Descripción de la dimensión

5. **Resultado Global:**
   - Promedio global
   - Porcentaje global
   - Nivel de madurez
   - Estado

6. **Recomendaciones (Kerzner):**
   - Dimensiones con oportunidad de mejora (< 70%)
   - Dimensiones críticas (< 50%)
   - Acciones sugeridas por dimensión
   - Prioridad (Alta/Media)

### 4.2 Criterios de Recomendación

Para el modelo Kerzner, se generan recomendaciones automáticas:

- **Crítico (< 50%)**: Prioridad Alta
  - Acciones inmediatas
  - Fundamentos que establecer

- **Moderado (50-70%)**: Prioridad Media
  - Oportunidades de mejora
  - Optimización de prácticas existentes

- **Bueno (> 70%)**: Sin recomendación
  - Mantener y reforzar

---

## 5. Fórmulas de Resumen

### Modelo Kroh (Madurez Digital)

```
Para cada dimensión i:
  - Si i == DIR: valor_ajustado_j = 6 - valor_original_j
  - Sino: valor_ajustado_j = valor_original_j
  - Filtrar valores == 0
  - promedio_i = Σ(valores_ajustados) / n_respondidos
  - porcentaje_i = (promedio_i / 5) × 100

Promedio Global = Σ(promedio_i) / 8

Nivel de Madurez:
  - >= 4.5: Líder Digital
  - >= 3.5: Avanzado
  - >= 2.5: En Transformación Digital
  - >= 1.5: En Desarrollo
  - <  1.5: Inicial
```

### Modelo Kerzner (Madurez PM)

```
Para cada dimensión i:
  - promedio_i = Σ(valores_j) / 5
  - porcentaje_i = ((promedio_i - 1) / 6) × 100

Promedio Global = Σ(promedio_i) / 4
Porcentaje Global = ((Promedio Global - 1) / 6) × 100

Nivel PMMM:
  - >= 6.5: Nivel 5 - Mejora Continua (Optimizado)
  - >= 5.5: Nivel 4 - Benchmarking (Gestionado)
  - >= 4.5: Nivel 3 - Metodología Única (Definido)
  - >= 3.5: Nivel 2 - Procesos Comunes (En Desarrollo)
  - <  3.5: Nivel 1 - Lenguaje Común (Inicial)
```

---

## 6. Notas Técnicas

### 6.1 Precisión de Cálculos

- Promedios se redondean a **2 decimales**
- Porcentajes se redondean a **enteros**
- El promedio global mantiene 1-2 decimales según el modelo

### 6.2 Tratamiento de Casos Especiales

1. **Ninguna respuesta en una dimensión:**
   - Kroh: Promedio = 0
   - Kerzner: Promedio = 4 (neutral)

2. **Respuestas parciales en ítems:**
   - Se calcula con los ítems respondidos
   - No se aplica imputación de valores

3. **Escala inversa:**
   - Solo aplica a dimensión DIR del modelo Kroh
   - Fórmula: `6 - valor_original`

### 6.3 Implementación en Backend

**Archivos clave:**
- `/backend/src/utils/kroh-logic.ts`: Lógica de cálculo Kroh
- `/backend/src/utils/kerzner-logic.ts`: Lógica de cálculo Kerzner
- `/backend/src/validation/schemas.ts`: Validación Zod de entradas

---

## 7. Referencias

- **Kroh et al. (2020)**: "Digital Maturity Framework"
- **Kerzner, Harold**: "Project Management: A Systems Approach to Planning, Scheduling, and Controlling"
- **PMI**: Project Management Maturity Model (PMMM)

---

**Documento actualizado:** 14 de Marzo, 2026
**Versión:** 1.0
