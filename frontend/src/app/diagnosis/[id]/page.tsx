"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RadarChart } from '@/components/RadarChart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Foundation {
    id: string;
    name: string;
    score: number;
    average: number;
    description: string;
    color?: string;
}

interface DiagnosisData {
    companyName: string;
    score: number;
    status: string;
    foundations: Foundation[];
    aiInsights: { type: string; text: string }[];
    roadmap?: any[];
}

export default function DiagnosisPage() {
    const { id } = useParams();
    const [data, setData] = useState<DiagnosisData | null>(null);
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'report' | 'table'>('report');

    useEffect(() => {
        const fetchDiagnosis = async () => {
            try {
                const res = await fetch(`${API_URL}/api/diagnosis/${id}`);
                const diagnosis = await res.json();

                if (diagnosis && diagnosis.result) {
                    const result = JSON.parse(diagnosis.result);
                    setResponses(diagnosis.answer?.responses || {});

                    // Map colors for the foundations
                    const colors = [
                        'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
                        'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
                    ];

                    setData({
                        companyName: diagnosis.assessment?.title || 'Evaluación Kroh 2020',
                        score: diagnosis.score,
                        status: getStatus(diagnosis.score),
                        foundations: result.foundations.map((f: any, i: number) => ({
                            ...f,
                            color: colors[i % colors.length]
                        })),
                        aiInsights: result.aiInsights || []
                    });
                }
            } catch (error) {
                console.error('Error fetching diagnosis:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDiagnosis();
    }, [id]);

    const getStatus = (score: number) => {
        if (score >= 4.5) return 'Líder Digital';
        if (score >= 3.5) return 'Avanzado';
        if (score >= 2.5) return 'En Transformación Digital';
        return 'En Desarrollo';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Cargando diagnóstico...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Diagnóstico no encontrado</h1>
                    <p className="text-slate-500">No hemos podido localizar los resultados para este ID.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                        <img src="/assets/logo.png" alt="Icesi" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Resultado Académico</span>
                            <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">ID: {id}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Diagnóstico de Madurez Digital</h1>
                        <p className="text-slate-500 mt-2">Marco de Referencia: <strong>Kroh et al. (2020)</strong></p>
                    </div>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
                    <button
                        onClick={() => setViewMode('report')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${viewMode === 'report' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-icons-outlined text-lg">assessment</span>
                        Modo Informe
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-icons-outlined text-lg">table_chart</span>
                        Modo Tabla
                    </button>
                </div>
            </header>

            {viewMode === 'report' ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                        {/* Global Score & Radar Chart */}
                        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <span className="material-icons text-9xl">analytics</span>
                            </div>

                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Puntaje de Micro-fundaciones</p>

                            <div className="relative mb-2">
                                <RadarChart
                                    data={data.foundations.map(f => ({ label: f.name.split(' ')[0], value: f.score * 5 / 100 }))} // Convert % back to 1-5 scale for visual if needed, or just use 0-5
                                    maxValue={5}
                                    size={300}
                                />
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                                    <span className="text-4xl font-black tracking-tighter text-slate-800 dark:text-white drop-shadow-md bg-white/80 dark:bg-slate-900/80 px-2 rounded-xl">{data.score}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                    {data.status}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Foundation Breakdown */}
                        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">bar_chart</span>
                                Desempeño por Micro-fundación
                            </h2>

                            <div className="space-y-6">
                                {data.foundations.map((f) => (
                                    <div key={f.name} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{f.name}</span>
                                                <p className="text-[10px] text-slate-400 leading-none mt-1">{f.description}</p>
                                            </div>
                                            <span className="text-xs font-black text-slate-800 dark:text-slate-100">{f.score}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`${f.color} h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80`}
                                                style={{ width: `${f.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {data.aiInsights.map((insight, i) => (
                            <div key={i} className={`p-6 rounded-2xl border ${insight.type === 'strength' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20' :
                                insight.type === 'warning' ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20' :
                                    'bg-blue-50/50 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20'
                                }`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`material-icons text-xl ${insight.type === 'strength' ? 'text-emerald-500' :
                                        insight.type === 'warning' ? 'text-amber-500' :
                                            'text-blue-500'
                                        }`}>
                                        {insight.type === 'strength' ? 'thumb_up' : insight.type === 'warning' ? 'warning' : 'tips_and_updates'}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                        {insight.type === 'strength' ? 'Fortaleza' : insight.type === 'warning' ? 'Riesgo' : 'Acción'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                                    {insight.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Hoja de Ruta de Transformación Digital */}
                    {data.roadmap && data.roadmap.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl mb-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <span className="material-icons text-9xl">map</span>
                            </div>

                            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 relative z-10">
                                <span className="material-icons-outlined text-primary">timeline</span>
                                Hoja de Ruta de Transformación Digital
                            </h2>

                            <div className="relative z-10 space-y-8">
                                {['Corto Plazo (Quick Win)', 'Mediano Plazo', 'Largo Plazo (Estratégico)'].map((horizon, index) => {
                                    const items = (data.roadmap || []).filter((item: any) => item.horizon === horizon);
                                    if (items.length === 0) return null;

                                    const stepColor = index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500';
                                    const stepBorder = index === 0 ? 'border-emerald-200 dark:border-emerald-500/30' : index === 1 ? 'border-blue-200 dark:border-blue-500/30' : 'border-purple-200 dark:border-purple-500/30';
                                    const stepBg = index === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : index === 1 ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-purple-50 dark:bg-purple-500/10';

                                    return (
                                        <div key={horizon} className="relative pl-8 md:pl-0">
                                            <div className="md:w-1/4 mb-4 md:mb-0 md:absolute md:left-0">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${stepColor} shadow-md`}>
                                                    <span className="material-icons text-[14px]">{index === 0 ? 'bolt' : index === 1 ? 'construction' : 'rocket_launch'}</span>
                                                    {horizon}
                                                </div>
                                            </div>

                                            <div className="md:ml-1/4 border-l-2 border-slate-100 dark:border-slate-800 pl-8 pb-2 space-y-4">
                                                {items.map((item: any) => (
                                                    <div key={item.id} className={`p-5 rounded-2xl border ${stepBorder} ${stepBg} transition-all hover:scale-[1.01] hover:shadow-lg`}>
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                                                                    {item.title}
                                                                    <span className="text-[10px] font-normal text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
                                                                        {item.foundation}
                                                                    </span>
                                                                </h4>
                                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl mb-12">
                    <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-icons-outlined text-primary">storage</span>
                            Sábana de Respuestas (Datos Primarios)
                        </h2>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {Object.keys(responses).length} Ítems Registrados
                        </div>
                    </header>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID Ítem</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Capturado</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Object.entries(responses).sort((a, b) => a[0].localeCompare(b[0])).map(([id, val]) => (
                                    <tr key={id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-4">
                                            <span className="text-xs font-black text-primary">{id}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-lg font-black text-slate-800 dark:text-white">{val}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">Validado</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-medium leading-relaxed">
                        <span className="font-bold text-primary">Nota Técnica:</span> Estos valores representan la entrada cruda (Likert 1-5). El sistema aplica transformaciones de inversión para items de resistencia (I34, I35, I36, I38) durante el cálculo de promedios por micro-fundación.
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-10 py-4 rounded-2xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                    <span className="material-icons-outlined text-lg">file_download</span>
                    Exportar Informe PDF
                </button>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                    <span className="material-icons-outlined text-lg">auto_fix_high</span>
                    Generar Plan de Acción (IA)
                </button>
            </div>
        </div>
    );
}
