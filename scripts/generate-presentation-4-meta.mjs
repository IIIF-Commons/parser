import { promises as fs } from 'node:fs';
import path from 'node:path';

const MODEL_URL = 'https://preview.iiif.io/api/prezi-4/presentation/4.0/model/';
const ROOT = 'https://preview.iiif.io/api/prezi-4/presentation/4.0/model/';
const OUT_DIR = path.join(process.cwd(), 'src', 'presentation-4', 'meta');

const GROUP_HEADINGS = new Set([
  'Containers',
  'Annotations',
  'ContentResources',
  'Selectors',
  'scene-components',
  'utility-classes',
]);

const RESOURCE_GROUP_NAME = {
  Collection: 'topLevel',
  Manifest: 'topLevel',
  Range: 'topLevel',
  CollectionPage: 'paging',
  Timeline: 'containers',
  Canvas: 'containers',
  Scene: 'containers',
  Annotation: 'annotations',
  AnnotationCollection: 'annotations',
  AnnotationPage: 'annotations',
  SpecificResource: 'annotations',
  TextualBody: 'annotations',
  Choice: 'annotations',
  FragmentSelector: 'selectors',
  SvgSelector: 'selectors',
  PointSelector: 'selectors',
  WktSelector: 'selectors',
  AudioContentSelector: 'selectors',
  VisualContentSelector: 'selectors',
  AnimationSelector: 'selectors',
  ImageApiSelector: 'selectors',
  Camera: 'sceneComponents',
  OrthographicCamera: 'sceneComponents',
  PerspectiveCamera: 'sceneComponents',
  Light: 'sceneComponents',
  AmbientLight: 'sceneComponents',
  DirectionalLight: 'sceneComponents',
  PointLight: 'sceneComponents',
  SpotLight: 'sceneComponents',
  AudioEmitters: 'sceneComponents',
  AmbientAudio: 'sceneComponents',
  PointAudio: 'sceneComponents',
  SpotAudio: 'sceneComponents',
  Transforms: 'sceneComponents',
  RotateTransform: 'sceneComponents',
  ScaleTransform: 'sceneComponents',
  TranslateTransform: 'sceneComponents',
  Agent: 'utility',
  Quantity: 'utility',
  Service: 'utility',
};

const CATEGORY_SETS = {
  technical: new Set([
    'id',
    'type',
    'format',
    'profile',
    'height',
    'width',
    'duration',
    'behavior',
    'timeMode',
    'viewingDirection',
    'version',
    'fileSize',
    'language',
  ]),
  descriptive: new Set(['label', 'metadata', 'summary', 'requiredStatement', 'rights', 'navDate', 'provider', 'thumbnail']),
  linking: new Set(['homepage', 'logo', 'rendering', 'seeAlso', 'partOf', 'start', 'services', 'service', 'supplementary', 'canonical', 'via']),
  structural: new Set(['items', 'structures', 'annotations', 'body', 'target', 'selector', 'source', 'first', 'last', 'next', 'prev', 'total', 'startIndex']),
  spatialTemporal: new Set([
    'x',
    'y',
    'z',
    'position',
    'lookAt',
    'near',
    'far',
    'fieldOfView',
    'angle',
    'rotation',
    'size',
    'region',
    'spatialScale',
    'temporalScale',
    'unit',
    'quantityValue',
    'value',
    'instant',
    'volume',
    'intensity',
    'color',
    'backgroundColor',
    'quality',
  ]),
  interaction: new Set([
    'action',
    'exclude',
    'provides',
    'interactionMode',
    'styleClass',
    'stylesheet',
    'placeholderContainer',
    'accompanyingContainer',
    'transform',
    'motivation',
    'navPlace',
  ]),
};

const PROPERTY_ID_ALIASES = {
  filesize: 'fileSize',
};

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&ndash;', '-')
    .replaceAll('&mdash;', '-');
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function getSlice(html, startId, endId) {
  const startNeedle = `id="${startId}"`;
  const endNeedle = `id="${endId}"`;
  const start = html.indexOf(startNeedle);
  if (start < 0) {
    throw new Error(`Could not find start section: ${startId}`);
  }
  const end = html.indexOf(endNeedle, start);
  if (end < 0) {
    throw new Error(`Could not find end section: ${endId}`);
  }
  return html.slice(start, end);
}

function extractHeadingsWithSummary(htmlSlice, allowedLevels) {
  const headingRegex = /<h([1-6]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  const raw = [];
  let match;

  while ((match = headingRegex.exec(htmlSlice))) {
    const level = Number(match[1]);
    if (!allowedLevels.has(level)) {
      continue;
    }
    raw.push({
      level,
      id: match[2],
      title: stripTags(match[3]),
      index: match.index,
      endIndex: headingRegex.lastIndex,
    });
  }

  return raw.map((entry, i) => {
    const next = raw[i + 1];
    const body = htmlSlice.slice(entry.endIndex, next ? next.index : htmlSlice.length);
    const paragraphs = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((p) => stripTags(p[1]));
    const preferred = paragraphs.find((paragraph) => {
      if (!paragraph) {
        return false;
      }
      if (/^\"type\":/.test(paragraph)) {
        return false;
      }
      return paragraph.length > 24;
    });
    const summary = preferred || paragraphs[0] || '';
    return {
      level: entry.level,
      id: entry.id,
      title: entry.title,
      summary,
    };
  });
}

function extractClasses(html) {
  const classSlice = getSlice(html, 'classes', 'properties');
  const headings = extractHeadingsWithSummary(classSlice, new Set([3, 4, 5]));
  const classes = {};

  for (const heading of headings) {
    if (heading.level === 3 && GROUP_HEADINGS.has(heading.id)) {
      continue;
    }
    const summary = heading.summary || `Class defined by the Presentation 4 model.`;
    classes[heading.id] = {
      link: `${ROOT}#${heading.id}`,
      summary,
      title: heading.title,
    };
  }

  return Object.fromEntries(Object.entries(classes).sort(([a], [b]) => a.localeCompare(b)));
}

function extractProperties(html) {
  const propertySlice = getSlice(html, 'properties', 'dynamic-content');
  const headings = extractHeadingsWithSummary(propertySlice, new Set([3]));
  const properties = {};

  for (const heading of headings) {
    const propertyName = PROPERTY_ID_ALIASES[heading.id] || heading.id;
    const summary = heading.summary || `Property defined by the Presentation 4 model.`;
    properties[propertyName] = {
      link: `${ROOT}#${heading.id}`,
      summary,
      title: heading.title,
    };
  }

  return Object.fromEntries(Object.entries(properties).sort(([a], [b]) => a.localeCompare(b)));
}

function makeResourceGroups(allClasses) {
  const groups = {
    topLevel: [],
    paging: [],
    containers: [],
    annotations: [],
    selectors: [],
    sceneComponents: [],
    utility: [],
    other: [],
  };

  for (const className of allClasses) {
    const group = RESOURCE_GROUP_NAME[className] || 'other';
    groups[group].push(className);
  }

  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.localeCompare(b));
  }

  return groups;
}

function makePropertyCategories(allProperties) {
  const categories = {
    technical: [],
    descriptive: [],
    linking: [],
    structural: [],
    spatialTemporal: [],
    interaction: [],
    other: [],
  };

  for (const property of allProperties) {
    if (CATEGORY_SETS.technical.has(property)) {
      categories.technical.push(property);
      continue;
    }
    if (CATEGORY_SETS.descriptive.has(property)) {
      categories.descriptive.push(property);
      continue;
    }
    if (CATEGORY_SETS.linking.has(property)) {
      categories.linking.push(property);
      continue;
    }
    if (CATEGORY_SETS.structural.has(property)) {
      categories.structural.push(property);
      continue;
    }
    if (CATEGORY_SETS.spatialTemporal.has(property)) {
      categories.spatialTemporal.push(property);
      continue;
    }
    if (CATEGORY_SETS.interaction.has(property)) {
      categories.interaction.push(property);
      continue;
    }

    categories.other.push(property);
  }

  for (const key of Object.keys(categories)) {
    categories[key].sort((a, b) => a.localeCompare(b));
  }

  return categories;
}

function ts(value) {
  return JSON.stringify(value, null, 2);
}

function createDocumentationSource(classes, properties) {
  return `/**
 * IIIF Presentation API version 4.0 model metadata.
 *
 * Source: ${MODEL_URL}
 * Generated by scripts/generate-presentation-4-meta.mjs
 */

type DocDefinition = {
  link: string;
  summary: string;
  title: string;
};

const root = ${ts(ROOT)};

const definedTypes: Record<string, DocDefinition> = ${ts(classes)};

const propertyDocumentation: Record<string, DocDefinition> = ${ts(properties)};

export const documentation = {
  attribution:
    'Copyright (c) IIIF Consortium and contributors. Generated summaries derived from the Presentation 4 model specification.',
  disclaimer: 'https://iiif.io/api/annex/notes/disclaimer/',
  license: 'https://creativecommons.org/licenses/by/4.0/',
  version: '4.0',
  root,
  definedTypes,
  properties: propertyDocumentation,
} as const;
`;
}

function createResourcesSource(allClasses, groups) {
  return `/**
 * Presentation 4 resource type inventory derived from the model specification.
 */

const all = ${ts(allClasses)} as const;

export type Presentation4ResourceType = (typeof all)[number];

export const resources = {
  all,
  groups: ${ts(groups)} as const,
} as const;
`;
}

function createPropertiesSource(allProperties, categories) {
  return `/**
 * Presentation 4 property inventory grouped for documentation and type work.
 */

const all = ${ts(allProperties)} as const;

export type Presentation4PropertyName = (typeof all)[number];

export const properties = {
  all,
  categories: ${ts(categories)} as const,
} as const;
`;
}

async function run() {
  const response = await fetch(MODEL_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${MODEL_URL}: ${response.status}`);
  }

  const html = await response.text();
  const classes = extractClasses(html);
  const properties = extractProperties(html);

  const allClasses = Object.keys(classes);
  const allProperties = Object.keys(properties);

  const resourceGroups = makeResourceGroups(allClasses);
  const propertyCategories = makePropertyCategories(allProperties);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, 'documentation.ts'), createDocumentationSource(classes, properties));
  await fs.writeFile(path.join(OUT_DIR, 'resources.ts'), createResourcesSource(allClasses, resourceGroups));
  await fs.writeFile(path.join(OUT_DIR, 'properties.ts'), createPropertiesSource(allProperties, propertyCategories));
  await fs.writeFile(
    path.join(OUT_DIR, 'index.ts'),
    "export * from './documentation';\nexport * from './resources';\nexport * from './properties';\n"
  );

  console.log(`Generated Presentation 4 meta in ${OUT_DIR}`);
  console.log(`Classes: ${allClasses.length}`);
  console.log(`Properties: ${allProperties.length}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
