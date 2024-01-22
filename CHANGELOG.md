# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/iiif-commons/parser/compare/v1.0.10...main)

### Fixed

- Fixed incorrectly formatted label/value maps in Manifests (#33)
<!--

### Fixed

### Added

### Changed

### Removed

### Security

-->

### Added

- Support for `navPlace` and `textGranularity`
- Fragment selectors in SpecificResources, strings and `{id,type}` References are now normalised, reducing the need to parse IDs to grab the ID/Type
- Added expand target helper, used internally for normalization (possibly useful for content state).
- New sub-package `@iiif/parser/strict` for fixing common mistakes in Presentation 3, with detailed feedback for implementors.
- New sub-package `@iiif/parser/image-3` for parsing IIIF Image API and some helpers
- Test coverage across every [IIIF Cookbook](https://iiif.io/api/cookbook) recipe, testing:
  - Parsing / Traversing the IIIF
  - Normalizing the IIIF correctly
  - Re-serializing the IIIF back to identical JSON
- New traversal option for `SpecificResource`
- New traversal option for `GeoJson` (e.g. from the `navPlace` extension)
- New storing of `Services` when normalizing [^4]
- Added second parameter to Presentation 3 Traversal to access parent of current resource
- Added JSON-LD framing to serialization
- New helpers for resolving framed resources
- Added `iiif-parser:hasPart` to normalization of some resources containing JSON-LD frame for resources within a particular context (i.e. through partOf)
- Serialize config now has additional contextual information (parent resource, full resource if framed)
- New `frameResource` helper

### Fixed

- `[presentation-2]` `startCanvas` property on Sequences are now added to the Manifest when converting
- Fixed handling Specific resources where the `source` is only string (inferring the correct type from the context)
- Serializing Presentation 2 resources without items
- Bug where AV canvases would have height and width of `0` when serializing
- Bug where custom `@context` on Manifest was not retained during serialization
- Bug where Content Resources did not keep extra properties when serializing (e.g. `value` or `geometry`)
- Bug where serialization may sometimes include `UNSET` keyword.

### Removed

- `posterCanvas` - hangover from pre-3.0, this will be ignored
- `logo` on non-provider resources - hangover from pre-3.0, these will be ignored[^3]
- `motivation` field on non-Annotation resources (bug)
- `Traverse.traversePosterCanvas()` is removed (now `Traverse.traverseLinkedCanvases()`)

### Changed

- `range.items[]` is now normalised to either `Reference<'Range'>`[^1] or `SpecificResource<Reference<'Canvas'>>`[^2]
- `manifest.start` is now normalised to a `SpecificResource<Reference<'Canvas'>>`
- `annotation.target` is now normalized to `SpecificResource`
- `annotation.body` now will correctly handle `SpecificResource` type
- `ContentResource` now has a `iiif-parser:hasPart` when normalized
- `AnnotationPage` now has a `iiif-parser:hasPart` when normalized
- `Manifest` now has a `iiif-parser:hasPart` when normalized
- `Collection` now has a `iiif-parser:hasPart` when normalized

[^1]: A `Reference<T>` has the shape: `{ id: string, type: T }` and is usually narrowed to one or more types
[^2]: SpecificResource is defined by the W3C Annotation specification, but in short you can access the original reference by accessing `specificResource.source`
[^3]: These properties were added to the specification pre-3.0 and then later removed.
[^4]: This does not replace the inline services with references, instead it's a parallel store of normalized services. Editing tools will have to update both. This moves the problem of multiple services with different structures and fields to the user. The normalized structures will be specifically useful for loading Image services progressively in a store without affecting the serialisation of the IIIF.
