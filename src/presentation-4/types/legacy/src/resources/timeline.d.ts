import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { AnnotationPage } from "./annotationPage";
import type { OneOrMany, ResourceReference } from "./contentResource";
import type { Canvas } from "./canvas";
import type { Scene } from "./scene";

export type TimelineItem =
  | AnnotationPage
  | ResourceReference<"AnnotationPage" | "Canvas" | "Scene" | "Timeline">
  | string;
export type TimelineAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Timeline = Prettify<
  Omit<
    CanvasV3,
    | "type"
    | "width"
    | "height"
    | "timeMode"
    | "viewingDirection"
    | "items"
    | "annotations"
    | "placeholderCanvas"
    | "accompanyingCanvas"
  > & {
    type: "Timeline";
    duration: number;
    items?: OneOrMany<TimelineItem>;
    annotations?: OneOrMany<TimelineAnnotation>;
    placeholderContainer?: Canvas | Timeline | Scene | null;
    accompanyingContainer?: Canvas | Timeline | Scene | null;
  }
>;
