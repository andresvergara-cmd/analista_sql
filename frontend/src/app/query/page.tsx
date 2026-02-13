"use client";

import { useState } from 'react';

export default function QueryPage() {
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulating API call to NL-to-SQL engine
        setTimeout(() => {
            setResult({
                sql: "SELECT studentEmail, score FROM Diagnosis WHERE score > 4.0 ORDER BY createdAt DESC",
                data: [
                    { studentEmail: 'maria.gonzalez@empresa.com', score: 4.8 },
                    { studentEmail: 'carlos.rodriguez@pyme.co', score: 4.2 },
                ],
                explanation: "He encontrado las evaluaciones con un puntaje de madurez superior a 4.0, ordenadas por la fecha de creación más reciente."
            });
            setIsProcessing(false);
        }, 2000);
    };

    return (
        <div className="max-w-5xl mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Asistente de Consultas SQL</h1>
                <p className="text-slate-500">Consulta la base de datos de diagnósticos utilizando lenguaje natural. El agente traducirá tu pregunta a SQL automáticamente.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Haz una pregunta</h2>
                        <form onSubmit={handleQuery} className="space-y-4">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ej: ¿Cuáles son las empresas con mejor puntaje en digitalización el último mes?"
                                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                            <button
                                type="submit"
                                disabled={!query || isProcessing}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
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
                                "Listar estudiantes que completaron el test de Kroh et al.",
                                "Promedio de madurez por facultad",
                                "Top 5 empresas con menor desempeño en cultura"
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
                                    <code>{result.sql}</code>
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
                                                    <th key={key} className="px-4 py-2">{key.replace(/([A-Z])/g, ' $1')}</th>
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
