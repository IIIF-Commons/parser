import { Traverse as Traverse3 } from '@iiif/parser/presentation-3';
import { Traverse as Traverse2 } from '@iiif/parser/presentation-2';
import { Traverse as Traverse4 } from '@iiif/parser/presentation-4';
import { infer as infer2 } from '@iiif/parser/presentation-2/types';
import { infer as infer3 } from '@iiif/parser/presentation-3/types';
import { infer as infer4 } from '@iiif/parser/presentation-4/types';
import * as Presentation3Normalized from '@iiif/parser/presentation-3-normalized';
import * as Presentation4Normalized from '@iiif/parser/presentation-4-normalized';
import * as Upgrader from '@iiif/parser/upgrader';

console.log({ Traverse3 });
console.log({ Traverse2 });
console.log({ Traverse4 });
console.log({ infer2: infer2.Manifest });
console.log({ infer3: infer3.Manifest });
console.log({ infer4: infer4.Manifest });
console.log(Presentation3Normalized);
console.log(Presentation4Normalized);
console.log(Upgrader);
