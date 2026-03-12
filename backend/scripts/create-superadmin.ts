import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    const email = 'palandaeta@icesi.edu.co';
    const password = 'Prueba123*';
    const name = 'Palandaeta Administrator';
    const role = 'SUPERADMIN';

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('⚠️  Usuario ya existe. Actualizando contraseña y rol...');

            const hashedPassword = await hashPassword(password);
            const updated = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: role,
                    name: name
                }
            });

            console.log('✅ Usuario actualizado exitosamente:');
            console.log('   Email:', updated.email);
            console.log('   Nombre:', updated.name);
            console.log('   Rol:', updated.role);
            console.log('   ID:', updated.id);
        } else {
            const hashedPassword = await hashPassword(password);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role,
                    tenantId: 'default-tenant'
                }
            });

            console.log('✅ Superadministrador creado exitosamente:');
            console.log('   Email:', user.email);
            console.log('   Nombre:', user.name);
            console.log('   Rol:', user.role);
            console.log('   ID:', user.id);
        }

        console.log('\n📋 Credenciales de acceso:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('\n🌐 Puedes iniciar sesión en:');
        console.log('   Local: http://localhost:3000/login');
        console.log('   Vercel: https://analista-sql.vercel.app/login');

    } catch (error: any) {
        console.error('❌ Error al crear usuario:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
