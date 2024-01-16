import { ImageService } from '@iiif/presentation-3';
import { supports } from './supports';

export function imageServiceSupportsFormat(imageService: ImageService, format: string) {
  return supports(imageService, {
    extraFormats: [format],
  });
}
