import { ImageService } from "@iiif/presentation-3";
import { ImageServiceImageRequest } from "../types";
import { imageServiceRequestToString } from "./image-service-request-to-string";

export function imageServiceRequestInfo(req: ImageServiceImageRequest, service?: ImageService): string {
  return imageServiceRequestToString({ ...req, type: 'info' }, service);
}