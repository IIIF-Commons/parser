import { SpecificResource } from '@iiif/presentation-3';

export function isSpecificResource(resource: unknown): resource is SpecificResource {

  if (typeof resource === 'string') {
    return false;
  }

  return !!resource && (resource as any).type === 'SpecificResource';
}
