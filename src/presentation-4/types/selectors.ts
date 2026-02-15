export interface SelectorBase {
  id?: string;
  type: string;
}

export interface PointSelector extends SelectorBase {
  type: "PointSelector";
  x?: number;
  y?: number;
  z?: number;
  t?: number;
}

export interface WktSelector extends SelectorBase {
  type: "WktSelector";
  value: string;
}

export interface FragmentSelector extends SelectorBase {
  type: "FragmentSelector";
  value: string;
}

export interface AnimationSelector extends SelectorBase {
  type: "AnimationSelector";
  value: string;
}

export interface ImageApiSelector extends SelectorBase {
  type: "ImageApiSelector";
  region?: string;
  size?: string;
  rotation?: string;
  quality?: string;
  format?: string;
}

export interface AudioContentSelector extends SelectorBase {
  type: "AudioContentSelector";
}

export interface VisualContentSelector extends SelectorBase {
  type: "VisualContentSelector";
}

export interface CompositeSelector extends SelectorBase {
  type: "CompositeSelector" | "ChoiceSelector";
  selectors: Selector[];
}

export type Selector =
  | PointSelector
  | WktSelector
  | FragmentSelector
  | AnimationSelector
  | ImageApiSelector
  | AudioContentSelector
  | VisualContentSelector
  | CompositeSelector;
