import type { ImageService } from '../../presentation-3/types';
import { supports } from './supports';

export function imageServiceSupportsFormat(imageService: ImageService, format: string) {
  return supports(imageService, {
    extraFormats: [format],
  });
}
