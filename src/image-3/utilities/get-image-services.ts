import { ImageService, Service } from '@iiif/presentation-3';
import { isImageService } from './is-image-service';

/**
 * Given a resource, will return only the image services on that resource.
 *
 * @param resource
 */
export function getImageServices(resource: { service: Array<Service> }): ImageService[] {
  const services = resource.service ? (Array.isArray(resource.service) ? resource.service : [resource.service]) : [];
  const totalServices = services.length;
  const imageServices = [];
  for (let i = 0; i < totalServices; i++) {
    if (isImageService((services as ImageService[])[i])) {
      imageServices.push(services[i]);
    }
  }
  return imageServices as any;
}
