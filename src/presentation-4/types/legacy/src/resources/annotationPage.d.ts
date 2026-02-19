import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Annotation } from "./annotation";
import type {
  AgentLike,
  ContentResourceLike,
  LinkedResource,
  MetadataItem,
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
  thumbnail?: Array<ContentResourceLike> | undefined;
  provider?: Array<AgentLike | ResourceReference<"Agent">> | undefined;
  next?: string | undefined;
  prev?: string | undefined;
  startIndex?: number | undefined;

  // New for P4.
  items: Array<Annotation>;
  metadata?: Array<MetadataItem>;
  seeAlso?: Array<LinkedResource>;
  service?: Array<ServiceLike>;
  services?: Array<ServiceLike>;
  rendering?: Array<LinkedResource>;
  homepage?: Array<LinkedResource>;
  partOf?: Array<LinkedResource>;
  canonical?: string;
  via?: Array<string>;
  annotations?: Array<ResourceReference<"AnnotationPage"> | string>;
  logo?: Array<LinkedResource>;
  supplementary?: Array<LinkedResource>;
}>;
