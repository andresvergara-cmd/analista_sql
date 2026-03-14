/**
 * Kroh et al. 2020 Digital Maturity Calculation Logic
 */

interface KrohDimension {
    name: string;
    items: string[];
    description: string;
    isInverse?: boolean;
}

export const KROH_DIMENSIONS: Record<string, KrohDimension> = {
    DIF: {
        name: 'Digital Focus',
        items: ['I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10'],
        description: 'Estrategia, metas y recursos asignados.'
    },
    DIP: {
        name: 'Digital Innovation Process',
        items: ['I11', 'I12', 'I13', 'I14'],
        description: 'Agilidad y flexibilidad en el desarrollo.'
    },
    DMI: {
        name: 'Digital Mindset',
        items: ['I17', 'I18', 'I19', 'I20'],
        description: 'Cultura y entendimiento compartido.'
    },
    DIN: {
        name: 'Digital Innovation Network',
        items: ['I22', 'I23', 'I24', 'I25'],
        description: 'Colaboración con socios externos y ecosistemas.'
    },
    DTC: {
        name: 'Digital Tech Capability',
        items: ['I26', 'I27', 'I28', 'I29', 'I30'],
        description: 'Capacidad para identificar tecnologías clave.'
    },
    DMA: {
        name: 'Data Management',
        items: ['I31', 'I32', 'I33'],
        description: 'Gestión operativa y coordinación de datos.'
    },
    DIR: {
        name: 'Overcoming Resistance',
        items: ['I34', 'I35', 'I36', 'I38'],
        description: 'Superación de barreras (Escala Invertida).',
        isInverse: true
    },
    AIA: {
        name: 'AI Attention Infrastructure',
        items: ['A1', 'A2', 'A3', 'A4', 'A5'],
        description: 'Infraestructura de atención directiva para IA (Angelshaug 2025).'
    }
};

export function calculateKrohMaturity(responses: Record<string, number>) {
    const foundations = Object.entries(KROH_DIMENSIONS).map(([id, dim]) => {
        // Filter out "No Sabe" (0) responses - only include valid answers (1-5)
        const itemScores = dim.items
            .map(itemId => {
                const rawValue = responses[itemId];
                // Skip items with value 0 (No Sabe) or undefined
                if (rawValue === undefined || rawValue === null || rawValue === 0) return null;
                return (dim as KrohDimension).isInverse ? (6 - rawValue) : rawValue;
            })
            .filter((v): v is number => v !== null);

        const average = itemScores.length > 0
            ? itemScores.reduce((a, b) => a + b, 0) / itemScores.length
            : 0;
        const percentage = (average / 5) * 100;

        return {
            id,
            name: dim.name,
            score: Math.round(percentage), // For UI bars
            average: Number(average.toFixed(2)), // For detailed reports
            description: dim.description,
            items: dim.items.length
        };
    });

    const globalAverage = foundations.reduce((a, b) => a + b.average, 0) / foundations.length;

    let status = 'Inicial';
    if (globalAverage >= 4.5) status = 'Líder Digital';
    else if (globalAverage >= 3.5) status = 'Avanzado';
    else if (globalAverage >= 2.5) status = 'En Transformación Digital';
    else if (globalAverage >= 1.5) status = 'En Desarrollo';

    return {
        foundations,
        globalScore: Number(globalAverage.toFixed(1)),
        status
    };
}

/**
 * Generate personalized recommendations based on digital maturity dimension scores
 * Based on Kroh et al. 2020 Digital Transformation Framework
 * @param foundations - Calculated dimension scores
 * @returns Array of recommendations for digital transformation
 */
export function generateKrohRecommendations(foundations: any[]) {
    const { getContextForTopic } = require('./rag-engine');
    const recommendations: any[] = [];

    foundations.forEach(dim => {
        // Retrieve relevant context from knowledge base documents
        const ragContext = getContextForTopic(`${dim.name} transformación digital madurez`, 2);

        if (dim.score < 50) {
            // Critical - needs immediate attention for digital transformation
            recommendations.push({
                dimension: dim.name,
                priority: 'Alta',
                recommendation: getRecommendationForDimension(dim.id, 'critical'),
                actions: getActionsForDimension(dim.id, 'critical'),
                ...(ragContext && { ragContext }),
            });
        } else if (dim.score < 70) {
            // Moderate - opportunity for digital advancement
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
        DIF: {
            critical: 'Establecer urgentemente una estrategia digital clara con compromiso ejecutivo y asignación de recursos específicos para la transformación digital.',
            moderate: 'Reforzar la alineación entre la estrategia digital y los objetivos de negocio, aumentando la visibilidad de iniciativas digitales a nivel directivo.'
        },
        DIP: {
            critical: 'Implementar metodologías ágiles e iterativas para el desarrollo de innovaciones digitales, con equipos multidisciplinarios y ciclos rápidos de validación.',
            moderate: 'Optimizar procesos actuales de innovación reduciendo fricciones burocráticas y aumentando la experimentación controlada.'
        },
        DMI: {
            critical: 'Transformar la cultura organizacional mediante capacitación intensiva en competencias digitales y fomentando mentalidad de aprendizaje continuo.',
            moderate: 'Fortalecer la alfabetización digital en todos los niveles y crear comunidades de práctica para compartir conocimiento digital.'
        },
        DIN: {
            critical: 'Desarrollar alianzas estratégicas con startups, universidades y centros de innovación para acceder a capacidades digitales externas.',
            moderate: 'Expandir el ecosistema actual de innovación abierta y formalizar mecanismos de colaboración con socios externos.'
        },
        DTC: {
            critical: 'Construir capacidades tecnológicas fundamentales mediante inversión en arquitectura cloud, APIs, data platforms y talento técnico especializado.',
            moderate: 'Modernizar la infraestructura tecnológica existente y adoptar tecnologías emergentes alineadas con la estrategia digital.'
        },
        DMA: {
            critical: 'Establecer gobernanza de datos robusta, implementar plataforma centralizada de datos y desarrollar capacidades analíticas básicas.',
            moderate: 'Avanzar hacia analítica avanzada y uso estratégico de datos para toma de decisiones basada en evidencia.'
        },
        DIR: {
            critical: 'Implementar programa formal de gestión del cambio con patrocinadores ejecutivos, comunicación clara y abordaje explícito de resistencias.',
            moderate: 'Reforzar mecanismos de participación, reconocer adopción temprana y mantener comunicación bidireccional sobre el proceso de transformación.'
        },
        AIA: {
            critical: 'Crear estructura de gobernanza para IA, definir casos de uso prioritarios y desarrollar capacidades técnicas y éticas en inteligencia artificial.',
            moderate: 'Escalar iniciativas de IA actuales, establecer centro de excelencia y garantizar uso responsable y transparente de la tecnología.'
        }
    };

    return recommendations[dimensionId]?.[level] || 'Continuar fortaleciendo las capacidades digitales actuales.';
}

function getActionsForDimension(dimensionId: string, level: 'critical' | 'moderate'): string[] {
    const actions: Record<string, Record<string, string[]>> = {
        DIF: {
            critical: [
                'Crear comité ejecutivo de transformación digital con sponsor C-level',
                'Definir visión y objetivos digitales medibles alineados con estrategia corporativa',
                'Asignar presupuesto específico (% de ingresos) para iniciativas digitales',
                'Nombrar Chief Digital Officer (CDO) o responsable de transformación digital',
                'Establecer KPIs de madurez digital con revisión trimestral en junta directiva'
            ],
            moderate: [
                'Crear roadmap de transformación digital a 3 años con hitos claros',
                'Aumentar comunicación ejecutiva sobre logros y objetivos digitales',
                'Vincular incentivos de liderazgo con avance en objetivos digitales'
            ]
        },
        DIP: {
            critical: [
                'Implementar metodología ágil (Scrum/Kanban) para proyectos de innovación digital',
                'Crear equipos multidisciplinarios con autonomía para experimentación',
                'Establecer proceso de ideación-prototipado-validación con ciclos de 2-4 semanas',
                'Implementar cultura de "fail fast" con aprendizaje sistemático de fracasos',
                'Crear sandbox digital para pruebas de concepto sin afectar operación'
            ],
            moderate: [
                'Reducir etapas de aprobación en proyectos digitales de bajo riesgo',
                'Implementar revisiones ágiles con stakeholders cada 2 semanas',
                'Crear repositorio de experimentos digitales y lecciones aprendidas'
            ]
        },
        DMI: {
            critical: [
                'Lanzar programa de alfabetización digital para 100% de colaboradores',
                'Crear academia digital interna con certificaciones en competencias clave',
                'Establecer tiempo protegido (ej: 10% semanal) para aprendizaje digital',
                'Formar embajadores digitales en cada área como agentes de cambio',
                'Reconocer y celebrar públicamente comportamientos digitales deseados'
            ],
            moderate: [
                'Crear comunidades de práctica digital por dominio (data, UX, cloud, etc.)',
                'Implementar programa de mentoring digital entre áreas',
                'Organizar eventos internos de innovación (hackathons, demo days)'
            ]
        },
        DIN: {
            critical: [
                'Establecer programa formal de innovación abierta con startups',
                'Crear alianzas con 2-3 universidades para I+D digital colaborativo',
                'Participar en aceleradoras, incubadoras o hubs de innovación sectorial',
                'Definir proceso de scouting de tecnologías emergentes y tendencias',
                'Implementar pilotos conjuntos con proveedores tecnológicos estratégicos'
            ],
            moderate: [
                'Formalizar convenios de colaboración con socios actuales',
                'Crear vehículo de corporate venture capital para inversión en startups',
                'Participar en consorcios industriales de transformación digital'
            ]
        },
        DTC: {
            critical: [
                'Migrar infraestructura crítica a cloud (AWS/Azure/GCP)',
                'Implementar arquitectura API-first y microservicios para flexibilidad',
                'Construir data lake/warehouse centralizado con acceso democratizado',
                'Contratar/desarrollar talento en cloud, data engineering, DevOps',
                'Establecer roadmap tecnológico alineado con arquitectura de referencia'
            ],
            moderate: [
                'Modernizar aplicaciones legacy con enfoque de modernización incremental',
                'Evaluar y adoptar tecnologías emergentes (IoT, blockchain, edge computing)',
                'Implementar prácticas de DevSecOps para agilidad y seguridad'
            ]
        },
        DMA: {
            critical: [
                'Nombrar Chief Data Officer (CDO) con reporte a C-level',
                'Implementar plataforma de gestión de datos maestros (MDM)',
                'Crear políticas de gobernanza de datos (calidad, privacidad, acceso)',
                'Desarrollar capacidades de analítica descriptiva y diagnóstica',
                'Capacitar ciudadanos de datos (data literacy) en áreas clave'
            ],
            moderate: [
                'Avanzar a analítica predictiva y prescriptiva con modelos de ML',
                'Implementar dashboards ejecutivos en tiempo real',
                'Crear data marketplace interno para compartir datasets'
            ]
        },
        DIR: {
            critical: [
                'Diseñar programa de gestión del cambio siguiendo modelo Kotter/ADKAR',
                'Identificar resistencias mediante encuestas y focus groups',
                'Establecer red de sponsors y champions en todos los niveles',
                'Comunicar "burning platform" y urgencia de transformación digital',
                'Crear quick wins visibles para generar momentum'
            ],
            moderate: [
                'Mantener comunicación bidireccional sobre avances y preocupaciones',
                'Reconocer early adopters y crear incentivos para adopción',
                'Implementar sesiones de escucha activa con equipos afectados'
            ]
        },
        AIA: {
            critical: [
                'Crear comité de ética y gobernanza de IA multidisciplinario',
                'Identificar 3-5 casos de uso de IA de alto impacto y viabilidad',
                'Desarrollar capacidades en ML/IA mediante contratación o partners',
                'Establecer principios éticos de IA (transparencia, equidad, privacidad)',
                'Implementar primeros pilotos de IA con métricas de impacto claras'
            ],
            moderate: [
                'Escalar casos de uso exitosos de IA a producción completa',
                'Crear centro de excelencia en IA para democratizar capacidades',
                'Implementar MLOps para industrialización de modelos de IA',
                'Monitorear sesgos y drift en modelos de IA en producción'
            ]
        }
    };

    return actions[dimensionId]?.[level] || ['Mantener y reforzar prácticas digitales actuales'];
}

/**
 * Generate a digital transformation roadmap based on current maturity
 * Based on Kroh et al. 2020 maturity stages
 */
export function generateKrohRoadmap(foundations: any[], globalScore: number) {
    const roadmap = [];

    // Phase 1: Digital Foundations (0-6 months)
    if (globalScore < 2.5) {
        roadmap.push({
            phase: 'Fase 1: Fundamentos Digitales (0-6 meses)',
            focus: 'Estrategia Digital y Cultura',
            objectives: [
                'Definir visión y estrategia digital clara con compromiso ejecutivo',
                'Iniciar programa de alfabetización digital organizacional',
                'Establecer gobernanza de transformación digital',
                'Realizar diagnóstico de capacidades tecnológicas actuales'
            ],
            kpis: ['% de liderazgo capacitado en digital', 'Presupuesto digital asignado', 'KPIs digitales definidos']
        });
    }

    // Phase 2: Digital Capabilities (6-12 months)
    if (globalScore < 3.5) {
        roadmap.push({
            phase: 'Fase 2: Construcción de Capacidades (6-12 meses)',
            focus: 'Infraestructura y Procesos Digitales',
            objectives: [
                'Modernizar arquitectura tecnológica (cloud, APIs, data)',
                'Implementar metodologías ágiles para innovación digital',
                'Desarrollar capacidades analíticas y de datos',
                'Iniciar alianzas con ecosistema de innovación externa'
            ],
            kpis: ['% de infraestructura en cloud', 'Proyectos ágiles activos', 'Casos de uso de datos implementados']
        });
    }

    // Phase 3: Digital Transformation (12-18 months)
    if (globalScore < 4.5) {
        roadmap.push({
            phase: 'Fase 3: Transformación Digital (12-18 meses)',
            focus: 'Escalar Innovación y Cultura Digital',
            objectives: [
                'Escalar iniciativas digitales exitosas a toda la organización',
                'Consolidar mentalidad digital en todos los niveles',
                'Implementar casos de uso avanzados de IA y analítica',
                'Fortalecer red de innovación abierta con startups y universidades'
            ],
            kpis: ['% de ingresos de productos/servicios digitales', 'NPS de experiencia digital', 'Patentes/innovaciones digitales']
        });
    }

    // Phase 4: Digital Leadership (18+ months)
    roadmap.push({
        phase: 'Fase 4: Liderazgo Digital (18+ meses)',
        focus: 'Innovación Continua y Ventaja Competitiva',
        objectives: [
            'Posicionar como líder digital en el sector',
            'Crear nuevos modelos de negocio habilitados digitalmente',
            'Desarrollar capacidades diferenciadas en IA y tecnologías emergentes',
            'Institucionalizar cultura de experimentación y aprendizaje continuo'
        ],
        kpis: ['Posición en rankings de madurez digital', 'ROI de inversión digital', 'Tiempo de time-to-market de innovaciones']
    });

    return roadmap;
}
