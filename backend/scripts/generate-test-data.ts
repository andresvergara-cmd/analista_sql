import axios from 'axios';

const BACKEND_URL = 'http://localhost:3001/api';

async function generateTestData() {
    try {
        console.log('--- GENERATING SYNTHETIC TEST DATA ---');

        // 1. Create Company
        console.log('1. Creating Company: Logística Industrial S.A.');
        const orgRes: any = await axios.post(`${BACKEND_URL}/organizations`, {
            name: 'Logística Industrial S.A.',
            legalId: '900.123.456-1',
            sector: 'Logística y Transporte',
            size: 'Grande',
            contactEmail: 'gerencia@logistica-industrial.com'
        });
        const companyId = orgRes.data.organization.id;
        console.log(`   Company created with ID: ${companyId}`);

        // 2. Generate 10 Assessments
        console.log('2. Generating 10 Assessments with "High Maturity" pattern...');

        const managementResponses = {
            'I3': 5, 'I4': 5, 'I5': 4, 'I6': 5, 'I7': 4, 'I8': 5, 'I9': 4, 'I10': 5, // DIF
            'I11': 4, 'I12': 5, 'I13': 4, 'I14': 4, // DIP
            'I17': 5, 'I18': 4, 'I19': 5, 'I20': 5, // DMI
            'I22': 4, 'I23': 4, 'I24': 3, 'I25': 4, // DIN
            'I26': 5, 'I27': 5, 'I28': 4, 'I29': 5, 'I30': 4, // DTC
            'I31': 5, 'I32': 5, 'I33': 4, // DMA
            'I34': 1, 'I35': 1, 'I36': 2, 'I38': 1  // DIR
        };

        const operationsResponses = {
            'I3': 2, 'I4': 2, 'I5': 3, 'I6': 2, 'I7': 2, 'I8': 3, 'I9': 2, 'I10': 2, // DIF
            'I11': 2, 'I12': 2, 'I13': 3, 'I14': 2, // DIP
            'I17': 3, 'I18': 3, 'I19': 2, 'I20': 3, // DMI
            'I22': 2, 'I23': 2, 'I24': 2, 'I25': 2, // DIN
            'I26': 3, 'I27': 2, 'I28': 3, 'I29': 2, 'I30': 3, // DTC
            'I31': 2, 'I32': 2, 'I33': 3, // DMA
            'I34': 4, 'I35': 5, 'I36': 4, 'I38': 5  // DIR (Inverse: will result in 2, 1, 2, 1)
        };

        const students = [
            { name: 'Carlos Mendoza', email: 'cmendoza@uicesi.edu.co', role: 'Gerencia' },
            { name: 'Ana Maria Lopez', email: 'alopez@uicesi.edu.co', role: 'Gerencia' },
            { name: 'Roberto Garcia', email: 'rgarcia@uicesi.edu.co', role: 'Operación' },
            { name: 'Elena Torres', email: 'etorres@uicesi.edu.co', role: 'Operación' },
            { name: 'Paola Ruiz', email: 'pruiz@uicesi.edu.co', role: 'Operación' }
        ];

        for (const student of students) {
            console.log(`   Submitting assessment for ${student.name} (${student.role})...`);
            await axios.post(`${BACKEND_URL}/assessment/submit`, {
                assessmentId: 'kroh-2020',
                studentName: student.name,
                studentEmail: student.email,
                companyId: companyId,
                respondentName: `${student.name} (Respondent)`,
                respondentPosition: student.role,
                respondentEmail: student.email.replace('uicesi.edu.co', 'logistica-industrial.com'),
                responses: student.role === 'Gerencia' ? managementResponses : operationsResponses
            });
        }

        console.log('--- TEST DATA GENERATION COMPLETE ---');
    } catch (error: any) {
        console.error('Error generating test data:', error.response?.data || error.message);
    }
}

generateTestData();
