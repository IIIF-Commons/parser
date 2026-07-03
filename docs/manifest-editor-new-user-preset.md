# Manifest Editor new-user preset

This guide defines a conservative preset for a Manifest Editor built on normalized IIIF Presentation resources. The goal is to let new users create and edit useful manifests without needing to understand the full IIIF object model on day one.

The preset should expose a small set of plain-language fields, provide guided creators for common canvas/content patterns, and keep IIIF-specific structure visible only when it helps the task. Ranges are intentionally out of scope because the range editor is already included by default.

Reference points:

- IIIF Presentation API 3.0: https://iiif.io/api/presentation/3.0/
- IIIF Presentation API Cookbook: https://iiif.io/api/cookbook/
- Local fixture analysis: 151 JSON fixtures were inspected. A normalized pass succeeded for 133 fixtures; raw fixture counting was also used so default normalized fields did not inflate usage.

## Preset principles

1. Use task language first and IIIF terms second.
   - Show "Title" instead of `label`.
   - Show "Short description" instead of `summary`.
   - Show "Details" or "Metadata" instead of `metadata`.
   - Show "Rights statement" instead of `rights`.
   - Show "Attribution / required display text" instead of `requiredStatement`.
   - Show "Provider" instead of `provider`, with organization-friendly subfields.

2. Keep structure fields out of property editors.
   - `items`, `annotations`, `body`, `target`, `service`, `partOf`, `structures`, and generated `id` values are usually managed by creators, reorder tools, sidebars, and the range editor.
   - A new user should rarely edit annotation pages or painting annotations directly.

3. Prefer creators over empty forms for complex entities.
   - Creating a canvas should be a guided choice: image, image service, video, audio, blank canvas, or multi-image/layered canvas.
   - The creator should fill the IIIF scaffolding: Canvas -> AnnotationPage -> Annotation -> ContentResource.

4. Make optional fields progressive.
   - Default sidebars should be short.
   - Advanced sections should be collapsed but easy to find when a user is importing, publishing, or doing rights/compliance work.

5. Preserve all existing data.
   - Hidden by default does not mean discarded.
   - Unknown, extension, legacy, and advanced properties should round-trip and be available in an "Advanced / raw properties" inspector.

## Fixture signals

The fixture corpus has strong signals for the editing surface:

| Entity | Strongly common properties | Notes |
| --- | --- | --- |
| Manifest | `label`, `thumbnail`, `metadata`, `requiredStatement`, `rights`, `behavior`, `viewingDirection`, `provider` | Top-level manifests nearly always have a title. Thumbnail, rights, and metadata are common enough to support, but not all need to be visible at once. |
| Canvas | `label`, `height`, `width`, `items`, `thumbnail`, `metadata` | Canvas dimensions and painting content are core. Most users should edit dimensions through the content creator, not as standalone JSON fields. |
| Annotation | `motivation`, `body`, `target` | Painting annotations are structural glue. Hide by default except for advanced annotation workflows. |
| Content resource | `format`, `service`, `height`, `width`, `label`, `duration` | Image resources dominate. Video/audio are less common but important enough for first-class creators. |
| Agent | `label`, `homepage`, `logo` | Provider editing can be simplified to organization name, website, and logo. |

Raw fixture counts are skewed by mixed Presentation 2 and 3 fixtures, nested manifests, and converted examples. Use them as a directional signal rather than a product analytics source.

## Manifest Properties

### Default visible fields

These should be visible in the default Manifest sidebar.

| UI label | IIIF property | Control | Default behavior |
| --- | --- | --- | --- |
| Title | `label` | Internationalized text input | Required. Single plain text field by default, with language controls available. |
| Short description | `summary` | Multiline internationalized text | Optional. Keep near the top because it is easier for new users than metadata pairs. |
| Details | `metadata` | Ordered list of label/value pairs | Optional. Use "Add detail" rows with simple labels like Author, Date, Location, Repository. |
| Thumbnail | `thumbnail` | Image picker / URL / derive from first canvas | Optional. Default to "Use first canvas image" where possible. |
| Rights statement | `rights` | URI picker plus custom URI advanced option | Optional. Offer Creative Commons and RightsStatements.org presets before a free URL field. |
| Attribution / required display text | `requiredStatement` | Label/value pair with default label | Optional but important. Default label should be "Attribution". |

Recommended initial order:

1. Title
2. Short description
3. Thumbnail
4. Details
5. Rights statement
6. Attribution / required display text

### Collapsed advanced fields

These should exist in the preset but be collapsed under sections such as "Display", "Links", and "Provider".

| UI label | IIIF property | Why advanced |
| --- | --- | --- |
| Viewing direction | `viewingDirection` | Important for books, manuscripts, and scroll-like objects, but irrelevant for many single-object manifests. |
| Viewing behavior | `behavior` | Useful values like `paged`, `individuals`, and `continuous` affect viewers but require IIIF-specific explanation. |
| Start canvas | `start` | Useful for guided starting points. Better selected from a canvas list than edited as a property. |
| Provider | `provider` | Valuable for publication but too structured for the first screen. Use a dedicated provider mini-editor. |
| Homepage | `homepage` | Useful public link, but not core authoring. |
| See also | `seeAlso` | Machine-readable or related descriptive data. Useful for imports and integrations. |
| Rendering / downloads | `rendering` | Useful for PDFs, transcripts, downloads, and alternate representations. |
| Nav date | `navDate` | Useful for chronological viewers and maps/timelines. Advanced because the format and purpose are not obvious. |
| Part of | `partOf` | Useful for collections, but usually managed through collection tools or import context. |
| Services | `service` / `services` | Search, auth, extension services. Should be plugin/advanced territory. |

### Hidden by default

These should not appear in the normal new-user property form.

- `id`: generated or edited only in an advanced identity panel.
- `type`: fixed as `Manifest`.
- `@context`: managed by serialization.
- `items`: managed by the canvas list/editor.
- `structures`: managed by the range editor.
- `annotations`: advanced whole-manifest annotation workflows only.
- Legacy aliases such as `license`, `attribution`, `description`, `sequences`, `viewingHint`, `within`, `related`, and `logo`: preserve and upgrade where possible, but do not expose as first-class Presentation 3 fields.
- Extension fields such as `navPlace`: preserve and expose only when the editor has a dedicated extension UI.

### Manifest UX guidance

The Manifest editor should feel like editing a publication record, not a JSON object. The first screen should answer:

- What is this object called?
- What should a viewer show as a short description?
- What details should appear in an information panel?
- What rights/attribution text must be shown?
- What canvases does it contain?

Use inline language controls only when the user opts in. A simple new-user flow can store values under `none` or the project default language, then expose multilingual editing via a small language menu on each text field.

## Canvas Properties

### Default visible fields

These should be visible in the default Canvas sidebar.

| UI label | IIIF property | Control | Default behavior |
| --- | --- | --- | --- |
| Label | `label` | Text input | Recommended. Auto-generate "Canvas 1", "Page 1", etc. if blank. |
| Content | `items` -> painting annotation -> `body` | Content summary and edit button | Do not expose annotation internals. Show what is painted on the canvas. |
| Size | `height`, `width` | Read-only summary by default, editable in advanced mode | Derive from image service, image, video, or user input. |
| Duration | `duration` | Numeric time input | Visible only for audio/video canvases. |
| Thumbnail | `thumbnail` | Image picker / derive from content | Optional. Auto-derive from primary image where possible. |
| Details | `metadata` | Ordered label/value pairs | Optional. Use for page-specific notes, folio numbers, scene titles, etc. |

### Collapsed advanced fields

| UI label | IIIF property | Why advanced |
| --- | --- | --- |
| Canvas rights | `rights` | Usually inherited conceptually from the manifest; canvas-level overrides are uncommon. |
| Canvas attribution | `requiredStatement` | Useful for exceptions, but rare. |
| Canvas summary | `summary` | Rare in fixtures; include only when users need per-canvas descriptions. |
| Supplementary annotations | `annotations` | Used for comments, transcriptions, captions, search results, and related annotation pages. Needs a dedicated annotation UI. |
| See also | `seeAlso` | Useful for OCR, ALTO, WebVTT, external metadata, and integrations. |
| Rendering / downloads | `rendering` | Useful for per-canvas downloads. |
| Behavior | `behavior` | Values like `facing-pages` should be offered through display presets, not free text. |
| Placeholder canvas | `placeholderCanvas` | Useful for AV placeholders and loading states. Specialist feature. |
| Accompanying canvas | `accompanyingCanvas` | Useful for transcripts or alternate synchronized content. Specialist feature. |
| Nav place | `navPlace` | Geo extension UI only. |

### Hidden by default

- `id`: generated from the manifest/canvas template unless the user opens advanced identity settings.
- `type`: fixed as `Canvas`.
- `items`: represented as "Content" and managed by creators.
- AnnotationPage and Annotation ids: generated.
- `partOf`: managed by parent manifest/store context.
- `service`: rare on Canvas itself; most image service data belongs on the content resource.

### Canvas UX guidance

Canvas editing should center on the visible/audible content, not the annotation model. A canvas row/card should show:

- Label
- Content type icon: image, video, audio, text, choice, or mixed
- Dimensions or duration
- Thumbnail or media preview
- Warnings when required content is missing

The property sidebar should treat the painting annotation stack as implementation detail. New users should see "Replace image", "Edit media", "Add caption", or "Add transcript" instead of `AnnotationPage`, `Annotation`, `motivation`, `body`, and `target`.

## Canvas Creators

Canvas creators are the most important part of the new-user preset. They should create valid IIIF structures and only ask for the data needed for the selected media type.

### Image with IIIF Image Service

Use this as the primary image creator.

User-facing fields:

- Canvas label
- Image service URL
- Image label, optional
- Width and height, auto-detected when possible
- Image format, default `image/jpeg`
- Thumbnail choice, default "derive from service"

Created structure:

- Canvas with `label`, `height`, `width`
- AnnotationPage in `items`
- Annotation with `motivation: painting`
- Image body with `id`, `type: Image`, `format`, `height`, `width`
- Image service on the body, preferably ImageService3 when known

Default visibility after creation:

- Show canvas label and content summary.
- Hide service profile, tile sizes, technical supports, and generated image request URLs.

Validation/warnings:

- Warn if width/height cannot be determined.
- Warn if the service URL looks like an image request URL rather than a service base URL.
- Warn if the service has no profile/type.

### Static image URL

Use when there is no Image API service.

User-facing fields:

- Canvas label
- Image URL
- Width and height
- Format, inferred from file extension where possible
- Optional image label

Created structure:

- Same Canvas -> AnnotationPage -> painting Annotation structure.
- Image body without `service`.

Validation/warnings:

- Width and height should be required or auto-detected. A canvas with image content but no dimensions is hard for viewers to lay out.
- If dimensions are unknown, offer "Create anyway" only in advanced mode.

### Video

Use for time-based visual media.

User-facing fields:

- Canvas label
- Video URL
- Duration
- Width and height
- Format, default/infer `video/mp4`
- Optional poster/thumbnail
- Optional captions or subtitles link

Created structure:

- Canvas with `duration`, `height`, and `width`
- Painting Annotation with Video body
- Optional `thumbnail` for poster image
- Captions/subtitles as supplementary annotations or linked text resources, depending on the editor's annotation feature set

Default visibility after creation:

- Show label, duration, dimensions, format, and thumbnail.
- Hide annotation timing internals unless the user edits timed annotations.

### Audio

Use for sound-only media.

User-facing fields:

- Canvas label
- Audio URL
- Duration
- Format, default/infer `audio/mpeg` or `audio/wav`
- Optional thumbnail or cover image
- Optional transcript

Created structure:

- Canvas with `duration`
- Painting Annotation with Sound body
- Optional thumbnail
- Optional transcript as supplementary annotation/content

Canvas dimensions:

- Do not force users to invent image dimensions for audio.
- If the target viewer benefits from a visual frame, use a project default canvas size or a cover image creator.

### Blank canvas

Use for placeholders, later content, or annotation-only workflows.

User-facing fields:

- Canvas label
- Width and height, or duration for time-based blank canvas
- Optional thumbnail

Default behavior:

- Make this an advanced creator unless annotation-only authoring is a major product goal.

### Multiple images / layered canvas

Use for foldouts, overlays, comparisons, and composition workflows.

User-facing fields:

- Canvas label
- Canvas width and height
- Add image layers
- For each layer: image/service URL, x/y position, width/height, opacity or visibility if supported

Default behavior:

- Keep out of the first-run creator list.
- Offer as "Advanced: layered canvas" because it exposes selectors, regions, and multiple painting annotations.

### Choice of content

Use for alternate images, AV choices, or language variants where only one representation should be selected.

User-facing fields:

- Choice label
- Default option
- Additional options with labels and media resources

Default behavior:

- Advanced creator.
- Require labels for each option so viewers can present the choice clearly.

## Other Creators

### Provider creator

Provider is common enough in real publishing workflows to deserve a guided mini-editor, but it should be collapsed by default in the Manifest sidebar.

User-facing fields:

- Organization/person name -> Agent `label`
- Website -> Agent `homepage`
- Logo image URL -> Agent `logo`
- Identifier URI -> Agent `id`

Defaults:

- Generate an Agent `id` only if the product has a stable URI policy. Otherwise ask for a website/URI and explain that it identifies the provider.
- Hide `seeAlso` unless the user enables advanced linked data fields.

### Metadata detail creator

Metadata pairs should be easy because they are one of the safest ways for new users to add useful context.

User-facing fields:

- Detail label
- Detail value
- Optional language

Recommended affordances:

- Add common suggestions: Creator, Date, Description, Repository, Collection, Shelfmark, Location, Material, Dimensions.
- Preserve row order.
- Allow rich text only if the product can sanitize and preview HTML safely.

### Rights creator

Rights editing should avoid making users type license URIs.

User-facing fields:

- Rights preset: Creative Commons, RightsStatements.org, or custom URI
- Attribution / required display text

Recommended behavior:

- Store the machine-actionable URI in `rights`.
- Store human-readable custom display text in `requiredStatement` or `metadata`, not in `rights`.

### Link/download creator

Use for `homepage`, `seeAlso`, and `rendering`, but present them as task-specific choices.

User-facing choices:

- Public web page -> `homepage`
- Downloadable file -> `rendering`
- Metadata/data record -> `seeAlso`

Shared fields:

- URL
- Label
- Format
- Profile, advanced only

Default visibility:

- Collapsed under "Links and downloads".

### Supplementary content creator

Use for captions, subtitles, transcripts, OCR, commentary, and annotations that are not the main painted content.

User-facing choices:

- Captions/subtitles
- Transcript
- OCR/text
- Commentary/annotation page

Default behavior:

- Make this available from the Canvas content area as "Add related text/captions" rather than exposing `annotations` directly.
- Store WebVTT captions with clear `format` and `language` fields when available.

### Image service creator

This is mostly a sub-flow of the image creator, not a separate first-level entity creator.

User-facing fields:

- Service base URL
- Service version/profile, auto-detected where possible

Hidden fields:

- Tile sizes, extra features, supports, and generated request parameters.

Expose these only in a technical image-service inspector.

## Recommended sidebar composition

### Manifest sidebar

Default sections:

1. Basic information
   - Title
   - Short description
   - Thumbnail

2. Details
   - Metadata pairs

3. Rights and attribution
   - Rights statement
   - Attribution / required display text

Collapsed sections:

- Display
  - Viewing direction
  - Viewing behavior
  - Start canvas

- Provider
  - Provider mini-editor

- Links and downloads
  - Homepage
  - See also
  - Rendering

- Advanced
  - Identifier
  - Services
  - Raw/unknown properties

### Canvas sidebar

Default sections:

1. Canvas
   - Label
   - Thumbnail

2. Content
   - Primary painted content summary
   - Replace/edit content action
   - Dimensions or duration

3. Details
   - Metadata pairs

Collapsed sections:

- Related content
  - Captions
  - Transcript/OCR
  - Annotation pages
  - Downloads

- Overrides
  - Canvas rights
  - Canvas attribution
  - Canvas summary

- Advanced
  - Identifier
  - Behavior
  - Placeholder/accompanying canvas
  - Raw/unknown properties

## Default hidden-property policy

A property should be hidden by default when any of these are true:

- It is structural and better managed by another editor (`items`, `structures`, `annotations`, `body`, `target`).
- It is generated or fixed (`id`, `type`, `@context`).
- It has low fixture frequency and high conceptual cost (`navPlace`, `placeholderCanvas`, `accompanyingCanvas`, extension services).
- It is a legacy Presentation 2 alias that should be upgraded or preserved, not newly authored (`sequences`, `images`, `otherContent`, `viewingHint`, `within`, `license`, `attribution`, `description`).
- It requires a dedicated domain UI to edit correctly (auth services, search services, geo, complex selectors, choice bodies, layered canvases).

## New-user preset summary

Enable by default:

- Manifest: title, summary, thumbnail, metadata, rights, required statement.
- Canvas: label, content summary, dimensions/duration, thumbnail, metadata.
- Creators: IIIF image service, static image, video, audio.
- Mini-creators: metadata detail, rights, provider, link/download.

Collapse but support:

- Manifest display behavior, viewing direction, start canvas.
- Provider, homepage, seeAlso, rendering.
- Canvas supplementary content, canvas-level rights/attribution, behavior.
- Blank canvas and layered/choice creators.

Hide unless advanced:

- Annotation internals.
- AnnotationPage internals.
- Raw service details.
- Identity/context/type fields.
- Legacy Presentation 2 fields.
- Extension properties without a dedicated UI.

This gives new users a small, useful editing surface while still producing complete IIIF structures through creators and preserving the depth needed by advanced manifests.
