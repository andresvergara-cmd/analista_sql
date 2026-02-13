
export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    horizon: 'Corto Plazo (Quick Win)' | 'Mediano Plazo' | 'Largo Plazo (Estratégico)';
    type: 'critical' | 'improvement' | 'optimization';
    foundation: string;
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
        // Normalize name to match keys if necessary, strictly it should match 'kroh-logic.ts'
        // Assuming names match for now.
        const rule = suggestions[f.name] || { low: ['Mejorar capacidades básicas.'], mid: ['Optimizar procesos.'], high: ['Innovar.'] };

        // Score is 0-100 based on previous logic (score * 20), let's check logic.
        // In kroh-logic.ts: score is 1-5. Wait, frontend showed percentage.
        // Let's check kroh-logic.ts. 
        // It returns { score: number (1-5), ... } 
        // Wait, in frontend/src/app/diagnosis/[id]/page.tsx I saw `f.score%`. 
        // Let's assume the input `f.score` here is 0-100 or 1-5.
        // The diagnosis.result stored usually has the raw calculated score.
        // Let's verify kroh-logic.ts output.
        // Backend kroh-logic returns: { foundations: { name, score, description }[], ... }
        // The score there is the average of items (1-5).
        // So I should treat input score as 1-5.

        if (f.score < 2.5) {
            rule.low.forEach((desc, i) => {
                roadmap.push({
                    id: `gap-${index}-low-${i}`,
                    title: `Fundamentos de ${f.name}`,
                    description: desc,
                    horizon: 'Corto Plazo (Quick Win)',
                    type: 'critical',
                    foundation: f.name
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
                    foundation: f.name
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
                    foundation: f.name
                });
            });
        }
    });

    return roadmap;
};
