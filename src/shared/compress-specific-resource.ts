import { SpecificResource } from '../../../presentation-3-types';

export function compressSpecificResource(target: undefined | SpecificResource, allowString = false): any {
  if (target) {
    if (target.source && target.source.partOf) {
      // Ignore if we have a partOf
      return target;
    }
    const keys = Object.keys(target);
    if (
      (keys.length === 2 && target.type && target.source) ||
      (keys.length === 3 && target.type && target.source && keys.indexOf('selector') !== -1 && !target.selector)
    ) {
      // If all we have is the wrapped source, just return the ID.
      return allowString ? target.source.id : target.source;
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
  return target;
}
