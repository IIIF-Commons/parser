export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  path: string;
  resourceType?: string;
  resourceId?: string;
  specRef?: string;
};

export type ValidationReport = {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    errors: number;
    warnings: number;
    info: number;
  };
  reporting?: {
    classRequirements?: {
      nodesChecked: number;
      mustChecks: number;
      shouldChecks: number;
      allowedPropertyChecks: number;
      mustNotChecks: number;
    };
  };
};

export function createValidationReport(
  issues: ValidationIssue[],
  reporting?: ValidationReport["reporting"]
): ValidationReport {
  const stats = {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
    info: issues.filter((issue) => issue.severity === "info").length,
  };

  return {
    valid: stats.errors === 0,
    issues,
    stats,
    reporting,
  };
}
