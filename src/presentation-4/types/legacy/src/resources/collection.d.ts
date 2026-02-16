import type { Collection as CollectionV3 } from "../../../../../presentation-3/types/legacy/src/resources/collection";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type { Manifest } from "./manifest";
import type { AgentLike, LinkedResource, OneOrMany, ResourceReference, ServiceLike } from "./contentResource";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type CollectionItem = Collection | Manifest | ResourceReference<"Collection" | "Manifest"> | string;
export type CollectionAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Collection = Prettify<
  Omit<
    CollectionV3,
    | "items"
    | "annotations"
    | "placeholderCanvas"
    | "accompanyingCanvas"
    | "thumbnail"
    | "provider"
    | "seeAlso"
    | "service"
    | "services"
    | "rendering"
    | "homepage"
    | "partOf"
    | "logo"
    | "supplementary"
  > & {
    type: "Collection";
    items: OneOrMany<CollectionItem>;
    annotations?: OneOrMany<CollectionAnnotation>;
    thumbnail?: OneOrMany<LinkedResource>;
    provider?: OneOrMany<AgentLike | ResourceReference<"Agent">>;
    seeAlso?: OneOrMany<LinkedResource>;
    service?: OneOrMany<ServiceLike>;
    services?: OneOrMany<ServiceLike>;
    rendering?: OneOrMany<LinkedResource>;
    homepage?: OneOrMany<LinkedResource>;
    partOf?: OneOrMany<LinkedResource>;
    logo?: OneOrMany<LinkedResource>;
    supplementary?: OneOrMany<LinkedResource>;
    placeholderContainer?: Canvas | Timeline | Scene | null;
    accompanyingContainer?: Canvas | Timeline | Scene | null;
  }
>;

export type CollectionItemSchemas = "Collection" | "Manifest";
