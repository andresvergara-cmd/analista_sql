import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // Clear existing data to avoid duplicates
    await prisma.report.deleteMany({});
    await prisma.diagnosis.deleteMany({});
    await prisma.answer.deleteMany({});
    await prisma.company.deleteMany({});
    // We keep Tenant and User for now as they are upserted or core

    // Create Default Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'default-tenant' },
        update: {},
        create: {
            id: 'default-tenant',
            name: 'Universidad Icesi - Administrador',
        },
    });
    console.log('Tenant created:', tenant.name);

    // Create Super Admin User
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@icesi.edu.co' },
        update: {},
        create: {
            email: 'admin@icesi.edu.co',
            password: 'admin_password_123', // In real app, this should be hashed
            name: 'Administrador General',
            role: 'SUPERADMIN',
            tenantId: tenant.id,
        },
    });
    console.log('Super Admin user created:', superAdmin.email);

    // Create a Sample Organization linked to the tenant
    const sampleOrg = await prisma.company.create({
        data: {
            name: 'Pyme Alpha Logistics',
            legalId: '900.123.456-1',
            sector: 'Transporte y Logística',
            size: 'Mediana (51-200)',
            contactEmail: 'gerencia@alphalogistics.co',
            tenantId: tenant.id,
        }
    });
    console.log('Sample organization created:', sampleOrg.name);

    // Create Kroh et al. 2020 + Angelshaug 2025 Assessment
    const krohAssessment = await prisma.assessment.upsert({
        where: { id: 'kroh-2020' },
        update: {},
        create: {
            id: 'kroh-2020',
            title: 'Diagnóstico de Madurez Digital (Kroh et al. 2020 + Angelshaug 2025)',
            tenantId: tenant.id,
            questions: {} // Initial empty questions
        }
    });
    console.log('Assessment created:', krohAssessment.title);

    // Create Sample Answer
    const sampleAnswer = await prisma.answer.create({
        data: {
            assessmentId: krohAssessment.id,
            studentName: 'Andrés Vergara',
            studentEmail: 'andres.vergara@example.com',
            respondentName: 'Juan Pérez',
            respondentPosition: 'Gerente TI',
            respondentEmail: 'juan.perez@alphalogistics.co',
            responses: { "DMI1": 4, "DMI2": 5, "DIF1": 3 },
            companyId: sampleOrg.id,
        }
    });
    console.log('Sample answer created for:', sampleAnswer.respondentName);

    // Create Sample Diagnosis
    await prisma.diagnosis.create({
        data: {
            assessmentId: krohAssessment.id,
            studentEmail: 'andres.vergara@example.com',
            answerId: sampleAnswer.id,
            score: 4.2,
            result: JSON.stringify({
                foundations: [
                    { id: 'DIF', name: 'Digital Focus', score: 80, average: 4.0 },
                    { id: 'DIP', name: 'Digital Innovation Process', score: 90, average: 4.5 },
                    { id: 'DMI', name: 'Digital Mindset', score: 85, average: 4.25 },
                    { id: 'DIN', name: 'Digital Innovation Network', score: 70, average: 3.5 },
                    { id: 'DTC', name: 'Digital Tech Capability', score: 82, average: 4.1 },
                    { id: 'DMA', name: 'Data Management', score: 78, average: 3.9 },
                    { id: 'DIR', name: 'Overcoming Resistance', score: 92, average: 4.6 }
                ]
            })
        }
    });
    console.log('Sample diagnosis created with all dimensions.');

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
