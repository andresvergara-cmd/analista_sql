import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const answers = await prisma.answer.findMany({
            include: {
                company: true,
                diagnosis: true
            },
            orderBy: { submittedAt: 'desc' }
        });
        console.log('Success:', answers.length, 'answers found');
    } catch (error: any) {
        console.error('FULL ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
