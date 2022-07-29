import { levelToProfile } from './level-to-profile';
import { Profile } from './profiles';
import { ImageService } from '@iiif/presentation-3';

export function combineProfiles(service: ImageService): Profile {
  const profiles: any[] = service ? (Array.isArray(service.profile) ? service.profile : [service.profile]) : [];
  const final: Profile = {
    extraQualities: [],
    extraFormats: [],
    extraFeatures: [],
  };

  for (let profile of profiles) {
    if (typeof profile === 'string') {
      profile = levelToProfile(profile);
    }

    if (!profile) {
      continue;
    }

    // Merging Image 2.1.1
    if (profile.formats) {
      for (const format of profile.formats) {
        if (final.extraFormats.indexOf(format) === -1) {
          final.extraFormats.push(format);
        }
      }
    }
    if (profile.qualities) {
      for (const format of profile.qualities) {
        if (final.extraQualities.indexOf(format) === -1) {
          final.extraQualities.push(format);
        }
      }
    }
    if (profile.supports) {
      for (const feature of profile.supports) {
        if (final.extraFeatures.indexOf(feature as any) === -1) {
          final.extraFeatures.push(feature as any);
        }
      }
    }

    if (profile.maxHeight) {
      final.maxHeight = profile.maxHeight;
    }
    if (profile.maxWidth) {
      final.maxWidth = profile.maxWidth;
    }
    if (profile.maxArea) {
      final.maxArea = profile.maxArea;
    }

    // Merging Image 3.0
    if (profile.extraFormats) {
      for (const format of profile.extraFormats) {
        if (final.extraFormats.indexOf(format) === -1) {
          final.extraFormats.push(format);
        }
      }
    }
    if (profile.extraQualities) {
      for (const format of profile.extraQualities) {
        if (final.extraQualities.indexOf(format) === -1) {
          final.extraQualities.push(format);
        }
      }
    }
    if (profile.extraFeatures) {
      for (const feature of profile.extraFeatures) {
        if (final.extraFeatures.indexOf(feature as any) === -1) {
          final.extraFeatures.push(feature as any);
        }
      }
    }

    if (profile.maxHeight) {
      final.maxHeight = profile.maxHeight;
    }
    if (profile.maxWidth) {
      final.maxWidth = profile.maxWidth;
    }
    if (profile.maxArea) {
      final.maxArea = profile.maxArea;
    }
  }

  if (service.extraFormats) {
    for (const format of service.extraFormats) {
      if (final.extraFormats.indexOf(format) === -1) {
        final.extraFormats.push(format);
      }
    }
  }
  if (service.extraFeatures) {
    for (const feature of service.extraFeatures) {
      if (final.extraFeatures.indexOf(feature as any) === -1) {
        final.extraFeatures.push(feature as any);
      }
    }
  }
  if (service.extraQualities) {
    for (const quality of service.extraQualities) {
      if (final.extraQualities.indexOf(quality as any) === -1) {
        final.extraQualities.push(quality as any);
      }
    }
  }

  return final;
}
