import type { AnyMotivation, W3CMotivation } from "../../../../../presentation-3/types/legacy/src/resources/annotation";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { GeoJSON } from "../../../../../shared/geojson";
import type { Selector } from "../extensions/presentation-4";
import type { ExcludeType, Provides, Transform } from "../iiif/technical";
import type {
  AgentLike,
  ContentResourceLike,
  LinkedResource,
  OneOrMany,
  ResourceReference,
  ServiceLike,
  SpecificResource,
} from "./contentResource";

export type AnnotationMotivation = AnyMotivation | W3CMotivation | "contentState" | "activating" | string;
export type AnnotationBody =
  | ContentResourceLike
  | SpecificResource
  | ResourceReference
  | string
  | Record<string, unknown>;
export type AnnotationTarget = SpecificResource | ResourceReference | string | Record<string, unknown>;

export type ContentStateAnnotation = {
  id?: string;
  type: "Annotation";
  motivation: "contentState";
  target: OneOrMany<AnnotationTarget>;
  body?: OneOrMany<AnnotationBody>;
  action?: OneOrMany<Transform | ResourceReference | string | Record<string, unknown>>;
  [key: string]: unknown;
};

export type ActivatingAnnotation = {
  id?: string;
  type: "Annotation";
  motivation: "activating";
  body: OneOrMany<AnnotationBody>;
  target: OneOrMany<AnnotationTarget>;
  [key: string]: unknown;
};

export type Annotation = Prettify<{
  // Unchanged from V3.
  id: string;
  type: "Annotation";
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  rights?: string | string[] | undefined;
  label?: InternationalString | null | undefined;
  metadata?: MetadataItem[] | undefined;
  summary?: InternationalString | null | undefined;
  requiredStatement?: MetadataItem | null | undefined;
  created?: string | undefined;
  generated?: string | undefined;
  modified?: string | undefined;
  creator?: Creator | undefined;
  generator?: Creator | undefined;
  audience?: Audience | Audience[] | undefined;
  accessibility?: string | string[] | undefined;
  canonical?: string | undefined;
  via?: string | (string[] & string) | undefined;
  "@context"?: "http://www.w3.org/ns/anno.jsonld" | undefined;
  stylesheet?: (string | Stylesheet) | undefined;
  textGranularity?: TextGranularityOptions | undefined;
  navDate?: string | undefined;
  navPlace?: Prettify<GeoJSON> | undefined;

  // New for P4
  motivation: OneOrMany<AnnotationMotivation>;
  body?: OneOrMany<AnnotationBody>;
  target: OneOrMany<AnnotationTarget>;
  thumbnail?: LinkedResource[];
  provider?: Array<AgentLike | ResourceReference<"Agent">>;
  seeAlso?: LinkedResource[];
  service?: ServiceLike[];
  services?: ServiceLike[];
  homepage?: LinkedResource[];
  rendering?: LinkedResource[];
  partOf?: OneOrMany<LinkedResource>;
  logo?: LinkedResource[];
  supplementary?: LinkedResource[];
  selector?: OneOrMany<Selector>;
  action?: OneOrMany<ContentResourceLike | SpecificResource | ResourceReference | string | Record<string, unknown>>;
  exclude?: ExcludeType[];
  provides?: OneOrMany<Provides>;
  position?: Selector;
  timeMode?: string | null;
}>;

export type Presentation4Annotation = Annotation | ActivatingAnnotation | ContentStateAnnotation;
