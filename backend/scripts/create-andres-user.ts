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

async function createUser() {
    try {
        console.log('👤 Creando usuario Andrés Vergara...\n');

        const email = 'andres.vergara1@u.icesi.edu.co';
        const password = 'Prueba123*';
        const name = 'Andrés Vergara';
        const role = 'SUPERADMIN'; // Rol de superadmin para tener todos los permisos

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('⚠️  Usuario ya existe. Actualizando contraseña...');
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: role
                }
            });

            console.log('✅ Usuario actualizado correctamente!');
        } else {
            // Buscar o crear tenant por defecto
            let tenant = await prisma.tenant.findFirst({
                where: { name: 'Universidad ICESI' }
            });

            if (!tenant) {
                console.log('📚 Creando tenant Universidad ICESI...');
                tenant = await prisma.tenant.create({
                    data: {
                        name: 'Universidad ICESI'
                    }
                });
                console.log(`✅ Tenant creado con ID: ${tenant.id}`);
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Crear usuario
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role,
                    tenantId: tenant.id
                }
            });

            console.log('✅ Usuario creado exitosamente!');
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Nombre: ${user.name}`);
            console.log(`   Rol: ${user.role}`);
            console.log(`   Tenant: ${tenant.name}`);
        }

        console.log('\n📋 Credenciales de acceso:');
        console.log('====================================');
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${password}`);
        console.log('====================================');
        console.log('\n🌐 Puedes iniciar sesión en:');
        console.log('   https://analista-sql.vercel.app/login');
        console.log('====================================\n');

    } catch (error) {
        console.error('❌ Error al crear usuario:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
