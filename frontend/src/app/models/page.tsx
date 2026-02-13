"use client";

export default function ModelsPage() {
    return (
        <div className="max-w-4xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                <span className="material-icons-outlined text-4xl">psychology</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Modelos de Inteligencia Artificial</h1>
            <p className="text-slate-500 max-w-md mx-auto">Configura los motores de IA (Llama-3, GPT-4, Gemini) para el procesamiento de diagnósticos y el asistente RAG.</p>
        </div>
    );
}
