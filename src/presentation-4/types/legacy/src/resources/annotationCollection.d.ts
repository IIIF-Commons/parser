import type { AnnotationCollection as AnnotationCollectionV3 } from "../../../../../presentation-3/types/legacy/src/resources/annotationCollection";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { Annotation } from "./annotation";
import type { ContentResourceLike, OneOrMany, ResourceReference } from "./contentResource";

export type AnnotationCollection = Prettify<
  Omit<AnnotationCollectionV3, "items"> & {
    type: "AnnotationCollection";
    items?: OneOrMany<Annotation | ContentResourceLike | ResourceReference | string>;
  }
>;
