import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type { AgentLike, LinkedResource, ResourceReference, ServiceLike } from "./contentResource";
import type { Scene } from "./scene";

export type TimelineItem =
  | AnnotationPage
  | ResourceReference<"AnnotationPage" | "Canvas" | "Scene" | "Timeline">
  | string;
export type TimelineAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Timeline = Prettify<{
  id: string;
  type: "Timeline";
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  label?: InternationalString | null | undefined;
  metadata?: MetadataItem[] | undefined;
  summary?: InternationalString | null | undefined;
  requiredStatement?: MetadataItem | null | undefined;
  rights?: string | null | undefined;
  navDate?: string | null | undefined;
  duration: number;
  items?: Array<TimelineItem>;
  annotations?: Array<TimelineAnnotation>;
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
  supplementary?: Array<LinkedResource>;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;
  canonical?: string;
  via?: Array<string>;
}>;
