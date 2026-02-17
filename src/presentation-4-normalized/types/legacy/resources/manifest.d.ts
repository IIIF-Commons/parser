import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";
import type { Prettify } from "../../../../presentation-3/types/legacy/src/utility";

export type ManifestNormalized = Prettify<
  NormalizedLinkedEntity & {
    type: "Manifest";
    items: readonly NormalizedReference[];
    structures: readonly NormalizedReference[];
    start: NormalizedReference | null;
    rights: string | null;
    requiredStatement: MetadataItem | null;
    /** @deprecated */
    logo?: any;
  }
>;
