import type { SpecificResource } from '../presentation-3/types';

export function isSpecificResource(resource: unknown): resource is SpecificResource {
  if (typeof resource === 'string') {
    return false;
  }

  if (resource && !(resource as any).type && 'source' in (resource as any)) {
    (resource as any).type = 'SpecificResource';
    return true;
  }

  return !!resource && (resource as any).type === 'SpecificResource';
}
