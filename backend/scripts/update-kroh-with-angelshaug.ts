import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('\n🔄 Actualizando Instrumento Kroh con Dimensiones de Angelshaug 2025\n');

    // Get default tenant
    const tenant = await prisma.tenant.findFirst({
        where: { id: 'default-tenant' }
    });

    if (!tenant) {
        throw new Error('Tenant not found. Please run seed first.');
    }

    // Fetch current Kroh assessment
    const currentAssessment = await prisma.assessment.findUnique({
        where: { id: 'kroh-2020' }
    });

    if (!currentAssessment) {
        throw new Error('Kroh assessment not found. Please create it first.');
    }

    console.log('✅ Instrumento Kroh actual encontrado');

    // Restore original Kroh structure (7 micro-foundations from frontend constants)
    const originalKrohSections = [
        {
            id: "kroh-digital-maturity",
            title: "Formulario de Madurez Digital",
            subtitle: "Basado en Kroh et al. 2020 - 7 Micro-fundaciones",
            type: "assessment",
            description: "Esta sección evalúa la madurez digital organizacional a través de 7 micro-fundaciones basadas en capacidades dinámicas.",
            dimensions: [
                {
                    id: "DIF",
                    name: "Digital Focus",
                    description: "Evaluación de la estrategia, metas y recursos asignados a la innovación digital.",
                    questions: [
                        { id: "I3", text: "Hemos formulado y comunicado una estrategia digital como guía para desarrollar innovación digital.", dimension: "DIF" },
                        { id: "I4", text: "Hemos definido roles, responsabilidades y procesos de toma de decisiones para la implementación de la estrategia digital.", dimension: "DIF" },
                        { id: "I5", text: "La dirección actúa como un modelo a seguir para la innovación digital.", dimension: "DIF" },
                        { id: "I6", text: "Proporcionamos amplios recursos financieros para implementar nuestra estrategia digital.", dimension: "DIF" },
                        { id: "I7", text: "Construimos nuevas capacidades para implementar nuestra estrategia digital.", dimension: "DIF" },
                        { id: "I8", text: "Contratamos nuevos empleados para implementar nuestra estrategia digital.", dimension: "DIF" },
                        { id: "I9", text: "Refinamos nuestra infraestructura técnica para implementar nuestra estrategia digital.", dimension: "DIF" },
                        { id: "I10", text: "Modificamos nuestros procesos para implementar nuestra estrategia digital.", dimension: "DIF" }
                    ]
                },
                {
                    id: "DIP",
                    name: "Digital Innovation Process",
                    description: "Agilidad y flexibilidad en el desarrollo de innovaciones digitales.",
                    questions: [
                        { id: "I11", text: "Consideramos las posibilidades de innovación digital resultantes de la combinación de hardware y software en nuestro proceso.", dimension: "DIP" },
                        { id: "I12", text: "Consideramos el potencial continuo de las innovaciones digitales (ej. actualizaciones de software) en nuestro proceso.", dimension: "DIP" },
                        { id: "I13", text: "Consideramos nuevas oportunidades de negocio más allá del uso primario (ej. uso extendido de datos) en nuestro proceso.", dimension: "DIP" },
                        { id: "I14", text: "Somos conscientes de que socios de mercado externos y desconocidos pueden tomar oportunidades de nuestras innovaciones digitales.", dimension: "DIP" }
                    ]
                },
                {
                    id: "DMI",
                    name: "Digital Mindset",
                    description: "Cultura y entendimiento compartido sobre el potencial digital.",
                    questions: [
                        { id: "I17", text: "En nuestra empresa, la innovación digital está establecida (ej. a través de campañas de información, eventos).", dimension: "DMI" },
                        { id: "I18", text: "Nuestros empleados entienden el posible impacto de la innovación digital en su trabajo diario.", dimension: "DMI" },
                        { id: "I19", text: "Nuestros empleados solicitan la implementación de innovaciones digitales.", dimension: "DMI" },
                        { id: "I20", text: "Nuestros empleados discuten el impacto de la innovación digital en la empresa dentro de sus equipos.", dimension: "DMI" }
                    ]
                },
                {
                    id: "DIN",
                    name: "Digital Innovation Network",
                    description: "Colaboración con socios externos y ecosistemas digitales.",
                    questions: [
                        { id: "I22", text: "Dependemos más de socios externos en el desarrollo de innovación digital que en otros tipos de innovación.", dimension: "DIN" },
                        { id: "I23", text: "Colaboramos con nuevos socios externos en el desarrollo de innovación digital.", dimension: "DIN" },
                        { id: "I24", text: "Las relaciones con socios externos tienen más un carácter de asociación que de cliente-proveedor.", dimension: "DIN" },
                        { id: "I25", text: "No hay ninguna empresa en nuestra red de innovación digital que controle el proceso de innovación por sí sola.", dimension: "DIN" }
                    ]
                },
                {
                    id: "DTC",
                    name: "Digital Technology Capability",
                    description: "Capacidad para identificar tecnologías clave y fuentes de datos.",
                    questions: [
                        { id: "I26", text: "Somos capaces de identificar datos valiosos (ej. datos de máquinas, datos de usuarios, etc.).", dimension: "DTC" },
                        { id: "I27", text: "Somos capaces de identificar tecnologías digitales clave (ej. soluciones en la nube, machine learning, etc.).", dimension: "DTC" },
                        { id: "I28", text: "Contamos con los sistemas técnicos adecuados para almacenar, evaluar y analizar datos que son valiosos para nosotros.", dimension: "DTC" },
                        { id: "I29", text: "Somos capaces de generar y fusionar datos de diferentes fuentes.", dimension: "DTC" },
                        { id: "I30", text: "Somos capaces de obtener conocimiento a partir de estos datos.", dimension: "DTC" }
                    ]
                },
                {
                    id: "DMA",
                    name: "Data Management",
                    description: "Gestión operativa de datos y coordinación funcional.",
                    questions: [
                        { id: "I31", text: "Tenemos responsabilidades claras para todas las actividades operativas relacionadas con el almacenamiento y análisis de datos.", dimension: "DMA" },
                        { id: "I32", text: "Coordinamos todas las actividades operativas de datos a través de fronteras funcionales y departamentales.", dimension: "DMA" },
                        { id: "I33", text: "Consideramos el impacto de todas las decisiones operativas en el almacenamiento, evaluación y análisis de datos.", dimension: "DMA" }
                    ]
                },
                {
                    id: "DIR",
                    name: "Overcoming Resistance",
                    description: "Superación de barreras internas y resistencia al cambio (Escala Invertida).",
                    questions: [
                        { id: "I34", text: "Nuestros empleados carecen de las competencias para desarrollar innovaciones digitales.", dimension: "DIR" },
                        { id: "I35", text: "Nuestros empleados no están dispuestos a desarrollar innovaciones digitales.", dimension: "DIR" },
                        { id: "I36", text: "Nuestros empleados perciben las condiciones legales (ej. leyes de protección de datos) como barreras.", dimension: "DIR" },
                        { id: "I38", text: "Nuestros procesos internos y altos niveles de burocracia son barreras para desarrollar innovación digital.", dimension: "DIR" }
                    ]
                }
            ]
        }
    ];

    console.log(`📊 Restaurando estructura original de Kroh:`);
    console.log(`   - 7 micro-fundaciones (DIF, DIP, DMI, DIN, DTC, DMA, DIR)`);
    console.log(`   - 32 preguntas (I3-I38)`);

    // Create new Angelshaug section with 5 dimensions (MAA - Matriz de Auditoría de Atención)
    const angelshaug2025Section = {
        id: "parte-2",
        title: "PARTE 2 — Infraestructura de Atención a la IA",
        subtitle: "Basado en Angelshaug 2025 - Matriz de Auditoría de Atención (MAA)",
        type: "assessment",
        description: "Esta sección evalúa la capacidad organizacional para dirigir atención estratégica hacia la Inteligencia Artificial y tecnologías emergentes.",
        dimensions: [
            {
                id: "A1",
                name: "Outlook (Perspectiva Temporal)",
                description: "Evalúa si la atención organizacional se centra en el futuro a largo plazo o solo en eficiencias operativas del presente.",
                questions: [
                    {
                        id: "A1",
                        text: "¿Nuestras reuniones de IA se centran en el futuro (5 años) o solo en resolver ineficiencias del modelo actual?",
                        dimension: "A1"
                    }
                ]
            },
            {
                id: "A2",
                name: "Orientation (Foco de Información)",
                description: "Mide si la organización capta señales externas relevantes o se limita a fuentes internas.",
                questions: [
                    {
                        id: "A2",
                        text: "¿Estamos captando señales de competidores tecnológicos/startups de IA o solo escuchamos reportes internos de TI?",
                        dimension: "A2"
                    }
                ]
            },
            {
                id: "A3",
                name: "Flexibility (Flexibilidad Cognitiva)",
                description: "Evalúa la libertad para cuestionar modelos de negocio fundamentales ante tecnologías disruptivas.",
                questions: [
                    {
                        id: "A3",
                        text: "¿Tenemos permiso para cuestionar la lógica fundamental de cómo ganamos dinero ante la IA, o la IA debe 'encajar' en lo que ya hacemos?",
                        dimension: "A3"
                    }
                ]
            },
            {
                id: "A4",
                name: "Alignment (Alineación Cognitiva)",
                description: "Mide el grado de entendimiento común sobre el significado y rol de la IA en la organización.",
                questions: [
                    {
                        id: "A4",
                        text: "¿El equipo directivo tiene una creencia común sobre qué es la IA para nosotros, o cada área la entiende de forma fragmentada?",
                        dimension: "A4"
                    }
                ]
            },
            {
                id: "A5",
                name: "Persistence (Esfuerzo Sostenido)",
                description: "Evalúa la intensidad y continuidad del tiempo dedicado a pensar estratégicamente sobre IA.",
                questions: [
                    {
                        id: "A5",
                        text: "¿Dedicamos tiempo intenso y sostenido a la IA, o es solo un punto de 10 minutos al final de cada sesión?",
                        dimension: "A5"
                    }
                ]
            }
        ]
    };

    // Add new Angelshaug section to restored Kroh sections
    const updatedSections = [...originalKrohSections, angelshaug2025Section];

    // Create complete instrument structure with metadata
    const updatedQuestions = {
        metadata: {
            title: "Diagnóstico de Madurez Digital - Versión Extendida",
            subtitle: "Basado en Kroh et al. 2020 + Angelshaug 2025 (MAA)",
            version: "2.0",
            description: "Este instrumento evalúa la madurez digital organizacional basándose en 7 micro-fundaciones (Kroh et al. 2020) y 5 dimensiones de infraestructura de atención a la IA (Angelshaug 2025).",
            scale: {
                min: 1,
                max: 5,
                labels: {
                    1: "Muy bajo / Totalmente en desacuerdo",
                    2: "Bajo",
                    3: "Medio / Neutral",
                    4: "Alto",
                    5: "Muy alto / Totalmente de acuerdo"
                },
                instruction: "Responda según su percepción personal sobre la organización."
            },
            lastUpdated: new Date().toISOString()
        },
        sections: updatedSections
    };

    // Update assessment in database
    const updatedAssessment = await prisma.assessment.update({
        where: { id: 'kroh-2020' },
        data: {
            questions: updatedQuestions as any
        }
    });

    console.log('\n✅ Instrumento Kroh actualizado exitosamente:');
    console.log(`   ID: ${updatedAssessment.id}`);
    console.log(`   Título: ${updatedAssessment.title}`);
    console.log(`   Versión: 2.0`);
    console.log(`\n📊 Nueva estructura:`);
    console.log(`   - Total de secciones: ${updatedSections.length}`);
    console.log(`   - Sección 1: ${updatedSections[0].title} (${updatedSections[0].dimensions.length} micro-fundaciones Kroh)`);
    console.log(`   - Sección 2: ${updatedSections[1].title} (${updatedSections[1].dimensions.length} dimensiones Angelshaug)`);
    console.log(`\n🔍 Resumen:`);
    console.log(`   - Kroh 2020: 7 micro-fundaciones, 32 preguntas (I3-I38)`);
    console.log(`   - Angelshaug 2025: 5 dimensiones MAA, 5 preguntas (A1-A5)`);
    console.log(`\n🆕 Dimensiones Angelshaug agregadas:`);
    console.log(`   1. A1 - Outlook (Perspectiva Temporal)`);
    console.log(`   2. A2 - Orientation (Foco de Información)`);
    console.log(`   3. A3 - Flexibility (Flexibilidad Cognitiva)`);
    console.log(`   4. A4 - Alignment (Alineación Cognitiva)`);
    console.log(`   5. A5 - Persistence (Esfuerzo Sostenido)`);
    console.log('\n✨ Instrumento actualizado y listo para usar!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
