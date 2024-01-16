import * as Presentation3 from '@iiif/presentation-3';
import { Traverse } from './traverse';
import { removeUndefinedProperties } from '../shared/remove-undefined-properties';

const validNavDate =
  /-?([1-9]\d{3,}|0\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T(([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0\d|1[0-3]):[0-5]\d|14:00))?/;

interface InternalLogging {
  warnings: string[];
}

const globalWarnings = { warnings: [] };

function technicalProperties(
  item: Partial<Presentation3.TechnicalProperties>,
  logging: InternalLogging = globalWarnings
): Partial<Presentation3.TechnicalProperties> {
  if (item.behavior) {
    item.behavior = ensureArrayWarning(item.behavior, 'behavior', logging);
  }

  item.width = ensureValidNumber(item.width, 'width', false, logging);
  item.height = ensureValidNumber(item.height, 'height', false, logging);
  item.duration = ensureValidNumber(item.duration, 'duration', true, logging);

  if (item.format && typeof item.format !== 'string') {
    logging.warnings.push(`"format" should be a single string`);
    if (Array.isArray(item.format) && typeof item.format[0] === 'string') {
      item.format = item.format[0];
    } else {
      item.format = undefined;
    }
  }

  return item;
}

function ensureArrayMatches(
  values: Array<any> | undefined,
  isValid: (value: any) => string | undefined,
  logging: InternalLogging = globalWarnings
) {
  if (values && Array.isArray(values)) {
    return values.filter((value) => {
      const message = isValid(value);
      if (message && logging.warnings.indexOf(message) === -1) {
        logging.warnings.push(message);
      }
      return !message;
    });
  }
  return values;
}

function ensureArrayWarning(value: any, propName: string, logging: InternalLogging = globalWarnings) {
  if (Array.isArray(value)) {
    return value;
  }
  logging.warnings.push(`"${propName}" should be Array of values`);
  return [value];
}

function ensureNotArrayWarning(value: any, propName: string, logging: InternalLogging = globalWarnings) {
  if (Array.isArray(value)) {
    logging.warnings.push(`"${propName}" should only contain a single value`);
    if (value.length === 0) {
      return undefined;
    }
    return value[0];
  }
  return value;
}

function ensureValidNumber(
  value: undefined | string | number,
  propName: string,
  isFloat = false,
  logging: InternalLogging = globalWarnings
): number | undefined {
  if (typeof value === 'undefined') {
    return undefined;
  }

  if (typeof value === 'string') {
    const newValue = isFloat ? parseFloat(value) : Math.abs(Number(value));
    if (Number.isNaN(newValue) || newValue <= 0) {
      logging.warnings.push(
        `"${propName}" expected value to be a ${isFloat ? 'Number' : 'Integer'}, instead found an invalid value`
      );
      return undefined;
    }
    logging.warnings.push(
      `"${propName}" expected value to be a ${isFloat ? 'Number' : 'Integer'}, instead found a string`
    );
    return newValue;
  }

  if (!isFloat && value % 1 !== 0) {
    logging.warnings.push(`"${propName}" expected value to be a Integer, instead found a Float`);
    return Math.floor(value);
  }

  return value;
}

function ensureValidLanguageMap(
  str: Presentation3.InternationalString,
  propName: string,
  logging: InternalLogging = globalWarnings
): Presentation3.InternationalString {
  // Handle {"label": ["an array of strings"]}
  if (Array.isArray(str)) {
    if (typeof str[0] === 'string') {
      logging.warnings.push(`"${propName}" should be a language map instead found a string`);
      return { none: str };
    }
    logging.warnings.push(`"${propName}" should be a language map instead found an unknown value`);
    return { none: [''] };
  }

  if (typeof str === 'string') {
    logging.warnings.push(`"${propName}" should be a language map instead found a string`);
    return { none: [str] };
  }

  // Handle {"label": {"en": "some value"}
  const keys = Object.keys(str);
  const fixed: Presentation3.InternationalString = {};
  let didFix = false;
  for (const key of keys) {
    const values = str[key] as unknown;
    const fixedItem = [];
    if (typeof values === 'string') {
      didFix = true;
      logging.warnings.push(`"${propName}" values inside a language map should be an Array of strings, found a string`);
      fixedItem.push(values);
    } else if (Array.isArray(values)) {
      for (const str of values) {
        if (!(typeof str === 'string')) {
          didFix = true;
          logging.warnings.push(
            `"${propName}" values inside a language map should be an Array of strings, found an unknown value`
          );
          // Nothing to do here? - but mark as needing fixed.
        } else {
          fixedItem.push(str);
        }
      }
    } else {
      didFix = true;
      logging.warnings.push(
        `"${propName}" values inside a language map should be an Array of strings, found an unknown value`
      );
    }
    if (fixedItem.length > 0) {
      fixed[key] = fixedItem;
    }
  }

  if (didFix) {
    if (Object.keys(fixed).length === 0) {
      return { none: [''] };
    }

    return fixed;
  }

  return str;
}

function validMetadataValue(
  input: Presentation3.MetadataItem,
  propName: string,
  defaultLabel = '',
  logging: InternalLogging = globalWarnings
): Presentation3.MetadataItem {
  if (typeof input === 'string') {
    logging.warnings.push(`"${propName}" should be a {label, value} set of Language maps`);
    return {
      label: { none: [defaultLabel] },
      value: { none: [input] },
    };
  } else {
    if ((!input.label && input.value) || (input.label && !input.value)) {
      logging.warnings.push(`"${propName}" should have both a label and a value`);
    }
    if (input.label) {
      input.label = ensureValidLanguageMap(input.label, `${propName}.label`, logging);
    } else {
      input.label = { none: [defaultLabel] };
    }
    if (input.value) {
      input.value = ensureValidLanguageMap(input.value, `${propName}.value`, logging);
    } else {
      input.value = { none: [''] };
    }
  }

  return input;
}

function descriptiveProperties(
  item: Partial<Presentation3.DescriptiveProperties>,
  logging: InternalLogging = globalWarnings
): Partial<Presentation3.DescriptiveProperties> {
  if (item.label) {
    item.label = ensureValidLanguageMap(item.label, 'label', logging);
  }
  if (item.summary) {
    item.summary = ensureValidLanguageMap(item.summary, 'summary', logging);
  }

  if (item.requiredStatement) {
    item.requiredStatement = validMetadataValue(
      item.requiredStatement,
      'requiredStatement',
      'Required statement',
      logging
    );
  }

  if (item.metadata) {
    if (Array.isArray(item.metadata)) {
      for (let i = 0; i < item.metadata.length; i++) {
        item.metadata[i] = validMetadataValue(item.metadata[i], `metadata.${i}`, '', logging);
      }
    } else {
      logging.warnings.push(`"metadata" should be an array of {label, value} Language maps`);
      item.metadata = [];
    }
  }

  if (item.rights) {
    if (Array.isArray(item.rights)) {
      logging.warnings.push(`"rights" should only contain a single string`);
      item.rights = typeof item.rights[0] === 'string' ? item.rights[0] : '';
    }
    if (typeof item.rights === 'string' && !item.rights.startsWith('http')) {
      logging.warnings.push(`"rights" should be a valid URI`);
    } else if (typeof item.rights === 'string' && item.rights.startsWith('https')) {
      logging.warnings.push(
        `"rights" is an informative property and should contain the http variation of the rights statement`
      );
      item.rights = `http${item.rights.slice(5)}`;
    }
  }

  if (item.navDate) {
    const trimmedNavDate = typeof item.navDate === 'string' ? item.navDate.trim() : undefined;
    if (trimmedNavDate !== item.navDate) {
      logging.warnings.push(`"navDate" should not contain extra whitespace`);
      item.navDate = trimmedNavDate;
    }
    if (typeof item.navDate !== 'string' || !item.navDate.match(validNavDate)) {
      logging.warnings.push(`"navDate" should be a valid XSD dateTime literal`);
      item.navDate = undefined;
    }
  }

  if (item.language) {
    item.language = ensureArrayWarning(item.language, 'language', logging);
    item.language = ensureArrayMatches(
      item.language,
      (value) => (typeof value === 'string' ? undefined : `'"language" expected array of strings`),
      logging
    );
  }
  if (item.accompanyingCanvas) {
    item.accompanyingCanvas = ensureNotArrayWarning(item.accompanyingCanvas, 'accompanyingCanvas', logging);
    if (item.accompanyingCanvas?.type !== 'Canvas') {
      logging.warnings.push(`"accompanyingCanvas" should be a Canvas`);
    }
  }
  if (item.placeholderCanvas) {
    item.placeholderCanvas = ensureNotArrayWarning(item.placeholderCanvas, 'placeholderCanvas', logging);
    if (item.placeholderCanvas?.type !== 'Canvas') {
      logging.warnings.push(`"placeholderCanvas" should be a Canvas`);
    }
  }
  if (item.thumbnail) {
    item.thumbnail = ensureArrayWarning(item.thumbnail, 'thumbnail', logging);
  }
  return item;
}

const validItemMapping: any = {
  Manifest: 'Canvas',
  Canvas: 'AnnotationPage',
  AnnotationPage: 'Annotation',
};

function structuralProperties(resource: any, logging: InternalLogging = globalWarnings) {
  const type = resource.type;
  switch (type) {
    case 'Canvas':
    case 'AnnotationPage':
    case 'Manifest': {
      if (resource && resource.items) {
        resource.items = ensureArrayMatches(
          resource.items,
          (item) =>
            item.type === validItemMapping[type]
              ? undefined
              : `"${resource.type}.items" should contain only type ${validItemMapping[type]}, found ${item.type}`,
          logging
        );
      }
    }
  }

  return resource;
}

function linkingProperties(
  item: Partial<Presentation3.LinkingProperties>,
  logging: InternalLogging = globalWarnings
): Partial<Presentation3.LinkingProperties> {
  if (item.logo) {
    item.logo = ensureArrayWarning(item.logo, 'logo', logging);
  }
  if (item.service) {
    item.service = ensureArrayWarning(item.service, 'service', logging);
  }

  if (item.seeAlso) {
    item.seeAlso = ensureArrayWarning(item.seeAlso, 'seeAlso', logging);
  }

  if (item.rendering) {
    item.rendering = ensureArrayWarning(item.rendering, 'rendering', logging);
  }

  if (item.partOf) {
    item.partOf = ensureArrayWarning(item.partOf, 'partOf', logging);
  }

  if (item.homepage) {
    item.homepage = ensureArrayWarning(item.homepage, 'homepage', logging);
  }

  if (item.services) {
    item.services = ensureArrayWarning(item.services, 'services', logging);
  }

  if (item.supplementary) {
    item.supplementary = ensureArrayWarning(item.supplementary, 'supplementary', logging);
  }

  if (item.start) {
    item.start = ensureNotArrayWarning(item.start, 'start', logging);
  }

  return item;
}

function upgradeResource(state: InternalLogging) {
  return (resource: any) => {
    if (!resource) {
      return undefined;
    }

    if (typeof resource === 'string') {
      return resource;
    }

    if (Array.isArray(resource)) {
      return resource;
    }

    return removeUndefinedProperties({
      ...resource,
      ...technicalProperties(resource, state),
      ...descriptiveProperties(resource, state),
      ...linkingProperties(resource, state),
      ...structuralProperties(resource, state),
    });
  };
}

export function presentation3StrictUpgrade(
  p3: Presentation3.Manifest,
  state: InternalLogging = globalWarnings
): Presentation3.Manifest {
  const traverse = Traverse.all(upgradeResource(state));

  return traverse.traverseManifest(p3);
}
