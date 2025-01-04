import { ImageService } from '@iiif/presentation-3';
import { level1Support, level2Support, onlyLevel0 } from '../profiles/profiles';

export function isImageServiceLevel(level: 0 | 1 | 2, imageService?: ImageService) {
  if (imageService && imageService.profile) {
    const profile = imageService.profile;
    if (profile) {
      const profileArray = Array.isArray(profile) ? profile : [profile];

      if (
        profileArray.includes(`level${level}`) ||
        profileArray.includes(`http://iiif.io/api/image/2/level${level}.json`) ||
        profileArray.includes(`http://iiif.io/api/image/1/level${level}.json`) ||
        profileArray.includes(`http://iiif.io/api/image/1/profiles/level${level}.json`)
      ) {
        return true;
      }

      if (level === 2) {
        for (let singleProfile of profileArray) {
          if (level2Support.includes(singleProfile as string)) {
            return true;
          }
        }
      }

      if (level === 1) {
        for (let singleProfile of profileArray) {
          if (level1Support.includes(singleProfile as string)) {
            return true;
          }
        }
      }

      if (level === 0) {
        for (let singleProfile of profileArray) {
          if (onlyLevel0.includes(singleProfile as string)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
