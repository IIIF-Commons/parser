import { ImageService } from '@iiif/presentation-3';
import { ImageServiceImageRequest } from '../types';
import { supports } from './supports';
import { ExtraFeature } from './profiles';

export function imageServiceSupportsRequest(imageService: ImageService, request: ImageServiceImageRequest) {
  if (request.type !== 'image') {
    return [true];
  }

  const extraFeatures: ExtraFeature[] = [];

  if (request.rotation.mirror) {
    extraFeatures.push('mirroring');
  }

  if (request.region.percent) {
    extraFeatures.push('regionByPct');
  }

  if (request.region.square) {
    extraFeatures.push('regionSquare');
  } else if (!request.region.full) {
    extraFeatures.push('regionByPx');
  }

  if (request.rotation.angle) {
    const remainder = request.rotation.angle % 90;
    if (remainder) {
      extraFeatures.push('rotationArbitrary');
    } else {
      extraFeatures.push('rotationBy90s');
    }
  }

  if (request.size.confined) {
    extraFeatures.push('sizeByConfinedWh');
  }

  if (!request.size.width && request.size.height) {
    extraFeatures.push('sizeByH');
  }

  if (request.size.percentScale) {
    extraFeatures.push('sizeByPct');
  }

  // Could we bail, and check sizes instead?
  const fixedSize = (imageService.sizes || []).find(
    (size) =>
      (size.width === request.size.width && !request.size.height) ||
      (size.height === request.size.height && !request.size.width) ||
      (size.height === request.size.height && size.width === request.size.width)
  );
  if (fixedSize) {
    extraFeatures.push('sizeByWhListed');
  } else {
    if (request.size.width && !request.size.height) {
      extraFeatures.push('sizeByW');
    }

    if (request.size.width && request.size.height) {
      extraFeatures.push('sizeByWh');
    }
  }

  if (request.size.upscaled) {
    extraFeatures.push('sizeUpscaling');
  }

  const [doesSupport, reason] = supports(imageService, {
    extraFeatures,
    extraQualities: [request.quality],
    extraFormats: [request.format],
    exactSize: request.size,
  });

  if (doesSupport) {
    return [true] as const;
  }

  return [false, reason] as const;
}
