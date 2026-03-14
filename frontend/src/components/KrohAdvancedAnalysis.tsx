"use client";

import { useMemo } from 'react';

// Información enriquecida para recomendaciones estratégicas
const DIMENSION_INSIGHTS: Record<string, any> = {
    DIF: {
        contextoCritico: 'Según Kroh et al. (2020), Digital Focus representa la capacidad de SENSING del modelo de capacidades dinámicas. Una debilidad aquí indica que la organización carece de "atención directiva" (Ocasio, 1997) hacia las oportunidades digitales, lo que bloquea cualquier transformación posterior.',
        impactoEsperado: 'Mejoras en DIF desbloquean las demás dimensiones al proveer dirección estratégica clara, recursos dedicados y sponsorship ejecutivo. Estudios muestran que organizaciones con alto Digital Focus alcanzan 2.3x mayor ROI en iniciativas digitales.',
        kpis: ['% de presupuesto asignado a digital (objetivo: 15-25% del CAPEX)', 'Número de OKRs digitales en plan estratégico (objetivo: ≥3)', 'Tiempo de TMT dedicado a temas digitales (objetivo: ≥30% de agenda mensual)', 'Existencia de CDO o rol equivalente (sí/no)'],
        riesgos: ['Alineación superficial sin compromiso presupuestal real', 'Falta de continuidad si no hay sponsor ejecutivo', 'Visión digital desconectada de la estrategia de negocio'],
        secuenciacion: ['1º: Sesión de alineación con C-level para definir visión digital', '2º: Asignar presupuesto mínimo viable (0.5-1% ingresos) para quick wins', '3º: Crear comité de transformación digital con representación cross-funcional', '4º: Definir 3-5 OKRs digitales para próximos 6-12 meses', '5º: Comunicar cascada de visión digital a toda la organización'],
        recursos: ['Facilitador externo para workshop de visión digital ($5K-15K)', 'Presupuesto seed para iniciativas digitales (0.5-2% ingresos anuales)', 'Tiempo de TMT: 3-4 sesiones de 4 horas en primeros 3 meses', 'Consultoría estratégica digital opcional ($20K-50K)'],
        interdependencias: 'DIF es prerrequisito para DIP y DMI. Sin foco estratégico claro, los procesos de innovación (DIP) carecen de dirección y la mentalidad digital (DMI) no logra tracción organizacional.',
        timeline: '3-6 meses para establecer gobernanza y primeros quick wins visibles. 12-18 meses para ver impacto en bottom-line financiero.'
    },
    DIP: {
        contextoCritico: 'Digital Innovation Process (DIP) representa la capacidad de SEIZING. Kroh et al. (2020) enfatizan que sin procesos ágiles e iterativos, las oportunidades detectadas (DIF) no se materializan en valor capturado. Organizaciones con DIP bajo sufren "análisis-parálisis".',
        impactoEsperado: 'Mejoras en DIP aceleran time-to-market de innovaciones digitales en 40-60%. Permiten validar hipótesis con menor inversión (MVPs) y pivotear rápidamente ante feedback del mercado. Reducen costo del fracaso de innovación.',
        kpis: ['Cycle time de ideación a piloto (objetivo: <90 días)', 'Número de experimentos digitales ejecutados por año (objetivo: ≥5)', '% de proyectos digitales usando metodologías ágiles (objetivo: >80%)', 'Tasa de aprendizaje: pivots exitosos/total experimentos (objetivo: >30%)'],
        riesgos: ['Agilidad solo en TI, sin cambiar cultura organizacional', 'Falta de autonomía de equipos para tomar decisiones', 'Procesos legacy de governance bloqueando experimentación'],
        secuenciacion: ['1º: Seleccionar 1-2 iniciativas digitales piloto para aplicar Scrum/Kanban', '2º: Capacitar product owners y scrum masters certificados', '3º: Definir "sandbox" de innovación con governance ligera', '4º: Implementar sprints de 2 semanas con demos frecuentes', '5º: Escalar aprendizajes a otras iniciativas digitales'],
        recursos: ['Training ágil certificado para 5-10 personas ($10K-25K)', 'Herramientas de gestión ágil: Jira, Miro, Confluence (~$5K/año)', 'Coach ágil externo para primeros 3-6 meses ($15K-30K)', 'Tiempo dedicado: equipos 100% asignados a iniciativa piloto'],
        interdependencias: 'DIP depende de DIF (necesita objetivos claros) y habilita DMA (datos generados en experimentos). Complementa DIN (innovación abierta requiere procesos ágiles para colaborar con externos).',
        timeline: '2-4 meses para primeros resultados en piloto. 9-12 meses para adopción organizacional amplia. 18+ meses para "agilidad como ADN".'
    },
    DMI: {
        contextoCritico: 'Digital Mindset (DMI) es la capacidad de TRANSFORMING organizacional. Kroh et al. (2020) identifican que la resistencia cultural es el mayor obstáculo de transformación digital. Sin DMI, las inversiones en tecnología (DTC) y procesos (DIP) no generan valor.',
        impactoEsperado: 'Mejoras en DMI aumentan la velocidad de adopción de nuevas tecnologías en 3-5x. Reducen rotación de talento digital en 25-40%. Organizaciones con alto DMI reportan 50% más innovaciones bottom-up.',
        kpis: ['% de empleados con competencias digitales básicas (objetivo: 100%)', 'eNPS de cultura digital (objetivo: >30)', 'Número de iniciativas digitales bottom-up por año (objetivo: ≥10)', 'Time-to-competency de nuevas tecnologías (objetivo: <6 meses)'],
        riesgos: ['Training sin aplicación práctica (decay de conocimiento)', 'Falta de role models: líderes no modelan comportamiento digital', 'Percepción de "lavado digital" sin cambio real'],
        secuenciacion: ['1º: Assessment de competencias digitales actuales (digital literacy)', '2º: Definir learning paths personalizados por rol', '3º: Lanzar programa de "digital champions" en cada área', '4º: Crear biblioteca de casos de éxito digital internos', '5º: Integrar objetivos de desarrollo digital en evaluación de desempeño'],
        recursos: ['Plataforma LMS para learning digital: Coursera, Udemy Business ($20K-40K/año)', 'Tiempo dedicado: 2-4 horas/semana por empleado', 'Incentivos para certificaciones digitales ($500-2K por persona)', 'Eventos de celebración de innovación digital (2-4 por año, $5K-15K cada uno)'],
        interdependencies: 'DMI amplifica el impacto de DIF (estrategia) y DIP (procesos). Requiere DIR bajo (sin resistencias bloquea cultura). Habilita adopción de DTC y AIA.',
        timeline: '6-9 meses para ver cambios comportamentales iniciales. 18-24 meses para cambio cultural sostenible. 3-5 años para "mentalidad digital como norma".'
    },
    DIN: {
        contextoCritico: 'Digital Innovation Network (DIN) representa el modelo de innovación abierta para capturar capacidades dinámicas externas. Kroh et al. (2020) muestran que organizaciones insulares se quedan rezagadas vs. aquellas que co-crean con ecosistemas externos.',
        impactoEsperado: 'Mejoras en DIN dan acceso a capacidades tecnológicas 10x más rápido que desarrollo interno. Reducen riesgo de inversión en tecnologías emergentes. Organizaciones con DIN fuerte lanzan innovaciones 2x más rápido.',
        kpis: ['Número de alianzas activas con startups/tech partners (objetivo: ≥3)', '% de innovaciones co-creadas con externos (objetivo: >30%)', 'Inversión en corporate venture capital (objetivo: 1-3% de I+D)', 'Tiempo desde contacto externo a POC (objetivo: <60 días)'],
        riesgos: ['Síndrome "Not Invented Here" rechaza ideas externas', 'IP y gobernanza poco clara en colaboraciones', 'Dependencia excesiva de un solo partner tecnológico'],
        secuenciacion: ['1º: Mapear ecosistema de innovación relevante (startups, universidades, tech hubs)', '2º: Definir modelo de engagement: POCs, pilotos, co-innovation', '3º: Crear vehículo jurídico para colaboraciones (CVC, partnership agreements)', '4º: Lanzar 1-2 pilotos con startups seleccionadas', '5º: Escalar aprendizajes y crear deal flow continuo'],
        recursos: ['Scouting de startups: suscripción a plataformas como Dealroom ($5K-10K/año)', 'Budget para POCs con startups: $50K-200K/año', 'Abogados para estructura de partnerships ($10K-30K setup)', 'Innovation manager dedicado a gestionar ecosistema'],
        interdependencies: 'DIN requiere DIP (procesos ágiles para integrar innovación externa) y DTC (capacidad de evaluar tecnologías). Complementa DMA (datos compartidos con partners).',
        timeline: '3-6 meses para primeras alianzas y POCs. 12-18 meses para deal flow consistente. 24+ meses para ecosistema maduro de co-innovación.'
    },
    DTC: {
        contextoCritico: 'Digital Tech Capability (DTC) es la capacidad de SENSING tecnológico. Kroh et al. (2020) identifican que sin competencia para identificar y evaluar tecnologías emergentes, la organización es "disruptida" por competidores más ágiles.',
        impactoEsperado: 'Mejoras en DTC permiten adopción temprana de tecnologías con ventaja competitiva (early mover advantage). Reducen riesgo de obsolescencia tecnológica. Organizaciones con alto DTC tienen 3x más patentes digitales.',
        kpis: ['Número de tecnologías emergentes evaluadas/año (objetivo: ≥10)', 'Tiempo desde detección de tech trend a POC (objetivo: <90 días)', '% del equipo tech certificado en tecnologías emergentes (objetivo: >40%)', 'Número de POCs tecnológicos ejecutados/año (objetivo: ≥4)'],
        riesgos: ['Tech scouting sin criterio de relevancia estratégica', 'POCs que no escalan por falta de integración con legacy', 'Fuga de talento tech por falta de exposición a tecnologías modernas'],
        secuenciacion: ['1º: Crear "radar tecnológico" con herramientas como Gartner Hype Cycle', '2º: Definir criterios de priorización tech (strategic fit, maturity, ROI)', '3º: Asignar tech scouts internos por dominio (IA, cloud, blockchain, etc.)', '4º: Implementar proceso de tech evaluation: assess → POC → scale', '5º: Crear tech lab para experimentación continua'],
        recursos: ['Suscripciones a research tech: Gartner, Forrester ($20K-50K/año)', 'Budget para POCs tecnológicos: $100K-300K/año', 'Tiempo de equipo tech: 20% dedicado a exploración vs. explotación', 'Participación en conferencias tech: 2-4 eventos/año ($10K-25K)'],
        interdependencies: 'DTC alimenta DIF (insights tecnológicos para estrategia) y DIP (adopción de tech en innovación). Requiere DIN (tech scouting en ecosistema externo). Habilita AIA.',
        timeline: '3-6 meses para radar tecnológico operativo. 9-12 meses para pipeline de POCs. 18-24 meses para tech capability institucionalizada.'
    },
    DMA: {
        contextoCritico: 'Data Management (DMA) es la capacidad de SEIZING basada en datos. Kroh et al. (2020) enfatizan que datos son "el nuevo petróleo" solo si hay capacidad de refinamiento (analytics). Sin DMA, las decisiones digitales son "gut-feeling".',
        impactoEsperado: 'Mejoras en DMA aumentan velocidad de toma de decisiones en 30-50%. Reducen costos operativos en 10-20% via optimización basada en datos. Organizaciones data-driven tienen 5-6% mayor productividad.',
        kpis: ['% de decisiones clave basadas en datos (objetivo: >70%)', 'Data quality score (completeness, accuracy) (objetivo: >85%)', 'Tiempo desde data request a insight (objetivo: <48 horas)', 'Número de usuarios activos de plataforma de BI (objetivo: >50% de workforce)'],
        riesgos: ['Silos de datos impiden visión integral', 'Gobernanza débil genera desconfianza en calidad de datos', 'Analytics sin acción: insights que no se traducen en decisiones'],
        secuenciacion: ['1º: Auditoría de landscape actual de datos (fuentes, calidad, silos)', '2º: Definir modelo de gobernanza de datos (data ownership, calidad, seguridad)', '3º: Implementar data warehouse/lake centralizado', '4º: Crear self-service BI con herramientas como PowerBI/Tableau', '5º: Capacitar "citizen data scientists" en cada área'],
        recursos: ['Data platform (cloud): Snowflake, Databricks ($50K-200K/año)', 'BI tools: PowerBI, Tableau (~$50-100/usuario/año)', 'Data engineer + Data analyst: 2-3 FTEs ($150K-300K/año)', 'Data governance consultant para setup ($30K-60K)'],
        interdependencies: 'DMA requiere DTC (tech para procesar datos) y DIP (datos generados en experimentos). Habilita mejor toma de decisiones en DIF. Complementa AIA (datos para entrenar modelos).',
        timeline: '6-9 meses para plataforma de datos operativa. 12-18 meses para adopción amplia de BI. 24+ meses para cultura data-driven consolidada.'
    },
    DIR: {
        contextoCritico: 'Overcoming Resistance (DIR) es la capacidad de TRANSFORMING frente a inercia organizacional. Kroh et al. (2020) identifican que resistencia al cambio es la causa #1 de fracaso de transformación digital (70% de iniciativas fallan por esto).',
        impactoEsperado: 'Mejoras en DIR aceleran adopción de cambios digitales en 2-3x. Reducen rotación durante transformación en 30-40%. Organizaciones con baja resistencia completan transformaciones digitales 18 meses más rápido.',
        kpis: ['eNPS durante transformación (objetivo: >0)', '% de stakeholders que superan curva de adopción (laggards a adopters) (objetivo: >60%)', 'Tiempo de adopción de nueva tecnología (objetivo: <6 meses)', 'Tasa de éxito de iniciativas de cambio (objetivo: >60%)'],
        riesgos: ['Change management solo "comunicacional" sin abordar causas raíz', 'Fatiga de cambio: demasiadas iniciativas simultáneas', 'Falta de sponsorship ejecutivo genuino'],
        secuenciacion: ['1º: Diagnosticar resistencias via stakeholder mapping y encuestas', '2º: Definir estrategia de change management (modelo ADKAR o Kotter)', '3º: Identificar y empoderar "coalition" de change agents', '4º: Comunicación frecuente y bidireccional sobre el "why" del cambio', '5º: Quick wins visibles para generar momentum'],
        recursos: ['Change management consultant ($30K-60K para programa de 6 meses)', 'Tiempo de change agents: 20-30% de su tiempo', 'Budget para comunicaciones de cambio ($10K-30K)', 'Training en gestión de cambio para líderes ($5K-15K)'],
        interdependencies: 'DIR baja bloquea todas las demás dimensiones. Es habilitador crítico de DMI (cultura) y DIP (procesos nuevos). Requiere DIF (visión clara reduce resistencia).',
        timeline: '3-6 meses para primeros signos de reducción de resistencia. 12-18 meses para cambio comportamental sostenible. Requiere refuerzo continuo.'
    },
    AIA: {
        contextoCritico: 'AI Attention Infrastructure (AIA) según Angelshaug et al. (2025) evalúa si el "diseño organizacional" del TMT permite o bloquea la ejecución de IA. Sin AIA, las inversiones en IA fallan no por tecnología sino por falta de atención directiva estructurada.',
        impactoEsperado: 'Mejoras en AIA desbloquean el potencial de IA de multiplicador 10x de productividad. Organizaciones con alta AIA tienen 4x más proyectos de IA en producción. Reducen time-to-value de IA de años a meses.',
        kpis: ['% de reuniones TMT dedicadas a IA estratégica (objetivo: >20%)', 'Número de iniciativas de IA en producción (objetivo: ≥3)', 'Existencia de AI Steering Committee (sí/no)', 'Balance TMT: % de perfiles forward-looking vs backward-looking (objetivo: 60/40)'],
        riesgos: ['IA como "teatro": anuncios sin ejecución real', 'Expectativas no realistas: esperar AGI cuando se necesita narrow AI', 'Falta de ethical guidelines genera crisis reputacional'],
        secuenciacion: ['1º: Crear AI Steering Committee con representación TMT + tech + ethics', '2º: Definir "Calendario de Atención Protegida" para IA (off-sites trimestrales)', '3º: Identificar 3-5 use cases de IA de alto impacto estratégico', '4º: Implementar POC de IA con quick win visible', '5º: Establecer principios de IA responsable y governance'],
        recursos: ['AI strategy consultant ($50K-100K para roadmap)', 'AI talent: ML engineer + data scientist (2-3 FTEs, $200K-400K/año)', 'Cloud AI platform: AWS Sagemaker, Google Vertex ($30K-100K/año)', 'Ethics & governance framework development ($20K-40K)'],
        interdependencies: 'AIA requiere DMA (datos para IA) y DTC (capacidad de evaluar AI tech). Amplifica impacto de DIF (estrategia de IA). Requiere DIR bajo (resistencia al "reemplazo por IA").',
        timeline: '6-12 meses para primeros POCs de IA en producción. 18-24 meses para industrialización de IA. 36+ meses para IA como ventaja competitiva sostenible.'
    }
};

// Estructura de dimensiones de Kroh
const KROH_DIMENSIONS = {
    DIF: {
        name: 'Digital Focus',
        items: ['I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10'],
        description: 'Estrategia, metas y recursos asignados.',
        isInverse: false
    },
    DIP: {
        name: 'Digital Innovation Process',
        items: ['I11', 'I12', 'I13', 'I14'],
        description: 'Agilidad y flexibilidad en el desarrollo.',
        isInverse: false
    },
    DMI: {
        name: 'Digital Mindset',
        items: ['I17', 'I18', 'I19', 'I20'],
        description: 'Cultura y entendimiento compartido.',
        isInverse: false
    },
    DIN: {
        name: 'Digital Innovation Network',
        items: ['I22', 'I23', 'I24', 'I25'],
        description: 'Colaboración con socios externos y ecosistemas.',
        isInverse: false
    },
    DTC: {
        name: 'Digital Tech Capability',
        items: ['I26', 'I27', 'I28', 'I29', 'I30'],
        description: 'Capacidad para identificar tecnologías clave.',
        isInverse: false
    },
    DMA: {
        name: 'Data Management',
        items: ['I31', 'I32', 'I33'],
        description: 'Gestión operativa y coordinación de datos.',
        isInverse: false
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
        description: 'Infraestructura de atención directiva para IA (Angelshaug 2025).',
        isInverse: false
    }
};

interface Answer {
    id: string;
    respondentName: string;
    respondentPosition: string;
    responses: Record<string, number>;
}

interface Dimension {
    id: string;
    name: string;
    score: number;
    average: number;
    description: string;
}

interface ReportData {
    company: {
        name: string;
        sector: string;
    };
    consolidated: {
        foundations?: Dimension[];
        globalScore: number;
        status: string;
    };
    answers: Answer[];
    perceptionByPosition: Record<string, any>;
}

interface Props {
    data: ReportData;
}

// Cálculo del Alfa de Cronbach
function calculateCronbachAlpha(itemScores: number[][]): number {
    const k = itemScores[0]?.length || 0; // Número de ítems
    if (k < 2) return 0;

    const n = itemScores.length; // Número de respondentes
    if (n < 2) return 0;

    // Calcular varianza de cada ítem
    const itemVariances = [];
    for (let i = 0; i < k; i++) {
        const scores = itemScores.map(row => row[i]);
        const mean = scores.reduce((a, b) => a + b, 0) / n;
        const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
        itemVariances.push(variance);
    }

    // Calcular varianza del total (suma de ítems)
    const totalScores = itemScores.map(row => row.reduce((a, b) => a + b, 0));
    const totalMean = totalScores.reduce((a, b) => a + b, 0) / n;
    const totalVariance = totalScores.reduce((sum, val) => sum + Math.pow(val - totalMean, 2), 0) / n;

    // Fórmula del Alfa de Cronbach
    const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);
    const alpha = (k / (k - 1)) * (1 - (sumItemVariances / totalVariance));

    return Math.max(0, Math.min(1, alpha)); // Limitar entre 0 y 1
}

export default function KrohAdvancedAnalysis({ data }: Props) {
    // Calcular Alfa de Cronbach para cada dimensión
    const reliabilityAnalysis = useMemo(() => {
        return Object.entries(KROH_DIMENSIONS).map(([dimId, dim]) => {
            // Obtener scores de todos los respondentes para esta dimensión
            const itemScores = data.answers.map(answer => {
                return dim.items.map(itemId => {
                    const rawValue = answer.responses[itemId] || 3;
                    return dim.isInverse ? (6 - rawValue) : rawValue;
                });
            });

            const alpha = calculateCronbachAlpha(itemScores);
            const interpretation =
                alpha >= 0.9 ? 'Excelente' :
                alpha >= 0.8 ? 'Bueno' :
                alpha >= 0.7 ? 'Aceptable' :
                alpha >= 0.6 ? 'Cuestionable' : 'Pobre';

            return {
                dimension: dim.name,
                alpha: alpha.toFixed(3),
                interpretation,
                itemCount: dim.items.length
            };
        });
    }, [data.answers]);

    return (
        <div className="space-y-8">
            {/* 1. Recodificación */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">transform</span>
                    1. Recodificación de Ítems
                </h3>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                        <span className="material-icons text-sm mt-0.5">info</span>
                        <span>
                            El instrumento de Kroh et al. (2020) utiliza <strong>recodificación inversa</strong> para la dimensión
                            "Overcoming Resistance" (DIR) donde valores altos en las preguntas originales indican mayor resistencia.
                            La recodificación transforma estos valores para que reflejen <strong>menor resistencia</strong> alineándolos
                            conceptualmente con las demás dimensiones donde valores altos son deseables.
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {Object.entries(KROH_DIMENSIONS).map(([dimId, dim]) => (
                        <div key={dimId} className={`p-5 rounded-2xl border ${
                            dim.isInverse
                                ? 'border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/5'
                                : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50'
                        }`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-slate-800 dark:text-white">{dim.name}</h4>
                                        {dim.isInverse && (
                                            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-full uppercase tracking-wider">
                                                Escala Invertida
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">{dim.description}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Ítems:</span>
                                        {dim.items.map(item => (
                                            <span key={item} className="px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold rounded border border-slate-200 dark:border-slate-600">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {dim.isInverse && (
                                    <div className="ml-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-500/30 text-center">
                                        <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Fórmula</div>
                                        <div className="text-sm font-mono font-bold text-slate-800 dark:text-white">6 - x</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Alfa de Cronbach */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">verified</span>
                    2. Análisis de Fiabilidad (Alfa de Cronbach)
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Mide la consistencia interna de cada dimensión. Valores ≥ 0.7 indican fiabilidad aceptable para investigación.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4">Micro-fundación</th>
                                <th className="px-6 py-4 text-center">N° Ítems</th>
                                <th className="px-6 py-4 text-center">Alfa de Cronbach (α)</th>
                                <th className="px-6 py-4">Interpretación</th>
                                <th className="px-6 py-4">Indicador Visual</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reliabilityAnalysis.map((item, idx) => {
                                const alphaValue = parseFloat(item.alpha);
                                const barColor =
                                    alphaValue >= 0.9 ? 'bg-emerald-500' :
                                    alphaValue >= 0.8 ? 'bg-blue-500' :
                                    alphaValue >= 0.7 ? 'bg-amber-500' :
                                    alphaValue >= 0.6 ? 'bg-orange-500' : 'bg-rose-500';

                                return (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-sm text-slate-800 dark:text-white">{item.dimension}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.itemCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-black text-primary">{item.alpha}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                alphaValue >= 0.9 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                alphaValue >= 0.8 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                alphaValue >= 0.7 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                alphaValue >= 0.6 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}>
                                                {item.interpretation}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden min-w-[120px]">
                                                    <div
                                                        className={`h-full ${barColor}`}
                                                        style={{ width: `${alphaValue * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-center">
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">≥ 0.9</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-500">Excelente</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/20 text-center">
                        <div className="text-xs font-bold text-blue-700 dark:text-blue-400">0.8 - 0.89</div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-500">Bueno</div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-100 dark:border-amber-500/20 text-center">
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400">0.7 - 0.79</div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-500">Aceptable</div>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-500/5 rounded-xl border border-orange-100 dark:border-orange-500/20 text-center">
                        <div className="text-xs font-bold text-orange-700 dark:text-orange-400">0.6 - 0.69</div>
                        <div className="text-[10px] text-orange-600 dark:text-orange-500">Cuestionable</div>
                    </div>
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/5 rounded-xl border border-rose-100 dark:border-rose-500/20 text-center">
                        <div className="text-xs font-bold text-rose-700 dark:text-rose-400">&lt; 0.6</div>
                        <div className="text-[10px] text-rose-600 dark:text-rose-500">Pobre</div>
                    </div>
                </div>
            </div>

            {/* 3. Promedios por Dimensión */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">bar_chart</span>
                    3. Promedios por Micro-fundación
                </h3>

                <div className="space-y-4">
                    {data.consolidated.foundations?.map((foundation, idx) => (
                        <div key={foundation.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white">{foundation.name}</h4>
                                        <p className="text-xs text-slate-500">{foundation.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-primary">{foundation.average.toFixed(2)}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">de 5.0</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${
                                            foundation.score > 80 ? 'bg-emerald-500' :
                                            foundation.score > 60 ? 'bg-blue-500' :
                                            foundation.score > 40 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${foundation.score}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 min-w-[60px] text-right">
                                    {foundation.score}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-5 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">Promedio Global Organizacional</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">Consolidado de {data.answers.length} respondentes</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black text-primary">{data.consolidated.globalScore.toFixed(2)}</div>
                            <div className="text-sm font-bold text-slate-500">{data.consolidated.status}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Comparaciones por Rol */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">people</span>
                    4. Comparaciones por Rol/Posición
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Análisis diferencial de percepción de madurez digital según nivel jerárquico o función organizacional.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(data.perceptionByPosition).map(([position, result]: [string, any]) => (
                        <div key={position} className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="material-icons text-primary">badge</span>
                                </div>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    {result.count} {result.count === 1 ? 'respondente' : 'respondentes'}
                                </span>
                            </div>

                            <h4 className="font-black text-lg text-slate-800 dark:text-white mb-1">{position}</h4>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-black text-primary">{result.maturity.globalScore}</span>
                                <span className="text-xs text-slate-400">/ 5.0</span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mb-4">{result.maturity.status}</p>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Top 3 Dimensiones</p>
                                {(result.maturity.foundations || [])
                                    .sort((a: any, b: any) => b.average - a.average)
                                    .slice(0, 3)
                                    .map((f: any) => (
                                        <div key={f.id} className="flex justify-between items-center text-xs">
                                            <span className="text-slate-600 dark:text-slate-400 truncate">{f.name}</span>
                                            <span className="font-bold text-primary ml-2">{f.average.toFixed(2)}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ))}
                </div>

                {Object.keys(data.perceptionByPosition).length > 1 && (
                    <div className="mt-6 p-5 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-amber-600 dark:text-amber-400 mt-0.5">insights</span>
                            <div className="flex-1">
                                <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-2">Brecha de Percepción Detectada</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Existe una diferencia de {
                                        (() => {
                                            const scores = Object.values(data.perceptionByPosition).map((r: any) => r.maturity.globalScore);
                                            return (Math.max(...scores) - Math.min(...scores)).toFixed(2);
                                        })()
                                    } puntos entre el rol más optimista y el más crítico. Esta dispersión sugiere que diferentes niveles
                                    jerárquicos o funcionales tienen percepciones distintas sobre el nivel de madurez digital. Se recomienda:
                                </p>
                                <ul className="mt-3 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                                    <li className="flex items-start gap-2">
                                        <span className="material-icons text-xs mt-0.5">check_circle</span>
                                        <span>Generar espacios de diálogo inter-rol para alinear visiones</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-icons text-xs mt-0.5">check_circle</span>
                                        <span>Comunicar de forma clara la estrategia digital a todos los niveles</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="material-icons text-xs mt-0.5">check_circle</span>
                                        <span>Implementar indicadores compartidos que den visibilidad del progreso</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Interpretación Estructural */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">account_tree</span>
                    5. Interpretación Estructural del Modelo
                </h3>

                <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <span className="material-icons text-sm">lightbulb</span>
                        Fundamento Teórico: Capacidades Dinámicas
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        El modelo de Kroh et al. (2020) se fundamenta en la <strong>Teoría de Capacidades Dinámicas</strong> (Teece, 2007),
                        identificando 7 micro-fundaciones esenciales que permiten a las organizaciones <strong>sensing</strong> (detectar oportunidades),
                        <strong>seizing</strong> (aprovechar oportunidades) y <strong>transforming</strong> (reconfigurar recursos)
                        en contextos digitales cambiantes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Sensing */}
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-icons text-emerald-600 dark:text-emerald-400">search</span>
                            <h4 className="font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wide text-sm">Sensing</h4>
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-3">
                            Capacidad de detectar, filtrar y dar forma a oportunidades digitales
                        </p>
                        <div className="space-y-2">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">Digital Focus (DIF)</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">
                                        {data.consolidated.foundations?.find(f => f.id === 'DIF')?.average.toFixed(2) || 'N/A'}
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${data.consolidated.foundations?.find(f => f.id === 'DIF')?.score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">Tech Capability (DTC)</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">
                                        {data.consolidated.foundations?.find(f => f.id === 'DTC')?.average.toFixed(2) || 'N/A'}
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${data.consolidated.foundations?.find(f => f.id === 'DTC')?.score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seizing */}
                    <div className="p-5 bg-blue-50 dark:bg-blue-500/5 border-2 border-blue-200 dark:border-blue-500/30 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-icons text-blue-600 dark:text-blue-400">track_changes</span>
                            <h4 className="font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide text-sm">Seizing</h4>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                            Capacidad de movilizar recursos para capturar valor de las oportunidades
                        </p>
                        <div className="space-y-2">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">Innovation Process (DIP)</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">
                                        {data.consolidated.foundations?.find(f => f.id === 'DIP')?.average.toFixed(2) || 'N/A'}
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${data.consolidated.foundations?.find(f => f.id === 'DIP')?.score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">Data Management (DMA)</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">
                                        {data.consolidated.foundations?.find(f => f.id === 'DMA')?.average.toFixed(2) || 'N/A'}
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${data.consolidated.foundations?.find(f => f.id === 'DMA')?.score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">Innovation Network (DIN)</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">
                                        {data.consolidated.foundations?.find(f => f.id === 'DIN')?.average.toFixed(2) || 'N/A'}
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500"
                                            style={{ width: `${data.consolidated.foundations?.find(f => f.id === 'DIN')?.score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transforming */}
                    <div className="p-5 bg-purple-50 dark:bg-purple-500/5 border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-icons text-purple-600 dark:text-purple-400">autorenew</span>
                            <h4 className="font-black text-purple-900 dark:text-purple-200 uppercase tracking-wide text-sm">Transforming</h4>
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                            Capacidad de reconfigurar activos y estructuras organizacionales
                        </p>
                        <div className="space-y-2">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">Digital Mindset (DMI)</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">
                                        {data.consolidated.foundations?.find(f => f.id === 'DMI')?.average.toFixed(2) || 'N/A'}
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${data.consolidated.foundations?.find(f => f.id === 'DMI')?.score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="text-[10px] font-bold text-slate-500 mb-1">Overcoming Resistance (DIR)</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">
                                        {data.consolidated.foundations?.find(f => f.id === 'DIR')?.average.toFixed(2) || 'N/A'}
                                    </div>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${data.consolidated.foundations?.find(f => f.id === 'DIR')?.score || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-icons text-sm text-primary">analytics</span>
                        Interpretación de Resultados para {data.company.name}
                    </h4>
                    {(() => {
                        const sensing = [
                            data.consolidated.foundations?.find(f => f.id === 'DIF')?.average || 0,
                            data.consolidated.foundations?.find(f => f.id === 'DTC')?.average || 0
                        ];
                        const seizing = [
                            data.consolidated.foundations?.find(f => f.id === 'DIP')?.average || 0,
                            data.consolidated.foundations?.find(f => f.id === 'DMA')?.average || 0,
                            data.consolidated.foundations?.find(f => f.id === 'DIN')?.average || 0
                        ];
                        const transforming = [
                            data.consolidated.foundations?.find(f => f.id === 'DMI')?.average || 0,
                            data.consolidated.foundations?.find(f => f.id === 'DIR')?.average || 0
                        ];

                        const avgSensing = sensing.reduce((a, b) => a + b, 0) / sensing.length;
                        const avgSeizing = seizing.reduce((a, b) => a + b, 0) / seizing.length;
                        const avgTransforming = transforming.reduce((a, b) => a + b, 0) / transforming.length;

                        const weakest =
                            avgSensing < avgSeizing && avgSensing < avgTransforming ? 'Sensing' :
                            avgSeizing < avgSensing && avgSeizing < avgTransforming ? 'Seizing' : 'Transforming';

                        return (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-lg">
                                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Sensing</div>
                                        <div className="text-xl font-black text-emerald-900 dark:text-emerald-200">{avgSensing.toFixed(2)}</div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-500/5 rounded-lg">
                                        <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">Seizing</div>
                                        <div className="text-xl font-black text-blue-900 dark:text-blue-200">{avgSeizing.toFixed(2)}</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-500/5 rounded-lg">
                                        <div className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">Transforming</div>
                                        <div className="text-xl font-black text-purple-900 dark:text-purple-200">{avgTransforming.toFixed(2)}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    <strong>Diagnóstico:</strong> La capacidad dinámica más débil es <strong>{weakest}</strong>.
                                    Para fortalecer la madurez digital de manera holística, se recomienda priorizar intervenciones
                                    en las micro-fundaciones asociadas a esta capacidad, ya que actúa como cuello de botella en el
                                    proceso de transformación digital organizacional.
                                </p>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* 6. Matriz de Auditoría de Atención (MAA) - Angelshaug 2025 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">psychology</span>
                    6. Matriz de Auditoría de Atención (MAA) - Angelshaug 2025
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Evaluación de la infraestructura de atención directiva para ejecutar innovaciones habilitadas por IA.
                    Este análisis permite identificar si el diseño organizacional está bloqueando o habilitando la capacidad del equipo directivo.
                </p>

                {(() => {
                    const aiaFoundation = data.consolidated.foundations?.find(f => f.id === 'AIA');

                    if (!aiaFoundation) {
                        return (
                            <div className="p-5 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-xl">
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    No se encontraron datos de la dimensión Angelshaug. Asegúrese de que los respondentes hayan completado las preguntas A1-A5.
                                </p>
                            </div>
                        );
                    }

                    // Obtener los promedios de cada ítem individual de Angelshaug
                    const angelshaugItems = [
                        {
                            id: 'A1',
                            dimension: 'Outlook (Perspectiva)',
                            question: '¿Nuestras reuniones de IA se centran en el futuro (5 años) o solo en resolver ineficiencias del modelo actual?',
                            obstacle: '¿Agendas demasiado cargadas de temas operativos?'
                        },
                        {
                            id: 'A2',
                            dimension: 'Orientation (Foco)',
                            question: '¿Estamos captando señales de competidores tecnológicos/startups de IA o solo escuchamos reportes internos de TI?',
                            obstacle: '¿Falta de canales de comunicación con el ecosistema externo?'
                        },
                        {
                            id: 'A3',
                            dimension: 'Flexibility (Sentido)',
                            question: '¿Tenemos permiso para cuestionar la lógica fundamental de cómo ganamos dinero ante la IA, o la IA debe "encajar" en lo que ya hacemos?',
                            obstacle: '¿Procedimientos rígidos de "Gestión de Problemas"?'
                        },
                        {
                            id: 'A4',
                            dimension: 'Alignment (Alineación)',
                            question: '¿El equipo directivo tiene una creencia común sobre qué es la IA para nosotros, o cada área la entiende de forma fragmentada?',
                            obstacle: '¿Estructura de "silos" funcionales en el TMT?'
                        },
                        {
                            id: 'A5',
                            dimension: 'Persistence (Esfuerzo)',
                            question: '¿Dedicamos tiempo intenso y sostenido a la IA, o es solo un punto de 10 minutos al final de cada sesión?',
                            obstacle: '¿Falta de eventos estratégicos dedicados (off-sites)?'
                        }
                    ];

                    // Calcular promedios por ítem
                    const itemAverages = angelshaugItems.map(item => {
                        const scores = data.answers.map(answer => answer.responses[item.id] || 3);
                        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                        return {
                            ...item,
                            average: avg,
                            score: (avg / 5) * 100
                        };
                    });

                    return (
                        <div className="space-y-6">
                            {/* Tabla de Matriz */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-6 py-4">Dimensión de Atención</th>
                                            <th className="px-6 py-4">Pregunta de Diagnóstico (Foco en IA)</th>
                                            <th className="px-6 py-4 text-center">Estado Actual (1-5)</th>
                                            <th className="px-6 py-4">Obstáculo de Diseño Identificado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {itemAverages.map((item, idx) => {
                                            const statusColor =
                                                item.average >= 4 ? 'bg-emerald-500' :
                                                item.average >= 3 ? 'bg-blue-500' :
                                                item.average >= 2 ? 'bg-amber-500' : 'bg-rose-500';

                                            const statusText =
                                                item.average >= 4 ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' :
                                                item.average >= 3 ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' :
                                                item.average >= 2 ? 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' :
                                                'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30';

                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <span className="font-bold text-sm text-slate-800 dark:text-white block mb-1">
                                                            {item.dimension}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                            {item.id}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                            {item.question}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`px-3 py-2 rounded-lg text-sm font-black ${statusText}`}>
                                                                {item.average.toFixed(2)}
                                                            </span>
                                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${statusColor}`}
                                                                    style={{ width: `${item.score}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                                            {item.obstacle}
                                                        </p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Resumen de la Matriz */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Promedio General */}
                                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                            <span className="material-icons text-white">analytics</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white">Promedio General MAA</h4>
                                            <p className="text-xs text-slate-500">Infraestructura de Atención</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-primary">{aiaFoundation.average.toFixed(2)}</span>
                                        <span className="text-sm text-slate-400">/ 5.0</span>
                                    </div>
                                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${aiaFoundation.score}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Dimensión Más Débil */}
                                {(() => {
                                    const weakest = itemAverages.reduce((min, item) =>
                                        item.average < min.average ? item : min
                                    );

                                    return (
                                        <div className="p-6 bg-rose-50 dark:bg-rose-500/5 border-2 border-rose-200 dark:border-rose-500/30 rounded-2xl">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center">
                                                    <span className="material-icons text-white">warning</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-rose-900 dark:text-rose-200">Atención Crítica Requerida</h4>
                                                    <p className="text-xs text-rose-600 dark:text-rose-400">Dimensión más débil</p>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="font-bold text-lg text-rose-900 dark:text-rose-200 mb-1">
                                                    {weakest.dimension}
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{weakest.average.toFixed(2)}</span>
                                                    <span className="text-xs text-rose-400">/ 5.0</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-rose-700 dark:text-rose-300">
                                                {weakest.obstacle}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Interpretación y Recomendaciones */}
                            <div className="p-6 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl">
                                <div className="flex items-start gap-3">
                                    <span className="material-icons text-blue-600 dark:text-blue-400 mt-0.5">lightbulb</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-3">
                                            Interpretación según Angelshaug et al. (2025)
                                        </h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
                                            La investigación de Angelshaug identifica que la infraestructura de atención del equipo directivo (TMT)
                                            puede estar "bloqueando" o "habilitando" la capacidad de ejecutar innovaciones de IA.
                                            Las cinco dimensiones evaluadas revelan cómo la organización distribuye la atención estratégica hacia la IA.
                                        </p>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-2">Protocolo de Dos Canales:</div>
                                                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span><strong>Canal de Exploración (Strategic Planning Cycle):</strong> Crear "espacios protegidos"
                                                        (off-sites) donde el TMT se separa de la operación diaria para enfocarse en el impacto de IA a largo plazo.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span><strong>Canal de Explotación (Strategic Issue Management):</strong> Implementar dashboards de IA
                                                        para monitoreo operativo que liberen carga cognitiva y permitan al TMT enfocarse en creación de sentido estratégico.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-2">Recomendaciones Inmediatas:</div>
                                                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">check_circle</span>
                                                        <span>Auditar las agendas de las reuniones directivas para identificar si están "viciadas" por temas operativos</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">check_circle</span>
                                                        <span>Evaluar la composición del equipo: balance entre perfiles generalistas (forward-looking) y especialistas (backward-looking)</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">check_circle</span>
                                                        <span>Establecer un "Calendario de Atención Protegida" con sesiones exclusivas sobre IA estratégica</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* 7. Recomendaciones Estratégicas Enriquecidas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">rocket_launch</span>
                    7. Recomendaciones Estratégicas Priorizadas (Basadas en Kroh et al. 2020 y Angelshaug et al. 2025)
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Análisis profundo de las dimensiones críticas con guías de intervención basadas en evidencia académica,
                    permitiendo tomar decisiones informadas sobre la transformación digital de la organización.
                </p>

                {(() => {
                    // Identificar las 3 dimensiones más débiles que requieren intervención
                    const sorted = [...(data.consolidated.foundations || [])].sort((a, b) => a.average - b.average);
                    const weakestDimensions = sorted.slice(0, 3);

                    return (
                        <div className="space-y-8">
                            {weakestDimensions.map((dimension, idx) => {
                                const insights = DIMENSION_INSIGHTS[dimension.id];
                                if (!insights) return null;

                                const priorityLevel = idx === 0 ? 'CRÍTICA' : idx === 1 ? 'ALTA' : 'MEDIA';
                                const priorityColor = idx === 0 ? 'rose' : idx === 1 ? 'orange' : 'amber';

                                return (
                                    <div key={dimension.id} className={`border-2 rounded-3xl overflow-hidden ${
                                        idx === 0 ? 'border-rose-200 dark:border-rose-500/30' :
                                        idx === 1 ? 'border-orange-200 dark:border-orange-500/30' :
                                        'border-amber-200 dark:border-amber-500/30'
                                    }`}>
                                        {/* Header de la dimensión */}
                                        <div className={`p-6 ${
                                            idx === 0 ? 'bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/20' :
                                            idx === 1 ? 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20' :
                                            'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20'
                                        }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            idx === 0 ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200' :
                                                            idx === 1 ? 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                            'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                                        }`}>
                                                            Prioridad {priorityLevel}
                                                        </span>
                                                        <span className="text-sm text-slate-500 dark:text-slate-400">#{idx + 1} Dimensión más débil</span>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{dimension.name}</h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{dimension.description}</p>
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Puntaje Actual</span>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className={`text-3xl font-black ${
                                                                    idx === 0 ? 'text-rose-600 dark:text-rose-400' :
                                                                    idx === 1 ? 'text-orange-600 dark:text-orange-400' :
                                                                    'text-amber-600 dark:text-amber-400'
                                                                }`}>
                                                                    {dimension.average.toFixed(2)}
                                                                </span>
                                                                <span className="text-sm text-slate-400">/ 5.0</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Nivel de Madurez</span>
                                                            <div className="w-full bg-white dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                                                <div
                                                                    className={`h-full ${
                                                                        idx === 0 ? 'bg-rose-500' :
                                                                        idx === 1 ? 'bg-orange-500' :
                                                                        'bg-amber-500'
                                                                    }`}
                                                                    style={{ width: `${dimension.score}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenido enriquecido */}
                                        <div className="p-6 space-y-6">
                                            {/* Contexto Crítico */}
                                            <div className="p-5 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl">
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-blue-600 dark:text-blue-400 mt-0.5">menu_book</span>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Contexto Teórico y Criticidad</h5>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{insights.contextoCritico}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Impacto Esperado */}
                                            <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-emerald-600 dark:text-emerald-400 mt-0.5">trending_up</span>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-emerald-900 dark:text-emerald-200 mb-2">Impacto Esperado de la Intervención</h5>
                                                        <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">{insights.impactoEsperado}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* KPIs Recomendados */}
                                            <div>
                                                <h5 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                                    <span className="material-icons text-primary text-sm">analytics</span>
                                                    KPIs Recomendados para Seguimiento
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {insights.kpis.map((kpi: string, kpiIdx: number) => (
                                                        <div key={kpiIdx} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                                            <div className="flex items-start gap-2">
                                                                <span className="material-icons text-primary text-sm mt-0.5">check_circle</span>
                                                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{kpi}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Riesgos a Monitorear */}
                                            <div className="p-5 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl">
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-amber-600 dark:text-amber-400 mt-0.5">warning</span>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-amber-900 dark:text-amber-200 mb-3">Riesgos Críticos a Monitorear</h5>
                                                        <ul className="space-y-2">
                                                            {insights.riesgos.map((riesgo: string, rIdx: number) => (
                                                                <li key={rIdx} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                                                    <span className="material-icons text-xs mt-0.5">error_outline</span>
                                                                    <span>{riesgo}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Secuenciación de Acciones */}
                                            <div>
                                                <h5 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                                    <span className="material-icons text-primary text-sm">format_list_numbered</span>
                                                    Secuencia Recomendada de Implementación
                                                </h5>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20"></div>
                                                    <div className="space-y-4">
                                                        {insights.secuenciacion.map((paso: string, pIdx: number) => (
                                                            <div key={pIdx} className="flex items-start gap-4 relative">
                                                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm flex-shrink-0 relative z-10">
                                                                    {pIdx + 1}
                                                                </div>
                                                                <div className="flex-1 pt-1">
                                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{paso}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recursos e Inversión */}
                                            <div className="p-5 bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 rounded-2xl">
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-purple-600 dark:text-purple-400 mt-0.5">account_balance_wallet</span>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-purple-900 dark:text-purple-200 mb-3">Recursos e Inversión Estimada</h5>
                                                        <ul className="space-y-2">
                                                            {insights.recursos.map((recurso: string, rIdx: number) => (
                                                                <li key={rIdx} className="flex items-start gap-2 text-sm text-purple-700 dark:text-purple-300">
                                                                    <span className="material-icons text-xs mt-0.5">payments</span>
                                                                    <span>{recurso}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Interdependencias y Timeline */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-5 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/20 rounded-2xl">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <span className="material-icons text-cyan-600 dark:text-cyan-400 text-sm mt-0.5">account_tree</span>
                                                        <h5 className="font-bold text-cyan-900 dark:text-cyan-200">Interdependencias</h5>
                                                    </div>
                                                    <p className="text-sm text-cyan-700 dark:text-cyan-300 leading-relaxed">{insights.interdependencias}</p>
                                                </div>
                                                <div className="p-5 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <span className="material-icons text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">schedule</span>
                                                        <h5 className="font-bold text-indigo-900 dark:text-indigo-200">Timeline Esperado</h5>
                                                    </div>
                                                    <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">{insights.timeline}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Resumen de Priorización */}
                            <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="material-icons text-white">lightbulb</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
                                            Síntesis: Enfoque Estratégico de Intervención
                                        </h4>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                            La transformación digital exitosa requiere abordar las dimensiones en el orden correcto,
                                            respetando las interdependencias entre micro-fundaciones. Las recomendaciones anteriores
                                            están fundamentadas en el modelo de Capacidades Dinámicas (Teece, 2007) aplicado al
                                            contexto digital (Kroh et al. 2020) y en la teoría de Atención Organizacional para IA
                                            (Angelshaug et al. 2025).
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Horizonte Corto</div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-white mb-2">0-6 meses</div>
                                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                                    Focus en {weakestDimensions[0]?.name}. Quick wins visibles para generar momentum.
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Horizonte Medio</div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-white mb-2">6-18 meses</div>
                                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                                    Consolidar {weakestDimensions[1]?.name}. Institucionalizar capacidades.
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">Horizonte Largo</div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-white mb-2">18+ meses</div>
                                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                                    Optimización continua. Ventaja competitiva digital sostenible.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
