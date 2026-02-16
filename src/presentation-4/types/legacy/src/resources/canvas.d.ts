import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { Quantity } from "../iiif/technical-v4";
import type { AnnotationPage } from "./annotationPage";
import type { AgentLike, LinkedResource, OneOrMany, ResourceReference, ServiceLike } from "./contentResource";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type CanvasItem =
  | AnnotationPage
  | ResourceReference<"AnnotationPage" | "Canvas" | "Scene" | "Timeline">
  | string;
export type CanvasAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Canvas = Prettify<
  Omit<
    CanvasV3,
    | "items"
    | "annotations"
    | "timeMode"
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
    type: "Canvas";
    items?: OneOrMany<CanvasItem>;
    annotations?: OneOrMany<CanvasAnnotation>;
    thumbnail?: OneOrMany<LinkedResource>;
    provider?: OneOrMany<AgentLike | ResourceReference<"Agent">>;
    seeAlso?: OneOrMany<LinkedResource>;
    service?: OneOrMany<ServiceLike>;
    services?: OneOrMany<ServiceLike>;
    navPlace?: Prettify<GeoJSON>;
    rendering?: OneOrMany<LinkedResource>;
    homepage?: OneOrMany<LinkedResource>;
    partOf?: OneOrMany<LinkedResource>;
    logo?: OneOrMany<LinkedResource>;
    supplementary?: OneOrMany<LinkedResource>;
    spatialScale?: Quantity | null;
    timeMode?: string | null;
    backgroundColor?: string | null;
    placeholderContainer?: Canvas | Timeline | Scene | null;
    accompanyingContainer?: Canvas | Timeline | Scene | null;
  }
>;

export type CanvasItemSchemas = "AnnotationPage" | "Canvas" | "Scene" | "Timeline";
