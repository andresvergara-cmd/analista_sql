"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Company {
    id: string;
    name: string;
    sector?: string;
    size?: string;
}

export default function KerznerInstrumentPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompaniesWithKerznerData();
    }, []);

    async function fetchCompaniesWithKerznerData() {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/organizations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            // Filter companies that have Kerzner assessments
            const orgs = Array.isArray(data) ? data : (data.organizations || []);
            setCompanies(orgs);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <header className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 border border-indigo-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
                                <span className="material-icons text-white text-2xl">account_tree</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Madurez en Gestión de Proyectos
                                </h1>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                    Modelo de Harold Kerzner - PMMM
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-3xl">
                            Evalúa la madurez organizacional en gestión de proyectos mediante 4 dimensiones clave:
                            Cultura y Lenguaje Común, Metodología Institucionalizada, Gobernanza y Portafolio,
                            y Mejora Continua Estratégica.
                        </p>
                    </div>
                    <Link
                        href="/measurement-instrument"
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                    >
                        <span className="material-icons text-sm">arrow_back</span>
                        Volver
                    </Link>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Dimensiones</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">4</p>
                        <p className="text-xs text-slate-500 mt-1">Áreas de evaluación</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Preguntas</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">20</p>
                        <p className="text-xs text-slate-500 mt-1">Ítems de evaluación</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Escala</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">1-7</p>
                        <p className="text-xs text-slate-500 mt-1">Escala Likert</p>
                    </div>
                </div>
            </header>

            {/* Dimensions Overview */}
            <section>
                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">Dimensiones del Modelo PMMM</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-blue-600 dark:text-blue-400">language</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">K1: Cultura y Lenguaje Común</h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Evalúa la existencia de un lenguaje compartido y roles claramente definidos en gestión de proyectos.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-purple-600 dark:text-purple-400">settings</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">K2: Metodología Institucionalizada</h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Mide la existencia de procesos estandarizados y sistemáticos en gestión de proyectos.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-green-600 dark:text-green-400">account_balance</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">K3: Gobernanza y Portafolio</h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Evalúa la priorización estratégica y gestión del portafolio de proyectos.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <span className="material-icons text-orange-600 dark:text-orange-400">trending_up</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">K4: Mejora Continua Estratégica</h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Mide la capacidad de aprendizaje organizacional y adaptación estratégica.
                        </p>
                    </div>
                </div>
            </section>

            {/* Companies with Kerzner Data */}
            <section>
                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">Organizaciones Evaluadas</h2>

                {loading ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500">Cargando organizaciones...</p>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                        <span className="material-icons text-6xl text-slate-300 dark:text-slate-700 mb-4">business</span>
                        <p className="text-slate-600 dark:text-slate-400 mb-2 font-bold">No hay organizaciones evaluadas</p>
                        <p className="text-xs text-slate-500">Ejecute el script de datos de prueba para generar evaluaciones.</p>
                        <code className="block mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                            npx ts-node scripts/generate-kerzner-test-data.ts
                        </code>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {companies.map((company) => (
                            <Link
                                key={company.id}
                                href={`/reports/company/${company.id}?instrument=kerzner-2024`}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-600 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                            <span className="material-icons text-indigo-600 dark:text-indigo-400 group-hover:text-white">business</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                {company.name}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {company.sector} • {company.size}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-sm font-bold">Ver Reporte</span>
                                        <span className="material-icons text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Documentation Link */}
            <section className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-1">Documentación del Instrumento</h3>
                        <p className="text-xs text-slate-500">
                            Consulte la documentación completa sobre el modelo PMMM de Kerzner y cómo interpretar los resultados.
                        </p>
                    </div>
                    <a
                        href="/docs/INSTRUMENTO_KERZNER.md"
                        target="_blank"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <span className="material-icons text-sm">description</span>
                        Ver Docs
                    </a>
                </div>
            </section>
        </div>
    );
}
