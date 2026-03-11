import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { calculateKrohMaturity } from '../src/utils/kroh-logic';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Generate random value with jitter
const jitter = (base: number, sigma = 0.8): number =>
    Math.min(5, Math.max(1, Math.round(base + (Math.random() - 0.5) * 2 * sigma)));

async function main() {
    console.log('\n🔄 Agregando respuestas de prueba con dimensiones de Angelshaug\n');

    // Get first company
    const company = await prisma.company.findFirst();
    if (!company) {
        console.error('❌ No se encontraron empresas. Crea una primero.');
        return;
    }

    console.log(`✅ Usando empresa: ${company.name}`);

    // Get assessment
    const assessment = await prisma.assessment.findUnique({
        where: { id: 'kroh-2020' }
    });

    if (!assessment) {
        console.error('❌ No se encontró el instrumento Kroh. Ejecuta update-kroh-with-angelshaug.ts primero.');
        return;
    }

    console.log(`✅ Instrumento encontrado: ${assessment.title}`);

    // Create responses with all dimensions including Angelshaug
    const responses: Record<string, number> = {
        // DIF - Digital Focus
        I3: 4, I4: 4, I5: 3, I6: 4, I7: 4, I8: 3, I9: 4, I10: 4,
        // DIP - Digital Innovation Process
        I11: 4, I12: 3, I13: 4, I14: 3,
        // DMI - Digital Mindset
        I17: 4, I18: 4, I19: 3, I20: 4,
        // DIN - Digital Innovation Network
        I22: 3, I23: 3, I24: 3, I25: 3,
        // DTC - Digital Tech Capability
        I26: 4, I27: 4, I28: 3, I29: 3, I30: 4,
        // DMA - Data Management
        I31: 3, I32: 3, I33: 3,
        // DIR - Overcoming Resistance (inverse)
        I34: 2, I35: 2, I36: 2, I38: 3,
        // AIA - Angelshaug AI Attention Infrastructure
        A1: 4, // Outlook: Enfoque en el futuro
        A2: 3, // Orientation: Captando señales externas
        A3: 3, // Flexibility: Cuestionamiento de modelo de negocio
        A4: 4, // Alignment: Creencia común sobre IA
        A5: 3  // Persistence: Tiempo sostenido dedicado a IA
    };

    console.log('\n📊 Generando respuestas de prueba...\n');

    // Create multiple respondents
    const respondents = [
        { name: 'Juan Pérez', position: 'CEO', email: 'juan.perez@empresa.co', drift: 0.3 },
        { name: 'María González', position: 'CTO', email: 'maria.gonzalez@empresa.co', drift: 0.2 },
        { name: 'Carlos Rodríguez', position: 'Gerente de Innovación', email: 'carlos.rodriguez@empresa.co', drift: 0.1 },
        { name: 'Ana Martínez', position: 'Director de TI', email: 'ana.martinez@empresa.co', drift: 0 },
        { name: 'Luis Torres', position: 'Gerente de Operaciones', email: 'luis.torres@empresa.co', drift: -0.2 },
    ];

    for (const respondent of respondents) {
        // Apply drift to responses
        const respondentResponses = { ...responses };
        Object.keys(respondentResponses).forEach(key => {
            if (key.startsWith('I') || key.startsWith('A')) {
                const base = respondentResponses[key];
                respondentResponses[key] = Math.min(5, Math.max(1, Math.round(base + respondent.drift)));
            }
        });

        // Calculate maturity
        const maturity = calculateKrohMaturity(respondentResponses);

        // Create answer first
        const answer = await prisma.answer.create({
            data: {
                assessmentId: 'kroh-2020',
                companyId: company.id,
                studentName: 'Sistema de Pruebas',
                studentEmail: 'test@icesi.edu.co',
                respondentName: respondent.name,
                respondentPosition: respondent.position,
                respondentEmail: respondent.email,
                responses: respondentResponses as any,
                submittedAt: new Date()
            }
        });

        // Create diagnosis linked to answer
        const diagnosisResult = {
            summary: `Diagnóstico para ${company.name}`,
            maturity: maturity,
            generatedAt: new Date().toISOString()
        };

        const diagnosis = await prisma.diagnosis.create({
            data: {
                assessmentId: 'kroh-2020',
                studentEmail: 'test@icesi.edu.co',
                answerId: answer.id,
                result: JSON.stringify(diagnosisResult),
                score: maturity.globalScore
            }
        });

        console.log(`✅ ${respondent.name} (${respondent.position}) - Score: ${maturity.globalScore}`);
    }

    console.log(`\n✨ Se crearon ${respondents.length} diagnósticos con respuestas de Angelshaug\n`);

    // Get company with answers count
    const companyWithAnswers = await prisma.company.findUnique({
        where: { id: company.id },
        include: {
            _count: {
                select: { answers: true }
            }
        }
    });

    console.log(`📊 Total de respuestas para ${company.name}: ${companyWithAnswers?._count.answers}\n`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
