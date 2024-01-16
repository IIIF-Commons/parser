import { RotationParameter } from '../types';

export function parseRotationParameter(pathPart: string): RotationParameter {
  const rotation: RotationParameter = { angle: 0 };
  if (pathPart[0] === '!') {
    rotation.mirror = true;
    pathPart = pathPart.substr(1);
  }

  rotation.angle = parseFloat(pathPart) % 360;
  if (Number.isNaN(rotation.angle)) {
    throw new Error(`Invalid rotation ${pathPart}`);
  }
  return rotation;
}
