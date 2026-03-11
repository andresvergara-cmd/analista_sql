/**
 * Script para regenerar diagnósticos Kerzner con la lógica correcta
 * y agregar datos variados para empresas existentes.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { calculateKerznerMaturity, generateKerznerRecommendations, generateKerznerRoadmap } from '../src/utils/kerzner-logic';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

// Helper: jitter for Kerzner 7-point scale
const jitter = (base: number, sigma = 0.8): number =>
    Math.min(7, Math.max(1, Math.round(base + (Math.random() - 0.5) * 2 * sigma)));

const KERZNER_ITEMS = ['K1','K2','K3','K4','K5','K6','K7','K8','K9','K10','K11','K12','K13','K14','K15','K16','K17','K18','K19','K20'];

type Profile = 'high' | 'medium' | 'developing' | 'initial';

const PROFILES: Record<Profile, Record<string, number>> = {
    high:       { K1: 6.3, K2: 6.1, K3: 6.0, K4: 5.8, K5: 6.2, K6: 5.9, K7: 6.0, K8: 5.7, K9: 6.1, K10: 5.8, K11: 5.5, K12: 5.7, K13: 5.6, K14: 5.4, K15: 5.8, K16: 5.3, K17: 5.5, K18: 5.2, K19: 5.0, K20: 5.4 },
    medium:     { K1: 4.8, K2: 4.5, K3: 4.3, K4: 4.6, K5: 4.4, K6: 4.2, K7: 4.0, K8: 4.3, K9: 4.1, K10: 3.9, K11: 3.8, K12: 4.0, K13: 3.7, K14: 3.9, K15: 4.1, K16: 3.5, K17: 3.7, K18: 3.4, K19: 3.6, K20: 3.3 },
    developing: { K1: 3.5, K2: 3.2, K3: 3.0, K4: 3.3, K5: 3.1, K6: 2.8, K7: 2.9, K8: 3.0, K9: 2.7, K10: 2.5, K11: 2.3, K12: 2.5, K13: 2.4, K14: 2.2, K15: 2.6, K16: 2.0, K17: 2.2, K18: 2.1, K19: 1.9, K20: 2.3 },
    initial:    { K1: 2.2, K2: 2.0, K3: 1.8, K4: 2.1, K5: 1.9, K6: 1.7, K7: 1.8, K8: 1.6, K9: 1.9, K10: 1.5, K11: 1.3, K12: 1.5, K13: 1.4, K14: 1.2, K15: 1.6, K16: 1.1, K17: 1.3, K18: 1.2, K19: 1.0, K20: 1.4 },
};

function buildResponses(profile: Profile, sigma: number, drift: number): Record<string, number> {
    const responses: Record<string, number> = {};
    KERZNER_ITEMS.forEach(item => {
        const base = PROFILES[profile][item] || 4;
        responses[item] = jitter(base + drift, sigma);
    });
    return responses;
}

// Companies to generate/fix Kerzner data for
const COMPANY_PROFILES: { companyId: string; profile: Profile }[] = [
    // Existing Kerzner companies (will fix their diagnoses)
    { companyId: '3822df78-a296-4a4c-8999-20c83ec3e7e7', profile: 'high' },        // Constructora Andes
    { companyId: 'bd241045-0f89-4d03-abf3-3395e7268283', profile: 'medium' },      // Consultores PM
    { companyId: 'ce6ccace-d45d-4e41-91bc-ef1bbe6dd53b', profile: 'developing' },  // Industrias Meta
    { companyId: '0af4d588-2218-4222-9ade-4dd50269d857', profile: 'high' },        // TechDev Solutions
    { companyId: '21aaf11f-d792-4a90-8845-0998416ff4a4', profile: 'initial' },     // Comercio Express
    { companyId: 'c1234567-89ab-cdef-0123-456789abcdef', profile: 'medium' },      // TechProject
];

const RESPONDENT_DRIFTS = [0.4, 0.2, 0.0, -0.1, -0.2, -0.3, -0.4];

async function main() {
    console.log('Regenerando diagnósticos Kerzner con lógica correcta...\n');

    let totalFixed = 0;
    let totalCreated = 0;

    for (const { companyId, profile } of COMPANY_PROFILES) {
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
            console.log(`  SKIP: Empresa ${companyId} no encontrada`);
            continue;
        }

        console.log(`\n--- ${company.name} (perfil: ${profile}) ---`);

        const answers = await prisma.answer.findMany({
            where: { companyId, assessmentId: 'kerzner-2024' },
            include: { diagnosis: true },
            orderBy: { submittedAt: 'asc' },
        });

        if (answers.length === 0) {
            console.log('  Sin respuestas Kerzner, omitiendo');
            continue;
        }

        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const drift = RESPONDENT_DRIFTS[i % RESPONDENT_DRIFTS.length];

            // Regenerate realistic responses
            const newResponses = buildResponses(profile, 0.7 + (i * 0.05), drift);

            // Update the answer responses
            await prisma.answer.update({
                where: { id: answer.id },
                data: { responses: newResponses },
            });

            // Calculate Kerzner maturity with the proper logic
            const maturityResult = calculateKerznerMaturity(newResponses);
            const recommendations = generateKerznerRecommendations(maturityResult.dimensions);
            const roadmap = generateKerznerRoadmap(maturityResult.dimensions, maturityResult.globalScore);

            const diagnosisResult = {
                dimensions: maturityResult.dimensions,
                globalScore: maturityResult.globalScore,
                globalPercentage: maturityResult.globalPercentage,
                maturityLevel: maturityResult.maturityLevel,
                status: maturityResult.status,
                recommendations,
                roadmap,
            };

            if (answer.diagnosis) {
                // Update existing diagnosis
                await prisma.diagnosis.update({
                    where: { id: answer.diagnosis.id },
                    data: {
                        result: JSON.stringify(diagnosisResult),
                        score: maturityResult.globalScore,
                    },
                });
                totalFixed++;
            } else {
                // Create new diagnosis
                await prisma.diagnosis.create({
                    data: {
                        assessmentId: 'kerzner-2024',
                        studentEmail: answer.studentEmail,
                        answerId: answer.id,
                        result: JSON.stringify(diagnosisResult),
                        score: maturityResult.globalScore,
                    },
                });
                totalCreated++;
            }

            const respondent = answer.respondentName || answer.studentName;
            console.log(`  ${answer.diagnosis ? 'FIX' : 'NEW'}: ${respondent} => Score: ${maturityResult.globalScore}/7 (${maturityResult.maturityLevel})`);
        }
    }

    console.log('\n========================================');
    console.log(`Diagnósticos corregidos: ${totalFixed}`);
    console.log(`Diagnósticos creados: ${totalCreated}`);
    console.log(`Total procesados: ${totalFixed + totalCreated}`);
    console.log('========================================\n');

    await prisma.$disconnect();
    await pool.end();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
