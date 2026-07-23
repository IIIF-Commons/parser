export declare type DescriptiveNormalized = OmitProperties<
  DescriptiveProperties,
  | "provider"
  | "thumbnail"
  | "accompanyingCanvas"
  | "placeholderCanvas"
  | "placeholderContainer"
  | "accompanyingContainer"
> & {
  thumbnail: Array<Reference<"ContentResource">>;
  placeholderContainer: Reference<"Canvas"> | Reference<"Timeline"> | Reference<"Scene"> | null;
  accompanyingContainer: Reference<"Canvas"> | Reference<"Timeline"> | Reference<"Scene"> | null;
  provider: Array<Reference<"Agent">>;
};
