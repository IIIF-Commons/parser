import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { ViewingDirection } from "../iiif/technical";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type { AgentLike, LinkedResource, ResourceReference, ServiceLike, Start } from "./contentResource";
import type { Manifest } from "./manifest";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type CollectionItem = Collection | ResourceReference<"Collection" | "Manifest">;
export type CollectionAnnotation = AnnotationPage | ResourceReference<"AnnotationPage">;

type CollectionBase = {
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
  annotations?: Array<CollectionAnnotation>;
  thumbnail?: Array<LinkedResource>;
  provider?: Array<AgentLike | ResourceReference<"Agent">>;
  seeAlso?: Array<LinkedResource>;
  service?: Array<ServiceLike>;
  services?: Array<ServiceLike>;
  rendering?: Array<LinkedResource>;
  homepage?: Array<LinkedResource>;
  partOf?: Array<LinkedResource>;
  start?: Start;
  canonical?: string;
  via?: Array<string>;
  logo?: Array<LinkedResource>;
  supplementary?: Array<LinkedResource>;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;
};

type CollectionWithItems = {
  items: Array<CollectionItem>;
  first?: never;
  last?: never;
  total?: never;
};

type CollectionWithPages = {
  items?: never;
  first: string | ResourceReference<"CollectionPage">;
  last: string | ResourceReference<"CollectionPage">;
  total?: number;
};

export type Collection = Prettify<CollectionBase & (CollectionWithItems | CollectionWithPages)>;

export type CollectionItemSchemas = "Collection" | "Manifest";
