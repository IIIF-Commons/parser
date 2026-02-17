import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type { AgentLike, LinkedResource, OneOrMany, ResourceReference, ServiceLike } from "./contentResource";
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
  "@context"?: string | string[] | undefined;
  duration: number;
  items?: OneOrMany<TimelineItem>;
  annotations?: OneOrMany<TimelineAnnotation>;
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
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;
  canonical?: string;
  via?: OneOrMany<string>;
}>;
