import { TechnicalProperties } from "../iiif/technical";
import { DescriptiveProperties } from "../iiif/descriptive";
import { StructuralProperties } from "../iiif/structural";
import { LinkingProperties } from "../iiif/linking";
import { Manifest } from "./manifest";
import { JsonLDContext, OmitProperties, Prettify, SomeRequired } from "../utility";
import { NavPlaceExtension } from "../extensions/nav-place";

export type CollectionItems = Collection | Manifest;

export type CollectionOmittedTechnical =
  | "format"
  | "profile"
  | "height"
  | "width"
  | "duration"
  | "timeMode"
  | "motivation";
export type CollectionOmittedDescriptive = "language";
export type CollectionOmittedStructural = "structures";
export type CollectionOmittedLinking = "start" | "supplementary";

export type CollectionTechnical = OmitProperties<TechnicalProperties, CollectionOmittedTechnical>;
export type CollectionDescriptive = OmitProperties<DescriptiveProperties, CollectionOmittedDescriptive>;
export type CollectionStructural = OmitProperties<StructuralProperties<CollectionItems>, CollectionOmittedStructural>;
export type CollectionLinking = OmitProperties<LinkingProperties, CollectionOmittedLinking>;

interface _Collection
  extends
    SomeRequired<CollectionTechnical, "id" | "type">,
    SomeRequired<CollectionDescriptive, "label">,
    SomeRequired<CollectionStructural, "items">,
    Partial<CollectionLinking>,
    NavPlaceExtension,
    JsonLDContext {
  type: "Collection";
}

export type Collection = Prettify<_Collection>;

export type CollectionItemSchemas = "Collection" | "Manifest";
