import type { Range as RangeV3 } from "../../../../../presentation-3/types/legacy/src/resources/range";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
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
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type RangeItem =
  | Range
  | Canvas
  | Scene
  | Timeline
  | string
  | SpecificResource
  | ResourceReference<"Range" | "Canvas" | "Scene" | "Timeline">;

export type RangeAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Range = Prettify<
  Omit<
    RangeV3,
    | "items"
    | "annotations"
    | "start"
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
    type: "Range";
    items?: OneOrMany<RangeItem>;
    annotations?: OneOrMany<RangeAnnotation>;
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
    start?: OneOrMany<SpecificResource | ResourceReference<"Canvas" | "Scene" | "Timeline"> | string> | null;
  }
>;
