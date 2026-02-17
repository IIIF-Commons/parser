import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { Quantity } from "../iiif/technical";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type { AgentLike, LinkedResource, OneOrMany, ResourceReference, ServiceLike } from "./contentResource";
import type { Timeline } from "./timeline";

export type SceneItem = AnnotationPage | ResourceReference<"AnnotationPage" | "Canvas" | "Scene" | "Timeline"> | string;
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
    "@context"?: string | string[] | undefined;

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
    partOf?: OneOrMany<LinkedResource>;
    logo?: Array<LinkedResource>;
    supplementary?: Array<LinkedResource>;
    canonical?: string;
    via?: OneOrMany<string>;
    spatialScale?: Quantity | null;
    backgroundColor?: string | null;
    placeholderContainer?: Canvas | Timeline | Scene | null;
    accompanyingContainer?: Canvas | Timeline | Scene | null;
  }
>;
