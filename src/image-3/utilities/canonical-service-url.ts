/**
 * Get canonical service url
 * Ensures an image service id contains the /info.json on the end of it.
 *
 * @param serviceId
 */
export function canonicalServiceUrl(serviceId: string) {
  return serviceId.endsWith('info.json')
    ? serviceId
    : serviceId.endsWith('/')
    ? `${serviceId}info.json`
    : `${serviceId}/info.json`;
}
