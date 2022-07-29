import { ImageService, LinkingProperties } from '@iiif/presentation-3';
import { ExtraFeature } from './profiles/profiles';

export type Service = ImageService & {
  real?: false;
};

export type FixedSizeImage = {
  id: string;
  type: 'fixed';
  width: number;
  height: number;
  unsafe?: boolean;
};

export type FixedSizeImageService = {
  id: string;
  type: 'fixed-service';
  width: number;
  height: number;
};

export type VariableSizeImage = {
  id: string;
  type: 'variable';
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
};

export type UnknownSizeImage = {
  id: string;
  type: 'unknown';
};

export type ImageCandidate = FixedSizeImage | VariableSizeImage | UnknownSizeImage | FixedSizeImageService;

export type ImageCandidateRequest = {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  // Configurations
  fallback?: boolean;
  atAnyCost?: boolean;
  unsafeImageService?: boolean;
  returnAllOptions?: boolean;
  allowUnsafe?: boolean;
  preferFixedSize?: boolean;
  explain?: boolean;
};

/**
 * Size parameter
 *
 * Represents the {size} parameter of a IIIF image request.
 * see https://iiif.io/api/image/3.0/#42-size
 * Port of https://github.com/digirati-co-uk/iiif-net/blob/main/src/IIIF/IIIF/ImageApi/SizeParameter.cs
 */
export type SizeParameter = {
  height?: number;
  width?: number;
  max: boolean;
  serialiseAsFull?: boolean;
  upscaled: boolean;
  confined: boolean;
  percentScale?: number;
};

/**
 * Region parameter
 *
 * Represents the {region} parameter of a IIIF image request.
 * see https://iiif.io/api/image/3.0/#41-region
 * Port of https://github.com/digirati-co-uk/iiif-net/blob/main/src/IIIF/IIIF/ImageApi/RegionParameter.cs
 */
export type RegionParameter = {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  full?: boolean;
  square?: boolean;
  percent?: boolean;
};

/**
 * Rotation parameter
 *
 * Represents the {rotation} parameter of a IIIF image request.
 * see https://iiif.io/api/image/3.0/#43-rotation
 * Port of https://github.com/digirati-co-uk/iiif-net/blob/main/src/IIIF/IIIF/ImageApi/RotationParameter.cs
 */
export type RotationParameter = {
  mirror?: boolean;
  angle: number;
};

export type ImageServiceImageRequest =
  | {
      type: 'base';
      scheme: string;
      server: string;
      prefix: string;
      identifier: string;
    }
  | {
      type: 'info';
      scheme: string;
      server: string;
      prefix: string;
      identifier: string;
    }
  | {
      type: 'image';
      scheme: string;
      server: string;
      prefix: string;
      identifier: string;
      region: RegionParameter;
      size: SizeParameter;
      rotation: RotationParameter;
      quality: string;
      format: string;
      originalPath: string;
    };

// Unused for now.
type ImageService3 = {
  /**
   * The `@context` property **SHOULD** appear as the very first key-value pair of the JSON representation. Its value must
   * be either the URI `http://iiif.io/api/image/3/context.json` or a JSON array with the URI
   * `http://iiif.io/api/image/3/context.json` as the last item. The `@context` tells Linked Data processors how to
   * interpret the image information. If extensions are used then their context definitions **SHOULD** be included in
   * this top-level `@context` property.
   */
  '@context': 'http://iiif.io/api/image/3/context.json' | string[];

  /**
   * The base URI of the image as defined in [URI Syntax](https://iiif.io/api/image/3.0/#2-uri-syntax), including
   * scheme, server, prefix and identifier without a trailing slash.
   */
  id: string;

  /**
   * The type for the Image API. The value **MUST** be the string `ImageService3`.
   */
  type: 'ImageService3';

  /**
   * The URI `http://iiif.io/api/image` which can be used to determine that the document describes an image service
   * which is a version of the IIIF Image API.
   */
  protocol: 'http://iiif.io/api/image';

  /**
   *	A string indicating the highest [compliance level](https://iiif.io/api/image/3.0/#6-compliance-level-and-profile-document)
   *	which is fully supported by the service. The value **MUST** be one of `level0`, `level1`, or `level2`.
   */
  profile: 'level0' | 'level1' | 'level2';

  /**
   * The width in pixels of the full image, given as an integer.
   */
  width: number;

  /**
   * The height in pixels of the full image, given as an integer.
   */
  height: number;

  /**
   * The maximum width in pixels supported for this image. Clients **MUST NOT** expect requests with a width greater
   * than this value to be supported. `maxWidth` **MUST** be specified if `maxHeight` is specified.
   */
  maxWidth?: number;

  /**
   * The maximum height in pixels supported for this image. Clients **MUST NOT** expect requests with a height greater than
   * this value to be supported. If `maxWidth` is specified and `maxHeight` is not, then clients **SHOULD** infer that
   * `maxHeight = maxWidth`.
   */
  maxHeight?: number;

  /**
   * The maximum area in pixels supported for this image. Clients **MUST NOT** expect requests with a `width * height`
   * greater than this value to be supported.
   */
  maxArea?: number;

  /**
   * 	An array of JSON objects with the `height` and `width` properties. These sizes specify preferred values to be
   * 	provided in the `w,h` syntax of the size request parameter for scaled versions of the full image. In the case of
   * 	servers that do not support requests for arbitrary sizes, these may be the only sizes available. A request
   * 	constructed with the `w,h` syntax using these sizes **MUST** be supported by the server, even if arbitrary width
   * 	and height are not.
   */
  sizes?: Array<{
    /**
     * The type of the object. If present, the value must be the string `Size`.
     */
    type?: 'Size';

    /**
     * The width in pixels of the image to be requested, given as an integer.
     */
    height: number;

    /**
     * The height in pixels of the image to be requested, given as an integer.
     */
    width: number;
  }>;

  /**
   * An array of JSON objects describing the parameters to use to request regions of the image (tiles) that are
   * efficient for the server to deliver. Each description gives a width, optionally a height for non-square tiles,
   * and a set of scale factors at which tiles of those dimensions are available.
   */
  tiles?: Array<{
    /**
     * The type of the object. If present, the value **MUST** be the string `Tile`.
     */
    type?: 'Tile';

    /**
     * The set of resolution scaling factors for the image’s predefined tiles, expressed as positive integers by which
     * to divide the full size of the image. For example, a scale factor of 4 indicates that the service can
     * efficiently deliver images at 1/4 or 25% of the height and width of the full image. A particular scale factor
     * value **SHOULD** appear only once in the `tiles` array.
     */
    scaleFactors: number[];

    /**
     * The width in pixels of the predefined tiles to be requested, given as an integer.
     */
    width: number;

    /**
     * The height in pixels of the predefined tiles to be requested, given as an integer. If it is not specified in
     * the JSON, then it defaults to the same as `width`, resulting in square tiles.
     */
    height?: number;
  }>;

  /**
   * An array of strings that are the preferred format parameter values, arranged in order of preference. The format
   * parameter values listed must be among those specified in the referenced profile or listed in the extraFormats
   * property (see [Extra Functionality](https://iiif.io/api/image/3.0/#57-extra-functionality)).
   */
  preferredFormats?: string[];

  /**
   * A string that identifies a license or rights statement that applies to the content of this image. The value of
   * this property must be a string drawn from the set of [Creative Commons](https://creativecommons.org/licenses/)
   * license URIs, the [RightsStatements.org](http://rightsstatements.org/page/1.0/) rights statement URIs, or those
   * added via the [Registry of Known Extensions](https://iiif.io/api/registry/) mechanism. The inclusion of this
   * property is informative, and for example could be used to display an icon representing the rights assertions.
   */
  rights?: string;

  /**
   * An array of strings that can be used as the quality parameter, in addition to `default`.
   */
  extraQualities?: string[];

  /**
   * An array of strings that can be used as the format parameter, in addition to the ones specified in the
   * referenced profile.
   */
  extraFormats?: string[];

  /**
   * An array of strings identifying features supported by the service, in addition to the ones specified in the
   * referenced profile. These strings are defined either in this [table](https://iiif.io/api/image/3.0/#features-table)
   * or by [registering an extension](https://iiif.io/api/extension/).
   */
  extraFeatures?: ExtraFeature[];

  /**
   * A link to another resource that references this image service, for example a link to a Canvas or Manifest. The
   * value **MUST** be an array of JSON objects. Each item **MUST** have the `id` and `type` properties, and **SHOULD**
   * have the `label` property.
   */
  partOf?: LinkingProperties['partOf'];
  seeAlso?: LinkingProperties['seeAlso'];
  service?: Array<any>;
};
