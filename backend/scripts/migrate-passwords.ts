import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

async function migratePasswords() {
  console.log('🔐 Iniciando migración de contraseñas...\n');

  try {
    // 1. Obtener todos los usuarios
    const users = await prisma.user.findMany();
    console.log(`📊 Encontrados ${users.length} usuarios en la base de datos.\n`);

    // 2. Identificar cuáles ya tienen hash
    const plainPasswordUsers = users.filter(user => {
      // Los hashes de bcrypt siempre empiezan con "$2a$" o "$2b$"
      return !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$');
    });

    console.log(`⚠️  ${plainPasswordUsers.length} usuarios con contraseña en texto plano.`);
    console.log(`✅ ${users.length - plainPasswordUsers.length} usuarios ya tienen hash.\n`);

    if (plainPasswordUsers.length === 0) {
      console.log('✅ Todas las contraseñas ya están hasheadas. No se requiere acción.\n');
      return;
    }

    // 3. Hashear las contraseñas en texto plano
    console.log('🔄 Hasheando contraseñas...\n');

    const originalPasswords: { email: string; password: string }[] = [];

    for (const user of plainPasswordUsers) {
      const plainPassword = user.password;
      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      originalPasswords.push({ email: user.email, password: plainPassword });

      console.log(`✅ Usuario: ${user.email}`);
      console.log(`   Antes:  ${plainPassword}`);
      console.log(`   Después: ${hashedPassword.substring(0, 30)}...\n`);
    }

    console.log('✅ Migración completada exitosamente!\n');
    console.log('⚠️  IMPORTANTE: Guarda las contraseñas originales en un lugar seguro:');
    console.log('====================================================================');
    originalPasswords.forEach(({ email, password }) => {
      console.log(`   ${email} → ${password}`);
    });
    console.log('====================================================================\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

migratePasswords()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
