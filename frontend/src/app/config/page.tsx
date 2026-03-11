"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface KnowledgeBase {
    id: string;
    name: string;
    type: string;
    size?: number;
    filename?: string;
    status: string;
}

interface Instrument {
    id: string;
    title: string;
    items: number;
    status: string;
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ConfigPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
        { id: 'kb1', name: 'Marco Kroh 2020 - Estrategia', type: 'PDF', status: 'Activo' },
        { id: 'kb2', name: 'Casos de Éxito Transformación Digital', type: 'Doc', status: 'Activo' },
    ]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [showUpload, setShowUpload] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch uploaded knowledge bases
                const kbResponse = await fetch(`${API_URL}/api/knowledge-base/files`);
                if (kbResponse.ok) {
                    const files = await kbResponse.json();
                    const uploaded: KnowledgeBase[] = files.map((file: any, index: number) => ({
                        id: file.id || `file-${index}-${Date.now()}`, // Ensure unique ID
                        name: file.name,
                        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                        size: file.size,
                        filename: file.id,
                        status: 'Activo',
                    }));
                    setKnowledgeBases(uploaded); // Replace, don't append
                }

                // Fetch instruments
                const instResponse = await fetch(`${API_URL}/api/assessments`);
                if (instResponse.ok) {
                    const data = await instResponse.json();
                    setInstruments(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const uploadFile = async (file: File) => {
        setUploadError('');
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/api/knowledge-base/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const err = await res.json();
                    throw new Error(err.error || 'Error al subir el archivo');
                }
                throw new Error(`Error del servidor (${res.status}). Verifica que el backend esté reiniciado.`);
            }

            // Refresh the knowledge bases list after upload
            const kbResponse = await fetch(`${API_URL}/api/knowledge-base/files`);
            if (kbResponse.ok) {
                const files = await kbResponse.json();
                const updated: KnowledgeBase[] = files.map((file: any, index: number) => ({
                    id: file.id || `file-${index}-${Date.now()}`,
                    name: file.name,
                    type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                    size: file.size,
                    filename: file.id,
                    status: 'Activo',
                }));
                setKnowledgeBases(updated);
            }
            setShowUpload(false);
        } catch (err: any) {
            setUploadError(err.message || 'Error al subir el archivo');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) uploadFile(file);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDeleteKB = async (kb: KnowledgeBase) => {
        if (!confirm('¿Estás seguro de eliminar este documento?')) return;

        if (kb.filename) {
            try {
                const res = await fetch(`${API_URL}/api/knowledge-base/${kb.filename}`, { method: 'DELETE' });
                if (res.ok) {
                    // Refresh the list after deletion
                    const kbResponse = await fetch(`${API_URL}/api/knowledge-base/files`);
                    if (kbResponse.ok) {
                        const files = await kbResponse.json();
                        const updated: KnowledgeBase[] = files.map((file: any, index: number) => ({
                            id: file.id || `file-${index}-${Date.now()}`,
                            name: file.name,
                            type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                            size: file.size,
                            filename: file.id,
                            status: 'Activo',
                        }));
                        setKnowledgeBases(updated);
                    }
                }
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }
    };

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
                        <button onClick={() => { setShowUpload(!showUpload); setUploadError(''); }} className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-colors">
                            <span className="material-icons">{showUpload ? 'close' : 'add_circle'}</span>
                        </button>
                    </div>

                    {showUpload && (
                        <div className="mb-4 space-y-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.csv,.xlsx,.txt"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center
                                    ${isDragging
                                        ? 'border-primary bg-primary/5 scale-[1.02]'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }
                                    ${isUploading ? 'opacity-50 cursor-wait' : ''}
                                `}
                            >
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-icons text-primary text-3xl animate-spin">refresh</span>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Subiendo archivo...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="material-icons text-primary/60 text-3xl">cloud_upload</span>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                            Arrastra un archivo aquí
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            o haz clic para seleccionar
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                                            PDF, DOC, DOCX, CSV, XLSX, TXT — máx. 20MB
                                        </p>
                                    </div>
                                )}
                            </div>
                            {uploadError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                                    <span className="material-icons text-red-500 text-[18px]">error</span>
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{uploadError}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        {knowledgeBases.map((kb) => (
                            <div key={kb.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                                        <span className="material-icons text-slate-400">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{kb.name}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                            {kb.type} {kb.size ? `• ${formatFileSize(kb.size)}` : ''} • {kb.status}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteKB(kb)} className="text-slate-300 group-hover:text-danger p-2 transition-colors">
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

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="material-icons text-primary text-3xl animate-spin">refresh</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {instruments.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-icons text-4xl mb-2">inbox</span>
                                    <p className="text-sm">No hay instrumentos disponibles</p>
                                </div>
                            ) : (
                                instruments.map((inst) => (
                                    <div key={inst.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <span className={`material-icons ${inst.status === 'Activo' ? 'text-emerald-500' : 'text-slate-300'}`}>fact_check</span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{inst.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{inst.items} ítems</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${inst.status === 'Activo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {inst.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
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
