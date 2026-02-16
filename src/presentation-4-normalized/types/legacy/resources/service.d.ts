import type { NormalizedEntityBase, NormalizedReference } from "../iiif/technical-v4";

export type ServiceNormalized = NormalizedEntityBase & {
  type: string;
  service?: readonly ServiceNormalized[];
};
