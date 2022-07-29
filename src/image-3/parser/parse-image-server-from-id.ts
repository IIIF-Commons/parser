/**
 * Get image server from ID.
 *
 * Normalises image service URLs to extract identity of the image server.
 *
 * @param url
 */
export function parseImageServerFromId(url: string): string {
  // Strip off the protocol + www
  const id = url.replace(/(https?:\/\/)?(www.)?/i, '');

  // Strip off the path.
  if (id.indexOf('/') !== -1) {
    return id.split('/')[0];
  }

  // Return the id.
  return id;
}
