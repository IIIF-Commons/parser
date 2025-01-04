import { ImageServiceImageRequest } from '../types';
import { regionParameterToString } from './region-parameter-to-string';
import { sizeParameterToString } from './size-parameter-to-string';
import { rotationParameterToString } from './rotation-parameter-to-string';
import { ImageService } from '@iiif/presentation-3';

export function imageServiceRequestToString(req: ImageServiceImageRequest, service?: ImageService): string {
  const prefix = req.prefix.startsWith('/') ? req.prefix.substring(1) : req.prefix;
  const baseUrl = `${req.scheme}://${req.server}/${prefix ? `${prefix}/` : ''}${req.identifier}`;

  if (req.type === 'base') {
    return baseUrl;
  }

  if (req.type === 'info') {
    return `${baseUrl}/info.json`;
  }

  let { size } = req;
  const { region, rotation, format, quality } = req;

  if (service) {
    // Service specific changes.
    const ctx = service['@context']
      ? Array.isArray(service['@context'])
        ? service['@context']
        : [service['@context']]
      : [];
    const is2 = ctx.indexOf('http://iiif.io/api/image/2/context.json') !== -1;
    const is3 = ctx.indexOf('http://iiif.io/api/image/3/context.json') !== -1;

    // max size, for canonical.
    if (
      (size.width === service.width && !size.height) ||
      (size.height === service.height && !size.width) ||
      (size.width === service.width && size.height === service.height)
    ) {
      size = { ...size, max: true };
    }

    if (is2) {
      if (size.max && !size.serialiseAsFull) {
        size = { ...size, serialiseAsFull: true };
      }

      if (!size.max && size.width && size.height) {
        size = { ...size, height: undefined };
      }

      size = { ...size, version: 2 };
    }
    if (is3) {
      if (size.max && size.serialiseAsFull) {
        size = { ...size, serialiseAsFull: false };
      }

      if (size.width && !size.height && service.width && service.height) {
        // canonical requires height.
        const ratio = service.height / service.width;
        size = { ...size, height: Math.ceil(size.width * ratio) };
      }

      size = { ...size, version: 3 };
    }

    // @todo FUTURE - possibly passing in a correct=true option
    // 1. Closeness/rounding to fixed size
    // 2. Fallback to supported format.
    // 3. Round to rotation
  }

  return [
    baseUrl,
    regionParameterToString(region),
    sizeParameterToString(size),
    rotationParameterToString(rotation),
    `${quality}.${format}`,
  ]
    .filter(Boolean)
    .join('/');
}
