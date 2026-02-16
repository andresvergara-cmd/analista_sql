import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { calculateKrohMaturity } from './utils/kroh-logic';
import { generateRoadmap } from './utils/roadmap-generator';

console.log('BACKEND STARTING...');

const app = express();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;
// const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Submit answers and generate diagnosis (AI placeholder)
app.post('/api/assessment/submit', async (req, res) => {
    const { assessmentId, studentName, studentEmail, responses, companyId, respondentName, respondentPosition, respondentEmail } = req.body;

    try {
        // Ensure assessment exists
        await prisma.assessment.upsert({
            where: { id: assessmentId },
            update: {},
            create: {
                id: assessmentId,
                title: assessmentId === 'kroh-2020' ? 'Diagnóstico de Madurez Digital (Kroh 2020)' : assessmentId,
                questions: [], // Required field
                tenantId: 'default-tenant' // Ensure tenantId is provided
            }
        });

        const answer = await prisma.answer.create({
            data: {
                assessmentId,
                companyId,
                studentName,
                studentEmail,
                respondentName,
                respondentPosition,
                respondentEmail,
                responses,
            },
        });

        // Real calculation for Kroh et al. 2020
        const { foundations, globalScore, status } = calculateKrohMaturity(responses);

        const diagnosis = await prisma.diagnosis.create({
            data: {
                assessmentId,
                studentEmail,
                answerId: answer.id,
                result: JSON.stringify({
                    foundations,
                    aiInsights: [
                        { type: 'strength', text: 'Tu enfoque estratégico es sólido.' },
                        { type: 'warning', text: 'Falta agilidad en los procesos.' }
                    ]
                }),
                score: globalScore,
            },
        });

        res.json({ success: true, answerId: answer.id, diagnosisId: diagnosis.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch diagnosis
app.get('/api/diagnosis/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const diagnosis = await prisma.diagnosis.findUnique({
            where: { id },
            include: {
                assessment: true,
                answer: true
            },
        });

        if (!diagnosis) {
            return res.status(404).json({ error: 'Diagnosis not found' });
        }

        let roadmap: any[] = [];
        if (diagnosis.result) {
            const result = JSON.parse(diagnosis.result);
            if (result.foundations) {
                roadmap = generateRoadmap(result.foundations);
            }
        }

        res.json({ ...diagnosis, roadmap });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// List organizations
app.get('/api/organizations', async (req, res) => {
    try {
        const organizations = await prisma.company.findMany({
            include: {
                answers: true
            },
            orderBy: { createdAt: 'desc' },
            where: { tenantId: 'default-tenant' }
        });
        res.json(organizations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create organization
app.post('/api/organizations', async (req, res) => {
    const { name, legalId, sector, size, contactEmail } = req.body;
    try {
        const newOrg = await prisma.company.create({
            data: {
                name,
                legalId,
                sector,
                size,
                contactEmail,
                tenantId: 'default-tenant', // Standardize on default-tenant for now
                status: 'Activo'
            }
        });
        res.json({ success: true, organization: newOrg });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete organization
app.delete('/api/organizations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.company.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Organization deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single organization
app.get('/api/organizations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const organization = await prisma.company.findUnique({
            where: { id }
        });
        res.json(organization);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update organization
app.put('/api/organizations/:id', async (req, res) => {
    const { id } = req.params;
    const { name, legalId, sector, size, contactEmail, status } = req.body;
    try {
        const updatedOrg = await prisma.company.update({
            where: { id },
            data: {
                name,
                legalId,
                sector,
                size,
                contactEmail,
                status
            }
        });
        res.json({ success: true, organization: updatedOrg });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            where: { tenantId: 'default-tenant' }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create user
app.post('/api/users', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // In real app, hash this!
                role,
                tenantId: 'default-tenant'
            }
        });
        res.json({ success: true, user: newUser });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET all answers for reports
app.get('/api/reports', async (req, res) => {
    try {
        const answers = await prisma.answer.findMany({
            include: {
                company: true,
                diagnosis: true
            },
            orderBy: { submittedAt: 'desc' }
        });
        res.json(answers);
    } catch (error: any) {
        console.error('Error in /api/reports:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET aggregated organizational report
app.get('/api/organizations/:id/report', async (req, res) => {
    const { id } = req.params;
    try {
        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                answers: {
                    include: {
                        diagnosis: true
                    },
                    orderBy: { submittedAt: 'desc' }
                }
            }
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const answers = company.answers;
        if (answers.length === 0) {
            return res.json({ company, consolidated: null, answers: [] });
        }

        // 1. Calculate averaged responses for each item
        const itemKeys = new Set<string>();
        answers.forEach((a: any) => {
            const resp = a.responses as any;
            Object.keys(resp).forEach(k => itemKeys.add(k));
        });

        const averagedResponses: Record<string, number> = {};
        itemKeys.forEach(key => {
            const values = answers.map((a: any) => (a.responses as any)[key]).filter((v: any) => v !== undefined);
            const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
            averagedResponses[key] = avg;
        });

        // 2. Run Kroh logic on the "average respondent"
        const consolidated = calculateKrohMaturity(averagedResponses);

        // 3. Generate Roadmap for organization
        const roadmap = generateRoadmap(consolidated.foundations);

        // 4. Perceptive Gap Analysis (optional but requested)
        // Group by position to see differences in perception
        const perceptionByPosition: Record<string, any> = {};
        answers.forEach((a: any) => {
            const pos = a.respondentPosition || 'Otro';
            if (!perceptionByPosition[pos]) {
                perceptionByPosition[pos] = { count: 0, items: {} };
            }
            perceptionByPosition[pos].count++;
            const resp = a.responses as any;
            Object.keys(resp).forEach(k => {
                if (!perceptionByPosition[pos].items[k]) perceptionByPosition[pos].items[k] = 0;
                perceptionByPosition[pos].items[k] += resp[k];
            });
        });

        // Average the perception by position
        Object.keys(perceptionByPosition).forEach(pos => {
            const data = perceptionByPosition[pos];
            const avgResp: Record<string, number> = {};
            Object.keys(data.items).forEach(k => {
                avgResp[k] = data.items[k] / data.count;
            });
            perceptionByPosition[pos].maturity = calculateKrohMaturity(avgResp);
        });

        res.json({
            company,
            consolidated,
            roadmap,
            perceptionByPosition,
            answers // Individual answers for Tab 1
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE answer and recalculate diagnosis
app.put('/api/answers/:id', async (req, res) => {
    const { id } = req.params;
    const { responses } = req.body;

    try {
        const updatedAnswer = await prisma.answer.update({
            where: { id },
            data: { responses },
            include: { diagnosis: true }
        });

        // Recalculate maturity
        const { foundations, globalScore } = calculateKrohMaturity(responses);

        // Update or Create diagnosis
        if (updatedAnswer.diagnosis) {
            await prisma.diagnosis.update({
                where: { id: updatedAnswer.diagnosis.id },
                data: {
                    result: JSON.stringify({
                        foundations,
                        aiInsights: updatedAnswer.diagnosis.result ? JSON.parse(updatedAnswer.diagnosis.result).aiInsights : []
                    }),
                    score: globalScore
                }
            });
        }

        res.json({ success: true, answer: updatedAnswer });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/query', async (req, res) => {
    const { nlQuery } = req.body;

    // Real implementation would use an LLM
    // For now, return mock data matching the frontend's expectation
    res.json({
        sql: "SELECT studentEmail, score FROM Diagnosis WHERE score > 4.0 ORDER BY createdAt DESC",
        data: [
            { studentEmail: 'maria.gonzalez@empresa.com', score: 4.8 },
            { studentEmail: 'carlos.rodriguez@pyme.co', score: 4.2 },
        ],
        explanation: `He analizado tu pregunta "${nlQuery}" y he generado la consulta SQL correspondiente.`
    });
});

const startServer = async () => {
    try {
        // Simple check to see if database is reachable (optional)
        // await prisma.$connect();
        // console.log('Successfully connected to database');

        app.listen(port, () => {
            console.log(`Backend server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
