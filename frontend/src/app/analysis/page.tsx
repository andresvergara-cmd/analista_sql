"use client";

import { useState } from 'react';

export default function AnalysisPage() {
    const [useCases] = useState([
        { id: 1, title: 'Optimización de Ruta Logística con IA', impact: 'Alto', effort: 'Medio', type: 'Quick Win', score: 85 },
        { id: 2, title: 'Predicción de Demanda en Silos', impact: 'Alto', effort: 'Alto', type: 'Estratégico', score: 70 },
        { id: 3, title: 'Automatización de Facturación Electrónica', impact: 'Medio', effort: 'Bajo', type: 'Quick Win', score: 90 },
        { id: 4, title: 'Dashboard de Indicadores en Tiempo Real', impact: 'Alto', effort: 'Bajo', type: 'Quick Win', score: 95 },
        { id: 5, title: 'Mantenimiento Predictivo de Flota', impact: 'Alto', effort: 'Alto', type: 'Estratégico', score: 75 },
        { id: 6, title: 'Clasificación Automática de Inventarios', impact: 'Medio', effort: 'Medio', type: 'Quick Win', score: 82 },
        { id: 7, title: 'Auditoría de Seguridad por Visión Artificial', impact: 'Alto', effort: 'Alto', type: 'Estratégico', score: 65 },
        { id: 8, title: 'Chatbot de Soporte para Operarios', impact: 'Medio', effort: 'Bajo', type: 'Quick Win', score: 88 },
        { id: 9, title: 'Pronóstico de Precios de Insumos', impact: 'Alto', effort: 'Alto', type: 'Estratégico', score: 72 },
        { id: 10, title: 'Optimización de Embalaje y Carga', impact: 'Alto', effort: 'Medio', type: 'Quick Win', score: 84 },
    ]);

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Análisis con IA</h1>
                    <p className="text-slate-500 text-sm mt-1">Identificación y priorización de casos de uso basados en datos de diagnóstico.</p>
                </div>
                <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                    <span className="material-icons">auto_fix_high</span>
                    Ejecutar Análisis IA
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Impact/Effort Matrix */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm overflow-hidden relative">
                    <div className="absolute top-8 right-8 flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Quick Wins</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Estratégico</span>
                    </div>

                    <h2 className="text-xl font-bold mb-10 flex items-center gap-2">
                        <span className="material-icons text-primary">grid_view</span>
                        Matriz de Impacto vs Esfuerzo
                    </h2>

                    <div className="relative aspect-video border-l-2 border-b-2 border-slate-200 dark:border-slate-800 ml-8 mb-8">
                        {/* Axis Labels */}
                        <div className="absolute -left-12 top-1/2 -rotate-90 text-[10px] font-black uppercase tracking-widest text-slate-400">Impacto</div>
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400">Esfuerzo</div>

                        {/* Grid Areas */}
                        <div className="grid grid-cols-2 grid-rows-2 h-full w-full opacity-20">
                            <div className="border border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/20"></div>
                            <div className="border border-slate-100 dark:border-slate-800 bg-blue-50 dark:bg-blue-950/20"></div>
                            <div className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20"></div>
                            <div className="border border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-950/20"></div>
                        </div>

                        {/* Use Case Points */}
                        <div className="absolute inset-0">
                            {/* Dashboard (High Impact, Low Effort) */}
                            <div className="absolute top-[15%] left-[15%] group">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40 cursor-pointer animate-pulse"></div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <p className="text-xs font-bold leading-tight">Dashboard en Tiempo Real</p>
                                    <p className="text-[10px] text-emerald-500 mt-1 uppercase font-black">Quick Win</p>
                                </div>
                            </div>

                            {/* Facturación (Med Impact, Low Effort) */}
                            <div className="absolute top-[50%] left-[10%] group">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg cursor-pointer"></div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <p className="text-xs font-bold leading-tight">Automatización de Facturación</p>
                                    <p className="text-[10px] text-emerald-400 mt-1 uppercase font-black">Quick Win</p>
                                </div>
                            </div>

                            {/* Rutas (High Impact, Med Effort) */}
                            <div className="absolute top-[20%] left-[45%] group">
                                <div className="w-4 h-4 bg-emerald-600 rounded-full shadow-lg cursor-pointer"></div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <p className="text-xs font-bold leading-tight">Optimización de Rutas</p>
                                    <p className="text-[10px] text-emerald-600 mt-1 uppercase font-black">Quick Win</p>
                                </div>
                            </div>

                            {/* Predicción Demanda (High Impact, High Effort) */}
                            <div className="absolute top-[25%] left-[75%] group">
                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/40 cursor-pointer"></div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <p className="text-xs font-bold leading-tight">Predicción de Demanda</p>
                                    <p className="text-[10px] text-blue-500 mt-1 uppercase font-black">Estratégico</p>
                                </div>
                            </div>

                            {/* Mantenimiento (High Impact, High Effort) */}
                            <div className="absolute top-[40%] left-[85%] group">
                                <div className="w-4 h-4 bg-blue-600 rounded-full shadow-lg cursor-pointer"></div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <p className="text-xs font-bold leading-tight">Mantenimiento Predictivo</p>
                                    <p className="text-[10px] text-blue-600 mt-1 uppercase font-black">Estratégico</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Identified Cases */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <span className="material-icons text-sm">stars</span>
                            Quick Wins Recomendados
                        </h3>

                        <div className="space-y-4">
                            {useCases.filter(c => c.type === 'Quick Win').map(useCase => (
                                <div key={useCase.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-l-4 border-emerald-500">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{useCase.title}</h4>
                                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{useCase.score}%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-slate-500 font-bold">Esfuerzo: {useCase.effort}</span>
                                        <span className="text-[10px] text-slate-500 font-bold">Impacto: {useCase.impact}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-icons">info</span>
                            <span className="text-xs font-black uppercase tracking-widest">Tip de Priorización</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            Concéntrese en el cuadrante superior izquierdo (Quick Wins) para demostrar valor inmediato a la organización con el menor esfuerzo técnico.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
