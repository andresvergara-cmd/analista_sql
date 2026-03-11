import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('\n🎯 Creando Instrumento de Madurez en Gestión de Proyectos - Kerzner\n');

    // Get default tenant
    const tenant = await prisma.tenant.findFirst({
        where: { id: 'default-tenant' }
    });

    if (!tenant) {
        throw new Error('Tenant not found. Please run seed first.');
    }

    // Create Kerzner Assessment
    const kerznerInstrument = {
        metadata: {
            title: "Instrumento Integrado - Diagnóstico de Madurez Estratégica y Ejecución",
            subtitle: "Basado en Harold Kerzner - Project Management",
            version: "1.0",
            description: "Este instrumento evalúa prácticas organizacionales relacionadas con estrategia y gestión de proyectos.",
            scale: {
                min: 1,
                max: 7,
                labels: {
                    1: "Totalmente en desacuerdo",
                    2: "En desacuerdo",
                    3: "Parcialmente en desacuerdo",
                    4: "Ni de acuerdo ni en desacuerdo",
                    5: "Parcialmente de acuerdo",
                    6: "De acuerdo",
                    7: "Totalmente de acuerdo"
                },
                instruction: "Responda según su percepción personal."
            }
        },
        sections: [
            {
                id: "section-0",
                title: "Información General",
                type: "demographic",
                description: "Por favor complete la siguiente información sobre usted y su organización.",
                questions: [
                    {
                        id: "cargo",
                        text: "Cargo:",
                        type: "single-choice",
                        options: [
                            { value: "alta_direccion", label: "Alta dirección" },
                            { value: "mando_medio", label: "Mando medio" },
                            { value: "coordinador", label: "Coordinador/proyecto" },
                            { value: "profesional", label: "Profesional/analista" }
                        ]
                    },
                    {
                        id: "area_funcional",
                        text: "Área funcional:",
                        type: "single-choice",
                        options: [
                            { value: "direccion", label: "Dirección" },
                            { value: "operaciones", label: "Operaciones" },
                            { value: "comercial", label: "Comercial" },
                            { value: "finanzas", label: "Finanzas" },
                            { value: "ti", label: "TI" },
                            { value: "otro", label: "Otro" }
                        ]
                    },
                    {
                        id: "antiguedad_empresa_personal",
                        text: "Antigüedad en la empresa:",
                        type: "single-choice",
                        options: [
                            { value: "menos_1", label: "< 1 año" },
                            { value: "1_3", label: "1-3 años" },
                            { value: "4_7", label: "4-7 años" },
                            { value: "mas_7", label: "> 7 años" }
                        ]
                    },
                    {
                        id: "num_empleados",
                        text: "Número aproximado de empleados:",
                        type: "single-choice",
                        options: [
                            { value: "10_49", label: "10-49" },
                            { value: "50_199", label: "50-199" },
                            { value: "200_499", label: "200-499" },
                            { value: "500_mas", label: "500+" }
                        ]
                    },
                    {
                        id: "sector",
                        text: "Sector:",
                        type: "single-choice",
                        options: [
                            { value: "manufactura", label: "Manufactura" },
                            { value: "servicios", label: "Servicios" },
                            { value: "tecnologia", label: "Tecnología" },
                            { value: "construccion", label: "Construcción" },
                            { value: "otro", label: "Otro" }
                        ]
                    },
                    {
                        id: "antiguedad_empresa",
                        text: "Antigüedad de la empresa:",
                        type: "single-choice",
                        options: [
                            { value: "menos_5", label: "< 5 años" },
                            { value: "5_10", label: "5-10 años" },
                            { value: "11_20", label: "11-20 años" },
                            { value: "mas_20", label: "> 20 años" }
                        ]
                    },
                    {
                        id: "tipo_propiedad",
                        text: "Tipo de propiedad:",
                        type: "single-choice",
                        options: [
                            { value: "familiar", label: "Familiar" },
                            { value: "no_familiar", label: "No familiar" }
                        ]
                    }
                ]
            },
            {
                id: "parte-1",
                title: "PARTE 1 — Madurez Evolutiva en Gestión de Proyectos",
                subtitle: "Basado en Kerzner – Índice Formativo",
                type: "assessment",
                description: "Esta sección se usará como índice compuesto continuo. No se modelará como constructo reflectivo.",
                dimensions: [
                    {
                        id: "K1",
                        name: "Cultura y Lenguaje Común",
                        description: "Evalúa la existencia de un lenguaje compartido y roles claramente definidos en gestión de proyectos.",
                        questions: [
                            {
                                id: "K1",
                                text: "Existe un lenguaje común en gestión de proyectos.",
                                dimension: "K1"
                            },
                            {
                                id: "K2",
                                text: "Los roles en proyectos están claramente definidos.",
                                dimension: "K1"
                            },
                            {
                                id: "K3",
                                text: "Los proyectos no dependen exclusivamente de individuos clave.",
                                dimension: "K1"
                            },
                            {
                                id: "K4",
                                text: "Se aplican prácticas básicas formales (alcance, cronograma, riesgos).",
                                dimension: "K1"
                            },
                            {
                                id: "K5",
                                text: "Se documentan lecciones aprendidas tras la ejecución.",
                                dimension: "K1"
                            }
                        ]
                    },
                    {
                        id: "K2",
                        name: "Metodología Institucionalizada",
                        description: "Mide la existencia de procesos estandarizados y sistemáticos en gestión de proyectos.",
                        questions: [
                            {
                                id: "K6",
                                text: "Existe una metodología formal de gestión de proyectos.",
                                dimension: "K2"
                            },
                            {
                                id: "K7",
                                text: "Se aplican procesos estandarizados en distintas áreas.",
                                dimension: "K2"
                            },
                            {
                                id: "K8",
                                text: "La gestión de riesgos es sistemática.",
                                dimension: "K2"
                            },
                            {
                                id: "K9",
                                text: "Se utilizan métricas para seguimiento del desempeño.",
                                dimension: "K2"
                            },
                            {
                                id: "K10",
                                text: "Existe coherencia metodológica entre proyectos.",
                                dimension: "K2"
                            }
                        ]
                    },
                    {
                        id: "K3",
                        name: "Gobernanza y Portafolio",
                        description: "Evalúa la priorización estratégica y gestión del portafolio de proyectos.",
                        questions: [
                            {
                                id: "K11",
                                text: "Se revisa periódicamente el desempeño del portafolio.",
                                dimension: "K3"
                            },
                            {
                                id: "K12",
                                text: "Se priorizan proyectos según criterios estratégicos explícitos.",
                                dimension: "K3"
                            },
                            {
                                id: "K13",
                                text: "Se cancelan proyectos que no generan valor estratégico.",
                                dimension: "K3"
                            },
                            {
                                id: "K14",
                                text: "Se comparan prácticas con estándares externos o mejores prácticas.",
                                dimension: "K3"
                            },
                            {
                                id: "K15",
                                text: "La alta dirección participa en decisiones de portafolio.",
                                dimension: "K3"
                            }
                        ]
                    },
                    {
                        id: "K4",
                        name: "Mejora Continua Estratégica",
                        description: "Mide la capacidad de aprendizaje organizacional y adaptación estratégica.",
                        questions: [
                            {
                                id: "K16",
                                text: "Existe mejora continua en prácticas de gestión de proyectos.",
                                dimension: "K4"
                            },
                            {
                                id: "K17",
                                text: "Las lecciones aprendidas influyen en decisiones futuras.",
                                dimension: "K4"
                            },
                            {
                                id: "K18",
                                text: "La estrategia influye directamente en ajustes del portafolio.",
                                dimension: "K4"
                            },
                            {
                                id: "K19",
                                text: "La organización se adapta sistemáticamente a cambios del entorno.",
                                dimension: "K4"
                            },
                            {
                                id: "K20",
                                text: "El aprendizaje organizacional está institucionalizado.",
                                dimension: "K4"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // Create or update Kerzner assessment
    const assessment = await prisma.assessment.upsert({
        where: { id: 'kerzner-2024' },
        update: {
            title: kerznerInstrument.metadata.title,
            questions: kerznerInstrument as any
        },
        create: {
            id: 'kerzner-2024',
            title: kerznerInstrument.metadata.title,
            tenantId: tenant.id,
            questions: kerznerInstrument as any
        }
    });

    console.log('✅ Instrumento Kerzner creado exitosamente:');
    console.log(`   ID: ${assessment.id}`);
    console.log(`   Título: ${assessment.title}`);
    console.log(`   Total de dimensiones: 4 (K1, K2, K3, K4)`);
    console.log(`   Total de preguntas de evaluación: 20`);
    console.log(`   Total de preguntas demográficas: 7`);
    console.log('\n✨ Instrumento listo para usar!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
