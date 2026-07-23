# Presentation 4 gold fixtures

These small, self-contained responses are authored directly against the IIIF
Presentation API 4.0 RC data model at:

https://iiif.io/api/presentation/4.0/model/

They deliberately avoid 3D classes while covering Collection references,
Collection Page paging, embedded Canvas and Timeline containers, and the
Choice, Composite, and Independents annotation aggregate semantics.

The fixtures are validation seeds, not copies of mutable remote examples.
`validator.test.ts` validates each response without upgrading it and also
asserts that validation does not mutate authored JSON.
