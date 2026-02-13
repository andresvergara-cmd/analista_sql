/**
 * Kroh et al. 2020 Digital Maturity Calculation Logic
 */

interface KrohDimension {
    name: string;
    items: string[];
    description: string;
    isInverse?: boolean;
}

export const KROH_DIMENSIONS: Record<string, KrohDimension> = {
    DIF: {
        name: 'Digital Focus',
        items: ['I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9', 'I10'],
        description: 'Estrategia, metas y recursos asignados.'
    },
    DIP: {
        name: 'Digital Innovation Process',
        items: ['I11', 'I12', 'I13', 'I14'],
        description: 'Agilidad y flexibilidad en el desarrollo.'
    },
    DMI: {
        name: 'Digital Mindset',
        items: ['I17', 'I18', 'I19', 'I20'],
        description: 'Cultura y entendimiento compartido.'
    },
    DIN: {
        name: 'Digital Innovation Network',
        items: ['I22', 'I23', 'I24', 'I25'],
        description: 'Colaboración con socios externos y ecosistemas.'
    },
    DTC: {
        name: 'Digital Tech Capability',
        items: ['I26', 'I27', 'I28', 'I29', 'I30'],
        description: 'Capacidad para identificar tecnologías clave.'
    },
    DMA: {
        name: 'Data Management',
        items: ['I31', 'I32', 'I33'],
        description: 'Gestión operativa y coordinación de datos.'
    },
    DIR: {
        name: 'Overcoming Resistance',
        items: ['I34', 'I35', 'I36', 'I38'],
        description: 'Superación de barreras (Escala Invertida).',
        isInverse: true
    }
};

export function calculateKrohMaturity(responses: Record<string, number>) {
    const foundations = Object.entries(KROH_DIMENSIONS).map(([id, dim]) => {
        const itemScores = dim.items.map(itemId => {
            const rawValue = responses[itemId] || 3;
            return (dim as KrohDimension).isInverse ? (6 - rawValue) : rawValue;
        });

        const average = itemScores.reduce((a, b) => a + b, 0) / itemScores.length;
        const percentage = (average / 5) * 100;

        return {
            id,
            name: dim.name,
            score: Math.round(percentage), // For UI bars
            average: Number(average.toFixed(2)), // For detailed reports
            description: dim.description
        };
    });

    const globalAverage = foundations.reduce((a, b) => a + b.average, 0) / foundations.length;

    let status = 'Inicial';
    if (globalAverage >= 4.5) status = 'Líder Digital';
    else if (globalAverage >= 3.5) status = 'Avanzado';
    else if (globalAverage >= 2.5) status = 'En Transformación Digital';
    else if (globalAverage >= 1.5) status = 'En Desarrollo';

    return {
        foundations,
        globalScore: Number(globalAverage.toFixed(1)),
        status
    };
}
