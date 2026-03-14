"use client";

interface SidebarProps {
    currentSection: string;
    questionId: string;
}

export default function AssessmentSidebar({ currentSection }: SidebarProps) {
    const getMicrofoundationInfo = () => {
        switch (currentSection) {
            case 'Digital Focus':
                return {
                    title: "Enfoque Digital (Digital Focus)",
                    importance: "El enfoque estratégico en lo digital es la base para habilitar las capacidades dinámicas de sensing, seizing y reconfiguring. Sin una estrategia clara y recursos dedicados, la transformación digital carece de dirección.",
                    keyPoints: [
                        "Estrategia digital explícita y comunicada",
                        "Roles y responsabilidades definidos",
                        "Asignación de recursos financieros y humanos",
                        "Liderazgo como modelo a seguir"
                    ],
                    academicContext: "Kroh et al. (2020) identifican el Digital Focus como el primer microfundamento crítico. La evidencia empírica muestra que empresas con estrategias digitales explícitas tienen 2.3x más probabilidad de éxito en transformación digital.",
                    practicalTip: "Busque evidencia documental: ¿Existe un plan estratégico digital escrito? ¿Hay presupuesto específico asignado? ¿Los empleados pueden articular la visión digital?"
                };
            case 'Digital Innovation Process':
                return {
                    title: "Proceso de Innovación Digital",
                    importance: "Las innovaciones digitales tienen características únicas: son reprogramables, homogeneizadas y combinables. Los procesos de innovación deben adaptarse para aprovechar estas propiedades distintivas.",
                    keyPoints: [
                        "Aprovechamiento de hardware + software",
                        "Innovación continua (actualizaciones)",
                        "Nuevas oportunidades de negocio",
                        "Gestión de riesgos de plataforma"
                    ],
                    academicContext: "La teoría de arquitecturas generativas (Yoo et al., 2012) aplicada por Kroh demuestra que las innovaciones digitales no siguen el ciclo tradicional de I+D. Su naturaleza reprogramable permite iteración continua post-lanzamiento.",
                    practicalTip: "Evalúe si la empresa ve el software como 'terminado' o como un producto vivo que evoluciona. La mentalidad de actualización continua es clave."
                };
            case 'Digital Mindset':
                return {
                    title: "Mentalidad Digital (Digital Mindset)",
                    importance: "La cultura organizacional es el mayor facilitador o bloqueador de transformación digital. El mindset digital implica ver la tecnología no como herramienta sino como habilitador estratégico.",
                    keyPoints: [
                        "Establecimiento cultural de lo digital",
                        "Comprensión del impacto en roles",
                        "Solicitud proactiva de innovación",
                        "Discusión activa sobre transformación"
                    ],
                    academicContext: "El constructo de 'mindset digital' de Kroh se diferencia de la simple competencia digital. Se trata de un cambio cognitivo colectivo donde los empleados ven posibilidades transformadoras, no solo eficiencias operativas.",
                    practicalTip: "Pregunte a empleados de diferentes niveles: '¿Cómo cree que la tecnología podría cambiar fundamentalmente su trabajo?' Las respuestas revelan el nivel de mindset digital."
                };
            case 'Digital Innovation Network':
                return {
                    title: "Red de Innovación Digital",
                    importance: "Las innovaciones digitales raramente se desarrollan en aislamiento. La naturaleza modular y combinable de lo digital requiere ecosistemas de colaboración más que cadenas de valor lineales.",
                    keyPoints: [
                        "Mayor dependencia de socios externos",
                        "Colaboración con nuevos actores",
                        "Relaciones de asociación vs cliente-proveedor",
                        "Gobernanza distribuida de innovación"
                    ],
                    academicContext: "Basado en la teoría de innovación abierta de Chesbrough y el concepto de ecosistemas digitales, Kroh identifica que las empresas digitalmente maduras tienen redes 40% más diversas que sus competidores tradicionales.",
                    practicalTip: "Mapee los socios de innovación: ¿Son los mismos proveedores de hace 5 años? ¿Incluyen startups, universidades, competidores? La diversidad importa."
                };
            case 'Digital Technology Capability':
                return {
                    title: "Capacidad Tecnológica Digital",
                    importance: "La capacidad de identificar, adquirir y explotar tecnologías digitales clave diferencia a los líderes digitales. No se trata solo de tener tecnología, sino de saber cuál es valiosa y cómo explotarla.",
                    keyPoints: [
                        "Identificación de datos valiosos",
                        "Reconocimiento de tecnologías clave",
                        "Infraestructura de análisis de datos",
                        "Fusión de datos de múltiples fuentes"
                    ],
                    academicContext: "Kroh construye sobre la teoría de capacidades dinámicas de Teece. Esta capacidad específica de tecnología digital permite a las organizaciones 'sensing' efectivo: detectar oportunidades antes que la competencia.",
                    practicalTip: "Una empresa con alta capacidad tecnológica puede explicar claramente: ¿Qué datos tenemos? ¿Dónde están? ¿Qué insights generan? La claridad es indicador de madurez."
                };
            case 'Data Management':
                return {
                    title: "Gestión de Datos (Data Management)",
                    importance: "Los datos son el activo estratégico de la era digital. La gestión efectiva requiere coordinación cross-funcional y responsabilidades claras, no solo infraestructura técnica.",
                    keyPoints: [
                        "Responsabilidades operativas claras",
                        "Coordinación inter-departamental",
                        "Consideración del impacto en decisiones",
                        "Gobernanza de datos estructurada"
                    ],
                    academicContext: "Este microfundamento distingue entre capacidad técnica (tener datos) y capacidad organizacional (gestionarlos estratégicamente). Investigaciones de Kroh muestran que la segunda predice mejor el desempeño.",
                    practicalTip: "Pregunte: ¿Quién es responsable de la calidad de datos de clientes? Si la respuesta es 'TI', hay un problema. Debería ser una responsabilidad compartida con clara gobernanza."
                };
            case 'Overcoming Resistance':
                return {
                    title: "Superación de Resistencias",
                    importance: "Las barreras a la transformación digital son más culturales y organizacionales que técnicas. Identificar y gestionar resistencias es crítico para el éxito.",
                    keyPoints: [
                        "Competencias de los empleados",
                        "Disposición al cambio",
                        "Barreras legales y regulatorias",
                        "Burocracia y procesos rígidos"
                    ],
                    academicContext: "Kroh invierte esta escala deliberadamente: puntajes bajos indican alta resistencia. La investigación demuestra que la resistencia cultural supera 3:1 a las barreras técnicas como causa de fracaso en transformación digital.",
                    practicalTip: "¡ATENCIÓN! Esta sección usa escala invertida: 1 = Muy Alto (mucha resistencia), 5 = Muy Bajo (poca resistencia). Evalúe honestamente las barreras reales."
                };
            case 'AI Attention Infrastructure (Angelshaug 2025)':
                return {
                    title: "Infraestructura de Atención en IA",
                    importance: "La Inteligencia Artificial requiere una atención directiva estratégica diferente. No se trata de automatizar procesos existentes, sino de reimaginar modelos de negocio completos.",
                    keyPoints: [
                        "Enfoque en futuro (5+ años)",
                        "Atención a señales externas disruptivas",
                        "Cuestionamiento de lógica de negocio",
                        "Consenso directivo sobre significado de IA"
                    ],
                    academicContext: "Angelshaug (2025) extiende el trabajo de Kroh al contexto de IA generativa. Identifica que la 'atención' de la alta dirección es un recurso escaso que debe estructurarse deliberadamente para IA transformacional, no incremental.",
                    practicalTip: "Evalúe las reuniones ejecutivas sobre IA: ¿Se habla de eficiencia o de nuevos modelos de negocio? La primera es táctica, la segunda estratégica."
                };
            default:
                return {
                    title: "Marco de Madurez Digital",
                    importance: "El modelo de Kroh et al. (2020) identifica 7 microfundamentos que habilitan las capacidades dinámicas digitales: sensing, seizing y reconfiguring.",
                    keyPoints: [
                        "Basado en capacidades dinámicas",
                        "Validado empíricamente",
                        "Aplicable a múltiples industrias",
                        "Enfoque holístico organizacional"
                    ],
                    academicContext: "Publicado en Technological Forecasting and Social Change, el modelo integra teorías de capacidades dinámicas, arquitecturas digitales y transformación organizacional.",
                    practicalTip: "Responda honestamente basándose en evidencia observable, no en aspiraciones. La utilidad del diagnóstico depende de su precisión."
                };
        }
    };

    const info = getMicrofoundationInfo();

    return (
        <aside className="w-[380px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden xl:flex flex-col shadow-inner">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-900">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-icons text-2xl">school</span>
                    </div>
                    <div>
                        <h2 className="font-black text-slate-900 dark:text-white text-lg leading-tight">Contexto Académico</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Kroh et al. 2020</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Main Info Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-black text-primary mb-3">
                            {info.title}
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-medium">
                            {info.importance}
                        </p>
                    </div>
                </div>

                {/* Key Points */}
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="material-icons text-xs">checklist</span>
                        Elementos Clave
                    </h3>
                    <div className="space-y-2">
                        {info.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                                <span className="material-icons text-sm text-primary mt-0.5">check_circle</span>
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Academic Context */}
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-400 mb-2">
                        <span className="material-icons text-sm">menu_book</span>
                        <span className="text-xs font-black uppercase tracking-tight">Fundamento Teórico</span>
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-500/80 leading-relaxed font-medium">
                        {info.academicContext}
                    </p>
                </div>

                {/* Practical Tip */}
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 mb-2">
                        <span className="material-icons text-sm">lightbulb</span>
                        <span className="text-xs font-black uppercase tracking-tight">Guía Práctica</span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-500/80 leading-relaxed font-medium">
                        {info.practicalTip}
                    </p>
                </div>

                {/* References */}
                <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="material-icons text-xs">bookmark</span>
                        Referencias
                    </h3>
                    <div className="space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-icons text-slate-400 text-sm">description</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Kroh et al. (2020)</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal italic">
                                "Microfoundations for Digital Innovation: Understanding the Mechanisms of Digital Transformation" - Technological Forecasting and Social Change
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="material-icons text-sm">info</span>
                    <span className="font-medium">Basado en investigación empírica validada</span>
                </div>
            </div>
        </aside>
    );
}
