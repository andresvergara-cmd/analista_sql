import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Lista de estudiantes (sin Andres Vergara y Paola Landaeta que ya existen)
const students = [
  { name: 'Max Aguirre Calle', email: 'niagui317@gmail.com' },
  { name: 'Maria Fernanda Amorocho Camargo', email: 'mariaamorocho01@gmail.com' },
  { name: 'Thomas Azcarate Rivera', email: 'thomasazcarater@gmail.com' },
  { name: 'Juan Esteban Calero Arana', email: 'juanestebancaleroarana@gmail.com' },
  { name: 'Sara Camacho', email: 'camachomsara@gmail.com' },
  { name: 'Gabriel Sebastian Estrada Revelo', email: 'gabriel19191419@hotmail.com' },
  { name: 'Nicolas Garcia Martinez', email: 'anamile.mb@gmail.com' },
  { name: 'Mariana Guzman Rojas', email: 'mariana.guzmanrojas@u.icesi.edu.co' },
  { name: 'Juan Felipe Mayorga Reyes', email: 'flxxd14@gmail.com' },
  { name: 'Juan Jose Molina Tabares', email: 'creadorcuentasmolina@gmail.com' },
  { name: 'Juan Fernando Moreno Marin', email: 'juanfernandomorenomarin123@gmail.com' },
  { name: 'David Felipe Moreno Torres', email: 'davidfelipemorenotorres@gmail.com' },
  { name: 'Juan Jacobo Ocampo Molinares', email: 'jacocampo06@gmail.com' },
  { name: 'Juan Sebastian Parada Casañas', email: 'arrobajuanse@gmail.com' },
  { name: 'Christian David Patiño Ortiz', email: 'christiandpo0529@gmail.com' },
  { name: 'Daniel Paz Palacios', email: 'pazdaniel5465@gmail.com' },
  { name: 'Jacobo Penilla Mosquera', email: 'jacobopenilla@gmail.com' },
  { name: 'Mateo Puertas Angulo', email: 'Matepuertas@gmail.com' },
  { name: 'Juliana Restrepo Suarez', email: 'julianarestrepo2006@hotmail.com' },
  { name: 'Laura Sofia Reyes Garces', email: 'lauragarces112007@gmail.com' },
  { name: 'Ian Salvador Roman Salazar', email: 'iansalvadorroman@gmail.com' },
  { name: 'Laura Sofia Trujillo Escobar', email: 'laurasofiatrujilloescobar@gmail.com' }
];

// Contraseña temporal para todos los estudiantes
const TEMP_PASSWORD = 'Icesi2024*';

async function createStudents() {
  console.log('🎓 Creando usuarios estudiantes...\n');
  console.log('='.repeat(70));

  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);

  const createdUsers: any[] = [];
  const errors: any[] = [];

  for (const student of students) {
    try {
      // Verificar si el usuario ya existe
      const existing = await prisma.user.findUnique({
        where: { email: student.email }
      });

      if (existing) {
        console.log(`⚠️  Usuario ya existe: ${student.email}`);
        errors.push({ student, error: 'Ya existe' });
        continue;
      }

      // Crear usuario
      const user = await prisma.user.create({
        data: {
          email: student.email,
          password: hashedPassword,
          name: student.name,
          role: 'STUDENT',
          tenantId: 'default-tenant'
        }
      });

      createdUsers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      console.log(`✅ Creado: ${student.name} (${student.email})`);
    } catch (error: any) {
      console.log(`❌ Error creando ${student.email}: ${error.message}`);
      errors.push({ student, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 RESUMEN:\n`);
  console.log(`✅ Usuarios creados: ${createdUsers.length}`);
  console.log(`❌ Errores: ${errors.length}`);
  console.log(`📋 Total procesados: ${students.length}`);

  if (createdUsers.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('🔑 CREDENCIALES DE ACCESO\n');
    console.log('Contraseña temporal para TODOS los estudiantes:');
    console.log(`   ${TEMP_PASSWORD}\n`);
    console.log('URL del sistema:');
    console.log('   https://analista-sql.vercel.app\n');
    console.log('Usuarios creados:');
    createdUsers.forEach((user, idx) => {
      console.log(`   ${idx + 1}. ${user.email}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  ERRORES:\n');
    errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.student.email}: ${err.error}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Proceso completado\n');

  await prisma.$disconnect();
}

createStudents().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
