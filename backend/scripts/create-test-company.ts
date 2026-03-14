import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function createTestCompanyAndAssignUsers() {
    try {
        console.log('🏢 Creando organización de prueba...\n');

        const tenantId = 'default-tenant';

        // 1. Verificar si ya existe una organización de prueba
        const existingCompany = await prisma.company.findFirst({
            where: {
                name: 'Empresa Prueba - ICESI',
                tenantId: tenantId
            }
        });

        let company;
        if (existingCompany) {
            console.log('✓ La organización ya existe, la usaré:');
            company = existingCompany;
        } else {
            // Crear organización de prueba
            company = await prisma.company.create({
                data: {
                    name: 'Empresa Prueba - ICESI',
                    legalId: '900.999.999-9',
                    sector: 'Educación',
                    size: 'Grande (+200 emp)',
                    contactEmail: 'pruebas@icesi.edu.co',
                    address: 'Calle 18 #122-135',
                    city: 'Cali',
                    status: 'Activo',
                    tenantId: tenantId
                }
            });

            console.log('✅ Organización creada:');
        }

        console.log(`  ID: ${company.id}`);
        console.log(`  Nombre: ${company.name}`);
        console.log(`  NIT: ${company.legalId}`);
        console.log(`  Sector: ${company.sector}`);
        console.log(`  Tamaño: ${company.size}`);

        // 2. Obtener todos los usuarios del tenant
        const users = await prisma.user.findMany({
            where: { tenantId: tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        console.log(`\n👥 Usuarios encontrados: ${users.length}`);

        // 3. Asignar acceso a todos los usuarios
        console.log('\n📝 Asignando acceso a usuarios...\n');

        let createdCount = 0;
        let existingCount = 0;

        for (const user of users) {
            // Verificar si ya tiene acceso
            const existingAccess = await prisma.userCompanyAccess.findUnique({
                where: {
                    userId_companyId: {
                        userId: user.id,
                        companyId: company.id
                    }
                }
            });

            if (existingAccess) {
                console.log(`  ⚪ ${user.name.padEnd(40)} - Ya tiene acceso`);
                existingCount++;
            } else {
                // Crear acceso con todos los permisos
                await prisma.userCompanyAccess.create({
                    data: {
                        userId: user.id,
                        companyId: company.id,
                        canSurvey: true,        // Puede aplicar encuestas/instrumentos
                        canViewReports: true,    // Puede ver reportes
                        canRunQueries: user.role === 'SUPERADMIN', // Solo admins pueden ejecutar SQL
                        grantedBy: 'SYSTEM'
                    }
                });

                const permissions = [
                    '✓ Encuestar',
                    '✓ Ver reportes',
                    user.role === 'SUPERADMIN' ? '✓ Ejecutar SQL' : '✗ Ejecutar SQL'
                ].join(', ');

                console.log(`  ✅ ${user.name.padEnd(40)} - ${permissions}`);
                createdCount++;
            }
        }

        // 4. Resumen
        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMEN:');
        console.log('='.repeat(80));
        console.log(`\n✓ Organización: ${company.name}`);
        console.log(`✓ Usuarios con acceso: ${users.length}`);
        console.log(`  - Nuevos accesos creados: ${createdCount}`);
        console.log(`  - Accesos existentes: ${existingCount}`);

        // 5. Verificar distribución por rol
        const studentCount = users.filter(u => u.role === 'STUDENT').length;
        const professorCount = users.filter(u => u.role === 'PROFESSOR').length;
        const adminCount = users.filter(u => u.role === 'SUPERADMIN').length;

        console.log(`\n✓ Distribución por rol:`);
        console.log(`  - Estudiantes: ${studentCount} (pueden encuestar y ver reportes)`);
        console.log(`  - Profesores: ${professorCount} (pueden encuestar y ver reportes)`);
        console.log(`  - Super Admins: ${adminCount} (todos los permisos)`);

        console.log('\n✅ Todos los usuarios ahora pueden aplicar instrumentos en esta empresa.\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createTestCompanyAndAssignUsers();
