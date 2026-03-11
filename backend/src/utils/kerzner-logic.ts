/**
 * Kerzner Project Management Maturity Calculation Logic
 * Based on Harold Kerzner - Project Management Book
 */

interface KerznerDimension {
    name: string;
    items: string[];
    description: string;
}

export const KERZNER_DIMENSIONS: Record<string, KerznerDimension> = {
    K1: {
        name: 'Cultura y Lenguaje Común',
        items: ['K1', 'K2', 'K3', 'K4', 'K5'],
        description: 'Evalúa la existencia de un lenguaje compartido y roles claramente definidos en gestión de proyectos.'
    },
    K2: {
        name: 'Metodología Institucionalizada',
        items: ['K6', 'K7', 'K8', 'K9', 'K10'],
        description: 'Mide la existencia de procesos estandarizados y sistemáticos en gestión de proyectos.'
    },
    K3: {
        name: 'Gobernanza y Portafolio',
        items: ['K11', 'K12', 'K13', 'K14', 'K15'],
        description: 'Evalúa la priorización estratégica y gestión del portafolio de proyectos.'
    },
    K4: {
        name: 'Mejora Continua Estratégica',
        items: ['K16', 'K17', 'K18', 'K19', 'K20'],
        description: 'Mide la capacidad de aprendizaje organizacional y adaptación estratégica.'
    }
};

/**
 * Calculate Kerzner PM Maturity score
 * @param responses - Object with item IDs as keys and scores (1-7) as values
 * @returns Foundations scores and overall maturity level
 */
export function calculateKerznerMaturity(responses: Record<string, number>) {
    const dimensions = Object.entries(KERZNER_DIMENSIONS).map(([id, dim]) => {
        const itemScores = dim.items.map(itemId => {
            const rawValue = responses[itemId] || 4; // Default neutral value for 7-point scale
            return rawValue;
        });

        const average = itemScores.reduce((a, b) => a + b, 0) / itemScores.length;
        // Convert to percentage based on 7-point scale (1-7)
        const percentage = ((average - 1) / 6) * 100;

        return {
            id,
            name: dim.name,
            score: Math.round(percentage), // For UI bars (0-100)
            average: Number(average.toFixed(2)), // For detailed reports (1-7)
            description: dim.description,
            items: dim.items.length
        };
    });

    const globalAverage = dimensions.reduce((a, b) => a + b.average, 0) / dimensions.length;

    // Maturity levels based on Kerzner's PMMM model
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

    return {
        dimensions,
        globalScore: Number(globalAverage.toFixed(2)),
        globalPercentage: Math.round(((globalAverage - 1) / 6) * 100),
        maturityLevel,
        status
    };
}

/**
 * Generate personalized recommendations based on dimension scores
 * @param dimensions - Calculated dimension scores
 * @returns Array of recommendations for improvement
 */
export function generateKerznerRecommendations(dimensions: any[]) {
    const { getContextForTopic } = require('./rag-engine');
    const recommendations: any[] = [];

    dimensions.forEach(dim => {
        // Retrieve relevant context from knowledge base documents
        const ragContext = getContextForTopic(`${dim.name} gestión proyectos madurez`, 2);

        if (dim.score < 50) {
            // Critical - needs immediate attention
            recommendations.push({
                dimension: dim.name,
                priority: 'Alta',
                recommendation: getRecommendationForDimension(dim.id, 'critical'),
                actions: getActionsForDimension(dim.id, 'critical'),
                ...(ragContext && { ragContext }),
            });
        } else if (dim.score < 70) {
            // Moderate - opportunity for improvement
            recommendations.push({
                dimension: dim.name,
                priority: 'Media',
                recommendation: getRecommendationForDimension(dim.id, 'moderate'),
                actions: getActionsForDimension(dim.id, 'moderate'),
                ...(ragContext && { ragContext }),
            });
        }
    });

    return recommendations;
}

function getRecommendationForDimension(dimensionId: string, level: 'critical' | 'moderate'): string {
    const recommendations: Record<string, Record<string, string>> = {
        K1: {
            critical: 'Establecer urgentemente un lenguaje común en gestión de proyectos mediante capacitación formal y definición de roles.',
            moderate: 'Reforzar la documentación de lecciones aprendidas y estandarizar prácticas básicas.'
        },
        K2: {
            critical: 'Implementar una metodología formal de gestión de proyectos (PMI, PRINCE2, Agile) adaptada al contexto organizacional.',
            moderate: 'Mejorar la coherencia metodológica entre proyectos y fortalecer el uso de métricas.'
        },
        K3: {
            critical: 'Establecer un proceso formal de gobernanza con criterios explícitos de priorización y participación de alta dirección.',
            moderate: 'Optimizar la revisión periódica del portafolio y la cancelación de proyectos sin valor estratégico.'
        },
        K4: {
            critical: 'Institucionalizar el aprendizaje organizacional mediante procesos formales de mejora continua.',
            moderate: 'Fortalecer la integración entre lecciones aprendidas y decisiones estratégicas futuras.'
        }
    };

    return recommendations[dimensionId]?.[level] || 'Continuar fortaleciendo las prácticas actuales.';
}

function getActionsForDimension(dimensionId: string, level: 'critical' | 'moderate'): string[] {
    const actions: Record<string, Record<string, string[]>> = {
        K1: {
            critical: [
                'Diseñar e impartir programa de certificación interna en PM',
                'Crear glosario organizacional de términos de proyectos',
                'Definir matriz RACI para roles en proyectos',
                'Implementar plantillas estandarizadas de alcance, cronograma y riesgos'
            ],
            moderate: [
                'Establecer sesión formal de lecciones aprendidas al cierre de cada proyecto',
                'Crear repositorio centralizado de casos y buenas prácticas'
            ]
        },
        K2: {
            critical: [
                'Seleccionar metodología de PM (PMI/Agile) alineada con estrategia',
                'Capacitar al equipo en la metodología seleccionada',
                'Implementar software de gestión de proyectos (MS Project, Jira, etc.)',
                'Crear proceso de gestión de riesgos con registro y seguimiento'
            ],
            moderate: [
                'Definir KPIs comunes para todos los proyectos (CPI, SPI, etc.)',
                'Auditar coherencia metodológica entre áreas'
            ]
        },
        K3: {
            critical: [
                'Formar Comité de Portafolio con participación ejecutiva',
                'Definir criterios de priorización (ROI, alineación estratégica, riesgo)',
                'Implementar reuniones trimestrales de revisión de portafolio',
                'Crear procedimiento de cancelación de proyectos no estratégicos'
            ],
            moderate: [
                'Realizar benchmarking con estándares PMI/PMO externos',
                'Implementar dashboard ejecutivo de portafolio'
            ]
        },
        K4: {
            critical: [
                'Crear proceso formal de mejora continua (ciclo PDCA)',
                'Institucionalizar sesiones de retrospectiva post-proyecto',
                'Vincular lecciones aprendidas con planificación estratégica',
                'Establecer indicadores de madurez PM con medición periódica'
            ],
            moderate: [
                'Implementar sistema de alertas tempranas ante cambios del entorno',
                'Crear comunidad de práctica interna en PM'
            ]
        }
    };

    return actions[dimensionId]?.[level] || ['Mantener y reforzar prácticas actuales'];
}

/**
 * Generate a maturity roadmap based on current state
 */
export function generateKerznerRoadmap(dimensions: any[], globalScore: number) {
    const roadmap = [];

    // Phase 1: Foundations (0-6 months)
    if (globalScore < 4.0) {
        roadmap.push({
            phase: 'Fase 1: Fundamentos (0-6 meses)',
            focus: 'Lenguaje Común y Cultura PM',
            objectives: [
                'Establecer terminología y roles básicos',
                'Capacitar al equipo en fundamentos de PM',
                'Implementar plantillas básicas'
            ],
            kpis: ['% personal capacitado', 'Uso de templates', 'Proyectos documentados']
        });
    }

    // Phase 2: Standardization (6-12 months)
    if (globalScore < 5.0) {
        roadmap.push({
            phase: 'Fase 2: Estandarización (6-12 meses)',
            focus: 'Metodología Formal y Procesos',
            objectives: [
                'Implementar metodología PM organizacional',
                'Estandarizar gestión de riesgos',
                'Definir KPIs de desempeño de proyectos'
            ],
            kpis: ['Coherencia metodológica', 'Riesgos identificados', 'Cumplimiento cronograma']
        });
    }

    // Phase 3: Integration (12-18 months)
    if (globalScore < 6.0) {
        roadmap.push({
            phase: 'Fase 3: Integración Estratégica (12-18 meses)',
            focus: 'Gobernanza y Portafolio',
            objectives: [
                'Crear Comité de Portafolio',
                'Vincular proyectos con estrategia organizacional',
                'Implementar criterios de priorización'
            ],
            kpis: ['Proyectos alineados a estrategia', 'ROI del portafolio', 'Participación ejecutiva']
        });
    }

    // Phase 4: Optimization (18+ months)
    roadmap.push({
        phase: 'Fase 4: Optimización Continua (18+ meses)',
        focus: 'Mejora e Innovación',
        objectives: [
            'Institucionalizar aprendizaje organizacional',
            'Realizar benchmarking externo',
            'Adaptar prácticas a cambios del entorno'
        ],
        kpis: ['Lecciones aplicadas', 'Posición vs. benchmark', 'Tiempo de adaptación']
    });

    return roadmap;
}
