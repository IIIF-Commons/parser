import { presentation4ClassRequirements } from "./meta/class-requirements";
import { type NormalizeResult, normalize } from "./normalize";
import { Traverse } from "./traverse";
import { upgradeToPresentation4 } from "./upgrade";
import {
  containerTypes,
  createValidationReport,
  ensureArray,
  getId,
  getType,
  identifyResourceType,
  isSpecificResource,
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

function isPlainObject(value: any): boolean {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isListWrapper(value: any): boolean {
  return isPlainObject(value) && getType(value) === "List" && Object.hasOwn(value, "items");
}

function getAnnotationEntries(value: any): any[] {
  if (isListWrapper(value)) {
    return ensureArray((value as any).items);
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

function pathIsSpecificResourceSource(path: string): boolean {
  return /\.source(?:\[\d+\])?$/.test(path);
}

function pathIsReferenceContext(path: string): boolean {
  return (
    /(?:^|\.)partOf(?:\[\d+\])?(?:$|\.|\[)/.test(path) ||
    /(?:^|\.)target(?:$|\.|\[)/.test(path) ||
    /(?:^|\.)next(?:$|\.|\[)/.test(path) ||
    /(?:^|\.)prev(?:$|\.|\[)/.test(path) ||
    /(?:^|\.)first(?:$|\.|\[)/.test(path) ||
    /(?:^|\.)last(?:$|\.|\[)/.test(path) ||
    /(?:^|\.)annotations\[\d+\](?:$|\.|\[)/.test(path) ||
    /(?:^|\.)supplementary\[\d+\](?:$|\.|\[)/.test(path)
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

function isReferenceAnnotation(annotation: any): boolean {
  if (!isPlainObject(annotation) || getType(annotation) !== "Annotation" || !getId(annotation)) {
    return false;
  }

  const hasTarget = typeof annotation.target !== "undefined";
  const hasBody = typeof annotation.body !== "undefined";
  const motivations = ensureArray(annotation.motivation);
  const hasMotivations = motivations.length > 0;

  if (hasTarget || hasBody || hasMotivations) {
    return false;
  }

  const allowedReferenceKeys = new Set([
    "id",
    "type",
    "@id",
    "@type",
    "label",
    "summary",
    "profile",
    "format",
    "height",
    "width",
    "duration",
    "motivation",
    "target",
    "body",
    "first",
    "last",
    "next",
    "prev",
    "total",
  ]);

  return Object.keys(annotation).every((key) => allowedReferenceKeys.has(key));
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
      const targetPath = isListWrapper(annotation.target) ? `${nodePath}.target.items[${i}]` : `${nodePath}.target`;

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
      if (!targetId && targetType !== "SpecificResource") {
        issue(issues, {
          code: "annotation-target-id-required",
          message: "Annotation.target entries must include an id",
          path: `${targetPath}.id`,
          resource: annotation,
          specRef: "#target",
        });
      }
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
    if (itemType === "Manifest") {
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

    if (pathIsReferenceContext(nodePath)) {
      return;
    }

    stats.nodesChecked++;
    const { className, requirement } = classRequirement;

    for (const property of requirement.must) {
      stats.mustChecks++;
      if (className === "Service" && (property === "id" || property === "type")) {
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

  const report = createValidationReport(issues, {
    classRequirements: {
      nodesChecked: classRequirementResult.stats.nodesChecked,
      mustChecks: classRequirementResult.stats.mustChecks,
      shouldChecks: classRequirementResult.stats.shouldChecks,
      allowedPropertyChecks: classRequirementResult.stats.allowedPropertyChecks,
      mustNotChecks: classRequirementResult.stats.mustNotChecks,
    },
  });

  if (mode === "strict" && !report.valid) {
    const first = report.issues.find((item) => item.severity === "error") || report.issues[0];
    const error = new Error(first ? `${first.code}: ${first.message}` : "Validation failed");
    (error as any).report = report;
    throw error;
  }

  return report;
}
