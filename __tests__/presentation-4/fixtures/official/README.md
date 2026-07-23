# Official IIIF Presentation 4 fixtures

These fixtures preserve the JSON content of representative examples from the
IIIF Presentation 4.0 Release Candidate source. The checked-in files use the
repository's two-space JSON formatting and final POSIX newline.

- Repository: https://github.com/IIIF/api
- Pinned commit: [`28a88829699ebbbe7722b4692cf3b7b67969bc6c`](https://github.com/IIIF/api/tree/28a88829699ebbbe7722b4692cf3b7b67969bc6c/source/presentation/4.0/example)
- Source directory: `source/presentation/4.0/example`
- Retrieved: 2026-07-23
- Copyright: IIIF Consortium editors and contributors
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), as stated by the source specification

The compact selection covers Timeline, Canvas fragments, SpecificResource,
Collection references, Range structures, linked Annotation Collections,
services, language values, temporal content, nested Timeline painting, and
Canvas references with `partOf`. The `uc08` fixture is the bounded 3D contract:
Scene painting, Models, a PerspectiveCamera, ordered transforms, Annotation
references, and an ordered activating action list. It is tested only through
the native Presentation 4 pipeline and is not part of the Presentation 3
compatibility gate.

## SHA-256

```text
59b4e1d8e17b1cc951dec7e2a64ee4bb1672920a868d6b6f167fd69fe07e2c61  02_timeline.json
bbe0aad8b1974f57d4b840fec5e3870f48c838b179d486503fa576002af4c334  05_fragment.json
988304852807834d1a94402651c03ef1c5b507a77861476a034d81b21e40032c  06_specific_resource.json
9dab7cb4883e25e7a31021ce72c80e174ca53e5f2b365fe8845d5c34452f4412  07_collection.json
a126e38445988123b9956b2d291af61bd091044c60ff8e94c405fc783093f73e  08_range.json
60215ef5d23a2dc01953a4976e2ad5db1b29f71dd9ee613c53c7646102b1482d  uc03_issue1.json
ba30de8ba3f917b038f58ec0358836d1c5c099a850da73b482293abd1104b763  uc07_duration_composite.json
9b990050e18a137bff2aef9f7a423a0ced62af400d885957c3681040959b0160  uc07_image_composite.json
57ae7e0493f8abef41a72271804c1e25e4ace4b273777d65fbf3ca6547004cf4  uc08_3d_comments_with_cameras.json
```
