import { presentation4ClassRequirements } from "./meta/class-requirements";
import { type NormalizeResult, normalize } from "./normalize";
import { Traverse } from "./traverse";
import { upgradeToPresentation4 } from "./upgrade";
import {
  containerTypes,
  createValidationReport,
  deepClone,
  ensureArray,
  getId,
  getType,
  identifyResourceType,
  isSpecificResource,
  PRESENTATION_4_CONTEXT,
  sceneComponentTypes,
  type ValidationIssue,
  type ValidationReport,
} from "./utilities";

export type ValidationMode = "tolerant" | "strict";

export type ValidateOptions = {
  mode?: ValidationMode;
  includePostNormalization?: boolean;
};

type ClassRequirement =
  (typeof presentation4ClassRequirements.classes)[keyof typeof presentation4ClassRequirements.classes];

type ClassRequirementStats = {
  nodesChecked: number;
  mustChecks: number;
  shouldChecks: number;
  allowedPropertyChecks: number;
  mustNotChecks: number;
};

const classRequirementsByType = new Map<string, { className: string; requirement: ClassRequirement }>(
  Object.entries(presentation4ClassRequirements.classes).map(([className, requirement]) => [
    requirement.typeValue,
    { className, requirement },
  ])
);

const scenePaintableTypes = new Set(["Canvas", "Scene", "Model", ...Array.from(sceneComponentTypes)]);
const annotationAggregateTypes = new Set(["Choice", "Composite", "List", "Independents"]);
const linkedResourceProperties = [
  "partOf",
  "target",
  "body",
  "source",
  "next",
  "prev",
  "first",
  "last",
  "annotations",
  "supplementary",
  "thumbnail",
  "seeAlso",
  "rendering",
  "homepage",
  "logo",
  "scope",
  "action",
  "default",
  "start",
];

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

function dedupeValidationIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const uniqueIssues: ValidationIssue[] = [];
  const exactKeys = new Set<string>();

  for (const current of issues) {
    const key = [
      current.code,
      current.severity,
      current.path,
      current.resourceId || "",
      current.resourceType || "",
      current.specRef || "",
      current.message,
    ].join("|");
    if (exactKeys.has(key)) {
      continue;
    }
    exactKeys.add(key);
    uniqueIssues.push(current);
  }

  const hasSpecificIssueByPath = new Map<string, boolean>();
  for (const current of uniqueIssues) {
    const isClassRequirement = current.code === "class-requirement-must" || current.code === "class-requirement-should";
    if (!isClassRequirement) {
      hasSpecificIssueByPath.set(`${current.severity}|${current.path}`, true);
    }
  }

  return uniqueIssues.filter((current) => {
    if (current.code !== "class-requirement-must" && current.code !== "class-requirement-should") {
      return true;
    }
    return !hasSpecificIssueByPath.get(`${current.severity}|${current.path}`);
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

function isPlainObject(value: any): boolean {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isAnnotationAggregate(value: any): boolean {
  return isPlainObject(value) && annotationAggregateTypes.has(getType(value) || "");
}

function getAnnotationEntries(value: any): any[] {
  if (isAnnotationAggregate(value)) {
    return Array.isArray((value as any).items) ? (value as any).items : [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

function validateAnnotationAggregate(
  aggregate: any,
  nodePath: string,
  property: "body" | "target",
  issues: ValidationIssue[],
  annotation: any
) {
  const aggregateType = getType(aggregate);
  const issueCodePrefix =
    property === "target" && aggregateType === "List" ? "annotation-target-list" : `annotation-${property}-aggregate`;

  if (!Array.isArray(aggregate.items)) {
    issue(issues, {
      code: `${issueCodePrefix}-items-array`,
      message: `Annotation.${property} ${aggregateType} must include an items array`,
      path: `${nodePath}.items`,
      resource: annotation,
      specRef: `#${property}`,
    });
    return;
  }

  if (aggregate.items.length === 0) {
    issue(issues, {
      code: `${issueCodePrefix}-items-empty`,
      message: `Annotation.${property} ${aggregateType} must include at least one item`,
      path: `${nodePath}.items`,
      resource: annotation,
      specRef: `#${property}`,
    });
  }

  for (let index = 0; index < aggregate.items.length; index++) {
    const entry = aggregate.items[index];
    const entryPath = `${nodePath}.items[${index}]`;
    if (!isPlainObject(entry)) {
      issue(issues, {
        code: `annotation-${property}-aggregate-entry-object`,
        message: `Annotation.${property} aggregate entries must be JSON objects`,
        path: entryPath,
        resource: annotation,
        specRef: `#${property}`,
      });
      continue;
    }
    if (!getType(entry)) {
      issue(issues, {
        code: `annotation-${property}-aggregate-entry-type-required`,
        message: `Annotation.${property} aggregate entries must include a type`,
        path: `${entryPath}.type`,
        resource: annotation,
        specRef: `#${property}`,
      });
    }
  }
}

function pathIsSpecificResourceSource(path: string): boolean {
  return /\.source(?:\[\d+\])?$/.test(path);
}

function isTypedReferenceObject(node: any): boolean {
  if (!isPlainObject(node) || !getId(node) || !getType(node)) {
    return false;
  }

  const type = getType(node);
  if (
    ["Collection", "CollectionPage", "Manifest", "Range", "Timeline", "Canvas", "Scene", "AnnotationCollection", "AnnotationPage"].includes(
      type || ""
    )
  ) {
    return !Object.hasOwn(node, "items");
  }
  if (type === "Annotation") {
    return !Object.hasOwn(node, "body") && !Object.hasOwn(node, "target") && !Object.hasOwn(node, "motivation");
  }
  if (type === "SpecificResource" || type === "TextualBody" || annotationAggregateTypes.has(type || "")) {
    return false;
  }

  return true;
}

function pathIsLinkedResourceValue(path: string): boolean {
  return linkedResourceProperties.some((property) =>
    new RegExp(`(?:^|\\.)${property}(?:\\[\\d+\\])?$`).test(path)
  );
}

function isTypedReferenceContext(node: any, path: string, parent: any): boolean {
  if (!isTypedReferenceObject(node)) {
    return false;
  }

  if (
    pathIsLinkedResourceValue(path) ||
    /\.target\.items\[\d+\]$/.test(path) ||
    /\.body\.items\[\d+\]$/.test(path) ||
    /\.structures\[\d+\]$/.test(path)
  ) {
    return true;
  }

  if (!/\.items\[\d+\]$/.test(path)) {
    return false;
  }

  const parentType = getType(parent) || "";
  return (
    ["Collection", "CollectionPage", "Range", "Canvas", "Timeline", "Scene"].includes(parentType) ||
    annotationAggregateTypes.has(parentType)
  );
}

function isLikelyReferenceCanvas(canvas: any): boolean {
  if (!isPlainObject(canvas)) {
    return false;
  }
  if (!getId(canvas) || getType(canvas) !== "Canvas") {
    return false;
  }
  if ("width" in canvas || "height" in canvas || "items" in canvas || "annotations" in canvas) {
    return false;
  }
  return true;
}

function isLikelyReferenceTimeline(timeline: any): boolean {
  if (!isPlainObject(timeline)) {
    return false;
  }
  if (!getId(timeline) || getType(timeline) !== "Timeline") {
    return false;
  }
  if ("duration" in timeline || "items" in timeline || "annotations" in timeline) {
    return false;
  }
  return true;
}

function isLikelyReferenceScene(scene: any): boolean {
  if (!isPlainObject(scene)) {
    return false;
  }
  if (!getId(scene) || getType(scene) !== "Scene") {
    return false;
  }
  if ("duration" in scene || "items" in scene || "annotations" in scene) {
    return false;
  }
  return true;
}

function isRangeContainerReference(node: any, nodePath: string, parent: any): boolean {
  if (!isPlainObject(node) || !isPlainObject(parent) || getType(parent) !== "Range") {
    return false;
  }

  const type = getType(node);
  return (
    (type === "Canvas" || type === "Timeline" || type === "Scene") &&
    isTypedReferenceContext(node, nodePath, parent)
  );
}

function isReferenceAnnotation(annotation: any): boolean {
  return getType(annotation) === "Annotation" && isTypedReferenceObject(annotation);
}

function validateAnnotationShape(annotation: any, nodePath: string, issues: ValidationIssue[]) {
  if (isReferenceAnnotation(annotation)) {
    return;
  }

  if (typeof annotation.bodyValue !== "undefined") {
    issue(issues, {
      code: "annotation-body-value-forbidden",
      message: "Annotation.bodyValue is not allowed; use TextualBody instead",
      path: `${nodePath}.bodyValue`,
      resource: annotation,
      specRef: "#Annotation",
    });
  }

  if (typeof annotation.target === "undefined") {
    issue(issues, {
      code: "annotation-target-required",
      message: "Annotation.target is required",
      path: `${nodePath}.target`,
      resource: annotation,
      specRef: "#target",
    });
  } else if (Array.isArray(annotation.target)) {
    issue(issues, {
      code: "annotation-target-array-forbidden",
      message: 'Annotation.target must be an object; use {"type":"List","items":[...]} for multiple targets',
      path: `${nodePath}.target`,
      resource: annotation,
      specRef: "#target",
    });
  } else if (!isPlainObject(annotation.target)) {
    issue(issues, {
      code: "annotation-target-object",
      message: "Annotation.target must be an object, or a List object with items",
      path: `${nodePath}.target`,
      resource: annotation,
      specRef: "#target",
    });
  } else {
    const targets = getAnnotationEntries(annotation.target);
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const targetPath = isAnnotationAggregate(annotation.target)
        ? `${nodePath}.target.items[${i}]`
        : `${nodePath}.target`;

      if (!isPlainObject(target)) {
        issue(issues, {
          code: "annotation-target-entry-object",
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
          message: "Annotation.target entries must include a type",
          path: `${targetPath}.type`,
          resource: annotation,
          specRef: "#target",
        });
      }

      const targetId = getId(target);
      if (!targetId && targetType !== "SpecificResource" && !annotationAggregateTypes.has(targetType || "")) {
        issue(issues, {
          code: "annotation-target-id-required",
          message: "Annotation.target entries must include an id",
          path: `${targetPath}.id`,
          resource: annotation,
          specRef: "#target",
        });
      }
    }

    if (isAnnotationAggregate(annotation.target)) {
      validateAnnotationAggregate(annotation.target, `${nodePath}.target`, "target", issues, annotation);
    }
  }

  if (typeof annotation.body !== "undefined") {
    if (Array.isArray(annotation.body)) {
      issue(issues, {
        code: "annotation-body-array-forbidden",
        message: 'Annotation.body must be an object; use {"type":"List","items":[...]} for multiple bodies',
        path: `${nodePath}.body`,
        resource: annotation,
        specRef: "#body",
      });
    } else if (!isPlainObject(annotation.body)) {
      issue(issues, {
        code: "annotation-body-object",
        message: "Annotation.body must be an object when present, or a List object with items",
        path: `${nodePath}.body`,
        resource: annotation,
        specRef: "#body",
      });
    } else if (!getType(annotation.body)) {
      issue(issues, {
        code: "annotation-body-type-required",
        message: "Annotation.body must include a type",
        path: `${nodePath}.body.type`,
        resource: annotation,
        specRef: "#body",
      });
    } else if (isAnnotationAggregate(annotation.body)) {
      validateAnnotationAggregate(annotation.body, `${nodePath}.body`, "body", issues, annotation);
    }
  }

  if (!isArrayOrUndefined(annotation.motivation)) {
    issue(issues, {
      code: "annotation-motivation-array",
      message: "Annotation.motivation must be an array",
      path: `${nodePath}.motivation`,
      resource: annotation,
      specRef: "#motivation",
    });
  }
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

function walkResourceTreeWithParent(
  resource: any,
  path: string,
  visitor: (node: any, nodePath: string, parent: any | undefined) => void,
  parent?: any
) {
  if (Array.isArray(resource)) {
    for (let i = 0; i < resource.length; i++) {
      walkResourceTreeWithParent(resource[i], `${path}[${i}]`, visitor, parent);
    }
    return;
  }

  if (!resource || typeof resource !== "object") {
    return;
  }

  visitor(resource, path, parent);

  for (const [key, value] of Object.entries(resource)) {
    if (value && typeof value === "object") {
      walkResourceTreeWithParent(value, `${path}.${key}`, visitor, resource);
    }
  }
}

function isCollectionMemberReference(node: any, nodePath: string, parent: any): boolean {
  const parentType = getType(parent);
  const type = getType(node);
  return (
    (parentType === "Collection" || parentType === "CollectionPage") &&
    (type === "Collection" || type === "Manifest") &&
    isTypedReferenceContext(node, nodePath, parent)
  );
}

function isTopLevelRangeReference(node: any, nodePath: string, parent: any): boolean {
  return (
    getType(node) === "Range" &&
    getType(parent) === "Manifest" &&
    isTypedReferenceContext(node, nodePath, parent)
  );
}

function runAuthoredDocumentValidation(resource: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isPlainObject(resource)) {
    issue(issues, {
      code: "presentation-4-document-object",
      message: "A Presentation 4 response must be a JSON object",
      path: "$",
      specRef: "#json-ld-contexts",
    });
    return issues;
  }

  const authored = resource as Record<string, any>;
  const context = authored["@context"];
  const contexts = Array.isArray(context) ? context : [context];
  const presentationContextCount = contexts.filter((value) => value === PRESENTATION_4_CONTEXT).length;
  if (
    presentationContextCount !== 1 ||
    (Array.isArray(context) && context[context.length - 1] !== PRESENTATION_4_CONTEXT) ||
    (!Array.isArray(context) && context !== PRESENTATION_4_CONTEXT)
  ) {
    issue(issues, {
      code: "presentation-4-context-required",
      message: `The top-level @context must contain ${PRESENTATION_4_CONTEXT} exactly once and as its final value`,
      path: "$.@context",
      resource: authored,
      specRef: "#json-ld-contexts",
    });
  }

  if (Object.hasOwn(authored, "@graph")) {
    issue(issues, {
      code: "presentation-4-graph-forbidden",
      message: "A Presentation 4 response must not include @graph at the top level",
      path: "$.@graph",
      resource: authored,
      specRef: "#json-ld-contexts",
    });
  }

  walkResourceTreeWithParent(authored, "$", (node, nodePath, parent) => {
    if (nodePath !== "$" && Object.hasOwn(node, "@context")) {
      issue(issues, {
        code: "presentation-4-embedded-context-forbidden",
        message: "Embedded resources must not include @context",
        path: `${nodePath}.@context`,
        resource: node,
        specRef: "#json-ld-contexts",
      });
    }

    if (isTypedReferenceContext(node, nodePath, parent)) {
      return;
    }

    const type = getType(node);
    if (type === "Collection" || type === "CollectionPage") {
      if (typeof node.items !== "undefined" && !Array.isArray(node.items)) {
        issue(issues, {
          code: `${type === "Collection" ? "collection" : "collection-page"}-items-array`,
          message: `${type}.items must be an array`,
          path: `${nodePath}.items`,
          resource: node,
          specRef: "#items",
        });
      }

      if (Array.isArray(node.items)) {
        for (let index = 0; index < node.items.length; index++) {
          const item = node.items[index];
          const itemPath = `${nodePath}.items[${index}]`;
          if (!isPlainObject(item)) {
            issue(issues, {
              code: "collection-member-object",
              message: `${type}.items entries must be JSON objects`,
              path: itemPath,
              resource: node,
              specRef: "#items",
            });
            continue;
          }
          if (!["Collection", "Manifest"].includes(getType(item) || "")) {
            issue(issues, {
              code: "collection-member-type",
              message: `${type}.items entries must be Collections or Manifests`,
              path: `${itemPath}.type`,
              resource: node,
              specRef: "#items",
            });
          }
          for (const property of ["id", "type", "label"]) {
            if (!hasProperty(item, property)) {
              issue(issues, {
                code: "collection-member-reference-required",
                message: `${type}.items references must include id, type and label`,
                path: `${itemPath}.${property}`,
                resource: item,
                specRef: "#Collection",
              });
            }
          }
        }
      }
    }

    if (type === "Collection") {
      const hasItems = Array.isArray(node.items);
      const hasFirst = typeof node.first !== "undefined";
      const hasLast = typeof node.last !== "undefined";
      if (!hasItems && !hasFirst && !hasLast) {
        issue(issues, {
          code: "collection-members-required",
          message: "Collection must include items, or first and last Collection Page references",
          path: nodePath,
          resource: node,
          specRef: "#Collection",
        });
      }
    }

    if (type === "CollectionPage") {
      if (!Array.isArray(node.partOf) || node.partOf.length === 0) {
        issue(issues, {
          code: "collection-page-part-of-array",
          message: "CollectionPage.partOf must be a non-empty array of Collection references",
          path: `${nodePath}.partOf`,
          resource: node,
          specRef: "#partOf",
        });
      } else {
        for (let index = 0; index < node.partOf.length; index++) {
          const parent = node.partOf[index];
          if (!isPlainObject(parent) || getType(parent) !== "Collection" || !getId(parent)) {
            issue(issues, {
              code: "collection-page-part-of-collection",
              message: "CollectionPage.partOf entries must reference a Collection with id and type",
              path: `${nodePath}.partOf[${index}]`,
              resource: node,
              specRef: "#partOf",
            });
          }
        }
      }
    }

    if (type === "Manifest" && Array.isArray(node.items)) {
      for (let index = 0; index < node.items.length; index++) {
        const item = node.items[index];
        if (
          isPlainObject(item) &&
          containerTypes.has(getType(item) || "") &&
          ((getType(item) === "Canvas" && isLikelyReferenceCanvas(item)) ||
            (getType(item) === "Timeline" && isLikelyReferenceTimeline(item)) ||
            (getType(item) === "Scene" && isLikelyReferenceScene(item)))
        ) {
          issue(issues, {
            code: "manifest-container-embedded-required",
            message: "Manifest.items Containers must be embedded, not reference-only objects",
            path: `${nodePath}.items[${index}]`,
            resource: item,
            specRef: "#Manifest",
          });
        }
      }
    }

    if (containerTypes.has(type || "") && typeof node.items !== "undefined") {
      if (!Array.isArray(node.items)) {
        issue(issues, {
          code: "container-items-array",
          message: `${type}.items must be an array of Annotation Pages`,
          path: `${nodePath}.items`,
          resource: node,
          specRef: "#items",
        });
      } else {
        for (let index = 0; index < node.items.length; index++) {
          const item = node.items[index];
          if (!isPlainObject(item) || getType(item) !== "AnnotationPage") {
            issue(issues, {
              code: "container-item-annotation-page",
              message: `${type}.items entries must be Annotation Pages`,
              path: `${nodePath}.items[${index}]`,
              resource: node,
              specRef: "#items",
            });
          }
        }
      }
    }

    if (type === "AnnotationPage" && !Array.isArray(node.items)) {
      issue(issues, {
        code: "annotation-page-items-array",
        message: "AnnotationPage.items must be an array",
        path: `${nodePath}.items`,
        resource: node,
        specRef: "#items",
      });
    }

    if (
      type === "Range" &&
      !isTopLevelRangeReference(node, nodePath, parent) &&
      (!Array.isArray(node.items) || node.items.length === 0)
    ) {
      issue(issues, {
        code: "range-items-required",
        message: "Range.items must be a non-empty array",
        path: `${nodePath}.items`,
        resource: node,
        specRef: "#items",
      });
    }

    if (type === "Range" && typeof node.supplementary !== "undefined") {
      const supplementary = node.supplementary;
      if (!isPlainObject(supplementary) || getType(supplementary) !== "AnnotationCollection" || !getId(supplementary)) {
        issue(issues, {
          code: "range-supplementary-annotation-collection",
          message: "Range.supplementary must be one AnnotationCollection reference with id and type",
          path: `${nodePath}.supplementary`,
          resource: node,
          specRef: "#supplementary",
        });
      }
    }

    if (type === "Annotation" && typeof node.exclude !== "undefined") {
      const allowedExcludeValues = new Set(["audio", "animations", "cameras", "lights"]);
      if (
        !Array.isArray(node.exclude) ||
        node.exclude.length === 0 ||
        node.exclude.some((value: unknown) => typeof value !== "string" || !allowedExcludeValues.has(value))
      ) {
        issue(issues, {
          code: "annotation-exclude-values",
          message: "Annotation.exclude must be a non-empty array containing audio, animations, cameras, or lights",
          path: `${nodePath}.exclude`,
          resource: node,
          specRef: "#exclude",
        });
      }
    }

    if ((type === "Annotation" || type === "SpecificResource") && typeof node.scope !== "undefined") {
      if (
        !Array.isArray(node.scope) ||
        node.scope.length === 0 ||
        node.scope.some((value: unknown) => !isPlainObject(value) || !getId(value) || !getType(value))
      ) {
        issue(issues, {
          code: "scope-reference-array",
          message: `${type}.scope must be a non-empty array of resource references with id and type`,
          path: `${nodePath}.scope`,
          resource: node,
          specRef: "#scope",
        });
      }
    }

    if (typeof node.via !== "undefined") {
      if (
        !Array.isArray(node.via) ||
        node.via.length === 0 ||
        node.via.some((value: unknown) => typeof value !== "string")
      ) {
        issue(issues, {
          code: "via-uri-array",
          message: "via must be a non-empty array of URI strings",
          path: `${nodePath}.via`,
          resource: node,
          specRef: "#via",
        });
      }
    }
  });

  return issues;
}

function hasProperty(resource: any, property: string): boolean {
  if (property === "id") {
    return typeof getId(resource) === "string";
  }
  if (property === "type") {
    return typeof getType(resource) === "string";
  }
  return typeof resource?.[property] !== "undefined";
}

function collectAllowedProperties(requirement: ClassRequirement): Set<string> {
  const allowed = new Set<string>([
    ...requirement.must,
    ...requirement.should,
    ...requirement.may,
    "@context",
    "@id",
    "@type",
  ]);
  return allowed;
}

function shouldCheckShouldProperty(className: string, property: string, node: any, parent: any): boolean {
  if (className === "AnnotationPage" && (property === "next" || property === "prev" || property === "partOf")) {
    const parentType = getType(parent);
    const isEmbeddedInCanvas = parentType === "Canvas";
    const hasPaginationLinks =
      typeof node?.next !== "undefined" || typeof node?.prev !== "undefined" || typeof node?.partOf !== "undefined";
    if (isEmbeddedInCanvas && !hasPaginationLinks) {
      return false;
    }
  }
  return true;
}

function checkCollectionMustNotRules(collection: any, nodePath: string, issues: ValidationIssue[]) {
  const hasFirst = typeof collection.first !== "undefined";
  const hasLast = typeof collection.last !== "undefined";
  if (hasFirst || hasLast) {
    const items = ensureArray(collection.items);
    if (items.length > 0) {
      issue(issues, {
        code: "collection-pages-items-exclusive",
        message: "Collection using first/last paging must not include items",
        path: `${nodePath}.items`,
        resource: collection,
        specRef: "#Collection",
      });
    }

    const firstId = getId(collection.first);
    const lastId = getId(collection.last);
    if (!hasFirst || !hasLast || !firstId || !lastId || firstId === lastId) {
      issue(issues, {
        code: "collection-pages-minimum-two",
        message: "Collection paging requires first and last pages that identify at least two distinct pages",
        path: nodePath,
        resource: collection,
        specRef: "#CollectionPage",
      });
    }
  }

  const items = ensureArray(collection.items);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemType = getType(item);
    if (itemType === "CollectionPage") {
      issue(issues, {
        code: "collection-item-collection-page-forbidden",
        message: "Collection.items must not embed CollectionPage resources",
        path: `${nodePath}.items[${i}]`,
        resource: collection,
        specRef: "#Collection",
      });
    }
    if (itemType === "Manifest" && Object.hasOwn(item, "items")) {
      issue(issues, {
        code: "collection-item-manifest-forbidden",
        message: "Collection.items must not embed Manifest resources",
        path: `${nodePath}.items[${i}]`,
        resource: collection,
        specRef: "#Collection",
      });
    }
  }
}

function checkManifestMustNotRules(manifest: any, nodePath: string, issues: ValidationIssue[]) {
  const annotationPages = ensureArray(manifest.annotations);
  for (let pageIndex = 0; pageIndex < annotationPages.length; pageIndex++) {
    const page = annotationPages[pageIndex];
    if (!isPlainObject(page)) {
      continue;
    }
    const annotations = ensureArray((page as any).items);
    for (let annotationIndex = 0; annotationIndex < annotations.length; annotationIndex++) {
      const annotation = annotations[annotationIndex];
      if (!isPlainObject(annotation) || getType(annotation) !== "Annotation") {
        continue;
      }
      const motivations = ensureArray((annotation as any).motivation);
      if (motivations.includes("painting")) {
        issue(issues, {
          code: "manifest-annotation-painting-forbidden",
          message: "Manifest-level annotations must not use motivation=painting",
          path: `${nodePath}.annotations[${pageIndex}].items[${annotationIndex}].motivation`,
          resource: annotation,
          specRef: "#Manifest",
        });
      }
    }
  }
}

function checkContainerMustNotRules(container: any, nodePath: string, issues: ValidationIssue[]) {
  const id = getId(container);
  if (id && id.includes("#")) {
    issue(issues, {
      code: "container-id-fragment-forbidden",
      message: "Container ids must not include URI fragments",
      path: `${nodePath}.id`,
      resource: container,
      specRef: "#Container",
    });
  }
}

function isAllowedScenePaintBody(body: any): boolean {
  if (!isPlainObject(body)) {
    return false;
  }

  const type = getType(body);
  if (!type) {
    return false;
  }

  if (type === "SpecificResource") {
    const source = (body as any).source;
    if (!isPlainObject(source)) {
      return true;
    }
    const sourceType = getType(source);
    return !!sourceType && scenePaintableTypes.has(sourceType);
  }

  return scenePaintableTypes.has(type);
}

function checkSceneMustNotRules(scene: any, nodePath: string, issues: ValidationIssue[]) {
  const annotationPages = ensureArray(scene.items);
  for (let pageIndex = 0; pageIndex < annotationPages.length; pageIndex++) {
    const page = annotationPages[pageIndex];
    if (!isPlainObject(page) || getType(page) !== "AnnotationPage") {
      continue;
    }

    const annotations = ensureArray((page as any).items);
    for (let annotationIndex = 0; annotationIndex < annotations.length; annotationIndex++) {
      const annotation = annotations[annotationIndex];
      if (!isPlainObject(annotation) || getType(annotation) !== "Annotation") {
        continue;
      }
      const motivations = ensureArray((annotation as any).motivation);
      if (!motivations.includes("painting")) {
        continue;
      }
      const bodyEntries = getAnnotationEntries((annotation as any).body);
      for (let bodyIndex = 0; bodyIndex < bodyEntries.length; bodyIndex++) {
        const body = bodyEntries[bodyIndex];
        if (!isAllowedScenePaintBody(body)) {
          issue(issues, {
            code: "scene-painting-non-3d-body",
            message: "Scene painting annotations must paint 3D resources, containers, or audio emitters",
            path: `${nodePath}.items[${pageIndex}].items[${annotationIndex}].body[${bodyIndex}]`,
            resource: annotation,
            specRef: "#Scene",
          });
        }
      }
    }
  }
}

function checkAnnotationMustNotRules(annotation: any, nodePath: string, issues: ValidationIssue[]) {
  if (typeof annotation.bodyValue !== "undefined") {
    issue(issues, {
      code: "annotation-body-value-forbidden",
      message: "Annotation.bodyValue is not allowed; use TextualBody instead",
      path: `${nodePath}.bodyValue`,
      resource: annotation,
      specRef: "#Annotation",
    });
  }

  const bodyEntries = getAnnotationEntries(annotation.body);
  for (let i = 0; i < bodyEntries.length; i++) {
    const body = bodyEntries[i];
    if (isPlainObject(body) && typeof (body as any).bodyValue !== "undefined") {
      issue(issues, {
        code: "annotation-body-entry-body-value-forbidden",
        message: "Annotation body entries must not include bodyValue; use TextualBody.value",
        path: `${nodePath}.body[${i}].bodyValue`,
        resource: annotation,
        specRef: "#Annotation",
      });
    }
  }
}

function checkStartPropertyRules(className: string, node: any, nodePath: string, issues: ValidationIssue[]) {
  if (typeof node?.start === "undefined") {
    return;
  }

  if (className !== "Collection" && className !== "Manifest" && className !== "Range") {
    issue(issues, {
      code: "start-property-forbidden-class",
      message: `${className} must not include start`,
      path: `${nodePath}.start`,
      resource: node,
      specRef: "#start",
    });
    return;
  }

  const start = node.start;
  if (!isPlainObject(start)) {
    issue(issues, {
      code: "start-property-object-required",
      message: "start must be a JSON object with id and type",
      path: `${nodePath}.start`,
      resource: node,
      specRef: "#start",
    });
    return;
  }

  const startId = getId(start);
  const startType = getType(start);
  if (!startId || !startType) {
    issue(issues, {
      code: "start-property-id-type-required",
      message: "start must include id and type",
      path: `${nodePath}.start`,
      resource: node,
      specRef: "#start",
    });
    return;
  }

  if (startType === "SpecificResource") {
    const source = (start as any).source;
    const selector = (start as any).selector;

    if (typeof selector === "undefined") {
      issue(issues, {
        code: "start-specific-resource-selector-required",
        message: "start SpecificResource must include selector",
        path: `${nodePath}.start.selector`,
        resource: node,
        specRef: "#start",
      });
    }

    if (typeof source === "string") {
      return;
    }

    if (!isPlainObject(source)) {
      issue(issues, {
        code: "start-specific-resource-source-required",
        message: "start SpecificResource must include source Canvas",
        path: `${nodePath}.start.source`,
        resource: node,
        specRef: "#start",
      });
      return;
    }

    if (getType(source) !== "Canvas" || !getId(source)) {
      issue(issues, {
        code: "start-specific-resource-source-canvas",
        message: "start SpecificResource source must reference a Canvas with id and type",
        path: `${nodePath}.start.source`,
        resource: node,
        specRef: "#start",
      });
    }
    return;
  }

  if (!containerTypes.has(startType)) {
    issue(issues, {
      code: "start-property-invalid-type",
      message: "start must reference a Container (Canvas, Scene, Timeline) or a SpecificResource",
      path: `${nodePath}.start.type`,
      resource: node,
      specRef: "#start",
    });
    return;
  }

  if (Object.hasOwn(start, "items")) {
    issue(issues, {
      code: "start-container-embedded-forbidden",
      message: "start Container must be a reference object and must not embed items",
      path: `${nodePath}.start.items`,
      resource: node,
      specRef: "#start",
    });
  }
}

export function runClassRequirementValidation(resource: any): {
  issues: ValidationIssue[];
  stats: ClassRequirementStats;
} {
  const issues: ValidationIssue[] = [];
  const stats: ClassRequirementStats = {
    nodesChecked: 0,
    mustChecks: 0,
    shouldChecks: 0,
    allowedPropertyChecks: 0,
    mustNotChecks: 0,
  };

  walkResourceTreeWithParent(resource, "$", (node, nodePath, parent) => {
    const type = getType(node);
    if (!type) {
      return;
    }

    const classRequirement = classRequirementsByType.get(type);
    if (!classRequirement) {
      return;
    }

    if (isTypedReferenceContext(node, nodePath, parent)) {
      return;
    }

    stats.nodesChecked++;
    const { className, requirement } = classRequirement;
    const rangeContainerReference = isRangeContainerReference(node, nodePath, parent);
    const collectionMemberReference = isCollectionMemberReference(node, nodePath, parent);
    const topLevelRangeReference = isTopLevelRangeReference(node, nodePath, parent);

    for (const property of requirement.must) {
      stats.mustChecks++;
      if (className === "Service" && (property === "id" || property === "type")) {
        continue;
      }
      if (
        className === "SpecificResource" &&
        property === "id" &&
        /\.target(?:\.items\[\d+\])?$/.test(nodePath)
      ) {
        continue;
      }
      if (rangeContainerReference && property !== "id" && property !== "type") {
        continue;
      }
      if (collectionMemberReference && property === "items") {
        continue;
      }
      if (topLevelRangeReference && property === "items") {
        continue;
      }
      if (property === "width" || property === "height") {
        if (isLikelyReferenceCanvas(node) || pathIsSpecificResourceSource(nodePath) || nodePath.includes(".target")) {
          continue;
        }
      }
      if (property === "duration") {
        if (isLikelyReferenceTimeline(node) || pathIsSpecificResourceSource(nodePath) || nodePath.includes(".target")) {
          continue;
        }
      }
      if (hasProperty(node, property)) {
        continue;
      }
      issue(issues, {
        code: "class-requirement-must",
        message: `${className} must include "${property}"`,
        path: `${nodePath}.${property}`,
        resource: node,
        severity: "error",
        specRef: presentation4ClassRequirements.spec.source,
      });
    }

    for (const property of requirement.should) {
      stats.shouldChecks++;
      if (rangeContainerReference) {
        continue;
      }
      if (collectionMemberReference && property !== "thumbnail") {
        continue;
      }
      if (topLevelRangeReference) {
        continue;
      }
      if (!shouldCheckShouldProperty(className, property, node, parent)) {
        continue;
      }
      if (hasProperty(node, property)) {
        continue;
      }
      issue(issues, {
        code: "class-requirement-should",
        message: `${className} should include "${property}"`,
        path: `${nodePath}.${property}`,
        resource: node,
        severity: "warning",
        specRef: presentation4ClassRequirements.spec.source,
      });
    }

    const allowedProperties = collectAllowedProperties(requirement);
    for (const property of Object.keys(node)) {
      stats.allowedPropertyChecks++;
      if (allowedProperties.has(property)) {
        continue;
      }
      issue(issues, {
        code: "class-requirement-property-not-listed",
        message: `${className} property "${property}" is not listed in must/should/may`,
        path: `${nodePath}.${property}`,
        resource: node,
        severity: "warning",
        specRef: presentation4ClassRequirements.spec.source,
      });
    }

    if (className === "Collection") {
      stats.mustNotChecks += 3;
      checkCollectionMustNotRules(node, nodePath, issues);
    }
    if (className === "CollectionPage") {
      stats.mustNotChecks += 1;
      if (getType(parent) === "Collection") {
        issue(issues, {
          code: "collection-page-embedded-in-collection",
          message: "CollectionPage resources must not be embedded within Collection.items",
          path: nodePath,
          resource: node,
          specRef: "#CollectionPage",
        });
      }
    }
    if (className === "Manifest") {
      stats.mustNotChecks += 2;
      checkManifestMustNotRules(node, nodePath, issues);
    }
    if (containerTypes.has(type)) {
      stats.mustNotChecks += 1;
      checkContainerMustNotRules(node, nodePath, issues);
    }
    if (className === "Scene") {
      stats.mustNotChecks += 1;
      checkSceneMustNotRules(node, nodePath, issues);
    }
    if (className === "Annotation") {
      stats.mustNotChecks += 1;
      checkAnnotationMustNotRules(node, nodePath, issues);
    }
    checkStartPropertyRules(className, node, nodePath, issues);
  });

  return { issues, stats };
}

export function runAuthoredShapeValidation(resource: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  walkResourceTree(resource, "$", (node, nodePath) => {
    if (getType(node) !== "Annotation") {
      return;
    }
    validateAnnotationShape(node, nodePath, issues);
  });

  return issues;
}

export function runRawValidation(resource: any, options: { skipAnnotationShape?: boolean } = {}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!options.skipAnnotationShape) {
    walkResourceTree(resource, "$", (node, nodePath) => {
      if (getType(node) !== "Annotation") {
        return;
      }
      validateAnnotationShape(node, nodePath, issues);
    });
  }

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
        if (isTypedReferenceContext(manifest, context.path, context.parent)) {
          return;
        }
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
        if (pathIsSpecificResourceSource(context.path) || isLikelyReferenceTimeline(timeline)) {
          return;
        }
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
        if (pathIsSpecificResourceSource(context.path) || isLikelyReferenceCanvas(canvas)) {
          return;
        }
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
        const motivations = ensureArray(annotation.motivation);
        if (motivations.includes("activating")) {
          const body = getAnnotationEntries(annotation.body);
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

function finishValidation(
  issues: ValidationIssue[],
  classRequirementStats: ClassRequirementStats,
  mode: ValidationMode
): ValidationReport {
  const report = createValidationReport(dedupeValidationIssues(issues), {
    classRequirements: classRequirementStats,
  });

  if (mode === "strict" && !report.valid) {
    const first = report.issues.find((item) => item.severity === "error") || report.issues[0];
    const error = new Error(first ? `${first.code}: ${first.message}` : "Validation failed");
    (error as any).report = report;
    throw error;
  }

  return report;
}

/**
 * Validates an authored Presentation 4 response as-is.
 *
 * Unlike validatePresentation4, this entry point does not upgrade legacy input
 * or repair Presentation 4 shapes before validating them.
 */
export function validateAuthoredPresentation4(input: unknown, options: ValidateOptions = {}): ValidationReport {
  const mode = options.mode || "tolerant";
  const authored = deepClone(input);
  const issues = [...runAuthoredDocumentValidation(authored), ...runAuthoredShapeValidation(authored)];
  const classRequirementResult = runClassRequirementValidation(authored);
  issues.push(...classRequirementResult.issues);
  issues.push(...runRawValidation(deepClone(authored), { skipAnnotationShape: true }));

  if (options.includePostNormalization === true) {
    issues.push(...runPostNormalizationValidation(normalize(deepClone(authored))));
  }

  return finishValidation(issues, classRequirementResult.stats, mode);
}

export function validatePresentation4(input: unknown, options: ValidateOptions = {}): ValidationReport {
  const mode = options.mode || "tolerant";
  const includePostNormalization =
    typeof options.includePostNormalization === "undefined" ? true : options.includePostNormalization;
  const hasContext = hasPresentation4Context(input);

  const issues: ValidationIssue[] = [];
  if (hasContext) {
    issues.push(...runAuthoredShapeValidation(input as any));
  }

  const upgraded = upgradeToPresentation4(input);
  const classRequirementResult = runClassRequirementValidation(upgraded);
  issues.push(...classRequirementResult.issues);
  issues.push(...runRawValidation(upgraded, { skipAnnotationShape: hasContext }));

  if (includePostNormalization) {
    const normalized = normalize(upgraded);
    issues.push(...runPostNormalizationValidation(normalized));
  }

  return finishValidation(issues, classRequirementResult.stats, mode);
}
