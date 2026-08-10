import { imageServiceProfiles } from "../profiles/profiles";
import type { ImageService } from "../../presentation-3/types";
import { getId } from "./get-id";

export function isImageService(service: any): service is ImageService {
  if (!service || !service.profile) {
    return false;
  }

  if (!getId(service)) {
    return false;
  }

  const profiles = Array.isArray(service.profile) ? service.profile : [service.profile];

  for (const profile of profiles) {
    if (typeof profile === "string" && imageServiceProfiles.indexOf(profile) !== -1) {
      return true;
    }
  }

  return false;
}
