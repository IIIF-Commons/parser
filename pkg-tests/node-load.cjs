const parser3 = require('@iiif/parser');
const parser2 = require('@iiif/parser/presentation-2');
const parser2Types = require('@iiif/parser/presentation-2/types');
const parser4 = require('@iiif/parser/presentation-4');
const parser3Types = require('@iiif/parser/presentation-3/types');
const parser4Types = require('@iiif/parser/presentation-4/types');
const parser3Normalized = require('@iiif/parser/presentation-3-normalized');
const parser4Normalized = require('@iiif/parser/presentation-4-normalized');

console.log(parser2.Traverse);
console.log(parser2Types.infer.Manifest);
console.log(parser3.Traverse);
console.log(parser3Types.infer.Manifest);
console.log(parser4.Traverse);
console.log(parser4Types.infer.Manifest);
console.log(typeof parser3Normalized);
console.log(typeof parser4Normalized);
