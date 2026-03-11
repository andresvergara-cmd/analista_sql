import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('\n🔍 Verificando respuestas de Angelshaug en la base de datos\n');

    // Get Pyme Alpha Logistics company
    const company = await prisma.company.findFirst({
        where: {
            name: {
                contains: 'Pyme Alpha'
            }
        },
        include: {
            answers: {
                where: {
                    assessmentId: 'kroh-2020'
                },
                orderBy: {
                    submittedAt: 'desc'
                },
                take: 1
            }
        }
    });

    if (!company) {
        console.error('❌ No se encontró la empresa Pyme Alpha Logistics');
        return;
    }

    console.log(`✅ Empresa encontrada: ${company.name}`);
    console.log(`📊 Total de respuestas Kroh: ${company.answers.length}\n`);

    if (company.answers.length === 0) {
        console.error('❌ No hay respuestas para esta empresa');
        return;
    }

    const latestAnswer = company.answers[0];
    const responses = latestAnswer.responses as Record<string, number>;

    console.log(`📝 Última respuesta de: ${latestAnswer.respondentName}`);
    console.log(`📅 Fecha: ${latestAnswer.submittedAt}\n`);

    console.log('🔍 Verificando preguntas de Angelshaug (A1-A5):\n');

    const angelshaugQuestions = ['A1', 'A2', 'A3', 'A4', 'A5'];
    let hasAngelshaug = false;

    angelshaugQuestions.forEach(q => {
        if (responses[q] !== undefined) {
            console.log(`   ✅ ${q}: ${responses[q]}`);
            hasAngelshaug = true;
        } else {
            console.log(`   ❌ ${q}: No encontrado`);
        }
    });

    if (!hasAngelshaug) {
        console.log('\n⚠️  No se encontraron respuestas de Angelshaug');
        console.log('\n📋 Claves de respuesta encontradas:');
        console.log(Object.keys(responses).sort().join(', '));
    } else {
        console.log('\n✅ Se encontraron respuestas de Angelshaug!');
    }

    console.log('\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
