# IIIF Presentation 4 runtime boundary

This directory implements the native IIIF Presentation 4 Release Candidate
pipeline. It normalizes authored resources into the parser's entity store and
serializes them back to Presentation 4 JSON.

```ts
import { normalize, serialize, serializeConfigPresentation4 } from "@iiif/parser/presentation-4";

const normalized = normalize(input);
const output = serialize(
  {
    entities: normalized.entities,
    mapping: normalized.mapping,
    requests: {},
  },
  normalized.resource,
  serializeConfigPresentation4
);
```

## Supported

- Presentation 2, 3, and 4 input is accepted by the native normalizer.
- `Collection`, `CollectionPage`, `Manifest`, `Range`, `Timeline`, `Canvas`,
  `Scene`, Annotation resources, and the shared content-resource model are
  normalized and serialized.
- Presentation 4 property cardinality, reference shapes, and required or
  prohibited class properties can be checked with
  `validateAuthoredPresentation4`.
- Ordered arrays such as `transform` and `action` retain authored order.
- Typed Annotation references in `target` and `SpecificResource.source` remain
  references rather than being validated as embedded Annotations.
- Authored extension properties on concrete content resources are preserved
  recursively when the resource is normalized and serialized.

## Scene vertical slices

The current Scene support is deliberately a data-preservation boundary:

- a `Scene` can be used as a Manifest container and Annotation target;
- painting Annotations can carry `Model` and camera content resources;
- camera scalar properties, selectors, transforms, actions, and opaque nested
  extension data survive the native Presentation 4 round trip;
- the concrete authored type is retained while these resources share the
  normalized `ContentResource` store.

The official
`uc08_3d_comments_with_cameras.json` fixture pins this contract. It covers a
painted Model, `PerspectiveCamera`, ordered transforms, point selectors, and
an `activating` Annotation whose target and body source are Annotation
references.

This is not a 3D runtime. The parser does not:

- load or render models;
- apply transforms or perform matrix, coordinate, or unit conversions;
- build a scene graph or compose nested 3D resources;
- choose cameras or manage lights and spatial audio;
- execute `action` values or implement a content-state state machine;
- provide collision detection, spatial queries, animation playback, or glTF
  processing;
- normalize nested 3D components into dedicated entity tables.

Add dedicated behaviour only when an application use case needs it. Until
then, unfamiliar 3D and extension properties remain authored data.

## Presentation 3 compatibility

The package root remains the Presentation 3-first compatibility API. Through
that API, Presentation 4 `Timeline` resources are projected to Presentation 3
Canvases so existing applications can consume Presentation 2, 3, and
non-Scene Presentation 4 input without changing their model.

`Scene` resources and Scene references cannot be represented faithfully in
Presentation 3. The compatibility upgrader rejects them with
`Presentation4CompatibilityError`; it does not silently discard or rewrite
them. Native Presentation 4 consumers should import the
`@iiif/parser/presentation-4` entry point.

The Presentation 4-to-3 serializer also rejects Scene containers, 3D content
types, unsupported selectors, transforms, and actions instead of attempting a
lossy downgrade.

## Validation fixtures

Presentation 4 fixtures live under `__tests__/presentation-4/fixtures`.
Gold fixtures are library-authored examples. Official fixtures are copied
from a pinned IIIF API repository commit, with provenance and SHA-256 values
recorded in `fixtures/official/README.md`.

Tests for the bounded Scene support live under
`__tests__/presentation-4/3d`. They validate the official input strictly and
assert preservation through normalization and serialization; they are not a
claim that the excluded 3D runtime features are implemented.
