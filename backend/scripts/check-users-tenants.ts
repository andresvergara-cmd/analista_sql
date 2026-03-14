import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function checkUsersTenants() {
    try {
        console.log('📊 Verificando usuarios y tenants...\n');

        // 1. Listar todos los tenants
        const tenants = await prisma.tenant.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                _count: {
                    select: { users: true }
                }
            }
        });

        console.log(`📁 TENANTS (${tenants.length} total):`);
        console.log('='.repeat(80));
        tenants.forEach(tenant => {
            console.log(`\nTenant ID: ${tenant.id}`);
            console.log(`Nombre: ${tenant.name}`);
            console.log(`Usuarios: ${tenant._count.users}`);
            console.log(`Creado: ${tenant.createdAt.toLocaleDateString()}`);
        });

        // 2. Listar todos los usuarios agrupados por tenant
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                tenant: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: [
                { tenantId: 'asc' },
                { role: 'asc' },
                { name: 'asc' }
            ]
        });

        console.log(`\n\n👥 USUARIOS (${users.length} total):`);
        console.log('='.repeat(80));

        let currentTenantId = '';
        users.forEach(user => {
            if (user.tenantId !== currentTenantId) {
                currentTenantId = user.tenantId;
                console.log(`\n📂 Tenant: ${user.tenant.name} (${user.tenantId})`);
                console.log('-'.repeat(80));
            }
            const roleColor = user.role === 'SUPERADMIN' ? '🔴' : user.role === 'PROFESSOR' ? '🟡' : '🟢';
            console.log(`   ${roleColor} ${user.name.padEnd(40)} ${user.email.padEnd(35)} [${user.role}]`);
        });

        // 3. Identificar problemas
        console.log('\n\n🔍 ANÁLISIS:');
        console.log('='.repeat(80));

        const superAdmins = users.filter(u => u.role === 'SUPERADMIN');
        console.log(`\n✓ Super Administradores: ${superAdmins.length}`);
        superAdmins.forEach(u => console.log(`  - ${u.name} (${u.email})`));

        const usersByTenant = users.reduce((acc, user) => {
            acc[user.tenant.name] = (acc[user.tenant.name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log(`\n✓ Distribución por Tenant:`);
        Object.entries(usersByTenant).forEach(([tenant, count]) => {
            console.log(`  - ${tenant}: ${count} usuarios`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsersTenants();
