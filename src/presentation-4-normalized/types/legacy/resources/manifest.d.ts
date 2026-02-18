import type { Prettify } from "../../../../presentation-3/types/legacy/src/utility";
import type { MetadataItem } from "../../../../presentation-4/types/legacy/src/resources/contentResource";
import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type ManifestNormalized = Prettify<
  NormalizedLinkedEntity & {
    type: "Manifest";
    items: readonly NormalizedReference[];
    structures: readonly NormalizedReference[];
    start: NormalizedReference | null;
    rights: string | null;
    requiredStatement: MetadataItem | null;
  }
>;
