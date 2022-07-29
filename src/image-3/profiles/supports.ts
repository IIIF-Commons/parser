import { extraFeatures, Profile } from './profiles';
import { Service } from '../types';
import { isImageService } from '../utilities/is-image-service';
import { combineProfiles } from './combine-profiles';

export function supports(
  service: Service,
  req: Partial<Profile> & { exactSize?: { width?: number; height?: number } }
) {
  if (!isImageService(service)) {
    return [false, 'Not a valid image service'] as const;
  }

  req.extraFeatures = req.extraFeatures ? req.extraFeatures : [];

  const combined = combineProfiles(service);

  if (req.exactSize) {
    let valid = false;
    // 1. Check sizes.
    if (service.sizes) {
      for (const size of service.sizes) {
        if (size.width && size.width === req.exactSize.width) {
          if (extraFeatures.indexOf('sizeByW') !== -1) {
            valid = true;
          } else if (size.height && size.height === req.exactSize.height) {
            valid = true;
          }
        }
        if (size.height && size.height === req.exactSize.height) {
          if (extraFeatures.indexOf('sizeByH') !== -1) {
            valid = true;
          } else if (size.width && size.width === req.exactSize.width) {
            valid = true;
          }
        }
      }
    }

    if (!valid) {
      req.maxWidth = Math.max(req.maxWidth || 0, req.exactSize.width || 0) || undefined;
      req.maxHeight = Math.max(req.maxHeight || 0, req.exactSize.height || 0) || undefined;
      req.maxArea =
        Math.max(
          req.maxArea || 0,
          (req.exactSize.width && req.exactSize.height ? req.exactSize.width * req.exactSize.height : req.maxArea) || 0
        ) || undefined;

      if (!req.exactSize.height && req.exactSize.width) {
        if (req.extraFeatures.indexOf('sizeByW') === -1) {
          req.extraFeatures.push('sizeByW');
        }
      } else if (!req.exactSize.width && req.exactSize.height) {
        if (req.extraFeatures.indexOf('sizeByH') === -1) {
          req.extraFeatures.push('sizeByH');
        }
      }
    }
  }

  if (req.maxArea && combined.maxArea && req.maxArea > combined.maxArea) {
    return [false, `Max area is ${combined.maxArea}`] as const;
  }

  if (req.maxWidth && combined.maxWidth && req.maxWidth > combined.maxWidth) {
    return [false, `Max width is ${combined.maxWidth}`] as const;
  }

  if (req.maxHeight && combined.maxHeight && req.maxHeight > combined.maxHeight) {
    return [false, `Max height is ${combined.maxHeight}`] as const;
  }

  if (req.extraFeatures) {
    const missingFeatures = [];
    for (const feature of req.extraFeatures) {
      if (combined.extraFeatures.indexOf(feature) === -1) {
        missingFeatures.push(feature);
      }
    }
    if (missingFeatures.length) {
      return [false, `Missing features: ${missingFeatures.join(', ')}`] as const;
    }
  }

  if (req.extraFormats) {
    const missingFormats = [];
    for (const feature of req.extraFormats) {
      if (combined.extraFormats.indexOf(feature) === -1) {
        missingFormats.push(feature);
      }
    }
    if (missingFormats.length) {
      return [false, `Missing formats: ${missingFormats.join(', ')}`] as const;
    }
  }

  if (req.extraQualities) {
    const missingQualities = [];
    for (const quality of req.extraQualities) {
      if (combined.extraQualities.indexOf(quality) === -1) {
        missingQualities.push(quality);
      }
    }
    if (missingQualities.length) {
      return [false, `Missing qualities: ${missingQualities.join(', ')}`] as const;
    }
  }

  return [true] as const;
}
