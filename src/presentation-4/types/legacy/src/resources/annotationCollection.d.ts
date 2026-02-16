import type { AnnotationCollection as AnnotationCollectionV3 } from "../../../../../presentation-3/types/legacy/src/resources/annotationCollection";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Annotation } from "./annotation";
import type {
  ContentResourceLike,
  LinkedResource,
  MetadataItem,
  OneOrMany,
  ResourceReference,
  ServiceLike,
} from "./contentResource";

export type AnnotationCollection = Prettify<
  Omit<
    AnnotationCollectionV3,
    | "id"
    | "items"
    | "metadata"
    | "seeAlso"
    | "service"
    | "services"
    | "rendering"
    | "homepage"
    | "partOf"
    | "logo"
    | "supplementary"
  > & {
    id?: string;
    type: "AnnotationCollection";
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
  }
>;
