import { RegionParameter } from '../types';

export function parseRegionParameter(pathPart: string): RegionParameter {
  try {
    if (pathPart === 'full') {
      return { full: true };
    }
    if (pathPart === 'square') {
      return { square: true };
    }

    const percent = pathPart.startsWith('pct:');
    const stringParts = pathPart.substr(percent ? 4 : 0).split(',');
    const xywh = stringParts.map((part) => parseFloat(part));
    return {
      x: xywh[0],
      y: xywh[1],
      w: xywh[2],
      h: xywh[3],
      percent: percent,
    };
  } catch {
    throw new Error("Expected 'full', 'square' or 'x,y,w,h'. Found " + pathPart);
  }
}
