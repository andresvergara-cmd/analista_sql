/**
 * Natural Language Query Engine
 * Interprets natural language questions and executes real database queries
 * scoped to a specific company.
 */

interface QueryResult {
    sql: string;
    data: any[];
    explanation: string;
    chartType?: 'table' | 'bar' | 'radar';
}

interface QueryPattern {
    patterns: RegExp[];
    handler: (prisma: any, companyId: string, companyName: string, match?: RegExpMatchArray) => Promise<QueryResult>;
}

function buildQueryPatterns(): QueryPattern[] {
    return [
        // --- Diagnósticos completados / cuántos diagnósticos ---
        {
            patterns: [
                /cu[aá]ntos\s+diagn[oó]sticos/i,
                /n[uú]mero\s+de\s+diagn[oó]sticos/i,
                /total\s+de\s+diagn[oó]sticos/i,
                /diagn[oó]sticos\s+(completados|realizados|hechos)/i,
                /evaluaciones\s+(completadas|realizadas)/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { assessment: true, diagnosis: true },
                });

                const totalAnswers = answers.length;
                const withDiagnosis = answers.filter((a: any) => a.diagnosis).length;
                const byAssessment: Record<string, number> = {};
                answers.forEach((a: any) => {
                    const name = a.assessment?.title || 'Sin instrumento';
                    byAssessment[name] = (byAssessment[name] || 0) + 1;
                });

                const data = Object.entries(byAssessment).map(([instrumento, cantidad]) => ({
                    instrumento,
                    cantidad,
                }));

                if (data.length === 0) {
                    data.push({ instrumento: 'Sin datos', cantidad: 0 });
                }

                return {
                    sql: `SELECT a."assessmentId", ass."title" AS instrumento, COUNT(*) AS cantidad\nFROM "Answer" a\nJOIN "Assessment" ass ON a."assessmentId" = ass."id"\nWHERE a."companyId" = '${companyId}'\nGROUP BY a."assessmentId", ass."title"`,
                    data,
                    explanation: `La empresa "${companyName}" tiene ${totalAnswers} respuesta(s) registrada(s), de las cuales ${withDiagnosis} tienen diagnóstico generado.`,
                };
            },
        },

        // --- Puntaje promedio por dimensión ---
        {
            patterns: [
                /puntaje\s+promedio\s+por\s+dimensi[oó]n/i,
                /promedio\s+por\s+dimensi[oó]n/i,
                /score\s+por\s+dimensi[oó]n/i,
                /resultados?\s+por\s+dimensi[oó]n/i,
                /dimensiones/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true, assessment: true },
                });

                const answersWithDiag = answers.filter((a: any) => a.diagnosis?.result);
                if (answersWithDiag.length === 0) {
                    return {
                        sql: `SELECT * FROM "Diagnosis" d JOIN "Answer" a ON d."answerId" = a."id" WHERE a."companyId" = '${companyId}'`,
                        data: [{ mensaje: 'No hay diagnósticos con resultados para esta empresa' }],
                        explanation: `No se encontraron diagnósticos con resultados calculados para "${companyName}".`,
                    };
                }

                // Aggregate dimensions across all diagnoses
                const dimTotals: Record<string, { sum: number; count: number }> = {};

                answersWithDiag.forEach((a: any) => {
                    try {
                        const result = JSON.parse(a.diagnosis.result);
                        const dims = result.dimensions || result.foundations || [];
                        dims.forEach((d: any) => {
                            const name = d.name;
                            if (!dimTotals[name]) dimTotals[name] = { sum: 0, count: 0 };
                            dimTotals[name].sum += (d.average ?? d.score ?? 0);
                            dimTotals[name].count += 1;
                        });
                    } catch { /* skip unparseable */ }
                });

                const data = Object.entries(dimTotals).map(([dimension, { sum, count }]) => ({
                    dimension,
                    promedio: Number((sum / count).toFixed(2)),
                    respuestas: count,
                }));

                return {
                    sql: `SELECT dimension_name, AVG(score) AS promedio, COUNT(*) AS respuestas\nFROM diagnosis_dimensions\nWHERE company_id = '${companyId}'\nGROUP BY dimension_name`,
                    data,
                    explanation: `Puntajes promedio por dimensión para "${companyName}" basados en ${answersWithDiag.length} diagnóstico(s).`,
                    chartType: 'bar',
                };
            },
        },

        // --- Dimensión con menor desempeño ---
        {
            patterns: [
                /dimensi[oó]n\s+(con\s+)?(menor|peor|m[aá]s\s+baj[oa])\s+(desempe[nñ]o|puntaje|score)/i,
                /peor\s+dimensi[oó]n/i,
                /punto\s+d[eé]bil/i,
                /debilidad(es)?/i,
                /[aá]rea.*(cr[ií]tica|d[eé]bil|mejorar)/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true },
                });

                const answersWithDiag = answers.filter((a: any) => a.diagnosis?.result);
                const dimTotals: Record<string, { sum: number; count: number }> = {};

                answersWithDiag.forEach((a: any) => {
                    try {
                        const result = JSON.parse(a.diagnosis.result);
                        const dims = result.dimensions || result.foundations || [];
                        dims.forEach((d: any) => {
                            const name = d.name;
                            if (!dimTotals[name]) dimTotals[name] = { sum: 0, count: 0 };
                            dimTotals[name].sum += (d.average ?? d.score ?? 0);
                            dimTotals[name].count += 1;
                        });
                    } catch { /* skip */ }
                });

                const data = Object.entries(dimTotals)
                    .map(([dimension, { sum, count }]) => ({
                        dimension,
                        promedio: Number((sum / count).toFixed(2)),
                    }))
                    .sort((a, b) => a.promedio - b.promedio);

                if (data.length === 0) {
                    return {
                        sql: `-- No hay datos de diagnóstico disponibles`,
                        data: [{ mensaje: 'No hay diagnósticos para esta empresa' }],
                        explanation: `No se encontraron diagnósticos para "${companyName}".`,
                    };
                }

                const worst = data[0];
                return {
                    sql: `SELECT dimension_name, AVG(score) AS promedio\nFROM diagnosis_dimensions\nWHERE company_id = '${companyId}'\nGROUP BY dimension_name\nORDER BY promedio ASC\nLIMIT 1`,
                    data,
                    explanation: `La dimensión con menor desempeño en "${companyName}" es "${worst.dimension}" con un promedio de ${worst.promedio}.`,
                };
            },
        },

        // --- Dimensión con mejor desempeño / fortaleza ---
        {
            patterns: [
                /dimensi[oó]n\s+(con\s+)?(mayor|mejor|m[aá]s\s+alt[oa])\s+(desempe[nñ]o|puntaje|score)/i,
                /mejor\s+dimensi[oó]n/i,
                /fortaleza(s)?/i,
                /punto\s+fuerte/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true },
                });

                const answersWithDiag = answers.filter((a: any) => a.diagnosis?.result);
                const dimTotals: Record<string, { sum: number; count: number }> = {};

                answersWithDiag.forEach((a: any) => {
                    try {
                        const result = JSON.parse(a.diagnosis.result);
                        const dims = result.dimensions || result.foundations || [];
                        dims.forEach((d: any) => {
                            const name = d.name;
                            if (!dimTotals[name]) dimTotals[name] = { sum: 0, count: 0 };
                            dimTotals[name].sum += (d.average ?? d.score ?? 0);
                            dimTotals[name].count += 1;
                        });
                    } catch { /* skip */ }
                });

                const data = Object.entries(dimTotals)
                    .map(([dimension, { sum, count }]) => ({
                        dimension,
                        promedio: Number((sum / count).toFixed(2)),
                    }))
                    .sort((a, b) => b.promedio - a.promedio);

                if (data.length === 0) {
                    return {
                        sql: `-- No hay datos de diagnóstico disponibles`,
                        data: [{ mensaje: 'No hay diagnósticos para esta empresa' }],
                        explanation: `No se encontraron diagnósticos para "${companyName}".`,
                    };
                }

                const best = data[0];
                return {
                    sql: `SELECT dimension_name, AVG(score) AS promedio\nFROM diagnosis_dimensions\nWHERE company_id = '${companyId}'\nGROUP BY dimension_name\nORDER BY promedio DESC\nLIMIT 1`,
                    data,
                    explanation: `La dimensión con mejor desempeño en "${companyName}" es "${best.dimension}" con un promedio de ${best.promedio}.`,
                };
            },
        },

        // --- Nivel de madurez ---
        {
            patterns: [
                /nivel\s+de\s+madurez/i,
                /madurez\s+(general|global|total)/i,
                /cu[aá]l\s+es\s+(el|la|su)\s+madurez/i,
                /estado\s+de\s+madurez/i,
                /puntaje\s+(general|global|total)/i,
                /score\s+(general|global)/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true, assessment: true },
                });

                const answersWithDiag = answers.filter((a: any) => a.diagnosis?.result);

                if (answersWithDiag.length === 0) {
                    return {
                        sql: `SELECT AVG(d."score") FROM "Diagnosis" d JOIN "Answer" a ON d."answerId" = a."id" WHERE a."companyId" = '${companyId}'`,
                        data: [{ mensaje: 'No hay diagnósticos para esta empresa' }],
                        explanation: `No se encontraron diagnósticos para "${companyName}".`,
                    };
                }

                const data = answersWithDiag.map((a: any) => {
                    const result = JSON.parse(a.diagnosis.result);
                    return {
                        instrumento: a.assessment?.title || 'N/A',
                        respondente: a.respondentName || a.studentName || a.studentEmail,
                        puntaje_global: a.diagnosis.score ?? result.globalScore ?? 'N/A',
                        nivel_madurez: result.maturityLevel || result.maturityStatus || 'N/A',
                        estado: result.status || 'N/A',
                        fecha: new Date(a.submittedAt).toLocaleDateString('es-CO'),
                    };
                });

                const avgScore = answersWithDiag.reduce((acc: number, a: any) => acc + (a.diagnosis.score || 0), 0) / answersWithDiag.length;

                return {
                    sql: `SELECT d."score", d."result", a."studentEmail", a."submittedAt"\nFROM "Diagnosis" d\nJOIN "Answer" a ON d."answerId" = a."id"\nWHERE a."companyId" = '${companyId}'`,
                    data,
                    explanation: `"${companyName}" tiene un puntaje de madurez promedio de ${avgScore.toFixed(2)} basado en ${answersWithDiag.length} evaluación(es).`,
                };
            },
        },

        // --- Listar diagnósticos / respuestas ---
        {
            patterns: [
                /listar\s+(todos?\s+los?\s+)?diagn[oó]sticos/i,
                /listar\s+(todas?\s+las?\s+)?respuestas/i,
                /listar\s+(todas?\s+las?\s+)?evaluaciones/i,
                /mostrar\s+(todos?\s+los?\s+)?diagn[oó]sticos/i,
                /ver\s+(todos?\s+los?\s+)?diagn[oó]sticos/i,
                /historial\s+de\s+(diagn[oó]sticos|evaluaciones|respuestas)/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true, assessment: true },
                    orderBy: { submittedAt: 'desc' },
                });

                const data = answers.map((a: any) => ({
                    respondente: a.respondentName || a.studentName || a.studentEmail,
                    cargo: a.respondentPosition || 'N/A',
                    email: a.respondentEmail || a.studentEmail,
                    instrumento: a.assessment?.title || 'N/A',
                    puntaje: a.diagnosis?.score?.toFixed(2) ?? 'Pendiente',
                    fecha: new Date(a.submittedAt).toLocaleDateString('es-CO'),
                }));

                if (data.length === 0) {
                    data.push({ respondente: 'Sin datos', cargo: '-', email: '-', instrumento: '-', puntaje: '-', fecha: '-' });
                }

                return {
                    sql: `SELECT a."respondentName", a."respondentPosition", a."respondentEmail",\n  ass."title", d."score", a."submittedAt"\nFROM "Answer" a\nLEFT JOIN "Diagnosis" d ON d."answerId" = a."id"\nJOIN "Assessment" ass ON a."assessmentId" = ass."id"\nWHERE a."companyId" = '${companyId}'\nORDER BY a."submittedAt" DESC`,
                    data,
                    explanation: `Se encontraron ${answers.length} respuesta(s) registrada(s) para "${companyName}".`,
                };
            },
        },

        // --- Respondentes / quiénes respondieron ---
        {
            patterns: [
                /qui[eé]n(es)?\s+(respondieron|completaron|contestaron|llenaron)/i,
                /respondentes/i,
                /participantes/i,
                /personas\s+que\s+(respondieron|completaron)/i,
                /encuestados/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { assessment: true },
                    orderBy: { submittedAt: 'desc' },
                });

                const data = answers.map((a: any) => ({
                    nombre: a.respondentName || a.studentName || 'N/A',
                    cargo: a.respondentPosition || 'N/A',
                    email: a.respondentEmail || a.studentEmail,
                    instrumento: a.assessment?.title || 'N/A',
                    fecha: new Date(a.submittedAt).toLocaleDateString('es-CO'),
                }));

                if (data.length === 0) {
                    data.push({ nombre: 'Sin participantes', cargo: '-', email: '-', instrumento: '-', fecha: '-' });
                }

                return {
                    sql: `SELECT a."respondentName", a."respondentPosition", a."respondentEmail",\n  ass."title", a."submittedAt"\nFROM "Answer" a\nJOIN "Assessment" ass ON a."assessmentId" = ass."id"\nWHERE a."companyId" = '${companyId}'\nORDER BY a."submittedAt" DESC`,
                    data,
                    explanation: `${answers.length} persona(s) han respondido evaluaciones para "${companyName}".`,
                };
            },
        },

        // --- Recomendaciones ---
        {
            patterns: [
                /recomendaciones/i,
                /qu[eé]\s+(debe|puede|deber[ií]a)\s+mejorar/i,
                /plan\s+de\s+mejora/i,
                /[aá]reas?\s+(de|a|para)\s+mejorar/i,
                /acciones\s+de\s+mejora/i,
                /sugerencias/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true },
                    orderBy: { submittedAt: 'desc' },
                    take: 1,
                });

                const latest = answers[0];
                if (!latest?.diagnosis?.result) {
                    return {
                        sql: `-- No hay diagnósticos con recomendaciones`,
                        data: [{ mensaje: 'No hay diagnósticos con recomendaciones para esta empresa' }],
                        explanation: `No se encontraron diagnósticos con recomendaciones para "${companyName}".`,
                    };
                }

                const result = JSON.parse(latest.diagnosis.result);
                const recs = result.recommendations || [];

                if (recs.length === 0) {
                    return {
                        sql: `-- Diagnóstico sin recomendaciones específicas`,
                        data: [{ mensaje: 'El diagnóstico más reciente no incluye recomendaciones detalladas' }],
                        explanation: `El último diagnóstico de "${companyName}" no tiene recomendaciones específicas.`,
                    };
                }

                const data = recs.map((r: any) => ({
                    dimension: r.dimension || 'General',
                    prioridad: r.priority || 'Media',
                    recomendacion: r.recommendation || r.text || 'N/A',
                }));

                return {
                    sql: `SELECT recommendations FROM "Diagnosis" d\nJOIN "Answer" a ON d."answerId" = a."id"\nWHERE a."companyId" = '${companyId}'\nORDER BY d."createdAt" DESC LIMIT 1`,
                    data,
                    explanation: `Se encontraron ${recs.length} recomendación(es) para "${companyName}" basadas en el diagnóstico más reciente.`,
                };
            },
        },

        // --- Comparar instrumentos ---
        {
            patterns: [
                /comparar\s+(instrumentos|evaluaciones)/i,
                /comparaci[oó]n\s+entre\s+(instrumentos|evaluaciones)/i,
                /kroh\s+(vs|versus|y|contra)\s+kerzner/i,
                /kerzner\s+(vs|versus|y|contra)\s+kroh/i,
                /resultados\s+por\s+instrumento/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true, assessment: true },
                });

                const byInstrument: Record<string, { scores: number[]; count: number }> = {};
                answers.forEach((a: any) => {
                    const name = a.assessment?.title || 'Sin instrumento';
                    if (!byInstrument[name]) byInstrument[name] = { scores: [], count: 0 };
                    byInstrument[name].count++;
                    if (a.diagnosis?.score) byInstrument[name].scores.push(a.diagnosis.score);
                });

                const data = Object.entries(byInstrument).map(([instrumento, { scores, count }]) => ({
                    instrumento,
                    evaluaciones: count,
                    puntaje_promedio: scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 'Sin puntajes',
                    puntaje_min: scores.length > 0 ? Math.min(...scores).toFixed(2) : 'N/A',
                    puntaje_max: scores.length > 0 ? Math.max(...scores).toFixed(2) : 'N/A',
                }));

                if (data.length === 0) {
                    data.push({ instrumento: 'Sin datos', evaluaciones: 0, puntaje_promedio: 'N/A', puntaje_min: 'N/A', puntaje_max: 'N/A' });
                }

                return {
                    sql: `SELECT ass."title", COUNT(*) AS evaluaciones, AVG(d."score") AS promedio,\n  MIN(d."score") AS min, MAX(d."score") AS max\nFROM "Answer" a\nJOIN "Assessment" ass ON a."assessmentId" = ass."id"\nLEFT JOIN "Diagnosis" d ON d."answerId" = a."id"\nWHERE a."companyId" = '${companyId}'\nGROUP BY ass."title"`,
                    data,
                    explanation: `Comparación de instrumentos aplicados a "${companyName}".`,
                };
            },
        },

        // --- Percepción por cargo / posición ---
        {
            patterns: [
                /percepci[oó]n\s+por\s+(cargo|posici[oó]n|rol)/i,
                /resultados?\s+por\s+(cargo|posici[oó]n|rol)/i,
                /an[aá]lisis\s+por\s+(cargo|posici[oó]n|rol)/i,
                /puntaje\s+por\s+(cargo|posici[oó]n)/i,
                /cargos/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true },
                });

                const byPosition: Record<string, { scores: number[]; count: number }> = {};
                answers.forEach((a: any) => {
                    const pos = a.respondentPosition || 'Sin especificar';
                    if (!byPosition[pos]) byPosition[pos] = { scores: [], count: 0 };
                    byPosition[pos].count++;
                    if (a.diagnosis?.score) byPosition[pos].scores.push(a.diagnosis.score);
                });

                const data = Object.entries(byPosition).map(([cargo, { scores, count }]) => ({
                    cargo,
                    evaluaciones: count,
                    puntaje_promedio: scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 'Sin puntajes',
                }));

                if (data.length === 0) {
                    data.push({ cargo: 'Sin datos', evaluaciones: 0, puntaje_promedio: 'N/A' });
                }

                return {
                    sql: `SELECT a."respondentPosition" AS cargo, COUNT(*) AS evaluaciones,\n  AVG(d."score") AS promedio\nFROM "Answer" a\nLEFT JOIN "Diagnosis" d ON d."answerId" = a."id"\nWHERE a."companyId" = '${companyId}'\nGROUP BY a."respondentPosition"`,
                    data,
                    explanation: `Resultados agrupados por cargo para "${companyName}".`,
                };
            },
        },

        // --- Roadmap / hoja de ruta ---
        {
            patterns: [
                /roadmap/i,
                /hoja\s+de\s+ruta/i,
                /plan\s+estrat[eé]gico/i,
                /fases\s+de\s+mejora/i,
                /ruta\s+de\s+madurez/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true },
                    orderBy: { submittedAt: 'desc' },
                    take: 1,
                });

                const latest = answers[0];
                if (!latest?.diagnosis?.result) {
                    return {
                        sql: `-- No hay diagnósticos disponibles`,
                        data: [{ mensaje: 'No hay diagnósticos para generar roadmap' }],
                        explanation: `No se encontraron diagnósticos para "${companyName}".`,
                    };
                }

                const result = JSON.parse(latest.diagnosis.result);
                const roadmap = result.roadmap || [];

                if (roadmap.length === 0) {
                    return {
                        sql: `-- Diagnóstico sin roadmap`,
                        data: [{ mensaje: 'El diagnóstico más reciente no incluye roadmap' }],
                        explanation: `El último diagnóstico de "${companyName}" no tiene hoja de ruta.`,
                    };
                }

                const data = roadmap.map((phase: any) => ({
                    fase: phase.phase || phase.name || 'N/A',
                    enfoque: phase.focus || 'N/A',
                    objetivos: Array.isArray(phase.objectives) ? phase.objectives.join('; ') : 'N/A',
                }));

                return {
                    sql: `SELECT roadmap FROM "Diagnosis" d\nJOIN "Answer" a ON d."answerId" = a."id"\nWHERE a."companyId" = '${companyId}'\nORDER BY d."createdAt" DESC LIMIT 1`,
                    data,
                    explanation: `Hoja de ruta para "${companyName}" con ${roadmap.length} fase(s) de mejora.`,
                };
            },
        },

        // --- Resumen general / overview ---
        {
            patterns: [
                /resumen\s+(general|completo|ejecutivo)/i,
                /overview/i,
                /estado\s+(general|actual)/i,
                /c[oó]mo\s+(est[aá]|va|se\s+encuentra)\s+(la\s+empresa|esta\s+empresa)/i,
                /situaci[oó]n\s+(actual|general)/i,
                /dame\s+un\s+resumen/i,
            ],
            handler: async (prisma, companyId, companyName) => {
                const company = await prisma.company.findUnique({ where: { id: companyId } });
                const answers = await prisma.answer.findMany({
                    where: { companyId },
                    include: { diagnosis: true, assessment: true },
                });

                const totalAnswers = answers.length;
                const withDiagnosis = answers.filter((a: any) => a.diagnosis).length;
                const scores = answers.filter((a: any) => a.diagnosis?.score).map((a: any) => a.diagnosis.score);
                const avgScore = scores.length > 0 ? Number((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(2)) : null;

                const instruments = new Set(answers.map((a: any) => a.assessment?.title).filter(Boolean));
                const positions = new Set(answers.map((a: any) => a.respondentPosition).filter(Boolean));

                const data = [{
                    empresa: companyName,
                    sector: company?.sector || 'N/A',
                    tamaño: company?.size || 'N/A',
                    total_evaluaciones: totalAnswers,
                    con_diagnostico: withDiagnosis,
                    puntaje_promedio: avgScore ?? 'Sin datos',
                    instrumentos_usados: Array.from(instruments).join(', ') || 'Ninguno',
                    cargos_participantes: Array.from(positions).join(', ') || 'N/A',
                }];

                return {
                    sql: `SELECT c."name", c."sector", c."size",\n  COUNT(a."id") AS total_evaluaciones,\n  AVG(d."score") AS puntaje_promedio\nFROM "Company" c\nLEFT JOIN "Answer" a ON a."companyId" = c."id"\nLEFT JOIN "Diagnosis" d ON d."answerId" = a."id"\nWHERE c."id" = '${companyId}'\nGROUP BY c."id"`,
                    data,
                    explanation: `Resumen general de "${companyName}": ${totalAnswers} evaluación(es), puntaje promedio ${avgScore ?? 'sin datos'}.`,
                };
            },
        },
    ];
}

/**
 * Execute a natural language query against the database
 */
export async function executeNaturalQuery(
    prisma: any,
    nlQuery: string,
    companyId: string,
    companyName: string
): Promise<QueryResult> {
    const patterns = buildQueryPatterns();

    for (const { patterns: regexes, handler } of patterns) {
        for (const regex of regexes) {
            const match = nlQuery.match(regex);
            if (match) {
                return handler(prisma, companyId, companyName, match);
            }
        }
    }

    // Fallback: return a helpful message with available queries
    return {
        sql: `-- No se pudo interpretar la consulta: "${nlQuery}"`,
        data: [
            { tipo: 'Diagnósticos', ejemplo: '¿Cuántos diagnósticos se han completado?' },
            { tipo: 'Dimensiones', ejemplo: '¿Cuál es el puntaje promedio por dimensión?' },
            { tipo: 'Debilidades', ejemplo: '¿Cuál es la dimensión con menor desempeño?' },
            { tipo: 'Fortalezas', ejemplo: '¿Cuál es la dimensión con mejor desempeño?' },
            { tipo: 'Madurez', ejemplo: '¿Cuál es el nivel de madurez?' },
            { tipo: 'Listar', ejemplo: 'Listar todos los diagnósticos con sus puntajes' },
            { tipo: 'Participantes', ejemplo: '¿Quiénes respondieron la evaluación?' },
            { tipo: 'Recomendaciones', ejemplo: '¿Qué debe mejorar la empresa?' },
            { tipo: 'Instrumentos', ejemplo: 'Comparar resultados por instrumento' },
            { tipo: 'Por cargo', ejemplo: '¿Cuál es el puntaje por cargo?' },
            { tipo: 'Roadmap', ejemplo: '¿Cuál es la hoja de ruta de mejora?' },
            { tipo: 'Resumen', ejemplo: 'Dame un resumen general de la empresa' },
        ],
        explanation: `No pude interpretar tu pregunta. Aquí tienes ejemplos de consultas que puedo responder para la empresa "${companyName}".`,
    };
}
