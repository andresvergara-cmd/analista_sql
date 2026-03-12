"use client";

import { useMemo } from 'react';

// Dimensiones de Kerzner según la guía oficial
const KERZNER_DIMENSIONS = {
    K1: {
        name: 'Cultura y Lenguaje Común',
        items: ['K1', 'K2', 'K3', 'K4', 'K5'],
        description: 'Lenguaje compartido y roles claramente definidos en gestión de proyectos.'
    },
    K2: {
        name: 'Metodología Institucionalizada',
        items: ['K6', 'K7', 'K8', 'K9', 'K10'],
        description: 'Procesos estandarizados y sistemáticos en gestión de proyectos.'
    },
    K3: {
        name: 'Gobernanza y Portafolio',
        items: ['K11', 'K12', 'K13', 'K14', 'K15'],
        description: 'Priorización estratégica y gestión del portafolio de proyectos.'
    },
    K4: {
        name: 'Mejora Continua Estratégica',
        items: ['K16', 'K17', 'K18', 'K19', 'K20'],
        description: 'Capacidad de aprendizaje organizacional y adaptación estratégica.'
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
        dimensions?: Dimension[];
        globalScore: number;
        maturityLevel?: string;
        status: string;
    };
    answers: Answer[];
    perceptionByPosition: Record<string, any>;
}

interface Props {
    data: ReportData;
}

export default function KerznerAdvancedAnalysis({ data }: Props) {
    return (
        <div className="space-y-8">
            {/* 1. Nota sobre Índice Formativo */}
            <div className="bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-200 dark:border-amber-500/30 rounded-3xl p-8">
                <div className="flex items-start gap-4">
                    <span className="material-icons text-4xl text-amber-600 dark:text-amber-400">info</span>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-3">
                            Índice Kerzner: Formativo y Continuo
                        </h3>
                        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
                            El <strong>Índice Kerzner de Madurez en Gestión de Proyectos</strong> es un <strong>constructo formativo</strong>,
                            no reflectivo. Esto significa que:
                        </p>
                        <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
                            <li className="flex items-start gap-2">
                                <span className="material-icons text-xs mt-1">check_circle</span>
                                <span><strong>No se calcula Alfa de Cronbach</strong> para el índice global (no es criterio decisivo para índices formativos)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-icons text-xs mt-1">check_circle</span>
                                <span><strong>El índice es continuo (1-7)</strong>, no categórico. Evitar clasificar rígidamente en "Nivel 1, 2, 3..."</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-icons text-xs mt-1">check_circle</span>
                                <span><strong>Las dimensiones deben analizarse estructuralmente</strong>, buscando patrones evolutivos y brechas</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-icons text-xs mt-1">check_circle</span>
                                <span><strong>No hay ítems invertidos</strong> en la Parte 1 (K1-K20)</span>
                            </li>
                        </ul>
                        <div className="mt-4 p-4 bg-white/50 dark:bg-amber-900/20 rounded-xl">
                            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                📊 Resultado de esta organización: <span className="text-2xl">{data.consolidated.globalScore}</span> / 7.0
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">{data.consolidated.maturityLevel}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Promedios por Dimensión */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">bar_chart</span>
                    1. Promedios por Dimensión (K1-K4)
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Nivel acumulado de desarrollo evolutivo en gestión de proyectos. Escala 1-7 continua.
                </p>

                <div className="space-y-4">
                    {data.consolidated.dimensions?.map((dimension, idx) => (
                        <div key={dimension.id} className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg font-black text-lg">
                                        {dimension.id}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{dimension.name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{dimension.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-primary">{dimension.average.toFixed(2)}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">de 7.0</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden relative">
                                    {/* Escala de referencia visual */}
                                    <div className="absolute inset-0 flex">
                                        <div className="flex-1 border-r border-slate-200 dark:border-slate-700"></div>
                                        <div className="flex-1 border-r border-slate-200 dark:border-slate-700"></div>
                                        <div className="flex-1 border-r border-slate-200 dark:border-slate-700"></div>
                                        <div className="flex-1 border-r border-slate-200 dark:border-slate-700"></div>
                                        <div className="flex-1 border-r border-slate-200 dark:border-slate-700"></div>
                                        <div className="flex-1 border-r border-slate-200 dark:border-slate-700"></div>
                                        <div className="flex-1"></div>
                                    </div>
                                    <div
                                        className={`absolute top-0 bottom-0 left-0 ${
                                            dimension.average >= 6.5 ? 'bg-emerald-500' :
                                            dimension.average >= 5.5 ? 'bg-blue-500' :
                                            dimension.average >= 4.5 ? 'bg-purple-500' :
                                            dimension.average >= 3.5 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${((dimension.average - 1) / 6) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex gap-1 text-[8px] text-slate-400 font-mono">
                                    <span>1</span>
                                    <span>2</span>
                                    <span>3</span>
                                    <span>4</span>
                                    <span>5</span>
                                    <span>6</span>
                                    <span>7</span>
                                </div>
                            </div>

                            <div className="mt-3 text-center">
                                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
                                    dimension.average >= 5.5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    dimension.average >= 3.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                }`}>
                                    {dimension.average >= 6.5 ? 'Desarrollo Avanzado' :
                                     dimension.average >= 5 ? 'Desarrollo Intermedio-Alto' :
                                     dimension.average >= 3.5 ? 'Desarrollo Intermedio' :
                                     'Bajo Desarrollo'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/5 dark:to-pink-500/5 border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">Índice Global Kerzner (Continuo)</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Promedio de K1, K2, K3, K4 • {data.answers.length} respondentes
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-black text-primary">{data.consolidated.globalScore.toFixed(2)}</div>
                            <div className="text-sm font-bold text-slate-500 mt-1">{data.consolidated.status}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Coherencia Evolutiva */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">trending_up</span>
                    2. Análisis de Coherencia Evolutiva
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Evaluación de la progresión lógica entre dimensiones del modelo PMMM.
                </p>

                {(() => {
                    const K1 = data.consolidated.dimensions?.find(d => d.id === 'K1')?.average || 0;
                    const K2 = data.consolidated.dimensions?.find(d => d.id === 'K2')?.average || 0;
                    const K3 = data.consolidated.dimensions?.find(d => d.id === 'K3')?.average || 0;
                    const K4 = data.consolidated.dimensions?.find(d => d.id === 'K4')?.average || 0;

                    const cresciente = K1 < K2 && K2 < K3 && K3 < K4;
                    const saltoK2K3 = Math.abs(K3 - K2) > 1.5;
                    const K4bajo = K4 < K3 && (K3 - K4) > 1.0;
                    const patronPyme = K1 > 4.5 && K3 < 3.5;

                    return (
                        <div className="space-y-6">
                            {/* Gráfico de tendencia */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm">Progresión Dimensional</h4>
                                <div className="flex items-end justify-between gap-2 h-48">
                                    {data.consolidated.dimensions?.map((dim) => (
                                        <div key={dim.id} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg relative" style={{ height: `${(dim.average / 7) * 100}%`, minHeight: '20px' }}>
                                                <div className={`absolute inset-0 rounded-t-lg ${
                                                    dim.average >= 5.5 ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' :
                                                    dim.average >= 3.5 ? 'bg-gradient-to-t from-amber-500 to-amber-400' :
                                                    'bg-gradient-to-t from-rose-500 to-rose-400'
                                                }`}></div>
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow">
                                                    {dim.average.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs font-bold text-primary">{dim.id}</div>
                                                <div className="text-[9px] text-slate-500">{dim.name.split(' ')[0]}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Análisis de patrones */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ¿Crecimiento progresivo? */}
                                <div className={`p-5 rounded-xl border-2 ${
                                    cresciente
                                        ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30'
                                        : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/30'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`material-icons text-sm ${cresciente ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {cresciente ? 'check_circle' : 'warning'}
                                        </span>
                                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">¿Crecimiento Progresivo?</h5>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {cresciente
                                            ? 'Las dimensiones muestran una evolución coherente y progresiva (K1<K2<K3<K4). Esto indica una madurez balanceada.'
                                            : 'No existe un patrón de crecimiento lineal entre todas las dimensiones. Revisar brechas estructurales.'}
                                    </p>
                                </div>

                                {/* Salto K2-K3 */}
                                <div className={`p-5 rounded-xl border-2 ${
                                    saltoK2K3
                                        ? 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/30'
                                        : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`material-icons text-sm ${saltoK2K3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {saltoK2K3 ? 'error' : 'check_circle'}
                                        </span>
                                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Brecha K2 → K3</h5>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {saltoK2K3
                                            ? `Existe un salto significativo de ${Math.abs(K3 - K2).toFixed(1)} puntos entre Metodología (K2) y Gobernanza (K3). Brecha crítica.`
                                            : 'La transición entre Metodología y Gobernanza es coherente. No se detectan brechas críticas.'}
                                    </p>
                                </div>

                                {/* K4 significativamente menor */}
                                <div className={`p-5 rounded-xl border-2 ${
                                    K4bajo
                                        ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/30'
                                        : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`material-icons text-sm ${K4bajo ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            {K4bajo ? 'priority_high' : 'check_circle'}
                                        </span>
                                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">K4 (Mejora Continua)</h5>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {K4bajo
                                            ? 'K4 es significativamente menor que K3. La organización no está capitalizando aprendizajes organizacionales de manera sistemática.'
                                            : 'K4 muestra un nivel coherente con las demás dimensiones. Buena capacidad de mejora continua.'}
                                    </p>
                                </div>

                                {/* Patrón típico PyME */}
                                <div className={`p-5 rounded-xl border-2 ${
                                    patronPyme
                                        ? 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/30'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`material-icons text-sm ${patronPyme ? 'text-blue-600' : 'text-slate-600'}`}>
                                            business
                                        </span>
                                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Patrón PyME Detectado</h5>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {patronPyme
                                            ? 'Patrón típico: K1 alto + K3 bajo. Cultura informal fuerte sin gobernanza formal de portafolio. Común en organizaciones en crecimiento.'
                                            : 'No se detecta el patrón típico PyME. La gobernanza está relativamente desarrollada respecto a la cultura.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* 4. Comparaciones por Rol */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">people</span>
                    3. Comparaciones por Rol/Posición
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                    Análisis de percepción diferencial de madurez PM según nivel jerárquico.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(data.perceptionByPosition).map(([position, result]: [string, any]) => (
                        <div key={position} className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-purple-400 hover:shadow-xl transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="material-icons text-white">badge</span>
                                </div>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-[10px] font-bold text-purple-700 dark:text-purple-400">
                                    {result.count} {result.count === 1 ? 'respondente' : 'respondentes'}
                                </span>
                            </div>

                            <h4 className="font-black text-xl text-slate-800 dark:text-white mb-2">{position}</h4>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-primary">{result.maturity.globalScore}</span>
                                <span className="text-xs text-slate-400">/ 7.0</span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mb-4">{result.maturity.maturityLevel}</p>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dimensiones</p>
                                {(result.maturity.dimensions || []).map((dim: any) => (
                                    <div key={dim.id} className="flex justify-between items-center">
                                        <span className="text-xs text-slate-600 dark:text-slate-400">{dim.id}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-purple-500"
                                                    style={{ width: `${((dim.average - 1) / 6) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-primary w-8 text-right">{dim.average.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {Object.keys(data.perceptionByPosition).length > 1 && (
                    <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-blue-600 dark:text-blue-400 mt-0.5">analytics</span>
                            <div className="flex-1">
                                <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Análisis de Brecha de Percepción</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                    Diferencia entre rol más optimista y más crítico: {
                                        (() => {
                                            const scores = Object.values(data.perceptionByPosition).map((r: any) => r.maturity.globalScore);
                                            const gap = (Math.max(...scores) - Math.min(...scores)).toFixed(2);
                                            return (
                                                <strong className="text-lg">{gap} puntos</strong>
                                            );
                                        })()
                                    }
                                </p>
                                {(() => {
                                    const scores = Object.values(data.perceptionByPosition).map((r: any) => r.maturity.globalScore);
                                    const gap = Math.max(...scores) - Math.min(...scores);

                                    if (gap > 0.7) {
                                        return (
                                            <div className="bg-white/50 dark:bg-blue-900/20 p-4 rounded-xl">
                                                <p className="text-xs text-blue-800 dark:text-blue-200 font-bold mb-2">⚠️ Brecha Relevante Detectada (&gt; 0.7 puntos)</p>
                                                <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                                    <li className="flex items-start gap-2">
                                                        <span>•</span>
                                                        <span>Posibles divergencias estratégicas entre niveles jerárquicos</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span>•</span>
                                                        <span>Recomendación: Sesiones de alineación inter-nivel sobre estado de madurez PM</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span>•</span>
                                                        <span>Investigar causas: ¿Falta de comunicación? ¿Visiones diferentes de la realidad operativa?</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                ✓ La brecha es menor a 0.7 puntos, lo cual indica una percepción relativamente alineada entre roles.
                                            </p>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. Identificación de Brechas Estructurales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="material-icons-outlined text-primary">difference</span>
                    4. Identificación de Brechas Estructurales
                </h3>

                {(() => {
                    const K1 = data.consolidated.dimensions?.find(d => d.id === 'K1')?.average || 0;
                    const K2 = data.consolidated.dimensions?.find(d => d.id === 'K2')?.average || 0;
                    const K3 = data.consolidated.dimensions?.find(d => d.id === 'K3')?.average || 0;
                    const K4 = data.consolidated.dimensions?.find(d => d.id === 'K4')?.average || 0;

                    const metodologiaFormalizada = K2 >= 4.5;
                    const gobernanzaReal = K3 >= 4.5;
                    const capturanAprendizajes = K4 >= 4.5;

                    return (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* ¿Metodológicamente formalizada? */}
                                <div className={`p-6 rounded-xl border-2 ${
                                    metodologiaFormalizada
                                        ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30'
                                        : 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/30'
                                }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Metodología Formal</h5>
                                        <span className={`material-icons ${metodologiaFormalizada ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {metodologiaFormalizada ? 'check_circle' : 'cancel'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="text-2xl font-black text-primary">{K2.toFixed(2)}</div>
                                        <div className="text-[10px] text-slate-400">K2: Metodología Institucionalizada</div>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {metodologiaFormalizada
                                            ? 'La empresa cuenta con procesos y metodologías PM estandarizadas.'
                                            : 'Los proyectos carecen de metodología común y sistemática. Riesgo de inconsistencia.'}
                                    </p>
                                </div>

                                {/* ¿Gobernanza real? */}
                                <div className={`p-6 rounded-xl border-2 ${
                                    gobernanzaReal
                                        ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30'
                                        : 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/30'
                                }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Gobernanza de Portafolio</h5>
                                        <span className={`material-icons ${gobernanzaReal ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {gobernanzaReal ? 'check_circle' : 'cancel'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="text-2xl font-black text-primary">{K3.toFixed(2)}</div>
                                        <div className="text-[10px] text-slate-400">K3: Gobernanza y Portafolio</div>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {gobernanzaReal
                                            ? 'Existe priorización estratégica y gestión formal del portafolio de proyectos.'
                                            : 'No hay gobernanza clara. Los proyectos no se priorizan según criterios estratégicos formales.'}
                                    </p>
                                </div>

                                {/* ¿Capturan aprendizajes? */}
                                <div className={`p-6 rounded-xl border-2 ${
                                    capturanAprendizajes
                                        ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30'
                                        : 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/30'
                                }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">Aprendizaje Organizacional</h5>
                                        <span className={`material-icons ${capturanAprendizajes ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {capturanAprendizajes ? 'check_circle' : 'cancel'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="text-2xl font-black text-primary">{K4.toFixed(2)}</div>
                                        <div className="text-[10px] text-slate-400">K4: Mejora Continua Estratégica</div>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        {capturanAprendizajes
                                            ? 'La organización captura y aplica lecciones aprendidas de manera sistemática.'
                                            : 'Las lecciones aprendidas no se institucionalizan. Se repiten errores entre proyectos.'}
                                    </p>
                                </div>
                            </div>

                            {/* Diagnóstico de cuello de botella */}
                            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 border-2 border-amber-200 dark:border-amber-500/30 rounded-2xl">
                                <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
                                    <span className="material-icons">report_problem</span>
                                    Cuello de Botella Estructural
                                </h4>
                                {(() => {
                                    const dimensionsArray = [
                                        { id: 'K1', name: 'Cultura y Lenguaje Común', value: K1 },
                                        { id: 'K2', name: 'Metodología Institucionalizada', value: K2 },
                                        { id: 'K3', name: 'Gobernanza y Portafolio', value: K3 },
                                        { id: 'K4', name: 'Mejora Continua Estratégica', value: K4 }
                                    ];
                                    const weakest = dimensionsArray.sort((a, b) => a.value - b.value)[0];

                                    const riskMessages: Record<string, string> = {
                                        'K1': 'Sin lenguaje común, los proyectos carecen de una base comunicacional sólida, generando malentendidos y falta de alineación.',
                                        'K2': 'Sin metodología institucionalizada, cada proyecto se gestiona de forma ad-hoc, impidiendo escalabilidad y predictibilidad.',
                                        'K3': 'Sin gobernanza, los recursos se dispersan en proyectos no estratégicos, comprometiendo el ROI organizacional.',
                                        'K4': 'Sin captura de aprendizajes, la organización no evoluciona. Se repiten errores costosos indefinidamente.'
                                    };

                                    return (
                                        <div>
                                            <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                                                La dimensión más débil es: <strong className="text-lg">{weakest.name} ({weakest.id})</strong> con {weakest.value.toFixed(2)} puntos.
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-400 bg-white/50 dark:bg-amber-900/20 p-4 rounded-lg">
                                                <strong>Riesgo organizacional:</strong> {riskMessages[weakest.id]}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* 6. Recomendaciones Estratégicas */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <span className="material-icons-outlined">rocket_launch</span>
                    5. Recomendaciones Estratégicas Basadas en Evidencia
                </h3>
                <p className="text-purple-100 text-sm mb-6">
                    Plan de acción específico para {data.company.name} según el diagnóstico estructural de madurez PM.
                </p>

                {(() => {
                    const sortedDims = [...(data.consolidated.dimensions || [])].sort((a, b) => a.average - b.average);
                    const weakest = sortedDims[0];
                    const secondWeakest = sortedDims[1];

                    const recommendationsMap: Record<string, { title: string; description: string; actions: string[] }> = {
                        'K1': {
                            title: 'Establecer Lenguaje Común PM',
                            description: 'La organización requiere urgentemente estandarizar terminología y roles en gestión de proyectos.',
                            actions: [
                                'Diseñar e impartir programa de certificación interna en PM (40 horas mínimo)',
                                'Crear glosario organizacional de términos de proyectos y publicarlo en intranet',
                                'Definir matriz RACI para roles en proyectos (Sponsor, PM, equipo, stakeholders)',
                                'Implementar plantillas estandarizadas de alcance, cronograma, riesgos y cierre'
                            ]
                        },
                        'K2': {
                            title: 'Implementar Metodología Formal PM',
                            description: 'Es crítico adoptar una metodología sistemática y coherente para todos los proyectos.',
                            actions: [
                                'Seleccionar metodología de PM (PMI/PRINCE2/Agile) alineada con estrategia organizacional',
                                'Capacitar al equipo completo en la metodología seleccionada',
                                'Implementar software de gestión de proyectos (MS Project, Jira, Monday, Asana)',
                                'Crear proceso de gestión de riesgos con registro, análisis cualitativo/cuantitativo y seguimiento',
                                'Definir KPIs comunes para todos los proyectos (CPI, SPI, varianza presupuesto)'
                            ]
                        },
                        'K3': {
                            title: 'Formalizar Gobernanza de Portafolio',
                            description: 'Establecer priorización estratégica y supervisión formal del portafolio de proyectos.',
                            actions: [
                                'Formar Comité de Portafolio con participación ejecutiva (CEO, CFO, COO)',
                                'Definir criterios explícitos de priorización (ROI, alineación estratégica, riesgo, recursos)',
                                'Implementar reuniones trimestrales de revisión formal del portafolio',
                                'Crear procedimiento de cancelación de proyectos no estratégicos (kill criteria)',
                                'Implementar dashboard ejecutivo de portafolio con estado en tiempo real'
                            ]
                        },
                        'K4': {
                            title: 'Institucionalizar Mejora Continua',
                            description: 'Capturar y aplicar sistemáticamente lecciones aprendidas para evolución organizacional.',
                            actions: [
                                'Crear proceso formal de mejora continua basado en ciclo PDCA',
                                'Institucionalizar sesiones de retrospectiva obligatorias al cierre de cada proyecto',
                                'Vincular lecciones aprendidas con procesos de planificación estratégica anual',
                                'Establecer indicadores de madurez PM con medición semestral y tendencias',
                                'Implementar comunidad de práctica interna en PM con reuniones mensuales'
                            ]
                        }
                    };

                    const weakestRec = recommendationsMap[weakest.id];
                    const secondRec = recommendationsMap[secondWeakest.id];

                    return (
                        <div className="space-y-6">
                            {/* Prioridad 1: Crítica */}
                            <div className="p-6 bg-white/15 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-icons text-rose-300">priority_high</span>
                                    <h4 className="font-black text-lg uppercase tracking-wide">Prioridad 1: CRÍTICA</h4>
                                    <span className="ml-auto px-3 py-1 bg-rose-500/30 rounded-full text-xs font-bold">URGENTE</span>
                                </div>
                                <div className="mb-3">
                                    <div className="text-sm font-bold mb-1">{weakestRec.title}</div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-white/70">{weakest.name}</span>
                                        <span className="text-lg font-black">{weakest.average.toFixed(2)}</span>
                                        <span className="text-xs text-white/60">/ 7.0</span>
                                    </div>
                                    <p className="text-xs text-white/80 mb-3">{weakestRec.description}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-white/90">Acciones inmediatas:</p>
                                    <ul className="space-y-1.5">
                                        {weakestRec.actions.map((action, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-white/90">
                                                <span className="material-icons text-[10px] mt-0.5">arrow_right</span>
                                                <span>{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Prioridad 2: Alta */}
                            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-icons text-amber-300">warning</span>
                                    <h4 className="font-bold uppercase tracking-wide">Prioridad 2: Alta</h4>
                                </div>
                                <div className="mb-3">
                                    <div className="text-sm font-bold mb-1">{secondRec.title}</div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-white/70">{secondWeakest.name}</span>
                                        <span className="text-lg font-black">{secondWeakest.average.toFixed(2)}</span>
                                        <span className="text-xs text-white/60">/ 7.0</span>
                                    </div>
                                    <p className="text-xs text-white/80">{secondRec.description}</p>
                                </div>
                            </div>

                            {/* Horizonte temporal */}
                            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-icons">schedule</span>
                                    <h4 className="font-bold uppercase tracking-wide">Horizonte de Implementación</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-white/5 rounded-xl">
                                        <div className="font-bold mb-1 text-sm">0-6 meses</div>
                                        <div className="text-xs text-white/80">Corto Plazo</div>
                                        <div className="text-[10px] text-white/60 mt-2">Atacar {weakest.id}</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-xl">
                                        <div className="font-bold mb-1 text-sm">6-12 meses</div>
                                        <div className="text-xs text-white/80">Mediano Plazo</div>
                                        <div className="text-[10px] text-white/60 mt-2">Fortalecer {secondWeakest.id}</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 rounded-xl">
                                        <div className="font-bold mb-1 text-sm">12-18 meses</div>
                                        <div className="text-xs text-white/80">Largo Plazo</div>
                                        <div className="text-[10px] text-white/60 mt-2">Optimización global</div>
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
