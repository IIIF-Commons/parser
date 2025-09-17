import { ImageService } from '@iiif/presentation-3';
import { isImageServiceLevel } from './is-image-service-level';
import { isImageService } from './is-image-service';

export function getImageServiceLevel(service: ImageService): null | number {
  if (!isImageService(service)) {
    return null;
  }
  if (isImageServiceLevel(2, service)) {
    return 2;
  }
  if (isImageServiceLevel(1, service)) {
    return 1;
  }
  if (isImageServiceLevel(0, service)) {
    return 0;
  }
  return null;
}
