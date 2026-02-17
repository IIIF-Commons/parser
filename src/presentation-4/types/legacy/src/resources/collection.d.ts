import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { ViewingDirection } from "../iiif/technical";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type {
  AgentLike,
  LinkedResource,
  OneOrMany,
  ResourceReference,
  ServiceLike,
  SpecificResource,
} from "./contentResource";
import type { Manifest } from "./manifest";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type CollectionItem = Collection | Manifest | ResourceReference<"Collection" | "Manifest"> | string;
export type CollectionAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Collection = Prettify<{
  // Unchanged from P3.
  id: string;
  type: "Collection";
  viewingDirection?: NonNullable<ViewingDirection> | undefined;
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  label: InternationalString;
  metadata?: MetadataItem[] | undefined;
  summary?: InternationalString | undefined;
  requiredStatement?: MetadataItem | undefined;
  rights?: string | undefined;
  navDate?: string | undefined;
  "@context"?: string | string[] | undefined;
  navPlace?: Prettify<GeoJSON> | undefined;

  // New for P4.
  items?: Array<CollectionItem>;
  annotations?: Array<CollectionAnnotation>;
  thumbnail?: Array<LinkedResource>;
  provider?: Array<AgentLike | ResourceReference<"Agent">>;
  seeAlso?: Array<LinkedResource>;
  service?: Array<ServiceLike>;
  services?: Array<ServiceLike>;
  rendering?: Array<LinkedResource>;
  homepage?: Array<LinkedResource>;
  partOf?: OneOrMany<LinkedResource>;
  start?: SpecificResource | ResourceReference<"Canvas" | "Scene" | "Timeline"> | string | null;
  first?: string | ResourceReference<"CollectionPage">;
  last?: string | ResourceReference<"CollectionPage">;
  total?: number;
  canonical?: string;
  via?: OneOrMany<string>;
  logo?: Array<LinkedResource>;
  supplementary?: Array<LinkedResource>;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;
}>;

export type CollectionItemSchemas = "Collection" | "Manifest";
