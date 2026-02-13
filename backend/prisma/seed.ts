import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

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

    // Create Kroh et al. 2020 Assessment
    const krohAssessment = await prisma.assessment.upsert({
        where: { id: 'kroh-2020' },
        update: {},
        create: {
            id: 'kroh-2020',
            title: 'Diagnóstico de Madurez Digital (Kroh et al. 2020)',
            description: 'Evaluación exhaustiva de microfundamentos digitales para organizaciones.',
            status: 'Activo'
        }
    });
    console.log('Assessment created:', krohAssessment.title);

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
