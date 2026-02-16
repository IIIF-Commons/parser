import type { Canvas as CanvasV3 } from "../../../../../presentation-3/types/legacy/src/resources/canvas";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Quantity } from "../iiif/technical-v4";
import type { AnnotationPage } from "./annotationPage";
import type { OneOrMany, ResourceReference } from "./contentResource";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type CanvasItem =
  | AnnotationPage
  | ResourceReference<"AnnotationPage" | "Canvas" | "Scene" | "Timeline">
  | string;
export type CanvasAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Canvas = Prettify<
  Omit<CanvasV3, "items" | "annotations" | "timeMode" | "placeholderCanvas" | "accompanyingCanvas"> & {
    type: "Canvas";
    items?: OneOrMany<CanvasItem>;
    annotations?: OneOrMany<CanvasAnnotation>;
    spatialScale?: Quantity | null;
    timeMode?: string | null;
    backgroundColor?: string | null;
    placeholderContainer?: Canvas | Timeline | Scene | null;
    accompanyingContainer?: Canvas | Timeline | Scene | null;
  }
>;

export type CanvasItemSchemas = "AnnotationPage" | "Canvas" | "Scene" | "Timeline";
