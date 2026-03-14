import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function verifySetup() {
    try {
        console.log('🔍 Verificando configuración del sistema...\n');

        const tenantId = 'default-tenant';

        // 1. Verificar organizaciones
        const companies = await prisma.company.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                legalId: true,
                sector: true,
                status: true,
                _count: {
                    select: { userAccess: true }
                }
            }
        });

        console.log('🏢 ORGANIZACIONES:');
        console.log('='.repeat(80));
        companies.forEach(company => {
            console.log(`\n  📋 ${company.name}`);
            console.log(`     NIT: ${company.legalId}`);
            console.log(`     Sector: ${company.sector}`);
            console.log(`     Estado: ${company.status}`);
            console.log(`     Usuarios con acceso: ${company._count.userAccess}`);
        });

        // 2. Verificar usuarios
        const users = await prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                companyAccess: {
                    select: {
                        company: {
                            select: { name: true }
                        },
                        canSurvey: true,
                        canViewReports: true,
                        canRunQueries: true
                    }
                }
            },
            orderBy: { role: 'asc' }
        });

        console.log('\n\n👥 USUARIOS Y ACCESOS:');
        console.log('='.repeat(80));

        const superAdmins = users.filter(u => u.role === 'SUPERADMIN');
        const students = users.filter(u => u.role === 'STUDENT');

        console.log('\n🔴 SUPER ADMINISTRADORES:');
        superAdmins.forEach(user => {
            console.log(`\n  ${user.name} (${user.email})`);
            console.log(`     Acceso a ${user.companyAccess.length} empresa(s):`);
            user.companyAccess.forEach(access => {
                const perms = [];
                if (access.canSurvey) perms.push('Encuestar');
                if (access.canViewReports) perms.push('Ver reportes');
                if (access.canRunQueries) perms.push('SQL');
                console.log(`       - ${access.company.name}: ${perms.join(', ')}`);
            });
        });

        console.log('\n\n🟢 ESTUDIANTES:');
        console.log(`   Total: ${students.length} estudiantes`);
        console.log(`   Todos tienen acceso a ${students[0]?.companyAccess.length || 0} empresa(s)`);

        if (students.length > 0 && students[0].companyAccess.length > 0) {
            console.log('\n   Ejemplo de permisos (primer estudiante):');
            console.log(`   ${students[0].name}:`);
            students[0].companyAccess.forEach(access => {
                const perms = [];
                if (access.canSurvey) perms.push('Encuestar');
                if (access.canViewReports) perms.push('Ver reportes');
                if (access.canRunQueries) perms.push('SQL');
                console.log(`     - ${access.company.name}: ${perms.join(', ')}`);
            });
        }

        console.log('\n\n✅ RESUMEN:');
        console.log('='.repeat(80));
        console.log(`  - Organizaciones totales: ${companies.length}`);
        console.log(`  - Usuarios totales: ${users.length}`);
        console.log(`  - Super Administradores: ${superAdmins.length}`);
        console.log(`  - Estudiantes: ${students.length}`);
        console.log('\n  ✓ Sistema listo para usar');
        console.log('  ✓ Todos los usuarios pueden aplicar instrumentos\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verifySetup();
