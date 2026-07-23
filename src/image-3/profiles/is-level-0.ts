import type { ImageService } from '../../presentation-3/types';
import { onlyLevel0 } from './profiles';

export function isLevel0(service: ImageService) {
  const profile = Array.isArray(service.profile) ? service.profile : [service.profile];

  for (const single of profile) {
    if (typeof single === 'string' && onlyLevel0.indexOf(single) !== -1) {
      return true;
    }
  }

  return false;
}
