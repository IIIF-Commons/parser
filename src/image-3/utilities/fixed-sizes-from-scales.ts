import { ImageSize } from '@iiif/presentation-3';

/**
 * Fixed sizes from scales.
 *
 * Given a width and height of an image and a list of scales, this will return
 * an ordered list of widths and heights of the image at those scales.
 *
 * @param width
 * @param height
 * @param scales
 */
export function fixedSizesFromScales(width: number, height: number, scales: number[]): ImageSize[] {
  const len = scales.length;
  const sizes: ImageSize[] = [];
  for (let i = 0; i < len; i++) {
    const scale = scales[i];
    sizes.push({
      width: Math.floor(width / scale),
      height: Math.floor(height / scale),
    });
  }
  return sizes;
}
