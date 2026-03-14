const API_URL = 'https://analistasql-production.up.railway.app';

async function testOrgCreation() {
    try {
        // 1. Login
        console.log('1. Iniciando sesión...');
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'andres.vergara1@u.icesi.edu.co',
                password: 'Prueba123*'
            })
        });

        const loginData = await loginRes.json();
        console.log('✅ Login exitoso');
        console.log(`   Usuario: ${loginData.user.name}`);
        console.log(`   Rol: ${loginData.user.role}`);
        console.log(`   Token (primeros 50 chars): ${loginData.token.substring(0, 50)}...`);

        // 2. Crear organización
        console.log('\n2. Creando organización de prueba...');
        const createRes = await fetch(`${API_URL}/api/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                name: 'Empresa de Prueba',
                legalId: '900123456-7',
                sector: 'Tecnología',
                size: 'Pyme (11-50 emp)',
                contactEmail: 'contacto@prueba.com'
            })
        });

        if (createRes.ok) {
            const orgData = await createRes.json();
            console.log('✅ Organización creada exitosamente!');
            console.log(`   ID: ${orgData.id}`);
            console.log(`   Nombre: ${orgData.name}`);
            console.log(`   NIT: ${orgData.legalId}`);
        } else {
            const errorData = await createRes.json();
            console.error('❌ Error al crear organización:');
            console.error(`   Status: ${createRes.status}`);
            console.error(`   Error:`, errorData);
        }

        // 3. Listar organizaciones
        console.log('\n3. Listando organizaciones...');
        const listRes = await fetch(`${API_URL}/api/organizations`, {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        if (listRes.ok) {
            const orgs = await listRes.json();
            console.log(`✅ Se encontraron ${orgs.length} organizaciones:`);
            orgs.forEach((org: any) => {
                console.log(`   - ${org.name} (${org.legalId})`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testOrgCreation();
