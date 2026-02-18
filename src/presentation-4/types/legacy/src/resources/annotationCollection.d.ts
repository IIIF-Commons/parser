import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { Canvas } from "./canvas";
import type {
  AgentLike,
  ContentResourceLike,
  LinkedResource,
  MetadataItem,
  ResourceReference,
  ServiceLike,
} from "./contentResource";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type AnnotationCollection = Prettify<{
  id: string;
  type: "AnnotationCollection";
  viewingDirection?: NonNullable<ViewingDirection> | undefined;
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  label: InternationalString | null;
  summary?: InternationalString | null | undefined;
  requiredStatement?: MetadataItem | null | undefined;
  rights?: string | null | undefined;
  navDate?: string | null | undefined;
  navPlace?: Prettify<GeoJSON> | undefined;
  thumbnail?: Array<ContentResourceLike> | undefined;
  provider?: Array<AgentLike | ResourceReference<"Agent">> | undefined;
  "@context"?: string | undefined;
  total?: number | undefined;
  first: string | ResourceReference<"AnnotationPage">;
  last: string | ResourceReference<"AnnotationPage">;
  annotations?: Array<ResourceReference<"AnnotationPage"> | string>;
  canonical?: string;
  via?: Array<string>;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;

  metadata?: Array<MetadataItem>;
  seeAlso?: Array<LinkedResource>;
  service?: Array<ServiceLike>;
  services?: Array<ServiceLike>;
  rendering?: Array<LinkedResource>;
  homepage?: Array<LinkedResource>;
  partOf?: Array<LinkedResource>;
  logo?: Array<LinkedResource>;
  supplementary?: Array<LinkedResource>;
}>;
