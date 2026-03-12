"use client";

import { useMemo } from 'react';

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

            {/* 7. Recomendaciones Estratégicas */}
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined">rocket_launch</span>
                    7. Recomendaciones Estratégicas Priorizadas
                </h3>
                <p className="text-primary-foreground/80 text-sm mb-6">
                    Plan de acción basado en el análisis cuantitativo y estructural de las micro-fundaciones
                </p>

                <div className="space-y-4">
                    {(() => {
                        const sorted = [...(data.consolidated.foundations || [])].sort((a, b) => a.average - b.average);
                        const weakest = sorted.slice(0, 2);
                        const strongest = sorted.slice(-1)[0];

                        return (
                            <>
                                {/* Prioridad Crítica */}
                                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-icons text-rose-300">priority_high</span>
                                        <h4 className="font-black text-lg uppercase tracking-wide">Prioridad Crítica</h4>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-sm font-bold mb-1">{weakest[0].name}</div>
                                        <div className="text-xs text-white/70 mb-2">{weakest[0].description}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black">{weakest[0].average.toFixed(2)}</span>
                                            <span className="text-xs text-white/60">/ 5.0</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p className="font-bold">Acciones inmediatas recomendadas:</p>
                                        <ul className="space-y-1.5 text-xs">
                                            {weakest[0].id === 'DIF' && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Definir objetivos digitales claros alineados con la estrategia corporativa</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Asignar presupuesto específico para iniciativas de transformación digital</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Crear un comité de transformación digital con representación ejecutiva</span>
                                                    </li>
                                                </>
                                            )}
                                            {weakest[0].id === 'DIP' && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Implementar metodologías ágiles (Scrum, Kanban) en proyectos digitales</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Establecer ciclos de experimentación rápida (MVPs, pruebas piloto)</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Reducir barreras burocráticas para aprobación de innovaciones</span>
                                                    </li>
                                                </>
                                            )}
                                            {weakest[0].id === 'DMI' && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Programa de alfabetización digital para todo el personal</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Comunicación constante de casos de éxito digitales internos</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Reconocimientos e incentivos para iniciativas digitales innovadoras</span>
                                                    </li>
                                                </>
                                            )}
                                            {weakest[0].id === 'DIN' && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Establecer alianzas estratégicas con startups y proveedores tecnológicos</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Participar en ecosistemas de innovación y comunidades tech del sector</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Implementar plataformas de colaboración abierta con partners externos</span>
                                                    </li>
                                                </>
                                            )}
                                            {weakest[0].id === 'DTC' && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Crear un radar tecnológico para monitoreo continuo de tendencias</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Contratar o capacitar especialistas en tecnologías emergentes clave</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Establecer laboratorios de pruebas de concepto tecnológico</span>
                                                    </li>
                                                </>
                                            )}
                                            {weakest[0].id === 'DMA' && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Implementar un data warehouse centralizado y gobernanza de datos clara</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Desarrollar capacidades de análisis de datos y business intelligence</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Establecer políticas de calidad y seguridad de datos</span>
                                                    </li>
                                                </>
                                            )}
                                            {weakest[0].id === 'DIR' && (
                                                <>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Gestión activa del cambio con comunicación transparente y continua</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Identificar y empoderar a champions digitales en cada área</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="material-icons text-xs mt-0.5">arrow_right</span>
                                                        <span>Abordar miedos y resistencias mediante formación y acompañamiento</span>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Quick Win */}
                                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-icons">speed</span>
                                        <h4 className="font-black uppercase tracking-wide">Quick Win Identificado</h4>
                                    </div>
                                    <p className="text-sm">
                                        Apalancarse en <strong>{strongest.name}</strong> (puntaje: {strongest.average.toFixed(2)})
                                        como fortaleza existente para impulsar las áreas más débiles. Esta dimensión puede servir
                                        como catalizador y generar momentum organizacional hacia la transformación digital.
                                    </p>
                                </div>

                                {/* Horizonte Estratégico */}
                                <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-icons">timeline</span>
                                        <h4 className="font-black uppercase tracking-wide">Horizonte Estratégico</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="font-bold mb-1">📅 Corto Plazo (0-6 meses)</div>
                                            <div className="text-xs text-white/80">
                                                Fortalecer {weakest[0].name}. Implementar acciones rápidas que demuestren resultados visibles.
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold mb-1">📅 Mediano Plazo (6-18 meses)</div>
                                            <div className="text-xs text-white/80">
                                                Balancear {weakest[1].name}. Consolidar procesos y estructuras de soporte.
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold mb-1">📅 Largo Plazo (18+ meses)</div>
                                            <div className="text-xs text-white/80">
                                                Optimizar todas las micro-fundaciones. Alcanzar ventaja competitiva sostenible.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
