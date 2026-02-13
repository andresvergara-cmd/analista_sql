
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Fix relative path for internal modules if needed (none used here)


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const companyCount = await prisma.company.count();
        const answerCount = await prisma.answer.count();
        const companies = await prisma.company.findMany({ select: { name: true } });

        console.log('--- DB CHECK ---');
        console.log(`Companies: ${companyCount}`);
        companies.forEach(c => console.log(` - ${c.name}`));
        console.log(`Answers: ${answerCount}`);
        console.log('----------------');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
