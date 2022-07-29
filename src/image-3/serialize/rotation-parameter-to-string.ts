import { RotationParameter } from '../types';

export function rotationParameterToString(rotationParameter: RotationParameter) {
  return `${rotationParameter.mirror ? '!' : ''}${(rotationParameter.angle || 0) % 360}`;
}
