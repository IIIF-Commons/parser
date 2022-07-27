import { SpecificResource } from '@iiif/presentation-3';

export function isSpecificResource(resource: unknown): resource is SpecificResource {
  return (resource as any).type === 'SpecificResource';
}
