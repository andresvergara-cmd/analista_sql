const http = require('http');

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Y2NjN2VlMy1hNmU3LTQ4OTEtYmFlMC1iNzZiMDdjMTJlNWEiLCJlbWFpbCI6ImFuZHJlcy52ZXJnYXJhMUB1LmljZXNpLmVkdS5jbyIsIm5hbWUiOiJBTkRSRVMgVkVSR0FSQSIsInJvbGUiOiJTVVBFUkFETUlOIiwidGVuYW50SWQiOiJkZWZhdWx0LXRlbmFudCIsImlhdCI6MTc3MzI0MTcxMCwiZXhwIjoxNzczODQ2NTEwfQ.Y0mWEB6v8KdB6RjIxWg4_sAakONM9ZNE0JveHdU_IlM";

function makeRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + TOKEN
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error('Status ' + res.statusCode + ': ' + body));
                    }
                } catch (e) {
                    reject(new Error('Parse error: ' + body));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

function jitter(base, sigma) {
    sigma = sigma || 0.7;
    return Math.min(7, Math.max(1, Math.round(base + (Math.random() - 0.5) * 2 * sigma)));
}

async function main() {
    try {
        console.log('🚀 Generando datos para Kerzner PMMM\n');

        console.log('📊 Creando empresa...');
        const company = await makeRequest('POST', '/api/organizations', {
            name: 'TechProject Solutions S.A.S',
            legalId: '900.555.777-9',
            sector: 'Tecnología y Consultoría',
            size: 'Grande (+200 emp)',
            contactEmail: 'proyectos@techproject.co'
        });
        console.log('✅ Empresa creada: ' + company.name + ' (ID: ' + company.id + ')\n');

        const bases = { K1: 4.8, K2: 4.5, K3: 4.2, K4: 3.8 };
        const respondents = [
            { position: 'CEO / Gerente General', name: 'Carlos Rodriguez', drift: 0.4 },
            { position: 'Director PMO', name: 'Maria Fernandez', drift: 0.2 },
            { position: 'Gerente de Proyectos', name: 'Luis Martinez', drift: 0.0 },
            { position: 'Lider de Proyecto Senior', name: 'Ana Garcia', drift: -0.1 },
            { position: 'Project Manager', name: 'Jorge Lopez', drift: -0.2 },
            { position: 'Coordinador de Proyectos', name: 'Patricia Herrera', drift: -0.3 },
            { position: 'Analista PMO', name: 'Ricardo Torres', drift: -0.4 }
        ];

        console.log('👥 Generando respuestas...\n');

        for (let i = 0; i < respondents.length; i++) {
            const resp = respondents[i];
            const responses = {};
            
            for (let k = 1; k <= 5; k++) responses['K' + k] = Math.min(7, Math.max(1, jitter(bases.K1) + Math.round(resp.drift)));
            for (let k = 6; k <= 10; k++) responses['K' + k] = Math.min(7, Math.max(1, jitter(bases.K2) + Math.round(resp.drift)));
            for (let k = 11; k <= 15; k++) responses['K' + k] = Math.min(7, Math.max(1, jitter(bases.K3) + Math.round(resp.drift)));
            for (let k = 16; k <= 20; k++) responses['K' + k] = Math.min(7, Math.max(1, jitter(bases.K4) + Math.round(resp.drift)));

            await makeRequest('POST', '/api/submit-answer', {
                assessmentId: 'kerzner-2024',
                studentName: 'Andrés Vergara',
                studentEmail: 'andres.vergara1@u.icesi.edu.co',
                respondentName: resp.name,
                respondentPosition: resp.position,
                respondentEmail: resp.name.toLowerCase().replace(/\s+/g, '.') + '@techproject.co',
                responses: responses,
                companyId: company.id
            });

            const values = Object.values(responses);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            console.log('   ✓ ' + resp.position + ': ' + resp.name + ' - Promedio: ' + avg.toFixed(2) + '/7');
        }

        console.log('\n✅ ' + respondents.length + ' respuestas generadas\n');
        console.log('📊 Resumen:');
        console.log('================================');
        console.log('Empresa: TechProject Solutions S.A.S');
        console.log('Instrumento: Kerzner PMMM');
        console.log('Respondentes: ' + respondents.length);
        console.log('\n🔗 Ver reporte en:');
        console.log('   http://localhost:3000/reports/company/' + company.id + '?instrument=kerzner-2024');
        console.log('================================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
