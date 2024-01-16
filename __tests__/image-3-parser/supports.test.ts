// noinspection DuplicatedCode

import { ImageService } from '@iiif/presentation-3';
import {
  imageServiceRequestToString,
  parseImageServiceRequest,
  supports,
  imageServiceSupportsRequest,
  imageServiceSupportsFormat,
} from '../../src/image-3';

describe('supports', function () {
  const id = 'https://example.org/service';

  test('supports maxArea', () => {
    expect(supports({ id, profile: 'level0' }, { maxArea: 100 })).toEqual([true]);
    expect(supports({ id, profile: 'level1' }, { maxArea: 100 })).toEqual([true]);
    expect(supports({ id, profile: 'level2' }, { maxArea: 100 })).toEqual([true]);
    expect(supports({ id, profile: ['level0', { maxArea: 150 }] }, { maxArea: 100 })).toEqual([true]);
    expect(supports({ id, profile: ['level0', { maxArea: 50 }] }, { maxArea: 100 })).toEqual([false, 'Max area is 50']);
  });

  test('supports maxWidth', () => {
    expect(supports({ id, profile: 'level0' }, { maxWidth: 100 })).toEqual([true]);
    expect(supports({ id, profile: 'level1' }, { maxWidth: 100 })).toEqual([true]);
    expect(supports({ id, profile: 'level2' }, { maxWidth: 100 })).toEqual([true]);
    expect(supports({ id, profile: ['level0', { maxWidth: 150 }] }, { maxWidth: 100 })).toEqual([true]);
    expect(supports({ id, profile: ['level0', { maxWidth: 50 }] }, { maxWidth: 100 })).toEqual([
      false,
      'Max width is 50',
    ]);
  });

  test('supports maxHeight', () => {
    expect(supports({ id, profile: 'level0' }, { maxHeight: 100 })).toEqual([true]);
    expect(supports({ id, profile: 'level1' }, { maxHeight: 100 })).toEqual([true]);
    expect(supports({ id, profile: 'level2' }, { maxHeight: 100 })).toEqual([true]);
    expect(supports({ id, profile: ['level0', { maxHeight: 150 }] }, { maxHeight: 100 })).toEqual([true]);
    expect(supports({ id, profile: ['level0', { maxHeight: 150 }] }, { maxHeight: 150 })).toEqual([true]);
    expect(supports({ id, profile: ['level0', { maxHeight: 50 }] }, { maxHeight: 100 })).toEqual([
      false,
      'Max height is 50',
    ]);
  });

  test('supports qualities', () => {
    expect(supports({ id, profile: 'level0' }, { extraQualities: ['default'] })).toEqual([true]);
    expect(supports({ id, profile: 'level1' }, { extraQualities: ['default'] })).toEqual([true]);
    expect(supports({ id, profile: 'level2' }, { extraQualities: ['default'] })).toEqual([true]);
    expect(
      supports({ id, profile: ['level0', { qualities: ['grey'] }] }, { extraQualities: ['default', 'grey'] })
    ).toEqual([true]);
    expect(
      supports(
        { id, profile: ['level0', { extraQualities: ['grey'] }] as any },
        { extraQualities: ['default', 'grey'] }
      )
    ).toEqual([true]);
    expect(supports({ id, profile: ['level0'] }, { extraQualities: ['default', 'grey'] })).toEqual([
      false,
      'Missing qualities: grey',
    ]);
  });

  test('supports features', () => {
    expect(supports({ id, profile: 'level0' }, { extraFeatures: ['sizeByWhListed'] })).toEqual([true]);
    expect(supports({ id, profile: 'level1' }, { extraFeatures: ['sizeByWhListed'] })).toEqual([true]);
    expect(supports({ id, profile: 'level2' }, { extraFeatures: ['sizeByWhListed'] })).toEqual([true]);
    expect(supports({ id, profile: ['level0'] }, { extraFeatures: ['sizeByH'] })).toEqual([
      false,
      'Missing features: sizeByH',
    ]);
    expect(supports({ id, profile: ['level0', { supports: ['sizeByH'] }] }, { extraFeatures: ['sizeByH'] })).toEqual([
      true,
    ]);
  });

  test('imageServiceSupportsFormat', () => {
    expect(imageServiceSupportsFormat({ id, profile: 'level0' }, 'jpg')).toEqual([true]);
    expect(imageServiceSupportsFormat({ id, profile: 'level0' }, 'png')).toEqual([false, 'Missing formats: png']);
    expect(imageServiceSupportsFormat({ id, profile: 'level0', extraFormats: ['png'] }, 'png')).toEqual([true]);
    expect(imageServiceSupportsFormat({ id, profile: ['level0', { formats: ['png'] }] }, 'png')).toEqual([true]);
    expect(imageServiceSupportsFormat({ id, profile: ['level0', { formats: ['png'] }] }, 'jp2')).toEqual([
      false,
      'Missing formats: jp2',
    ]);
  });

  describe('imageServiceRequestToString', () => {
    test('max width requests in versions.', () => {
      const og = parseImageServiceRequest('https://example.org/service/full/full/0/default.jpg');

      expect(imageServiceRequestToString(og, { '@context': 'http://iiif.io/api/image/2/context.json' } as any)).toEqual(
        'https://example.org/service/full/full/0/default.jpg'
      );
      expect(imageServiceRequestToString(og, { '@context': 'http://iiif.io/api/image/3/context.json' } as any)).toEqual(
        'https://example.org/service/full/max/0/default.jpg'
      );
    });

    test('max width (specific) requests in versions.', () => {
      const og = parseImageServiceRequest('https://example.org/service/full/800,600/0/default.jpg');

      expect(
        imageServiceRequestToString(og, {
          '@context': 'http://iiif.io/api/image/2/context.json',
          width: 800,
          height: 600,
        } as any)
      ).toEqual('https://example.org/service/full/full/0/default.jpg');
      expect(
        imageServiceRequestToString(og, {
          '@context': 'http://iiif.io/api/image/3/context.json',
          width: 800,
          height: 600,
        } as any)
      ).toEqual('https://example.org/service/full/max/0/default.jpg');
    });

    test('normal width (specific) requests in versions.', () => {
      const og = parseImageServiceRequest('https://example.org/service/full/400,/0/default.jpg');

      expect(
        imageServiceRequestToString(og, {
          '@context': 'http://iiif.io/api/image/2/context.json',
          width: 800,
          height: 600,
        } as any)
      ).toEqual('https://example.org/service/full/400,/0/default.jpg');
      expect(
        imageServiceRequestToString(og, {
          '@context': 'http://iiif.io/api/image/3/context.json',
          width: 800,
          height: 600,
        } as any)
      ).toEqual('https://example.org/service/full/400,300/0/default.jpg');
    });
    test('normal width (scaling) requests in versions.', () => {
      const og = parseImageServiceRequest('https://example.org/service/full/300,/0/default.jpg');

      expect(
        imageServiceRequestToString(og, {
          '@context': 'http://iiif.io/api/image/2/context.json',
          width: 800,
          height: 600,
        } as any)
      ).toEqual('https://example.org/service/full/300,/0/default.jpg');
      expect(
        imageServiceRequestToString(og, {
          '@context': 'http://iiif.io/api/image/3/context.json',
          width: 800,
          height: 600,
        } as any)
      ).toEqual('https://example.org/service/full/300,225/0/default.jpg');
    });
  });

  test('normal width (rounding) requests in versions.', () => {
    const og = parseImageServiceRequest('https://example.org/service/full/310,/0/default.jpg');

    expect(
      imageServiceRequestToString(og, {
        '@context': 'http://iiif.io/api/image/2/context.json',
        width: 800,
        height: 600,
      } as any)
    ).toEqual('https://example.org/service/full/310,/0/default.jpg');
    expect(
      imageServiceRequestToString(og, {
        '@context': 'http://iiif.io/api/image/3/context.json',
        width: 800,
        height: 600,
      } as any)
    ).toEqual('https://example.org/service/full/310,233/0/default.jpg');
  });

  describe('imageServiceSupportsRequest', () => {
    test('sample image service (v2)', () => {
      const u = parseImageServiceRequest;
      const service2: ImageService = {
        '@context': 'http://iiif.io/api/image/2/context.json',
        id,
        profile: 'level0',
        width: 800,
        height: 600,
        sizes: [
          { width: 400, height: 300 },
          { width: 800, height: 600 },
        ],
      };

      expect(
        // Full.
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/full/0/default.jpg`))
      ).toEqual([true]);
      expect(
        // A size.
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/400,/0/default.jpg`))
      ).toEqual([true]);

      expect(
        // max -> full
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/max/0/default.jpg`))
      ).toEqual([true]);

      expect(
        // 800,600 -> full
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/800,600/0/default.jpg`))
      ).toEqual([true]);

      expect(
        // 800, -> full
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/800,/0/default.jpg`))
      ).toEqual([true]);

      expect(
        // 400,300 -> 400,
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/400,300/0/default.jpg`))
      ).toEqual([true]);

      expect(
        // 400,300 -> 400,
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/450,/0/default.jpg`))
      ).toEqual([false, 'Missing features: sizeByW']);
      expect(
        // 400,300 -> 400,
        imageServiceSupportsRequest(service2, u(`https://example.org/service/full/800,900/0/default.jpg`))
      ).toEqual([false, 'Missing features: sizeByWh']);
    });
  });
});
