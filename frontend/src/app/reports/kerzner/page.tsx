"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Company {
    id: string;
    name: string;
    sector?: string;
    size?: string;
    answersCount?: number;
}

export default function KerznerReportsPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompaniesWithKerznerData();
    }, []);

    async function fetchCompaniesWithKerznerData() {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                console.error('No auth token found');
                setLoading(false);
                return;
            }

            // Decode token to get user info
            let payload = null;
            try {
                payload = JSON.parse(atob(token.split('.')[1]));
            } catch (e) {
                console.error('Error decoding token:', e);
            }

            const userRole = payload?.role;
            const userId = payload?.userId;

            console.log('User role:', userRole, 'User ID:', userId);

            // Fetch all organizations
            const res = await fetch(`${API_URL}/api/organizations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            const orgs = Array.isArray(data) ? data : (data.organizations || []);

            console.log('Total orgs fetched:', orgs.length);

            // Filter companies with kerzner-2024 answers
            let companiesWithKerzner = orgs.filter((org: any) => {
                const kerznerAnswers = org.answers?.filter((a: any) => a.assessmentId === 'kerzner-2024') || [];
                return kerznerAnswers.length > 0;
            }).map((org: any) => ({
                ...org,
                answersCount: org.answers?.filter((a: any) => a.assessmentId === 'kerzner-2024').length || 0
            }));

            console.log('Companies with Kerzner data:', companiesWithKerzner.length);

            // If not SUPERADMIN, filter by user's company access with canViewReports permission
            if (userRole !== 'SUPERADMIN') {
                console.log('User is not SUPERADMIN, checking company access permissions');

                if (userId) {
                    const accessRes = await fetch(`${API_URL}/api/users/${userId}/companies`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (accessRes.ok) {
                        const accessList = await accessRes.json();
                        console.log('User has access to companies:', accessList);

                        const allowedCompanyIds = accessList
                            .filter((access: any) => access.canViewReports)
                            .map((access: any) => access.companyId);

                        console.log('Allowed company IDs with canViewReports:', allowedCompanyIds);

                        companiesWithKerzner = companiesWithKerzner.filter((company: Company) =>
                            allowedCompanyIds.includes(company.id)
                        );

                        console.log('Filtered companies:', companiesWithKerzner.length);
                    }
                }
            } else {
                console.log('User is SUPERADMIN, showing all companies');
            }

            setCompanies(companiesWithKerzner);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 border border-purple-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="material-icons text-white text-2xl">account_tree</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Reportes de Madurez PM
                                </h1>
                                <p className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                                    Modelo Kerzner PMMM
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-3xl">
                            Reportes consolidados de madurez en gestión de proyectos. Evalúa la evolución organizacional
                            en PM a través de 4 dimensiones clave del modelo de Harold Kerzner.
                        </p>
                    </div>
                    <Link
                        href="/reports"
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors flex items-center gap-1"
                    >
                        <span className="material-icons text-sm">arrow_back</span>
                        Volver
                    </Link>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Dimensiones</p>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">4</p>
                        <p className="text-xs text-slate-500 mt-1">Índices Kerzner</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Preguntas</p>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">20</p>
                        <p className="text-xs text-slate-500 mt-1">Ítems de evaluación</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Escala</p>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">1-7</p>
                        <p className="text-xs text-slate-500 mt-1">Escala Likert</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Organizaciones</p>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{companies.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Con evaluaciones</p>
                    </div>
                </div>
            </header>

            {/* Companies with Kerzner Data */}
            <section>
                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">Organizaciones Evaluadas</h2>

                {loading ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500">Cargando organizaciones...</p>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                        <span className="material-icons text-6xl text-slate-300 dark:text-slate-700 mb-4">business</span>
                        <p className="text-slate-600 dark:text-slate-400 mb-2 font-bold">No hay organizaciones evaluadas</p>
                        <p className="text-xs text-slate-500">Ejecute el script de datos de prueba para generar evaluaciones.</p>
                        <code className="block mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                            npx ts-node scripts/generate-test-data.ts
                        </code>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {companies.map((company) => (
                            <Link
                                key={company.id}
                                href={`/reports/company/${company.id}?instrument=kerzner-2024`}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-purple-600 hover:shadow-xl hover:shadow-purple-500/10 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-600 transition-all">
                                            <span className="material-icons text-purple-600 dark:text-purple-400 group-hover:text-white">business</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">
                                                {company.name}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-xs text-slate-500">
                                                    <span className="material-icons text-xs align-middle mr-1">apartment</span>
                                                    {company.sector || 'Sin sector'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    <span className="material-icons text-xs align-middle mr-1">group</span>
                                                    {company.size || 'Sin tamaño'}
                                                </p>
                                                <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                                    <span className="material-icons text-xs align-middle mr-1">description</span>
                                                    {company.answersCount} encuestas
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-sm font-bold">Ver Reporte Consolidado</span>
                                        <span className="material-icons text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
