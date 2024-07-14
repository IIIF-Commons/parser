import { ExternalWebResource, SpecificResource, W3CAnnotationTarget } from '@iiif/presentation-3';

export function expandTargetToSpecificResource(
  target: W3CAnnotationTarget | W3CAnnotationTarget[],
  options: {
    typeMap?: Record<string, string>;
    typeHint?: string;
  } = {}
): SpecificResource {
  if (Array.isArray(target)) {
    // Don't support multiple targets for now.
    return expandTargetToSpecificResource(target[0]!);
  }

  if (typeof target === 'string') {
    const [id, fragment] = target.split('#');

    if (!fragment) {
      // This is an unknown selector.
      return {
        type: 'SpecificResource',
        source: { id, type: (options.typeMap && (options.typeMap[id!] as any)) || options.typeHint || 'Unknown' },
      };
    }

    return {
      type: 'SpecificResource',
      source: { id, type: options.typeHint || 'Unknown' },
      selector: {
        type: 'FragmentSelector',
        value: fragment,
      },
    };
  }

  // @todo, how do we want to support choices for targets.
  if (
    target.type === 'Choice' ||
    target.type === 'List' ||
    target.type === 'Composite' ||
    target.type === 'Independents'
  ) {
    // we also don't support these, just choose the first.
    return expandTargetToSpecificResource(target.items[0]!);
  }

  if (!target.type && 'source' in target) {
    (target as any).type = 'SpecificResource';
  }

  if (target.type === 'SpecificResource') {
    if (target.source.type === 'Canvas' && target.source.partOf && typeof target.source.partOf === 'string') {
      target.source.partOf = [
        {
          id: target.source.partOf,
          type: 'Manifest',
        },
      ];
    }

    if (target.selector) {
      return {
        type: 'SpecificResource',
        source: target.source,
        selector: target.selector,
      };
    }
    return {
      type: 'SpecificResource',
      source: target.source,
    };
  }

  if (target.id) {
    if ((target as any).type === 'Canvas' && (target as any).partOf && typeof (target as any).partOf === 'string') {
      (target as any).partOf = [
        {
          id: (target as any).partOf,
          type: 'Manifest',
        },
      ];
    }

    const [id, fragment] = target.id.split('#');
    if (!fragment) {
      // This is an unknown selector.
      return {
        type: 'SpecificResource',
        source: {
          ...(target as any),
          id,
        },
      };
    }

    return {
      type: 'SpecificResource',
      source: {
        ...(target as any),
        id,
      },
      selector: {
        type: 'FragmentSelector',
        value: fragment,
      },
    };
  }

  return {
    type: 'SpecificResource',
    source: target as ExternalWebResource,
  };
}
