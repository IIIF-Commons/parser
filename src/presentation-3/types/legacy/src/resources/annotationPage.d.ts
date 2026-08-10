import { AnnotationCollection, W3CAnnotationCollection } from "./annotationCollection";
import { OmitProperties, Prettify, SomeRequired } from "../utility";
import { Annotation } from "./annotation";
import { TechnicalProperties } from "../iiif/technical";
import { DescriptiveProperties } from "../iiif/descriptive";
import { LinkingProperties } from "../iiif/linking";
import { StructuralProperties } from "../iiif/structural";

export type AnnotationPageOmittedTechnical =
  | "type"
  | "format"
  | "profile"
  | "height"
  | "width"
  | "duration"
  | "viewingDirection"
  | "timeMode"
  | "motivation";
export type AnnotationPageOmittedDescriptive = "accompanyingCanvas" | "placeholderCanvas" | "navDate" | "language";
export type AnnotationPageOmittedLinking = "services" | "partOf" | "start" | "supplementary";
export type AnnotationPageOmittedStructural = "annotations" | "structures";

type AnnotationPageTechnical = OmitProperties<TechnicalProperties, AnnotationPageOmittedTechnical>;
type AnnotationPageDescriptive = OmitProperties<DescriptiveProperties, AnnotationPageOmittedDescriptive>;
type AnnotationPageLinking = OmitProperties<LinkingProperties, AnnotationPageOmittedLinking>;
type AnnotationPageStructural = OmitProperties<StructuralProperties<Annotation>, AnnotationPageOmittedStructural>;

export type W3CAnnotationPage = {
  "@context"?: string;
  type: "AnnotationPage";
  partOf?: SomeRequired<W3CAnnotationCollection, "id"> | string;
  items?: Annotation[];
  next?: string;
  prev?: string;
  startIndex?: number;
};

export type AnnotationPage = Prettify<
  SomeRequired<AnnotationPageTechnical, "id"> &
    Partial<AnnotationPageDescriptive> &
    Partial<AnnotationPageLinking> &
    Partial<AnnotationPageStructural> &
    SomeRequired<OmitProperties<W3CAnnotationPage, "partOf" | "items">, "type"> & {
      type: "AnnotationPage";
      partOf?: Array<Prettify<SomeRequired<AnnotationCollection, "id">>>;
    }
>;
