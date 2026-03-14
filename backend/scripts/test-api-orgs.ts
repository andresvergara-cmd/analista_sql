// Test what the API returns for organizations
async function test() {
    // First, login to get token
    const loginRes = await fetch('https://analistasql-production.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'andres.vergara1@u.icesi.edu.co',
            password: 'Prueba123*'
        })
    });

    const loginData = await loginRes.json();
    console.log('Login successful:', loginData.user.email);
    const token = loginData.token;

    // Now fetch organizations
    const orgsRes = await fetch('https://analistasql-production.up.railway.app/api/organizations', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const orgsData = await orgsRes.json();
    console.log('\n=== Organizations Response ===');
    console.log(JSON.stringify(orgsData, null, 2));

    console.log('\n=== Checking for Kroh Answers ===');
    orgsData.forEach((org: any) => {
        console.log(`\nOrg: ${org.name}`);
        console.log(`  Has answers property: ${org.answers !== undefined}`);
        console.log(`  Answers count: ${org.answers?.length || 0}`);

        if (org.answers && org.answers.length > 0) {
            console.log(`  Answer details:`);
            org.answers.forEach((a: any, i: number) => {
                console.log(`    ${i + 1}. ID: ${a.id}`);
                console.log(`       assessmentId: ${a.assessmentId}`);
                console.log(`       studentEmail: ${a.studentEmail}`);
            });

            const krohAnswers = org.answers.filter((a: any) => a.assessmentId === 'kroh-2020');
            console.log(`  Kroh answers: ${krohAnswers.length}`);
        }
    });
}

test().catch(console.error);
