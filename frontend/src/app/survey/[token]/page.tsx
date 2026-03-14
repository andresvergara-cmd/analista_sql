"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { KROH_MICROFOUNDATIONS } from '@/constants/kroh-items';
import { KERZNER_DIMENSIONS } from '@/constants/kerzner-items';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SurveyInfo {
    companyName: string;
    companyId: string;
    assessmentId: string;
    isValid: boolean;
}

type Step = 'LOADING' | 'ERROR' | 'RESPONDENT_DETAILS' | 'ASSESSMENT' | 'SUCCESS';

export default function PublicSurveyPage() {
    const params = useParams();
    const token = params.token as string;

    const [step, setStep] = useState<Step>('LOADING');
    const [error, setError] = useState('');
    const [surveyInfo, setSurveyInfo] = useState<SurveyInfo | null>(null);

    const [respondentName, setRespondentName] = useState('');
    const [respondentPosition, setRespondentPosition] = useState('');
    const [respondentEmail, setRespondentEmail] = useState('');

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await fetch(`${API_URL}/api/public/survey/${token}`);
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Enlace no válido');
                setStep('ERROR');
                return;
            }
            const data = await res.json();
            setSurveyInfo(data);
            setStep('RESPONDENT_DETAILS');
        } catch {
            setError('No se pudo conectar con el servidor');
            setStep('ERROR');
        }
    };

    const sections = surveyInfo?.assessmentId === 'kerzner-2024' ? KERZNER_DIMENSIONS : KROH_MICROFOUNDATIONS;
    const currentSection = sections[currentSectionIndex];
    const isKerzner = surveyInfo?.assessmentId === 'kerzner-2024';
    const scaleMax = isKerzner ? 7 : 5;
    const scaleLabels = isKerzner
        ? { 1: 'Totalmente en desacuerdo', 4: 'Neutral', 7: 'Totalmente de acuerdo' }
        : { 1: 'Muy Bajo', 3: 'Medio', 5: 'Muy Alto' };
    const progress = step === 'ASSESSMENT' ? ((currentSectionIndex + 1) / sections.length) * 100 : 0;

    const instrumentTitle = isKerzner
        ? 'Madurez en Gestión de Proyectos (Kerzner)'
        : 'Diagnóstico de Madurez Digital (Kroh et al. 2020 + Angelshaug 2025)';

    const handleAnswer = (itemId: string, value: number) => {
        setAnswers(prev => ({ ...prev, [itemId]: value }));
    };

    const nextSection = () => {
        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            submitAssessment();
        }
    };

    const prevSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const allCurrentQuestionsAnswered = currentSection?.items.every(item => answers[item.id] !== undefined);

    const submitAssessment = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/public/survey/${token}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    respondentName,
                    respondentPosition,
                    respondentEmail,
                    responses: answers,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStep('SUCCESS');
            } else {
                setError(data.error || 'Error al enviar respuestas');
                setStep('ERROR');
            }
        } catch {
            setError('Error de conexión al enviar respuestas');
            setStep('ERROR');
        } finally {
            setIsSaving(false);
        }
    };

    // ======================== LOADING ========================
    if (step === 'LOADING') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Validando enlace...</p>
                </div>
            </div>
        );
    }

    // ======================== ERROR ========================
    if (step === 'ERROR') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-red-500 text-4xl">error_outline</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Enlace no disponible</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <p className="text-xs text-slate-400">Si crees que esto es un error, contacta al administrador que te compartió este enlace.</p>
                </div>
            </div>
        );
    }

    // ======================== SUCCESS ========================
    if (step === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-emerald-500 text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Respuestas enviadas</h2>
                    <p className="text-slate-500 mb-2">Gracias por completar la evaluación para <span className="font-bold text-primary">{surveyInfo?.companyName}</span>.</p>
                    <p className="text-sm text-slate-400">Tus respuestas han sido registradas exitosamente. Puedes cerrar esta ventana.</p>
                </div>
            </div>
        );
    }

    // ======================== RESPONDENT DETAILS ========================
    if (step === 'RESPONDENT_DETAILS') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 mx-auto">
                            <span className="material-icons text-4xl">assignment</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">{instrumentTitle}</h2>
                        <p className="text-slate-500 font-medium">Evaluación para <span className="text-primary font-bold">{surveyInfo?.companyName}</span></p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-8 border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-start gap-3">
                            <span className="material-icons text-blue-500 text-xl mt-0.5">info</span>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-bold mb-1">Antes de comenzar</p>
                                <p>Por favor ingrese sus datos. Sus respuestas son confidenciales y serán utilizadas únicamente con fines de diagnóstico organizacional.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Nombre Completo *</label>
                            <input
                                type="text"
                                value={respondentName}
                                onChange={(e) => setRespondentName(e.target.value)}
                                placeholder="Ej. Juan Pérez"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Cargo / Posición *</label>
                            <input
                                type="text"
                                value={respondentPosition}
                                onChange={(e) => setRespondentPosition(e.target.value)}
                                placeholder="Ej. Gerente de TI"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Correo Electrónico *</label>
                            <input
                                type="email"
                                value={respondentEmail}
                                onChange={(e) => setRespondentEmail(e.target.value)}
                                placeholder="ejemplo@empresa.com"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (respondentName && respondentPosition && respondentEmail) {
                                setStep('ASSESSMENT');
                            } else {
                                alert('Por favor complete todos los campos.');
                            }
                        }}
                        className="w-full mt-10 p-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Comenzar Evaluación
                        <span className="material-icons">play_arrow</span>
                    </button>
                </div>
            </div>
        );
    }

    // ======================== ASSESSMENT ========================
    return (
        <div className="bg-slate-50 dark:bg-slate-950 font-sans min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{instrumentTitle}</h1>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>{surveyInfo?.companyName}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{respondentName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{Math.round(progress)}%</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-4xl mx-auto">
                    {/* Section info */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-primary">Sección {currentSectionIndex + 1} de {sections.length}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{currentSection.title}</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{currentSection.description}</p>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {currentSection.items.map((item, index) => (
                            <div key={item.id} className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${answers[item.id] ? 'ring-1 ring-emerald-500/30' : 'hover:border-primary/50'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${answers[item.id] ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-md font-semibold text-slate-800 dark:text-slate-100 mb-6">
                                            {item.text}
                                        </label>

                                        <div className={`grid grid-cols-1 gap-3 ${isKerzner ? 'md:grid-cols-7' : 'md:grid-cols-5'}`}>
                                            {Array.from({ length: scaleMax }, (_, i) => i + 1).map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAnswer(item.id, val)}
                                                    className={`flex flex-col items-center p-3 border rounded-lg transition-all group ${answers[item.id] === val
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-primary'
                                                        }`}
                                                >
                                                    <span className={`text-lg font-bold mb-1 ${answers[item.id] === val ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>{val}</span>
                                                    <span className={`text-[8px] uppercase font-bold text-center leading-tight ${answers[item.id] === val ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
                                                        {(scaleLabels as any)[val] || ''}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="mt-12 mb-20 flex items-center justify-between">
                        <button
                            onClick={prevSection}
                            disabled={currentSectionIndex === 0}
                            className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-30"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Anterior
                        </button>
                        <button
                            onClick={nextSection}
                            disabled={!allCurrentQuestionsAnswered}
                            className="px-8 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-shadow shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {currentSectionIndex === sections.length - 1 ? 'Finalizar Evaluación' : 'Siguiente Sección'}
                            <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Saving overlay */}
            {isSaving && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="font-bold text-lg mb-2">Enviando respuestas</h2>
                        <p className="text-sm text-slate-500">Procesando tu evaluación...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
