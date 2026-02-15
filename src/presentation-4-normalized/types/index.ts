export type NormalizedEntityV4 = {
  id?: string;
  type?: string;
  "@id"?: string;
  "@type"?: string;
  [key: string]: unknown;
};

export type Presentation4Entities = {
  Collection: Record<string, NormalizedEntityV4>;
  Manifest: Record<string, NormalizedEntityV4>;
  Timeline: Record<string, NormalizedEntityV4>;
  Canvas: Record<string, NormalizedEntityV4>;
  Scene: Record<string, NormalizedEntityV4>;
  AnnotationPage: Record<string, NormalizedEntityV4>;
  AnnotationCollection: Record<string, NormalizedEntityV4>;
  Annotation: Record<string, NormalizedEntityV4>;
  ContentResource: Record<string, NormalizedEntityV4>;
  Range: Record<string, NormalizedEntityV4>;
  Service: Record<string, NormalizedEntityV4>;
  Selector: Record<string, NormalizedEntityV4>;
  Agent: Record<string, NormalizedEntityV4>;
  Quantity: Record<string, NormalizedEntityV4>;
  Transform: Record<string, NormalizedEntityV4>;
};

export type Presentation4MappingType = keyof Presentation4Entities | string;

export type Presentation4NormalizeResult = {
  entities: Presentation4Entities;
  resource: { id: string; type: string };
  mapping: Record<string, Presentation4MappingType>;
  diagnostics: Array<{
    code: string;
    severity: "error" | "warning" | "info";
    message: string;
    path: string;
    resourceType?: string;
    resourceId?: string;
    specRef?: string;
  }>;
  sourceVersion: 2 | 3 | 4 | "unknown";
};
