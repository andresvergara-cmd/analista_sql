/**
 * Kerzner PM Maturity Report Generator
 * Generates comprehensive reports for Project Management Maturity diagnoses
 */

export interface KerznerDimension {
    id: string;
    name: string;
    score: number;
    average: number;
    description: string;
    items: number;
}

export interface KerznerDiagnosis {
    dimensions: KerznerDimension[];
    globalScore: number;
    globalPercentage: number;
    maturityLevel: string;
    status: string;
    recommendations?: any[];
    roadmap?: any[];
}

/**
 * Generate consolidated report for a company
 * @param diagnoses - Array of diagnosis results
 * @returns Consolidated metrics and analysis
 */
export function generateKerznerCompanyReport(diagnoses: KerznerDiagnosis[]) {
    if (!diagnoses || diagnoses.length === 0) {
        throw new Error('No diagnoses provided for report generation');
    }

    // Calculate average scores per dimension across all respondents
    const dimensionAverages: Record<string, { sum: number; count: number; name: string; description: string }> = {};

    diagnoses.forEach(diag => {
        diag.dimensions.forEach(dim => {
            if (!dimensionAverages[dim.id]) {
                dimensionAverages[dim.id] = {
                    sum: 0,
                    count: 0,
                    name: dim.name,
                    description: dim.description
                };
            }
            dimensionAverages[dim.id].sum += dim.average;
            dimensionAverages[dim.id].count += 1;
        });
    });

    // Calculate consolidated dimensions
    const consolidatedDimensions = Object.entries(dimensionAverages).map(([id, data]) => {
        const average = data.sum / data.count;
        const percentage = ((average - 1) / 6) * 100;

        return {
            id,
            name: data.name,
            average: Number(average.toFixed(2)),
            score: Math.round(percentage),
            description: data.description,
            respondents: data.count
        };
    });

    // Calculate overall score
    const globalAverage = consolidatedDimensions.reduce((sum, dim) => sum + dim.average, 0) / consolidatedDimensions.length;
    const globalPercentage = Math.round(((globalAverage - 1) / 6) * 100);

    // Determine maturity level
    let maturityLevel = 'Nivel 1 - Lenguaje Común';
    let status = 'Inicial';

    if (globalAverage >= 6.5) {
        maturityLevel = 'Nivel 5 - Mejora Continua';
        status = 'Optimizado';
    } else if (globalAverage >= 5.5) {
        maturityLevel = 'Nivel 4 - Benchmarking';
        status = 'Gestionado';
    } else if (globalAverage >= 4.5) {
        maturityLevel = 'Nivel 3 - Metodología Única';
        status = 'Definido';
    } else if (globalAverage >= 3.5) {
        maturityLevel = 'Nivel 2 - Procesos Comunes';
        status = 'En Desarrollo';
    }

    // Calculate standard deviation per dimension (measure of consensus)
    const dimensionVariability = consolidatedDimensions.map(dim => {
        const scores = diagnoses.map(diag => {
            const dimData = diag.dimensions.find(d => d.id === dim.id);
            return dimData ? dimData.average : 0;
        });

        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);

        return {
            dimension: dim.name,
            stdDev: Number(stdDev.toFixed(2)),
            consensus: stdDev < 1.0 ? 'Alto' : stdDev < 1.5 ? 'Medio' : 'Bajo'
        };
    });

    // Generate strategic recommendations
    const recommendations = generateStrategicRecommendations(consolidatedDimensions);

    // Generate improvement roadmap
    const roadmap = generateImprovementRoadmap(consolidatedDimensions, globalAverage);

    return {
        summary: {
            totalResponses: diagnoses.length,
            globalScore: Number(globalAverage.toFixed(2)),
            globalPercentage,
            maturityLevel,
            status
        },
        dimensions: consolidatedDimensions,
        variability: dimensionVariability,
        recommendations,
        roadmap
    };
}

/**
 * Generate strategic recommendations based on dimension scores
 */
function generateStrategicRecommendations(dimensions: any[]): any[] {
    const recommendations = [];

    // Identify critical dimensions (score < 50%)
    const critical = dimensions.filter(d => d.score < 50).sort((a, b) => a.score - b.score);

    // Identify opportunities (score 50-70%)
    const opportunities = dimensions.filter(d => d.score >= 50 && d.score < 70).sort((a, b) => a.score - b.score);

    // Identify strengths (score >= 70%)
    const strengths = dimensions.filter(d => d.score >= 70).sort((a, b) => b.score - a.score);

    // Critical recommendations
    critical.forEach((dim, index) => {
        recommendations.push({
            priority: 'CRÍTICA',
            dimension: dim.name,
            currentScore: dim.score,
            gap: `${100 - dim.score}% hasta nivel óptimo`,
            recommendation: getCriticalRecommendation(dim.id),
            quickWins: getQuickWins(dim.id),
            estimatedImpact: 'Alto - Requiere acción inmediata'
        });
    });

    // Opportunity recommendations
    opportunities.forEach((dim, index) => {
        if (index < 2) { // Top 2 opportunities
            recommendations.push({
                priority: 'MEDIA',
                dimension: dim.name,
                currentScore: dim.score,
                gap: `${100 - dim.score}% hasta nivel óptimo`,
                recommendation: getOpportunityRecommendation(dim.id),
                quickWins: getQuickWins(dim.id),
                estimatedImpact: 'Medio - Potencial de mejora significativo'
            });
        }
    });

    // Leverage strengths
    if (strengths.length > 0) {
        recommendations.push({
            priority: 'MANTENIMIENTO',
            dimension: 'Fortalezas Organizacionales',
            currentScore: Math.max(...strengths.map(s => s.score)),
            gap: 'N/A',
            recommendation: `Mantener y potenciar las fortalezas en: ${strengths.map(s => s.name).join(', ')}. Usar como referencia para elevar otras dimensiones.`,
            quickWins: ['Documentar mejores prácticas', 'Crear casos de éxito internos', 'Compartir conocimiento entre equipos'],
            estimatedImpact: 'Alto - Aprovechar momentum existente'
        });
    }

    return recommendations;
}

function getCriticalRecommendation(dimensionId: string): string {
    const recommendations: Record<string, string> = {
        K1: 'URGENTE: Implementar programa de capacitación en fundamentos de PM y crear glosario organizacional de términos estándar.',
        K2: 'URGENTE: Seleccionar e implementar metodología formal de gestión de proyectos (PMI/Agile/PRINCE2) alineada con estrategia.',
        K3: 'URGENTE: Establecer Comité de Portafolio con participación ejecutiva y criterios explícitos de priorización estratégica.',
        K4: 'URGENTE: Institucionalizar procesos de mejora continua con ciclo PDCA y vinculación formal de lecciones aprendidas.'
    };
    return recommendations[dimensionId] || 'Requiere atención inmediata para elevar madurez organizacional.';
}

function getOpportunityRecommendation(dimensionId: string): string {
    const recommendations: Record<string, string> = {
        K1: 'Reforzar documentación de lecciones aprendidas y crear repositorio centralizado de conocimiento PM.',
        K2: 'Optimizar coherencia metodológica entre proyectos y fortalecer el uso sistemático de métricas de desempeño.',
        K3: 'Implementar dashboard ejecutivo de portafolio y realizar benchmarking con estándares PMI externos.',
        K4: 'Crear comunidad de práctica interna en PM y sistema de alertas tempranas ante cambios del entorno.'
    };
    return recommendations[dimensionId] || 'Oportunidad de mejora con impacto moderado.';
}

function getQuickWins(dimensionId: string): string[] {
    const quickWins: Record<string, string[]> = {
        K1: [
            'Crear plantilla única de acta de proyecto (1 semana)',
            'Definir roles RACI básicos para proyectos (2 semanas)',
            'Implementar sesión de lecciones aprendidas al cierre (inmediato)'
        ],
        K2: [
            'Estandarizar formato de cronograma (1 semana)',
            'Implementar registro único de riesgos (2 semanas)',
            'Definir 3 KPIs comunes para todos los proyectos (1 semana)'
        ],
        K3: [
            'Crear calendario de revisiones trimestrales de portafolio (inmediato)',
            'Definir matriz de criterios de priorización (2 semanas)',
            'Implementar plantilla de business case (1 semana)'
        ],
        K4: [
            'Crear formulario estándar de retrospectiva (1 semana)',
            'Implementar base de datos de lecciones aprendidas (2 semanas)',
            'Establecer ritual mensual de revisión de mejoras (inmediato)'
        ]
    };
    return quickWins[dimensionId] || ['Identificar oportunidades específicas con equipo de proyecto'];
}

/**
 * Generate phased improvement roadmap
 */
function generateImprovementRoadmap(dimensions: any[], globalScore: number): any[] {
    const roadmap = [];

    // Identify weakest dimensions
    const weakest = dimensions.filter(d => d.score < 60).sort((a, b) => a.score - b.score);

    if (weakest.length > 0 || globalScore < 4.5) {
        roadmap.push({
            phase: 'FASE 1: Fundamentos (0-6 meses)',
            objective: 'Establecer lenguaje común y procesos básicos',
            focus: weakest.length > 0 ? weakest.map(d => d.name).slice(0, 2).join(', ') : 'Cultura y Metodología',
            actions: [
                'Capacitación en fundamentos de gestión de proyectos',
                'Definir glosario y roles básicos',
                'Implementar templates mínimos viables',
                'Crear matriz RACI organizacional'
            ],
            kpis: [
                '% de personal capacitado en PM básico',
                'Número de proyectos usando templates estándar',
                'Nivel de adopción de terminología común'
            ],
            expectedOutcome: 'Base sólida de conocimiento PM en la organización'
        });
    }

    if (globalScore < 5.5) {
        roadmap.push({
            phase: 'FASE 2: Estandarización (6-12 meses)',
            objective: 'Institucionalizar metodología y procesos',
            focus: 'Metodología y Gobernanza',
            actions: [
                'Implementar metodología PM formal seleccionada',
                'Estandarizar gestión de riesgos y cambios',
                'Crear Comité de Portafolio',
                'Definir KPIs estándar de proyectos'
            ],
            kpis: [
                'Coherencia metodológica entre proyectos (%)',
                'Riesgos identificados y gestionados por proyecto',
                'Proyectos priorizados con criterios explícitos (%)'
            ],
            expectedOutcome: 'Metodología organizacional operativa y portafolio priorizado'
        });
    }

    if (globalScore < 6.5) {
        roadmap.push({
            phase: 'FASE 3: Integración Estratégica (12-18 meses)',
            objective: 'Alinear portafolio con estrategia corporativa',
            focus: 'Gobernanza y Mejora Continua',
            actions: [
                'Vincular proyectos con objetivos estratégicos',
                'Implementar balanced scorecard de portafolio',
                'Realizar benchmarking externo',
                'Crear sistema de mejora continua formal'
            ],
            kpis: [
                'ROI del portafolio de proyectos',
                'Alineación estratégica (% proyectos vinculados a objetivos)',
                'Posición vs. benchmark sectorial'
            ],
            expectedOutcome: 'Portafolio estratégico que impulsa ventaja competitiva'
        });
    }

    roadmap.push({
        phase: 'FASE 4: Excelencia y Optimización (18+ meses)',
        objective: 'Cultura de mejora continua e innovación en PM',
        focus: 'Todas las dimensiones',
        actions: [
            'Institucionalizar aprendizaje organizacional',
            'Innovar en metodologías y herramientas',
            'Desarrollar capacidades internas de consultoría PM',
            'Compartir mejores prácticas con ecosistema'
        ],
        kpis: [
            'Lecciones aprendidas aplicadas en nuevos proyectos (%)',
            'Tiempo de adaptación a cambios del entorno',
            'Satisfacción de stakeholders con gestión PM'
        ],
        expectedOutcome: 'Organización líder en madurez PM con mejora continua institucionalizada'
    });

    return roadmap;
}

/**
 * Generate perception analysis by role/position
 */
export function generateKerznerPerceptionAnalysis(diagnoses: any[], positions: string[]) {
    const perceptionByPosition: Record<string, any> = {};

    diagnoses.forEach(diag => {
        const pos = diag.position || 'Sin especificar';
        if (!perceptionByPosition[pos]) {
            perceptionByPosition[pos] = {
                count: 0,
                dimensions: {} as Record<string, { sum: number; count: number }>
            };
        }

        perceptionByPosition[pos].count += 1;

        diag.dimensions.forEach((dim: KerznerDimension) => {
            if (!perceptionByPosition[pos].dimensions[dim.id]) {
                perceptionByPosition[pos].dimensions[dim.id] = { sum: 0, count: 0 };
            }
            perceptionByPosition[pos].dimensions[dim.id].sum += dim.average;
            perceptionByPosition[pos].dimensions[dim.id].count += 1;
        });
    });

    // Calculate averages
    const result = Object.entries(perceptionByPosition).map(([position, data]) => {
        const dimAverages = Object.entries(data.dimensions).map(([dimId, dimData]) => ({
            dimension: dimId,
            average: Number((dimData.sum / dimData.count).toFixed(2))
        }));

        const overallAverage = dimAverages.reduce((sum, d) => sum + d.average, 0) / dimAverages.length;

        return {
            position,
            respondents: data.count,
            dimensions: dimAverages,
            overallScore: Number(overallAverage.toFixed(2))
        };
    });

    return result;
}
