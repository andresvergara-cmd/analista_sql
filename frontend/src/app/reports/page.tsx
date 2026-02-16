"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RadarChart } from '@/components/RadarChart';

interface Answer {
    id: string;
    studentName: string;
    respondentName: string;
    respondentEmail: string;
    company?: { id: string; name: string };
    submittedAt: string;
    responses: Record<string, number>;
    diagnosis?: { id: string; score: number; result?: string | { foundations: { name: string; score: number }[] } }; // Added result to diagnosis
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'report'>('report');
    const [editingReport, setEditingReport] = useState<Answer | null>(null);

    const fetchReports = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/reports');
            const data = await res.json();
            if (Array.isArray(data)) {
                setReports(data);
            } else {
                console.error('Data is not an array:', data);
                setReports([]);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Consolidation Logic
    const companySummaries = Array.isArray(reports) ? reports.reduce((acc: any, report) => {
        const companyId = report.company?.id || 'Otro';
        const companyName = report.company?.name || 'Otro';
        // Group by Name to avoid duplicates if multiple IDs exist for the same name
        const groupKey = companyName;

        if (!acc[groupKey]) {
            acc[groupKey] = {
                id: companyId,
                name: companyName,
                totalScore: 0,
                count: 0,
                latestDate: report.submittedAt,
                respondents: [],
                foundations: {} // Accumulator for foundation scores
            };
        }
        if (report.diagnosis) {
            acc[groupKey].totalScore += report.diagnosis.score;
            acc[groupKey].count += 1;

            // Parse result to get foundation scores
            try {
                if (report.diagnosis.result) {
                    const result = JSON.parse(typeof report.diagnosis.result === 'string' ? report.diagnosis.result : JSON.stringify(report.diagnosis.result));
                    if (result.foundations) {
                        result.foundations.forEach((f: any) => {
                            const fKey = f.id || f.name; // Use ID as key if available
                            if (!acc[groupKey].foundations[fKey]) {
                                acc[groupKey].foundations[fKey] = { total: 0, count: 0, name: f.name };
                            }
                            acc[groupKey].foundations[fKey].total += (f.average || (f.score / 20)); // Fallback to score/20 if average missing
                            acc[groupKey].foundations[fKey].count += 1;
                        });
                    }
                }
            } catch (e) {
                console.error('Error parsing diagnosis result', e);
            }
        }
        if (new Date(report.submittedAt) > new Date(acc[groupKey].latestDate)) {
            acc[groupKey].latestDate = report.submittedAt;
        }
        acc[groupKey].respondents.push(report.respondentName);
        return acc;
    }, {}) : {};

    const summaries = Object.values(companySummaries).map((s: any) => {
        // Calculate average foundation scores
        const foundationsList = Object.keys(s.foundations).map(key => ({
            label: key, // Use the ID (DMI, DIF, etc.)
            value: s.foundations[key].total / s.foundations[key].count
        }));

        return {
            ...s,
            averageScore: s.count > 0 ? (s.totalScore / s.count).toFixed(1) : 'N/A',
            radarData: foundationsList
        };
    });

    const handleUpdateResponse = async (itemId: string, value: number) => {
        if (!editingReport) return;
        const newResponses = { ...editingReport.responses, [itemId]: value };
        setEditingReport({ ...editingReport, responses: newResponses });
    };

    const saveChanges = async () => {
        if (!editingReport) return;
        try {
            const res = await fetch(`http://localhost:3001/api/answers/${editingReport.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ responses: editingReport.responses })
            });
            if (res.ok) {
                setEditingReport(null);
                fetchReports();
            }
        } catch (error) {
            console.error('Error saving report:', error);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Reportes y Datos Primarios</h1>
                    <p className="text-slate-500 text-sm mt-1">Gestión de sábanas de datos y auditoría de diagnósticos.</p>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-icons-outlined text-lg">grid_on</span>
                        Modo Tabla
                    </button>
                    <button
                        onClick={() => setViewMode('report')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${viewMode === 'report' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-icons-outlined text-lg">analytics</span>
                        Modo Informe
                    </button>
                </div>
            </header>

            {viewMode === 'report' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summaries.map((summary: any) => (
                        <div key={summary.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-icons text-2xl">business</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Madurez Promedio</p>
                                    <p className="text-3xl font-black text-primary tracking-tighter">{summary.averageScore}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{summary.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1">
                                <span className="material-icons text-xs">people</span>
                                {summary.count} encuestados registrados
                            </p>

                            {/* Mini Radar Chart */}
                            {summary.radarData && summary.radarData.length > 0 && (
                                <div className="mb-6 flex justify-center -ml-4">
                                    <RadarChart
                                        data={summary.radarData}
                                        maxValue={5}
                                        size={200}
                                    />
                                </div>
                            )}

                            <div className="space-y-3 mb-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos encuestados:</p>
                                <div className="flex -space-x-2">
                                    {summary.respondents.slice(0, 5).map((r: string, i: number) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600" title={r}>
                                            {r?.charAt(0) || '?'}
                                        </div>
                                    ))}
                                    {summary.count > 5 && (
                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            +{summary.count - 5}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Última act: {new Date(summary.latestDate).toLocaleDateString()}</span>
                                {summary.id !== 'Otro' && (
                                    <Link href={`/reports/company/${summary.id}`} className="text-primary hover:underline cursor-pointer">
                                        Ver Informe Organizacional
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Organización</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Estudiante / Encuestado</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Puntaje</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-500">
                                                {new Date(report.submittedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-200">{report.company?.name || 'Kroh 2020'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.studentName}</div>
                                            <div className="text-[10px] text-slate-400 font-medium uppercase">{report.respondentName} ({report.respondentEmail})</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {report.diagnosis ? (
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-black text-xs">
                                                    {report.diagnosis.score}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-[10px] font-bold uppercase">Sin Cálculo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingReport(report)}
                                                    className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                    title="Editar Datos Primarios"
                                                >
                                                    <span className="material-icons-outlined text-[20px]">edit_note</span>
                                                </button>
                                                {report.diagnosis && (
                                                    <Link
                                                        href={`/diagnosis/${report.diagnosis.id}`}
                                                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                                                        title="Ver Diagnóstico"
                                                    >
                                                        <span className="material-icons-outlined text-[20px]">visibility</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Edición de Datos Primarios */}
            {editingReport && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-300">
                        <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">Auditoría de Datos Primarios</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{editingReport.company?.name}</p>
                            </div>
                            <button onClick={() => setEditingReport(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <span className="material-icons text-slate-400">close</span>
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(editingReport.responses).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-primary shadow-sm">{key}</span>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Valor Primario:</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    onClick={() => handleUpdateResponse(key, n)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${value === n
                                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                        : "bg-white dark:bg-slate-800 text-slate-400 hover:text-primary border border-slate-100 dark:border-slate-700"
                                                        }`}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <footer className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-4">
                            <button
                                onClick={() => setEditingReport(null)}
                                className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={saveChanges}
                                className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                Guardar y Recalcular
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
