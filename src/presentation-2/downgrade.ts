import { normalize } from "../presentation-3/normalize";
import { serialize } from "../presentation-3/serialize";
import { serializeConfigPresentation2 } from "../presentation-3/serialize-presentation-2";
import type * as Presentation2 from "./types";
import type * as Presentation3 from "../presentation-3/types";

type DowngradedResource =
  | Presentation2.Manifest
  | Presentation2.Collection
  | Presentation2.Canvas
  | Presentation2.AnnotationList
  | Presentation2.Annotation
  | Presentation2.Range
  | Presentation2.Layer
  | Presentation2.ContentResource;

type DowngradeResult<T> = T extends Presentation3.Manifest
  ? Presentation2.Manifest
  : T extends Presentation3.Collection
    ? Presentation2.Collection
    : T extends Presentation3.Canvas
      ? Presentation2.Canvas
      : T extends Presentation3.AnnotationPage
        ? Presentation2.AnnotationList
        : T extends Presentation3.Annotation
          ? Presentation2.Annotation
          : T extends Presentation3.Range
            ? Presentation2.Range
            : T extends Presentation3.AnnotationCollection
              ? Presentation2.Layer
              : DowngradedResource;

/**
 * Normalize a Presentation 3 resource and serialize it as Presentation 2.
 * Linked services and external annotation pages still need compatible endpoints;
 * this converts JSON, not the responses served at those URLs.
 */
export function presentation3to2downgrade<T>(resource: T): DowngradeResult<T> {
  const normalized = normalize(structuredClone(resource));
  return serialize({ ...normalized, requests: {} }, normalized.resource, serializeConfigPresentation2);
}
