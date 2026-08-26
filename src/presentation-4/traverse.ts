import { splitCanvasFragment } from "../shared/canvas-fragments";
import { compose } from "../shared/compose";
import { ensureArray } from "../shared/ensure-array";
import type {
  Agent,
  Annotation,
  AnnotationCollection,
  AnnotationPage,
  Canvas,
  Collection,
  CollectionPage,
  ContentResourceLike,
  ListResource,
  Manifest,
  Quantity,
  Range,
  Scene,
  Selector,
  Service,
  SpecificResource,
  Timeline,
  Transform,
} from "./types";
import {
  annotationTypes,
  containerTypes,
  getId,
  getType,
  identifyResourceType,
  isQuantity,
  isSelector,
  isSpecificResource,
  mintDeterministicId,
  sceneComponentTypes,
  structuralTypes,
} from "./utilities";

export type Presentation4Resource =
  | Collection
  | CollectionPage
  | Manifest
  | Timeline
  | Canvas
  | Scene
  | AnnotationPage
  | AnnotationCollection
  | Annotation
  | ContentResourceLike
  | Range
  | Service
  | Agent
  | SpecificResource
  | Selector
  | Quantity
  | Transform;

export type TraversalContext = {
  parent?: Presentation4Resource;
  path: string;
  typeHint?: string;
};

export type Traversal<T = Presentation4Resource> = (resource: T, context: TraversalContext) => unknown;

export type AllTraversal = <Resource extends Presentation4Resource>(
  resource: Resource,
  context: TraversalContext
) => unknown;

export type TraversalMap = {
  collection?: Array<Traversal<Collection>>;
  collectionPage?: Array<Traversal<CollectionPage>>;
  manifest?: Array<Traversal<Manifest>>;
  timeline?: Array<Traversal<Timeline>>;
  canvas?: Array<Traversal<Canvas>>;
  scene?: Array<Traversal<Scene>>;
  annotationCollection?: Array<Traversal<AnnotationCollection>>;
  annotationPage?: Array<Traversal<AnnotationPage>>;
  annotation?: Array<Traversal<Annotation>>;
  contentResource?: Array<Traversal<ContentResourceLike>>;
  range?: Array<Traversal<Range>>;
  service?: Array<Traversal<Service>>;
  agent?: Array<Traversal<Agent>>;
  specificResource?: Array<Traversal<SpecificResource>>;
  selector?: Array<Traversal<Selector>>;
  quantity?: Array<Traversal<Quantity>>;
  transform?: Array<Traversal<Transform>>;
};

export type TraverseOptions = {
  allowUndefinedReturn: boolean;
  coerceContainerTargetsToSpecificResources: boolean;
  legacyPresentation3Behavior: boolean;
  coerceLegacyPointSelectorTime: boolean;
};

type UnknownTraversalArgs = {
  parent?: Presentation4Resource;
  path: string;
  typeHint?: string;
};

const linkedResourceKeys = ["thumbnail", "homepage", "rendering", "seeAlso", "supplementary", "logo"] as const;

const linkedObjectKeys = ["placeholderContainer", "accompanyingContainer", "start"] as const;
const multiItemContentResourceTypes = new Set(["Choice", "Composite", "List", "Independents"]);
const audioEmitterTypes = new Set(["AmbientAudio", "PointAudio", "SpotAudio"]);

function isResourceReference(resource: any): boolean {
  if (!resource || typeof resource !== "object" || Array.isArray(resource)) {
    return false;
  }
  if (typeof resource.id !== "string" || typeof resource.type !== "string") {
    return false;
  }
  if (resource.type === "SpecificResource") {
    return false;
  }
  return Object.keys(resource).every((key) => key === "id" || key === "type");
}

export class Traverse {
  private traversals: Required<TraversalMap>;
  private options: TraverseOptions;

  constructor(traversals: TraversalMap = {}, options: Partial<TraverseOptions> = {}) {
    this.traversals = {
      collection: [],
      collectionPage: [],
      manifest: [],
      timeline: [],
      canvas: [],
      scene: [],
      annotationCollection: [],
      annotationPage: [],
      annotation: [],
      contentResource: [],
      range: [],
      service: [],
      agent: [],
      specificResource: [],
      selector: [],
      quantity: [],
      transform: [],
      ...traversals,
    };
    this.options = {
      allowUndefinedReturn: false,
      coerceContainerTargetsToSpecificResources: false,
      legacyPresentation3Behavior: false,
      coerceLegacyPointSelectorTime: true,
      ...options,
    };
  }

  static all(traversal: AllTraversal) {
    return new Traverse({
      collection: [traversal],
      collectionPage: [traversal],
      manifest: [traversal],
      timeline: [traversal],
      canvas: [traversal],
      scene: [traversal],
      annotationCollection: [traversal],
      annotationPage: [traversal],
      annotation: [traversal],
      contentResource: [traversal],
      range: [traversal],
      service: [traversal],
      agent: [traversal],
      specificResource: [traversal],
      selector: [traversal],
      quantity: [traversal],
      transform: [traversal],
    });
  }

  private traverseLinkedResources(resource: any, path: string) {
    if (!resource || typeof resource !== "object") {
      return resource;
    }

    for (const key of linkedResourceKeys) {
      if (resource[key]) {
        resource[key] = ensureArray(resource[key]).map((item: any, index: number) =>
          this.traverseContentResource(item, resource, `${path}.${key}[${index}]`)
        );
      }
    }

    if (resource.provider) {
      resource.provider = ensureArray(resource.provider).map((item: any, index: number) =>
        this.traverseAgent(item, resource, `${path}.provider[${index}]`)
      );
    }

    if (resource.service) {
      resource.service = ensureArray(resource.service).map((item: any, index: number) =>
        this.traverseService(item, resource, `${path}.service[${index}]`)
      );
    }

    if (resource.services) {
      resource.services = ensureArray(resource.services).map((item: any, index: number) =>
        this.traverseService(item, resource, `${path}.services[${index}]`)
      );
    }

    if (resource.partOf) {
      resource.partOf = ensureArray(resource.partOf).map((item: any, index: number) =>
        typeof item === "string"
          ? item
          : this.traverseUnknown(item, {
              parent: resource,
              path: `${path}.partOf[${index}]`,
            })
      );
    }

    for (const key of linkedObjectKeys) {
      if (resource[key]) {
        if (key === "start" && this.options.coerceContainerTargetsToSpecificResources) {
          const specificResource = this.toSpecificResource(resource[key], "Canvas");
          const sourceValue = resource[key];
          const isAlreadySpecificResource = isSpecificResource(sourceValue);
          const hasSpecificResourceFields =
            !!sourceValue &&
            typeof sourceValue === "object" &&
            !Array.isArray(sourceValue) &&
            ("source" in sourceValue ||
              "selector" in sourceValue ||
              "transform" in sourceValue ||
              "action" in sourceValue);

          if (
            specificResource &&
            (specificResource.selector || isAlreadySpecificResource || hasSpecificResourceFields)
          ) {
            resource[key] = this.traverseSpecificResource(specificResource, "Canvas", resource, `${path}.${key}`);
            continue;
          }
        }
        resource[key] = this.traverseUnknown(resource[key], {
          parent: resource,
          path: `${path}.${key}`,
        });
      }
    }

    if (resource.navPlace && typeof resource.navPlace === "object") {
      resource.navPlace = this.traverseType(resource.navPlace, { parent: resource, path: `${path}.navPlace` }, []);
    }

    return resource;
  }

  private traverseContainerItems(container: any, path: string) {
    if (!container || typeof container !== "object") {
      return container;
    }

    if (container.items) {
      container.items = ensureArray(container.items).map((item: any, index: number) => {
        const itemType = identifyResourceType(item);
        if (itemType === "AnnotationPage") {
          return this.traverseAnnotationPage(item, container, `${path}.items[${index}]`);
        }
        return this.traverseUnknown(item, {
          parent: container,
          path: `${path}.items[${index}]`,
        });
      });
    }

    if (container.annotations) {
      container.annotations = ensureArray(container.annotations).map((item: any, index: number) =>
        this.traverseAnnotationPage(item, container, `${path}.annotations[${index}]`)
      );
    }

    return container;
  }

  private traverseManifestItems(manifest: any, path: string) {
    if (manifest.items) {
      if (this.options.legacyPresentation3Behavior) {
        ensureArray(manifest.items).forEach((item: any, index: number) => {
          this.traverseUnknown(item, {
            path: `${path}.items[${index}]`,
          });
        });
      } else {
        manifest.items = ensureArray(manifest.items).map((item: any, index: number) =>
          this.traverseUnknown(item, {
            parent: manifest,
            path: `${path}.items[${index}]`,
          })
        );
      }
    }
    if (manifest.structures) {
      if (this.options.legacyPresentation3Behavior) {
        manifest.structures = ensureArray(manifest.structures).map((item: any, index: number) =>
          this.traverseRange(item, undefined, `${path}.structures[${index}]`)
        );
      } else {
        manifest.structures = ensureArray(manifest.structures).map((item: any, index: number) =>
          this.traverseRange(item, manifest, `${path}.structures[${index}]`)
        );
      }
    }
    return manifest;
  }

  private traverseCollectionItems(collection: any, path: string) {
    if (collection.items) {
      if (this.options.legacyPresentation3Behavior) {
        ensureArray(collection.items).forEach((item: any, index: number) => {
          this.traverseUnknown(item, {
            path: `${path}.items[${index}]`,
          });
        });
      } else {
        collection.items = ensureArray(collection.items).map((item: any, index: number) =>
          this.traverseUnknown(item, {
            parent: collection,
            path: `${path}.items[${index}]`,
          })
        );
      }
    }
    return collection;
  }

  traverseCollection(collection: Collection, parent?: Presentation4Resource, path?: string): Collection;
  traverseCollection(collection: any, parent?: any, path = "$"): any {
    const withCollectionItems = this.traverseCollectionItems(collection, path);
    const withContainerItems = this.options.legacyPresentation3Behavior
      ? withCollectionItems
      : this.traverseContainerItems(withCollectionItems, path);
    const withPaging = this.traversePagingReferences(withContainerItems, path, "CollectionPage");

    return this.traverseType(
      this.traverseLinkedResources(withPaging, path),
      { parent, path },
      this.traversals.collection
    );
  }

  traverseCollectionPage(collectionPage: CollectionPage, parent?: Presentation4Resource, path?: string): CollectionPage;
  traverseCollectionPage(collectionPage: any, parent?: any, path = "$"): any {
    const withItems = this.traverseCollectionItems(collectionPage, path);
    const withLinks = this.traversePageReferences(withItems, path, "CollectionPage");
    return this.traverseType(
      this.traverseLinkedResources(withLinks, path),
      { parent, path },
      this.traversals.collectionPage
    );
  }

  traverseManifest(manifest: Manifest, parent?: Presentation4Resource, path?: string): Manifest;
  traverseManifest(manifest: any, parent?: any, path = "$"): any {
    const pipeline = compose<any>(
      (value: any) => this.traverseManifestItems(value, path),
      (value: any) => this.traverseContainerItems(value, path),
      (value: any) => this.traverseLinkedResources(value, path)
    );
    return this.traverseType(pipeline(manifest), { parent, path }, this.traversals.manifest);
  }

  traverseTimeline(timeline: Timeline, parent?: Presentation4Resource, path?: string): Timeline;
  traverseTimeline(timeline: any, parent?: any, path = "$"): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseContainerItems(timeline, path), path),
      { parent, path },
      this.traversals.timeline
    );
  }

  traverseCanvas(canvas: Canvas, parent?: Presentation4Resource, path?: string): Canvas;
  traverseCanvas(canvas: any, parent?: any, path = "$"): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseContainerItems(canvas, path), path),
      { parent, path },
      this.traversals.canvas
    );
  }

  traverseScene(scene: Scene, parent?: Presentation4Resource, path?: string): Scene;
  traverseScene(scene: any, parent?: any, path = "$"): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseContainerItems(scene, path), path),
      { parent, path },
      this.traversals.scene
    );
  }

  private traverseAnnotationItems(page: any, path: string) {
    if (page.items) {
      page.items = ensureArray(page.items).map((item: any, index: number) =>
        this.traverseUnknown(item, {
          parent: page,
          path: `${path}.items[${index}]`,
          typeHint: "Annotation",
        })
      );
    }
    return page;
  }

  private traversePagingReferences(resource: any, path: string, typeHint: "CollectionPage" | "AnnotationPage") {
    if (!resource || typeof resource !== "object") {
      return resource;
    }

    for (const key of ["first", "last"] as const) {
      if (!resource[key]) {
        continue;
      }

      if (typeof resource[key] === "string") {
        resource[key] = {
          id: resource[key],
          type: typeHint,
        };
        continue;
      }

      resource[key] = this.traverseUnknown(resource[key], {
        parent: resource,
        path: `${path}.${key}`,
        typeHint,
      });
    }

    return resource;
  }

  private traversePageReferences(resource: any, path: string, typeHint: "CollectionPage" | "AnnotationPage") {
    if (!resource || typeof resource !== "object") {
      return resource;
    }

    for (const key of ["next", "prev"] as const) {
      if (!resource[key]) {
        continue;
      }
      resource[key] =
        typeof resource[key] === "string"
          ? { id: resource[key], type: typeHint }
          : {
              ...resource[key],
              type: getType(resource[key]) || typeHint,
            };
    }

    return resource;
  }

  traverseAnnotationPage(annotationPage: AnnotationPage, parent?: Presentation4Resource, path?: string): AnnotationPage;
  traverseAnnotationPage(annotationPage: any, parent?: any, path = "$"): any {
    return this.traverseType(
      this.traverseLinkedResources(this.traverseAnnotationItems(annotationPage, path), path),
      { parent, path },
      this.traversals.annotationPage
    );
  }

  traverseAnnotationCollection(
    annotationCollection: AnnotationCollection,
    parent?: Presentation4Resource,
    path?: string
  ): AnnotationCollection;
  traverseAnnotationCollection(annotationCollection: any, parent?: any, path = "$"): any {
    return this.traverseType(
      this.traverseLinkedResources(
        this.traversePagingReferences(this.traverseAnnotationItems(annotationCollection, path), path, "AnnotationPage"),
        path
      ),
      { parent, path },
      this.traversals.annotationCollection
    );
  }

  private traverseAnnotationBody(annotation: any, path: string) {
    if (annotation.body === null || typeof annotation.body === "undefined") {
      annotation.body = null;
      return annotation;
    }

    const bodyValues = ensureArray(annotation.body)
      .map((body: any, index: number) => {
        if (typeof body === "string") {
          return this.traverseContentResource(
            {
              id: body,
              type: "ContentResource",
            } as ContentResourceLike,
            annotation,
            `${path}.body[${index}]`
          );
        }
        if (!body || typeof body !== "object") {
          return undefined;
        }
        return this.traverseUnknown(body, {
          parent: annotation,
          path: `${path}.body[${index}]`,
          typeHint: "ContentResource",
        });
      })
      .filter((body: any) => !!body);

    if (bodyValues.length === 0) {
      annotation.body = null;
      return annotation;
    }

    annotation.body = this.toSingleAnnotationObject(bodyValues, annotation, `${path}.body`);
    return annotation;
  }

  private traverseAnnotationTarget(annotation: any, path: string) {
    const targetValues = ensureArray(annotation.target);
    const targets = targetValues
      .map((target: any, index: number) =>
        this.traverseAnnotationTargetValue(target, annotation, `${path}.target[${index}]`)
      )
      .filter((target: any) => !!target);

    annotation.target = this.toSingleAnnotationObject(targets, annotation, `${path}.target`);
    return annotation;
  }

  private traverseAnnotationTargetValue(target: any, annotation: any, targetPath: string): any {
    if (isSpecificResource(target)) {
      return this.traverseSpecificResource(target, undefined, annotation, targetPath);
    }

    const typeHint = this.getContainerTypeHint(target, "Canvas");
    const targetType = getType(target);

    if (
      target &&
      typeof target === "object" &&
      !Array.isArray(target) &&
      targetType &&
      multiItemContentResourceTypes.has(targetType) &&
      "items" in target
    ) {
      return this.traverseContentResource(
        {
          ...target,
          items: ensureArray((target as any).items)
            .map((item: any, index: number) =>
              this.traverseAnnotationTargetValue(item, annotation, `${targetPath}.items[${index}]`)
            )
            .filter((item: any) => !!item),
        },
        annotation,
        targetPath
      );
    }

    const implicitSpecificResource = this.toImplicitSpecificResource(target, typeHint);
    if (implicitSpecificResource) {
      return this.traverseSpecificResource(implicitSpecificResource, typeHint, annotation, targetPath);
    }

    if (this.options.coerceContainerTargetsToSpecificResources) {
      const specificResource = this.toSpecificResource(target, typeHint);
      if (specificResource) {
        return this.traverseSpecificResource(specificResource, typeHint, annotation, targetPath);
      }
    }

    if (typeof target === "string") {
      const specificResource = this.toSpecificResource(target, typeHint);
      if (specificResource?.selector) {
        return this.traverseSpecificResource(specificResource, typeHint, annotation, targetPath);
      }
      return {
        id: target,
        type: typeHint,
      };
    }

    if (targetType && containerTypes.has(targetType)) {
      const specificResource = this.toSpecificResource(target, typeHint);
      if (specificResource && specificResource.selector) {
        return this.traverseSpecificResource(specificResource, typeHint, annotation, targetPath);
      }
    }

    if (isResourceReference(target)) {
      return target;
    }
    return this.traverseUnknown(target, {
      parent: annotation,
      path: targetPath,
    });
  }

  traverseAnnotation(annotation: Annotation, parent?: Presentation4Resource, path?: string): Annotation;
  traverseAnnotation(annotation: any, parent?: any, path = "$"): any {
    if (annotation.position && typeof annotation.position === "object") {
      annotation.position = this.traversePosition(annotation.position, annotation, `${path}.position`);
    }
    return this.traverseType(
      this.traverseLinkedResources(
        this.traverseAnnotationTarget(this.traverseAnnotationBody(annotation, path), path),
        path
      ),
      { parent, path },
      this.traversals.annotation
    );
  }

  traverseSelector(selector: Selector, parent?: Presentation4Resource, path?: string): Selector;
  traverseSelector(selector: any, parent?: any, path = "$"): any {
    if (
      this.options.coerceLegacyPointSelectorTime &&
      selector &&
      typeof selector === "object" &&
      !Array.isArray(selector) &&
      selector.type === "PointSelector" &&
      Object.hasOwn(selector, "t")
    ) {
      if (typeof selector.instant === "undefined" && Number.isFinite(selector.t)) {
        selector.instant = selector.t;
      }
      delete selector.t;
    }

    if (selector.refinedBy) {
      selector.refinedBy = this.traverseSelector(selector.refinedBy, selector, `${path}.refinedBy`);
    }
    return this.traverseType(selector, { parent, path }, this.traversals.selector);
  }

  traverseQuantity(quantity: Quantity, parent?: Presentation4Resource, path?: string): Quantity;
  traverseQuantity(quantity: any, parent?: any, path = "$"): any {
    return this.traverseType(quantity, { parent, path }, this.traversals.quantity);
  }

  traverseTransform(transform: Transform, parent?: Presentation4Resource, path?: string): Transform;
  traverseTransform(transform: any, parent?: any, path = "$"): any {
    return this.traverseType(transform, { parent, path }, this.traversals.transform);
  }

  private traversePosition(position: any, parent: any, path: string): any {
    if (isSpecificResource(position)) {
      return this.traverseSpecificResource(position, undefined, parent, path);
    }
    if (isSelector(position)) {
      return this.traverseSelector(position, parent, path);
    }
    return position;
  }

  traverseSpecificResource(
    specificResource: SpecificResource,
    typeHint?: string,
    parent?: Presentation4Resource,
    path?: string
  ): SpecificResource;
  traverseSpecificResource(specificResource: any, typeHint?: string, parent?: any, path = "$"): any {
    const normalizedSpecificResource = this.toSpecificResource(specificResource, typeHint || "Canvas");
    if (normalizedSpecificResource) {
      specificResource = normalizedSpecificResource;
    }

    const source = specificResource.source;
    const sourceItem = Array.isArray(source) ? source[0] : source;
    let nextSource: any;

    if (typeof sourceItem === "string") {
      const [id] = splitCanvasFragment(sourceItem);
      nextSource = {
        id,
        type: typeHint || "ContentResource",
      };
    } else if (sourceItem && typeof sourceItem === "object") {
      const sourceWasDetailedObject = Object.keys(sourceItem).some(
        (key) => key !== "id" && key !== "@id" && key !== "type" && key !== "@type"
      );
      const traversedSource = this.traverseUnknown(sourceItem, {
        parent,
        path: Array.isArray(source) ? `${path}.source[0]` : `${path}.source`,
        typeHint: typeHint || "ContentResource",
      });

      nextSource =
        this.options.legacyPresentation3Behavior && sourceWasDetailedObject && isResourceReference(traversedSource)
          ? {
              ...sourceItem,
              id: getId(traversedSource) || getId(sourceItem),
              type: getType(traversedSource) || getType(sourceItem) || typeHint || "ContentResource",
            }
          : traversedSource;
    }

    const selectors = ensureArray(specificResource.selector).map((selector: any, index: number) =>
      this.traverseSelector(selector, specificResource, `${path}.selector[${index}]`)
    );
    specificResource.selector = selectors;

    const transforms = ensureArray(specificResource.transform).map((transform: any, index: number) =>
      this.traverseTransform(transform, specificResource, `${path}.transform[${index}]`)
    );
    specificResource.transform = transforms;

    if (specificResource.position && typeof specificResource.position === "object") {
      specificResource.position = this.traversePosition(
        specificResource.position,
        specificResource,
        `${path}.position`
      );
    }

    if (nextSource) {
      specificResource.source = nextSource;
    }

    return this.traverseType(specificResource, { parent, path }, this.traversals.specificResource);
  }

  traverseContentResource(
    contentResource: ContentResourceLike,
    parent?: Presentation4Resource,
    path?: string
  ): ContentResourceLike;
  traverseContentResource(contentResource: any, parent?: any, path = "$"): any {
    if (!contentResource || typeof contentResource !== "object") {
      if (this.options.legacyPresentation3Behavior && typeof contentResource === "string") {
        return { id: contentResource, type: "ContentResource" };
      }
      return contentResource;
    }

    if (isSpecificResource(contentResource)) {
      return this.traverseSpecificResource(contentResource, "ContentResource", parent, path);
    }

    if (isQuantity(contentResource)) {
      return this.traverseQuantity(contentResource, parent, path);
    }

    if (isSelector(contentResource)) {
      return this.traverseSelector(contentResource, parent, path);
    }

    if (audioEmitterTypes.has(contentResource.type) && contentResource.source) {
      contentResource.source = this.traverseUnknown(contentResource.source, {
        parent: contentResource,
        path: `${path}.source`,
        typeHint: "Audio",
      });
    }

    if (contentResource.type === "ImageBasedLight" && contentResource.environmentMap) {
      contentResource.environmentMap = this.traverseContentResource(
        contentResource.environmentMap,
        contentResource,
        `${path}.environmentMap`
      );
    }

    if (contentResource.lookAt && typeof contentResource.lookAt === "object") {
      if (isSpecificResource(contentResource.lookAt)) {
        contentResource.lookAt = this.traverseSpecificResource(
          contentResource.lookAt,
          undefined,
          contentResource,
          `${path}.lookAt`
        );
      } else if (isSelector(contentResource.lookAt)) {
        contentResource.lookAt = this.traverseSelector(contentResource.lookAt, contentResource, `${path}.lookAt`);
      } else if (getType(contentResource.lookAt) === "Annotation" && !isResourceReference(contentResource.lookAt)) {
        contentResource.lookAt = this.traverseAnnotation(contentResource.lookAt, contentResource, `${path}.lookAt`);
      }
    }

    if (contentResource.position && typeof contentResource.position === "object") {
      contentResource.position = this.traversePosition(contentResource.position, contentResource, `${path}.position`);
    }

    if (contentResource.intensity && isQuantity(contentResource.intensity)) {
      contentResource.intensity = this.traverseQuantity(
        contentResource.intensity,
        contentResource,
        `${path}.intensity`
      );
    }

    if (contentResource.volume && isQuantity(contentResource.volume)) {
      contentResource.volume = this.traverseQuantity(contentResource.volume, contentResource, `${path}.volume`);
    }

    if (multiItemContentResourceTypes.has(contentResource.type) && contentResource.items) {
      contentResource.items = ensureArray(contentResource.items).map((item: any, index: number) =>
        this.traverseContentResource(item, contentResource, `${path}.items[${index}]`)
      );
    }

    if (contentResource.annotations) {
      contentResource.annotations = ensureArray(contentResource.annotations).map((item: any, index: number) =>
        this.traverseAnnotationPage(item, contentResource, `${path}.annotations[${index}]`)
      );
    }

    if (contentResource.service) {
      contentResource.service = ensureArray(contentResource.service).map((service: any, index: number) =>
        this.traverseService(service, contentResource, `${path}.service[${index}]`)
      );
    }

    if (contentResource.services) {
      contentResource.services = ensureArray(contentResource.services).map((service: any, index: number) =>
        this.traverseService(service, contentResource, `${path}.services[${index}]`)
      );
    }

    return this.traverseType(
      this.traverseLinkedResources(contentResource, path),
      { parent, path },
      this.traversals.contentResource
    );
  }

  traverseRange(range: Range, parent?: Presentation4Resource, path?: string): Range;
  traverseRange(range: any, parent?: any, path = "$"): any {
    if (range.items) {
      range.items = ensureArray(range.items).map((item: any, index: number) => {
        if (isSpecificResource(item)) {
          return this.traverseSpecificResource(item, "Canvas", range, `${path}.items[${index}]`);
        }
        if (this.options.coerceContainerTargetsToSpecificResources) {
          const typeHint = this.getContainerTypeHint(item, "Canvas");
          const specificResource = this.toSpecificResource(item, typeHint);
          if (specificResource) {
            return this.traverseSpecificResource(specificResource, typeHint, range, `${path}.items[${index}]`);
          }
        }
        return this.traverseUnknown(item, {
          parent: range,
          path: `${path}.items[${index}]`,
        });
      });
    }
    return this.traverseType(this.traverseLinkedResources(range, path), { parent, path }, this.traversals.range);
  }

  traverseAgent(agent: Agent, parent?: Presentation4Resource, path?: string): Agent;
  traverseAgent(agent: any, parent?: any, path = "$"): any {
    return this.traverseType(this.traverseLinkedResources(agent, path), { parent, path }, this.traversals.agent);
  }

  traverseService(service: Service, parent?: Presentation4Resource, path?: string): Service;
  traverseService(service: any, parent?: any, path = "$"): any {
    if (service && typeof service === "object" && service.service) {
      service.service = ensureArray(service.service).map((innerService: any, index: number) =>
        this.traverseService(innerService, service, `${path}.service[${index}]`)
      );
    }
    return this.traverseType(service, { parent, path }, this.traversals.service);
  }

  private toSingleAnnotationObject(values: any[], parent: any, path: string): any {
    if (values.length === 1 && values[0] && typeof values[0] === "object") {
      return values[0];
    }

    const listResource: ListResource = {
      id: mintDeterministicId(
        {
          type: "List",
          items: values,
        },
        "ContentResource",
        path
      ),
      type: "List",
      items: values,
    };

    return this.traverseContentResource(listResource, parent, path);
  }

  private traverseType<T>(object: T, context: TraversalContext, traversals: Array<Traversal<T>>): T {
    return traversals.reduce((acc: T, traversal: Traversal<T>): T => {
      const returnValue = traversal(acc, context) as T | undefined;
      if (typeof returnValue === "undefined") {
        return acc;
      }
      return returnValue;
    }, object);
  }

  private getContainerTypeHint(resource: any, fallbackType = "Canvas"): string {
    const type = getType(resource);
    if (type && containerTypes.has(type)) {
      return type;
    }
    return fallbackType;
  }

  private toSpecificResource(target: any, typeHint = "Canvas"): any | undefined {
    if (Array.isArray(target) || target === null || typeof target === "undefined") {
      return undefined;
    }

    if (typeof target === "string") {
      const [id, fragment] = splitCanvasFragment(target);
      const specificResource: any = {
        type: "SpecificResource",
        source: {
          id,
          type: typeHint,
        },
      };
      if (fragment) {
        specificResource.selector = {
          type: "FragmentSelector",
          value: fragment,
        };
      }
      return specificResource;
    }

    if (typeof target !== "object") {
      return undefined;
    }

    if (isSpecificResource(target)) {
      const normalized = { ...target };
      if (Array.isArray(normalized.source)) {
        normalized.source = normalized.source[0];
      }
      if (typeof normalized.source === "string") {
        normalized.source = {
          id: normalized.source,
          type: typeHint,
        };
      } else if (normalized.source && typeof normalized.source === "object" && !Array.isArray(normalized.source)) {
        if (!getType(normalized.source)) {
          normalized.source = {
            ...normalized.source,
            type: typeHint,
          };
        }
      } else if (getId(normalized)) {
        normalized.source = {
          id: getId(normalized),
          type: typeHint,
        };
      }

      if (
        normalized.source &&
        typeof normalized.source === "object" &&
        !Array.isArray(normalized.source) &&
        typeof normalized.source.id === "string"
      ) {
        const [id, fragment] = splitCanvasFragment(normalized.source.id);
        normalized.source = {
          ...normalized.source,
          id,
        };
        if (!normalized.selector && fragment) {
          normalized.selector = {
            type: "FragmentSelector",
            value: fragment,
          };
        }
      }

      return normalized;
    }

    const targetType = getType(target);
    if (targetType && !containerTypes.has(targetType)) {
      return undefined;
    }

    const targetId = getId(target);
    if (!targetId) {
      return undefined;
    }

    const source: any = {
      ...target,
      id: targetId,
      type: targetType || typeHint,
    };
    const [id, fragment] = splitCanvasFragment(source.id);
    source.id = id;

    const specificResource: any = {
      type: "SpecificResource",
      source,
    };
    if (fragment) {
      specificResource.selector = {
        type: "FragmentSelector",
        value: fragment,
      };
    }
    return specificResource;
  }

  private toImplicitSpecificResource(target: any, typeHint = "Canvas"): any | undefined {
    if (!target || typeof target !== "object" || Array.isArray(target) || getType(target)) {
      return undefined;
    }

    const targetId = getId(target);
    const hasSpecificResourceFields =
      "source" in target || "selector" in target || "transform" in target || "action" in target;
    const [, fragment] = splitCanvasFragment(targetId);

    if (!hasSpecificResourceFields && !fragment) {
      return undefined;
    }

    if (hasSpecificResourceFields) {
      return this.toSpecificResource(
        {
          ...target,
          type: "SpecificResource",
        },
        typeHint
      );
    }

    return this.toSpecificResource(target, typeHint);
  }

  traverseUnknown(resource: unknown, options: UnknownTraversalArgs): Presentation4Resource;
  traverseUnknown(resource: any, { parent, path, typeHint }: UnknownTraversalArgs): any {
    const type = identifyResourceType(resource, typeHint);

    switch (type) {
      case "Collection":
        return this.traverseCollection(resource, parent, path);
      case "CollectionPage":
        return this.traverseCollectionPage(resource, parent, path);
      case "Manifest":
        return this.traverseManifest(resource, parent, path);
      case "Timeline":
        return this.traverseTimeline(resource, parent, path);
      case "Canvas":
        return this.traverseCanvas(resource, parent, path);
      case "Scene":
        return this.traverseScene(resource, parent, path);
      case "AnnotationCollection":
        return this.traverseAnnotationCollection(resource, parent, path);
      case "AnnotationPage":
        return this.traverseAnnotationPage(resource, parent, path);
      case "Annotation":
        return this.traverseAnnotation(resource, parent, path);
      case "Range":
        return this.traverseRange(resource, parent, path);
      case "SpecificResource":
        return this.traverseSpecificResource(resource, undefined, parent, path);
      case "Selector":
        return this.traverseSelector(resource, parent, path);
      case "Quantity":
        return this.traverseQuantity(resource, parent, path);
      case "Transform":
        return this.traverseTransform(resource, parent, path);
      case "Service":
        return this.traverseService(resource, parent, path);
      case "Agent":
        return this.traverseAgent(resource, parent, path);
      case "ContentResource":
        return this.traverseContentResource(resource, parent, path);
      default: {
        if (
          containerTypes.has(type) ||
          structuralTypes.has(type) ||
          annotationTypes.has(type) ||
          sceneComponentTypes.has(type)
        ) {
          return this.traverseContentResource(resource, parent, path);
        }
        throw new Error(`Unknown or unsupported resource type ${type}`);
      }
    }
  }
}

export const traverse = new Traverse();
