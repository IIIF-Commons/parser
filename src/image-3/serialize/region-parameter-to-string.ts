import { RegionParameter } from '../types';

export function regionParameterToString({ x = 0, y = 0, w, h, full, square, percent }: RegionParameter) {
  if (full) {
    return 'full';
  }

  if (square) {
    return 'square';
  }

  if (typeof w === 'undefined' || typeof h === 'undefined') {
    throw new Error('RegionParameter: invalid region');
  }

  const xywh = `${x},${y},${w},${h}`;
  if (percent) {
    return `pct:${xywh}`;
  }

  return xywh;
}
