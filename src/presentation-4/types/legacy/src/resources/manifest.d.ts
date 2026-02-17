import type { Prettify } from "../../../../../presentation-3/types/legacy/src/utility";
import type { AnnotationPage } from "./annotationPage";
import type { Canvas } from "./canvas";
import type {
  AgentLike,
  LinkedResource,
  OneOrMany,
  ResourceReference,
  ServiceLike,
  SpecificResource,
} from "./contentResource";
import type { Range } from "./range";
import type { Scene } from "./scene";
import type { Timeline } from "./timeline";

export type ManifestItem = Canvas | Scene | Timeline | ResourceReference<"Canvas" | "Scene" | "Timeline"> | string;
export type ManifestStructure = Range | ResourceReference<"Range"> | string;
export type ManifestAnnotation = AnnotationPage | ResourceReference<"AnnotationPage"> | string;

export type Manifest = Prettify<{
  // Unchanged from V3.
  id: string;
  type: "Manifest";
  viewingDirection?: NonNullable<ViewingDirection> | undefined;
  behavior?: LiteralUnion<SpecificationBehaviors>[] | undefined;
  label: InternationalString;
  metadata?: MetadataItem[] | undefined;
  summary?: InternationalString | undefined;
  requiredStatement?: MetadataItem | undefined;
  rights?: string | undefined;
  navDate?: string | undefined;
  "@context"?: string | string[] | undefined;
  navPlace?: Prettify<GeoJSON> | undefined;

  items: ManifestItem[];
  structures?: Array<ManifestStructure>;
  annotations?: Array<ManifestAnnotation>;
  thumbnail?: Array<LinkedResource>;
  provider?: Array<AgentLike | ResourceReference<"Agent">>;
  seeAlso?: Array<LinkedResource>;
  service?: Array<ServiceLike>;
  services?: Array<ServiceLike>;
  rendering?: Array<LinkedResource>;
  homepage?: Array<LinkedResource>;
  partOf?: OneOrMany<LinkedResource>;
  canonical?: string;
  via?: OneOrMany<string>;

  rights?: string;

  supplementary?: Array<LinkedResource>;
  placeholderContainer?: Canvas | Timeline | Scene | null;
  accompanyingContainer?: Canvas | Timeline | Scene | null;
  start?: SpecificResource | ResourceReference<"Canvas" | "Scene" | "Timeline"> | string | null;

  /** @deprecated */
  [subject: string]: unknown;
}>;
