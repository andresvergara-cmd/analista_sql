import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Kroh data...\n');

    // Check companies
    const companies = await prisma.company.findMany({
        include: {
            answers: true
        }
    });

    console.log(`Total companies: ${companies.length}\n`);

    for (const company of companies) {
        console.log(`\n--- Company: ${company.name} (${company.id})`);
        console.log(`Total answers: ${company.answers.length}`);

        const krohAnswers = company.answers.filter(a => a.assessmentId === 'kroh-2020');
        console.log(`Kroh answers: ${krohAnswers.length}`);

        if (krohAnswers.length > 0) {
            krohAnswers.forEach(a => {
                console.log(`  - Answer ID: ${a.id}`);
                console.log(`    Assessment ID: ${a.assessmentId}`);
                console.log(`    Student: ${a.studentName} (${a.studentEmail})`);
                console.log(`    Respondent: ${a.respondentName}`);
                console.log(`    Submitted: ${a.submittedAt}`);
            });
        }
    }

    // Check all answers with kroh-2020
    console.log('\n\n=== All Kroh-2020 Answers ===');
    const allKrohAnswers = await prisma.answer.findMany({
        where: {
            assessmentId: 'kroh-2020'
        },
        include: {
            company: true,
            diagnosis: true
        }
    });

    console.log(`Total kroh-2020 answers: ${allKrohAnswers.length}\n`);

    allKrohAnswers.forEach(a => {
        console.log(`Answer ID: ${a.id}`);
        console.log(`  Company: ${a.company?.name || 'N/A'} (${a.companyId})`);
        console.log(`  Student: ${a.studentName} (${a.studentEmail})`);
        console.log(`  Respondent: ${a.respondentName}`);
        console.log(`  Has diagnosis: ${a.diagnosis ? 'Yes' : 'No'}`);
        console.log('');
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
