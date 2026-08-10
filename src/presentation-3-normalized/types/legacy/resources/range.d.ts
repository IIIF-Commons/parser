import {
  OmitProperties,
  RangeOmittedDescriptive,
  RangeOmittedLinking,
  RangeOmittedStructural,
  RangeOmittedTechnical,
  Reference,
  TechnicalProperties,
  SpecificResource,
  NavPlaceExtension,
} from "../../../../presentation-3/types";
import { StructuralNormalized } from "../iiif/structural";
import { DescriptiveNormalized } from "../iiif/descriptive";
import { LinkingNormalized } from "../iiif/linking";

export type NormalizedRangeItemSchemas = Reference<"Range"> | SpecificResource<Reference<"Canvas">>;

export declare type RangeNormalized = OmitProperties<TechnicalProperties, RangeOmittedTechnical> &
  OmitProperties<DescriptiveNormalized, RangeOmittedDescriptive> &
  OmitProperties<StructuralNormalized<NormalizedRangeItemSchemas>, RangeOmittedStructural> &
  OmitProperties<LinkingNormalized, RangeOmittedLinking> &
  NavPlaceExtension & { type: "Range" };
