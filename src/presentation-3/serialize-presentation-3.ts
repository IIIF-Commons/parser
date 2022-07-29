import { SerializeConfig, UNSET, UNWRAP } from './serialize';
import { ImageService2, ImageService3, ResourceProvider, TechnicalProperties } from '@iiif/presentation-3';
import { compressSpecificResource } from '../shared/compress-specific-resource';
import { DescriptiveNormalized, LinkingNormalized } from '@iiif/presentation-3-normalized';

function technicalProperties(entity: Partial<TechnicalProperties>): Array<[keyof TechnicalProperties, any]> {
  return [
    // Technical
    ['id', !entity.id?.startsWith('vault://') ? entity.id : undefined],
    ['type', entity.type],
    ['format', entity.format],
    ['profile', entity.profile],
    ['height', entity.height || undefined],
    ['width', entity.width || undefined],
    ['duration', entity.duration || undefined],
    ['viewingDirection', entity.viewingDirection !== 'left-to-right' ? entity.viewingDirection : undefined],
    ['behavior', entity.behavior && entity.behavior.length ? entity.behavior : undefined],
    ['timeMode', entity.timeMode],
    ['motivation', Array.isArray(entity.motivation) ? entity.motivation[0] : entity.motivation],
  ];
}

function filterEmpty<T>(item?: T[] | typeof UNSET): T[] | undefined | typeof UNSET {
  if (item === UNSET) {
    return undefined;
  }

  if (!item || item.length === 0) {
    return undefined;
  }
  const filtered = item.filter((item) => (item as any) !== UNSET);

  if (filtered.length === 0) {
    return undefined;
  }

  return filtered;
}

function service2compat(service: ImageService3): ImageService2 | ImageService3 {
  if (service && service.type && service.type === 'ImageService2') {
    const { id, type, profile, ..._service } = service;
    return {
      '@id': id,
      '@type': type,
      profile: profile.startsWith('http') ? profile : `http://iiif.io/api/image/2/${profile}.json`,
      ..._service,
    } as any;
  }

  return service;
}

function filterService2Compat(services?: any[]) {
  if (!services || services.length === 0) {
    return undefined;
  }

  return (services as any[]).map(service2compat);
}

function* descriptiveProperties(
  entity: Partial<DescriptiveNormalized>
): Generator<any, any, Array<[keyof DescriptiveNormalized, any]>> {
  return [
    ['label', entity.label],
    ['metadata', filterEmpty(entity.metadata)],
    ['summary', entity.summary],
    ['requiredStatement', entity.requiredStatement],
    ['rights', entity.rights],
    ['navDate', entity.navDate],
    ['language', entity.language],
    // We yield these fully as they are embedded in here.
    ['thumbnail', filterEmpty(yield entity.thumbnail)],
    ['placeholderCanvas', yield entity.placeholderCanvas],
    ['accompanyingCanvas', yield entity.accompanyingCanvas],

    // @todo need to test this one.
    ['provider', filterEmpty(yield entity.provider)],
  ];
}

function* linkingProperties(
  entity: Partial<LinkingNormalized>
): Generator<any, any, Array<[keyof LinkingNormalized, any]>> {
  return [
    ['seeAlso', filterEmpty(yield entity.seeAlso)],
    ['service', filterService2Compat(entity.service)],
    ['services', filterService2Compat(entity.services)],
    ['rendering', filterEmpty(yield entity.rendering)],
    ['supplementary', filterEmpty(yield entity.supplementary)],
    ['homepage', filterEmpty(yield entity.homepage)],
    ['logo', filterEmpty(yield (entity as ResourceProvider).logo)],

    // Don't yield these, they are references.
    ['partOf', filterEmpty(yield entity.partOf)],
    [
      'start',
      // @todo remove once types updated.
      entity.start ? compressSpecificResource(entity.start) : entity.start,
    ],
  ];
}

export const serializeConfigPresentation3: SerializeConfig = {
  Manifest: function* (entity, state, { isTopLevel }) {
    if (!isTopLevel) {
      return [
        // Only a snippet.
        ...technicalProperties(entity),
        ...(yield* descriptiveProperties(entity)),
      ];
    }

    return [
      [
        '@context',
        (entity as any)['@context'] ? (entity as any)['@context'] : 'http://iiif.io/api/presentation/3/context.json',
      ],
      ...technicalProperties(entity),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ['items', yield entity.items],
      ['structures', filterEmpty(yield entity.structures)],
      ['annotations', filterEmpty(yield entity.annotations)],
      ['navPlace', (entity as any).navPlace], // @todo remove when types are updated
    ];
  },

  Canvas: function* (entity) {
    return [
      // Items.
      ...technicalProperties(entity),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ['items', yield entity.items],
      ['annotations', filterEmpty(yield entity.annotations)],
      ['navPlace', (entity as any).navPlace], // @todo remove when types are updated
    ];
  },

  Agent: function* (entity) {
    return [
      //
      ['id', entity.id],
      ['type', 'Agent'],
      ['label', entity.label],
      ...(yield* linkingProperties(entity)),
    ];
  },

  AnnotationPage: function* (entity) {
    const entries = Object.entries(entity)
      .map(([key, item]) => {
        return [key, Array.isArray(item) ? filterEmpty(item as any) : item];
      })
      .filter(([key, value]) => {
        return key !== 'items';
      });

    const items = yield entity.items;

    return [
      // Any more properties?
      ...entries,
      ...(yield* linkingProperties(entity)),
      ['items', items.length ? items : UNSET],
    ];
  },

  Service: function* (entity) {
    // Are there other properties on a service?
    return [[UNWRAP, service2compat(entity as any)]];
  },

  Annotation: function* (entity) {
    const entries = Object.entries(entity)
      .map(([key, item]) => {
        if (key === 'motivation') {
          // Annotation non-array items can be added here.
          return [key, Array.isArray(item) ? item[0] : item];
        }

        if (key === 'target') {
          return [key, compressSpecificResource(item, { allowString: true, allowSourceString: true })];
        }

        return [key, Array.isArray(item) ? filterEmpty(item as any) : item];
      })
      .filter(([key]) => {
        return key !== 'body';
      });

    const resolvedBody = yield entity.body;

    return [...entries, ['body', resolvedBody.length === 1 ? resolvedBody[0] : resolvedBody]];
  },

  ContentResource: function* (entity: any) {
    return mergeRemainingProperties(
      [
        // Image properties.
        ...technicalProperties(entity),
        ...(yield* descriptiveProperties(entity)),
        ...(yield* linkingProperties(entity)),
        ['annotations', filterEmpty(yield entity.annotations)],
        ['items', filterEmpty(yield entity.items)],
      ],
      entity
    );
  },

  AnnotationCollection: function* (entity) {
    return [
      // @todo expand properties if they are actually used.
      ['id', entity.id],
      ['type', 'AnnotationCollection'],
      ['label', entity.label],
    ];
  },

  Collection: function* (entity, state, { isTopLevel }) {
    if (isTopLevel) {
      return [
        ['@context', 'http://iiif.io/api/presentation/3/context.json'],
        ...technicalProperties(entity),
        ...(yield* descriptiveProperties(entity)),
        ...(yield* linkingProperties(entity)),
        ['items', filterEmpty(yield entity.items)],
        ['navPlace', (entity as any).navPlace], // @todo remove when types are updated
      ];
    }
    return [...technicalProperties(entity), ...(yield* descriptiveProperties(entity))];
  },

  Range: function* (entity) {
    const rangeItems = [];

    for (const item of entity.items) {
      if (item.type === 'Range') {
        // Resolve the full range
        rangeItems.push(yield item);
      } else {
        // Just push the reference.
        // @todo could also push in the label of the item?
        if (item && item.type === 'SpecificResource') {
          rangeItems.push(compressSpecificResource(item));
        } else {
          rangeItems.push(item);
        }
      }
    }

    return [
      ...technicalProperties(entity),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ['items', rangeItems],
      ['annotations', filterEmpty(yield entity.annotations)],
      ['navPlace', (entity as any).navPlace], // @todo remove when types are updated
    ];
  },
};

function mergeRemainingProperties(entries: [string, any][], object: any): [string, any][] {
  const keys = Object.keys(object);
  const alreadyParsed = entries.map(([a]) => a);

  for (const key of keys) {
    if (alreadyParsed.indexOf(key) === -1 && typeof object[key] !== 'undefined') {
      entries.push([key, object[key]]);
    }
  }
  return entries;
}
