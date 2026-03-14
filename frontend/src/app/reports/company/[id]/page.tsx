"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RadarChart } from '@/components/RadarChart';
import KrohAdvancedAnalysis from '@/components/KrohAdvancedAnalysis';
import KerznerAdvancedAnalysis from '@/components/KerznerAdvancedAnalysis';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Answer {
    id: string;
    respondentName: string;
    respondentEmail: string;
    respondentPosition: string;
    submittedAt: string;
    responses: Record<string, number>;
}

interface Dimension {
    id: string;
    name: string;
    score: number;
    average: number;
    description: string;
}

interface ReportData {
    company: {
        id: string;
        name: string;
        sector: string;
        size: string;
    };
    consolidated: {
        foundations?: Dimension[];  // Kroh instrument
        dimensions?: Dimension[];    // Kerzner instrument
        globalScore: number;
        globalPercentage?: number;
        maturityLevel?: string;      // Kerzner
        status: string;
    };
    roadmap: any[];
    perceptionByPosition: Record<string, any>;
    answers: Answer[];
    instrument?: string;
}

export default function CompanyReportPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const instrument = searchParams?.get('instrument') || 'kroh-2020';

    const [data, setData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'individual' | 'matrix' | 'descriptive' | 'advanced'>('descriptive');
    const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedResponses, setEditedResponses] = useState<Record<string, number>>({});
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [surveyLinks, setSurveyLinks] = useState<any[]>([]);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [linkExpiresInDays, setLinkExpiresInDays] = useState<number>(30);
    const [linkMaxResponses, setLinkMaxResponses] = useState<number>(0);
    const [generatedLinkUrl, setGeneratedLinkUrl] = useState<string | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const reportRef = useRef<HTMLDivElement>(null);
    const isKerzner = instrument === 'kerzner-2024';
    const instrumentTitle = isKerzner ? 'Madurez en Gestión de Proyectos (Kerzner)' : 'Madurez Digital (Kroh)';
    const dimensionsOrFoundations = data?.consolidated?.dimensions || data?.consolidated?.foundations || [];

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch(`${API_URL}/api/organizations/${id}/report?instrument=${instrument}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching company report:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    const fetchSurveyLinks = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/survey-links/company/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const links = await res.json();
                setSurveyLinks(links);
            }
        } catch (error) {
            console.error('Error fetching survey links:', error);
        }
    };

    const generateSurveyLink = async () => {
        setIsGeneratingLink(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/survey-links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    companyId: id,
                    assessmentId: instrument,
                    expiresInDays: linkExpiresInDays || null,
                    maxResponses: linkMaxResponses || null,
                })
            });
            if (res.ok) {
                const data = await res.json();
                const fullUrl = `${window.location.origin}/survey/${data.link.token}`;
                setGeneratedLinkUrl(fullUrl);
                fetchSurveyLinks();
            }
        } catch (error) {
            console.error('Error generating survey link:', error);
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const deactivateSurveyLink = async (linkId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${API_URL}/api/survey-links/${linkId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchSurveyLinks();
        } catch (error) {
            console.error('Error deactivating link:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleViewAnswer = (answer: Answer) => {
        setSelectedAnswer(answer);
        setEditedResponses(answer.responses);
        setIsEditMode(false);
        setIsViewModalOpen(true);
    };

    const handleEditAnswer = () => {
        setIsEditMode(true);
    };

    const handleSaveAnswer = async () => {
        if (!selectedAnswer) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/answers/${selectedAnswer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    responses: editedResponses
                })
            });

            if (res.ok) {
                // Refresh the report data
                const reportRes = await fetch(`${API_URL}/api/organizations/${id}/report?instrument=${instrument}`);
                const result = await reportRes.json();
                setData(result);
                setIsViewModalOpen(false);
                setIsEditMode(false);
            }
        } catch (error) {
            console.error('Error updating answer:', error);
        }
    };

    const handleDeleteAnswer = async (answerId: string) => {
        if (!confirm('¿Está seguro de eliminar esta respuesta? Esta acción no se puede deshacer.')) return;

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/answers/${answerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Refresh the report data
                const reportRes = await fetch(`${API_URL}/api/organizations/${id}/report?instrument=${instrument}`);
                const result = await reportRes.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error deleting answer:', error);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current || !data) return;

        setIsGeneratingPDF(true);

        try {
            const element = reportRef.current;

            // Wait a bit to ensure all charts are fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));

            // Use html2canvas to capture the content
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: true, // Enable logging to see what's happening
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                onclone: (clonedDoc) => {
                    // Ensure canvas elements are visible in the clone
                    const clonedElement = clonedDoc.querySelector('[data-pdf-content]') || clonedDoc.body;
                    const canvases = clonedElement.querySelectorAll('canvas');
                    canvases.forEach((canvas: any) => {
                        canvas.style.display = 'block';
                    });
                }
            });

            console.log('Canvas captured:', canvas.width, 'x', canvas.height);

            const imgData = canvas.toDataURL('image/png');

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if content is longer than one page
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Generate filename
            const filename = `Reporte_${data.company.name.replace(/\s+/g, '_')}_${instrumentTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Download the PDF
            pdf.save(filename);

            console.log('PDF generated successfully');

        } catch (error: any) {
            console.error('Error generating PDF:', error);
            console.error('Error details:', error.message, error.stack);
            alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}. Revise la consola para más detalles.`);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Consolidando datos organizacionales...</p>
                </div>
            </div>
        );
    }

    if (!data || !data.consolidated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">No hay suficientes datos</h1>
                    <p className="text-slate-500 mb-4">Esta empresa aún no tiene encuestas procesadas.</p>
                    <Link href="/reports" className="text-primary font-bold hover:underline">Volver a Reportes</Link>
                </div>
            </div>
        );
    }

    return (
        <div ref={reportRef} className="max-w-7xl mx-auto py-8 px-4">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <span className="material-icons text-3xl">business</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{data.company.name}</h1>
                        <p className="text-slate-500 text-sm">Informe Consolidado de {instrumentTitle} • {data.answers.length} encuestados</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/reports" className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                        Volver
                    </Link>
                    <button
                        onClick={() => { setShowLinkModal(true); fetchSurveyLinks(); }}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                        <span className="material-icons text-sm">link</span>
                        Generar Enlace
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                        className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGeneratingPDF ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generando...
                            </>
                        ) : (
                            <>
                                <span className="material-icons text-sm">download</span>
                                Descargar PDF
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('individual')}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'individual' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    1. Respuestas Individuales
                </button>
                <button
                    onClick={() => setActiveTab('matrix')}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'matrix' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    2. Matriz de Capítulos (Promedios)
                </button>
                <button
                    onClick={() => setActiveTab('descriptive')}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'descriptive' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    3. Análisis Descriptivo (Entregable)
                </button>
                <button
                    onClick={() => setActiveTab('advanced')}
                    className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'advanced' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    4. Análisis Avanzado
                </button>
            </div>

            {/* Tab Content: Individual */}
            {activeTab === 'individual' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white">Encuestas Recibidas</h3>
                        <p className="text-xs text-slate-500 mt-1">Detalle de cada persona que respondió el instrumento.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4">Encuestado</th>
                                    <th className="px-6 py-4">Cargo/Posición</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Respuestas</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data.answers.map((ans) => (
                                    <tr key={ans.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 dark:text-white text-sm">{ans.respondentName}</div>
                                            <div className="text-[10px] text-slate-400">{ans.respondentEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{ans.respondentPosition || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {new Date(ans.submittedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 overflow-hidden max-w-[200px]">
                                                {Object.values(ans.responses).slice(0, 10).map((v, i) => (
                                                    <span key={i} className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-slate-800 text-[8px] flex items-center justify-center font-bold">{v}</span>
                                                ))}
                                                <span className="text-[8px] text-slate-400">...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewAnswer(ans)}
                                                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <span className="material-icons text-sm">visibility</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAnswer(ans.id)}
                                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-icons text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab Content: Matrix */}
            {activeTab === 'matrix' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Matriz de Desempeño por {isKerzner ? 'Dimensiones' : 'Capítulos'}</h3>
                            <p className="text-sm text-slate-500 mt-1">Cálculo promediado basado en los {data.answers.length} encuestados.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Puntaje Global Promedio</span>
                            <span className="text-4xl font-black text-primary tracking-tighter">{data.consolidated.globalScore.toFixed(2)}</span>
                            {isKerzner && data.consolidated.maturityLevel && (
                                <p className="text-xs text-slate-500 mt-1">{data.consolidated.maturityLevel}</p>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-4">{isKerzner ? 'Dimensión' : 'Capítulo (Micro-fundación)'}</th>
                                    <th className="px-8 py-4">Puntaje Promedio ({isKerzner ? '1-7' : '1-5'})</th>
                                    <th className="px-8 py-4">Nivel de Madurez (%)</th>
                                    <th className="px-8 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {dimensionsOrFoundations.map((f) => (
                                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-800 dark:text-white">{f.name}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{f.description}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-lg font-black text-slate-700 dark:text-slate-200">{f.average}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden min-w-[100px]">
                                                    <div
                                                        className="bg-primary h-full rounded-full"
                                                        style={{ width: `${f.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-bold text-xs">{f.score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${f.score > 70 ? 'bg-emerald-100 text-emerald-700' : f.score > 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                {f.score > 70 ? 'Sólido' : f.score > 40 ? 'En Proceso' : 'Crítico'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab Content: Descriptive */}
            {activeTab === 'descriptive' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* 1. Perfil Multidimensional */}
                        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">analytics</span>
                                1. Perfil Multidimensional Organizacional
                            </h3>
                            <div className="flex flex-col lg:flex-row items-center gap-12">
                                <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/30 p-8 rounded-3xl">
                                    <RadarChart
                                        data={dimensionsOrFoundations.map(f => ({
                                            label: f.id, // Use abbreviations for cleaner look
                                            value: f.average
                                        }))}
                                        maxValue={isKerzner ? 7 : 5}
                                        size={350}
                                    />
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fortaleza Principal</h4>
                                        {(() => {
                                            const best = [...dimensionsOrFoundations].sort((a, b) => b.average - a.average)[0];
                                            return (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-emerald-500">check_circle</span>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{best.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">La empresa destaca en esta área con un puntaje de {best.average.toFixed(2)}. Se recomienda apalancar esta capacidad para los proyectos estratégicos.</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className="p-6 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                                        <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-4">Debilidad Crítica</h4>
                                        {(() => {
                                            const worst = [...dimensionsOrFoundations].sort((a, b) => a.average - b.average)[0];
                                            return (
                                                <div className="flex items-start gap-3">
                                                    <span className="material-icons text-rose-500">report_problem</span>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{worst.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">Esta área presenta el mayor riesgo para la transformación con un puntaje de {worst.average.toFixed(2)}. Requiere intervención inmediata.</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Identificación de Brechas (Gaps) */}
                        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">difference</span>
                                2. Identificación de Brechas de Percepción (Gaps)
                            </h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium">Análisis de consistencia entre diferentes niveles jerárquicos o roles.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(data.perceptionByPosition).map(([pos, result]: [string, any]) => (
                                    <div key={pos} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{pos}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-sm">{result.count} encuestas</span>
                                        </div>
                                        <div className="text-3xl font-black text-slate-800 dark:text-white mb-1">
                                            {result.maturity.globalScore}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{result.maturity.status}</p>

                                        <div className="space-y-2">
                                            {(result.maturity.dimensions || result.maturity.foundations || []).slice(0, 3).map((f: any) => (
                                                <div key={f.id} className="flex justify-between items-center text-[10px]">
                                                    <span className="font-medium text-slate-500">{f.name}</span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{f.average.toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div className="text-[9px] text-primary font-bold text-center mt-2 cursor-pointer hover:underline">Ver detalle completo del rol</div>
                                        </div>
                                    </div>
                                ))}

                                {Object.keys(data.perceptionByPosition).length > 1 && (
                                    <div className="lg:col-span-3 p-6 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl">
                                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                            <span className="material-icons text-xs align-middle mr-1">info</span>
                                            <strong>Análisis de Brecha:</strong> Existe una diferencia de {
                                                (() => {
                                                    const scores = Object.values(data.perceptionByPosition).map((r: any) => r.maturity.globalScore);
                                                    return (Math.max(...scores) - Math.min(...scores)).toFixed(1);
                                                })()
                                            } puntos entre el rol más optimista y el más crítico. Esto sugiere la necesidad de alinear la visión estratégica a través de la organización.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Hoja de Ruta y 4. Benchmarking */}
                        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                                <span className="material-icons-outlined text-primary">timeline</span>
                                3. Hoja de Ruta de Intervención Priorizada
                            </h3>
                            <div className="space-y-6">
                                {data.roadmap.slice(0, 4).map((item, i) => (
                                    <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{item.description}</p>
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-md uppercase tracking-widest">{item.horizon}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-primary text-white border border-primary rounded-3xl p-8 shadow-xl shadow-primary/20 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                                    <span className="material-icons">flag</span>
                                    4. Benchmarking (Línea Base)
                                </h3>
                                <p className="text-primary-foreground/70 text-sm font-medium mb-8">Estado actual de la madurez digital para futuras comparaciones.</p>

                                <div className="space-y-6">
                                    <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Línea Base Global</p>
                                        <div className="text-4xl font-black">{data.consolidated.globalScore}</div>
                                        <p className="text-xs font-bold mt-2 opacity-90">{data.consolidated.status}</p>
                                    </div>
                                    <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Posición en el Mercado (Sector)</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
                                                <div className="bg-white h-full w-[65%]"></div>
                                            </div>
                                            <span className="text-xs font-bold font-mono">Top 35%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-8 w-full bg-white text-primary py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                                Emitir Certificado Línea Base
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Content: Advanced Analytics */}
            {activeTab === 'advanced' && (
                isKerzner ? (
                    <KerznerAdvancedAnalysis data={data} />
                ) : (
                    <KrohAdvancedAnalysis data={data} />
                )
            )}

            {/* View/Edit Answer Modal */}
            {isViewModalOpen && selectedAnswer && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                    {isEditMode ? 'Editar Respuesta' : 'Detalle de Respuesta'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedAnswer.respondentName} • {selectedAnswer.respondentPosition}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setIsEditMode(false);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-4">
                                {Object.entries(editedResponses).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <span className="text-xs font-black text-primary">{key}</span>
                                            </div>
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                Pregunta {key}
                                            </span>
                                        </div>
                                        {isEditMode ? (
                                            <input
                                                type="number"
                                                min={1}
                                                max={isKerzner ? 7 : 5}
                                                value={value}
                                                onChange={(e) => setEditedResponses({
                                                    ...editedResponses,
                                                    [key]: parseInt(e.target.value) || 1
                                                })}
                                                className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold text-slate-800 dark:text-white"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black">
                                                {value}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                            {isEditMode ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setEditedResponses(selectedAnswer.responses);
                                        }}
                                        className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveAnswer}
                                        className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Guardar Cambios
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsViewModalOpen(false)}
                                        className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={handleEditAnswer}
                                        className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Editar Respuesta
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Survey Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLinkModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-emerald-600">link</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white">Enlaces de Encuesta</h3>
                                        <p className="text-xs text-slate-500">Comparte un enlace para que respondan de forma asíncrona</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Generate new link */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Generar nuevo enlace</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Expiración (días)</label>
                                        <input
                                            type="number"
                                            value={linkExpiresInDays}
                                            onChange={e => setLinkExpiresInDays(parseInt(e.target.value) || 0)}
                                            placeholder="30"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                        <p className="text-[9px] text-slate-400 mt-1">0 = sin expiración</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Máx. Respuestas</label>
                                        <input
                                            type="number"
                                            value={linkMaxResponses}
                                            onChange={e => setLinkMaxResponses(parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                        <p className="text-[9px] text-slate-400 mt-1">0 = sin límite</p>
                                    </div>
                                </div>
                                <button
                                    onClick={generateSurveyLink}
                                    disabled={isGeneratingLink}
                                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isGeneratingLink ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons text-sm">add_link</span>
                                            Generar Enlace para {isKerzner ? 'Kerzner' : 'Kroh'}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Generated link display */}
                            {generatedLinkUrl && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="material-icons text-emerald-600 text-sm">check_circle</span>
                                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Enlace generado exitosamente</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={generatedLinkUrl}
                                            className="flex-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(generatedLinkUrl)}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-icons text-sm">{copiedLink ? 'done' : 'content_copy'}</span>
                                            {copiedLink ? 'Copiado' : 'Copiar'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Existing links */}
                            {surveyLinks.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Enlaces existentes</h4>
                                    <div className="space-y-2">
                                        {surveyLinks.map((link: any) => (
                                            <div key={link.id} className={`flex items-center justify-between p-3 rounded-xl border ${link.isActive ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60'}`}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-block w-2 h-2 rounded-full ${link.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                                                            {link.assessmentId === 'kerzner-2024' ? 'Kerzner' : 'Kroh'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(link.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-slate-400">
                                                            {link.responseCount || 0} respuestas
                                                        </span>
                                                        {link.expiresAt && (
                                                            <span className="text-[10px] text-slate-400">
                                                                Expira: {new Date(link.expiresAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {link.maxResponses && (
                                                            <span className="text-[10px] text-slate-400">
                                                                Máx: {link.maxResponses}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {link.isActive && (
                                                        <>
                                                            <button
                                                                onClick={() => copyToClipboard(`${window.location.origin}/survey/${link.token}`)}
                                                                className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                                                title="Copiar enlace"
                                                            >
                                                                <span className="material-icons text-sm">content_copy</span>
                                                            </button>
                                                            <button
                                                                onClick={() => deactivateSurveyLink(link.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Desactivar enlace"
                                                            >
                                                                <span className="material-icons text-sm">link_off</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
