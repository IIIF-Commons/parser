import type { NormalizedLinkedEntity, NormalizedReference } from "../iiif/technical-v4";

export type AgentNormalized = NormalizedLinkedEntity & {
  type: "Agent";
  logo: readonly NormalizedReference[];
};

export type ProviderNormalized = AgentNormalized;
