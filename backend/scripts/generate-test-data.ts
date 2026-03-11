import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API = 'http://localhost:3001/api';

// ─── Utilidades ───────────────────────────────────────────────────────────────
const rand = (min: number, max: number) =>
    Math.min(5, Math.max(1, Math.round(min + Math.random() * (max - min))));

const jitter = (base: number, sigma = 1): number =>
    Math.min(5, Math.max(1, Math.round(base + (Math.random() - 0.5) * 2 * sigma)));

// ─── Ítems por dimensión ──────────────────────────────────────────────────────
const ITEMS = {
    DIF: ['I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10'],
    DIP: ['I11', 'I12', 'I13', 'I14'],
    DMI: ['I17', 'I18', 'I19', 'I20'],
    DIN: ['I22', 'I23', 'I24', 'I25'],
    DTC: ['I26', 'I27', 'I28', 'I29', 'I30'],
    DMA: ['I31', 'I32', 'I33'],
    DIR: ['I34', 'I35', 'I36', 'I38'],   // Escala invertida: valores BAJOS = más maduro
    AIA: ['A1', 'A2', 'A3', 'A4', 'A5'], // Angelshaug 2025: Infraestructura de Atención a IA
};

// ─── Perfiles base (valores directos, antes de inversión para DIR) ────────────
type Profile = 'leader' | 'advanced' | 'transforming' | 'developing';

const BASE: Record<Profile, Record<keyof typeof ITEMS, number>> = {
    leader: { DIF: 4.7, DIP: 4.6, DMI: 4.5, DIN: 4.3, DTC: 4.6, DMA: 4.4, DIR: 1.2, AIA: 4.5 },
    advanced: { DIF: 3.9, DIP: 3.7, DMI: 3.8, DIN: 3.5, DTC: 3.8, DMA: 3.6, DIR: 2.0, AIA: 3.7 },
    transforming: { DIF: 2.8, DIP: 2.7, DMI: 3.0, DIN: 2.5, DTC: 2.9, DMA: 2.6, DIR: 3.0, AIA: 2.8 },
    developing: { DIF: 1.9, DIP: 2.0, DMI: 2.1, DIN: 1.8, DTC: 2.0, DMA: 1.9, DIR: 4.0, AIA: 2.0 },
};

function buildResponses(profile: Profile, sigma = 0.8): Record<string, number> {
    const r: Record<string, number> = {};
    const b = BASE[profile];
    (Object.keys(ITEMS) as (keyof typeof ITEMS)[]).forEach((dim) => {
        ITEMS[dim].forEach((item) => {
            r[item] = jitter(b[dim], sigma);
        });
    });
    return r;
}

// ─── Empresas ────────────────────────────────────────────────────────────────
const COMPANIES = [
    { name: 'TechVision Colombia S.A.S', legalId: '900.111.222-1', sector: 'Tecnología', size: 'Mediana (51-200)', email: 'contacto@techvision.co', profile: 'leader' as Profile },
    { name: 'Agroindustrias Pacifico', legalId: '800.333.444-5', sector: 'Agroindustria', size: 'Grande (+200 emp)', email: 'info@agropacifico.com', profile: 'advanced' as Profile },
    { name: 'Logística Andina S.A.', legalId: '830.555.666-3', sector: 'Transporte', size: 'Mediana (51-200)', email: 'ops@logisticaandina.co', profile: 'transforming' as Profile },
    { name: 'Comercializadora El Progreso', legalId: '860.777.888-7', sector: 'Comercio', size: 'Pyme (11-50 emp)', email: 'ventas@elprogreso.com.co', profile: 'developing' as Profile },
    { name: 'Servicios Digitales Norte', legalId: '900.999.000-9', sector: 'Servicios', size: 'Pyme (11-50 emp)', email: 'hola@sdnorte.com', profile: 'advanced' as Profile },
];

// ─── Respondentes por empresa ─────────────────────────────────────────────────
const RESPONDENTS_TEMPLATE = [
    { position: 'CEO / Gerente General', sigma: 0.5, drift: 0.3 },   // Visión optimista
    { position: 'Director de TI', sigma: 0.6, drift: 0.1 },
    { position: 'Gerente de Operaciones', sigma: 0.7, drift: -0.1 },
    { position: 'Jefe de Innovación', sigma: 0.6, drift: 0.2 },
    { position: 'Analista de Procesos', sigma: 0.8, drift: -0.3 },  // Visión más crítica
    { position: 'Coordinador Comercial', sigma: 0.9, drift: -0.2 },
    { position: 'Supervisor de Área', sigma: 0.8, drift: -0.1 },
];

function respondentsForCompany(
    companyName: string,
    companyProfile: Profile,
    count: number
): Array<{ name: string; email: string; position: string; responses: Record<string, number> }> {
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
    const firstNames = ['Ana', 'Luis', 'Carlos', 'María', 'Jorge', 'Clara', 'Andrés', 'Patricia', 'Ricardo', 'Sandra',
        'Felipe', 'Valentina', 'Julián', 'Marcela', 'Diego', 'Laura', 'Sebastián', 'Camila', 'Alejandro', 'Natalia'];
    const lastNames = ['García', 'López', 'Martínez', 'Rodríguez', 'González', 'Herrera', 'Torres', 'Ramírez', 'Vargas', 'Jiménez'];

    const used = new Set<string>();
    const result = [];

    for (let i = 0; i < count; i++) {
        const tmpl = RESPONDENTS_TEMPLATE[i % RESPONDENTS_TEMPLATE.length];
        let fn: string, ln: string, key: string;
        do {
            fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            key = fn + ln;
        } while (used.has(key));
        used.add(key);

        // Build responses with per-role drift
        const adjusted: Profile = companyProfile; // base profile
        const responses = buildResponses(adjusted, tmpl.sigma);

        // Apply drift: shift all DIF, DIP, DMI items by drift
        ['DIF', 'DIP', 'DMI'].forEach((dim) => {
            ITEMS[dim as keyof typeof ITEMS].forEach((item) => {
                responses[item] = Math.min(5, Math.max(1, Math.round(responses[item] + tmpl.drift)));
            });
        });

        result.push({
            name: `${fn} ${ln}`,
            email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}.co`,
            position: tmpl.position,
            responses,
        });
    }
    return result;
}

// ─── Distribución de encuestas por empresa ────────────────────────────────────
// Total: 7+7+7+7+7 = 35 encuestas
const DIST = [7, 7, 7, 7, 7];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n🚀  GENERANDO DATOS SINTÉTICOS — 35 encuestas / 5 empresas\n');

    let totalAnswers = 0;

    for (let ci = 0; ci < COMPANIES.length; ci++) {
        const co = COMPANIES[ci];
        const nRespondents = DIST[ci];

        console.log(`\n📦  Empresa ${ci + 1}/${COMPANIES.length}: ${co.name} [${co.profile.toUpperCase()}]`);

        // Crear organización
        let companyId: string;
        try {
            const res = await axios.post(`${API}/organizations`, {
                name: co.name,
                legalId: co.legalId,
                sector: co.sector,
                size: co.size,
                contactEmail: co.email,
            });
            companyId = (res.data as any).organization.id;
            console.log(`   ✅  Organización creada: ${companyId}`);
        } catch (err: any) {
            console.error(`   ❌  Error creando empresa: ${err.response?.data?.error || err.message}`);
            continue;
        }

        // Generar respondentes
        const respondents = respondentsForCompany(co.name, co.profile, nRespondents);

        for (let ri = 0; ri < respondents.length; ri++) {
            const r = respondents[ri];
            process.stdout.write(`   📝  [${ri + 1}/${nRespondents}] ${r.name} (${r.position})... `);
            try {
                await axios.post(`${API}/assessment/submit`, {
                    assessmentId: 'kroh-2020',
                    studentName: `Facilitador ICESI`,
                    studentEmail: `facilitador.icesi@icesi.edu.co`,
                    companyId,
                    respondentName: r.name,
                    respondentPosition: r.position,
                    respondentEmail: r.email,
                    responses: r.responses,
                });
                totalAnswers++;
                console.log('✅');
            } catch (err: any) {
                console.log(`❌  ${err.response?.data?.error || err.message}`);
            }

            // Pequeña pausa para no saturar el servidor
            await new Promise(res => setTimeout(res, 80));
        }

        console.log(`   ✔️   ${nRespondents} encuestas registradas para ${co.name}`);
    }

    console.log(`\n🎉  COMPLETADO: ${totalAnswers} encuestas en total.\n`);
}

main().catch((e) => {
    console.error('Fatal:', e.message);
    process.exit(1);
});
