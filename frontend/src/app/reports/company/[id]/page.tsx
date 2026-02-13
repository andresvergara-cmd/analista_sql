"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { RadarChart } from '@/components/RadarChart';

interface Answer {
    id: string;
    respondentName: string;
    respondentEmail: string;
    respondentPosition: string;
    submittedAt: string;
    responses: Record<string, number>;
}

interface ReportData {
    company: {
        id: string;
        name: string;
        sector: string;
        size: string;
    };
    consolidated: {
        foundations: {
            id: string;
            name: string;
            score: number;
            average: number;
            description: string;
        }[];
        globalScore: number;
        status: string;
    };
    roadmap: any[];
    perceptionByPosition: Record<string, any>;
    answers: Answer[];
}

export default function CompanyReportPage() {
    const { id } = useParams();
    const [data, setData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'individual' | 'matrix' | 'descriptive'>('descriptive');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/organizations/${id}/report`);
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching company report:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Consolidando datos organizacionales...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.consolidated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">No hay suficientes datos</h1>
                    <p className="text-slate-500 mb-4">Esta empresa aún no tiene encuestas procesadas.</p>
                    <Link href="/reports" className="text-primary font-bold hover:underline">Volver a Reportes</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <span className="material-icons text-3xl">business</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{data.company.name}</h1>
                        <p className="text-slate-500 text-sm">Informe Consolidado de Madurez Digital • {data.answers.length} encuestados</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/reports" className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                        Volver
                    </Link>
                    <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        Descargar PDF
                    </button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('individual')}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'individual' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    1. Respuestas Individuales
                </button>
                <button
                    onClick={() => setActiveTab('matrix')}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'matrix' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    2. Matriz de Capítulos (Promedios)
                </button>
                <button
                    onClick={() => setActiveTab('descriptive')}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'descriptive' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    3. Análisis Descriptivo (Entregable)
                </button>
            </div>

            {/* Tab Content: Individual */}
            {activeTab === 'individual' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white">Encuestas Recibidas</h3>
                        <p className="text-xs text-slate-500 mt-1">Detalle de cada persona que respondió el instrumento.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4">Encuestado</th>
                                    <th className="px-6 py-4">Cargo/Posición</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Respuestas</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.answers.map((ans) => (
                                    <tr key={ans.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-white text-sm">{ans.respondentName}</div>
                                            <div className="text-[10px] text-slate-400">{ans.respondentEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{ans.respondentPosition || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {new Date(ans.submittedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 overflow-hidden max-w-[200px]">
                                                {Object.values(ans.responses).slice(0, 10).map((v, i) => (
                                                    <span key={i} className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-slate-800 text-[8px] flex items-center justify-center font-bold">{v}</span>
                                                ))}
                                                <span className="text-[8px] text-slate-400">...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary hover:underline text-[10px] font-black uppercase">Ver Detalle</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab Content: Matrix */}
            {activeTab === 'matrix' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Matriz de Desempeño por Capítulos</h3>
                            <p className="text-sm text-slate-500 mt-1">Cálculo promediado basado en los {data.answers.length} encuestados.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Puntaje Global Promedio</span>
                            <span className="text-4xl font-black text-primary tracking-tighter">{data.consolidated.globalScore}</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-4">Capítulo (Micro-fundación)</th>
                                    <th className="px-8 py-4">Puntaje Promedio (1-5)</th>
                                    <th className="px-8 py-4">Nivel de Madurez (%)</th>
                                    <th className="px-8 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {data.consolidated.foundations.map((f) => (
                                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-800 dark:text-white">{f.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{f.description}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-lg font-black text-slate-700 dark:text-slate-200">{f.average}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden min-w-[100px]">
                                                    <div
                                                        className="bg-primary h-full rounded-full"
                                                        style={{ width: `${f.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-bold text-xs">{f.score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${f.score > 70 ? 'bg-emerald-100 text-emerald-700' : f.score > 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {f.score > 70 ? 'Sólido' : f.score > 40 ? 'En Proceso' : 'Crítico'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab Content: Descriptive */}
            {activeTab === 'descriptive' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* 1. Perfil Multidimensional */}
                        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">analytics</span>
                                1. Perfil Multidimensional Organizacional
                            </h3>
                            <div className="flex flex-col lg:flex-row items-center gap-12">
                                <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/30 p-8 rounded-3xl">
                                    <RadarChart
                                        data={data.consolidated.foundations.map(f => ({
                                            label: f.id, // Use abbreviations for cleaner look
                                            value: f.average
                                        }))}
                                        maxValue={5}
                                        size={350}
                                    />
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fortaleza Principal</h4>
                                        {(() => {
                                            const best = [...data.consolidated.foundations].sort((a, b) => b.average - a.average)[0];
                                            return (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-emerald-500">check_circle</span>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{best.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">La empresa destaca en esta área con un puntaje de {best.average}. Se recomienda apalancar esta capacidad para los proyectos estratégicos.</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className="p-6 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                                        <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-4">Debilidad Crítica</h4>
                                        {(() => {
                                            const worst = [...data.consolidated.foundations].sort((a, b) => a.average - b.average)[0];
                                            return (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-rose-500">report_problem</span>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{worst.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">Esta área presenta el mayor riesgo para la transformación con un puntaje de {worst.average}. Requiere intervención inmediata.</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Identificación de Brechas (Gaps) */}
                        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">difference</span>
                                2. Identificación de Brechas de Percepción (Gaps)
                            </h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium">Análisis de consistencia entre diferentes niveles jerárquicos o roles.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(data.perceptionByPosition).map(([pos, result]: [string, any]) => (
                                    <div key={pos} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{pos}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-sm">{result.count} encuestas</span>
                                        </div>
                                        <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                                            {result.maturity.globalScore}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{result.maturity.status}</p>

                                        <div className="space-y-2">
                                            {result.maturity.foundations.slice(0, 3).map((f: any) => (
                                                <div key={f.id} className="flex justify-between items-center text-[10px]">
                                                    <span className="font-medium text-slate-500">{f.name}</span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{f.average}</span>
                                                </div>
                                            ))}
                                            <div className="text-[9px] text-primary font-bold text-center mt-2 cursor-pointer hover:underline">Ver detalle completo del rol</div>
                                        </div>
                                    </div>
                                ))}

                                {Object.keys(data.perceptionByPosition).length > 1 && (
                                    <div className="lg:col-span-3 p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl">
                                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                            <span className="material-icons text-xs align-middle mr-1">info</span>
                                            <strong>Análisis de Brecha:</strong> Existe una diferencia de {
                                                (() => {
                                                    const scores = Object.values(data.perceptionByPosition).map((r: any) => r.maturity.globalScore);
                                                    return (Math.max(...scores) - Math.min(...scores)).toFixed(1);
                                                })()
                                            } puntos entre el rol más optimista y el más crítico. Esto sugiere la necesidad de alinear la visión estratégica a través de la organización.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Hoja de Ruta y 4. Benchmarking */}
                        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">timeline</span>
                                3. Hoja de Ruta de Intervención Priorizada
                            </h3>
                            <div className="space-y-6">
                                {data.roadmap.slice(0, 4).map((item, i) => (
                                    <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.description}</p>
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-md uppercase tracking-widest">{item.horizon}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-primary text-white border border-primary rounded-3xl p-8 shadow-xl shadow-primary/20 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                                    <span className="material-icons">flag</span>
                                    4. Benchmarking (Línea Base)
                                </h3>
                                <p className="text-primary-foreground/70 text-sm font-medium mb-8">Estado actual de la madurez digital para futuras comparaciones.</p>

                                <div className="space-y-6">
                                    <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Línea Base Global</p>
                                        <div className="text-4xl font-black">{data.consolidated.globalScore}</div>
                                        <p className="text-xs font-bold mt-2 opacity-90">{data.consolidated.status}</p>
                                    </div>
                                    <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Posición en el Mercado (Sector)</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
                                                <div className="bg-white h-full w-[65%]"></div>
                                            </div>
                                            <span className="text-xs font-bold font-mono">Top 35%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-8 w-full bg-white text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                                Emitir Certificado Línea Base
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
