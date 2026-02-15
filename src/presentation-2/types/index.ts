export type * from "./legacy/index";

import { createPresentationHelpers, type ResourceSpecs } from "../../presentation-shared/helpers/create-helpers";
import type {
  Annotation,
  AnnotationList,
  Canvas,
  ChoiceEmbeddedContent,
  Collection,
  ContentResource,
  Layer,
  Manifest,
  Range,
  Sequence,
} from "./legacy/index";

export type P2ImageResourceLike = Extract<ContentResource, { "@type": "dctypes:Image" }>;

export type Presentation2HelperTypes = {
  Collection: Collection;
  Manifest: Manifest;
  Canvas: Canvas;
  AnnotationList: AnnotationList;
  Annotation: Annotation;
  Range: Range;
  Layer: Layer;
  Sequence: Sequence;
  Choice: ChoiceEmbeddedContent;
  ContentResource: ContentResource;
  Image: P2ImageResourceLike;
};

const presentation2Specs: ResourceSpecs<Presentation2HelperTypes> = {
  Collection: { type: "sc:Collection", aliases: ["Collection"] },
  Manifest: { type: "sc:Manifest", aliases: ["Manifest"] },
  Canvas: { type: "sc:Canvas", aliases: ["Canvas"] },
  AnnotationList: { type: "sc:AnnotationList", aliases: ["AnnotationPage"] },
  Annotation: { type: "oa:Annotation", aliases: ["Annotation"] },
  Range: { type: "sc:Range", aliases: ["Range"] },
  Layer: { type: "sc:Layer", aliases: ["AnnotationCollection"] },
  Sequence: { type: "sc:Sequence" },
  Choice: { type: "oa:Choice", aliases: ["Choice"] },
  ContentResource: {
    type: "ContentResource",
    aliases: ["dctypes:Image", "dctypes:Text", "dctypes:Sound", "cnt:ContentAsText", "oa:SpecificResource"],
  },
  Image: { type: "dctypes:Image", aliases: ["Image"] },
};

const presentation2Helpers = createPresentationHelpers(presentation2Specs);

/** Runtime-checked identity helpers for Presentation 2 resources. */
export const infer = presentation2Helpers.infer;
/** Runtime assertion helpers for Presentation 2 resources. */
export const cast = presentation2Helpers.cast;
/** Type guards for Presentation 2 discriminated resources. */
export const narrow = presentation2Helpers.narrow;
