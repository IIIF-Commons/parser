import type { AnnotationPage as AnnotationPageV3 } from "../../../../../presentation-3/types/legacy/src/resources/annotationPage";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Annotation } from "./annotation";
import type { ContentResourceLike, OneOrMany, ResourceReference } from "./contentResource";

export type AnnotationPage = Prettify<
  Omit<AnnotationPageV3, "items"> & {
    type: "AnnotationPage";
    items?: OneOrMany<Annotation | ContentResourceLike | ResourceReference | string>;
  }
>;
