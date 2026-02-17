import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type {
  AgentLike,
  LinkedResource,
  MetadataItem,
  OneOrMany,
  ResourceReference,
  ServiceLike,
} from "./contentResource";

export type CollectionPageItem = ResourceReference<"Collection" | "Manifest"> | string;

export type CollectionPage = Prettify<{
  id: string;
  type: "CollectionPage";
  partOf: OneOrMany<ResourceReference<"Collection"> | string>;
  items: OneOrMany<CollectionPageItem>;
  next?: string | ResourceReference<"CollectionPage">;
  prev?: string | ResourceReference<"CollectionPage">;
  startIndex?: number;
  metadata?: OneOrMany<MetadataItem>;
  summary?: InternationalString | null | undefined;
  provider?: OneOrMany<AgentLike | ResourceReference<"Agent">> | undefined;
  thumbnail?: OneOrMany<LinkedResource> | undefined;
  requiredStatement?: MetadataItem | null | undefined;
  rights?: string | null | undefined;
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  seeAlso?: OneOrMany<LinkedResource>;
  service?: OneOrMany<ServiceLike>;
  homepage?: OneOrMany<LinkedResource>;
  rendering?: OneOrMany<LinkedResource>;
  canonical?: string;
  via?: OneOrMany<string>;
  annotations?: OneOrMany<ResourceReference<"AnnotationPage"> | string>;
}>;
