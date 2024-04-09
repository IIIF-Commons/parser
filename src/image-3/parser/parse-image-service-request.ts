import { parseRegionParameter } from './parse-region-parameter';
import { parseSizeParameter } from './parse-size-parameter';
import { parseRotationParameter } from './parse-rotation-parameter';
import { ImageServiceImageRequest } from '../types';
import { parseImageServiceUrl } from './parse-image-service-url';

export function parseImageServiceRequest(input: string, _prefix = ''): ImageServiceImageRequest {
  const { path, scheme, server, prefix } = parseImageServiceUrl(input, _prefix);

  const parts = path.split('/').reverse();
  const [fileName, rotation, size, region, ...others] = parts;
  const identifier = others.reverse().filter(Boolean).join('/');

  if (parts.length === 1 || fileName === '') {
    // likely the server will want to redirect this
    return { type: 'base', scheme, server, prefix, identifier };
  }

  if (fileName === 'info.json') {
    const [, ...identifierParts] = parts;

    return {
      type: 'info',
      scheme,
      server,
      prefix,
      identifier: identifierParts.reverse().filter(Boolean).join('/'),
    };
  }

  if (
    typeof scheme === 'undefined' ||
    typeof server === 'undefined' ||
    typeof path === 'undefined' ||
    typeof region === 'undefined' ||
    typeof size === 'undefined' ||
    typeof rotation === 'undefined' ||
    typeof fileName === 'undefined'
  ) {
    throw new Error('Invalid image service URL');
  }

  const [quality = '', format = ''] = fileName.split('.');

  return {
    type: 'image',
    scheme,
    server,
    prefix,
    identifier,
    originalPath: path,
    region: parseRegionParameter(region),
    size: parseSizeParameter(size),
    rotation: parseRotationParameter(rotation),
    quality,
    format,
  };
}
