import {
  Agent,
  AnyMotivation,
  Audience,
  Stylesheet,
  AnnotationOmittedTechnical,
  AnnotationOmittedLinking,
  AnnotationOmittedDescriptive,
  JsonLDContext,
  Reference,
  TechnicalProperties,
  OmitProperties,
  SomeRequired,
} from "../../../../presentation-3/types";
import { DescriptiveNormalized } from "../iiif/descriptive";
import { LinkingNormalized } from "../iiif/linking";

export declare type CreatorNormalized = string[] | Agent[];

export declare type OtherPropertiesNormalized = {
  // Lifecycle properties.
  created: string | null;
  generated: string | null;
  modified: string | null;
  creator: CreatorNormalized;
  generator: CreatorNormalized;
  // Intended audience
  audience: Audience[];
  accessibility: string[];
  motivation: AnyMotivation[];
  // Rights
  rights: string[];
  // Other identities
  canonical: string | null;
  via: string[];
};

export declare type AnnotationW3cNormalised = JsonLDContext &
  Partial<OtherPropertiesNormalized> & {
    body: Array<Reference<"ContentResource">>;
    bodyValue?: string | null;
    target: Array<Reference<"ContentResource">>;
    stylesheet?: Stylesheet | null;
  };

export interface AnnotationNormalized
  extends
    SomeRequired<OmitProperties<TechnicalProperties, AnnotationOmittedTechnical>, "id" | "type">,
    Partial<OmitProperties<DescriptiveNormalized, AnnotationOmittedDescriptive>>,
    Partial<OmitProperties<LinkingNormalized, AnnotationOmittedLinking>>,
    AnnotationW3cNormalised {
  type: "Annotation";
}
