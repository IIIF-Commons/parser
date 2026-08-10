import { Reference, SpecificResource } from "../../../../presentation-3/types";
import { Service } from "../../../../presentation-4/types";

export declare type LinkingNormalized = {
  seeAlso: Array<Reference<"ContentResource">>;
  service: Array<Service>;
  services: Array<Service>;
  rendering: Array<Reference<"ContentResource">>;
  partOf: Array<Reference<"Collection" | "Manifest">>;
  start: SpecificResource<Reference<"Canvas"> | Reference<"Scene"> | Reference<"Timeline">> | null;
  supplementary: Reference<"AnnotationCollection"> | null;
  homepage: Array<Reference<"ContentResource">>;
};
