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
