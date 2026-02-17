import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Annotation } from "./annotation";
import type {
  AgentLike,
  ContentResourceLike,
  LinkedResource,
  MetadataItem,
  OneOrMany,
  ResourceReference,
  ServiceLike,
} from "./contentResource";

export type AnnotationPage = Prettify<{
  // Unchanged from V3.
  id: string;
  type: "AnnotationPage";
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  label?: InternationalString | null | undefined;
  summary?: InternationalString | null | undefined;
  requiredStatement?: MetadataItem | null | undefined;
  rights?: string | null | undefined;
  thumbnail?: OneOrMany<ContentResourceLike> | undefined;
  provider?: OneOrMany<AgentLike | ResourceReference<"Agent">> | undefined;
  "@context"?: string | undefined;
  next?: string | undefined;
  prev?: string | undefined;
  startIndex?: number | undefined;

  // New for P4.
  items: OneOrMany<Annotation | ContentResourceLike | ResourceReference | string>;
  metadata?: OneOrMany<MetadataItem>;
  seeAlso?: OneOrMany<LinkedResource>;
  service?: OneOrMany<ServiceLike>;
  services?: OneOrMany<ServiceLike>;
  rendering?: OneOrMany<LinkedResource>;
  homepage?: OneOrMany<LinkedResource>;
  partOf?: OneOrMany<LinkedResource>;
  canonical?: string;
  via?: OneOrMany<string>;
  annotations?: OneOrMany<ResourceReference<"AnnotationPage"> | string>;
  logo?: OneOrMany<LinkedResource>;
  supplementary?: OneOrMany<LinkedResource>;
}>;
