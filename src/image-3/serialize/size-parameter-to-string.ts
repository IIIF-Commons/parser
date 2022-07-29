import { SizeParameter } from '../types';

export function sizeParameterToString({
  max,
  percentScale,
  upscaled,
  confined,
  width,
  height,
  serialiseAsFull,
}: SizeParameter): string {
  const sb: string[] = [];

  if (upscaled) {
    sb.push('^');
  }

  if (max) {
    sb.push(serialiseAsFull ? 'full' : 'max');
    return sb.join('');
  }

  if (confined) {
    sb.push('!');
  }

  if (percentScale) {
    sb.push(`pct:${percentScale}`);
  }

  if (width) {
    sb.push(`${width}`);
  }

  sb.push(',');

  if (height) {
    sb.push(`${height}`);
  }

  return sb.join('');
}
