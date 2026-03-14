"use client";

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Company {
    id: string;
    name: string;
    sector?: string;
}

interface QueryMetadata {
    provider?: string;
    cached?: boolean;
    rowCount?: number;
    executionTime?: number;
    complexity?: 'low' | 'medium' | 'high';
    agentTimings?: {
        userProxy: number;
        aiEngineer: number;
        solutionArchitect: number;
        qaEngineer: number;
        fullstackDev: number;
        total: number;
    };
    validation?: {
        securityLevel?: string;
        warnings?: string[];
    };
}

interface QueryResult {
    sql: string;
    data: any[];
    explanation: string;
    chartType?: string;
    visualization?: any;
    metadata?: QueryMetadata;
}

export default function QueryPage() {
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<QueryResult | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCapabilities, setShowCapabilities] = useState(false);
    const [showAgentInfo, setShowAgentInfo] = useState(false);

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

    const getComplexityColor = (complexity?: string) => {
        switch (complexity) {
            case 'low': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const getSecurityColor = (level?: string) => {
        switch (level) {
            case 'safe': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            case 'dangerous': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const queryCategories = [
        {
            icon: 'tag',
            title: 'Consultas de Conteo',
            examples: [
                '¿Cuántos diagnósticos se han completado?',
                '¿Cuántos usuarios respondieron?',
                'Total de reportes generados'
            ]
        },
        {
            icon: 'functions',
            title: 'Agregaciones y Promedios',
            examples: [
                '¿Cuál es el puntaje promedio por dimensión?',
                'Promedio general de madurez',
                'Suma total de puntajes'
            ]
        },
        {
            icon: 'insights',
            title: 'Análisis por Dimensión',
            examples: [
                '¿Cuál es la dimensión con menor desempeño?',
                '¿Cuál es la dimensión con mejor desempeño?',
                'Comparar dimensiones de la empresa'
            ]
        },
        {
            icon: 'compare',
            title: 'Comparaciones y Rankings',
            examples: [
                'Resultados por cargo',
                'Comparar resultados por instrumento',
                'Ranking de dimensiones'
            ]
        },
        {
            icon: 'summarize',
            title: 'Resúmenes y Reportes',
            examples: [
                'Dame un resumen general de la empresa',
                '¿Qué debe mejorar la empresa?',
                '¿Cuál es la hoja de ruta de mejora?'
            ]
        },
        {
            icon: 'list_alt',
            title: 'Listados Detallados',
            examples: [
                'Listar todos los diagnósticos con sus puntajes',
                '¿Quiénes respondieron la evaluación?',
                'Listado de respuestas por nivel organizacional'
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <header className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                            Asistente de Consultas SQL con IA
                        </h1>
                        <p className="text-slate-500">
                            Consulta la base de datos utilizando lenguaje natural. Nuestro sistema multi-agente traducirá tu pregunta a SQL de forma segura y eficiente.
                        </p>
                    </div>
                </div>

                {/* Multi-Agent System Info Banner */}
                <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border border-primary/20 dark:border-primary/30 rounded-2xl p-5 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                <span className="material-icons text-primary text-2xl">psychology</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-slate-800 dark:text-white">Sistema Multi-Agente IA Activado</h3>
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase">
                                    Operacional
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                                Tu consulta será procesada por <strong>6 agentes especializados</strong> trabajando en conjunto para garantizar precisión, seguridad y optimización.
                            </p>
                            <button
                                onClick={() => setShowAgentInfo(!showAgentInfo)}
                                className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors"
                            >
                                {showAgentInfo ? 'Ocultar' : 'Ver'} detalles del pipeline de agentes
                                <span className="material-icons text-sm">{showAgentInfo ? 'expand_less' : 'expand_more'}</span>
                            </button>
                        </div>
                    </div>

                    {showAgentInfo && (
                        <div className="mt-4 pt-4 border-t border-primary/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { name: 'User Proxy', icon: 'person_outline', desc: 'Interpreta tu intención', color: 'blue' },
                                { name: 'AI Engineer', icon: 'code', desc: 'Genera SQL optimizado', color: 'purple' },
                                { name: 'Solution Architect', icon: 'architecture', desc: 'Planea la ejecución', color: 'indigo' },
                                { name: 'QA Engineer', icon: 'security', desc: 'Valida seguridad SQL', color: 'emerald' },
                                { name: 'Fullstack Dev', icon: 'storage', desc: 'Ejecuta y visualiza', color: 'cyan' },
                                { name: 'Groq LLM', icon: 'auto_awesome', desc: 'Motor Llama 3.3 70B', color: 'amber' }
                            ].map((agent, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                                    <span className={`material-icons-outlined text-${agent.color}-500 text-sm`}>{agent.icon}</span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{agent.name}</p>
                                        <p className="text-[9px] text-slate-500 truncate">{agent.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                {/* Left Sidebar - Query Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-icons text-lg">edit_note</span>
                            Haz una pregunta
                        </h2>
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
                                        Procesando con IA...
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

                    {/* Capabilities Section */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button
                            onClick={() => setShowCapabilities(!showCapabilities)}
                            className="w-full flex items-center justify-between mb-3 group"
                        >
                            <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className="material-icons text-sm">help_outline</span>
                                ¿Qué puedo preguntar?
                            </h3>
                            <span className="material-icons text-slate-400 group-hover:text-primary transition-colors">
                                {showCapabilities ? 'expand_less' : 'expand_more'}
                            </span>
                        </button>

                        {showCapabilities ? (
                            <div className="space-y-4">
                                {queryCategories.map((category, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-primary">
                                            <span className="material-icons-outlined text-sm">{category.icon}</span>
                                            {category.title}
                                        </div>
                                        <div className="space-y-1">
                                            {category.examples.map((example, exIdx) => (
                                                <button
                                                    key={exIdx}
                                                    onClick={() => setQuery(example)}
                                                    className="w-full text-left text-[10px] text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/5 transition-all py-1.5 px-2 rounded truncate"
                                                >
                                                    • {example}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Click para ver ejemplos organizados por categoría</p>
                        )}
                    </div>

                    {/* Security Info */}
                    <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-900/10 dark:to-cyan-900/10 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-start gap-2 mb-2">
                            <span className="material-icons text-emerald-600 dark:text-emerald-400 text-sm">shield_check</span>
                            <h4 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Seguridad Garantizada</h4>
                        </div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            Todas las consultas son validadas por nuestro agente QA para prevenir inyección SQL y garantizar solo operaciones SELECT seguras.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Results */}
                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            {/* Agent Metadata Panel */}
                            {result.metadata && (
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                        <span className="material-icons text-sm">analytics</span>
                                        Metadata de Ejecución
                                    </h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        {result.metadata.provider && (
                                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <p className="text-[9px] text-slate-500 uppercase mb-1">Proveedor LLM</p>
                                                <p className="text-xs font-bold text-primary">{result.metadata.provider.toUpperCase()}</p>
                                            </div>
                                        )}

                                        {result.metadata.cached !== undefined && (
                                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <p className="text-[9px] text-slate-500 uppercase mb-1">Caché</p>
                                                <p className={`text-xs font-bold ${result.metadata.cached ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                    {result.metadata.cached ? 'Activo' : 'No usado'}
                                                </p>
                                            </div>
                                        )}

                                        {result.metadata.complexity && (
                                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <p className="text-[9px] text-slate-500 uppercase mb-1">Complejidad</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getComplexityColor(result.metadata.complexity)}`}>
                                                    {result.metadata.complexity.toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        {result.metadata.validation?.securityLevel && (
                                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <p className="text-[9px] text-slate-500 uppercase mb-1">Seguridad</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getSecurityColor(result.metadata.validation.securityLevel)}`}>
                                                    {result.metadata.validation.securityLevel.toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Agent Timings */}
                                    {result.metadata.agentTimings && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Tiempos de Agentes (Total: {result.metadata.agentTimings.total}ms)
                                            </p>
                                            {[
                                                { name: 'User Proxy', time: result.metadata.agentTimings.userProxy, color: 'blue' },
                                                { name: 'AI Engineer', time: result.metadata.agentTimings.aiEngineer, color: 'purple' },
                                                { name: 'Solution Architect', time: result.metadata.agentTimings.solutionArchitect, color: 'indigo' },
                                                { name: 'QA Engineer', time: result.metadata.agentTimings.qaEngineer, color: 'emerald' },
                                                { name: 'Fullstack Dev', time: result.metadata.agentTimings.fullstackDev, color: 'cyan' }
                                            ].map((agent, idx) => {
                                                const percentage = (agent.time / result.metadata!.agentTimings!.total) * 100;
                                                return (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-[9px] text-slate-500 w-28 truncate">{agent.name}</span>
                                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full bg-${agent.color}-500 transition-all duration-500`}
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[9px] text-slate-600 dark:text-slate-400 w-12 text-right">{agent.time}ms</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {result.metadata.validation?.warnings && result.metadata.validation.warnings.length > 0 && (
                                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-1">Advertencias:</p>
                                            {result.metadata.validation.warnings.map((warning, idx) => (
                                                <p key={idx} className="text-[9px] text-amber-600 dark:text-amber-400">• {warning}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* SQL Generated */}
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

                            {/* Data Results */}
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
                            <p className="text-sm text-slate-400 max-w-xs">
                                Escribe una pregunta en lenguaje natural y el sistema multi-agente te ayudará a explorar los datos de forma segura y eficiente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
