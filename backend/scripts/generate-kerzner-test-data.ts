import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const jitter = (base: number, sigma = 0.8): number =>
    Math.min(7, Math.max(1, Math.round(base + (Math.random() - 0.5) * 2 * sigma)));

const KERZNER_ITEMS = {
    K1: ['K1', 'K2', 'K3', 'K4', 'K5'],
    K2: ['K6', 'K7', 'K8', 'K9', 'K10'],
    K3: ['K11', 'K12', 'K13', 'K14', 'K15'],
    K4: ['K16', 'K17', 'K18', 'K19', 'K20']
};

type KerznerProfile = 'high-maturity' | 'medium-maturity' | 'developing' | 'initial';

const KERZNER_BASE: Record<KerznerProfile, Record<keyof typeof KERZNER_ITEMS, number>> = {
    'high-maturity': { K1: 6.2, K2: 6.0, K3: 5.8, K4: 5.5 },
    'medium-maturity': { K1: 4.8, K2: 4.5, K3: 4.2, K4: 3.8 },
    'developing': { K1: 3.5, K2: 3.0, K3: 2.5, K4: 2.2 },
    'initial': { K1: 2.5, K2: 2.2, K3: 1.8, K4: 1.5 }
};

function buildKerznerResponses(profile: KerznerProfile, sigma = 0.7): Record<string, number> {
    const responses: Record<string, number> = {};
    const base = KERZNER_BASE[profile];
    (Object.keys(KERZNER_ITEMS) as (keyof typeof KERZNER_ITEMS)[]).forEach((dim) => {
        KERZNER_ITEMS[dim].forEach((item) => {
            responses[item] = jitter(base[dim], sigma);
        });
    });
    return responses;
}

const RESPONDENTS = [
    { position: 'CEO / Gerente General', name: 'Carlos Rodríguez', sigma: 0.5, drift: 0.4 },
    { position: 'Director PMO', name: 'María Fernández', sigma: 0.6, drift: 0.2 },
    { position: 'Gerente de Proyectos', name: 'Luis Martínez', sigma: 0.7, drift: 0.0 },
    { position: 'Líder de Proyecto Senior', name: 'Ana García', sigma: 0.7, drift: -0.1 },
    { position: 'Project Manager', name: 'Jorge López', sigma: 0.8, drift: -0.2 },
    { position: 'Coordinador de Proyectos', name: 'Patricia Herrera', sigma: 0.8, drift: -0.3 },
    { position: 'Analista PMO', name: 'Ricardo Torres', sigma: 0.9, drift: -0.4 }
];

async function main() {
    try {
        console.log('🚀 Generando datos de prueba para Kerzner PMMM\n');
        const tenant = await prisma.tenant.findFirst({ where: { id: 'default-tenant' } });
        if (!tenant) { console.error('❌ Tenant no encontrado'); process.exit(1); }

        console.log('📊 Creando empresa de prueba...');
        const company = await prisma.company.create({
            data: {
                name: 'TechProject Solutions S.A.S',
                legalId: '900.555.777-9',
                sector: 'Tecnología y Consultoría',
                size: 'Grande (+200 emp)',
                contactEmail: 'proyectos@techproject.co',
                tenantId: tenant.id
            }
        });
        console.log(`✅ Empresa creada: ${company.name}\n`);

        const assessment = await prisma.assessment.findUnique({ where: { id: 'kerzner-2024' } });
        if (!assessment) { console.error('❌ Instrumento Kerzner no encontrado'); process.exit(1); }
        console.log(`📋 Instrumento: ${assessment.title}\n`);

        const companyProfile: KerznerProfile = 'medium-maturity';
        console.log(`🎯 Perfil de madurez: ${companyProfile}\n`);
        console.log('👥 Generando respuestas de respondentes...\n');

        for (const respondent of RESPONDENTS) {
            let responses = buildKerznerResponses(companyProfile, respondent.sigma);
            Object.keys(responses).forEach(item => {
                responses[item] = Math.min(7, Math.max(1, Math.round(responses[item] + respondent.drift)));
            });

            await prisma.answer.create({
                data: {
                    assessmentId: assessment.id,
                    studentName: 'Andrés Vergara',
                    studentEmail: 'andres.vergara1@u.icesi.edu.co',
                    respondentName: respondent.name,
                    respondentPosition: respondent.position,
                    respondentEmail: respondent.name.toLowerCase().replace(/\s+/g, '.') + '@techproject.co',
                    responses: responses,
                    companyId: company.id
                }
            });

            const scores = Object.values(responses) as number[];
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            console.log(`   ✓ ${respondent.position}: ${respondent.name} - Promedio: ${avgScore.toFixed(2)}/7`);
        }

        console.log(`\n✅ ${RESPONDENTS.length} respuestas generadas correctamente\n`);
        console.log('📊 Resumen de datos generados:');
        console.log('================================');
        console.log(`Empresa: ${company.name}`);
        console.log('Instrumento: Kerzner PMMM (kerzner-2024)');
        console.log(`Respondentes: ${RESPONDENTS.length}`);
        console.log(`Perfil de Madurez: ${companyProfile}`);
        console.log('\n🔗 Accede al reporte en:');
        console.log(`   http://localhost:3000/reports/company/${company.id}?instrument=kerzner-2024`);
        console.log('================================\n');
    } catch (error) {
        console.error('❌ Error generando datos:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();