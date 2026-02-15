import { DescriptiveProperties, OmitProperties, Reference } from "../../../../presentation-3/types";

export declare type DescriptiveNormalized = OmitProperties<
  DescriptiveProperties,
  "provider" | "thumbnail" | "accompanyingCanvas" | "placeholderCanvas"
> & {
  thumbnail: Array<Reference<"ContentResource">>;
  placeholderCanvas: Reference<"Canvas"> | null;
  accompanyingCanvas: Reference<"Canvas"> | null;
  provider: Array<Reference<"Agent">>;
};
