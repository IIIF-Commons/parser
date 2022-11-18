import { Reference } from '@iiif/presentation-3';
import { isSpecificResource } from './is-specific-resource';

export function toRef<T extends string = any>(reference: any, _typeHint?: T): Reference<T> | undefined {
  const type = (_typeHint || 'unknown') as T;

  if (!reference) {
    return undefined;
  }

  if (typeof reference === 'string') {
    return { id: reference, type };
  }

  if (isSpecificResource(reference)) {
    return toRef(reference.source, _typeHint);
  }

  let _type = type && type !== 'unknown' ? type : (reference as any).type || (reference as any)['@type'];
  const _id = (reference as any).id || (reference as any)['@id'];

  if (_type.indexOf(':') !== -1) {
    _type = _type.split(':').pop();
  }

  if (_id && _type) {
    return { id: _id, type: _type };
  }

  return undefined;
}
