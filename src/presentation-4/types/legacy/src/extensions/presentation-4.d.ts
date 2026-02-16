import type {
  AudioContentSelector as AudioContentSelectorV3,
  FragmentSelector as FragmentSelectorV3,
  ImageApiSelector as ImageApiSelectorV3,
  PointSelector as PointSelectorV3,
  Selector as SelectorV3,
  SpecificResource as SpecificResourceV3,
  VisualContentSelector as VisualContentSelectorV3,
} from "../../../../../presentation-3/types/legacy/src/resources/annotation";
import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";

export type SelectorBase = {
  id?: string;
  type: string;
};
type OneOrMany<T> = T | T[];

export type PointSelector = Prettify<Omit<PointSelectorV3, "t"> & { type: "PointSelector"; z?: number; t?: number }>;
export type FragmentSelector = Prettify<FragmentSelectorV3 & { id?: string }>;
export type ImageApiSelector = Prettify<ImageApiSelectorV3 & { id?: string }>;
export type AudioContentSelector = Prettify<AudioContentSelectorV3 & { id?: string }>;
export type VisualContentSelector = Prettify<VisualContentSelectorV3 & { id?: string }>;

export type WktSelector = SelectorBase & {
  type: "WktSelector" | "WKTSelector";
  value: string;
};

export type PolygonZSelector = SelectorBase & {
  type: "PolygonZSelector";
  value: string;
};

export type AnimationSelector = SelectorBase & {
  type: "AnimationSelector";
  value: string;
};

export type CompositeSelector = SelectorBase & {
  type: "CompositeSelector" | "ChoiceSelector";
  selectors: OneOrMany<Selector>;
};

type LegacySelectorWithoutPoint = Exclude<SelectorV3, PointSelectorV3>;

export type Selector =
  | LegacySelectorWithoutPoint
  | PointSelector
  | WktSelector
  | PolygonZSelector
  | AnimationSelector
  | CompositeSelector;

export type ContentStateSpecificResource = Prettify<
  Omit<SpecificResourceV3, "selector"> & {
    selector?: OneOrMany<Selector>;
  }
>;
