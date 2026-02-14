import { Prettify } from '../utility';

/**
 * Nav place
 *
 * See: https://iiif.io/api/extension/navplace/
 */
export interface NavPlaceExtension {
  /**
   * Nav place
   *
   * The navPlace property identifies a single or multiple geographic areas pertinent to a resource using a GeoJSON
   * Feature Collection containing one or more Features. These areas should be bounded discrete areas of the map akin
   * to extents. These areas do not imply any level of accuracy, temporality, or state of existence.
   *
   * See: https://iiif.io/api/extension/navplace/
   */
  navPlace?: Prettify<import('geojson').GeoJSON>;
}
