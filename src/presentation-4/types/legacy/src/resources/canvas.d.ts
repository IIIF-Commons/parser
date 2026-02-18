import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { Quantity } from "../iiif/technical";
import type { AnnotationPage } from "./annotationPage";
import type { AgentLike, LinkedResource, ResourceReference, ServiceLike } from "./contentResource";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type CanvasItem =
  | AnnotationPage
  | ResourceReference<"AnnotationPage" | "Canvas" | "Scene" | "Timeline">
  | string;
export type CanvasAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Canvas = Prettify<{
  // Unchanged from P3.
  id: string;
  type: "Canvas";
  height: number;
  width: number;
  duration?: number | undefined;
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  label?: InternationalString | null | undefined;
  metadata?: MetadataItem[] | undefined;
  summary?: InternationalString | null | undefined;
  requiredStatement?: MetadataItem | null | undefined;
  rights?: string | null | undefined;
  navDate?: string | null | undefined;

  // New for P4.
  items?: CanvasItem[];
  annotations?: CanvasAnnotation[];
  thumbnail?: LinkedResource[];
  provider?: Array<AgentLike | ResourceReference<"Agent">>;
  seeAlso?: LinkedResource[];
  service?: ServiceLike[];
  services?: ServiceLike[];
  navPlace?: Prettify<GeoJSON>;
  rendering?: LinkedResource[];
  homepage?: LinkedResource[];
  partOf?: LinkedResource[];
  logo?: LinkedResource[];
  supplementary?: LinkedResource[];
  canonical?: string;
  via?: string[];
  spatialScale?: Quantity | null;
  timeMode?: string | null;
  backgroundColor?: string | null;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;
}>;

export type CanvasItemSchemas = "AnnotationPage" | "Canvas" | "Scene" | "Timeline";
