import { ImageService } from '@iiif/presentation-3';
import { ImageServiceImageRequest } from '../types';
import { combineProfiles } from '../profiles/combine-profiles';
import { parseImageServiceRequest } from '../parser/parse-image-service-request';
import { canonicalServiceUrl } from './canonical-service-url';

export function createImageServiceRequest(imageService: ImageService): ImageServiceImageRequest {
  const parsed = parseImageServiceRequest(canonicalServiceUrl(imageService.id));
  if (parsed.type !== 'info') {
    throw new Error('Invalid service URL');
  }

  const features = combineProfiles(imageService);

  return {
    identifier: parsed.identifier,
    originalPath: '',
    server: parsed.server,
    prefix: parsed.prefix,
    scheme: parsed.scheme,
    type: 'image',
    quality: features.extraQualities.indexOf('default') === -1 ? features.extraQualities[0] : 'default',
    region: {
      full: true,
    },
    size: {
      max: true,
      upscaled: false,
      confined: false,
    },
    format: 'jpg',
    rotation: {
      angle: 0,
    },
  };
}
