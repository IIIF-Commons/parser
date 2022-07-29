export const STANFORD_IIIF_IMAGE_COMPLIANCE_0 = 'http://library.stanford.edu/iiif/image-api/compliance.html#level0';
export const STANFORD_IIIF_IMAGE_COMPLIANCE_1 = 'http://library.stanford.edu/iiif/image-api/compliance.html#level1';
export const STANFORD_IIIF_IMAGE_COMPLIANCE_2 = 'http://library.stanford.edu/iiif/image-api/compliance.html#level2';
export const STANFORD_IIIF_IMAGE_CONFORMANCE_0 = 'http://library.stanford.edu/iiif/image-api/conformance.html#level0';
export const STANFORD_IIIF_IMAGE_CONFORMANCE_1 = 'http://library.stanford.edu/iiif/image-api/conformance.html#level1';
export const STANFORD_IIIF_IMAGE_CONFORMANCE_2 = 'http://library.stanford.edu/iiif/image-api/conformance.html#level2';
export const STANFORD_IIIF_1_IMAGE_COMPLIANCE_0 =
  'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level0';
export const STANFORD_IIIF_1_IMAGE_COMPLIANCE_1 =
  'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level1';
export const STANFORD_IIIF_1_IMAGE_COMPLIANCE_2 =
  'http://library.stanford.edu/iiif/image-api/1.1/compliance.html#level2';
export const STANFORD_IIIF_1_IMAGE_CONFORMANCE_0 =
  'http://library.stanford.edu/iiif/image-api/1.1/conformance.html#level0';
export const STANFORD_IIIF_1_IMAGE_CONFORMANCE_1 =
  'http://library.stanford.edu/iiif/image-api/1.1/conformance.html#level1';
export const STANFORD_IIIF_1_IMAGE_CONFORMANCE_2 =
  'http://library.stanford.edu/iiif/image-api/1.1/conformance.html#level2';
export const IIIF_1_IMAGE_LEVEL_0 = 'http://iiif.io/api/image/1/level0.json';
export const IIIF_1_IMAGE_LEVEL_0_PROFILE = 'http://iiif.io/api/image/1/profiles/level0.json';
export const IIIF_1_IMAGE_LEVEL_1 = 'http://iiif.io/api/image/1/level1.json';
export const IIIF_1_IMAGE_LEVEL_1_PROFILE = 'http://iiif.io/api/image/1/profiles/level1.json';
export const IIIF_1_IMAGE_LEVEL_2 = 'http://iiif.io/api/image/1/level2.json';
export const IIIF_1_IMAGE_LEVEL_2_PROFILE = 'http://iiif.io/api/image/1/profiles/level2.json';
export const IIIF_2_IMAGE_LEVEL_0 = 'http://iiif.io/api/image/2/level0.json';
export const IIIF_2_IMAGE_LEVEL_0_PROFILE = 'http://iiif.io/api/image/2/profiles/level0.json';
export const IIIF_2_IMAGE_LEVEL_1 = 'http://iiif.io/api/image/2/level1.json';
export const IIIF_2_IMAGE_LEVEL_1_PROFILE = 'http://iiif.io/api/image/2/profiles/level1.json';
export const IIIF_2_IMAGE_LEVEL_2 = 'http://iiif.io/api/image/2/level2.json';
export const IIIF_2_IMAGE_LEVEL_2_PROFILE = 'http://iiif.io/api/image/2/profiles/level2.json';
export const IIIF_3_IMAGE_LEVEL_0 = 'level0';
export const IIIF_3_IMAGE_LEVEL_1 = 'level1';
export const IIIF_3_IMAGE_LEVEL_2 = 'level2';

// Non-standard
export const IIIF_2_IMAGE_LEVEL_0_NO_JSON = 'http://iiif.io/api/image/2/level0';
export const IIIF_2_IMAGE_LEVEL_1_NO_JSON = 'http://iiif.io/api/image/2/level1';
export const IIIF_2_IMAGE_LEVEL_2_NO_JSON = 'http://iiif.io/api/image/2/level2';

export const level2Support = [
  IIIF_2_IMAGE_LEVEL_2_NO_JSON,
  STANFORD_IIIF_IMAGE_COMPLIANCE_2,
  STANFORD_IIIF_IMAGE_CONFORMANCE_2,
  STANFORD_IIIF_1_IMAGE_COMPLIANCE_2,
  STANFORD_IIIF_1_IMAGE_CONFORMANCE_2,
  IIIF_1_IMAGE_LEVEL_2,
  IIIF_1_IMAGE_LEVEL_2_PROFILE,
  IIIF_2_IMAGE_LEVEL_2,
  IIIF_2_IMAGE_LEVEL_2_PROFILE,
  IIIF_3_IMAGE_LEVEL_2,
];

export const level1Support = [
  ...level2Support,
  IIIF_2_IMAGE_LEVEL_1_NO_JSON,
  STANFORD_IIIF_IMAGE_COMPLIANCE_1,
  STANFORD_IIIF_IMAGE_CONFORMANCE_1,
  STANFORD_IIIF_1_IMAGE_COMPLIANCE_1,
  STANFORD_IIIF_1_IMAGE_CONFORMANCE_1,
  IIIF_1_IMAGE_LEVEL_1,
  IIIF_1_IMAGE_LEVEL_1_PROFILE,
  IIIF_2_IMAGE_LEVEL_1,
  IIIF_2_IMAGE_LEVEL_1_PROFILE,
  IIIF_3_IMAGE_LEVEL_1,
];

export const imageServiceProfiles = [
  IIIF_2_IMAGE_LEVEL_0_NO_JSON,
  IIIF_2_IMAGE_LEVEL_1_NO_JSON,
  IIIF_2_IMAGE_LEVEL_2_NO_JSON,
  STANFORD_IIIF_IMAGE_COMPLIANCE_0,
  STANFORD_IIIF_IMAGE_COMPLIANCE_1,
  STANFORD_IIIF_IMAGE_COMPLIANCE_2,
  STANFORD_IIIF_IMAGE_CONFORMANCE_0,
  STANFORD_IIIF_IMAGE_CONFORMANCE_1,
  STANFORD_IIIF_IMAGE_CONFORMANCE_2,
  STANFORD_IIIF_1_IMAGE_COMPLIANCE_0,
  STANFORD_IIIF_1_IMAGE_COMPLIANCE_1,
  STANFORD_IIIF_1_IMAGE_COMPLIANCE_2,
  STANFORD_IIIF_1_IMAGE_CONFORMANCE_0,
  STANFORD_IIIF_1_IMAGE_CONFORMANCE_1,
  STANFORD_IIIF_1_IMAGE_CONFORMANCE_2,
  IIIF_1_IMAGE_LEVEL_0,
  IIIF_1_IMAGE_LEVEL_0_PROFILE,
  IIIF_1_IMAGE_LEVEL_1,
  IIIF_1_IMAGE_LEVEL_1_PROFILE,
  IIIF_1_IMAGE_LEVEL_2,
  IIIF_1_IMAGE_LEVEL_2_PROFILE,
  IIIF_2_IMAGE_LEVEL_0,
  IIIF_2_IMAGE_LEVEL_0_PROFILE,
  IIIF_2_IMAGE_LEVEL_1,
  IIIF_2_IMAGE_LEVEL_1_PROFILE,
  IIIF_2_IMAGE_LEVEL_2,
  IIIF_2_IMAGE_LEVEL_2_PROFILE,
  IIIF_3_IMAGE_LEVEL_0,
  IIIF_3_IMAGE_LEVEL_1,
  IIIF_3_IMAGE_LEVEL_2,
];

export const level0Support = imageServiceProfiles;

export const onlyLevel0 = [
  IIIF_2_IMAGE_LEVEL_0_NO_JSON,
  STANFORD_IIIF_IMAGE_COMPLIANCE_0,
  STANFORD_IIIF_IMAGE_CONFORMANCE_0,
  STANFORD_IIIF_1_IMAGE_COMPLIANCE_0,
  STANFORD_IIIF_1_IMAGE_CONFORMANCE_0,
  IIIF_1_IMAGE_LEVEL_0,
  IIIF_1_IMAGE_LEVEL_0_PROFILE,
  IIIF_2_IMAGE_LEVEL_0,
  IIIF_2_IMAGE_LEVEL_0_PROFILE,
  IIIF_3_IMAGE_LEVEL_0,
];

export type Profile = {
  extraFormats: string[];
  extraQualities: string[];
  extraFeatures: ExtraFeature[];
  maxArea?: number;
  maxHeight?: number;
  maxWidth?: number;
};

export const level0: Profile = {
  extraFormats: ['jpg'],
  extraQualities: ['default'],
  extraFeatures: ['sizeByWhListed'],
};

export const level1: Profile = {
  extraFormats: ['jpg'],
  extraQualities: ['default'],
  extraFeatures: [
    'baseUriRedirect',
    'cors',
    'jsonldMediaType',
    'regionByPx',
    'regionSquare',
    'sizeByWhListed',
    'sizeByH',
    'sizeByW',
    'sizeByWh',

    // 2.1
    // 'sizeByPct', <-- Used to be supported in 2.1
  ],
};

export const level2: Profile = {
  extraFormats: ['jpg', 'png'],
  extraQualities: ['default'],
  extraFeatures: [
    'baseUriRedirect',
    'cors',
    'jsonldMediaType',
    'regionByPct',
    'regionByPx',
    'regionSquare',
    'rotationBy90s',
    'sizeByWhListed',
    'sizeByConfinedWh',
    'sizeByH',
    'sizeByPct',
    'sizeByW',
    'sizeByWh',

    // 2.1
    // 'sizeByDistortedWh', <-- Used to be supported in 2.1
    // 'sizeByForcedWh', <-- Used to be supported in 2.1
  ],
};

export const extraFeatures = [
  //	The base URI of the service will redirect to the image information document.
  'baseUriRedirect',
  //	The canonical image URI HTTP link header is provided on image responses.
  'canonicalLinkHeader',
  //	The CORS HTTP headers are provided on all responses.
  'cors',
  //	The JSON-LD media type is provided when requested.
  'jsonldMediaType',
  //	The image may be rotated around the vertical axis, resulting in a left-to-right mirroring of the content.
  'mirroring',
  //	The profile HTTP link header is provided on image responses.
  'profileLinkHeader',
  //	Regions of the full image may be requested by percentage.
  'regionByPct',
  //	Regions of the full image may be requested by pixel dimensions.
  'regionByPx',
  //	A square region may be requested, where the width and height are equal to the shorter dimension of the full image.
  'regionSquare',
  //	Image rotation may be requested using values other than multiples of 90 degrees.
  'rotationArbitrary',
  //	Image rotation may be requested in multiples of 90 degrees.
  'rotationBy90s',
  //	Image size may be requested in the form !w,h.
  'sizeByConfinedWh',
  //	Image size may be requested in the form ,h.
  'sizeByH',
  //	Images size may be requested in the form pct:n.
  'sizeByPct',
  //	Image size may be requested in the form w,.
  'sizeByW',
  //	Image size may be requested in the form w,h.
  'sizeByWh',
  //	Image sizes prefixed with ^ may be requested.
  'sizeUpscaling',

  // 2.1.1 compat
  'sizeByWhListed',
  'sizeByDistortedWh',
  'sizeByForcedWh',
] as const;

export type ExtraFeature = typeof extraFeatures extends ReadonlyArray<infer ElementType> ? ElementType : never;
