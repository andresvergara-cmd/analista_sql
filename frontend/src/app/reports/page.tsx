"use client";

import Link from 'next/link';

export default function ReportsPage() {
    const instruments = [
        {
            id: 'kroh',
            name: 'Madurez Digital (Kroh et al. 2020 + Angelshaug 2025)',
            description: 'Análisis de madurez digital organizacional basado en 8 micro-fundaciones',
            icon: 'analytics',
            color: 'from-blue-500 to-indigo-600',
            route: '/reports/kroh',
            stats: { dimensions: 8, scale: '1-5', items: 32 }
        },
        {
            id: 'kerzner',
            name: 'Madurez PM (Kerzner PMMM)',
            description: 'Evaluación de madurez en gestión de proyectos según el modelo PMMM',
            icon: 'account_tree',
            color: 'from-purple-500 to-pink-600',
            route: '/reports/kerzner',
            stats: { dimensions: 4, scale: '1-7', items: 20 }
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
                            Análisis y Reportes
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl">
                            Seleccione el instrumento de medición para acceder a los reportes consolidados y análisis organizacional.
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instruments.map((instrument) => (
                    <Link
                        key={instrument.id}
                        href={instrument.route}
                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-transparent hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
                    >
                        <div className={`h-2 bg-gradient-to-r ${instrument.color}`}></div>

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${instrument.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    <span className="material-icons text-3xl">{instrument.icon}</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                {instrument.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                {instrument.description}
                            </p>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Dimensiones</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{instrument.stats.dimensions}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Escala</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{instrument.stats.scale}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Items</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{instrument.stats.items}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-500">Ver reportes consolidados</span>
                                <span className="material-icons text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                    <span className="material-icons text-blue-500 mt-0.5">info</span>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white mb-1">Sobre los Reportes</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Cada submódulo presenta los reportes consolidados por organización, análisis de percepción por cargo,
                            brechas identificadas y hojas de ruta de intervención priorizadas según el instrumento seleccionado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
