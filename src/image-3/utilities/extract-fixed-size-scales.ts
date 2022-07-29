import { ImageSize } from '@iiif/presentation-3';

/**
 * Extract fixed size scales
 *
 * Given a source width and height and a list of sizes of that same image,
 * it will return an ordered list of scales.
 *
 * @param width
 * @param height
 * @param sizes
 */
export function extractFixedSizeScales(width: number, height: number, sizes: ImageSize[]): number[] {
  const len = sizes.length;
  const scales = [];
  for (let i = 0; i < len; i++) {
    const size = sizes[i];
    const w = size.width;
    scales.push(width / w);
  }
  return scales;
}
