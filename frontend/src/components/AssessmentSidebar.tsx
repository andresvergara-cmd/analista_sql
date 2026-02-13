"use client";

import { useState } from 'react';

interface SidebarProps {
    currentSection: string;
    questionId: string;
}

export default function AssessmentSidebar({ currentSection, questionId }: SidebarProps) {
    const [query, setQuery] = useState('');

    const getContext = () => {
        switch (currentSection) {
            case 'Digital Focus':
                return "Respecto a la Estrategia Digital: Los marcos de Kroh et al. (2020) sugieren que la formulación explícita es el primer paso para habilitar el 'sensing' organizacional.";
            case 'Digital Innovation Process':
                return "La agilidad en procesos digitales requiere un balance entre el control tradicional y la flexibilidad para la experimentación rápida.";
            case 'Digital Mindset':
                return "El mindset digital no es solo saber usar herramientas, sino entender el potencial transformador de la tecnología en cada rol.";
            default:
                return "Selecciona una sección para obtener contexto académico basado en el marco de Kroh et al. 2020.";
        }
    };

    return (
        <aside className="w-[380px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden xl:flex flex-col shadow-inner">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-icons">auto_awesome</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white leading-tight">Asistente IA</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">RAG Activo</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-icons text-xs">menu_book</span>
                            Contexto Académico
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold italic mb-4">
                            "{getContext()}"
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <span className="material-icons text-sm text-primary">check_circle</span>
                                <span>Busque evidencia de alineación estratégica.</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <span className="material-icons text-sm text-primary">check_circle</span>
                                <span>Considere la asignación de presupuesto dedicado.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-icons text-xs">bookmark</span>
                        Referencias (Kroh 2020)
                    </h3>
                    <div className="space-y-4">
                        <div className="group cursor-help bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-icons text-slate-400 text-sm">description</span>
                                <span className="text-xs font-bold group-hover:text-primary transition-colors">Micro-foundations</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                                "Las siete micro-fundaciones facilitan el sensing, seizing y reconfiguring de la innovación digital."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 mb-2">
                        <span className="material-icons text-sm">lightbulb</span>
                        <span className="text-xs font-black uppercase tracking-tight">Tip de Consultor</span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-500/80 leading-relaxed font-medium">
                        La resistencia legal (protección de datos) suele ser una barrera crítica en pymes industriales.
                    </p>
                </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="relative">
                    <input
                        className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-12 py-3.5 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        placeholder="Consulte al asistente..."
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                        <span className="material-icons text-sm">send</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
