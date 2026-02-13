import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

const { mkdir, readdir, readFile, rm, writeFile } = fs;

const BASE_URL = 'https://preview.iiif.io/cookbook/v4/';
const ROOT_SELECTOR = 'a[href]';
const RECIPE_PATH_MATCHER = /^\/cookbook\/v4\/recipe\/([^/]+)\/?$/;
const EXCLUDED_RECIPE_IDS = new Set(['matrix', 'code']);
const FIXTURE_DIR = join(cwd(), 'fixtures', 'cookbook-v4');
const fetch = globalThis.fetch.bind(globalThis);
const ARRAY_FIELDS = new Set([
  'thumbnail',
  'provider',
  'seeAlso',
  'service',
  'services',
  'homepage',
  'rendering',
  'partOf',
  'annotations',
  'items',
  'structures',
  'motivation',
  'body',
  'target',
  'selector',
  'transform',
  'action',
  'provides',
  'exclude',
  'behavior',
  'metadata',
]);
const CONTAINER_TYPES = new Set(['Timeline', 'Canvas', 'Scene']);

GlobalRegistrator.register();

function toAbsoluteUrl(maybeRelative, base) {
  if (!maybeRelative) {
    return null;
  }
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

function getRecipeId(maybeRecipeUrl) {
  try {
    const url = new URL(maybeRecipeUrl);
    const match = RECIPE_PATH_MATCHER.exec(url.pathname);
    if (!match || !match[1]) {
      return null;
    }
    return EXCLUDED_RECIPE_IDS.has(match[1]) ? null : match[1];
  } catch {
    return null;
  }
}

function normalizeRecipeUrl(recipeId) {
  return new URL(`recipe/${recipeId}/`, BASE_URL).toString();
}

function isPresentation4Context(resource) {
  if (!resource || typeof resource !== 'object') {
    return false;
  }
  const context = resource['@context'];
  const values = Array.isArray(context) ? context : [context];
  return values.some(
    (value) => typeof value === 'string' && /\/api\/presentation\/4\/context\.json$/.test(value)
  );
}

function createDom(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  return wrapper;
}

function collectRecipeUrls(indexHtml) {
  const wrapper = createDom(indexHtml);
  const recipeIds = new Set();

  for (const anchor of wrapper.querySelectorAll(ROOT_SELECTOR)) {
    const href = anchor.getAttribute('href');
    const absoluteUrl = toAbsoluteUrl(href, BASE_URL);
    const recipeId = absoluteUrl ? getRecipeId(absoluteUrl) : null;
    if (recipeId) {
      recipeIds.add(recipeId);
    }
  }

  return Array.from(recipeIds).sort((a, b) => a.localeCompare(b));
}

function collectJsonCandidates(recipeHtml, recipeUrl) {
  const wrapper = createDom(recipeHtml);
  const candidates = new Set();

  for (const anchor of wrapper.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    const absoluteUrl = toAbsoluteUrl(href, recipeUrl);
    if (!absoluteUrl) {
      continue;
    }
    const parsed = new URL(absoluteUrl);
    if (parsed.pathname.endsWith('.json')) {
      candidates.add(absoluteUrl);
    }
  }

  for (const element of wrapper.querySelectorAll('[data-src]')) {
    const value = element.getAttribute('data-src');
    const absoluteUrl = toAbsoluteUrl(value, recipeUrl);
    if (!absoluteUrl) {
      continue;
    }
    const parsed = new URL(absoluteUrl);
    if (parsed.pathname.endsWith('.json')) {
      candidates.add(absoluteUrl);
    }
  }

  for (const element of wrapper.querySelectorAll('[data-iiif-content]')) {
    const value = element.getAttribute('data-iiif-content');
    const absoluteUrl = toAbsoluteUrl(value, recipeUrl);
    if (!absoluteUrl) {
      continue;
    }
    const parsed = new URL(absoluteUrl);
    if (parsed.pathname.endsWith('.json')) {
      candidates.add(absoluteUrl);
    }
  }

  return Array.from(candidates).sort((a, b) => a.localeCompare(b));
}

function createIndexKey(recipeId, manifestUrl, existingKeys) {
  const parsed = new URL(manifestUrl);
  const basePrefix = `/cookbook/v4/recipe/${recipeId}/`;
  const relativePath = parsed.pathname.startsWith(basePrefix)
    ? parsed.pathname.slice(basePrefix.length)
    : parsed.pathname.split('/').pop() || 'manifest.json';

  const normalized = relativePath.replace(/^v4\//, '').replace(/\.json$/, '');
  const baseKey = normalized === 'manifest' ? recipeId : `${recipeId}-${normalized.replace(/\//g, '-')}`;
  let key = baseKey;
  let index = 2;

  while (existingKeys.has(key)) {
    key = `${baseKey}-${index}`;
    index += 1;
  }

  existingKeys.add(key);
  return key;
}

function sortObjectByKey(input) {
  const sortedEntries = Object.entries(input).sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(sortedEntries);
}

function canonicalizeForParser(value) {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalizeForParser(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const output = {};
  for (const [key, nested] of Object.entries(value)) {
    const normalizedNested = canonicalizeForParser(nested);
    if (ARRAY_FIELDS.has(key) && typeof normalizedNested !== 'undefined' && !Array.isArray(normalizedNested)) {
      output[key] = [normalizedNested];
      continue;
    }
    output[key] = normalizedNested;
  }
  return output;
}

function collectTypeLookup(value, lookup = {}) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTypeLookup(item, lookup);
    }
    return lookup;
  }

  if (!value || typeof value !== 'object') {
    return lookup;
  }

  if (typeof value.id === 'string' && typeof value.type === 'string' && !lookup[value.id]) {
    lookup[value.id] = value.type;
  }

  for (const nested of Object.values(value)) {
    if (nested && typeof nested === 'object') {
      collectTypeLookup(nested, lookup);
    }
  }

  return lookup;
}

function inferTypeFromLookup(id, lookup, fallbackType) {
  if (!id || typeof id !== 'string') {
    return fallbackType;
  }

  if (lookup[id]) {
    return lookup[id];
  }

  const fragmentIndex = id.indexOf('#');
  if (fragmentIndex !== -1) {
    const withoutFragment = id.slice(0, fragmentIndex);
    if (lookup[withoutFragment]) {
      return lookup[withoutFragment];
    }
  }

  return fallbackType;
}

function normalizeAnnotationTargets(value, lookup, containerHint = 'Canvas') {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeAnnotationTargets(item, lookup, containerHint));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const currentType = typeof value.type === 'string' ? value.type : undefined;
  const nextContainerHint = currentType && CONTAINER_TYPES.has(currentType) ? currentType : containerHint;
  const output = {};

  for (const [key, nested] of Object.entries(value)) {
    if (currentType === 'Annotation' && key === 'target') {
      const targets = Array.isArray(nested) ? nested : [nested];
      output[key] = targets.map((target) => {
        if (typeof target === 'string') {
          return {
            id: target,
            type: inferTypeFromLookup(target, lookup, nextContainerHint),
          };
        }
        if (target && typeof target === 'object' && !Array.isArray(target)) {
          if (typeof target.id === 'string' && typeof target.type !== 'string') {
            return {
              ...normalizeAnnotationTargets(target, lookup, nextContainerHint),
              type: inferTypeFromLookup(target.id, lookup, nextContainerHint),
            };
          }
        }
        return normalizeAnnotationTargets(target, lookup, nextContainerHint);
      });
      continue;
    }

    output[key] = normalizeAnnotationTargets(nested, lookup, nextContainerHint);
  }

  return output;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.json();
}

async function resetFixtureDirectory() {
  await mkdir(FIXTURE_DIR, { recursive: true });
  const existing = await readdir(FIXTURE_DIR);
  await Promise.all(
    existing
      .filter((file) => file.endsWith('.json'))
      .map((file) => rm(join(FIXTURE_DIR, file), { force: true }))
  );
}

async function main() {
  await resetFixtureDirectory();

  const indexHtml = await fetchText(BASE_URL);
  const recipeIds = collectRecipeUrls(indexHtml);
  const index = {};
  const indexKeys = new Set();

  console.log(`Found ${recipeIds.length} recipe pages`);

  for (const recipeId of recipeIds) {
    const recipeUrl = normalizeRecipeUrl(recipeId);
    let recipeHtml;

    try {
      recipeHtml = await fetchText(recipeUrl);
    } catch (error) {
      console.warn(`Skipping recipe ${recipeId}: ${(error && error.message) || error}`);
      continue;
    }

    const candidates = collectJsonCandidates(recipeHtml, recipeUrl).filter((candidateUrl) =>
      candidateUrl.includes(`/cookbook/v4/recipe/${recipeId}/`)
    );

    for (const candidateUrl of candidates) {
      let json;
      try {
        json = await fetchJson(candidateUrl);
      } catch (error) {
        console.warn(`Skipping candidate ${candidateUrl}: ${(error && error.message) || error}`);
        continue;
      }

      if (!isPresentation4Context(json)) {
        continue;
      }

      const canonicalArrayForm = canonicalizeForParser(json);
      const typeLookup = collectTypeLookup(canonicalArrayForm);
      const canonical = normalizeAnnotationTargets(canonicalArrayForm, typeLookup);

      const key = createIndexKey(recipeId, candidateUrl, indexKeys);
      const fixturePath = join(FIXTURE_DIR, `${key}.json`);
      await writeFile(fixturePath, `${JSON.stringify(canonical, null, 2)}\n`);

      index[key] = {
        id: key,
        url: candidateUrl,
        recipeUrl,
      };
    }
  }

  const sortedIndex = sortObjectByKey(index);
  await writeFile(join(FIXTURE_DIR, '_index.json'), `${JSON.stringify(sortedIndex, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(sortedIndex).length} Presentation 4 fixtures to ${FIXTURE_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
