import { Service } from '../types';
import { isImageService } from '../utilities/is-image-service';
import { level1Support, Profile } from './profiles';

export function supportsCustomSizes(service: Service): boolean {
  if (!isImageService(service)) {
    return false;
  }

  const profiles = Array.isArray(service.profile) ? service.profile : [service.profile];

  for (const profile of profiles) {
    if (typeof profile === 'string') {
      if (level1Support.indexOf(profile) !== -1) {
        return true;
      }
    } else {
      const supports = [...(profile.supports || []), ...((profile as Profile).extraFeatures || [])];
      if (
        supports.indexOf('regionByPx') !== -1 &&
        (supports.indexOf('sizeByW') !== -1 || supports.indexOf('sizeByWh') !== -1)
      ) {
        return true;
      }
    }
  }

  return false;
}
