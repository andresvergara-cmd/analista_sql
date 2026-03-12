import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function resetPassword() {
    try {
        console.log('🔐 Reseteando contraseña del administrador...\n');

        const email = 'admin@icesi.edu.co';
        const newPassword = 'Admin123*';

        // Verificar que el usuario existe
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`❌ Usuario ${email} no encontrado`);
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
