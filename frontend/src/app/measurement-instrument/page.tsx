"use client";

import Link from 'next/link';

export default function DiagnosticsListPage() {
    const diagnostics = [
        { id: 'kroh-2020', name: 'Madurez Digital (Kroh et al. 2020)', status: 'Activo', items: 32 },
        { id: 'ind-40', name: 'Preparación Industria 4.0', status: 'Draft', items: 25 },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Instrumento de Medición</h1>
                <p className="text-slate-500">Seleccione un marco de referencia para iniciar una nueva evaluación de madurez.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {diagnostics.map((d) => (
                    <div key={d.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-primary transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                                <span className="material-icons-outlined">analytics</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${d.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {d.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-1">{d.name}</h3>
                        <p className="text-xs text-slate-500 mb-6">{d.items} ítems de evaluación científica.</p>

                        <Link
                            href={d.id === 'kroh-2020' ? '/measurement-instrument/kroh-2020' : '#'}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-primary hover:text-white transition-all"
                        >
                            Iniciar Evaluación
                            <span className="material-icons-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
