import { z } from 'zod';

/**
 * Authentication Schemas
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'Email es requerido' })
    .email('Email inválido')
    .max(255, 'Email no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: 'Contraseña es requerida' })
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña no puede exceder 128 caracteres'),
});

/**
 * Company Schemas
 */
export const createCompanySchema = z.object({
  name: z
    .string({ message: 'Nombre es requerido' })
    .min(1, 'Nombre no puede estar vacío')
    .max(255, 'Nombre no puede exceder 255 caracteres')
    .trim(),

  legalId: z
    .string()
    .max(50, 'ID legal no puede exceder 50 caracteres')
    .trim()
    .optional()
    .nullable(),

  sector: z
    .string()
    .max(100, 'Sector no puede exceder 100 caracteres')
    .trim()
    .optional()
    .nullable(),

  size: z
    .string()
    .max(50, 'Tamaño no puede exceder 50 caracteres')
    .trim()
    .optional()
    .nullable(),

  contactEmail: z
    .string()
    .email('Email de contacto inválido')
    .max(255, 'Email de contacto no puede exceder 255 caracteres')
    .toLowerCase()
    .trim()
    .optional()
    .nullable(),

  contactPhone: z
    .string()
    .max(20, 'Teléfono no puede exceder 20 caracteres')
    .trim()
    .optional()
    .nullable(),

  address: z
    .string()
    .max(500, 'Dirección no puede exceder 500 caracteres')
    .trim()
    .optional()
    .nullable(),

  city: z
    .string()
    .max(100, 'Ciudad no puede exceder 100 caracteres')
    .trim()
    .optional()
    .nullable(),

  status: z
    .string()
    .refine((val) => ['Activo', 'Inactivo'].includes(val), {
      message: 'Estado debe ser Activo o Inactivo',
    })
    .optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

/**
 * User Schemas
 */
export const createUserSchema = z.object({
  email: z
    .string({ message: 'Email es requerido' })
    .email('Email inválido')
    .max(255, 'Email no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),

  password: z
    .string({ message: 'Contraseña es requerida' })
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(128, 'Contraseña no puede exceder 128 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    ),

  name: z
    .string({ message: 'Nombre es requerido' })
    .min(1, 'Nombre no puede estar vacío')
    .max(255, 'Nombre no puede exceder 255 caracteres')
    .trim(),

  role: z
    .string()
    .refine((val) => ['SUPERADMIN', 'ADMIN', 'STUDENT'].includes(val), {
      message: 'Rol inválido',
    })
    .default('STUDENT'),
});

export const updateUserSchema = createUserSchema.partial();

/**
 * Assessment/Survey Response Schemas
 */
export const submitSurveyResponseSchema = z.object({
  assessmentId: z
    .string({ message: 'ID del instrumento es requerido' })
    .min(1, 'ID del instrumento no puede estar vacío'),

  companyId: z
    .string({ message: 'ID de la compañía es requerido' })
    .uuid('ID de la compañía debe ser un UUID válido')
    .optional()
    .nullable(),

  studentName: z
    .string({ message: 'Nombre del estudiante es requerido' })
    .min(1, 'Nombre del estudiante no puede estar vacío')
    .max(255, 'Nombre del estudiante no puede exceder 255 caracteres')
    .trim(),

  studentEmail: z
    .string({ message: 'Email del estudiante es requerido' })
    .email('Email del estudiante inválido')
    .max(255, 'Email del estudiante no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),

  respondentName: z
    .string()
    .max(255, 'Nombre del respondiente no puede exceder 255 caracteres')
    .trim()
    .optional()
    .nullable(),

  respondentPosition: z
    .string()
    .max(255, 'Posición del respondiente no puede exceder 255 caracteres')
    .trim()
    .optional()
    .nullable(),

  respondentEmail: z
    .string()
    .email('Email del respondiente inválido')
    .max(255, 'Email del respondiente no puede exceder 255 caracteres')
    .toLowerCase()
    .trim()
    .optional()
    .nullable(),

  responses: z.record(
    z.string(),
    z.union([z.number(), z.string(), z.boolean(), z.null()])
  ),
});

/**
 * Public Survey Response Schema
 */
export const submitPublicSurveyResponseSchema = z.object({
  respondentName: z
    .string({ message: 'Nombre del respondiente es requerido' })
    .min(1, 'Nombre del respondiente no puede estar vacío')
    .max(255, 'Nombre del respondiente no puede exceder 255 caracteres')
    .trim(),

  respondentPosition: z
    .string({ message: 'Posición del respondiente es requerida' })
    .min(1, 'Posición del respondiente no puede estar vacía')
    .max(255, 'Posición del respondiente no puede exceder 255 caracteres')
    .trim(),

  respondentEmail: z
    .string({ message: 'Email del respondiente es requerido' })
    .email('Email del respondiente inválido')
    .max(255, 'Email del respondiente no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),

  responses: z.record(
    z.string(),
    z.union([z.number(), z.string(), z.boolean(), z.null()])
  ),
});

/**
 * ID Parameter Schemas
 */
export const uuidParamSchema = z.object({
  id: z
    .string({ message: 'ID es requerido' })
    .uuid('ID debe ser un UUID válido'),
});

export const tokenParamSchema = z.object({
  token: z
    .string({ message: 'Token es requerido' })
    .min(1, 'Token no puede estar vacío'),
});

/**
 * Query Parameter Schemas
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, 'Página debe ser mayor a 0')),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100, 'Límite máximo es 100')),
});

export const reportQuerySchema = z.object({
  instrument: z
    .string({ message: 'Instrumento es requerido' })
    .min(1, 'Instrumento no puede estar vacío'),
});

/**
 * Type exports for TypeScript
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SubmitSurveyResponseInput = z.infer<typeof submitSurveyResponseSchema>;
export type SubmitPublicSurveyResponseInput = z.infer<typeof submitPublicSurveyResponseSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type TokenParam = z.infer<typeof tokenParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
