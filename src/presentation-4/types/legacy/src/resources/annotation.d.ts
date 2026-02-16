import type {
  Annotation as AnnotationV3,
  AnyMotivation,
  W3CMotivation,
} from "../../../../../presentation-3/types/legacy/src/resources/annotation";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { ContentResourceLike, OneOrMany, ResourceReference, SpecificResource } from "./contentResource";
import type { ExcludeType, Transform } from "../iiif/technical-v4";
import type { Selector } from "../extensions/presentation-4";

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

export type Annotation = Prettify<
  Omit<AnnotationV3, "body" | "target" | "motivation" | "timeMode" | "selector"> & {
    type: "Annotation";
    motivation?: OneOrMany<AnnotationMotivation>;
    body?: OneOrMany<AnnotationBody>;
    target: OneOrMany<AnnotationTarget>;
    selector?: OneOrMany<Selector>;
    action?: OneOrMany<ContentResourceLike | SpecificResource | ResourceReference | string | Record<string, unknown>>;
    exclude?: OneOrMany<ExcludeType>;
    position?: Selector;
    timeMode?: string | null;
    [key: string]: unknown;
  }
>;

export type Presentation4Annotation = Annotation | ActivatingAnnotation | ContentStateAnnotation;
