import { describe, expect, test } from 'vitest';
import { documentation, properties, resources } from '../../src/presentation-4/meta';

describe('presentation-4 meta generation', () => {
  test('contains required class anchors', () => {
    const requiredClasses = [
      'Collection',
      'Manifest',
      'Timeline',
      'Canvas',
      'Scene',
      'Annotation',
      'AnnotationPage',
      'AnnotationCollection',
      'SpecificResource',
      'Range',
      'Agent',
      'Service',
      'Quantity',
      'ImageApiSelector',
      'PointSelector',
    ] as const;

    for (const className of requiredClasses) {
      const def = documentation.definedTypes[className];
      expect(def, `missing class ${className}`).toBeDefined();
      if (!def) {
        continue;
      }
      expect(def.link).toBe(`${documentation.root}#${className}`);
      expect(def.summary.length).toBeGreaterThan(0);
    }
  });

  test('contains required property anchors', () => {
    const requiredProperties = [
      'id',
      'type',
      'label',
      'items',
      'annotations',
      'metadata',
      'summary',
      'requiredStatement',
      'rights',
      'provider',
      'thumbnail',
      'start',
      'structures',
      'behavior',
      'viewingDirection',
      'timeMode',
      'body',
      'target',
      'selector',
      'source',
      'service',
      'services',
    ] as const;

    for (const property of requiredProperties) {
      const def = documentation.properties[property];
      expect(def, `missing property ${property}`).toBeDefined();
      if (!def) {
        continue;
      }
      expect(def.link).toBe(`${documentation.root}#${property}`);
      expect(def.summary.length).toBeGreaterThan(0);
    }
  });

  test('resource groups and property categories are deterministic', () => {
    const sortedResources = [...resources.all].sort((a, b) => a.localeCompare(b));
    expect(resources.all).toEqual(sortedResources);

    const allGroupedResources = Object.values(resources.groups).flat();
    expect(new Set(allGroupedResources).size).toBe(resources.all.length);

    const sortedProperties = [...properties.all].sort((a, b) => a.localeCompare(b));
    expect(properties.all).toEqual(sortedProperties);

    const allCategorizedProperties = Object.values(properties.categories).flat();
    expect(new Set(allCategorizedProperties).size).toBe(properties.all.length);
  });
});
