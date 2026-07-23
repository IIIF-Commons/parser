import type { Range as RangeV3 } from "../../../../../presentation-3/types/legacy/src/resources/range";
import type { InternationalString } from "../../../../../presentation-3/types/legacy/src/iiif/descriptive";
import type { SpecificationBehaviors } from "../../../../../presentation-3/types/legacy/src/iiif/technical";
import type { LiteralUnion, Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { ViewingDirection } from "../iiif/technical";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type {
  AgentLike,
  LinkedResource,
  MetadataItem,
  ResourceReference,
  ServiceLike,
  SpecificResource,
  Start,
} from "./contentResource";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type RangeItem =
  | Range
  | Canvas
  | Scene
  | Timeline
  | SpecificResource
  | ResourceReference<"Range" | "Canvas" | "Scene" | "Timeline">;

export type RangeAnnotation = AnnotationPage | ResourceReference<"AnnotationPage">;

export type Range = Prettify<{
  id: string;
  type: "Range";
  viewingDirection?: NonNullable<ViewingDirection> | undefined;
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  label?: InternationalString;
  metadata?: MetadataItem[] | undefined;
  summary?: InternationalString | undefined;
  requiredStatement?: MetadataItem | undefined;
  rights?: string | undefined;
  navDate?: string | undefined;
  navPlace?: Prettify<GeoJSON> | undefined;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;

  items?: Array<RangeItem>;
  annotations?: Array<RangeAnnotation>;
  thumbnail?: Array<LinkedResource>;
  provider?: Array<AgentLike | ResourceReference<"Agent">>;
  seeAlso?: Array<LinkedResource>;
  service?: Array<ServiceLike>;
  services?: Array<ServiceLike>;
  rendering?: Array<LinkedResource>;
  homepage?: Array<LinkedResource>;
  partOf?: Array<LinkedResource>;
  logo?: Array<LinkedResource>;
  supplementary?: ResourceReference<"AnnotationCollection">;
  start?: Start;
  canonical?: string;
  via?: Array<string>;
}>;
