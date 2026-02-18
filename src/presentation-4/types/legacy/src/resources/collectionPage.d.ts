import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { AgentLike, LinkedResource, MetadataItem, ResourceReference, ServiceLike } from "./contentResource";

export type CollectionPageItem = ResourceReference<"Collection" | "Manifest">;

export type CollectionPage = Prettify<{
  id: string;
  type: "CollectionPage";
  partOf: Array<ResourceReference<"Collection">>;
  items: Array<CollectionPageItem>;
  next?: string | ResourceReference<"CollectionPage">;
  prev?: string | ResourceReference<"CollectionPage">;
  startIndex?: number;
  metadata?: Array<MetadataItem>;
  summary?: InternationalString | null | undefined;
  provider?: Array<AgentLike | ResourceReference<"Agent">> | undefined;
  thumbnail?: Array<LinkedResource> | undefined;
  requiredStatement?: MetadataItem | null | undefined;
  rights?: string | null | undefined;
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  seeAlso?: Array<LinkedResource>;
  service?: Array<ServiceLike>;
  homepage?: Array<LinkedResource>;
  rendering?: Array<LinkedResource>;
  canonical?: string;
  via?: Array<string>;
  annotations?: Array<ResourceReference<"AnnotationPage">>;
}>;
