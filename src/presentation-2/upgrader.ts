import * as Presentation3 from '@iiif/presentation-3';
import * as Presentation2 from '@iiif/presentation-2';
import { imageServiceProfiles, level1Support } from '../shared/image-api-profiles';
import { Traverse } from './traverse';
import { ensureArray } from '../shared/ensure-array';
import { removeUndefinedProperties } from '../shared/remove-undefined-properties';
import { level0Support, level2Support } from '../image-3/profiles/profiles';

const configuration = {
  attributionLabel: 'Attribution',
  lang: 'none',
  providerId: 'http://example.org/provider',
  providerName: '',
};

function compatLanguageMap(inputLangProperty?: unknown): Array<Presentation2.LanguageProperty> {
  if (typeof inputLangProperty === 'string') {
    return [inputLangProperty];
  }
  if (!inputLangProperty) {
    return [];
  }
  const arrayOfValues = Array.isArray(inputLangProperty) ? inputLangProperty : [inputLangProperty];

  const languageArray: Presentation2.LanguageProperty[] = [];
  for (const language of arrayOfValues) {
    if (typeof language === 'string') {
      languageArray.push(language);
      continue;
    }
    languageArray.push({
      '@language': language['@language'] || language.language,
      '@value': language['@value'] || language.value,
    });
  }
  return languageArray;
}

export function convertLanguageMapping(
  inputLangProperty?: Presentation2.OneOrMany<Presentation2.LanguageProperty>,
  defaultLang = 'none'
): Presentation3.InternationalString {
  if (!inputLangProperty) {
    return { none: [''] };
  }

  const arrayOfValues = compatLanguageMap(inputLangProperty);

  const languageMap: Presentation3.InternationalString = {};

  for (const language of arrayOfValues) {
    // For strings "label": ["a value"]
    if (typeof language === 'string') {
      languageMap[defaultLang] = languageMap[defaultLang] ? languageMap[defaultLang] : [];
      (languageMap[defaultLang] as string[]).push(language || '');
      continue;
    }

    // For maps without a language
    if (!language['@language']) {
      languageMap[defaultLang] = languageMap[defaultLang] ? languageMap[defaultLang] : [];
      (languageMap[defaultLang] as string[]).push(language['@value'] || '');
      continue;
    }

    // Default case with language.
    const lang = language['@language'];
    languageMap[lang] = languageMap[lang] ? languageMap[lang] : [];
    (languageMap[lang] as string[]).push(language['@value'] || '');
  }

  if (Object.keys(languageMap).length === 0) {
    return { none: [''] };
  }

  return languageMap;
}

export function getProfile(profile: any | any[]): string | undefined {
  if (Array.isArray(profile)) {
    return getProfile(profile.find((s) => typeof s === 'string'));
  }

  if (level2Support.indexOf(profile) !== -1) {
    return 'level2';
  }

  if (level1Support.indexOf(profile) !== -1) {
    return 'level1';
  }

  if (level0Support.indexOf(profile) !== -1) {
    return 'level0';
  }

  if (typeof profile !== 'string') {
    return undefined;
  }

  return profile;
}

export function getTypeFromContext(inputContexts: string | string[]): string | undefined {
  const contexts: string[] = Array.isArray(inputContexts) ? inputContexts : [inputContexts];

  for (const context of contexts) {
    switch (context) {
      case 'http://iiif.io/api/image/2/context.json':
      case 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level2':
        return 'ImageService2';
      case 'http://iiif.io/api/image/1/context.json':
      case 'http://library.stanford.edu/iiif/image-api/1.1/context.json':
        return 'ImageService1';
      case 'http://iiif.io/api/annex/openannotation/context.json':
        return 'ImageApiSelector';
    }
  }

  return undefined;
}

function getTypeFromProfile(inputProfile: string): string | undefined {
  switch (inputProfile) {
    case 'http://iiif.io/api/image/2/level0.json':
    case 'http://iiif.io/api/image/2/level1.json':
    case 'http://iiif.io/api/image/2/level2.json':
      return 'ImageService2';

    case 'http://iiif.io/api/auth/1/kiosk':
    case 'http://iiif.io/api/auth/1/login':
    case 'http://iiif.io/api/auth/1/clickthrough':
    case 'http://iiif.io/api/auth/1/external':
    case 'http://iiif.io/api/auth/0/kiosk':
    case 'http://iiif.io/api/auth/0/login':
    case 'http://iiif.io/api/auth/0/clickthrough':
    case 'http://iiif.io/api/auth/0/external':
      return 'AuthCookieService1';

    case 'http://iiif.io/api/auth/1/token':
    case 'http://iiif.io/api/auth/0/token':
      return 'AuthTokenService1';
    case 'http://iiif.io/api/auth/1/logout':
    case 'http://iiif.io/api/auth/0/logout':
      return 'AuthLogoutService1';

    case 'http://iiif.io/api/search/1/search':
    case 'http://iiif.io/api/search/0/search':
      return 'SearchService1';
    case 'http://iiif.io/api/search/1/autocomplete':
    case 'http://iiif.io/api/search/0/autocomplete':
      return 'AutoCompleteService1';
  }

  return undefined;
}

function removePrefix(str: string) {
  for (const prefix of ['sc', 'oa', 'dcterms', 'dctypes', 'iiif']) {
    if (str.startsWith(`${prefix}:`)) {
      return str.slice(prefix.length + 1);
    }
  }

  return str;
}

const knownTypes = ['Collection', 'Manifest', 'Annotation', 'AnnotationPage', 'Range', 'Service'];

function getNewType(resource: any): string {
  const id = resource['@id'] || resource.id;
  let oldType: string | string[] = resource['@type'] || resource.type;
  const profile: any = resource.profile || undefined;
  const context: any = resource['@context'] || undefined;

  if (profile) {
    const possibleType = getTypeFromProfile(profile);
    if (possibleType) {
      return possibleType;
    }
  }

  if (context) {
    const possibleType = getTypeFromContext(context);
    if (possibleType) {
      return possibleType;
    }
  }

  if (oldType) {
    if (Array.isArray(oldType)) {
      if (oldType.indexOf('oa:CssStylesheet') !== -1) {
        return 'CssStylesheet';
      }
      if (oldType.indexOf('cnt:ContentAsText') !== -1) {
        return 'TextualBody';
      }
      // Nothing we can do?
      oldType = oldType[0]!;
    }

    for (const prefix of ['sc', 'oa', 'dcterms', 'dctypes', 'iiif']) {
      if (oldType.startsWith(`${prefix}:`)) {
        oldType = oldType.slice(prefix.length + 1);
        break;
      }
    }

    switch (oldType) {
      case 'Layer':
        return 'AnnotationCollection';
      case 'AnnotationList':
        return 'AnnotationPage';
      case 'cnt:ContentAsText':
        return 'TextualBody';
      // @todo There are definitely some missing annotation types here.
    }
  }

  if (oldType && knownTypes.indexOf(oldType) !== -1) {
    return oldType;
  }

  if (resource.format) {
    if (resource.format.startsWith('image/')) {
      return 'Image';
    }
    if (resource.format.startsWith('text/')) {
      return 'Text';
    }
    if (resource.format === 'application/pdf') {
      return 'Text';
    }
    if (resource.format.startsWith('application/')) {
      return 'Dataset';
    }
  }

  if (id && (id.endsWith('.jpg') || id.endsWith('.png') || id.endsWith('.jpeg'))) {
    return 'Image';
  }

  if (!oldType) {
    return 'unknown';
  }

  // Again, nothing we can do.
  return oldType as string;
}

const licenseRegex = /http(s)?:\/\/(creativecommons.org|rightsstatements.org)[^"'\\<\n]+/gm;

function extractLicense(license: string) {
  const matches = license.match(licenseRegex);
  if (matches) {
    return matches[0];
  }

  return license;
}

async function getContentTypeOfRemoteResource(resourceId: string): Promise<string | undefined> {
  try {
    const response = await fetch(resourceId, { method: 'HEAD' });
    const headers = response.headers;

    return headers.get('content-type') || undefined;
  } catch (e) {
    // do nothing.
  }

  return undefined;
}

function fixLicense(
  license: Presentation2.RightsProperties['license'],
  licenseLabel = 'Rights/License',
  lang = 'none'
): [Presentation3.DescriptiveProperties['rights'], Presentation3.DescriptiveProperties['metadata']] {
  let rights: Presentation3.DescriptiveProperties['rights'] = null;
  const metadata: Presentation3.DescriptiveProperties['metadata'] = [];

  const licenseList = Array.isArray(license) ? license : [license];

  for (const rawLicense of licenseList) {
    const singleLicense = rawLicense ? extractLicense(rawLicense) : undefined;

    if (
      singleLicense &&
      (singleLicense.indexOf('creativecommons.org') !== -1 || singleLicense.indexOf('rightsstatements.org') !== -1)
    ) {
      if (singleLicense.startsWith('https://')) {
        rights = `http://${singleLicense.slice(8)}`;
      } else {
        rights = singleLicense;
      }
      continue;
    }
    if (singleLicense) {
      metadata.push({
        label: { [lang]: [licenseLabel] },
        value: { [lang]: [singleLicense] },
      });
    }
  }

  return [rights, metadata];
}

const removeContexts = [
  'http://iiif.io/api/presentation/2/context.json',
  'http://iiif.io/api/image/2/context.json',
  'http://iiif.io/api/image/1/context.json',
  'http://library.stanford.edu/iiif/image-api/1.1/context.json',
  'http://iiif.io/api/search/1/context.json',
  'http://iiif.io/api/search/0/context.json',
  'http://iiif.io/api/auth/1/context.json',
  'http://iiif.io/api/auth/0/context.json',
  'http://iiif.io/api/annex/openannotation/context.json',
];

function fixContext(inputContext: string | string[] | undefined): string | string[] | undefined {
  if (inputContext) {
    const contexts = Array.isArray(inputContext) ? inputContext : [inputContext];

    const newContexts = [];
    for (const context of contexts) {
      if (context === 'http://iiif.io/api/presentation/2/context.json') {
        newContexts.push('http://iiif.io/api/presentation/3/context.json');
      }
      if (removeContexts.indexOf(context) !== -1) {
        continue;
      }
      newContexts.push(context);
    }

    if (contexts.length) {
      return newContexts.length === 1 ? newContexts[0] : newContexts;
    }
  }

  return undefined;
}

function convertMetadata(
  metadata: Presentation2.DescriptiveProperties['metadata']
): Presentation3.DescriptiveProperties['metadata'] {
  if (!metadata) {
    return [];
  }

  return metadata.map((item): Presentation3.MetadataItem => {
    return {
      label: convertLanguageMapping(item.label),
      value: convertLanguageMapping(item.value),
    };
  });
}

let mintedIdCounter = 0;

function mintNewIdFromResource(
  resource: Presentation3.SomeRequired<Presentation2.TechnicalProperties, '@type'>,
  subResource?: string
) {
  const origId = encodeURI((resource as { id?: string }).id || resource['@id'] || '').trim();

  if (origId && subResource) {
    return `${origId}/${subResource}`;
  }

  if (origId) {
    return origId;
  }

  mintedIdCounter++;

  // @todo.
  return `http://example.org/${resource['@type']}${subResource ? `/${subResource}` : ''}/${mintedIdCounter}`;
}

// @todo this was removed due to identifiers not being able to be used externally after upgrading.
function resolveDecodedURI(uri: string) {
  return encodeURI(decodeURIComponent(uri)).trim();
}

function technicalProperties<T extends Partial<Presentation3.TechnicalProperties>>(
  resource: Presentation3.SomeRequired<Presentation2.TechnicalProperties, '@type'> & {
    motivation?: string | string[] | null;
    format?: string;
    profile?: any;
    '@context'?: string | string[] | undefined;
  }
) {
  const allBehaviors = [...(resource.behavior || [])];

  if (resource.viewingHint) {
    allBehaviors.push(resource.viewingHint);
  }

  let motivation: string | string[] | undefined;
  if (Array.isArray(resource.motivation)) {
    motivation = resource.motivation.map(removePrefix);
  } else if (resource.motivation) {
    motivation = removePrefix(resource.motivation);
  }

  return {
    '@context': resource['@context'] ? fixContext(resource['@context']) : undefined,
    id: (resource['@id'] || mintNewIdFromResource(resource)).trim(),
    type: getNewType(resource) as any,
    behavior: allBehaviors.length ? allBehaviors : undefined,
    // format: This will be an optional async post-process step.
    height: resource.height ? resource.height : undefined,
    width: resource.width ? resource.width : undefined,
    motivation,
    viewingDirection: resource.viewingDirection,
    profile: resource.profile,
    format: resource.format ? resource.format : undefined,
    duration: undefined,
    timeMode: undefined,
  } as any;
}

function descriptiveProperties<T extends Partial<Presentation3.DescriptiveProperties>>(
  resource: Presentation2.DescriptiveProperties &
    Presentation2.RightsProperties &
    Partial<Presentation2.TechnicalProperties>
): T {
  const [rights, extraMetadata] = fixLicense(resource.license);
  const allMetadata = [...(resource.metadata ? convertMetadata(resource.metadata) : []), ...extraMetadata];

  return {
    rights,
    metadata: allMetadata.length ? allMetadata : undefined,
    label: resource.label ? convertLanguageMapping(resource.label) : undefined,
    requiredStatement: resource.attribution
      ? {
        label: convertLanguageMapping(configuration.attributionLabel),
        value: convertLanguageMapping(resource.attribution),
      }
      : undefined,
    navDate: resource.navDate,
    summary: resource.description ? convertLanguageMapping(resource.description) : undefined,
    thumbnail: compatThumbnail(resource.thumbnail as any),
  } as T;
}

function compatThumbnail(thumb: any) {
  if (thumb) {
    const arrayOfThumbs = Array.isArray(thumb) ? thumb : [thumb];
    return arrayOfThumbs.map((t) => {
      if (typeof t === 'string') {
        return { id: t, type: 'Image' };
      }
      if (t.type === 'unknown') {
        t.type = 'Image';
      }
      return t;
    });
  }
  return thumb;
}

function parseWithin(resource: Presentation2.AbstractResource): undefined | Presentation3.LinkingProperties['partOf'] {
  if (!resource.within) {
    return undefined;
  }

  const withinProperties = Array.isArray(resource.within) ? resource.within : [resource.within];
  const returnPartOf: Presentation3.LinkingProperties['partOf'] = [];

  for (const within of withinProperties) {
    if (typeof within === 'string') {
      if (within) {
        switch (resource['@type']) {
          case 'sc:Manifest':
            returnPartOf.push({ id: within, type: 'Collection' });
            break;
          // @todo are there more cases?
        }
      }
    } else if ((within as any)['@id']) {
      returnPartOf.push({
        id: (within as any)['@id'], // as any since content resources don't require an `@id`
        type: getNewType(within) as any,
      });
    } else {
      // Content resource.
    }
  }

  return returnPartOf.length ? returnPartOf : undefined;
}

function linkingProperties(resource: Presentation2.LinkingProperties & Presentation2.RightsProperties) {
  // @todo related links to metadata.

  const related = resource.related ? (Array.isArray(resource.related) ? resource.related : [resource.related]) : [];
  const layer = resource.contentLayer as Presentation2.Layer;


  return {
    provider:
      resource.logo || related.length
        ? [
          {
            id: configuration.providerId,
            type: 'Agent' as const,
            homepage: related.length ? [related[0] as any] : undefined,
            logo: resource.logo ? (Array.isArray(resource.logo) ? resource.logo : [resource.logo]) : undefined,
            label: convertLanguageMapping(configuration.providerName),
          },
        ]
        : undefined,
    partOf: parseWithin(resource),
    rendering: resource.rendering,
    seeAlso: resource.seeAlso,
    start: resource.startCanvas as any,
    service: resource.service ? ensureArray(resource.service as any) : undefined,
    supplementary: layer ? [layer as any] : undefined,
  };
}

// FIXME: Is this function really needed?
function embeddedContentProperties(resource: Presentation2.CharsEmbeddedContent) {
  return {
    chars: resource.chars,
    format: resource.format ? resource.format : undefined,
    language: resource.language,
  };
}

function stringOrRefToRef(object: any, type: string) {
  if (!object) return null;
  if (typeof object === 'string') {
    return {
      id: object,
      type,
    };
  }

  if (typeof object?.['@id'] === 'string') {
    return {
      id: object['@id'],
      type,
    };
  }

  if (typeof object.id === 'string') {
    return {
      id: object.id,
      type,
    };
  }

  return null;
}

function paginationProperties(collection: Presentation2.Collection) {
  // This is a sort of "IIIF Presentation 3.1" upgrade before 4.0 adds Collections and CollectionPages.
  // v2 supports paged Collections, so this is a stop-gap solution. Strict implementations can ignore it.
  // Properties:
  //  - first
  //  - total
  //  - prev
  //  - next
  const additionalProperties: any = {};

  if ((collection as any).first) {
    // Note: This is a stop-gap solution for "v3.1", which does not have CollectionPages.
    const ref = stringOrRefToRef((collection as any).first, 'Collection');
    if (ref) {
      additionalProperties.first = ref;
    }
  }

  if ((collection as any).total || (collection as any).total === 0) {
    additionalProperties.total = (collection as any).total;
  }

  if ((collection as any).prev) {
    const ref = stringOrRefToRef((collection as any).prev, 'Collection');
    if (ref) {
      additionalProperties.prev = ref;
    }
  }

  if ((collection as any).next) {
    const ref = stringOrRefToRef((collection as any).next, 'Collection');
    if (ref) {
      additionalProperties.next = ref;
    }
  }

  return additionalProperties as any;
}

function removeEmptyItems(resources: any[]) {
  const toReturn = [];
  for (const originalResource of resources) {
    const resource = {...originalResource};
    if (resource.items && resource.items.length === 0) {
      delete resource.items;
    }
    toReturn.push(resource);
  }
  return toReturn;
}

function upgradeCollection(collection: Presentation2.Collection): Presentation3.Collection {
  return removeUndefinedProperties({
    ...technicalProperties(collection),
    ...descriptiveProperties<Presentation3.SomeRequired<Presentation3.CollectionDescriptive, 'label'>>(collection),
    ...linkingProperties(collection),
    ...paginationProperties(collection),
    items: removeEmptyItems(collection.members as any),
  });
}

function flattenArray<T>(array: T[][]): T[] {
  const returnArr: T[] = [];
  for (const arr of array || []) {
    returnArr.push(...arr);
  }
  return returnArr;
}

function upgradeManifest(manifest: Presentation2.Manifest): Presentation3.Manifest {
  const allCanvases = [];
  const behavior = [];
  let start = undefined;
  let viewingDirection = undefined;
  for (const sequence of manifest.sequences || []) {
    if (sequence.canvases.length) {
      allCanvases.push(...sequence.canvases);
    }
    if (sequence.behavior) {
      behavior.push(...sequence.behavior);
    }
    if (sequence.viewingDirection) {
      viewingDirection = sequence.viewingDirection;
    }
    if (sequence.startCanvas) {
      start = sequence.startCanvas;
    }
  }

  // This comes from the sequence.
  const technical = technicalProperties(manifest);
  if (behavior.length) {
    if (technical.behavior) {
      technical.behavior.push(...behavior);
    } else {
      technical.behavior = behavior;
    }
  }

  return removeUndefinedProperties({
    ...technical,
    ...descriptiveProperties(manifest),
    ...linkingProperties(manifest),
    viewingDirection,
    start: start,
    items: allCanvases,
    structures: flattenStructures(manifest.structures as any),
  });
}

function flattenStructures(structures: Presentation3.Range[]): Presentation3.Range[] {
  if (!structures) {
    return structures;
  }
  const ranges = new Map<string, Presentation3.Range>();
  for (const range of structures) {
    ranges.set(range.id, range);
  }

  let found: string[] = [];

  for (const range of structures) {
    if (range.items) {
      const items = range.items.map((item) => {
        if (typeof item === 'string') {
          found.push(item);
          return ranges.get(item) || item;
        }
        if (item && item.id) {
          found.push(item.id);
          return ranges.get(item.id) || item;
        }
        return item;
      });
      range.items = items;
    }
  }

  return structures.filter((range) => found.indexOf(range.id) === -1);
}

function upgradeCanvas(canvas: Presentation2.Canvas): Presentation3.Canvas {
  return removeUndefinedProperties({
    ...technicalProperties(canvas),
    ...descriptiveProperties(canvas),
    ...linkingProperties(canvas),
    annotations: canvas.otherContent && canvas.otherContent.length ? (canvas.otherContent as any[]) : undefined,
    items:
      canvas.images && canvas.images.length
        ? [
          {
            id: mintNewIdFromResource(canvas, 'annotation-page'),
            type: 'AnnotationPage',
            items: canvas.images as any,
          },
        ]
        : undefined,
  });
}

function upgradeAnnotationList(annotationPage: Presentation2.AnnotationList): Presentation3.AnnotationPage {
  return removeUndefinedProperties({
    ...(technicalProperties(annotationPage) as any),
    ...(descriptiveProperties(annotationPage) as any),
    ...(linkingProperties(annotationPage) as any),
    items: annotationPage.resources && annotationPage.resources.length ? (annotationPage.resources as any) : undefined,
  });
}

function upgradeSequence(sequence: Presentation2.Sequence): {
  canvases: Presentation3.Canvas[];
  behavior?: string[];
  startCanvas?: Presentation3.Reference<'Canvas'> | undefined;
  viewingDirection?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
} {
  /*
    rng = {"id": s.get('@id', self.mint_uri()), "type": "Range"}
    rng['behavior'] = ['sequence']
    rng['items'] = []
    for c in s['canvases']:
      if type(c) == dict:
        rng['items'].append({"id": c['@id'], "type": "Canvas"})
      elif type(c) in STR_TYPES:
        rng['items'].append({"id": c, "type": "Canvas"})
    # Copy other properties and hand off to _generic
    del s['canvases']
    for k in s.keys():
      if not k in ['@id', '@type']:
        rng[k] = s[k]
    self.process_generic(rng)
    what['_structures'].append(rng)
   */

  if (!sequence.canvases || sequence.canvases.length === 0) {
    return {
      canvases: [],
      behavior: [],
    };
  }
  // @todo possibly return some ranges too.
  return {
    canvases: sequence.canvases as any[],
    behavior: sequence.viewingHint ? [sequence.viewingHint] : [],
    viewingDirection: sequence.viewingDirection,
    startCanvas: sequence.startCanvas as any,
  };
}

function upgradeAnnotation(annotation: Presentation2.Annotation): Presentation3.Annotation {
  function upgradeTarget(target: typeof annotation.on): Presentation3.AnnotationTarget {
    if (Array.isArray(target)) {
      if (target.length > 1) {
        return { type: 'List', items: target.map(upgradeTarget) as Presentation3.Target[] };
      }
      target = target[0]!;
    }
    if (typeof target === 'string') {
      return encodeURI(target).trim();
    } else if ('@type' in target) {
      let source: string | Presentation3.Reference<'Canvas'> | Presentation3.Reference<'Image'>;
      if (typeof target.full === 'string') {
        source = target.full;
      } else if (target.full['@type'] === 'dctypes:Image') {
        source = { id: target.full['@id'], type: 'Image' };
      } else if (target.full['@type'] === 'sc:Canvas') {
        source = { id: target.full['@id'], type: 'Canvas' };
      } else {
        throw new Error(`Unsupported source type on annotation: ${target.full['@type']}`);
      }
      return {
        type: 'SpecificResource',
        source,
        selector: upgradeSelector(target.selector),
      };
    } else {
      return encodeURI(target['@id']).trim();
    }
  }
  return removeUndefinedProperties({
    ...(technicalProperties(annotation) as any),
    ...(descriptiveProperties(annotation) as any),
    ...(linkingProperties(annotation) as any),
    target: upgradeTarget(annotation.on),
    body: Array.isArray(annotation.resource)
      ? annotation.resource.map(upgradeContentResourceOrChoice)
      : upgradeContentResourceOrChoice(annotation.resource),
    // @todo stylesheet upgrade.
  });
}

function upgradeContentResourceOrChoice(
  resource: Presentation2.ContentResource | Presentation2.ChoiceEmbeddedContent
): Presentation3.ContentResource | Presentation3.ChoiceBody {
  if ((resource as any).type === 'Choice') {
    return resource as any;
  }
  return upgradeContentResource(resource);
}

function upgradeContentResource(inputContentResource: Presentation2.ContentResource): Presentation3.ContentResource {
  const contentResource = inputContentResource as Presentation2.CommonContentResource;

  // @todo there might be some field dropped here.
  return removeUndefinedProperties({
    ...(technicalProperties(contentResource) as any),
    ...(descriptiveProperties(contentResource) as any),
    ...(linkingProperties(contentResource as any) as any),
    ...(embeddedContentProperties(contentResource as any) as any),
  });
}

function upgradeChoice(choice: Presentation2.ChoiceEmbeddedContent): Presentation3.ChoiceBody {
  const items = [];

  if (choice.default && choice.default !== 'rdf:nil') {
    items.push(choice.default);
  }

  if (choice.item && choice.item !== 'rdf:nil') {
    items.push(...choice.item);
  }

  return removeUndefinedProperties({
    ...technicalProperties(choice),
    ...descriptiveProperties(choice),
    items: items as any,
  });
}

function upgradeRange(range: Presentation2.Range): Presentation3.Range {
  // range.members;
  // range.canvases;
  // Range.
  // At the moment a range only references other ranges by id.
  // So we need to first get
  return removeUndefinedProperties({
    ...technicalProperties(range),
    ...descriptiveProperties(range),
    ...linkingProperties(range),
    items: range.members as any,
  } as Presentation3.Range);
}

function upgradeService(service: Presentation2.Service): Presentation3.Service {
  const { '@id': id, '@type': type, '@context': context, profile, ...additionalProps } = service as any;

  const newService: any = {};

  if (id) {
    newService['@id'] = id;
  }

  newService['@type'] = getNewType(service);

  if (newService['@type'] === 'unknown') {
    // @todo handle case where there might be multiple contexts.
    if (context && context.length) {
      newService['@context'] = context;
    }
    newService['@type'] = 'Service'; // optional on services.
  }

  if (profile) {
    newService.profile = getProfile(profile);
  }

  return removeUndefinedProperties({
    ...newService,
    ...additionalProps,
  });
}

function upgradeLayer(layer: Presentation2.Layer): Presentation3.AnnotationCollection {
  return removeUndefinedProperties({
    ...technicalProperties(layer),
    ...descriptiveProperties(layer),
    ...linkingProperties(layer),
  });
}

export const presentation2to3 = new Traverse<{
  Collection: Presentation3.Collection;
  Manifest: Presentation3.Manifest;
  Canvas: Presentation3.Canvas;
  AnnotationList: Presentation3.AnnotationPage;
  Sequence: Presentation3.Canvas[];
  Annotation: Presentation3.Annotation;
  ContentResource: Presentation3.ContentResource;
  Choice: Presentation3.ChoiceBody;
  Range: Presentation3.Range;
  Service: Presentation3.Service;
  Layer: Presentation3.AnnotationCollection;
}>({
  collection: [upgradeCollection],
  manifest: [upgradeManifest],
  canvas: [upgradeCanvas],
  annotationList: [upgradeAnnotationList],
  sequence: [upgradeSequence],
  annotation: [upgradeAnnotation],
  contentResource: [upgradeContentResource],
  choice: [upgradeChoice],
  range: [upgradeRange],
  service: [upgradeService],
  layer: [upgradeLayer],
});

export function convertPresentation2(entity: any): Presentation3.Manifest | Presentation3.Collection {
  if (
    (entity &&
      entity['@context'] &&
      (entity['@context'] === 'http://iiif.io/api/presentation/2/context.json' ||
        entity['@context'].indexOf('http://iiif.io/api/presentation/2/context.json') !== -1 ||
        // Yale context.
        entity['@context'] === 'http://www.shared-canvas.org/ns/context.json')) ||
    entity['@context'] === 'http://iiif.io/api/image/2/context.json' ||
    // No-context is possible.
    (entity['@id'] && entity['@type'] === 'sc:Collection') ||
    (entity['@id'] && entity['@type'] === 'sc:Manifest')
  ) {
    if (!entity['@context']) {
      entity['@context'] = 'http://iiif.io/api/presentation/2/context.json';
    }
    return presentation2to3.traverseUnknown(entity);
  }
  return entity;
}

function upgradeSelector(
  selector: Presentation2.ContentResourceSelector
): Presentation3.Selector | Presentation3.Selector[] {
  const isSvgSelector =
    ((Array.isArray(selector['@type']) && selector['@type'].includes('oa:SvgSelector')) ||
      selector['@type'] == 'oa:SvgSelector') &&
    ('chars' in selector || 'value' in selector);
  if (isSvgSelector) {
    return {
      type: 'SvgSelector',
      value: 'chars' in selector ? selector.chars : selector.value,
    };
  }
  if (selector['@type'] === 'oa:FragmentSelector') {
    return {
      type: 'FragmentSelector',
      value: selector.value,
    };
  }
  if (selector['@type'] === 'oa:Choice') {
    return [
      upgradeSelector(selector.default) as Presentation3.Selector,
      ...((Array.isArray(selector.item) ? selector.item : [selector.item]).map(
        upgradeSelector
      ) as Presentation3.Selector[]),
    ];
  }
  if (selector['@type'] == 'iiif:ImageApiSelector') {
    return {
      type: 'ImageApiSelector',
      region: 'region' in selector ? selector.region : undefined,
      rotation: 'rotation' in selector ? selector.rotation : undefined,
    };
  }
  throw new Error(`Unsupported selector type: ${selector['@type']}`);
}
