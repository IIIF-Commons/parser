import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { Annotation } from "./annotation";
import type { Canvas } from "./canvas";
import type {
  AgentLike,
  ContentResourceLike,
  LinkedResource,
  MetadataItem,
  OneOrMany,
  ResourceReference,
  ServiceLike,
  SpecificResource,
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
  thumbnail?: OneOrMany<ContentResourceLike> | undefined;
  provider?: OneOrMany<AgentLike | ResourceReference<"Agent">> | undefined;
  "@context"?: string | undefined;
  total?: number | undefined;
  first: string | ResourceReference<"AnnotationPage">;
  last: string | ResourceReference<"AnnotationPage">;
  start?: SpecificResource | ResourceReference<"Canvas" | "Scene" | "Timeline"> | string | null;
  annotations?: OneOrMany<ResourceReference<"AnnotationPage"> | string>;
  canonical?: string;
  via?: OneOrMany<string>;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;

  items?: OneOrMany<Annotation | ContentResourceLike | ResourceReference | string>;
  metadata?: OneOrMany<MetadataItem>;
  seeAlso?: OneOrMany<LinkedResource>;
  service?: OneOrMany<ServiceLike>;
  services?: OneOrMany<ServiceLike>;
  rendering?: OneOrMany<LinkedResource>;
  homepage?: OneOrMany<LinkedResource>;
  partOf?: OneOrMany<LinkedResource>;
  logo?: OneOrMany<LinkedResource>;
  supplementary?: OneOrMany<LinkedResource>;
}>;
