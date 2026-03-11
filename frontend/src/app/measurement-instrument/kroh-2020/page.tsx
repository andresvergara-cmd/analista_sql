"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KROH_MICROFOUNDATIONS } from '@/constants/kroh-items';
import AssessmentSidebar from '@/components/AssessmentSidebar';

interface Organization {
    id: string;
    name: string;
    legalId: string;
}

export default function KrohAssessmentPage() {
    const router = useRouter();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [respondentName, setRespondentName] = useState('');
    const [respondentPosition, setRespondentPosition] = useState('');
    const [respondentEmail, setRespondentEmail] = useState('');
    const [step, setStep] = useState<'SELECT_ORG' | 'RESPONDENT_DETAILS' | 'ASSESSMENT'>('SELECT_ORG');

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/organizations');
                const data = await res.json();
                setOrganizations(data);
            } catch (error) {
                console.error('Error fetching organizations:', error);
            } finally {
                setIsLoadingOrgs(false);
            }
        };
        fetchOrganizations();
    }, []);

    const currentSection = KROH_MICROFOUNDATIONS[currentSectionIndex];
    const progress = step === 'ASSESSMENT' ? ((currentSectionIndex + 1) / KROH_MICROFOUNDATIONS.length) * 100 : 0;

    const handleAnswer = (itemId: string, value: number) => {
        setAnswers(prev => ({ ...prev, [itemId]: value }));
    };

    const nextSection = () => {
        if (currentSectionIndex < KROH_MICROFOUNDATIONS.length - 1) {
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

    const submitAssessment = async () => {
        if (!selectedCompanyId) return;
        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:3001/api/assessment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessmentId: 'kroh-2020',
                    companyId: selectedCompanyId,
                    studentName: 'Andres Vergara', // Mock for now
                    studentEmail: 'andres.vergara@example.com', // Mock for now
                    respondentName,
                    respondentPosition,
                    respondentEmail,
                    responses: answers
                })
            });
            if (res.ok) {
                const data = await res.json();
                router.push(`/diagnosis/${data.diagnosisId}`);
            }
        } catch (error) {
            console.error('Error submitting assessment:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 font-sans min-h-screen flex flex-col -m-8">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-8 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                            <img src="/assets/logo.png" alt="Icesi" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">DIAGNÓSTICO <span className="text-primary tracking-tight">PLATAFORMA</span></h1>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <span>Marco Kroh et al. 2020</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-emerald-500">Auto-save: ON</span>
                            </div>
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

            <main className="flex-1 flex overflow-hidden">
                {step === 'SELECT_ORG' && (
                    <div className="flex-1 flex items-center justify-center p-10">
                        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 mx-auto">
                                <span className="material-icons text-4xl">domain</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white text-center tracking-tighter mb-2">Seleccionar Organización</h2>
                            <p className="text-slate-500 text-center mb-10 font-medium">Por favor, elija la empresa para la cual desea realizar este diagnóstico.</p>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
                                {isLoadingOrgs ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : organizations.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-slate-400 font-bold mb-4">No hay organizaciones registradas.</p>
                                        <Link href="/organizations" className="text-primary font-black hover:underline">Ir a crear una organización</Link>
                                    </div>
                                ) : organizations.map((org) => (
                                    <button
                                        key={org.id}
                                        onClick={() => {
                                            setSelectedCompanyId(org.id);
                                            setStep('RESPONDENT_DETAILS');
                                        }}
                                        className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 hover:border-primary border border-transparent rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-primary shadow-sm border border-slate-100 dark:border-slate-700">
                                                {org.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white group-hover:text-primary transition-colors">{org.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">NIT: {org.legalId}</p>
                                            </div>
                                        </div>
                                        <span className="material-icons text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                                <Link href="/measurement-instrument" className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">Volver a Instrumentos de Medición</Link>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'RESPONDENT_DETAILS' && (
                    <div className="flex-1 flex items-center justify-center p-10">
                        <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-10 duration-500">
                            <div className="flex items-center gap-4 mb-8">
                                <button
                                    onClick={() => setStep('SELECT_ORG')}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className="material-icons">arrow_back</span>
                                </button>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Detalles del Encuestado</h2>
                            </div>

                            <p className="text-slate-500 mb-8 font-medium">Información de la persona que responde por parte de <span className="text-primary font-bold"> {organizations.find(o => o.id === selectedCompanyId)?.name}</span>.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={respondentName}
                                        onChange={(e) => setRespondentName(e.target.value)}
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Cargo / Posición</label>
                                    <input
                                        type="text"
                                        value={respondentPosition}
                                        onChange={(e) => setRespondentPosition(e.target.value)}
                                        placeholder="Ej. Gerente de TI"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Correo Electrónico</label>
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
                                Iniciar Instrumento
                                <span className="material-icons">play_arrow</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'ASSESSMENT' && (
                    <>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                            <div className="max-w-4xl mx-auto">
                                <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-black">
                                            {organizations.find(o => o.id === selectedCompanyId)?.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-primary font-black uppercase tracking-tighter">Evaluando a:</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-white">{organizations.find(o => o.id === selectedCompanyId)?.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Deseas cambiar de organización? Se perderá el progreso actual.')) {
                                                setSelectedCompanyId(null);
                                                setStep('SELECT_ORG');
                                                setRespondentName('');
                                                setRespondentPosition('');
                                                setRespondentEmail('');
                                                setAnswers({});
                                                setCurrentSectionIndex(0);
                                            }
                                        }}
                                        className="text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors py-1 px-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                                    >
                                        Cambiar
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-2">
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Formulario de Madurez Digital</h1>
                                        <span className="text-sm font-medium text-primary">Sección {currentSectionIndex + 1} de {KROH_MICROFOUNDATIONS.length}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 text-sm">
                                        <span className="font-bold uppercase tracking-wider text-xs">{currentSection.title}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                        {currentSection.description}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {currentSection.items.map((item, index) => (
                                        <div key={item.id} className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all ${answers[item.id] !== undefined ? 'ring-1 ring-emerald-500/30' : 'hover:border-primary/50'}`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${answers[item.id] !== undefined ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-md font-semibold text-slate-800 dark:text-slate-100 mb-6">
                                                        {item.text}
                                                    </label>

                                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                                        {[1, 2, 3, 4, 5].map((val) => (
                                                            <button
                                                                key={val}
                                                                onClick={() => handleAnswer(item.id, val)}
                                                                className={`flex flex-col items-center p-3 border rounded-lg transition-all group ${answers[item.id] === val
                                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-primary'
                                                                    }`}
                                                            >
                                                                <span className={`text-lg font-bold mb-1 ${answers[item.id] === val ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>{val}</span>
                                                                <span className={`text-[9px] uppercase font-bold ${answers[item.id] === val ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
                                                                    {val === 1 ? 'Muy Bajo' : val === 5 ? 'Muy Alto' : ''}
                                                                </span>
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => handleAnswer(item.id, 0)}
                                                            className={`flex flex-col items-center p-3 border rounded-lg transition-all group ${answers[item.id] === 0
                                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-500/20'
                                                                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-amber-500'
                                                                }`}
                                                        >
                                                            <span className={`material-icons text-lg mb-1 ${answers[item.id] === 0 ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}>help_outline</span>
                                                            <span className={`text-[9px] uppercase font-bold ${answers[item.id] === 0 ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}>
                                                                No Sabe
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 mb-20 flex items-center justify-between">
                                    <button
                                        onClick={prevSection}
                                        disabled={currentSectionIndex === 0}
                                        className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-30"
                                    >
                                        <span className="material-icons text-sm">arrow_back</span>
                                        Anterior
                                    </button>
                                    <div className="flex gap-4">
                                        <button className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors">Guardar borrador</button>
                                        <button
                                            onClick={nextSection}
                                            className="px-8 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-shadow shadow-lg shadow-primary/20 flex items-center gap-2"
                                        >
                                            {currentSectionIndex === KROH_MICROFOUNDATIONS.length - 1 ? 'Finalizar Evaluación' : 'Siguiente Sección'}
                                            <span className="material-icons text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AssessmentSidebar currentSection={currentSection.title} questionId="TODO" />
                    </>
                )}
            </main >

            {
                isSaving && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl text-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <h2 className="font-bold text-lg mb-2">Procesando Diagnóstico</h2>
                            <p className="text-sm text-slate-500">La IA está analizando tus respuestas bajo el marco de Kroh et al. 2020...</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
