import { TechnicalProperties } from "../iiif/technical";
import { DescriptiveProperties } from "../iiif/descriptive";
import { StructuralProperties } from "../iiif/structural";
import { LinkingProperties } from "../iiif/linking";
import { OmitProperties, Prettify, SomeRequired } from "../utility";
import { Reference } from "../reference";
import { Canvas } from "./canvas";
import { SpecificResource } from "./annotation";
import { NavPlaceExtension } from "../extensions/nav-place";

export type RangeItems = Range | Canvas | string | SpecificResource<Reference<"Canvas">>;

export type RangeOmittedTechnical = "format" | "profile" | "height" | "width" | "duration" | "timeMode" | "motivation";
export type RangeOmittedDescriptive = "language";
export type RangeOmittedStructural = "structures";
export type RangeOmittedLinking = "services";

export type RangeTechnical = OmitProperties<TechnicalProperties, RangeOmittedTechnical>;
export type RangeDescriptive = OmitProperties<DescriptiveProperties, RangeOmittedDescriptive>;
export type RangeStructural = OmitProperties<StructuralProperties<RangeItems>, RangeOmittedStructural>;
export type RangeLinking = OmitProperties<LinkingProperties, RangeOmittedLinking>;

interface _Range
  extends
    SomeRequired<RangeTechnical, "id" | "type">,
    SomeRequired<RangeDescriptive, "label">,
    Partial<RangeStructural>,
    NavPlaceExtension,
    Partial<RangeLinking> {
  type: "Range";
}

export type Range = Prettify<_Range>;
