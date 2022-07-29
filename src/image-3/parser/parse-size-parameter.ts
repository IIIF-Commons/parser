import { SizeParameter } from '../types';

export function parseSizeParameter(pathPart: string): SizeParameter {
  const size: SizeParameter = {
    upscaled: false,
    max: false,
    confined: false,
  };

  if (pathPart[0] === '^') {
    size.upscaled = true;
    pathPart = pathPart.slice(1);
  }

  if (pathPart === 'max' || pathPart === 'full') {
    size.max = true;
    size.serialiseAsFull = pathPart === 'full';
    return size;
  }

  if (pathPart[0] === '!') {
    size.confined = true;
    pathPart = pathPart.slice(1);
  }

  if (pathPart[0] === 'p') {
    size.percentScale = parseFloat(pathPart.slice(4));
    return size;
  }

  const wh = pathPart.split(',').map((t) => t.trim());
  if (wh.length) {
    if (wh[0] !== '') {
      size.width = parseInt(wh[0], 10);
    }

    if (wh[1] !== '') {
      size.height = parseInt(wh[1], 10);
    }
  }

  return size;
}
