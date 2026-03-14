import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function fixAndresTenant() {
    try {
        console.log('🔧 Moviendo Andrés Vergara al tenant correcto...\n');

        const andresEmail = 'andres.vergara1@u.icesi.edu.co';
        const targetTenant = 'default-tenant';

        // 1. Verificar que Andrés existe
        const andres = await prisma.user.findUnique({
            where: { email: andresEmail },
            include: { tenant: true }
        });

        if (!andres) {
            console.error('❌ Usuario no encontrado:', andresEmail);
            process.exit(1);
        }

        console.log('✓ Usuario encontrado:');
        console.log(`  Nombre: ${andres.name}`);
        console.log(`  Email: ${andres.email}`);
        console.log(`  Rol: ${andres.role}`);
        console.log(`  Tenant actual: ${andres.tenant.name} (${andres.tenantId})`);

        // 2. Actualizar tenant
        const updated = await prisma.user.update({
            where: { email: andresEmail },
            data: { tenantId: targetTenant },
            include: { tenant: true }
        });

        console.log('\n✅ Usuario movido exitosamente!');
        console.log(`  Nuevo tenant: ${updated.tenant.name} (${updated.tenantId})`);

        // 3. Verificar resultado
        const allUsersInTenant = await prisma.user.count({
            where: { tenantId: targetTenant }
        });

        console.log(`\n📊 Total de usuarios en "${updated.tenant.name}": ${allUsersInTenant}`);

        // 4. Listar super admins
        const superAdmins = await prisma.user.findMany({
            where: {
                tenantId: targetTenant,
                role: 'SUPERADMIN'
            },
            select: {
                name: true,
                email: true
            }
        });

        console.log(`\n👑 Super Administradores en el tenant:`);
        superAdmins.forEach(admin => {
            console.log(`  - ${admin.name} (${admin.email})`);
        });

        console.log('\n✓ Ahora todos los usuarios están en el mismo tenant y deberían ser visibles.');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fixAndresTenant();
