"use client";

import { useMemo } from "react";
import { KROH_DIMENSIONS } from "@/utils/kroh-logic";

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────
interface Answer {
    id: string;
    respondentName: string;
    respondentPosition?: string;
    responses: Record<string, number>;
    company?: { name: string };
}

interface Props {
    answers: Answer[];
}

// ──────────────────────────────────────────
// Statistical helpers
// ──────────────────────────────────────────
function mean(arr: number[]): number {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): number {
    const m = mean(arr);
    return mean(arr.map((x) => (x - m) ** 2));
}

/** Cronbach's Alpha: α = (k / k-1) * (1 - ΣSi² / St²) */
function cronbachAlpha(matrix: number[][]): number {
    if (matrix.length < 2 || matrix[0].length < 2) return 0;
    const k = matrix[0].length; // items
    const itemVariances = Array.from({ length: k }, (_, j) =>
        variance(matrix.map((row) => row[j]))
    );
    const totalScores = matrix.map((row) => row.reduce((a, b) => a + b, 0));
    const totalVariance = variance(totalScores);
    if (totalVariance === 0) return 0;
    const alpha = (k / (k - 1)) * (1 - itemVariances.reduce((a, b) => a + b, 0) / totalVariance);
    return Math.max(0, Math.min(1, alpha));
}

function alphaLabel(a: number): { label: string; color: string; bg: string } {
    if (a >= 0.9) return { label: "Excelente", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (a >= 0.8) return { label: "Bueno", color: "text-blue-600", bg: "bg-blue-50" };
    if (a >= 0.7) return { label: "Aceptable", color: "text-indigo-600", bg: "bg-indigo-50" };
    if (a >= 0.6) return { label: "Cuestionable", color: "text-amber-600", bg: "bg-amber-50" };
    if (a >= 0.5) return { label: "Pobre", color: "text-orange-600", bg: "bg-orange-50" };
    return { label: "Inaceptable", color: "text-rose-600", bg: "bg-rose-50" };
}

function scoreColor(v: number): string {
    if (v >= 4.5) return "bg-emerald-500";
    if (v >= 3.5) return "bg-blue-500";
    if (v >= 2.5) return "bg-indigo-400";
    if (v >= 1.5) return "bg-amber-400";
    return "bg-rose-400";
}

function maturityLabel(v: number): string {
    if (v >= 4.5) return "Líder Digital";
    if (v >= 3.5) return "Avanzado";
    if (v >= 2.5) return "En Transformación";
    if (v >= 1.5) return "En Desarrollo";
    return "Inicial";
}

// ──────────────────────────────────────────
// Sub-section card
// ──────────────────────────────────────────
function Section({ icon, title, subtitle, children }: { icon: string; title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 flex items-center gap-3">
                <span className="material-icons-outlined text-primary text-xl">{icon}</span>
                <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-sm">{title}</h3>
                    {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-8">{children}</div>
        </section>
    );
}

// ──────────────────────────────────────────
// Main component
// ──────────────────────────────────────────
export default function AdvancedAnalysis({ answers }: Props) {
    const n = answers.length;

    // ── 1. RECODIFICACIÓN ──────────────────────────────────────────────────────
    const recodification = useMemo(() => {
        return Object.entries(KROH_DIMENSIONS).map(([code, dim]) => {
            const rows = answers.map((a) => {
                const raw = dim.items.map((it) => a.responses[it] ?? 0);
                const recoded = dim.items.map((it) => {
                    const v = a.responses[it] ?? 0;
                    return dim.isInverse ? 6 - v : v;
                });
                return { raw, recoded };
            });
            return { code, dim, rows };
        });
    }, [answers]);

    // ── 2. CRONBACH ───────────────────────────────────────────────────────────
    const cronbachByDim = useMemo(() => {
        return Object.entries(KROH_DIMENSIONS).map(([code, dim]) => {
            const matrix = answers.map((a) =>
                dim.items.map((it) => {
                    const v = a.responses[it] ?? 3;
                    return dim.isInverse ? 6 - v : v;
                })
            );
            const alpha = cronbachAlpha(matrix);
            return { code, name: dim.name, alpha, items: dim.items.length, isInverse: !!dim.isInverse };
        });
    }, [answers]);

    const globalAlpha = useMemo(() => {
        const allItems = Object.values(KROH_DIMENSIONS).flatMap((d) => d.items);
        const matrix = answers.map((a) =>
            Object.entries(KROH_DIMENSIONS).flatMap(([, dim]) =>
                dim.items.map((it) => {
                    const v = a.responses[it] ?? 3;
                    return dim.isInverse ? 6 - v : v;
                })
            )
        );
        return cronbachAlpha(matrix);
    }, [answers]);

    // ── 3. PROMEDIOS POR DIMENSIÓN ────────────────────────────────────────────
    const dimensionAverages = useMemo(() => {
        return Object.entries(KROH_DIMENSIONS).map(([code, dim]) => {
            const itemMeans = dim.items.map((it) => {
                const vals = answers.map((a) => {
                    const v = a.responses[it] ?? 3;
                    return dim.isInverse ? 6 - v : v;
                });
                return { item: it, mean: mean(vals), std: Math.sqrt(variance(vals)) };
            });
            const dimMean = mean(itemMeans.map((x) => x.mean));
            return { code, name: dim.name, dimMean, itemMeans, isInverse: !!dim.isInverse, description: dim.description };
        });
    }, [answers]);

    const globalScore = useMemo(() => mean(dimensionAverages.map((d) => d.dimMean)), [dimensionAverages]);

    // ── 4. COMPARACIONES POR ROL ──────────────────────────────────────────────
    const roleComparisons = useMemo(() => {
        const groups: Record<string, Answer[]> = {};
        answers.forEach((a) => {
            const role = a.respondentPosition?.trim() || "Sin especificar";
            if (!groups[role]) groups[role] = [];
            groups[role].push(a);
        });
        return Object.entries(groups).map(([role, members]) => {
            const dimScores = Object.entries(KROH_DIMENSIONS).map(([code, dim]) => {
                const vals = members.map((a) => {
                    const scores = dim.items.map((it) => {
                        const v = a.responses[it] ?? 3;
                        return dim.isInverse ? 6 - v : v;
                    });
                    return mean(scores);
                });
                return { code, name: dim.name, mean: mean(vals) };
            });
            const overall = mean(dimScores.map((d) => d.mean));
            return { role, count: members.length, dimScores, overall };
        }).sort((a, b) => b.overall - a.overall);
    }, [answers]);

    // ── 5. INTERPRETACIÓN ESTRUCTURAL ─────────────────────────────────────────
    const structural = useMemo(() => {
        const sorted = [...dimensionAverages].sort((a, b) => b.dimMean - a.dimMean);
        const strengths = sorted.filter((d) => d.dimMean >= 3.5);
        const gaps = sorted.filter((d) => d.dimMean < 3.5);
        const stdDevs = dimensionAverages.map((d) => ({
            name: d.name, code: d.code,
            std: Math.sqrt(variance(d.itemMeans.map((i) => i.mean)))
        }));
        const highVariability = stdDevs.filter((d) => d.std > 0.8);
        return { sorted, strengths, gaps, stdDevs, highVariability };
    }, [dimensionAverages]);

    // ── 6. RECOMENDACIONES ────────────────────────────────────────────────────
    const recommendations = useMemo(() => {
        const recs: { priority: "Alta" | "Media" | "Baja"; horizon: string; action: string; dimension: string; icon: string }[] = [];
        dimensionAverages.forEach((d) => {
            if (d.dimMean < 2.5) {
                recs.push({ priority: "Alta", horizon: "Corto Plazo (0–3 meses)", dimension: d.name, icon: "emergency", action: `Implementar programa de fundamentos en ${d.name}. Score crítico (${d.dimMean.toFixed(2)}): se requieren acciones inmediatas para establecer capacidades básicas.` });
            } else if (d.dimMean < 3.5) {
                recs.push({ priority: "Media", horizon: "Mediano Plazo (3–12 meses)", dimension: d.name, icon: "trending_up", action: `Desarrollar plan de aceleración para ${d.name}. Score intermedio (${d.dimMean.toFixed(2)}): hay bases pero se necesita sistematizar prácticas.` });
            } else if (d.dimMean < 4.5) {
                recs.push({ priority: "Baja", horizon: "Largo Plazo (12+ meses)", dimension: d.name, icon: "star_outline", action: `Consolidar liderazgo en ${d.name}. Score avanzado (${d.dimMean.toFixed(2)}): optimizar y compartir mejores prácticas.` });
            }
        });
        if (structural.highVariability.length > 0) {
            recs.unshift({ priority: "Alta", horizon: "Inmediato", dimension: "Coherencia Interna", icon: "align_vertical_center", action: `Alta variabilidad detectada en: ${structural.highVariability.map((d) => d.name).join(", ")}. Revisar comprensión compartida del instrumento y homogeneizar criterios entre respondentes.` });
        }
        return recs;
    }, [dimensionAverages, structural]);

    // ── EMPTY STATE ────────────────────────────────────────────────────────────
    if (n === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <span className="material-icons-outlined text-6xl text-slate-200 mb-4">bar_chart</span>
                <h3 className="text-lg font-black text-slate-400">Sin datos para analizar</h3>
                <p className="text-slate-400 text-sm mt-1">Registre al menos una evaluación para generar el análisis avanzado.</p>
            </div>
        );
    }

    const aLabel = alphaLabel(globalAlpha);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* KPI HEADER */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Respondentes", value: n, icon: "group", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Score Global", value: globalScore.toFixed(2), icon: "analytics", color: "text-primary", bg: "bg-primary/5" },
                    { label: "Nivel", value: maturityLabel(globalScore), icon: "workspace_premium", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                    { label: "α Cronbach Global", value: globalAlpha.toFixed(3), icon: "verified", color: aLabel.color, bg: `${aLabel.bg} dark:bg-slate-800` },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color} shrink-0`}>
                            <span className="material-icons-outlined">{kpi.icon}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{kpi.label}</p>
                            <p className={`text-xl font-black ${kpi.color} truncate`}>{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── 1. RECODIFICACIÓN ─────────────────────────────────────────── */}
            <Section icon="swap_horiz" title="1. Recodificación de Ítems" subtitle="Verificación de la inversión de escala aplicada a la dimensión DIR (Overcoming Resistance)">
                <div className="space-y-6">
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex gap-3">
                        <span className="material-icons text-amber-500 shrink-0 mt-0.5">info</span>
                        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                            La dimensión <strong>DIR (Overcoming Resistance)</strong> utiliza escala invertida. Los ítems I34, I35, I36 e I38 se recodifican aplicando la fórmula: <strong>valor_recodificado = 6 − valor_original</strong>. Esto garantiza que un puntaje alto siempre indique mayor madurez.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[10px]">Dimensión</th>
                                    <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[10px]">Ítems</th>
                                    <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-slate-400 text-[10px]">Escala</th>
                                    <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-slate-400 text-[10px]">Fórmula</th>
                                    <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-slate-400 text-[10px]">Rango Original</th>
                                    <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-slate-400 text-[10px]">Rango Recodificado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Object.entries(KROH_DIMENSIONS).map(([code, dim]) => (
                                    <tr key={code} className={dim.isInverse ? "bg-amber-50/50 dark:bg-amber-500/5" : ""}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-primary">{code}</span>
                                                <span className="text-slate-600 dark:text-slate-300 font-medium">{dim.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-500">{dim.items.join(", ")}</td>
                                        <td className="px-4 py-3 text-center">
                                            {dim.isInverse
                                                ? <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Invertida</span>
                                                : <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Directa</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-300">
                                            {dim.isInverse ? "6 − X" : "X"}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500">1 – 5</td>
                                        <td className="px-4 py-3 text-center">
                                            {dim.isInverse
                                                ? <span className="font-black text-amber-600">1 – 5</span>
                                                : <span className="text-slate-500">1 – 5</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {n > 0 && (
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Ejemplo de recodificación — Primer respondente ({answers[0].respondentName || "N/A"})</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {["I34", "I35", "I36", "I38"].map((item) => {
                                    const raw = answers[0].responses[item] ?? "—";
                                    const rec = typeof raw === "number" ? 6 - raw : "—";
                                    return (
                                        <div key={item} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-200 dark:border-slate-700">
                                            <p className="font-black text-primary text-lg">{item}</p>
                                            <div className="flex items-center justify-center gap-2 mt-1">
                                                <span className="text-slate-400 text-sm">{raw}</span>
                                                <span className="material-icons text-amber-400 text-sm">arrow_forward</span>
                                                <span className="font-black text-amber-600 text-sm">{rec}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">orig → recodif.</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* ── 2. ALFA DE CRONBACH ───────────────────────────────────────── */}
            <Section icon="verified" title="2. Alfa de Cronbach — Confiabilidad del Instrumento" subtitle="Coeficiente de consistencia interna por dimensión y global">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">α Global (32 ítems)</p>
                            <p className={`text-5xl font-black ${aLabel.color}`}>{globalAlpha.toFixed(3)}</p>
                            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-black ${aLabel.bg} ${aLabel.color}`}>{aLabel.label}</span>
                            <p className="text-[10px] text-slate-400 mt-3 font-medium">α ≥ 0.70 es aceptable en investigación</p>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            {cronbachByDim.map((d) => {
                                const lbl = alphaLabel(d.alpha);
                                return (
                                    <div key={d.code} className="flex items-center gap-4">
                                        <span className="w-10 font-black text-primary text-xs shrink-0">{d.code}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{d.name}</span>
                                                <span className={`text-xs font-black ${lbl.color}`}>{d.alpha.toFixed(3)} — {lbl.label}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${d.alpha >= 0.7 ? "bg-emerald-400" : d.alpha >= 0.6 ? "bg-amber-400" : "bg-rose-400"}`}
                                                    style={{ width: `${Math.min(100, d.alpha * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 shrink-0">{d.items} ítems</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                        {[["≥ 0.90", "Excelente", "bg-emerald-500"], ["≥ 0.80", "Bueno", "bg-blue-500"], ["≥ 0.70", "Aceptable", "bg-indigo-400"], ["≥ 0.60", "Cuestionable", "bg-amber-400"], ["< 0.60", "Pobre / Inaceptable", "bg-rose-400"]].map(([val, lbl, color]) => (
                            <div key={val} className="flex flex-col items-center gap-1">
                                <div className={`w-4 h-4 rounded-full ${color}`} />
                                <span className="font-black text-slate-500">{val}</span>
                                <span className="text-slate-400">{lbl}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── 3. PROMEDIOS POR DIMENSIÓN ────────────────────────────────── */}
            <Section icon="bar_chart" title="3. Promedios por Dimensión" subtitle="Media y desviación estándar por ítem y dimensión (escala 1–5, puntaje recodificado)">
                <div className="space-y-6">
                    {dimensionAverages.map((d) => (
                        <div key={d.code} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60 dark:bg-slate-800/40">
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-primary">{d.code}</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{d.name}</span>
                                    {d.isInverse && <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 rounded-full font-black uppercase">Invertida</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Promedio Dim.</p>
                                        <p className="font-black text-slate-800 dark:text-white">{d.dimMean.toFixed(2)}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl ${scoreColor(d.dimMean)} flex items-center justify-center text-white font-black text-xs`}>
                                        {Math.round((d.dimMean / 5) * 100)}%
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                                    <div className={`h-full rounded-full ${scoreColor(d.dimMean)} transition-all duration-700`} style={{ width: `${(d.dimMean / 5) * 100}%` }} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {d.itemMeans.map((it) => (
                                        <div key={it.item} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 text-center">
                                            <p className="font-black text-primary text-xs">{it.item}</p>
                                            <p className="text-lg font-black text-slate-800 dark:text-white">{it.mean.toFixed(2)}</p>
                                            <p className="text-[10px] text-slate-400">σ = {it.std.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── 4. COMPARACIONES POR ROL ──────────────────────────────────── */}
            <Section icon="compare_arrows" title="4. Comparaciones por Cargo / Rol" subtitle="Análisis de brecha perceptual entre grupos de respondentes">
                {roleComparisons.length < 2 ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-500 text-sm">
                        <span className="material-icons-outlined text-slate-300">info</span>
                        Se necesitan respondentes de al menos 2 cargos distintos para generar comparaciones.
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="px-4 py-3 text-left font-black uppercase tracking-widest text-slate-400 text-[10px]">Cargo / Rol</th>
                                        <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-slate-400 text-[10px]">N</th>
                                        {Object.values(KROH_DIMENSIONS).map((d) => (
                                            <th key={d.name} className="px-3 py-3 text-center font-black uppercase tracking-widest text-slate-400 text-[10px] whitespace-nowrap">{d.name.split(" ")[1] || d.name.split(" ")[0]}</th>
                                        ))}
                                        <th className="px-4 py-3 text-center font-black uppercase tracking-widest text-slate-400 text-[10px]">Global</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {roleComparisons.map((rc) => (
                                        <tr key={rc.role} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{rc.role}</td>
                                            <td className="px-4 py-3 text-center text-slate-500">{rc.count}</td>
                                            {rc.dimScores.map((ds) => (
                                                <td key={ds.code} className="px-3 py-3 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded-lg font-black text-white text-[10px] ${scoreColor(ds.mean)}`}>
                                                        {ds.mean.toFixed(2)}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-black text-sm ${rc.overall >= 3.5 ? "text-emerald-600" : rc.overall >= 2.5 ? "text-amber-500" : "text-rose-500"}`}>
                                                    {rc.overall.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
                            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                                <span className="material-icons text-indigo-400 text-sm shrink-0 mt-0.5">lightbulb</span>
                                <span>Las diferencias significativas (&gt;0.5 puntos) entre cargos indican brechas perceptuales que pueden reflejar distintos niveles de acceso a información, responsabilidades o visión estratégica sobre la madurez digital de la organización.</span>
                            </p>
                        </div>
                    </div>
                )}
            </Section>

            {/* ── 5. INTERPRETACIÓN ESTRUCTURAL ────────────────────────────── */}
            <Section icon="account_tree" title="5. Interpretación Estructural" subtitle="Fortalezas, brechas y análisis de variabilidad interna del instrumento">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2 flex items-center gap-2">
                            <span className="material-icons text-sm">thumb_up</span> Dimensiones Fortaleza (≥ 3.5)
                        </p>
                        {structural.strengths.length === 0
                            ? <p className="text-sm text-slate-400">Ninguna dimensión supera 3.5 en promedio.</p>
                            : structural.strengths.map((d) => (
                                <div key={d.code} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-[10px] shrink-0">{d.code}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-emerald-800 dark:text-emerald-400 text-sm truncate">{d.name}</p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500/70">{d.description}</p>
                                    </div>
                                    <span className="font-black text-emerald-600 text-sm shrink-0">{d.dimMean.toFixed(2)}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 flex items-center gap-2">
                            <span className="material-icons text-sm">build</span> Dimensiones con Brecha (&lt; 3.5)
                        </p>
                        {structural.gaps.length === 0
                            ? <p className="text-sm text-slate-400">Todas las dimensiones están en niveles adecuados.</p>
                            : structural.gaps.map((d) => (
                                <div key={d.code} className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                                    <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white font-black text-[10px] shrink-0">{d.code}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-rose-800 dark:text-rose-400 text-sm truncate">{d.name}</p>
                                        <p className="text-[10px] text-rose-600 dark:text-rose-500/70">{d.description}</p>
                                    </div>
                                    <span className="font-black text-rose-600 text-sm shrink-0">{d.dimMean.toFixed(2)}</span>
                                </div>
                            ))
                        }
                    </div>
                    {structural.highVariability.length > 0 && (
                        <div className="md:col-span-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
                                <span className="material-icons text-sm">warning</span> Alta Variabilidad Interna (σ &gt; 0.8)
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {structural.highVariability.map((d) => (
                                    <div key={d.code} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                                        <span className="material-icons text-amber-500 text-sm">show_chart</span>
                                        <div>
                                            <p className="font-bold text-amber-800 dark:text-amber-400 text-xs">{d.name}</p>
                                            <p className="text-[10px] text-amber-600">σ = {d.std.toFixed(3)} — Opiniones divergentes</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* ── 6. RECOMENDACIONES ESTRATÉGICAS ──────────────────────────── */}
            <Section icon="rocket_launch" title="6. Recomendaciones Estratégicas" subtitle="Plan de acción priorizado basado en el perfil de madurez del conjunto de respondentes">
                <div className="space-y-4">
                    {recommendations.map((rec, i) => {
                        const pConfig = {
                            Alta: { dot: "bg-rose-500", badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/20", bg: "bg-rose-50/40 dark:bg-rose-500/5" },
                            Media: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/20", bg: "bg-amber-50/40 dark:bg-amber-500/5" },
                            Baja: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-500/20", bg: "bg-emerald-50/40 dark:bg-emerald-500/5" },
                        }[rec.priority];
                        return (
                            <div key={i} className={`flex gap-4 p-5 border ${pConfig.border} ${pConfig.bg} rounded-2xl`}>
                                <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
                                    <div className={`w-3 h-3 rounded-full ${pConfig.dot}`} />
                                    {i < recommendations.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="material-icons text-slate-400 text-sm">{rec.icon}</span>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${pConfig.badge}`}>Prioridad {rec.priority}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">{rec.horizon}</span>
                                        <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full">{rec.dimension}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{rec.action}</p>
                                </div>
                            </div>
                        );
                    })}
                    {recommendations.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <span className="material-icons-outlined text-5xl mb-3">celebration</span>
                            <p className="font-black text-lg">¡Organización en nivel Líder Digital!</p>
                            <p className="text-sm mt-1">Todas las dimensiones superan 4.5. Continuar optimizando y compartiendo mejores prácticas.</p>
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
}
