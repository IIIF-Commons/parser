# IIIF Parser

```
npm i @iiif/parser
```

This is a parser and set of low-level utilities for the following IIIF Specifications:

- [IIIF Presentation 3](https://iiif.io/api/presentation/3.0/) (current)
- [IIIF Presentation 4](https://preview.iiif.io/api/prezi-4/presentation/4.0/) (preview support via `/presentation-4`)
- [IIIF Image 3](https://iiif.io/api/image/3.0/) (current)
- [IIIF Presentation 2](https://iiif.io/api/presentation/2.1/)

These include:

- [W3C Annotations](https://www.w3.org/TR/annotation-model/)
- [Open Annotations](https://iiif.io/api/annex/openannotation/)

> [!NOTE]
> Presentation API v4 support is available from `@iiif/parser/presentation-4` and is designed for mixed v2.1/v3.0/v4.0 ingestion with a v4 normalization pipeline.

### Features

The features of this library are focussed on encoding the structure of all types of IIIF and providing utilities for extracting data from the IIIF or converting it into another format that is easier to develop with. The aim of the parser is to maximize the IIIF compatibility of other tools built on top of it.

#### Type Modules and DX Helpers

Type surfaces are available directly from parser subpaths:

- `@iiif/parser/presentation-2/types`
- `@iiif/parser/presentation-3/types`
- `@iiif/parser/presentation-3-normalized/types`
- `@iiif/parser/presentation-4/types`
- `@iiif/parser/presentation-4-normalized/types`

The versioned parser entrypoints also re-export `infer`, `cast` and `narrow` helpers:

```ts
import { infer, cast, narrow, type Manifest } from "@iiif/parser/presentation-3";

const manifest = {
  id: "https://example.org/manifest",
  type: "Manifest",
  label: { en: ["Example"] },
  items: [],
} satisfies Manifest;

const typed = infer.Manifest(manifest);
const checked = cast.Manifest(manifest);

if (narrow.isImage({ id: "https://example.org/image.jpg", type: "Image" })) {
  // narrowed image resource
}
```

#### IIIF Presentation 3

- **Empty types** for each resource (e.g. Manifest, Canvas) which can be used as starting points for creating IIIF
- **Traverse** utility for walking through IIIF documents and running code at different "types"
- **Normalize** utility which will:
  - Add default empty defaults (null or empty array)
  - Organize by type into Records
  - Replace nested with references using ID/Type or SpecificResources
- **Serializers** which take normalized data and output it again
  - **Presentation v3 serializer**- outputs well-formed Presentation 3 JSON
  - **Presentation v2 serializer** - outputs good-enough Presentation 2 JSON (missing features).
- **Strict Upgrader** utility which can automatically fix Presentation 3 JSON that has issues.

```js
import { Traverse } from "@iiif/parser";

// Or for presentation 2 resources
// import { Traverse } from '@iiif/parser/presentation-2';

const ids = [];
const extractCanvasLabels = new Traverse({
  canvas: [
    (canvas) => {
      ids.push(canvas.id); // string
    },
  ],
});

extractCanvasLabels.traverseUnknown(loadSomeManifest());

console.log(ids); // all canvas ids.
```

#### IIIF Presentation 2

- **Traverse** utility for walking through IIIF v2 documents and running code at different "types"
- **Upgrader** utility built on-top of the Traverse utility for upgrading IIIF v2 to IIIF v3.

The intention for IIIF Presentation 2 is to upgrade it to 3 and then work with that. The tooling will always offer and upgrade to the latest version and tools on top of that.

```ts
import { Traverse, convertPresentation2 } from "@iiif/parser/presentation-2";

convertPresentation2(p2); // to latest IIIF version

const logAnnotations = new Traverse({
  // Every type is a key on this record, with an array of functions to call
  annotation: [
    (anno) => {
      console.log(anno["@id"]);

      // Optionally return to replace the resource.
    },
  ],
});

logAnnotations.traverseManifest(someInputManifest); // Logs all annotation IDs.

// Also an "all" traversal.
const logAllIds = Traverse.all((resource) => console.log(resource["@id"]));

logAllIds.traverseUnknown(someInput);
```

The available types to traverse (v3) are:

```ts
export type TraversalMap = {
  collection?: Array<Traversal<Collection>>;
  manifest?: Array<Traversal<Manifest>>;
  canvas?: Array<Traversal<Canvas>>;
  annotationCollection?: Array<Traversal<AnnotationCollection>>;
  annotationPage?: Array<Traversal<AnnotationPage>>;
  annotation?: Array<Traversal<Annotation>>;
  contentResource?: Array<Traversal<ContentResource>>;
  choice?: Array<Traversal<ChoiceTarget | ChoiceBody>>;
  range?: Array<Traversal<Range>>;
  service?: Array<Traversal<Service>>;
  agent?: Array<Traversal<ResourceProvider>>;
  specificResource?: Array<Traversal<SpecificResource>>;
  geoJson?: Array<Traversal<import("geojson").GeoJSON>>;
};
```

#### IIIF Presentation 4

- `upgradeToPresentation4()` to ingest v2.1, v3.0 or v4.0 into a v4-compatible shape
- `Traverse` with v4 container support (`Timeline`, `Canvas`, `Scene`)
- `normalize()` with deterministic ID minting for missing IDs
- `validatePresentation4()` with traversal-first diagnostics (`tolerant` or `strict`)
- `serializeConfigPresentation4` for native v4 output
- `serializeConfigPresentation3` for strict v4→v3 downgrade (fails on unsupported v4-only constructs)
- `pnpm run update-cookbook-v4` to refresh local `fixtures/cookbook-v4` from [preview cookbook v4](https://preview.iiif.io/cookbook/v4/)

```ts
import {
  upgradeToPresentation4,
  normalize,
  validatePresentation4,
  serialize,
  serializeConfigPresentation4,
} from "@iiif/parser/presentation-4";

const upgraded = upgradeToPresentation4(loadSomeManifest());
const report = validatePresentation4(upgraded);
const normalized = normalize(upgraded);
const serialized = serialize(
  { entities: normalized.entities, mapping: normalized.mapping, requests: {} },
  normalized.resource,
  serializeConfigPresentation4
);
```

#### Image 3

The Image 3 parser is adapted from an Image Server implementation, and supports:

- Parsing of IIIF Image API request URLs (including info.json)
  - Extracting region
  - Extracting rotation
  - Extracting size
  - Extracting quality
  - Extracting format
- Parsing of IIIF profiles, and feature detection
  - `isLevel0(service)`
  - `supports(service, { extraQualities: ['grey'] })` helper which accepts a service and partial service to compare
  - `imageServiceSupportsRequest()` helper that can validate IIIF image requests before you make them
- Serializing of IIIF Image requests
  - A custom structure for defining `region`, `size`, `quality` etc. and then creating a IIIF Image request URL.
  - Support for Image 2.1 servers
- Handful of utilities for IIIF Image 3
  - extracting fixes sized images from an image service
  - extracting fixed sizes from scale factors (full tiles)
  - `canonicalServiceUrl()`, `getId()`, `getType()` and `isImageService()` for compatibility and validation

```ts
import { parseImageServiceRequest, imageServiceRequestInfo } from "@iiif/parser/image-3";
import { ImageService } from "@iiif/parser/presentation-3/types";

const parsed = parseImageServiceRequest(
  "https://munch.emuseum.com/apis/iiif/image/v2/17261/full/max/0/default.jpg",
  // Optionally provide a path, so the identifier can be extracted
  "apis/iiif/image/v2"
);

// {
//   "format": "jpg",
//   "identifier": "17261",
//   "originalPath": "/17261/full/max/0/default.jpg",
//   "prefix": "apis/iiif/image/v2",
//   "quality": "default",
//   "region": {
//     "full": true,
//   },
//   "rotation": {
//     "angle": 0,
//   },
//   "scheme": "https",
//   "server": "munch.emuseum.com",
//   "size": {
//     "confined": false,
//     "max": true,
//     "serialiseAsFull": false,
//     "upscaled": false,
//   },
//   "type": "image",
// }

// Can be changed.
parsed.rotation.angle = 90;

const imageUrl = imageServiceRequestToString(parsed);
// https://munch.emuseum.com/apis/iiif/image/v2/17261/full/max/90/default.jpg

const infoJson = imageServiceRequestInfo(parsed);
// https://munch.emuseum.com/apis/iiif/image/v2/17261/info.json

const imageService: ImageService = await fetch(infoJson).then((r) => r.json());

// Likely true - as its supported by level0, level1 and level2
const supportsSizes = supports(imageService, {
  extraFeatures: ["sizeByWhListed"],
});
```

### Upgrader standalone

Upgrades IIIF JSON to the latest IIIF Presentation version (current: 3).

```ts
import { upgrade } from "@iiif/parser/upgrader";

upgrade(presentation2Manifest); // Presentation 3 Manifest or Collection
```
