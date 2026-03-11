"use client";

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Company {
    id: string;
    name: string;
    sector?: string;
}

export default function QueryPage() {
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/organizations`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCompanies(data);
            }
        } catch (err) {
            console.error('Error al cargar empresas:', err);
        } finally {
            setLoadingCompanies(false);
        }
    };

    const filteredCompanies = companies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ nlQuery: query, companyId: selectedCompanyId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al procesar la consulta');
            setResult(data);
        } catch (error: any) {
            console.error(error);
            setResult({
                sql: '-- Error al procesar la consulta',
                data: [{ error: error.message || 'Error de conexión con el servidor' }],
                explanation: error.message || 'Hubo un error al conectar con el servidor.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Asistente de Consultas SQL</h1>
                <p className="text-slate-500">Consulta la base de datos de diagnósticos utilizando lenguaje natural. El agente traducirá tu pregunta a SQL automáticamente.</p>
            </header>

            {/* Company Selector */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="material-icons text-primary">business</span>
                    <div>
                        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Empresa seleccionada</h2>
                        <p className="text-[11px] text-slate-400">Las consultas SQL se ejecutarán sobre los datos de esta empresa.</p>
                    </div>
                </div>

                {loadingCompanies ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></span>
                        Cargando empresas...
                    </div>
                ) : companies.length === 0 ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2">
                        <span className="material-icons text-amber-500 text-[18px]">warning</span>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">No hay empresas registradas. Registra una empresa primero.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="relative">
                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar empresa por nombre..."
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {filteredCompanies.map((company) => (
                                <button
                                    key={company.id}
                                    onClick={() => setSelectedCompanyId(company.id)}
                                    className={`flex items-center gap-2 p-3 rounded-xl text-left text-sm transition-all border ${
                                        selectedCompanyId === company.id
                                            ? 'bg-primary/10 border-primary text-primary font-bold'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-primary/30 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <span className={`material-icons text-[18px] ${selectedCompanyId === company.id ? 'text-primary' : 'text-slate-300'}`}>
                                        {selectedCompanyId === company.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold">{company.name}</p>
                                        {company.sector && <p className="text-[10px] text-slate-400 truncate">{company.sector}</p>}
                                    </div>
                                </button>
                            ))}
                            {filteredCompanies.length === 0 && (
                                <p className="text-xs text-slate-400 col-span-full py-2">No se encontraron empresas con ese nombre.</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedCompany && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <span className="material-icons text-emerald-500 text-[16px]">check_circle</span>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            Consultando datos de: <strong>{selectedCompany.name}</strong>
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Haz una pregunta</h2>
                        <form onSubmit={handleQuery} className="space-y-4">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ej: ¿Cuál es el puntaje promedio en la dimensión de cultura digital?"
                                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                            {!selectedCompanyId && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <span className="material-icons text-xs">info</span>
                                    Selecciona una empresa arriba para habilitar las consultas.
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={!query || !selectedCompanyId || isProcessing}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-outlined text-lg">auto_awesome</span>
                                        Generar Consulta
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Ejemplos de consulta</h3>
                        <div className="space-y-2">
                            {[
                                "Dame un resumen general de la empresa",
                                "¿Cuántos diagnósticos se han completado?",
                                "¿Cuál es el puntaje promedio por dimensión?",
                                "¿Cuál es la dimensión con menor desempeño?",
                                "¿Cuál es la dimensión con mejor desempeño?",
                                "¿Cuál es el nivel de madurez?",
                                "Listar todos los diagnósticos con sus puntajes",
                                "¿Quiénes respondieron la evaluación?",
                                "Resultados por cargo",
                                "Comparar resultados por instrumento",
                                "¿Qué debe mejorar la empresa?",
                                "¿Cuál es la hoja de ruta de mejora?",
                            ].map((example) => (
                                <button
                                    key={example}
                                    onClick={() => setQuery(example)}
                                    className="w-full text-left text-[11px] text-slate-600 dark:text-slate-400 hover:text-primary transition-colors py-1 truncate"
                                >
                                    • {example}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-icons-outlined text-emerald-500">code</span>
                                        SQL Generado
                                    </h3>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono">POSTGRESQL</span>
                                </div>
                                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                                    <pre className="whitespace-pre-wrap">{result.sql}</pre>
                                </div>
                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 italic">
                                    <strong>Explicación:</strong> {result.explanation}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-icons-outlined text-primary">table_rows</span>
                                        Resultados de Datos
                                    </h3>
                                    <span className="text-[10px] text-slate-500">{result.data.length} registros encontrados</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                                                {Object.keys(result.data[0]).map((key) => (
                                                    <th key={key} className="px-4 py-2">{key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {result.data.map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                    {Object.values(row).map((val: any, j: number) => (
                                                        <td key={j} className="px-4 py-3">{val}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[400px] bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <span className="material-icons-outlined text-3xl text-slate-300">chat_bubble_outline</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-400 mb-2">Esperando tu consulta</h3>
                            <p className="text-sm text-slate-400 max-w-xs">Escribe una pregunta en lenguaje natural y el agente te ayudará a explorar los datos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
