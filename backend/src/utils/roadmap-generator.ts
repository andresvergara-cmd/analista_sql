import { getContextForTopic } from './rag-engine';

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    horizon: 'Corto Plazo (Quick Win)' | 'Mediano Plazo' | 'Largo Plazo (Estratégico)';
    type: 'critical' | 'improvement' | 'optimization';
    foundation: string;
    ragContext?: string; // Context from knowledge base documents
}

export const generateRoadmap = (foundations: { name: string; score: number; }[]): RoadmapItem[] => {
    const roadmap: RoadmapItem[] = [];

    const suggestions: Record<string, { low: string[], mid: string[], high: string[] }> = {
        'Cultura Digital': {
            low: ['Implementar programa de alfabetización digital básica.', 'Establecer canales digitales de comunicación interna.'],
            mid: ['Crear equipos multidisciplinarios ágiles.', 'Instituir laboratorios de innovación.'],
            high: ['Fomentar intra-emprendimiento digital.', 'Ecosistema abierto de innovación.']
        },
        'Experiencia del Cliente': {
            low: ['Mapear el viaje del cliente (Customer Journey).', 'Habilitar canales básicos de atención digital (WhatsApp/Redes).'],
            mid: ['Implementar CRM para visión unificada.', 'Personalización básica de ofertas.'],
            high: ['Experiencias omnicanal integradas.', 'Análisis predictivo de comportamiento de cliente.']
        },
        'Organización y Talento': {
            low: ['Definir roles digitales clave.', 'Capacitación en herramientas colaborativas.'],
            mid: ['Implementar KPIs digitales.', 'Contratación de perfiles especializados (Data, UX).'],
            high: ['Estructuras organizativas líquidas.', 'Gestión del talento basada en IA.']
        },
        'Tecnología y Datos': {
            low: ['Migrar servicios básicos a la nube.', 'Digitalizar documentos físicos.'],
            mid: ['Integrar sistemas mediante APIs.', 'Implementar Business Intelligence básico.'],
            high: ['Arquitectura de microservicios.', 'Big Data y lagos de datos.']
        },
        'Procesos e Innovación': {
            low: ['Automatizar tareas repetitivas simples.', 'Documentar procesos clave.'],
            mid: ['Implementar metodologías ágiles (Scrum/Kanban).', 'Digitalizar flujos de trabajo core.'],
            high: ['Automatización robótica de procesos (RPA).', 'Minería de procesos.']
        },
        'Estrategia y Liderazgo': {
            low: ['Definir visión digital clara.', 'Asignar presupuesto inicial para TI.'],
            mid: ['Crear comité de transformación digital.', 'Alinear objetivos de negocio con tecnología.'],
            high: ['Nuevos modelos de negocio digitales.', 'Liderazgo disruptivo en el mercado.']
        },
        'Ecosistema y Partners': {
            low: ['Identificar socios tecnológicos clave.', 'Participar en eventos del sector.'],
            mid: ['Colaborar con startups.', 'Integración de cadena de suministro digital.'],
            high: ['Plataformización del negocio.', 'Co-creación con partners y clientes.']
        }
    };

    foundations.forEach((f, index) => {
        const rule = suggestions[f.name] || { low: ['Mejorar capacidades básicas.'], mid: ['Optimizar procesos.'], high: ['Innovar.'] };

        // Retrieve relevant context from uploaded knowledge base documents
        const context = getContextForTopic(f.name, 2);

        if (f.score < 2.5) {
            rule.low.forEach((desc, i) => {
                roadmap.push({
                    id: `gap-${index}-low-${i}`,
                    title: `Fundamentos de ${f.name}`,
                    description: desc,
                    horizon: 'Corto Plazo (Quick Win)',
                    type: 'critical',
                    foundation: f.name,
                    ...(context && { ragContext: context }),
                });
            });
        } else if (f.score < 4.0) {
            rule.mid.forEach((desc, i) => {
                roadmap.push({
                    id: `gap-${index}-mid-${i}`,
                    title: `Aceleración de ${f.name}`,
                    description: desc,
                    horizon: 'Mediano Plazo',
                    type: 'improvement',
                    foundation: f.name,
                    ...(context && { ragContext: context }),
                });
            });
        } else {
            rule.high.forEach((desc, i) => {
                roadmap.push({
                    id: `gap-${index}-high-${i}`,
                    title: `Liderazgo en ${f.name}`,
                    description: desc,
                    horizon: 'Largo Plazo (Estratégico)',
                    type: 'optimization',
                    foundation: f.name,
                    ...(context && { ragContext: context }),
                });
            });
        }
    });

    return roadmap;
};
