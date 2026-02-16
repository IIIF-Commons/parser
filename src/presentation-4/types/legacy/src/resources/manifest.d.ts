import type { Manifest as ManifestV3 } from "../../../../../presentation-3/types/legacy/src/resources/manifest";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { AnnotationPage } from "./annotationPage";
import type {
  AgentLike,
  LinkedResource,
  OneOrMany,
  ResourceReference,
  ServiceLike,
  SpecificResource,
} from "./contentResource";
import type { Canvas } from "./canvas";
import type { Range } from "./range";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type ManifestItem = Canvas | Scene | Timeline | ResourceReference<"Canvas" | "Scene" | "Timeline"> | string;
export type ManifestStructure = Range | ResourceReference<"Range"> | string;
export type ManifestAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Manifest = Prettify<
  Omit<
    ManifestV3,
    | "items"
    | "structures"
    | "annotations"
    | "start"
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
    type: "Manifest";
    items: OneOrMany<ManifestItem>;
    structures?: OneOrMany<ManifestStructure>;
    annotations?: OneOrMany<ManifestAnnotation>;
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
    start?: OneOrMany<SpecificResource | ResourceReference<"Canvas" | "Scene" | "Timeline"> | string> | null;
    guid?: string;
    "dcterms:created"?: string;
    "dcterms:modified"?: string;
  }
>;
