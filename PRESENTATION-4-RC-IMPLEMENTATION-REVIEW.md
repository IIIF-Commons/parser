# IIIF Presentation 4.0 RC implementation review

Date: 2026-07-22  
Branch reviewed: `feature/presentation-4.0` at `f422ee4`  
Baseline: `main`  
Status: implementation complete; coordinated publication is the remaining external action

## Completion pass — 2026-07-23

All implementation milestones in this review are complete:

- The Presentation 4 property model, validator, traversal, normalization, and
  serializers now share tested class/property policy, including Quantity
  objects, Container membership, serializer coverage, canonical property names,
  opaque services, and singular supplementary resources.
- The package root is the stable Presentation 3 compatibility contract for
  Presentation 2, 3, and supported non-3D Presentation 4. The native
  `/presentation-4` entry point is the fixed Presentation 4 contract.
- The Scene boundary is implemented as a preservation-oriented vertical slice.
  Known Model content, cameras, selectors, ordered transforms/actions, and
  unknown extension data round trip; unsupported rendering/runtime behavior is
  explicitly documented.
- The packed parser declarations are self-contained. Every exported subpath is
  checked from fresh ESM, CommonJS, NodeNext, and Bundler consumers with
  `skipLibCheck: false`.
- Parser `2.3.0` and Helpers `1.6.0` require Node 22 or newer. CI covers Node 22
  and 24, and release CI includes the packed declaration test.

The paired registry publication described in Phase 6 was deliberately not
performed by this implementation pass. It should be executed from the exact
green commits recorded by the two repositories' release handoff.

## Implementation pass — 2026-07-23

The first joint implementation pass is complete on this branch:

- `validateAuthoredPresentation4()` now validates authored v4 JSON without
  upgrade or repair, backed by self-contained gold fixtures under
  `__tests__/presentation-4/fixtures/gold`.
- The default Presentation 3 normalizer/upgrader accepts supported v4 input.
  Timeline projects to Canvas; Scene fails explicitly instead of producing a
  mixed or unresolved store.
- Collection Page is a first-class normalized entity with v4 traversal and
  serialization.
- Legacy multiple annotation bodies and targets upgrade to `Independents`;
  authored Choice, Composite, List, and Independents remain distinct.
- The v4 wire boundary strips internal identities/framing, retains concrete
  Specific Resource source types and values, and preserves array cardinality.
- The sibling Helpers repository is linked with pnpm and has fixed-schema
  Vault/Vault4 integration coverage.

This was a usable foundation, not the end of the review plan. The
release-confidence pass below closes the fixture, diagnostic, and package-gate
items. Broader property/model reconciliation and a deliberate decision on
unsupported nested 3D remain.

## Release-confidence pass — 2026-07-23

The second joint milestone is complete:

- Six unchanged, representative non-3D examples are pinned from IIIF/api commit
  `28a88829699ebbbe7722b4692cf3b7b67969bc6c`, with source, license, retrieval
  date, and SHA-256 hashes recorded under
  `__tests__/presentation-4/fixtures/official`.
- Strict authored validation accepts every pinned fixture without mutating it.
  Two excluded examples are documented findings rather than being repaired into
  the gold set: an upstream embedded Image Service context violation and a
  parser reference/full-resource distinction gap.
- `getPresentation3CompatibilityDiagnostics()` provides non-throwing preflight
  diagnostics for Scene resources. Existing `upgrade()` and `normalize()` calls
  retain their fail-safe behavior through `Presentation4CompatibilityError`,
  which carries stable codes, paths, resource types, and resource identities.
- The parser candidate now identifies itself as `2.3.0`, matching the Helpers
  `^2.3.0` peer contract used by the coordinated release.
- Helpers can build both repositories as tarballs, install them into a fresh
  strict-peer consumer, and prove the fixed v3 and native v4 Vault contracts,
  including structured Scene failure. A manually dispatched joint workflow
  accepts an exact parser ref and also runs the full linked source checks.

That next milestone is recorded below. The remaining parser work is broader
property reconciliation and the explicit nested 3D preservation/support policy.

## Model/runtime convergence pass — 2026-07-23

The third joint milestone is complete:

- Strict authored validation now distinguishes typed references from embedded
  resources consistently across class, raw-shape, and document validation.
  Reference-only Manifests no longer require embedded `items`, while a full
  embedded Manifest is still validated and `Manifest.items` still requires
  embedded Containers.
- Reference handling does not weaken embedded semantics: provider Agents still
  require `label`, and SpecificResource, TextualBody, and annotation aggregate
  bodies still require `source`, `value`, and `items` respectively.
- The pinned oracle now includes `uc03_issue1.json` and
  `uc07_image_composite.json`. At the pinned IIIF/api commit, every non-3D
  example now passes strict authored validation except `09_manifest.json`,
  whose embedded Image Service contexts violate the RC JSON-LD rule already
  documented by this review.
- Helpers now uses one Vault runtime for both fixed profiles. `Vault4` extends
  the shared typed runtime and contains only its v4 normalization,
  serialization, and CollectionPage surface.
- Painting, thumbnail fallback, and transcription now reuse
  `resolveAnnotationValues()` for Choice, Composite, List, Independents, and
  SpecificResource traversal.

The next milestone should make Collection and Annotation Collection page-chain
loading first-class in the shared Vault runtime, then remove the remaining
v4 `@ts-nocheck` suites against that stable API.

This review supersedes `P4-PRESENTATION-TYPE-AUDIT.md` as the planning baseline for the next implementation pass. The earlier document remains useful history, but it predates the current RC interpretation and, among other differences, recommends `List` for legacy multiple bodies/targets where this review requires `Independents`.

The companion `iiif-helpers/PRESENTATION-4-RC-JOINT-DELIVERY-REVIEW.md` reviews Vault and Helpers and turns both repositories into one release plan. The parser owns wire/version/normalization policy; the joint review owns Vault lifecycle, helper semantics, packaging, and cross-repository gates.

## Executive summary

The branch contains a useful start for Presentation 4: it has isolated v4 entry points, a v4 normalized store, deterministic identifiers, diagnostics, validation scaffolding, a v3-to-v4 upgrade path, and an initial v4-to-v3 serializer. The existing `ContentResource` abstraction is also being reused in the right general direction, and services are not being recursively normalized.

It is not ready to provide either of the intended product contracts.

1. The default, v3-first parser does not recognize Presentation 4. A v4 `Timeline` is currently traversed as a v3 `Canvas`, stored in the wrong entity table, and serialized as `"__$UNSET$__"`. The result also retains the v4 context, producing a v4-context/v3-shape hybrid.
2. The native v4 path can silently change semantics, discard data, and leak normalized-store implementation details into JSON. Multiple v3 bodies or targets are upgraded to `List` rather than `Independents`; `SpecificResource` serialization can emit `vault://` identifiers and `iiif-parser:hasPart`; `CollectionPage` is not represented by the runtime model.
3. The fixture and validation loop is not trustworthy yet. A script overwrites source fixtures with parser output, at least one 3D fixture has lost its annotation body, and strict validation reports 16 invalid documents out of 33. The main smoke test nevertheless passes because it only checks the top-level resource and that an issues array exists.
4. The branch is not based consistently on the RC. Generated requirements, documentation, and cookbook scripts still point to preview material. Types, validation, traversal, and serialization consequently describe different models.

The smallest safe implementation is two explicit adapters around the existing v3 core, not a second set of fixes in every consumer:

```text
                     ┌─ v4 → v3 compatibility projection ─ existing v3 normalize ─ v3 API
detect input version ┤
                     └─ v2 → v3 → v4 light upgrade ─────── v4 normalize ───────── v4 API
```

The first shippable milestone should be the v3-compatible path for v2, v3, and non-3D v4. The v4-native path should follow after the source corpus, model policy, and serialization boundary are corrected. Full 3D normalization is not required for that milestone, but unsupported 3D data must never be silently corrupted: it should remain opaque where practical and produce a structured diagnostic.

## Product contracts

### Contract A: v3-compatible, existing API

An application written against the existing Presentation 3 API should be able to pass a v2, v3, or non-3D v4 Collection or Manifest to the normal parser/upgrader/Vault path. It should receive the same canonical v3-facing model it receives today, without having to branch on the source version.

Required behavior:

- v2 continues through the existing v2-to-v3 conversion.
- v3 remains behaviorally and structurally stable.
- v4 `Canvas` remains a v3 `Canvas`.
- v4 `Timeline` becomes a duration-only v3 `Canvas`, and all references to it are rewritten consistently.
- `placeholderContainer` and `accompanyingContainer` project to their v3 property names where representable.
- v4 annotation arrays and aggregate objects project according to an explicit compatibility policy.
- v4 Collections with page references preserve those references. A synchronous parser must not pretend it can flatten pages that require network requests.
- `Scene` and other 3D-only constructs produce an unsupported-feature diagnostic. A mixed Manifest may omit unsupported Scenes under a documented lossy policy; a Scene-only Manifest must not be presented as a successful, useful v3 conversion.
- A serialized v3 result always uses the v3 context and contains no v4-only type declarations, internal identifiers, or sentinel values.

This is an API compatibility view. It need not force every new internal resource into the old public TypeScript union immediately. In particular, the existing `ContentResource` abstraction can safely grow to include Container references used as annotation bodies. If a construct cannot be represented as valid v3 wire JSON, that limitation must be explicit at the v3 serialization boundary.

### Contract B: v4-native, opt-in API

The v4 entry point should accept v2, v3, and v4 input and expose a Presentation 4 normalized model with light, deterministic repair.

Required behavior:

- v2 composes through the proven v2-to-v3 converter and then through one v3-to-v4 adapter.
- v3 duration-only Canvases become Timelines; spatial Canvases remain Canvases.
- v3 scalar motivation becomes a v4 array.
- v3 direct arrays of bodies or targets become `Independents`, because those values represent independently applied Web Annotation bodies or targets.
- string targets and sources are converted to typed object references using identity information where it is available.
- Presentation resources, annotation structures, selectors, aggregates, and known links normalize at known property positions.
- services, `navPlace` GeoJSON, unknown extensions, and arbitrary external payloads remain opaque.
- generated identifiers are deterministic and do not escape into wire JSON unless the specification requires an identifier there.
- serialization produces valid v4 JSON with no normalized-store fields and preserves all supported semantic data.

This repo does not contain the Vault implementation, so it can define and test the normalized-store contract but cannot prove the complete Vault/IIIF Helpers rollout in isolation. Cross-repository contract tests are required before calling the v4-native product complete.

## Specification baseline and policy

The implementation should be regenerated and reviewed against one pinned commit of the official [Presentation 4.0 examples](https://github.com/IIIF/api/tree/main/source/presentation/4.0/example), with the public [Presentation 4.0 specification](https://iiif.io/api/presentation/4.0/) and [data model](https://iiif.io/api/presentation/4.0/model/) recorded as the human-readable references. Pinning matters because the live material has continued to change during the RC period.

The following rules have direct implementation consequences:

- Multi-valued properties are always arrays, including a one-element value.
- `body` and `target` are each one JSON object in v4. Multiple values are expressed with `Choice`, `Composite`, `List`, or `Independents` rather than a direct array.
- A v4 `source` is an object with `id` and `type`; `selector` is an array.
- `Timeline` is a duration-only Container. A v3 duration-only Canvas is therefore the natural upgrade candidate, and a v4 Timeline projects back to a duration-only v3 Canvas.
- `CollectionPage` and Annotation Collection paging introduce references that a pure synchronous converter cannot dereference.
- `spatialScale` and `temporalScale` are `Quantity` objects containing `quantityValue` and `unit`, not numbers.
- `navPlace` is GeoJSON and service values retain compatibility with existing external API structures. Neither should be recursively interpreted as Presentation resources.

The RC text also contains contradictions. They should be isolated in a small validation/canonicalization policy instead of being encoded differently in generated types, validation, traversal, and serialization.

| Topic | Tolerant input policy | Canonical output policy |
| --- | --- | --- |
| `SpecificResource.id` | Accept omission; mint a deterministic internal identity if normalization needs one. | Omit an internally minted ID unless a final normative rule requires it. |
| String `source` example versus object requirement | Accept a string with a diagnostic or light repair. | Emit an object with `id` and `type`. |
| Annotation Collection `label` requirement | Accept omission while the RC conflict remains. | Preserve a supplied label; do not invent one. |
| Annotation Collection inline items versus “always paged” prose | Accept both inline `items` and page links. | Preserve the authored paging form unless an explicitly fetching layer resolves it. |
| Range members | Accept recognized Container references and nested Ranges under the broader class prose. | Emit the supported subset and report any deliberately omitted construct. |
| Annotation Page `items` requirement wording | Accept an empty/missing list under tolerant parsing. | Emit `items: []` if the chosen canonical profile requires the property. |

Every policy choice should have a linked upstream issue or specification citation, a validator severity, and a fixture. That makes it possible to change one policy when the final text settles.

## What should be kept

- The separate `@iiif/parser/presentation-4` direction protects current consumers from accidental public API changes.
- Reusing the normalized-store architecture gives Vault a familiar integration point.
- The broad `ContentResource` bucket is useful for Image, Audio, Video, Text, Dataset, Model, TextualBody, constrained resources, and Containers used as annotation bodies. It is preferable to creating many speculative stores.
- Services remain embedded instead of being over-normalized.
- Deterministic minted IDs and diagnostics provide a sound foundation for id-less embedded resources.
- The v2-to-v3-to-v4 composition avoids rewriting the mature v2 converter.
- Audio-only Timeline inference and placeholder/accompanying renames have been started.
- The v4-to-v3 serializer already makes some unsupported 3D decisions explicit rather than pretending every Scene is a Canvas.
- Fixture conversion scripts, a validator CLI, and the current test scaffolding can be reused once their acceptance assertions and source data are repaired.
- The existing package continues to build, lint, typecheck under its current configuration, and pass its established tests.

## Prioritized findings

### P0. The transparent v3 path does not exist

Evidence:

- `src/upgrader.ts` still exports only `convertPresentation2`.
- `src/index.ts` exports the Presentation 3 API and has no v4 input adapter.
- `src/presentation-3/traverse.ts` treats every Manifest `items` entry as a Canvas.
- Normalizing the v4 audio fixture stores its Timeline in `entities.Canvas` while the mapping records the type as `Timeline`. Serialization then cannot resolve it and emits `items: ["__$UNSET$__"]`.
- `src/presentation-3/serialize-presentation-3.ts` prefers the source entity's context, so this result retains the v4 context.
- v3 traversal does not visit the v4 `placeholderContainer` and `accompanyingContainer` property names.

Required change:

Add one version-detecting ingestion route and a focused v4-to-v3 compatibility projection before the existing v3 normalizer. Force the v3 context when serializing the v3 model. Do not teach every existing helper and consumer to recognize both versions independently.

Acceptance criteria:

- The same root `upgrade`/normalize call accepts v2, v3, and every supported non-3D v4 seed.
- No `__$UNSET$__`, v4 context, `Timeline`, `Scene`, `CollectionPage`, `vault://`, or `iiif-parser:*` value appears in v3 wire output.
- Timeline identities and all references agree after projection.
- Existing v2/v3 snapshots and public types remain stable except for deliberately documented widening.

### P0. Source fixtures and the validation gate are not trustworthy

Evidence:

- `scripts/reserialize-p4-fixtures.mjs` reads source fixtures, normalizes and serializes them, and overwrites those same files.
- `fixtures/presentation-4/14-rotated-model.json` previously contained a Model body and RotateTransform; the current fixture has a painting Annotation with no body.
- `pnpm run validate:p4:fixtures` currently reports 17 valid and 16 invalid documents out of 33 validated fixtures, with 141 warnings.
- `__tests__/presentation-4-parser/smoke.tests.ts` checks only that normalization returns a root, that `issues` is an array, and that top-level identity/context survives. It does not require `report.valid`, zero errors, or semantic round-trip preservation.
- `scripts/update-cookbook-v4.mjs`, the generated class-requirement source, documentation links, and README still refer to preview material.

Required change:

Restore pristine fixtures from a pinned official source. Treat them as immutable inputs. If generated round-trip files are useful, write them to a separate directory and compare them without overwriting the oracle. Remove any expectation that a parser's own output can establish its correctness.

Acceptance criteria:

- Every in-scope source fixture passes the chosen strict/policy-aware validator before it is used as a parser test.
- Fixture provenance includes repository URL, commit, original path, retrieval date, and any intentional local patch.
- Smoke tests fail on validation errors and on lost semantic fields.
- The source fixture tree remains unchanged after all test and regeneration commands.

### P0. Annotation aggregate conversion changes meaning

Evidence:

- `src/presentation-4/upgrade.ts` wraps multiple v3 bodies or targets as `List`.
- `src/presentation-4/traverse.ts` and `serialize-presentation-4.ts` repeat the same assumption.
- The serializer offers an `annotationBodyTargetMode: "array"` mode that can emit direct arrays, which are not valid v4 values for these properties.

`List` means all items are processed in order as one ordered group. Direct v3 multiple bodies or targets retain their independent Web Annotation meaning through `Independents`.

Required change:

Use `Independents` for legacy direct arrays. Preserve authored `Choice`, `Composite`, `List`, and `Independents` distinctly. Remove the invalid direct-array v4 serialization mode.

Acceptance criteria:

- Each aggregate class has an authored seed and a round-trip test.
- V3 multiple-body and multiple-target seeds upgrade specifically to `Independents`.
- V4 serialization always emits one object for `body` and one object for `target`.

### P0. `CollectionPage` is a declaration, not a runtime concept

Evidence:

- A `CollectionPage` declaration and validator rules exist.
- `src/presentation-4/utilities.ts`, normalization store selection, traversal, and serialization do not classify it as a first-class resource.
- A top-level page normalizes as `ContentResource` and loses `items`; a Collection's `first` page reference serializes with type `ContentResource`.

Required change:

Add first-class Collection Page traversal, normalized representation, mapping, and serialization for `partOf`, `items`, `next`, `prev`, and `startIndex`. Preserve page references in the pure parser. Fetching and merging pages belongs in Vault or another explicitly asynchronous resolver.

Acceptance criteria:

- Inline Collections, paged Collections, standalone pages, page chains, and cyclic/broken link diagnostics are covered.
- Parser round trips preserve page identities and links without fetching.
- Vault integration tests prove optional page loading and identity deduplication separately.

### P0. The v4 serialization boundary leaks internals and loses resource types

Evidence:

- A normalized `SpecificResource` can serialize with `language: []`, `iiif-parser:hasPart`, default empty arrays, null values, and internal `vault://` identities.
- Its `source` can be reduced to an abstract `ContentResource` reference, losing the original type such as `Image` or `Model`.
- Inline aggregate targets are not recursively cleaned.
- The one-element language serializer collapses an array to a scalar, violating v4 cardinality.
- The generic scene-component route drops fields such as camera `near`, `far`, `fieldOfView`, and `interactionMode`; embedded `position`/`lookAt` values can become unresolved sentinels.

Required change:

Make wire serialization a strict projection from normalized state. Resolve references through the store, emit only specification and preserved-extension keys, recursively serialize wrappers, retain actual source types, and strip all internal/default-only fields. For 3D components not yet modeled, choose opaque preservation or a clear unsupported diagnostic; never emit a successful lossy rewrite.

Acceptance criteria:

- A generic assertion rejects keys beginning `vault://`, `iiif-parser:`, and the unset sentinel anywhere in output.
- A `SpecificResource` with an Image, Model, Container, and TextualBody source preserves each source type.
- One-element multi-valued properties remain arrays.
- Every supported resource satisfies normalize → serialize → validate and semantic round-trip tests.
- Unsupported 3D seeds produce explicit diagnostics and retain their raw payload where the documented policy promises preservation.

### P0. There is no single RC model shared by types, validation, traversal, and serialization

Examples:

- Authored `Quantity` uses `value`; the validator expects `quantityValue`; normalized types define spatial and temporal scale as numbers.
- `ExcludeType` uses capitalized values while the specification terms are lowercase.
- Container `items` declarations permit direct nested Containers where Annotation Pages are required at that property.
- Generated class requirements omit current Container, Annotation, Specific Resource, and Textual Body properties.
- The serializer omits supported properties including `canonical`, `via`, `fileSize`, `interactionMode`, `provides`, and `scope`.
- Annotation Collection `total` is emitted only when greater than zero, losing valid zero.
- `supplementary` is handled as a list in one path even though the v4 property is singular.

Required change:

Create one checked-in, reviewed policy/model table generated from the pinned RC source plus documented overrides. Generate or test all four layers against it. Generated code should be reproducible; hand-authored semantic adapters remain small and reviewable.

Acceptance criteria:

- A property coverage test proves that every modeled property has declared cardinality, traversal behavior, normalized form, serialization behavior, and validator rule.
- Quantity, annotation cardinality, paging, and non-3D Container properties have explicit cross-layer fixtures.
- Type declarations pass with library checking enabled rather than depending on `skipLibCheck` to hide declaration errors.

### P0. Authored validation is mixed with upgrade and repair

Evidence:

- The validator normally calls `upgradeToPresentation4()` before applying most rules. It therefore cannot answer the simple question “is this authored v4 document valid as supplied?” independently of the parser's repair behavior.
- Valid Collection item references are reported as forbidden embedded Manifests because the rule does not reliably distinguish a reference from an embedded resource.
- Similar false missing-property reports occur for referenced Annotation Collections and Manifests reached through properties such as `supplementary` and `partOf`.
- Other broad reference paths and unknown classes are skipped, so the same implementation can both over-report and under-report errors.
- At audit time, running the validator over the 27 JSON examples linked from the official Presentation 4 page exposed these false positives.

Required change:

Expose two deliberate operations:

1. `validateAuthoredPresentation4(input, policy)`, which never mutates or upgrades and reports errors at the authored paths;
2. `upgradeToPresentation4(input)` followed by strict validation of the canonical result.

Reference classification should use class/property position and object completeness, not merely the presence of a Presentation type. Official examples should be a zero-error conformance gate after documented RC ambiguities are accounted for.

Acceptance criteria:

- Validator tests start from independently valid seeds and derive one-rule negative mutants.
- A valid reference is not subjected to the mandatory properties of an embedded resource.
- Repair diagnostics and validation diagnostics remain distinct and retain original paths.
- Validation never changes the caller's input.

### P1. The normalization boundary is too implicit

The intended boundary is sound but should be made an invariant.

Normalize:

- Collection, Manifest, Collection Page, and Annotation Collection/Page.
- Canvas, Timeline, Scene identity, and Range.
- Annotation, aggregate wrappers, Specific Resource, Textual Body, and recognized selectors.
- Known identity-bearing link arrays such as `thumbnail`, `rendering`, `homepage`, `seeAlso`, and `partOf`.

Keep opaque:

- `service` and `services` internals.
- `navPlace` GeoJSON.
- Unknown extension properties and scoped-context payloads.
- Arbitrary external resource metadata.
- Unsupported nested 3D component details in the v3-compatible path.

Unknown JSON must not be recursively interpreted merely because it contains an `id` and `type`. Tests should prove both recognized normalization and opaque preservation.

### P1. Downgrade loss is inconsistent

The v4-to-v3 serializer throws for some unsupported Scene constructs but silently drops other v4-only properties. It can also pass through values such as v4 `timeMode` without proving that the result is valid v3.

Adopt one path-aware loss policy:

- `error`: conversion cannot produce a meaningful v3 result.
- `warning + deterministic omission`: a mixed resource remains useful after a documented loss.
- `preserved extension/raw`: the v3 API can retain a value even though the v3 wire serializer cannot emit it as a core property.
- `exact projection`: the value is representable without semantic change.

Diagnostics should include input path, resource identity, feature, action, and severity. Tests should assert the diagnostic as part of the contract rather than treating warnings as incidental text.

### P1. Public API and documentation disagree

- The root README imports `validatePresentation4` from `@iiif/parser/presentation-4`, but that subpath does not export it.
- The internal v4 README refers to `upgradeFromV3` and a serialize signature that do not exist.
- User-facing material still calls Presentation 4 a preview and links preview URLs.

Choose and test the intended package subpaths from a packed/built artifact. Documentation examples should compile and run in CI.

### P1. Declaration health is hidden by `skipLibCheck`

The normal typecheck passes, but enabling library checking exposes missing imports, duplicate properties, circular declarations, and incomplete normalized 3D types. These are public API problems even when implementation files compile.

Add a declaration-only CI job with library checking enabled. Do not require a full, eagerly modeled 3D object graph for the first milestone; an accurate discriminated opaque representation is safer than an incomplete type that promises fields the serializer loses.

The fixture typecheck scripts also admit only a top-level Manifest, which leaves Collection, Collection Page, Annotation Page, and Annotation Collection declarations largely untested. The normalized fixture checker loads the built `dist` artifact and can accidentally check stale code, while converted-fixture checks are report-only and are not part of the main `test:types` gate. Run all supported root types from the current source/build candidate and make authoritative failures fatal.

### P2. The change set is too broad for a semantic review

Compared with `main`, the branch changes 376 files with roughly 246,000 insertions and 20,000 deletions. Presentation 4 work is mixed with large fixture/snapshot changes, vendored Presentation 2/3 types, Image API formatting, CLI work, and build changes.

Rebuild or split the work into independently reviewable changes:

1. pinned source corpus, model policy, and fixture safety;
2. transparent v4-to-v3 compatibility adapter;
3. v4 core declarations, normalization, and serialization;
4. validator and conformance matrix;
5. Vault/Helpers integration contract;
6. optional deeper 3D modeling driven by concrete use cases.

This is also the shortest route to confidence: one adapter and one policy per direction, with existing v3 behavior left in place, is smaller than widening every existing subsystem simultaneously.

## Recommended architecture

### Version routing

Detect the Presentation version from context and well-defined fallbacks once at ingestion. Return the detected version and diagnostics rather than scattering context tests through traversal.

```text
input
  │
  ├─ v2 ── existing convertPresentation2 ── v3 document
  │
  ├─ v3 ─────────────────────────────────── v3 document
  │
  └─ v4 ── projectPresentation4To3 ──────── v3 document  (default API)
                                             │
                                             └─ existing v3 normalization

v2/v3 document ── upgradePresentation3To4 ── v4 document  (opt-in API)
v4 document ───── light repair/policy ─────── v4 document
                                             │
                                             └─ v4 normalization
```

The public `upgrade` remains the compatibility route. The v4 subpath exposes clearly named v4 upgrade/normalize/serialize operations. Avoid ambiguous overloads that select wire versions from serializer flags.

### Identity and references

- Maintain one source identity index before type-changing conversions.
- Rewrite Timeline/Canvas type references by identity across Manifest items, Range items, Annotation sources/targets, `start`, placeholders, accompanying Containers, and nested Container bodies.
- Mint deterministic internal IDs from parent identity, property, index, and semantic type.
- Record whether an ID was authored or minted so serialization can omit implementation-only identity.
- Require referential closure after normalization: every mapping entry resolves to the named entity store, or is explicitly external/opaque.

### Stores

Do not add a store for every v4 type. A compact set is sufficient:

- Presentation roots and pages: Collection, CollectionPage, Manifest.
- Containers: Canvas, Timeline, Scene.
- Structural/annotation resources: Range, AnnotationCollection, AnnotationPage, Annotation.
- Agent.
- ContentResource for content types, TextualBody, SpecificResource/selector or aggregate values where separate identity does not benefit Vault.

Whether aggregate wrappers and selectors receive independent records should be driven by mutation/identity use cases, not by their presence in the specification. Embedded immutable values can remain embedded.

### Existing Vault/Helpers boundary

The sibling `iiif-helpers` implementation currently consumes the root parser normalizer, uses the parser's `mapping` to resolve entities, has Presentation 3 entity buckets, and exposes Canvas-oriented sequence helpers. That makes the malformed `Canvas` storage/`Timeline` mapping state an immediate Vault failure, not merely a serializer issue.

- Contract A must feed the existing Vault a genuinely v3-shaped, internally consistent store. Existing Helpers should not learn about Timeline or Scene for this path.
- Contract B needs a separately versioned v4 Vault/store contract with Timeline, Scene identity, paging, and the deliberately widened ContentResource union.
- Parser-only object tests are insufficient; both contracts need end-to-end tests against the real Vault and Helpers packages.

## Validation and test strategy

### Source corpora

Use three independent sources:

1. pristine, pinned official v4 RC examples;
2. existing v2 and v3 fixtures upgraded through public entry points;
3. small, hand-authored self-seeds that are validated before parser execution.

Self-seeds should be preferred for edge cases because a 20-line fixture makes a broken invariant much easier to diagnose than a large cookbook example. Cookbook material remains valuable for realistic integration coverage.

Do not use normalized empty defaults as authoring seeds. Current defaults include placeholder IDs, a zero-sized Canvas, a zero-duration Timeline, and incomplete Annotations; they are useful internal initialization values but are not independently valid specification examples.

### Required matrix

| Input | Default v3-compatible API | Opt-in v4-native API |
| --- | --- | --- |
| v2 fixtures | Existing v3 result remains stable | v2 → v3 → v4 |
| v3 fixtures | Existing v3 result remains stable | v3 → v4 |
| v4 non-3D fixtures | v4 → valid v3 compatibility view | v4 parse/light repair |
| v4 3D fixtures | Unsupported diagnostics; no silent corruption | Supported model or explicit opaque/unsupported policy |

### Minimum self-seed set

- Empty, inline, and paged Collections.
- Standalone Collection Page and multi-page Annotation Collection.
- Manifest with Canvas, Timeline, and mixed Containers.
- Duration-only, spatial-only, and spatial-plus-temporal v3 Canvases.
- Painting and supplementing Annotations.
- Scalar v3 versus array v4 motivation.
- String/object target and source.
- Choice, Composite, List, and Independents.
- Specific Resources with authored and absent IDs.
- Each supported non-3D selector and selector refinement.
- Nested Container as an annotation body.
- Placeholder/accompanying Container rename in both directions.
- `navPlace`, `provides`, `canonical`, `via`, `fileSize`, scale Quantities, and service opacity.
- Unknown property and unknown typed extension payload.
- `Sound` to `Audio` compatibility.
- Mixed Canvas/Scene and Scene-only Manifests.
- At least one Camera/Light/Transform fixture to prove the chosen unsupported or preservation policy.

### Assertions for every supported round trip

1. Validate the source independently.
2. Normalize through the public entry point.
3. Check referential closure and store/type consistency.
4. Serialize through the public entry point.
5. Assert there are no internal keys, IDs, null placeholders, or unset sentinels.
6. Validate the serialized result independently.
7. Compare a semantic projection, not only the top-level identity.
8. Repeat normalize/serialize and assert deterministic output.

The exact upstream example lane should additionally detect losses already observed in the current serializer: scalarized language arrays, missing top-level Annotation Page/Annotation Collection context, lost paging fields, omitted Agent `logo`, Annotation `provides`, and `fileSize`, altered framed references, and invented zero dimensions on a Canvas used as content. Maintain a short documented canonicalization allowlist; any other semantic difference is a failure.

For the v3-compatible path, also assert that output contains only the v3 context and supported v3-facing types. For the v4 path, assert multi-value cardinality and aggregate class semantics explicitly.

### Vault and Helpers contract tests

Run these in the owning repos against a packed candidate of this library:

- import v2/v3/v4 versions of the same logical Manifest and confirm identity deduplication;
- load a paged Collection and Annotation Collection through an asynchronous resolver;
- query Canvas and projected Timeline resources through existing Helpers;
- verify existing helper output for v2/v3 does not change;
- access nested Container bodies through the widened ContentResource abstraction;
- receive stable structured diagnostics for unsupported Scene content;
- serialize a Vault resource back to its selected v3 or v4 wire contract without internal-state leakage.

## Delivery sequence

### Phase 0: establish a reliable oracle

- Pin the RC source and restore pristine fixtures.
- Delete or quarantine generated-over-source fixture rewrites.
- Record the contradiction policy.
- Make strict in-scope fixture validation green.
- Add tests that prove source fixtures are not modified.

Exit: the team trusts a red test and can identify whether a failure is source validity, parser behavior, or a documented RC ambiguity.

### Phase 1: ship the transparent v3 path

- Add version detection and the v4-to-v3 compatibility projection.
- Support non-3D Canvas, Timeline, annotations, Containers, Ranges, inline Collections, and preserved page references.
- Add structured Scene/3D diagnostics.
- Force valid v3 wire serialization.
- Run the v2/v3/v4 non-3D matrix through built public entry points.

Exit: an unchanged v3 application can ingest supported v2, v3, and v4 resources without branching, sentinel values, context hybrids, or silent loss of supported data.

### Phase 2: make the v4-native core coherent

- Align declarations, policy metadata, validation, traversal, normalization, and serialization.
- Correct aggregate semantics and cardinality.
- Add Collection Page and paging.
- Repair the serialization boundary and property coverage.
- Enable declaration checking.

Exit: every supported v2/v3/v4 non-3D seed normalizes to v4, serializes to valid v4, and passes semantic round-trip checks.

### Phase 3: integrate Vault and Helpers

- Publish or pack a candidate.
- Run cross-repo compatibility tests.
- Add optional fetching for Collection/Annotation Collection pages in the Vault layer.
- Document small, deliberate v4 Vault breaking changes.

Exit: existing Helper behavior remains stable for the compatibility path, and v4-native consumers can use new concepts without bypassing Vault.

### Phase 4: deepen 3D support only from demonstrated needs

- Start with accurate opaque preservation and diagnostics.
- Add Scene component types, normalization, and serialization together, one tested vertical slice at a time.
- Preserve transform order and do not normalize service-like or extension subtrees speculatively.

Exit: every claimed 3D feature has authored, normalized, serialized, and helper/Vault tests. Unclaimed features remain explicitly unsupported rather than partially modeled.

## Initial review verification snapshot

The following checks were run against the reviewed branch:

| Command | Result |
| --- | --- |
| `pnpm run build` | Pass |
| `pnpm run lint` | Pass |
| `pnpm run typecheck` | Pass with the repository's current `skipLibCheck` setting |
| `pnpm exec vitest run` | Pass: 29 files, 367 tests |
| `pnpm run test:types` | Pass: 33 authored and 98 converted fixture type checks |
| `pnpm run typecheck:p4-normalized-fixtures:all` | Pass: 131/131 |
| `pnpm run validate:p4:fixtures` | **Fail: 17 valid, 16 invalid, 141 warnings** |
| TypeScript with `skipLibCheck: false` | **Fail: approximately 80 declaration errors** |

The green checks demonstrate useful scaffolding and regression coverage. They do not establish Presentation 4 conformance because invalid source fixtures, weak smoke assertions, permissive/open declarations, and self-round-tripped fixtures can all make a lossy implementation appear green.

## Final verification snapshot

The completion pass was verified on Node 24 with the sibling Helpers checkout
linked through pnpm:

| Command | Result |
| --- | --- |
| `pnpm exec vitest run` | Pass: 37 files, 423 tests |
| `pnpm run typecheck` | Pass |
| `pnpm run build` | Pass |
| `pnpm run lint` | Pass |
| `pnpm run test:types` | Pass |
| `pnpm run typecheck:p4-fixtures` | Pass: 33/33 authored fixtures |
| `pnpm run typecheck:p4-fixtures:all` | Pass: 132/132 authored and converted fixtures |
| `pnpm run typecheck:p4-normalized-fixtures:all` | Pass: 132/132 |
| `bun run src/cli.ts validate-p4 fixtures/3-to-4-converted` | Pass: 99/99 converted resources valid |
| `pnpm run test:package-types` | Pass: packed ESM/CJS and strict NodeNext/Bundler declarations |
| Helpers `pnpm run test:presentation-4:packed` | Pass: parser 2.3.0 + Helpers 1.6.0, 41 public subpaths |

## Definition of done

The two product paths are ready when all of the following are true:

- [x] The supported input/output/version matrix is a public contract.
- [x] Official fixtures are pinned, pristine, provenance-tracked, and validation-clean under the recorded policy.
- [x] The default public API accepts v2, v3, and supported v4 without application version branches.
- [x] Existing v2/v3 normalized behavior and Helpers remain compatible.
- [x] Timeline projection rewrites identities and references consistently.
- [x] Scene/3D behavior is explicit, structured, and never silently lossy.
- [x] V4 aggregates preserve `Choice`, `Composite`, `List`, and `Independents` semantics.
- [x] Collection Page and Annotation Collection paging work without implicit network access.
- [x] Services, GeoJSON, and unknown extensions remain opaque and preserved.
- [x] No serialized output contains internal store fields, internal IDs, sentinels, or accidental default values.
- [x] Supported output validates and passes semantic, deterministic round trips.
- [x] Types, validator, traversal, normalized model, and serializer share one tested property policy.
- [x] Public declarations pass library checking.
- [x] README examples run against the packed public API.
- [x] Vault and IIIF Helpers pass cross-repository compatibility tests.
- [x] The first release documents exactly which 3D constructs are unsupported.

## Final release recommendation

Publish parser `2.3.0` first, run the Helpers joint gate against that exact
registry artifact, then publish Helpers `1.6.0`. Record the resulting tarball
integrities beside IIIF/api fixture commit
`28a88829699ebbbe7722b4692cf3b7b67969bc6c`. Do not broaden the advertised 3D
surface without another fixture-backed parser/Vault/helper vertical slice.
