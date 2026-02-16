"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfigPage() {
    const router = useRouter();
    const [knowledgeBases, setKnowledgeBases] = useState([
        { id: 'kb1', name: 'Marco Kroh 2020 - Estrategia', type: 'PDF', status: 'Activo' },
        { id: 'kb2', name: 'Casos de Éxito Transformación Digital', type: 'Doc', status: 'Activo' },
    ]);

    const [instruments, setInstruments] = useState([
        { id: 'kroh-2020', name: 'Kroh et al. 2020 (Madurez)', status: 'Predeterminado' },
        { id: 'needs-assessment', name: 'Evaluación de Necesidades Específicas', status: 'Inactivo' },
    ]);

    return (
        <div className="space-y-8 max-w-5xl">
            <header>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Configuración del Sistema</h1>
                <p className="text-slate-500 text-sm mt-1">Configure las bases de conocimiento y los instrumentos activos de la plataforma.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Knowledge Base Management */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-icons text-primary">auto_stories</span>
                            Bases de Conocimiento (RAG)
                        </h2>
                        <button className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-colors">
                            <span className="material-icons">add_circle</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {knowledgeBases.map((kb) => (
                            <div key={kb.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                                        <span className="material-icons text-slate-400">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{kb.name}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{kb.type} • {kb.status}</p>
                                    </div>
                                </div>
                                <button className="text-slate-300 group-hover:text-danger p-2 transition-colors">
                                    <span className="material-icons text-[18px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl">
                        <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
                            <span className="material-icons text-xs align-middle mr-1">info</span>
                            Estos documentos alimentan el motor de IA para generar planes de acción coherentes con el contexto académico.
                        </p>
                    </div>
                </div>

                {/* Instrument Management */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-icons text-primary">fact_check</span>
                            Instrumentos Disponibles
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {instruments.map((inst) => (
                            <div key={inst.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <span className={`material-icons ${inst.status === 'Predeterminado' ? 'text-amber-500' : 'text-slate-300'}`}>star</span>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{inst.name}</p>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${inst.status === 'Predeterminado' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                    {inst.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Management Module */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-icons text-primary">groups</span>
                            Administración de Seguridad y Usuarios
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer" onClick={() => router.push('/users')}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                                    <span className="material-icons text-primary text-2xl">person_add</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Gestionar Usuarios</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Altas, bajas y roles de acceso</p>
                                </div>
                            </div>
                            <span className="material-icons text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                        </div>

                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-50 grayscale cursor-not-allowed">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                                    <span className="material-icons text-slate-400 text-2xl">security</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Políticas de Seguridad</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MFA, Sesiones y Auditoría</p>
                                </div>
                            </div>
                            <span className="material-icons text-slate-300">lock</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
