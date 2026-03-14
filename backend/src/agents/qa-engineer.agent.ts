/**
 * Agent 5: QA Engineer
 * Role: Comprehensive SQL validation, security checks, SQL injection prevention
 * Input: SQL query plan + execution strategy
 * Output: Validation result with security assessment
 */

import { SQLQueryPlan } from './ai-engineer.agent';

export interface ValidationResult {
  isValid: boolean;
  securityLevel: 'safe' | 'warning' | 'dangerous';
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export class QAEngineerAgent {
  /**
   * Comprehensive validation of SQL query
   */
  async validate(sqlPlan: SQLQueryPlan, companyId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 1. Security validation
    const securityChecks = this.runSecurityChecks(sqlPlan);
    errors.push(...securityChecks.errors);
    warnings.push(...securityChecks.warnings);

    // 2. SQL injection check
    const injectionChecks = this.checkSQLInjection(sqlPlan);
    errors.push(...injectionChecks);

    // 3. Performance validation
    const performanceChecks = this.checkPerformance(sqlPlan);
    warnings.push(...performanceChecks.warnings);
    recommendations.push(...performanceChecks.recommendations);

    // 4. Multi-tenancy validation (ensure company filter)
    const tenancyCheck = this.checkMultiTenancy(sqlPlan, companyId);
    if (!tenancyCheck.valid) {
      errors.push(tenancyCheck.error!);
    }

    // 5. Data access validation
    const dataAccessChecks = this.checkDataAccess(sqlPlan);
    warnings.push(...dataAccessChecks);

    // Determine security level
    let securityLevel: ValidationResult['securityLevel'] = 'safe';
    if (errors.length > 0) {
      securityLevel = 'dangerous';
    } else if (warnings.length > 0) {
      securityLevel = 'warning';
    }

    return {
      isValid: errors.length === 0,
      securityLevel,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Run comprehensive security checks
   */
  private runSecurityChecks(sqlPlan: SQLQueryPlan): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const sql = sqlPlan.sql;

    // Check for forbidden operations
    const forbiddenOperations = [
      { pattern: /\b(DROP|ALTER|TRUNCATE|CREATE)\s+/i, error: 'DDL operations (DROP, ALTER, CREATE, TRUNCATE) are forbidden' },
      { pattern: /\b(INSERT|UPDATE|DELETE)\s+/i, error: 'DML write operations (INSERT, UPDATE, DELETE) are forbidden' },
      { pattern: /\b(GRANT|REVOKE)\s+/i, error: 'Permission operations (GRANT, REVOKE) are forbidden' },
      { pattern: /\bEXEC(UTE)?\s+/i, error: 'Dynamic SQL execution (EXECUTE) is forbidden' },
      { pattern: /\bCALL\s+/i, error: 'Stored procedure calls (CALL) are forbidden' },
    ];

    forbiddenOperations.forEach(({ pattern, error }) => {
      if (pattern.test(sql)) {
        errors.push(error);
      }
    });

    // Check for suspicious patterns
    const suspiciousPatterns = [
      { pattern: /;\s*\w+/i, warning: 'Multiple statements detected (possible SQL injection)' },
      { pattern: /--[^\n]*$/m, warning: 'SQL comments detected (could hide malicious code)' },
      { pattern: /\/\*[\s\S]*?\*\//g, warning: 'Block comments detected' },
      { pattern: /\bxp_cmdshell\b/i, warning: 'System command execution attempt detected' },
      { pattern: /\b(UNION\s+SELECT)\b/i, warning: 'UNION SELECT detected (possible injection)' },
    ];

    suspiciousPatterns.forEach(({ pattern, warning }) => {
      if (pattern.test(sql)) {
        warnings.push(warning);
      }
    });

    // Ensure query starts with SELECT
    if (!/^\s*SELECT\b/i.test(sql)) {
      errors.push('Query must start with SELECT statement');
    }

    return { errors, warnings };
  }

  /**
   * Check for SQL injection vulnerabilities
   */
  private checkSQLInjection(sqlPlan: SQLQueryPlan): string[] {
    const errors: string[] = [];

    // Check for raw string concatenation (should use parameters)
    const dangerousStringPatterns = [
      /'.*OR.*'/i,
      /'.*AND.*'/i,
      /'.*DROP.*'/i,
      /'.*UNION.*'/i,
      /'.*--.*'/i,
    ];

    dangerousStringPatterns.forEach(pattern => {
      if (pattern.test(sqlPlan.sql)) {
        errors.push('Possible SQL injection detected in string literals');
      }
    });

    // Ensure parameterization is used
    if (sqlPlan.sql.includes("'") && !sqlPlan.sql.includes('$')) {
      // Has string literals but no parameters
      errors.push('Query uses string literals without parameterization (use $1, $2, etc.)');
    }

    return errors;
  }

  /**
   * Check query performance and resource usage
   */
  private checkPerformance(sqlPlan: SQLQueryPlan): { warnings: string[]; recommendations: string[] } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check for missing LIMIT clause
    if (!/LIMIT\s+\d+/i.test(sqlPlan.sql) && !/COUNT\s*\(/i.test(sqlPlan.sql)) {
      warnings.push('Query missing LIMIT clause (could return too many rows)');
      recommendations.push('Add LIMIT clause to prevent excessive data retrieval');
    }

    // Check LIMIT value
    const limitMatch = sqlPlan.sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      if (limit > 5000) {
        warnings.push(`LIMIT ${limit} is very high (may impact performance)`);
        recommendations.push('Consider reducing LIMIT to 1000 or less');
      }
    }

    // Check for SELECT *
    if (/SELECT\s+\*/i.test(sqlPlan.sql)) {
      warnings.push('Query uses SELECT * (inefficient)');
      recommendations.push('Specify only needed columns instead of SELECT *');
    }

    // Check for complex JOINs
    if (sqlPlan.tablesInvolved.length > 4) {
      warnings.push(`Query joins ${sqlPlan.tablesInvolved.length} tables (may be slow)`);
      recommendations.push('Consider breaking into smaller queries or adding indexes');
    }

    return { warnings, recommendations };
  }

  /**
   * Check multi-tenancy constraints
   */
  private checkMultiTenancy(sqlPlan: SQLQueryPlan, companyId: string): { valid: boolean; error?: string } {
    // Ensure companyId filter is present when querying Answer or Diagnosis
    if (sqlPlan.tablesInvolved.includes('Answer') || sqlPlan.tablesInvolved.includes('Diagnosis')) {
      // Check if SQL has companyId filter or parameter
      const hasCompanyFilter =
        sqlPlan.sql.includes('companyId') ||
        sqlPlan.parameters.includes(companyId);

      if (!hasCompanyFilter) {
        return {
          valid: false,
          error: 'Query must filter by companyId for multi-tenancy security',
        };
      }
    }

    return { valid: true };
  }

  /**
   * Check data access permissions
   */
  private checkDataAccess(sqlPlan: SQLQueryPlan): string[] {
    const warnings: string[] = [];

    // Check if accessing sensitive tables
    const sensitiveTables = ['User'];
    const accessedSensitive = sqlPlan.tablesInvolved.filter(t => sensitiveTables.includes(t));

    if (accessedSensitive.length > 0) {
      warnings.push(`Query accesses sensitive table(s): ${accessedSensitive.join(', ')}`);
    }

    // Check if selecting password field
    if (/password/i.test(sqlPlan.sql)) {
      warnings.push('Query selects password field (security risk)');
    }

    return warnings;
  }
}

export const qaEngineerAgent = new QAEngineerAgent();
