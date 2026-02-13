import { PRESENTATION_3_CONTEXT, sceneComponentTypes } from './utilities';
import { SerializeConfig } from './serialize';

const unsupportedSelectorTypes = new Set(['PointSelector', 'WktSelector', 'AnimationSelector']);
const unsupportedContainerTypes = new Set(['Scene']);
const unsupportedContentTypes = new Set([
  'Model',
  'PerspectiveCamera',
  'OrthographicCamera',
  'AmbientLight',
  'DirectionalLight',
  'PointLight',
  'SpotLight',
  'AmbientAudio',
  'PointAudio',
  'SpotAudio',
]);

function unsupported(message: string): never {
  throw new Error(`Presentation 4 -> 3 downgrade unsupported: ${message}`);
}

function filterList<T>(value: T[] | T | undefined): T[] | undefined {
  if (!value) {
    return undefined;
  }
  const list = Array.isArray(value) ? value : [value];
  const filtered = list.filter(Boolean);
  return filtered.length ? filtered : undefined;
}

function inlineList<T>(value: T[] | T | undefined): T[] | undefined {
  if (!value) {
    return undefined;
  }
  const list = Array.isArray(value) ? value : [value];
  const filtered = list.filter((item) => item !== null && typeof item !== 'undefined');
  return filtered.length ? filtered : undefined;
}

function asSingleOrArray<T>(items: T[] | undefined): T[] | T | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }
  if (items.length === 1) {
    return items[0];
  }
  return items;
}

function stripVaultId(id?: string) {
  if (!id) {
    return undefined;
  }
  return id.startsWith('vault://') ? undefined : id;
}

function ensureNoV4OnlyBehavior(entity: any) {
  if (unsupportedContainerTypes.has(entity.type)) {
    unsupported(`container type ${entity.type}`);
  }
  if (entity.transform && entity.transform.length) {
    unsupported('SpecificResource.transform');
  }
  if (entity.action && entity.action.length) {
    unsupported('SpecificResource.action');
  }
  if (entity.exclude && entity.exclude.length) {
    unsupported('Annotation.exclude');
  }
  if (entity.position) {
    unsupported('position');
  }
  if (Array.isArray(entity.motivation) && entity.motivation.includes('activating')) {
    unsupported('Annotation motivation activating');
  }
}

function ensureNo3dContent(entity: any) {
  const type = entity.type;
  if (unsupportedContentTypes.has(type) || sceneComponentTypes.has(type)) {
    unsupported(`content type ${type}`);
  }
}

function* linkedProperties(entity: any): Generator<any, any, any> {
  if (entity.placeholderContainer && entity.placeholderContainer.type && entity.placeholderContainer.type !== 'Canvas') {
    unsupported(`placeholderContainer type ${entity.placeholderContainer.type}`);
  }
  if (entity.accompanyingContainer && entity.accompanyingContainer.type && entity.accompanyingContainer.type !== 'Canvas') {
    unsupported(`accompanyingContainer type ${entity.accompanyingContainer.type}`);
  }

  return [
    ['thumbnail', filterList(yield entity.thumbnail)],
    ['provider', filterList(yield entity.provider)],
    ['seeAlso', filterList(yield entity.seeAlso)],
    ['service', filterList(entity.service || [])],
    ['services', filterList(entity.services || [])],
    ['homepage', filterList(yield entity.homepage)],
    ['rendering', filterList(yield entity.rendering)],
    ['partOf', filterList(yield entity.partOf)],
    ['placeholderCanvas', entity.placeholderContainer ? yield entity.placeholderContainer : undefined],
    ['accompanyingCanvas', entity.accompanyingContainer ? yield entity.accompanyingContainer : undefined],
    ['annotations', filterList(yield entity.annotations)],
  ];
}

function commonProperties(entity: any) {
  ensureNoV4OnlyBehavior(entity);
  return [
    ['id', stripVaultId(entity.id)],
    ['type', entity.type],
    ['label', entity.label],
    ['metadata', entity.metadata?.length ? entity.metadata : undefined],
    ['summary', entity.summary],
    ['requiredStatement', entity.requiredStatement],
    ['rights', entity.rights],
    ['navDate', entity.navDate],
    ['navPlace', entity.navPlace],
    ['behavior', entity.behavior?.length ? entity.behavior : undefined],
    ['viewingDirection', entity.viewingDirection],
    ['format', entity.format],
    ['height', entity.height],
    ['width', entity.width],
    ['duration', entity.duration],
  ] as Array<[string, any]>;
}

export const serializeConfigPresentation3: SerializeConfig = {
  Collection: function* (entity, _state, { isTopLevel }) {
    return [
      ...(isTopLevel ? [['@context', PRESENTATION_3_CONTEXT]] : []),
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['items', filterList(yield entity.items)],
      ['first', entity.first],
      ['last', entity.last],
      ['total', entity.total],
    ];
  },

  Manifest: function* (entity, _state, { isTopLevel }) {
    return [
      ...(isTopLevel ? [['@context', PRESENTATION_3_CONTEXT]] : []),
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['items', filterList(yield entity.items)],
      ['structures', filterList(yield entity.structures)],
      ['start', entity.start ? yield entity.start : undefined],
    ];
  },

  Timeline: function* (entity) {
    return [
      ['id', stripVaultId(entity.id)],
      ['type', 'Canvas'],
      ['label', entity.label],
      ['width', 1],
      ['height', 1],
      ['duration', entity.duration],
      ...(yield* linkedProperties(entity)),
      ['items', filterList(yield entity.items)],
    ];
  },

  Canvas: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['items', filterList(yield entity.items)],
    ];
  },

  Scene: function* (_entity) {
    unsupported('Scene container');
  },

  AnnotationPage: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['items', filterList(yield entity.items)],
    ];
  },

  AnnotationCollection: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['items', filterList(yield entity.items)],
      ['first', entity.first],
      ['last', entity.last],
      ['total', entity.total],
    ];
  },

  Annotation: function* (entity) {
    ensureNoV4OnlyBehavior(entity);
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['motivation', asSingleOrArray(entity.motivation)],
      ['body', asSingleOrArray(filterList(yield entity.body))],
      ['target', asSingleOrArray(inlineList(entity.target))],
      ['timeMode', entity.timeMode],
    ];
  },

  Range: function* (entity) {
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['items', filterList(yield entity.items)],
      ['start', entity.start ? yield entity.start : undefined],
      ['supplementary', entity.supplementary ? yield entity.supplementary : undefined],
    ];
  },

  Agent: function* (entity) {
    return [
      ['id', stripVaultId(entity.id)],
      ['type', entity.type || 'Agent'],
      ['label', entity.label],
      ...(yield* linkedProperties(entity)),
    ];
  },

  Service: function* (entity) {
    return [
      ['id', stripVaultId(entity.id)],
      ['type', entity.type],
      ['profile', entity.profile],
      ['service', filterList(yield entity.service)],
    ];
  },

  Selector: function* (entity) {
    if (typeof entity.type === 'string' && unsupportedSelectorTypes.has(entity.type)) {
      unsupported(`selector type ${entity.type}`);
    }
    return [
      ['id', stripVaultId(entity.id)],
      ['type', entity.type],
      ['value', entity.value],
      ['refinedBy', entity.refinedBy ? yield entity.refinedBy : undefined],
    ];
  },

  Quantity: function* (_entity) {
    unsupported('Quantity');
  },

  Transform: function* (_entity) {
    unsupported('Transform');
  },

  ContentResource: function* (entity) {
    ensureNoV4OnlyBehavior(entity);
    ensureNo3dContent(entity);
    return [
      ...commonProperties(entity),
      ...(yield* linkedProperties(entity)),
      ['items', entity.items ? filterList(yield entity.items) : undefined],
      ['source', entity.source ? yield entity.source : undefined],
      ['selector', entity.selector ? asSingleOrArray(filterList(yield entity.selector)) : undefined],
    ];
  },
};
