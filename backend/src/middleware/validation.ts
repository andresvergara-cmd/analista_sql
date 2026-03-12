import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Validation middleware factory
 * Creates middleware to validate request body, params, or query against a Zod schema
 */
export function validate(schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the data to validate based on source
      const dataToValidate = req[source];

      // Validate and parse the data
      const validated = await schema.parseAsync(dataToValidate);

      // Replace the original data with validated/sanitized data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors into readable messages
        const formattedErrors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: formattedErrors,
        });
        return;
      }

      // Handle unexpected errors
      console.error('Validation middleware error:', error);
      res.status(500).json({
        error: 'Error en validación de datos',
      });
    }
  };
}

/**
 * Convenience functions for common validation patterns
 */
export const validateBody = (schema: z.ZodSchema) => validate(schema, 'body');
export const validateParams = (schema: z.ZodSchema) => validate(schema, 'params');
export const validateQuery = (schema: z.ZodSchema) => validate(schema, 'query');
