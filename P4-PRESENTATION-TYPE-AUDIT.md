# Presentation 4 Type Audit (Closed-World)

Date: 2026-02-18  
Scope: `src/presentation-4/types` and `src/presentation-4-normalized/types`  
Target model: IIIF Presentation API 4.0 (preview), closed-world TypeScript types

## Goal

Audit current Presentation 4 type declarations against a strict closed-world model:

- Unknown properties must be rejected per class.
- Allowed keys per class are `must + should + may` (plus explicitly allowed property sections).
- Enforce property-level "must not on other classes" constraints.
- Multi-valued properties must be arrays (never scalar-or-array unions).
- Only top-level resource may include `@context`.

## Status Update (Implemented in this refactor)

1. Replaced generated mega type-test files with fixture-based typechecking.

- Added `scripts/typecheck-p4-json-fixtures.mjs` with:
  - all-mode summary output (`PASS/FAIL` + failing paths),
  - single-file mode (`--file`) with focused diagnostics,
  - scope filtering (`all|authored|converted`),
  - soft/report-only mode for converted fixtures.
- Removed generated type-test scripts and large generated test files.
- Wired package scripts:
  - `typecheck:p4-fixtures` (hard gate authored fixtures),
  - `typecheck:p4-fixtures:converted` (soft gate converted fixtures),
  - `typecheck:p4-fixtures:all`.

2. Added strict compile-time type assertions for core P4 constraints.

- Added `__tests__/types/p4-strictness.test-d.ts` to assert:
  - unknown-key rejection,
  - arrays-only for collection page items,
  - `start` forbidden on non-allowed classes,
  - `start` object-only shape requirements.

3. Updated core P4 class types for stricter class-level keys.

- Tightened `Collection`, `CollectionPage`, `Manifest`, `Range`,
  `AnnotationCollection`, `AnnotationPage`, `Timeline`, `Scene`,
  and related `start` typing via `Start` helper types.
- Removed some permissive string/reference unions where class rules require
  object members.

4. Aligned validator rules with the `start` property decision.

- `start` removed from `AnnotationCollection` class requirements.
- Added explicit validator checks for:
  - allowed classes (`Collection|Manifest|Range` only),
  - object shape with `id` + `type`,
  - `SpecificResource` requirements (`selector`, Canvas `source`),
  - disallowing embedded start container bodies (`start.items`).

5. Updated authored fixture per confirmed spec intent.

- `fixtures/presentation-4/06-perspective-camera-with-choice.json`
  now uses multiple `Annotation` entries instead of `Choice`.

6. Enforced object-only `Annotation.body` / `Annotation.target`.

- Array-form body/target is now rejected.
- Multiple bodies/targets must use:
  - `{ "type": "List", "items": [...] }`
- Added validator errors:
  - `annotation-body-array-forbidden`
  - `annotation-target-array-forbidden`
- Migrated authored fixtures in:
  - `fixtures/presentation-4/*`
  - `fixtures/cookbook-v4/*`

## Critical Findings

1. Declarations are internally unsound when `skipLibCheck` is disabled.

- Missing symbols/import assumptions across multiple `.d.ts` files.
- Invalid generic usage and duplicate properties.
- Circular recursive aliases in service types.
- Examples:
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:50`
  - `src/presentation-4/types/legacy/src/resources/manifest.d.ts:30`
  - `src/presentation-4/types/legacy/src/resources/manifest.d.ts:49`
  - `src/presentation-4/types/legacy/src/resources/service.d.ts:18`
  - `src/presentation-4-normalized/types/legacy/iiif/descriptive.d.ts:1`

2. Closed-world is explicitly broken by index signatures and open object allowances.

- Examples:
  - `src/presentation-4/types/legacy/src/resources/manifest.d.ts:57`
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:55`
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:129`
  - `src/presentation-4/types/legacy/src/resources/scene-components.d.ts:13`
  - `src/presentation-4/types/legacy/src/resources/service.d.ts:15`
  - `src/presentation-4-normalized/types/legacy/iiif/technical-v4.d.ts:29`

## High Findings

3. Multi-valued properties are not arrays-only (`OneOrMany<T>` is pervasive).

- Violates arrays-always JSON rule.
- Examples:
  - `src/presentation-4/types/legacy/src/resources/annotationPage.d.ts:30`
  - `src/presentation-4/types/legacy/src/resources/collectionPage.d.ts:17`
  - `src/presentation-4/types/legacy/src/resources/timeline.d.ts:27`
  - `src/presentation-4/types/legacy/src/resources/annotation.d.ts:70`
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:26`

4. `@context` is allowed on embedded resources.

- Violates "top-level only" rule.
- Examples:
  - `src/presentation-4/types/legacy/src/resources/canvas.d.ts:30`
  - `src/presentation-4/types/legacy/src/resources/scene.d.ts:48`
  - `src/presentation-4/types/legacy/src/resources/timeline.d.ts:25`
  - `src/presentation-4/types/legacy/src/resources/annotationPage.d.ts:24`
  - `src/presentation-4/types/legacy/src/resources/annotationCollection.d.ts:31`

5. Collection paging-vs-items exclusivity is not encoded at type level.

- `Collection.items` allows embedded `Manifest` and string values.
- No conditional union enforcing `items` xor (`first` + `last`).
- Examples:
  - `src/presentation-4/types/legacy/src/resources/collection.d.ts:17`
  - `src/presentation-4/types/legacy/src/resources/collection.d.ts:36`
  - `src/presentation-4/types/legacy/src/resources/collection.d.ts:47`

6. Manifest items are too permissive.

- Allows references/strings where spec requires embedded Containers.
- Example:
  - `src/presentation-4/types/legacy/src/resources/manifest.d.ts:16`

7. AnnotationCollection allows `items` despite being paged via `first`/`last`.

- Example:
  - `src/presentation-4/types/legacy/src/resources/annotationCollection.d.ts:42`

8. AnnotationPage items allow non-Annotation members.

- Example:
  - `src/presentation-4/types/legacy/src/resources/annotationPage.d.ts:30`

9. Annotation model is over-permissive for body/target and includes non-allowed keys.

- `Record<string, unknown>`, raw strings, and additional v3 fields leak in.
- Examples:
  - `src/presentation-4/types/legacy/src/resources/annotation.d.ts:22`
  - `src/presentation-4/types/legacy/src/resources/annotation.d.ts:23`
  - `src/presentation-4/types/legacy/src/resources/annotation.d.ts:54`

10. ContentResource base diverges from strict model.

- `id` and `type` optional in base.
- Many cross-class properties are mixed into generic base shape.
- Examples:
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:91`
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:93`
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:103`
  - `src/presentation-4/types/legacy/src/resources/contentResource.d.ts:115`

11. Property-level deny rules are not enforced globally.

- `start` appears on AnnotationCollection.
- `transform` appears in normalized generic content resources.
- Examples:
  - `src/presentation-4/types/legacy/src/resources/annotationCollection.d.ts:35`
  - `src/presentation-4-normalized/types/legacy/resources/contentResource.d.ts:17`

12. Out-of-model properties appear on multiple core classes.

- `logo`, `supplementary`, and other extra keys present where not in class allowlists.
- Examples:
  - `src/presentation-4/types/legacy/src/resources/canvas.d.ts:44`
  - `src/presentation-4/types/legacy/src/resources/scene.d.ts:62`
  - `src/presentation-4/types/legacy/src/resources/range.d.ts:53`
  - `src/presentation-4/types/legacy/src/resources/annotationPage.d.ts:41`

## Medium Findings

13. Case-sensitive constants are loosened by aliases.

- `WKTSelector` and `ChoiceSelector` aliases broaden strictness.
- Examples:
  - `src/presentation-4/types/legacy/src/extensions/presentation-4.d.ts:27`
  - `src/presentation-4/types/legacy/src/extensions/presentation-4.d.ts:42`

14. Normalized shapes are under-constrained for must fields and over-shared for may fields.

- `id` optional in shared normalized reference base.
- `CanvasNormalized` missing explicit `height`/`width`.
- `TimelineNormalized.duration` optional.
- `AnnotationCollectionNormalized` modeled with `items` and without paging structure.
- Examples:
  - `src/presentation-4-normalized/types/legacy/iiif/technical-v4.d.ts:9`
  - `src/presentation-4-normalized/types/legacy/resources/canvas.d.ts:3`
  - `src/presentation-4-normalized/types/legacy/resources/timeline.d.ts:6`
  - `src/presentation-4-normalized/types/legacy/resources/annotationCollection.d.ts:5`

## Resolved Decisions

1. `start` is allowed only on `Collection`, `Manifest`, and `Range`.

- `start` must be an object with `id` and `type`.
- It may be:
  - a Container reference object, or
  - a `SpecificResource` with `selector` and Canvas `source`.
- Other classes must not carry `start`.

2. `fixtures/presentation-4/06-perspective-camera-with-choice.json` was incorrect.

- The fixture now encodes multiple annotations directly (no `Choice` wrapper).

3. `Annotation.body` and `Annotation.target` are object-only.

- Arrays are not valid for either property.
- Multiple values must be represented as a `List` object with `items`.

## Current Parity Snapshot

After the current refactor:

- `pnpm run typecheck`: pass
- `pnpm run test:types`: pass
  - authored fixtures: `PASS 33/33`
  - converted fixtures (soft): `SOFT FAIL 94/98` with 4 failing files:
    - `fixtures/3-to-4-converted/cookbook/0202-start-canvas.json`
    - `fixtures/3-to-4-converted/presentation-3/bodleian.json`
    - `fixtures/3-to-4-converted/presentation-3/ocean-liners.json`
    - `fixtures/3-to-4-converted/presentation-3/start-canvas.json`

- `pnpm cli validate-p4 ./fixtures/3-to-4-converted/`: 5 invalid files
  - the same 4 above, plus:
  - `fixtures/3-to-4-converted/presentation-3/ldmax.json`
    (`container-id-fragment-forbidden`)

Note: the extra `ldmax` failure is currently runtime-validator-only
(container URI fragment rule), not fully expressible with static TS object typing.

## Refactor Plan

### Phase 1: Stabilize Declarations

1. Remove declaration errors that are hidden by `skipLibCheck`.
2. Eliminate duplicate properties and malformed generics.
3. Break circular service self-aliasing into interface+recursive property pattern.
4. Ensure every `.d.ts` is self-contained or correctly imported.

Primary files:

- `src/presentation-4/types/legacy/src/resources/contentResource.d.ts`
- `src/presentation-4/types/legacy/src/resources/manifest.d.ts`
- `src/presentation-4/types/legacy/src/resources/service.d.ts`
- `src/presentation-4-normalized/types/legacy/iiif/descriptive.d.ts`
- `src/presentation-4-normalized/types/legacy/resources/manifest.d.ts`

### Phase 2: Build Closed-World Primitives

1. Remove all `[key: string]: unknown` from authored models.
2. Remove `Record<string, unknown>` catch-alls from body/target/value unions.
3. Replace broad helper bases with class-scoped property blocks.
4. Keep reference utility types narrow and explicit.

### Phase 3: Arrays-Only Enforcement

1. Remove `OneOrMany<T>` usage from all authored Presentation 4 models.
2. Convert multi-valued keys to arrays everywhere:

- `items`, `provider`, `thumbnail`, `homepage`, `seeAlso`, `rendering`, `service`, `services`, `annotations`, etc.

3. Keep scalar-only properties scalar.

### Phase 4: Class-by-Class Strict Shapes

1. Define explicit allowed-key interfaces per class.
2. Use discriminated unions by `type` constant.
3. Encode structural constraints with unions:

- `Collection`: items branch vs paged branch (`first` + `last`, no `items`).
- `Manifest.items`: embedded `Canvas | Scene | Timeline` only.
- `AnnotationPage.items`: `Annotation[]` only.
- `AnnotationCollection`: paged only (no `items`).

### Phase 5: Global Property Deny Rules

1. Enforce property placement with reusable mapped helpers:

- `height`: only `Canvas | ContentResource | SpecificResource`
- `width`: only `Canvas | ContentResource | SpecificResource`
- `duration`: only `Timeline | Canvas | Scene | ContentResource | SpecificResource` (required on `Timeline`)
- `transform`: only `SpecificResource`
- `start`: only decided set (pending ambiguity resolution)

2. Add compile-time tests for negative cases on each forbidden combination.

### Phase 6: JSON-LD and Context Placement

1. Allow `@context` only on root types used as top-level resources.
2. Remove `@context` from embedded resource declarations.
3. Add tests proving embedded resources with `@context` fail type checks.

### Phase 7: Normalized Type Mirror

1. Mirror strict authored constraints in normalized forms where still semantically applicable.
2. Ensure normalized must fields are present (`Canvas.height/width`, `Timeline.duration`, etc., if normalization guarantees them).
3. Keep normalized helper bases closed-world.
4. Avoid reintroducing permissive open index signatures in normalized technical helpers.

## Suggested Execution Order (Small Safe PRs)

1. Declaration-fix PR (no semantic shape changes).
2. Closed-world + arrays-only primitives PR.
3. Structural class strict unions PR (`Collection`, `Manifest`, `Annotation*`).
4. ContentResource + SpecificResource strictness PR.
5. Normalized strict mirror PR.
6. Final deny-rule sweep and test hardening PR.

## Test Plan

1. Add compile-time type tests for:

- Unknown key rejection per class.
- Multi-valued scalar rejection.
- Forbidden property placement rejection.
- Collection paging/items exclusivity.
- Manifest embedded item requirements.
- AnnotationPage annotation-only items.

2. Add runtime validator parity checks only where runtime validator intentionally enforces the same rule.
3. Run:

- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run lint`
- `pnpm run build`
- `node pkg-tests/node-load.cjs`
- `node pkg-tests/node-load.mjs`
- `node pkg-tests/node-umd.mjs`

## Acceptance Criteria

1. No open index signatures on authored Presentation 4 classes.
2. No `OneOrMany` on multi-valued authored properties.
3. `@context` restricted to top-level-only policy.
4. Structural constraints encoded in the type system (not only runtime validator).
5. Property deny rules are compile-time enforced.
6. Normalized types remain strict and internally valid under declaration checking.
