import { normalize, NormalizeResult } from "./normalize";
import { Traverse } from "./traverse";
import { upgradeToPresentation4 } from "./upgrade";
import {
  ValidationIssue,
  ValidationReport,
  createValidationReport,
  ensureArray,
  getId,
  getType,
  identifyResourceType,
  isSpecificResource,
} from "./utilities";

export type ValidationMode = "tolerant" | "strict";

export type ValidateOptions = {
  mode?: ValidationMode;
  includePostNormalization?: boolean;
};

function hasPresentation4Context(resource: unknown): boolean {
  if (!resource || typeof resource !== "object") {
    return false;
  }

  const context = (resource as any)["@context"];
  const values = Array.isArray(context) ? context : [context];
  return values.some((value) => typeof value === "string" && value.includes("/presentation/4/"));
}

function issue(
  issues: ValidationIssue[],
  params: {
    code: string;
    message: string;
    path: string;
    severity?: ValidationIssue["severity"];
    resource?: any;
    specRef?: string;
  }
) {
  issues.push({
    code: params.code,
    severity: params.severity || "error",
    message: params.message,
    path: params.path,
    resourceId: params.resource ? getId(params.resource) : undefined,
    resourceType: params.resource ? getType(params.resource) : undefined,
    specRef: params.specRef,
  });
}

function isPositiveInteger(value: any): boolean {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isPositiveNumber(value: any): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isArrayOrUndefined(value: any): boolean {
  return typeof value === "undefined" || Array.isArray(value);
}

function walkResourceTree(resource: any, path: string, visitor: (node: any, nodePath: string) => void) {
  if (Array.isArray(resource)) {
    for (let i = 0; i < resource.length; i++) {
      walkResourceTree(resource[i], `${path}[${i}]`, visitor);
    }
    return;
  }

  if (!resource || typeof resource !== "object") {
    return;
  }

  visitor(resource, path);

  for (const [key, value] of Object.entries(resource)) {
    if (value && typeof value === "object") {
      walkResourceTree(value, `${path}.${key}`, visitor);
    }
  }
}

export function runAuthoredShapeValidation(resource: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  walkResourceTree(resource, "$", (node, nodePath) => {
    if (getType(node) !== "Annotation") {
      return;
    }

    if (!Array.isArray(node.target)) {
      issue(issues, {
        code: "annotation-target-array",
        message: "Annotation.target must be an array",
        path: `${nodePath}.target`,
        resource: node,
        specRef: "#target",
      });
    } else {
      for (let i = 0; i < node.target.length; i++) {
        const target = node.target[i];
        const targetPath = `${nodePath}.target[${i}]`;

        if (!target || typeof target !== "object" || Array.isArray(target)) {
          issue(issues, {
            code: "annotation-target-object",
            message: "Annotation.target entries must be JSON objects",
            path: targetPath,
            resource: node,
            specRef: "#target",
          });
          continue;
        }

        const targetType = getType(target);
        if (!targetType) {
          issue(issues, {
            code: "annotation-target-type-required",
            message: "Annotation.target object entries must include a type",
            path: `${targetPath}.type`,
            resource: node,
            specRef: "#target",
          });
        }

        const targetId = getId(target);
        if (!targetId && targetType !== "SpecificResource") {
          issue(issues, {
            code: "annotation-target-id-required",
            message: "Annotation.target object entries must include an id",
            path: `${targetPath}.id`,
            resource: node,
            specRef: "#target",
          });
        }
      }
    }

    if (typeof node.body !== "undefined" && !Array.isArray(node.body)) {
      issue(issues, {
        code: "annotation-body-array",
        message: "Annotation.body must be an array when present",
        path: `${nodePath}.body`,
        resource: node,
        specRef: "#body",
      });
    }

    if (!isArrayOrUndefined(node.motivation)) {
      issue(issues, {
        code: "annotation-motivation-array",
        message: "Annotation.motivation must be an array",
        path: `${nodePath}.motivation`,
        resource: node,
        specRef: "#motivation",
      });
    }
  });

  return issues;
}

export function runRawValidation(resource: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const traversal = new Traverse({
    collection: [
      (collection, context) => {
        if (collection.items && !Array.isArray(collection.items)) {
          issue(issues, {
            code: "collection-items-array",
            message: "Collection.items must be an array",
            path: `${context.path}.items`,
            resource: collection,
            specRef: "#items",
          });
        }
      },
    ],
    manifest: [
      (manifest, context) => {
        if (!Array.isArray(manifest.items) || manifest.items.length === 0) {
          issue(issues, {
            code: "manifest-items-required",
            message: "Manifest.items must contain at least one container",
            path: `${context.path}.items`,
            resource: manifest,
            specRef: "#items",
          });
          return;
        }
        for (let i = 0; i < manifest.items.length; i++) {
          const item = manifest.items[i];
          const type = identifyResourceType(item);
          if (type !== "Timeline" && type !== "Canvas" && type !== "Scene") {
            issue(issues, {
              code: "manifest-item-invalid-type",
              message: `Manifest.items[${i}] must be Timeline, Canvas, or Scene`,
              path: `${context.path}.items[${i}]`,
              resource: manifest,
              specRef: "#items",
            });
          }
        }
      },
    ],
    timeline: [
      (timeline, context) => {
        if (!isPositiveNumber(timeline.duration)) {
          issue(issues, {
            code: "timeline-duration-required",
            message: "Timeline.duration must be a positive number",
            path: `${context.path}.duration`,
            resource: timeline,
            specRef: "#duration",
          });
        }
      },
    ],
    canvas: [
      (canvas, context) => {
        if (!isPositiveInteger(canvas.width)) {
          issue(issues, {
            code: "canvas-width-required",
            message: "Canvas.width must be a positive integer",
            path: `${context.path}.width`,
            resource: canvas,
            specRef: "#width",
          });
        }
        if (!isPositiveInteger(canvas.height)) {
          issue(issues, {
            code: "canvas-height-required",
            message: "Canvas.height must be a positive integer",
            path: `${context.path}.height`,
            resource: canvas,
            specRef: "#height",
          });
        }
      },
    ],
    annotation: [
      (annotation, context) => {
        if (!Array.isArray(annotation.target)) {
          issue(issues, {
            code: "annotation-target-array",
            message: "Annotation.target must be an array",
            path: `${context.path}.target`,
            resource: annotation,
            specRef: "#target",
          });
        } else {
          for (let i = 0; i < annotation.target.length; i++) {
            const target = annotation.target[i];
            const targetPath = `${context.path}.target[${i}]`;

            if (!target || typeof target !== "object" || Array.isArray(target)) {
              issue(issues, {
                code: "annotation-target-object",
                message: "Annotation.target entries must be JSON objects",
                path: targetPath,
                resource: annotation,
                specRef: "#target",
              });
              continue;
            }

            const targetType = getType(target);
            if (!targetType) {
              issue(issues, {
                code: "annotation-target-type-required",
                message: "Annotation.target object entries must include a type",
                path: `${targetPath}.type`,
                resource: annotation,
                specRef: "#target",
              });
            }

            const targetId = getId(target);
            if (!targetId && targetType !== "SpecificResource") {
              issue(issues, {
                code: "annotation-target-id-required",
                message: "Annotation.target object entries must include an id",
                path: `${targetPath}.id`,
                resource: annotation,
                specRef: "#target",
              });
            }
          }
        }

        if (typeof annotation.body !== "undefined" && !Array.isArray(annotation.body)) {
          issue(issues, {
            code: "annotation-body-array",
            message: "Annotation.body must be an array when present",
            path: `${context.path}.body`,
            resource: annotation,
            specRef: "#body",
          });
        }

        if (!isArrayOrUndefined(annotation.motivation)) {
          issue(issues, {
            code: "annotation-motivation-array",
            message: "Annotation.motivation must be an array",
            path: `${context.path}.motivation`,
            resource: annotation,
            specRef: "#motivation",
          });
        }

        const motivations = ensureArray(annotation.motivation);
        if (motivations.includes("activating")) {
          const body = ensureArray(annotation.body);
          for (let i = 0; i < body.length; i++) {
            const item = body[i];
            if (!isSpecificResource(item)) {
              issue(issues, {
                code: "activating-body-specific-resource",
                message: "Activating annotation body entries must be SpecificResource",
                path: `${context.path}.body[${i}]`,
                resource: annotation,
                specRef: "#action",
              });
              continue;
            }
            if (!Array.isArray(item.action) || item.action.length === 0) {
              issue(issues, {
                code: "activating-body-action-array",
                message: "SpecificResource.action must be a non-empty array on activating annotations",
                path: `${context.path}.body[${i}].action`,
                resource: annotation,
                specRef: "#action",
              });
            }
          }
        }
      },
    ],
    specificResource: [
      (specificResource, context) => {
        if (!specificResource.source) {
          issue(issues, {
            code: "specific-resource-source-required",
            message: "SpecificResource.source is required",
            path: `${context.path}.source`,
            resource: specificResource,
            specRef: "#source",
          });
        }
        if (specificResource.action && !Array.isArray(specificResource.action)) {
          issue(issues, {
            code: "specific-resource-action-array",
            message: "SpecificResource.action must be an array when present",
            path: `${context.path}.action`,
            resource: specificResource,
            specRef: "#action",
          });
        }
      },
    ],
    selector: [
      (selector, context) => {
        if (!selector.type || !selector.type.endsWith("Selector")) {
          issue(issues, {
            code: "selector-type-invalid",
            message: 'Selector.type must end with "Selector"',
            path: `${context.path}.type`,
            resource: selector,
            specRef: "#Selectors",
          });
        }
      },
    ],
    quantity: [
      (quantity, context) => {
        if (typeof quantity.quantityValue !== "number") {
          issue(issues, {
            code: "quantity-value-required",
            message: "Quantity.quantityValue must be a number",
            path: `${context.path}.quantityValue`,
            resource: quantity,
            specRef: "#quantityValue",
          });
        }
        if (typeof quantity.unit !== "string") {
          issue(issues, {
            code: "quantity-unit-required",
            message: "Quantity.unit must be a string",
            path: `${context.path}.unit`,
            resource: quantity,
            specRef: "#unit",
          });
        }
      },
    ],
    contentResource: [
      (resource, context) => {
        if (resource.spatialScale && resource.spatialScale.type !== "Quantity") {
          issue(issues, {
            code: "spatial-scale-quantity",
            message: "spatialScale must be a Quantity object",
            path: `${context.path}.spatialScale`,
            resource,
            specRef: "#spatialScale",
          });
        }
        if (resource.temporalScale && resource.temporalScale.type !== "Quantity") {
          issue(issues, {
            code: "temporal-scale-quantity",
            message: "temporalScale must be a Quantity object",
            path: `${context.path}.temporalScale`,
            resource,
            specRef: "#temporalScale",
          });
        }
      },
    ],
  });

  traversal.traverseUnknown(resource, { path: "$" });
  return issues;
}

export function runPostNormalizationValidation(result: NormalizeResult): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { entities, mapping, resource } = result;

  if (!resource || !resource.id || !resource.type) {
    issue(issues, {
      code: "normalized-root-ref-invalid",
      message: "Normalized result is missing root resource reference",
      path: "$.resource",
      severity: "error",
    });
  } else if (!entities[resource.type as keyof typeof entities]?.[resource.id]) {
    issue(issues, {
      code: "normalized-root-not-found",
      message: "Normalized root reference does not resolve in entities",
      path: "$.resource",
      severity: "error",
    });
  }

  for (const [id, type] of Object.entries(mapping)) {
    const store = entities[type as keyof typeof entities];
    if (!store || !store[id]) {
      issue(issues, {
        code: "mapping-unresolved-entity",
        message: `Mapping references missing entity ${type}(${id})`,
        path: `$.mapping["${id}"]`,
        severity: "error",
      });
    }
  }

  return issues;
}

export function validatePresentation4(input: unknown, options: ValidateOptions = {}): ValidationReport {
  const mode = options.mode || "tolerant";
  const includePostNormalization =
    typeof options.includePostNormalization === "undefined" ? true : options.includePostNormalization;

  const issues: ValidationIssue[] = [];
  if (hasPresentation4Context(input)) {
    issues.push(...runAuthoredShapeValidation(input as any));
  }

  const upgraded = upgradeToPresentation4(input);
  issues.push(...runRawValidation(upgraded));

  if (includePostNormalization) {
    const normalized = normalize(upgraded);
    issues.push(...runPostNormalizationValidation(normalized));
  }

  const report = createValidationReport(issues);

  if (mode === "strict" && !report.valid) {
    const first = report.issues.find((item) => item.severity === "error") || report.issues[0];
    const error = new Error(first ? `${first.code}: ${first.message}` : "Validation failed");
    (error as any).report = report;
    throw error;
  }

  return report;
}
