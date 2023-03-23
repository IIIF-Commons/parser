import { SpecificResource } from '@iiif/presentation-3';

export function compressSpecificResource(
  target: undefined | SpecificResource,
  { allowSourceString = true, allowString = false }: { allowString?: boolean; allowSourceString?: boolean } = {}
): any {
  const fixSource = (resource: any) => {
    if (allowSourceString && resource && resource.source && typeof resource.source !== 'string') {
      const keys = Object.keys(resource.source);
      if (resource.source.id && resource.source.type && keys.length === 2) {
        return { ...resource, source: resource.source.id };
      }
    }
    return resource;
  };

  if (target) {
    if (target.source && target.source.partOf) {
      // Ignore if we have a partOf
      return fixSource(target);
    }
    const keys = Object.keys(target);
    if (
      (keys.length === 2 && target.type && target.source) ||
      (keys.length === 3 && target.type && target.source && keys.indexOf('selector') !== -1 && !target.selector)
    ) {
      if (allowString) {
        return target.source.id;
      }

      if (target.source.type === 'ContentResource') {
        return { type: 'SpecificResource', source: target.source.id };
      }

      // If all we have is the wrapped source, just return the ID.
      return target.source;
    }
    if (target.selector) {
      if (
        !Array.isArray(target.selector) &&
        typeof target.selector !== 'string' &&
        target.selector.type === 'FragmentSelector'
      ) {
        const newId = `${target.source.id}#${target.selector.value}`;
        return allowString ? newId : { id: newId, type: target.source.type };
      }
    }
  }
  return fixSource(target);
}
