import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { calculateKrohMaturity } from './utils/kroh-logic';
import { calculateKerznerMaturity, generateKerznerRecommendations, generateKerznerRoadmap } from './utils/kerzner-logic';
import { generateRoadmap } from './utils/roadmap-generator';
import { createAuthRouter } from './routes/auth';
import { hashPassword } from './utils/password';
import { authMiddleware, requireRole, checkCompanyAccess } from './middleware/auth';
import { validateBody, validateParams, validateQuery } from './middleware/validation';
import {
  createCompanySchema,
  updateCompanySchema,
  createUserSchema,
  updateUserSchema,
  submitSurveyResponseSchema,
  submitPublicSurveyResponseSchema,
  uuidParamSchema,
  tokenParamSchema,
  reportQuerySchema
} from './validation/schemas';
import { apiLimiter, strictLimiter, surveyLimiter } from './middleware/rate-limit';
import { executeNaturalQuery } from './utils/query-engine';
import { indexDocuments, getRAGStatus } from './utils/rag-engine';

console.log('BACKEND STARTING...');

// Helper to ensure route params are strings
const getParam = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) return param[0];
    return param || '';
};

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// CORS configuration for development and production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://analista-sql.vercel.app',
    process.env.FRONTEND_URL || '',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Security headers with Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for development
}));

// General API rate limiting
app.use('/api/', apiLimiter);

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Authentication routes
app.use('/api/auth', createAuthRouter(prisma));

// Submit answers and generate diagnosis (AI placeholder)
app.post('/api/assessment/submit', authMiddleware, checkCompanyAccess('survey', 'body'), validateBody(submitSurveyResponseSchema), async (req, res) => {
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

        // Calculate maturity based on assessment type
        let diagnosisResult: any;
        let globalScore: number;

        if (assessmentId === 'kerzner-2024') {
            // Kerzner PM Maturity calculation
            const { dimensions, globalScore: score, maturityLevel, status } = calculateKerznerMaturity(responses);
            const recommendations = generateKerznerRecommendations(dimensions);
            const roadmap = generateKerznerRoadmap(dimensions, score);

            globalScore = score;
            diagnosisResult = {
                dimensions,
                maturityLevel,
                status,
                recommendations,
                roadmap
            };
        } else {
            // Kroh et al. 2020 Digital Maturity calculation (default)
            const { foundations, globalScore: score, status } = calculateKrohMaturity(responses);

            globalScore = score;
            diagnosisResult = {
                foundations,
                aiInsights: [
                    { type: 'strength', text: 'Tu enfoque estratégico es sólido.' },
                    { type: 'warning', text: 'Falta agilidad en los procesos.' }
                ]
            };
        }

        const diagnosis = await prisma.diagnosis.create({
            data: {
                assessmentId,
                studentEmail,
                answerId: answer.id,
                result: JSON.stringify(diagnosisResult),
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
    const id = getParam(req.params.id);
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

// Update a single response and recalculate diagnosis
app.patch('/api/diagnosis/:id/update-response', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { itemId, value } = req.body;

    try {
        // Validación
        if (!itemId || value === undefined || value < 0 || value > 5) {
            return res.status(400).json({ error: 'Datos inválidos. El valor debe estar entre 0 (No Sabe) y 5.' });
        }

        // 1. Buscar diagnóstico
        const diagnosis = await prisma.diagnosis.findUnique({
            where: { id },
            include: {
                answer: true,
                assessment: true
            }
        });

        if (!diagnosis) {
            return res.status(404).json({ error: 'Diagnóstico no encontrado' });
        }

        // 2. Actualizar respuesta
        const currentResponses = diagnosis.answer.responses as Record<string, number>;
        currentResponses[itemId] = value;

        await prisma.answer.update({
            where: { id: diagnosis.answerId },
            data: { responses: currentResponses }
        });

        // 3. Recalcular diagnóstico
        let newDiagnosisResult: any;
        let newScore: number;

        if (diagnosis.assessmentId === 'kerzner-2024') {
            const { dimensions, globalScore: score, maturityLevel, status } = calculateKerznerMaturity(currentResponses);
            const recommendations = generateKerznerRecommendations(dimensions);
            const roadmap = generateKerznerRoadmap(dimensions, score);

            newScore = score;
            newDiagnosisResult = {
                dimensions,
                maturityLevel,
                status,
                recommendations,
                roadmap
            };
        } else {
            // Kroh et al. 2020 (default)
            const { foundations, globalScore: score, status } = calculateKrohMaturity(currentResponses);

            newScore = score;
            newDiagnosisResult = {
                foundations,
                aiInsights: [
                    { type: 'strength', text: 'Tu enfoque estratégico es sólido.' },
                    { type: 'warning', text: 'Falta agilidad en los procesos.' }
                ]
            };
        }

        // 4. Actualizar diagnóstico
        const updatedDiagnosis = await prisma.diagnosis.update({
            where: { id },
            data: {
                result: JSON.stringify(newDiagnosisResult),
                score: newScore
            },
            include: {
                answer: true,
                assessment: true
            }
        });

        res.json(updatedDiagnosis);
    } catch (error: any) {
        console.error('Error updating response:', error);
        res.status(500).json({ error: 'Error al actualizar respuesta' });
    }
});

// List organizations (with authentication and permission filtering)
app.get('/api/organizations', authMiddleware, async (req, res) => {
    try {
        // SUPERADMIN can see all organizations
        if (req.user!.role === 'SUPERADMIN') {
            const organizations = await prisma.company.findMany({
                include: {
                    answers: true
                },
                orderBy: { createdAt: 'desc' },
                where: { tenantId: req.user!.tenantId }
            });
            return res.json(organizations);
        }

        // For other users, only return companies they have access to
        const userCompanyAccess = await prisma.userCompanyAccess.findMany({
            where: { userId: req.user!.userId },
            select: { companyId: true }
        });

        const allowedCompanyIds = userCompanyAccess.map(access => access.companyId);

        const organizations = await prisma.company.findMany({
            where: {
                id: { in: allowedCompanyIds },
                tenantId: req.user!.tenantId
            },
            include: {
                answers: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(organizations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create organization (SUPERADMIN and ADMIN only)
app.post('/api/organizations', authMiddleware, requireRole('SUPERADMIN', 'ADMIN'), validateBody(createCompanySchema), async (req, res) => {
    const { name, legalId, sector, size, contactEmail } = req.body;
    try {
        const newOrg = await prisma.company.create({
            data: {
                name,
                legalId,
                sector,
                size,
                contactEmail,
                tenantId: req.user!.tenantId,
                status: 'Activo'
            }
        });
        res.json({ success: true, organization: newOrg });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete organization (SUPERADMIN only)
app.delete('/api/organizations/:id', authMiddleware, requireRole('SUPERADMIN'), validateParams(uuidParamSchema), async (req, res) => {
    const id = getParam(req.params.id);
    try {
        // Verify organization belongs to user's tenant
        const organization = await prisma.company.findUnique({
            where: { id }
        });

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        if (organization.tenantId !== req.user!.tenantId) {
            return res.status(403).json({ error: 'Not authorized to delete this organization' });
        }

        await prisma.company.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Organization deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single organization (with permission check)
app.get('/api/organizations/:id', authMiddleware, validateParams(uuidParamSchema), async (req, res) => {
    const id = getParam(req.params.id);
    try {
        const organization = await prisma.company.findUnique({
            where: { id }
        });

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // SUPERADMIN can access all organizations in their tenant
        if (req.user!.role === 'SUPERADMIN') {
            if (organization.tenantId !== req.user!.tenantId) {
                return res.status(403).json({ error: 'Not authorized to access this organization' });
            }
            return res.json(organization);
        }

        // Other users need explicit access
        const access = await prisma.userCompanyAccess.findUnique({
            where: {
                userId_companyId: {
                    userId: req.user!.userId,
                    companyId: id
                }
            }
        });

        if (!access) {
            return res.status(403).json({ error: 'Not authorized to access this organization' });
        }

        res.json(organization);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update organization (SUPERADMIN and ADMIN only)
app.put('/api/organizations/:id', authMiddleware, requireRole('SUPERADMIN', 'ADMIN'), validateParams(uuidParamSchema), validateBody(updateCompanySchema), async (req, res) => {
    const id = getParam(req.params.id);
    const { name, legalId, sector, size, contactEmail, status } = req.body;
    try {
        // Verify organization belongs to user's tenant
        const organization = await prisma.company.findUnique({
            where: { id }
        });

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        if (organization.tenantId !== req.user!.tenantId) {
            return res.status(403).json({ error: 'Not authorized to update this organization' });
        }

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
// ==================== USER MANAGEMENT ENDPOINTS ====================
// Protected with authentication and role-based access control

// Get all users (SUPERADMIN and ADMIN only)
app.get('/api/users', authMiddleware, requireRole('SUPERADMIN', 'ADMIN'), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            where: { tenantId: req.user!.tenantId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tenantId: true,
                createdAt: true,
                // Don't return password field
            }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create user (SUPERADMIN only)
app.post('/api/users', strictLimiter, authMiddleware, requireRole('SUPERADMIN'), validateBody(createUserSchema), async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({ error: 'El email ya está registrado' });
            return;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                tenantId: req.user!.tenantId
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tenantId: true,
                createdAt: true,
            }
        });

        res.json({ success: true, user: newUser });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update user (SUPERADMIN only)
app.put('/api/users/:id', authMiddleware, requireRole('SUPERADMIN'), validateParams(uuidParamSchema), validateBody(updateUserSchema), async (req, res) => {
    const id = getParam(req.params.id);
    const { name, email, role } = req.body;

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // If email is being changed, check if new email is available
        if (email && email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({
                where: { email }
            });

            if (emailTaken) {
                res.status(400).json({ error: 'El email ya está registrado' });
                return;
            }
        }

        // Update user (without password)
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                tenantId: true,
                createdAt: true,
            }
        });

        res.json({ success: true, user: updatedUser });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Change user password (SUPERADMIN can change any, users can change their own)
app.post('/api/users/:id/change-password', authMiddleware, async (req, res) => {
    const id = getParam(req.params.id);
    const { newPassword, currentPassword } = req.body;

    try {
        // Validate input
        if (!newPassword) {
            res.status(400).json({ error: 'La nueva contraseña es requerida' });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        // Check permissions: SUPERADMIN can change any password, others only their own
        if (req.user!.role !== 'SUPERADMIN' && req.user!.userId !== id) {
            res.status(403).json({ error: 'No tienes permisos para cambiar esta contraseña' });
            return;
        }

        // If user is changing their own password, verify current password
        if (req.user!.userId === id && req.user!.role !== 'SUPERADMIN') {
            if (!currentPassword) {
                res.status(400).json({ error: 'La contraseña actual es requerida' });
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }

            const { comparePassword } = await import('./utils/password');
            const isValid = await comparePassword(currentPassword, user.password);

            if (!isValid) {
                res.status(401).json({ error: 'Contraseña actual incorrecta' });
                return;
            }
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user (SUPERADMIN only)
app.delete('/api/users/:id', authMiddleware, requireRole('SUPERADMIN'), validateParams(uuidParamSchema), async (req, res) => {
    const id = getParam(req.params.id);

    try {
        // Prevent deleting yourself
        if (req.user!.userId === id) {
            res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
            return;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Delete user
        await prisma.user.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== USER-COMPANY ACCESS MANAGEMENT ====================

// Get companies accessible by user
app.get('/api/users/:userId/companies', authMiddleware, async (req, res) => {
    const userId = getParam(req.params.userId);

    try {
        // Only SUPERADMIN or the user themselves can view their companies
        if (req.user!.role !== 'SUPERADMIN' && req.user!.userId !== userId) {
            res.status(403).json({ error: 'No tienes permisos para ver esta información' });
            return;
        }

        const access = await prisma.userCompanyAccess.findMany({
            where: { userId },
            include: {
                company: true
            }
        });

        res.json(access);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get users with access to a company (SUPERADMIN and ADMIN only)
app.get('/api/companies/:companyId/users', authMiddleware, requireRole('SUPERADMIN', 'ADMIN'), async (req, res) => {
    const companyId = getParam(req.params.companyId);

    try {
        const access = await prisma.userCompanyAccess.findMany({
            where: { companyId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        res.json(access);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Grant company access to user (SUPERADMIN only)
app.post('/api/users/:userId/company-access', authMiddleware, requireRole('SUPERADMIN'), async (req, res) => {
    const userId = getParam(req.params.userId);
    const { companyId, canSurvey, canViewReports, canRunQueries } = req.body;

    try {
        // Validate input
        if (!companyId) {
            res.status(400).json({ error: 'companyId es requerido' });
            return;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Check if company exists
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
            res.status(404).json({ error: 'Empresa no encontrada' });
            return;
        }

        // Create or update access
        const access = await prisma.userCompanyAccess.upsert({
            where: {
                userId_companyId: {
                    userId,
                    companyId
                }
            },
            update: {
                canSurvey: canSurvey ?? true,
                canViewReports: canViewReports ?? true,
                canRunQueries: canRunQueries ?? false,
                grantedBy: req.user!.userId
            },
            create: {
                userId,
                companyId,
                canSurvey: canSurvey ?? true,
                canViewReports: canViewReports ?? true,
                canRunQueries: canRunQueries ?? false,
                grantedBy: req.user!.userId
            }
        });

        res.json({ success: true, access });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update company access permissions (SUPERADMIN only)
app.put('/api/users/:userId/company-access/:accessId', authMiddleware, requireRole('SUPERADMIN'), async (req, res) => {
    const userId = getParam(req.params.userId);
    const accessId = getParam(req.params.accessId);
    const { canSurvey, canViewReports, canRunQueries } = req.body;

    try {
        // Check if access exists and belongs to the user
        const existingAccess = await prisma.userCompanyAccess.findUnique({
            where: { id: accessId }
        });

        if (!existingAccess) {
            res.status(404).json({ error: 'Acceso no encontrado' });
            return;
        }

        if (existingAccess.userId !== userId) {
            res.status(400).json({ error: 'El acceso no pertenece a este usuario' });
            return;
        }

        // Update permissions
        const updated = await prisma.userCompanyAccess.update({
            where: { id: accessId },
            data: {
                canSurvey: canSurvey ?? existingAccess.canSurvey,
                canViewReports: canViewReports ?? existingAccess.canViewReports,
                canRunQueries: canRunQueries ?? existingAccess.canRunQueries,
                grantedBy: req.user!.userId
            }
        });

        res.json({ success: true, access: updated });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Revoke company access (SUPERADMIN only)
app.delete('/api/users/:userId/company-access/:accessId', authMiddleware, requireRole('SUPERADMIN'), async (req, res) => {
    const userId = getParam(req.params.userId);
    const accessId = getParam(req.params.accessId);

    try {
        // Check if access exists and belongs to the user
        const existingAccess = await prisma.userCompanyAccess.findUnique({
            where: { id: accessId }
        });

        if (!existingAccess) {
            res.status(404).json({ error: 'Acceso no encontrado' });
            return;
        }

        if (existingAccess.userId !== userId) {
            res.status(400).json({ error: 'El acceso no pertenece a este usuario' });
            return;
        }

        // Delete access
        await prisma.userCompanyAccess.delete({
            where: { id: accessId }
        });

        res.json({ success: true, message: 'Acceso revocado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Batch grant/update company access for a user (SUPERADMIN only)
app.post('/api/users/:userId/companies/batch', authMiddleware, requireRole('SUPERADMIN'), async (req, res) => {
    const userId = getParam(req.params.userId);
    const { companies } = req.body; // Array of { companyId, canSurvey, canViewReports, canRunQueries }

    try {
        // Validate input
        if (!Array.isArray(companies)) {
            res.status(400).json({ error: 'companies debe ser un array' });
            return;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Delete existing access for this user
        await prisma.userCompanyAccess.deleteMany({
            where: { userId }
        });

        // Create new access records
        const accessRecords = companies.map(comp => ({
            userId,
            companyId: comp.companyId,
            canSurvey: comp.canSurvey ?? true,
            canViewReports: comp.canViewReports ?? true,
            canRunQueries: comp.canRunQueries ?? false,
            grantedBy: req.user!.userId
        }));

        if (accessRecords.length > 0) {
            await prisma.userCompanyAccess.createMany({
                data: accessRecords,
                skipDuplicates: true
            });
        }

        // Fetch and return updated access
        const updatedAccess = await prisma.userCompanyAccess.findMany({
            where: { userId },
            include: { company: true }
        });

        res.json({ success: true, access: updatedAccess });
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
app.get('/api/organizations/:id/report', authMiddleware, checkCompanyAccess('reports'), validateParams(uuidParamSchema), validateQuery(reportQuerySchema), async (req, res) => {
    const id = getParam(req.params.id);
    const instrument = (typeof req.query.instrument === 'string' ? req.query.instrument : 'kroh-2020');

    try {
        // Optimized: filter answers by instrument at database level to avoid N+1
        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                answers: {
                    where: {
                        assessmentId: instrument
                    },
                    include: {
                        diagnosis: true,
                        assessment: true
                    },
                    orderBy: { submittedAt: 'desc' }
                }
            }
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Answers are already filtered by database query
        const answers = company.answers;

        if (answers.length === 0) {
            return res.json({ company, consolidated: null, answers: [], instrument });
        }

        // 1. Calculate averaged responses for each item
        const itemKeys = new Set<string>();
        answers.forEach((a: any) => {
            const resp = a.responses as any;
            Object.keys(resp).forEach(k => itemKeys.add(k));
        });

        const averagedResponses: Record<string, number> = {};
        itemKeys.forEach(key => {
            const values = answers.map((a: any) => (a.responses as any)[key]).filter((v: any) => v !== undefined && v !== null && v !== 0);
            const avg = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
            averagedResponses[key] = avg;
        });

        // 2. Run instrument-specific logic
        let consolidated: any;
        let roadmap: any[];
        let perceptionByPosition: Record<string, any> = {};

        if (instrument === 'kerzner-2024') {
            // Kerzner PM Maturity Logic
            consolidated = calculateKerznerMaturity(averagedResponses);

            // Get all diagnoses for perception analysis
            const diagnoses = answers.map((a: any) => a.diagnosis?.result || {});
            const positions = [...new Set(answers.map((a: any) => a.respondentPosition))].filter(Boolean);

            // Generate perception analysis by position (excluding "No Sabe" = 0)
            answers.forEach((a: any) => {
                const pos = a.respondentPosition || 'Otro';
                if (!perceptionByPosition[pos]) {
                    perceptionByPosition[pos] = { count: 0, items: {}, itemCounts: {} };
                }
                perceptionByPosition[pos].count++;
                const resp = a.responses as any;
                Object.keys(resp).forEach(k => {
                    const val = resp[k];
                    if (val === 0 || val === undefined || val === null) return;
                    if (!perceptionByPosition[pos].items[k]) perceptionByPosition[pos].items[k] = 0;
                    if (!perceptionByPosition[pos].itemCounts[k]) perceptionByPosition[pos].itemCounts[k] = 0;
                    perceptionByPosition[pos].items[k] += val;
                    perceptionByPosition[pos].itemCounts[k]++;
                });
            });

            // Calculate maturity for each position
            Object.keys(perceptionByPosition).forEach(pos => {
                const data = perceptionByPosition[pos];
                const avgResp: Record<string, number> = {};
                Object.keys(data.items).forEach(k => {
                    avgResp[k] = data.itemCounts[k] > 0 ? data.items[k] / data.itemCounts[k] : 0;
                });
                perceptionByPosition[pos].maturity = calculateKerznerMaturity(avgResp);
            });

            // Generate roadmap using Kerzner logic
            roadmap = generateKerznerRoadmap(consolidated.dimensions, consolidated.globalScore);
        } else {
            // Kroh Digital Maturity Logic (default)
            consolidated = calculateKrohMaturity(averagedResponses);
            roadmap = generateRoadmap(consolidated.foundations);

            // Perceptive Gap Analysis (excluding "No Sabe" = 0)
            answers.forEach((a: any) => {
                const pos = a.respondentPosition || 'Otro';
                if (!perceptionByPosition[pos]) {
                    perceptionByPosition[pos] = { count: 0, items: {}, itemCounts: {} };
                }
                perceptionByPosition[pos].count++;
                const resp = a.responses as any;
                Object.keys(resp).forEach(k => {
                    const val = resp[k];
                    if (val === 0 || val === undefined || val === null) return;
                    if (!perceptionByPosition[pos].items[k]) perceptionByPosition[pos].items[k] = 0;
                    if (!perceptionByPosition[pos].itemCounts[k]) perceptionByPosition[pos].itemCounts[k] = 0;
                    perceptionByPosition[pos].items[k] += val;
                    perceptionByPosition[pos].itemCounts[k]++;
                });
            });

            // Average the perception by position
            Object.keys(perceptionByPosition).forEach(pos => {
                const data = perceptionByPosition[pos];
                const avgResp: Record<string, number> = {};
                Object.keys(data.items).forEach(k => {
                    avgResp[k] = data.itemCounts[k] > 0 ? data.items[k] / data.itemCounts[k] : 0;
                });
                perceptionByPosition[pos].maturity = calculateKrohMaturity(avgResp);
            });
        }

        res.json({
            company,
            consolidated,
            roadmap,
            perceptionByPosition,
            answers,
            instrument
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE answer and recalculate diagnosis
app.put('/api/answers/:id', async (req, res) => {
    const id = getParam(req.params.id);
    const { responses } = req.body;

    try {
        const updatedAnswer = await prisma.answer.update({
            where: { id },
            data: { responses },
            include: {
                diagnosis: true,
                assessment: true
            }
        });

        // Recalculate maturity based on assessment type
        let diagnosisResult: any;
        let globalScore: number;

        if (updatedAnswer.assessmentId === 'kerzner-2024') {
            // Kerzner PM Maturity calculation
            const { dimensions, globalScore: score, maturityLevel, status } = calculateKerznerMaturity(responses);
            const recommendations = generateKerznerRecommendations(dimensions);
            const roadmap = generateKerznerRoadmap(dimensions, score);

            globalScore = score;
            diagnosisResult = {
                dimensions,
                maturityLevel,
                status,
                recommendations,
                roadmap
            };
        } else {
            // Kroh et al. 2020 Digital Maturity calculation (default)
            const { foundations, globalScore: score } = calculateKrohMaturity(responses);

            globalScore = score;
            diagnosisResult = {
                foundations,
                aiInsights: updatedAnswer.diagnosis?.result ? JSON.parse(updatedAnswer.diagnosis.result).aiInsights : []
            };
        }

        // Update or Create diagnosis
        if (updatedAnswer.diagnosis) {
            await prisma.diagnosis.update({
                where: { id: updatedAnswer.diagnosis.id },
                data: {
                    result: JSON.stringify(diagnosisResult),
                    score: globalScore
                }
            });
        }

        res.json({ success: true, answer: updatedAnswer });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an answer by ID
app.delete('/api/answers/:id', authMiddleware, async (req, res) => {
    const id = getParam(req.params.id);

    try {
        // Find the answer first to check permissions
        const answer = await prisma.answer.findUnique({
            where: { id },
            include: {
                diagnosis: true
            }
        });

        if (!answer) {
            res.status(404).json({ error: 'Respuesta no encontrada' });
            return;
        }

        // Delete associated diagnosis first if it exists
        if (answer.diagnosis) {
            await prisma.diagnosis.delete({
                where: { id: answer.diagnosis.id }
            });
        }

        // Delete the answer
        await prisma.answer.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Respuesta eliminada correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SURVEY LINKS (Async Response Links) ====================

// Create a survey link for a company (authenticated)
app.post('/api/survey-links', authMiddleware, async (req, res) => {
    const { companyId, assessmentId, expiresInDays, maxResponses } = req.body;

    try {
        if (!companyId || !assessmentId) {
            res.status(400).json({ error: 'companyId y assessmentId son requeridos' });
            return;
        }

        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
            res.status(404).json({ error: 'Empresa no encontrada' });
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

        const link = await prisma.surveyLink.create({
            data: {
                token,
                companyId,
                assessmentId,
                createdBy: req.user!.userId,
                expiresAt,
                maxResponses: maxResponses || null,
            },
            include: { company: true }
        });

        res.json({ success: true, link, surveyUrl: `/survey/${token}` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// List survey links for a company
app.get('/api/survey-links/company/:companyId', authMiddleware, async (req, res) => {
    const companyId = getParam(req.params.companyId);

    try {
        const links = await prisma.surveyLink.findMany({
            where: { companyId },
            include: { company: true },
            orderBy: { createdAt: 'desc' }
        });

        // Count responses for each link's company+assessment
        const linksWithCount = await Promise.all(links.map(async (link: any) => {
            const responseCount = await prisma.answer.count({
                where: {
                    companyId: link.companyId,
                    assessmentId: link.assessmentId,
                }
            });
            return { ...link, responseCount };
        }));

        res.json(linksWithCount);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Deactivate a survey link
app.delete('/api/survey-links/:id', authMiddleware, async (req, res) => {
    const id = getParam(req.params.id);

    try {
        await prisma.surveyLink.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({ success: true, message: 'Enlace desactivado' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PUBLIC SURVEY ENDPOINTS (No auth required) ====================

// Validate survey token and get survey info
app.get('/api/public/survey/:token', async (req, res) => {
    const token = getParam(req.params.token);

    try {
        const link = await prisma.surveyLink.findUnique({
            where: { token },
            include: { company: true }
        });

        if (!link) {
            res.status(404).json({ error: 'Enlace no encontrado o inválido' });
            return;
        }

        if (!link.isActive) {
            res.status(410).json({ error: 'Este enlace ha sido desactivado' });
            return;
        }

        if (link.expiresAt && new Date() > link.expiresAt) {
            res.status(410).json({ error: 'Este enlace ha expirado' });
            return;
        }

        // Check max responses
        if (link.maxResponses) {
            const responseCount = await prisma.answer.count({
                where: {
                    companyId: link.companyId,
                    assessmentId: link.assessmentId,
                }
            });
            if (responseCount >= link.maxResponses) {
                res.status(410).json({ error: 'Se ha alcanzado el número máximo de respuestas para este enlace' });
                return;
            }
        }

        res.json({
            companyName: link.company.name,
            companyId: link.companyId,
            assessmentId: link.assessmentId,
            isValid: true
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Submit survey responses via public link (no auth)
app.post('/api/public/survey/:token/submit', surveyLimiter, validateParams(tokenParamSchema), validateBody(submitPublicSurveyResponseSchema), async (req, res) => {
    const token = getParam(req.params.token);
    const { respondentName, respondentPosition, respondentEmail, responses } = req.body;

    try {
        const link = await prisma.surveyLink.findUnique({
            where: { token },
            include: { company: true }
        });

        if (!link || !link.isActive) {
            res.status(404).json({ error: 'Enlace no válido o desactivado' });
            return;
        }

        if (link.expiresAt && new Date() > link.expiresAt) {
            res.status(410).json({ error: 'Este enlace ha expirado' });
            return;
        }

        if (link.maxResponses) {
            const responseCount = await prisma.answer.count({
                where: { companyId: link.companyId, assessmentId: link.assessmentId }
            });
            if (responseCount >= link.maxResponses) {
                res.status(410).json({ error: 'Número máximo de respuestas alcanzado' });
                return;
            }
        }

        // Ensure assessment exists
        await prisma.assessment.upsert({
            where: { id: link.assessmentId },
            update: {},
            create: {
                id: link.assessmentId,
                title: link.assessmentId === 'kroh-2020'
                    ? 'Diagnóstico de Madurez Digital (Kroh 2020)'
                    : link.assessmentId === 'kerzner-2024'
                        ? 'Diagnóstico de Madurez en Gestión de Proyectos (Kerzner 2024)'
                        : link.assessmentId,
                questions: [],
                tenantId: 'default-tenant'
            }
        });

        const answer = await prisma.answer.create({
            data: {
                assessmentId: link.assessmentId,
                companyId: link.companyId,
                studentName: respondentName,
                studentEmail: respondentEmail,
                respondentName,
                respondentPosition,
                respondentEmail,
                responses,
            },
        });

        // Calculate maturity
        let diagnosisResult: any;
        let globalScore: number;

        if (link.assessmentId === 'kerzner-2024') {
            const { dimensions, globalScore: score, maturityLevel, status } = calculateKerznerMaturity(responses);
            const recommendations = generateKerznerRecommendations(dimensions);
            const roadmap = generateKerznerRoadmap(dimensions, score);
            globalScore = score;
            diagnosisResult = { dimensions, maturityLevel, status, recommendations, roadmap };
        } else {
            const { foundations, globalScore: score, status } = calculateKrohMaturity(responses);
            globalScore = score;
            diagnosisResult = {
                foundations,
                aiInsights: [
                    { type: 'strength', text: 'Tu enfoque estratégico es sólido.' },
                    { type: 'warning', text: 'Falta agilidad en los procesos.' }
                ]
            };
        }

        const diagnosis = await prisma.diagnosis.create({
            data: {
                assessmentId: link.assessmentId,
                studentEmail: respondentEmail,
                answerId: answer.id,
                result: JSON.stringify(diagnosisResult),
                score: globalScore,
            },
        });

        res.json({
            success: true,
            message: 'Respuestas enviadas exitosamente. ¡Gracias por participar!',
            diagnosisId: diagnosis.id
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/query', authMiddleware, checkCompanyAccess('queries', 'body'), async (req, res) => {
    const { nlQuery, companyId } = req.body;

    if (!companyId) {
        res.status(400).json({ error: 'Debe seleccionar una empresa para realizar la consulta.' });
        return;
    }

    if (!nlQuery || !nlQuery.trim()) {
        res.status(400).json({ error: 'Debe escribir una pregunta.' });
        return;
    }

    try {
        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) {
            res.status(404).json({ error: 'Empresa no encontrada.' });
            return;
        }

        const result = await executeNaturalQuery(prisma, nlQuery.trim(), companyId, company.name);
        res.json(result);
    } catch (error: any) {
        console.error('Query engine error:', error);
        res.status(500).json({ error: error.message || 'Error al procesar la consulta.' });
    }
});

// ==================== KNOWLEDGE BASE FILE UPLOAD ====================
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx', '.csv', '.xlsx', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Tipo de archivo no permitido: ${ext}. Permitidos: ${allowed.join(', ')}`));
        }
    },
});

// Upload knowledge base file
app.post('/api/knowledge-base/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No se proporcionó ningún archivo' });
        return;
    }

    const fileInfo = {
        id: `kb-${Date.now()}`,
        name: req.file.originalname,
        type: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
        size: req.file.size,
        filename: req.file.filename,
        status: 'Activo',
        uploadedAt: new Date().toISOString(),
    };

    res.json({ success: true, file: fileInfo });

    // Re-index documents for RAG after upload
    indexDocuments().catch(err => console.error('[RAG] Re-index after upload failed:', err));
});

// List uploaded files
app.get('/api/knowledge-base/files', (_req, res) => {
    const files = fs.readdirSync(uploadsDir).map((filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        return {
            id: filename,
            name: filename,
            size: stats.size,
            uploadedAt: stats.mtime.toISOString(),
        };
    });
    res.json(files);
});

// Delete uploaded file
app.delete('/api/knowledge-base/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, path.basename(getParam(req.params.filename)));
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true });

        // Re-index documents for RAG after deletion
        indexDocuments().catch(err => console.error('[RAG] Re-index after delete failed:', err));
    } else {
        res.status(404).json({ error: 'Archivo no encontrado' });
    }
});

// RAG status endpoint
app.get('/api/knowledge-base/rag-status', (_req, res) => {
    res.json(getRAGStatus());
});

// Serve uploaded files
app.use('/api/knowledge-base/files/download', express.static(uploadsDir));

// ==================== ASSESSMENTS ENDPOINT ====================
// Get all assessments/instruments
app.get('/api/assessments', async (req, res) => {
    try {
        const assessments = await prisma.assessment.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Known item counts for standardized instruments
        const ITEM_COUNTS: Record<string, number> = {
            'kroh-2020': 32,
            'kerzner-2024': 20
        };

        // Transform to match frontend expectations
        const transformed = assessments.map((assessment: any) => ({
            id: assessment.id,
            title: assessment.title,
            items: ITEM_COUNTS[assessment.id] || 0,
            status: 'Activo',
            tenantId: assessment.tenantId,
            createdAt: assessment.createdAt
        }));

        res.json(transformed);
    } catch (error: any) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ error: error.message });
    }
});

const startServer = async () => {
    try {
        // Simple check to see if database is reachable (optional)
        // await prisma.$connect();
        // console.log('Successfully connected to database');

        // Index knowledge base documents for RAG on startup
        indexDocuments()
            .then(({ indexed, chunks }) => console.log(`[RAG] Startup indexing: ${indexed} documents, ${chunks} chunks`))
            .catch(err => console.error('[RAG] Startup indexing failed:', err));

        app.listen(port, () => {
            console.log(`Backend server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
