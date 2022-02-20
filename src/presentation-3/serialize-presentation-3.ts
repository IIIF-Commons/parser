import { SerializeConfig, UNWRAP } from './serialize';
import {
  DescriptiveNormalized,
  ImageService2,
  ImageService3,
  LinkingNormalized,
  TechnicalProperties,
} from '@iiif/presentation-3';

function technicalProperties(entity: Partial<TechnicalProperties>): Array<[keyof TechnicalProperties, any]> {
  return [
    // Technical
    ['id', entity.id],
    ['type', entity.type],
    ['format', entity.format],
    ['profile', entity.profile],
    ['height', entity.height],
    ['width', entity.width],
    ['duration', entity.duration || undefined],
    ['viewingDirection', entity.viewingDirection !== 'left-to-right' ? entity.viewingDirection : undefined],
    ['behavior', entity.behavior && entity.behavior.length ? entity.behavior : undefined],
    ['timeMode', entity.timeMode],
    ['motivation', entity.motivation],
  ];
}

function filterEmpty<T>(item?: T[]): T[] | undefined {
  if (!item || item.length === 0) {
    return undefined;
  }
  return item;
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
    ['logo', filterEmpty(yield entity.logo)],

    // Don't yield these, they are references.
    ['partOf', filterEmpty(yield entity.partOf)],
    ['start', entity.start],
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
      ['@context', 'http://iiif.io/api/presentation/3/context.json'],
      ...technicalProperties(entity),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ['items', yield entity.items],
      ['structures', filterEmpty(yield entity.structures)],
      ['annotations', filterEmpty(yield entity.annotations)],
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

    return [
      // Any more properties?
      ...entries,
      ...(yield* linkingProperties(entity)),
      ['items', yield entity.items],
    ];
  },

  Service: function* (entity) {
    // Are there other properties on a service?
    return [[UNWRAP, service2compat(entity as any)]];
  },

  Annotation: function* (entity) {
    const entries = Object.entries(entity)
      .map(([key, item]) => {
        return [key, Array.isArray(item) ? filterEmpty(item as any) : item];
      })
      .filter(([key]) => {
        return key !== 'body';
      });

    return [...entries, ['body', yield entity.body]];
  },

  ContentResource: function* (entity: any) {
    return [
      // Image properties.
      ...technicalProperties(entity),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ['annotations', filterEmpty(yield entity.annotations)],
    ];
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
        ...technicalProperties(entity),
        ...(yield* descriptiveProperties(entity)),
        ...(yield* linkingProperties(entity)),
        ['items', filterEmpty(yield entity.items)],
        ['annotations', filterEmpty(yield entity.annotations)],
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
        rangeItems.push(item);
      }
    }

    return [
      ...technicalProperties(entity),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ['items', rangeItems],
      ['annotations', filterEmpty(yield entity.annotations)],
    ];
  },
};
