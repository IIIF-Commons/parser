import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { InternationalString } from "../../../../../presentation-3/types/legacy/src/iiif/descriptive";
import type { SpecificationBehaviors } from "../../../../../presentation-3/types/legacy/src/iiif/technical";
import type { LiteralUnion, Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { InteractionMode, Quantity } from "../iiif/technical";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type { AgentLike, LinkedResource, MetadataItem, ResourceReference, ServiceLike } from "./contentResource";
import type { Timeline } from "./timeline";

export type SceneItem = AnnotationPage | ResourceReference<"AnnotationPage">;
export type SceneAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Scene = Prettify<
  Omit<
    CanvasV3,
    | "type"
    | "width"
    | "height"
    | "timeMode"
    | "viewingDirection"
    | "items"
    | "annotations"
    | "placeholderCanvas"
    | "accompanyingCanvas"
    | "thumbnail"
    | "provider"
    | "seeAlso"
    | "service"
    | "services"
    | "rendering"
    | "homepage"
    | "partOf"
    | "logo"
    | "supplementary"
  > & {
    id: string;
    type: "Scene";

    // From canvas.
    duration?: number | undefined;
    behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
    label?: InternationalString | null | undefined;
    metadata?: MetadataItem[] | undefined;
    summary?: InternationalString | null | undefined;
    requiredStatement?: MetadataItem | null | undefined;
    rights?: string | null | undefined;
    navDate?: string | null | undefined;

    // New for P4.
    items?: Array<SceneItem>;
    annotations?: Array<SceneAnnotation>;
    thumbnail?: Array<LinkedResource>;
    provider?: Array<AgentLike | ResourceReference<"Agent">>;
    seeAlso?: Array<LinkedResource>;
    service?: Array<ServiceLike>;
    services?: Array<ServiceLike>;
    navPlace?: Prettify<GeoJSON>;
    rendering?: Array<LinkedResource>;
    homepage?: Array<LinkedResource>;
    partOf?: Array<LinkedResource>;
    logo?: Array<LinkedResource>;
    canonical?: string;
    via?: Array<string>;
    interactionMode?: InteractionMode[];
    spatialScale?: Quantity | null;
    backgroundColor?: string | null;
    placeholderContainer?: Canvas | Timeline | Scene | null;
    accompanyingContainer?: Canvas | Timeline | Scene | null;
  }
>;
