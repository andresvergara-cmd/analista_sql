import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function resetPassword() {
    try {
        console.log('🔐 Reseteando contraseña del usuario...\n');

        const email = 'andres.vergara1@u.icesi.edu.co';
        const newPassword = 'Prueba123*';

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
        await pool.end();
    }
}

resetPassword();
