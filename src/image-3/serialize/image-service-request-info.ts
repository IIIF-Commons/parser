import type { ImageService } from '../../presentation-3/types';
import { ImageServiceImageRequest } from "../types";
import { imageServiceRequestToString } from "./image-service-request-to-string";

export function imageServiceRequestInfo(req: ImageServiceImageRequest, service?: ImageService): string {
  return imageServiceRequestToString({ ...req, type: 'info' }, service);
}
