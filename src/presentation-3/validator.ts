import { resources, type AllResourceTypes } from "./meta/resources";
import { createValidationReport, type ValidationIssue, type ValidationReport } from "../shared/validation";

export const PRESENTATION_3_CONTEXT = "http://iiif.io/api/presentation/3/context.json";

export type ValidationMode = "tolerant" | "strict";

export type ValidateOptions = {
  mode?: ValidationMode;
};

type RequirementStats = NonNullable<NonNullable<ValidationReport["reporting"]>["classRequirements"]>;

const SPEC = "https://iiif.io/api/presentation/3.0/";
const CONTENT_TYPES = new Set(["Audio", "Dataset", "Image", "Model", "Sound", "Text", "TextualBody", "Video"]);
const LINKED_PROPERTIES = new Set([
  "accompanyingCanvas",
  "annotations",
  "body",
  "homepage",
  "logo",
  "partOf",
  "placeholderCanvas",
  "rendering",
  "seeAlso",
  "start",
  "supplementary",
  "target",
  "thumbnail",
]);
const ARRAY_PROPERTIES = new Set([
  "annotations",
  "behavior",
  "homepage",
  "items",
  "logo",
  "partOf",
  "provider",
  "rendering",
  "seeAlso",
  "service",
  "services",
  "structures",
  "supplementary",
  "thumbnail",
]);

function isObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function contextValues(input: Record<string, any>): unknown[] {
  return Array.isArray(input["@context"]) ? input["@context"] : [input["@context"]];
}

function issue(
  issues: ValidationIssue[],
  node: Record<string, any> | undefined,
  path: string,
  code: string,
  message: string,
  severity: ValidationIssue["severity"] = "error",
  specRef = SPEC
) {
  issues.push({
    code,
    severity,
    message,
    path,
    resourceId: typeof node?.id === "string" ? node.id : undefined,
    resourceType: typeof node?.type === "string" ? node.type : undefined,
    specRef,
  });
}

function isInternationalString(value: unknown): boolean {
  return (
    isObject(value) &&
    Object.keys(value).length > 0 &&
    Object.entries(value).every(
      ([language, entries]) =>
        (language === "none" || language === "@none" || /^[a-zA-Z][a-zA-Z0-9-]*$/.test(language)) &&
        Array.isArray(entries) &&
        entries.length > 0 &&
        entries.every((entry) => typeof entry === "string")
    )
  );
}

function resourceClass(node: Record<string, any>): AllResourceTypes | undefined {
  const type = node.type;
  if (resources.all.includes(type)) {
    return type as AllResourceTypes;
  }
  if (CONTENT_TYPES.has(type)) {
    return "ContentResource";
  }
  return undefined;
}

function isReference(node: Record<string, any>, property: string | undefined, parent?: Record<string, any>): boolean {
  if (!property) return false;
  if (LINKED_PROPERTIES.has(property) && property !== "body" && property !== "annotations") return true;
  if (property === "annotations") return node.type === "AnnotationPage" || node.type === "AnnotationCollection";
  if (parent?.type === "Collection" && property === "items") return true;
  if (parent?.type === "Range" && property === "items") return node.type === "Canvas";
  return false;
}

function validateInternationalStrings(node: Record<string, any>, path: string, issues: ValidationIssue[]) {
  for (const property of ["label", "summary"] as const) {
    if (property in node && !isInternationalString(node[property])) {
      issue(
        issues,
        node,
        `${path}.${property}`,
        `presentation-3-${property}-language-map`,
        `${property} must be an international string`
      );
    }
  }

  if ("requiredStatement" in node) {
    const statement = node.requiredStatement;
    if (!isObject(statement) || !isInternationalString(statement.label) || !isInternationalString(statement.value)) {
      issue(
        issues,
        node,
        `${path}.requiredStatement`,
        "presentation-3-required-statement",
        "requiredStatement must contain label and value international strings"
      );
    }
  }

  if ("metadata" in node) {
    if (
      !Array.isArray(node.metadata) ||
      node.metadata.some(
        (entry: unknown) =>
          !isObject(entry) || !isInternationalString(entry.label) || !isInternationalString(entry.value)
      )
    ) {
      issue(
        issues,
        node,
        `${path}.metadata`,
        "presentation-3-metadata",
        "metadata must be an array of label and value international strings"
      );
    }
  }
}

function validateStructuralShape(node: Record<string, any>, path: string, issues: ValidationIssue[]) {
  for (const property of ARRAY_PROPERTIES) {
    if (property in node && !Array.isArray(node[property])) {
      issue(issues, node, `${path}.${property}`, `presentation-3-${property}-array`, `${property} must be an array`);
    }
  }

  const expectedItems: Record<string, string[]> = {
    Collection: ["Collection", "Manifest"],
    Manifest: ["Canvas"],
    Canvas: ["AnnotationPage"],
    AnnotationPage: ["Annotation"],
  };
  const expected = expectedItems[node.type];
  if (expected && Array.isArray(node.items)) {
    node.items.forEach((item: unknown, index: number) => {
      if (!isObject(item) || !expected.includes(item.type)) {
        issue(
          issues,
          node,
          `${path}.items[${index}]`,
          "presentation-3-item-type",
          `${node.type}.items entries must be ${expected.join(" or ")}`
        );
      }
    });
  }

  if (Array.isArray(node.structures)) {
    node.structures.forEach((item: unknown, index: number) => {
      if (!isObject(item) || item.type !== "Range") {
        issue(
          issues,
          node,
          `${path}.structures[${index}]`,
          "presentation-3-structure-range",
          "structures entries must be Ranges"
        );
      }
    });
  }

  if (Array.isArray(node.annotations)) {
    node.annotations.forEach((item: unknown, index: number) => {
      if (!isObject(item) || item.type !== "AnnotationPage") {
        issue(
          issues,
          node,
          `${path}.annotations[${index}]`,
          "presentation-3-annotation-page",
          "annotations entries must be Annotation Pages"
        );
      }
    });
  }

  if (Array.isArray(node.provider)) {
    node.provider.forEach((provider: unknown, index: number) => {
      if (!isObject(provider) || provider.type !== "Agent") {
        issue(
          issues,
          node,
          `${path}.provider[${index}]`,
          "presentation-3-provider-agent",
          "provider entries must be Agents"
        );
      }
    });
  }

  if (node.type === "Annotation" && "target" in node && typeof node.target !== "string" && !isObject(node.target)) {
    issue(
      issues,
      node,
      `${path}.target`,
      "presentation-3-annotation-target",
      "Annotation.target must be a string or object"
    );
  }

  if (node.type === "Range" && Array.isArray(node.items)) {
    node.items.forEach((item: unknown, index: number) => {
      if (
        typeof item !== "string" &&
        (!isObject(item) || !["Canvas", "Range", "SpecificResource"].includes(item.type))
      ) {
        issue(
          issues,
          node,
          `${path}.items[${index}]`,
          "presentation-3-range-item-type",
          "Range.items entries must be Canvases, Ranges or SpecificResources"
        );
      }
    });
  }

  for (const dimension of ["height", "width"] as const) {
    if (dimension in node && (!Number.isInteger(node[dimension]) || node[dimension] <= 0)) {
      issue(
        issues,
        node,
        `${path}.${dimension}`,
        `presentation-3-${dimension}-positive-integer`,
        `${dimension} must be a positive integer`
      );
    }
  }
  if (
    "duration" in node &&
    (typeof node.duration !== "number" || !Number.isFinite(node.duration) || node.duration < 0)
  ) {
    issue(
      issues,
      node,
      `${path}.duration`,
      "presentation-3-duration-non-negative",
      "duration must be a non-negative number"
    );
  }
}

function validateSpecificResource(node: Record<string, any>, path: string, issues: ValidationIssue[]) {
  if (node.type === "SpecificResource" && !("source" in node)) {
    issue(
      issues,
      node,
      `${path}.source`,
      "presentation-3-specific-resource-source-required",
      "SpecificResource must include source"
    );
  }
  if (node.type === "Choice" && (!Array.isArray(node.items) || node.items.length === 0)) {
    issue(
      issues,
      node,
      `${path}.items`,
      "presentation-3-choice-items-required",
      "Choice must include a non-empty items array"
    );
  }
  if (node.type === "TextualBody" && typeof node.value !== "string") {
    issue(
      issues,
      node,
      `${path}.value`,
      "presentation-3-textual-body-value-required",
      "TextualBody must include a string value"
    );
  }
}

function finish(issues: ValidationIssue[], stats: RequirementStats, mode: ValidationMode): ValidationReport {
  const report = createValidationReport(issues, { classRequirements: stats });
  if (mode === "strict" && !report.valid) {
    const first = report.issues.find((item) => item.severity === "error");
    const error = new Error(first ? `${first.code}: ${first.message}` : "Validation failed");
    (error as Error & { report: ValidationReport }).report = report;
    throw error;
  }
  return report;
}

/** Validate an authored IIIF Presentation 3 resource without modifying it. */
export function validateAuthoredPresentation3(input: unknown, options: ValidateOptions = {}): ValidationReport {
  const issues: ValidationIssue[] = [];
  const stats: RequirementStats = {
    nodesChecked: 0,
    mustChecks: 0,
    shouldChecks: 0,
    allowedPropertyChecks: 0,
    mustNotChecks: 0,
  };
  const mode = options.mode ?? "tolerant";

  if (!isObject(input)) {
    issue(issues, undefined, "$", "presentation-3-document-object", "A Presentation 3 response must be a JSON object");
    return finish(issues, stats, mode);
  }

  if (!("type" in input)) {
    issue(issues, input, "$.type", "presentation-3-type-required", "A Presentation 3 response must include a type");
  } else if (typeof input.type === "string" && !resourceClass(input)) {
    issue(
      issues,
      input,
      "$.type",
      "presentation-3-resource-type",
      `Unknown Presentation 3 resource type "${input.type}"`
    );
  }

  const contexts = contextValues(input);
  const contextCount = contexts.filter((value) => value === PRESENTATION_3_CONTEXT).length;
  if (contextCount !== 1 || contexts[contexts.length - 1] !== PRESENTATION_3_CONTEXT) {
    issue(
      issues,
      input,
      "$.@context",
      "presentation-3-context-required",
      `The top-level @context must contain ${PRESENTATION_3_CONTEXT} exactly once and as its final value`
    );
  }
  if ("@graph" in input) {
    issue(
      issues,
      input,
      "$.@graph",
      "presentation-3-graph-forbidden",
      "A Presentation 3 response must not include @graph"
    );
  }

  function walk(value: unknown, path: string, property?: string, parent?: Record<string, any>) {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, `${path}[${index}]`, property, parent));
      return;
    }
    if (!isObject(value)) return;

    const type = typeof value.type === "string" ? value.type : undefined;
    if ("type" in value && !type) {
      issue(issues, value, `${path}.type`, "presentation-3-type-string", "Resource type must be a string");
    }
    if ("id" in value && typeof value.id !== "string") {
      issue(issues, value, `${path}.id`, "presentation-3-id-string", "Resource id must be a string");
    }
    const className = type && property !== "service" && property !== "services" ? resourceClass(value) : undefined;
    if (path !== "$" && className && "@context" in value) {
      issue(
        issues,
        value,
        `${path}.@context`,
        "presentation-3-embedded-context-forbidden",
        "Embedded Presentation resources must not include @context"
      );
    }

    if (className) {
      stats.nodesChecked++;
      const requirements = resources.supported[className];
      const allowed = new Set<string>(requirements.allowed);
      const reference = isReference(value, property, parent);
      const required = reference
        ? requirements.required.filter(
            (name) =>
              name === "id" ||
              name === "type" ||
              (property === "items" && parent?.type === "Collection" && name === "label")
          )
        : requirements.required.filter((name) => name !== "id" || type !== "TextualBody");

      for (const name of required) {
        stats.mustChecks++;
        if (!(name in value)) {
          issue(issues, value, `${path}.${name}`, "class-requirement-must", `${className} must include "${name}"`);
        }
      }
      if (!reference) {
        for (const name of requirements.recommended) {
          stats.shouldChecks++;
          if (!(name in value)) {
            issue(
              issues,
              value,
              `${path}.${name}`,
              "class-requirement-should",
              `${className} should include "${name}"`,
              "warning"
            );
          }
        }
      }
      for (const name of requirements.notAllowed.filter((name) => !allowed.has(name))) {
        stats.mustNotChecks++;
        if (name in value) {
          issue(
            issues,
            value,
            `${path}.${name}`,
            "class-requirement-must-not",
            `${className} must not include "${name}"`
          );
        }
      }

      validateInternationalStrings(value, path, issues);
      if (!reference) validateStructuralShape(value, path, issues);
    }
    validateSpecificResource(value, path, issues);

    for (const [key, child] of Object.entries(value)) {
      if (child && typeof child === "object") walk(child, `${path}.${key}`, key, value);
    }
  }

  walk(input, "$", undefined, undefined);
  return finish(issues, stats, mode);
}

export const validatePresentation3 = validateAuthoredPresentation3;

export type { ValidationIssue, ValidationReport, ValidationSeverity } from "../shared/validation";
