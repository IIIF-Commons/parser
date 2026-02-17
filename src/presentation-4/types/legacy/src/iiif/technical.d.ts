import type { InternationalString } from "../../../../../presentation-3/types/legacy/src/iiif/descriptive";
import type { LiteralUnion, Prettify } from "../../../../../presentation-3/types/legacy/src/utility";

export type InteractionMode = LiteralUnion<"locked" | "orbit" | "hemisphere-orbit" | "free" | "free-direction">;

export type ViewingDirection = LiteralUnion<
  "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top" | "auto"
>;

export type Provides = LiteralUnion<
  | "closedCaptions"
  | "alternativeText"
  | "audioDescription"
  | "longDescription"
  | "signLanguage"
  | "highContrastAudio"
  | "highContrastDisplay"
  | "braille"
  | "tactileGraphic"
  | "transcript"
  | "translation"
  | "subtitles"
>;

export type ExcludeType = LiteralUnion<"Audio" | "Animations" | "Cameras" | "Lights">;

export type Quantity = Prettify<{
  id?: string;
  type: "Quantity" | "Value" | string;
  value: number;
  unit?: string;
  label?: InternationalString;
  [key: string]: unknown;
}>;

export type SpatialScale = Quantity;
export type TemporalScale = Quantity;

export type TransformBase = {
  id?: string;
  type: string;
  label?: InternationalString;
};

export type RotateTransform = TransformBase & {
  type: "RotateTransform";
  x?: number;
  y?: number;
  z?: number;
};

export type ScaleTransform = TransformBase & {
  type: "ScaleTransform";
  x?: number;
  y?: number;
  z?: number;
};

export type TranslateTransform = TransformBase & {
  type: "TranslateTransform";
  x?: number;
  y?: number;
  z?: number;
};

export type Transform = RotateTransform | ScaleTransform | TranslateTransform;
