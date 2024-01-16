import { level0, level1, level1Support, level2, level2Support, Profile } from './profiles';

export function levelToProfile(levelProfile: string): Profile {
  const isLevel2 = level2Support.indexOf(levelProfile) !== -1;
  if (isLevel2) {
    return level2;
  }
  const isLevel1 = level1Support.indexOf(levelProfile) !== -1;
  if (isLevel1) {
    return level1;
  }

  // The minimum.
  return level0;
}
