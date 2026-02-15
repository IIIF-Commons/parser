import type { ContentResourceLike, Quantity, ResourceReference, SpecificResource } from "./content-resources";
import type { Transform } from "./transforms";

export type InteractionMode = "locked" | "orbit" | "hemisphere-orbit" | "free" | "free-direction" | (string & {});

export type Provides =
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
  | (string & {});

export type ExcludeType = "Audio" | "Animations" | "Cameras" | "Lights" | (string & {});

export interface ContentStateAnnotation {
  id?: string;
  type: "Annotation";
  motivation: "contentState";
  target: Array<SpecificResource | ResourceReference | string>;
  body?: Array<ContentResourceLike | ResourceReference | string>;
  action?: Array<Transform | ResourceReference | string>;
  [key: string]: unknown;
}

export interface ActivatingAnnotation {
  id?: string;
  type: "Annotation";
  motivation: "activating";
  body: Array<ContentResourceLike | ResourceReference | string>;
  target: Array<SpecificResource | ResourceReference | string>;
  [key: string]: unknown;
}

export type SpatialScale = Quantity;
export type TemporalScale = Quantity;
