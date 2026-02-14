/// <reference types="geojson" />

import { ContentResource } from '../resources/contentResource';
import { Service } from '../resources/service';

export type ImageServiceProfile =
  | 'http://library.stanford.edu/iiif/image-api/compliance.html#level0'
  | 'http://library.stanford.edu/iiif/image-api/compliance.html#level1'
  | 'http://library.stanford.edu/iiif/image-api/compliance.html#level2'
  | 'http://library.stanford.edu/iiif/image-api/conformance.html#level0'
  | 'http://library.stanford.edu/iiif/image-api/conformance.html#level1'
  | 'http://library.stanford.edu/iiif/image-api/conformance.html#level2'
  | 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0'
  | 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level1'
  | 'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level2'
  | 'http://library.stanford.edu/iiif/image-api/1.1/conformance.html#level0'
  | 'http://library.stanford.edu/iiif/image-api/1.1/conformance.html#level1'
  | 'http://library.stanford.edu/iiif/image-api/1.1/conformance.html#level2'
  | 'http://iiif.io/api/image/1/level0.json'
  | 'http://iiif.io/api/image/1/profiles/level0.json'
  | 'http://iiif.io/api/image/1/level1.json'
  | 'http://iiif.io/api/image/1/profiles/level1.json'
  | 'http://iiif.io/api/image/1/level2.json'
  | 'http://iiif.io/api/image/1/profiles/level2.json'
  | 'http://iiif.io/api/image/2/level0.json'
  | 'http://iiif.io/api/image/2/profiles/level0.json'
  | 'http://iiif.io/api/image/2/level1.json'
  | 'http://iiif.io/api/image/2/profiles/level1.json'
  | 'http://iiif.io/api/image/2/level2.json'
  | 'http://iiif.io/api/image/2/profiles/level2.json'
  | 'http://iiif.io/api/image/3/level0.json'
  | 'http://iiif.io/api/image/3/level1.json'
  | 'http://iiif.io/api/image/3/level2.json'
  | 'level0'
  | 'level1'
  | 'level2';

/**
 * The base URI of the service will redirect to the image information document.
 */
type BaseUriRedirect = 'baseUriRedirect';
/**
 * The canonical image URI HTTP link header is provided on image responses.
 */
type CanonicalLinkHeader = 'canonicalLinkHeader';
/**
 * The CORS HTTP headers are provided on all responses.
 */
type Cors = 'cors';
/**
 * The JSON-LD media type is provided when requested.
 */
type JsonldMediaType = 'jsonldMediaType';
/**
 * The image may be rotated around the vertical axis, resulting in a left-to-right mirroring of the content.
 */
type Mirroring = 'mirroring';
/**
 * The profile HTTP link header is provided on image responses.
 */
type ProfileLinkHeader = 'profileLinkHeader';
/**
 * Regions of the full image may be requested by percentage.
 */
type RegionByPct = 'regionByPct';
/**
 * Regions of the full image may be requested by pixel dimensions.
 */
type RegionByPx = 'regionByPx';
/**
 * A square region may be requested, where the width and height are equal to the shorter dimension of the full image.
 */
type RegionSquare = 'regionSquare';
/**
 * Image rotation may be requested using values other than multiples of 90 degrees.
 */
type RotationArbitrary = 'rotationArbitrary';
/**
 * Image rotation may be requested in multiples of 90 degrees.
 */
type RotationBy90s = 'rotationBy90s';
/**
 * Image size may be requested in the form !w,h.
 */
type SizeByConfinedWh = 'sizeByConfinedWh';
/**
 * Image size may be requested in the form ,h.
 */
type SizeByH = 'sizeByH';
/**
 * Images size may be requested in the form pct:n.
 */
type SizeByPct = 'sizeByPct';
/**
 * Image size may be requested in the form w,.
 */
type SizeByW = 'sizeByW';
/**
 * Image size may be requested in the form w,h.
 */
type SizeByWh = 'sizeByWh';
/**
 * Image sizes prefixed with ^ may be requested.
 */
type SizeUpscaling = 'sizeUpscaling';

export type Image3ExtraFeatures =
  | BaseUriRedirect
  | CanonicalLinkHeader
  | Cors
  | JsonldMediaType
  | Mirroring
  | ProfileLinkHeader
  | RegionByPct
  | RegionByPx
  | RegionSquare
  | RotationArbitrary
  | RotationBy90s
  | SizeByConfinedWh
  | SizeByH
  | SizeByPct
  | SizeByW
  | SizeByWh
  | SizeUpscaling;

/**
 * The JSON objects in the sizes array have the properties in the following table. Image requests for these sizes
 * should have a region parameter of full, size parameter in the canonical w,h form, and rotation of 0. Thus, the full
 * URL for an image with default quality in jpg format would be:
 *   {scheme}://{server}/{prefix}/{identifier}/full/{width},{height}/0/default.jpg
 */
export type ImageSize = {
  /**
   * The type of the object. If present, the value must be the string Size.
   */
  type?: 'Size';
  /**
   * The width in pixels of the image to be requested, given as an integer.
   */
  width: number;
  /**
   * The height in pixels of the image to be requested, given as an integer.
   */
  height: number;
};

/**
 * An array of JSON objects describing the parameters to use to request regions of the image (tiles) that are efficient
 * for the server to deliver. Each description gives a width, optionally a height for non-square tiles, and a set of
 * scale factors at which tiles of those dimensions are available.
 */
export type ImageTile = {
  /**
   * The type of the object. If present, the value must be the string Tile.
   */
  type?: 'Tile';
  /**
   * The set of resolution scaling factors for the image’s predefined tiles, expressed as positive integers by which to
   * divide the full size of the image. For example, a scale factor of 4 indicates that the service can efficiently
   * deliver images at 1/4 or 25% of the height and width of the full image. A particular scale factor value should
   * appear only once in the tiles array.
   */
  scaleFactors: number[];
  /**
   * The width in pixels of the predefined tiles to be requested, given as an integer.
   */
  width: number;
  /**
   * The height in pixels of the predefined tiles to be requested, given as an integer. If it is not specified in the
   * JSON, then it defaults to the same as width, resulting in square tiles.
   */
  height?: number;
  /**
   * Optional and non-standard property. The maximum width of the image.
   */
  maxWidth?: number;

  /**
   * Optional and non-standard property. The maximum height of the image.
   */
  maxHeight?: number;
};

export type ImageProfile =
  | ImageServiceProfile
  | {
      '@context'?: string;
      '@type'?: 'iiif:ImageProfile';
      type?: 'ImageProfile';
      formats?: string[];
      qualities?: string[];
      supports?: string[];
      maxArea?: number;
      maxHeight?: number;
      maxWidth?: number;
    };

export interface ImageService2 {
  '@context'?: string | string[];
  '@id': string;
  '@type': 'ImageService2';
  profile: ImageProfile | ImageProfile[];
  protocol?: string;
  width?: number | null;
  height?: number | null;
  attribution?: string;
  sizes?: ImageSize[];
  tiles?: ImageTile[];
  logo?: ContentResource | ContentResource[]; // Presentation 2 service may have non-array.
  service?: Service[];
}

export interface ImageService3 {
  /**
   * The @context property should appear as the very first key-value pair of the JSON representation. Its value must be
   * either the URI http://iiif.io/api/image/3/context.json or a JSON array with the URI
   * http://iiif.io/api/image/3/context.json as the last item. The @context tells Linked Data processors how to
   * interpret the image information. If extensions are used then their context definitions should be included in
   * this top-level @context property.
   */
  '@context'?: string | string[];

  /**
   * The base URI of the image as defined in URI Syntax, including scheme, server, prefix and identifier without a
   * trailing slash.
   */
  id: string;

  /**
   * The type for the Image API. The value must be the string ImageService3.
   */
  type: 'ImageService3';

  /**
   * A string indicating the highest compliance level which is fully supported by the service. The value must be one of
   * level0, level1, or level2.
   */
  profile: 'level0' | 'level1' | 'level2';

  /**
   * The URI http://iiif.io/api/image which can be used to determine that the document describes an image service which
   * is a version of the IIIF Image API.
   */
  protocol?: string;

  /**
   * The width in pixels of the full image, given as an integer.
   */
  width?: number | null;

  /**
   * The height in pixels of the full image, given as an integer.
   */
  height?: number | null;

  /**
   * The maximum width in pixels supported for this image. Clients must not expect requests with a width greater than
   * this value to be supported. maxWidth must be specified if maxHeight is specified.
   */
  maxWidth?: number | null;

  /**
   * The maximum height in pixels supported for this image. Clients must not expect requests with a height greater than
   * this value to be supported. If maxWidth is specified and maxHeight is not, then clients should infer that
   * maxHeight = maxWidth.
   */
  maxHeight?: number | null;

  /**
   * The maximum area in pixels supported for this image. Clients must not expect requests with a width*height greater
   * than this value to be supported.
   */
  maxArea?: number | null;

  /**
   * Attribution.
   */
  attribution?: string;

  /**
   * A string that identifies a license or rights statement that applies to the content of this image. The value of this
   * property must be a string drawn from the set of Creative Commons license URIs, the RightsStatements.org rights
   * statement URIs, or those added via the Registry of Known Extensions mechanism. The inclusion of this property is
   * informative, and for example could be used to display an icon representing the rights assertions.
   */
  rights?: string;

  /**
   * An array of JSON objects with the height and width properties. These sizes specify preferred values to be provided
   * in the w,h syntax of the size request parameter for scaled versions of the full image. In the case of servers that
   * do not support requests for arbitrary sizes, these may be the only sizes available. A request constructed with the
   * w,h syntax using these sizes must be supported by the server, even if arbitrary width and height are not.
   */
  sizes?: ImageSize[];
  /**
   * An array of JSON objects describing the parameters to use to request regions of the image (tiles) that are efficient
   * for the server to deliver. Each description gives a width, optionally a height for non-square tiles, and a set of
   * scale factors at which tiles of those dimensions are available.
   */
  tiles?: ImageTile[];

  /**
   * Legacy.
   * @deprecated
   */
  logo?: ContentResource[]; // Presentation 2 service may have non-array.

  /**
   * An array of strings that are the preferred format parameter values, arranged in order of preference. The format
   * parameter values listed must be among those specified in the referenced profile or listed in the extraFormats
   * property
   */
  extraFormats?: string[];

  /**
   * An array of strings that can be used as the quality parameter, in addition to default.
   */
  extraQualities?: string[];

  /**
   * An array of strings identifying features supported by the service, in addition to the ones specified in the
   * referenced profile. These strings are defined either in the table below or by registering an extension.
   */
  extraFeatures?: Image3ExtraFeatures[];

  /**
   * Optional services
   */
  service?: Service[];
}

// General purpose image service definition.
export interface ImageService {
  /**
   * The @context property should appear as the very first key-value pair of the JSON representation. Its value must be
   * either the URI http://iiif.io/api/image/3/context.json or a JSON array with the URI
   * http://iiif.io/api/image/3/context.json as the last item. The @context tells Linked Data processors how to
   * interpret the image information. If extensions are used then their context definitions should be included in
   * this top-level @context property.
   */
  '@context'?: string | string[];
  '@id'?: string;
  id: string;
  type?: 'ImageService1' | 'ImageService2' | 'ImageService3';
  '@type'?: 'ImageService1' | 'ImageService2' | 'ImageService3';
  profile: ImageProfile | ImageProfile[];
  protocol?: string;
  width?: number | null;
  height?: number | null;
  maxWidth?: number | null;
  maxHeight?: number | null;
  maxArea?: number | null;
  attribution?: string;
  /**
   * An array of JSON objects with the height and width properties. These sizes specify preferred values to be provided
   * in the w,h syntax of the size request parameter for scaled versions of the full image. In the case of servers that
   * do not support requests for arbitrary sizes, these may be the only sizes available. A request constructed with the
   * w,h syntax using these sizes must be supported by the server, even if arbitrary width and height are not.
   */
  sizes?: ImageSize[];
  /**
   * An array of JSON objects describing the parameters to use to request regions of the image (tiles) that are efficient
   * for the server to deliver. Each description gives a width, optionally a height for non-square tiles, and a set of
   * scale factors at which tiles of those dimensions are available.
   */
  tiles?: ImageTile[];
  logo?: ContentResource[]; // Presentation 2 service may have non-array.
  extraFormats?: string[];
  extraQualities?: string[];
  extraFeatures?: string[];
  service?: Service[];
}
