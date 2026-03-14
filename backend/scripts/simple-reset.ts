import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

const SALT_ROUNDS = 10;

async function resetPassword() {
    try {
        console.log('🔐 Reseteando contraseña del usuario...\n');

        const email = 'andres.vergara1@u.icesi.edu.co';
        const newPassword = 'Prueba123*';

        // Verificar que el usuario existe
        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (!user) {
            console.error(`❌ Usuario ${email} no encontrado`);
            console.log('\n📝 Usuarios existentes en la base de datos:');
            const allUsers = await prisma.user.findMany({
                select: { email: true, name: true, role: true }
            });
            allUsers.forEach(u => console.log(`   - ${u.email} (${u.name}) - ${u.role}`));
            process.exit(1);
        }

        console.log(`📧 Usuario encontrado: ${user.name} (${user.email})`);
        console.log(`🔑 Nueva contraseña: ${newPassword}`);

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        console.log(`🔒 Hash generado (primeros 20 chars): ${hashedPassword.substring(0, 20)}...`);

        // Actualizar contraseña
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        console.log('\n✅ Contraseña actualizada correctamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log('====================================');
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${newPassword}`);
        console.log('====================================\n');

    } catch (error) {
        console.error('❌ Error al resetear contraseña:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
