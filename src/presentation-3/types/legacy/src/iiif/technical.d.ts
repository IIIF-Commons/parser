import { LiteralUnion } from '../utility';

export type ResourceType =
  | 'Collection'
  | 'Manifest'
  | 'Canvas'
  | 'Annotation'
  | 'AnnotationPage'
  | 'AnnotationCollection'
  | 'Range'
  | 'ContentResource'
  | 'Choice'
  | 'CanvasReference'
  | 'Service';

export type ViewingDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';

export type SpecificationBehaviors =
  | 'auto-advance'
  | 'continuous'
  | 'facing-pages'
  | 'individuals'
  | 'multi-part'
  | 'no-auto-advance'
  | 'no-nav'
  | 'no-repeat'
  | 'non-paged'
  | 'hidden'
  | 'paged'
  | 'repeat'
  | 'sequence'
  | 'thumbnail-nav'
  | 'together'
  | 'unordered';

export type SpecificationTimeMode = 'trim' | 'scale' | 'loop';

export type TechnicalProperties = {
  /**
   * The URI that identifies the resource. If the resource is only available embedded  within another resource (see the [terminology section][prezi30-terminology] for an explanation of "embedded"), such as a Range within a Manifest, then the URI _MAY_ be the URI of the embedding resource with a unique fragment on the end. This is not true for Canvases, which _MUST_ have their own URI without a fragment.
   *
   * The value _MUST_ be a string, and the value _MUST_ be an HTTP(S) URI for resources defined in this specification. If the resource is retrievable via HTTP(S), then the URI _MUST_ be the URI at which it is published. External resources, such as profiles, _MAY_ have non-HTTP(S) URIs defined by other communities.
   *
   * The existence of an HTTP(S) URI in the `id` property does not mean that the URI will always be dereferencable.  If the resource with the `id` property is [embedded][prezi30-terminology], it _MAY_ also be dereferenceable. If the resource is referenced (again, see the [terminology section][prezi30-terminology] for an explanation of "referenced"), it _MUST_ be dereferenceable. The [definitions of the Resources][prezi30-resource-structure] give further guidance.
   *
   *  * All resource types _MUST_ have the `id` property.
   *  * Clients _MAY_ render `id` on any resource type, and _SHOULD_ render `id` on Collections, Manifests and Canvases.
   */
  id: string;

  /**
   *  The type or class of the resource. For classes defined for this specification, the value of `type` will be described in the sections below describing each individual class.
   *
   *  For content resources, the value of `type` is drawn from other specifications. Recommendations for common content types such as image, text or audio are given in the table below.
   *
   *  The JSON objects that appear in the value of the `service` property will have many different classes, and can be used to distinguish the sort of service, with specific properties defined in a [registered context document][prezi30-ldce].
   *
   *  The value _MUST_ be a string.
   *
   *  * All resource types _MUST_ have the `type` property.
   *  * Clients _MUST_ process, and _MAY_ render, `type` on any resource type.
   */
  type: ResourceType;

  /**
   * The specific media type (often called a MIME type) for a content resource, for example `image/jpeg`. This is important for distinguishing different formats of the same overall type of resource, such as distinguishing text in XML from plain text.
   *
   * Note that this is different to the `formats` property in the [Image API][image-api], which gives the extension to use within that API. It would be inappropriate to use in this case, as `format` can be used with any content resource, not just images.
   *
   * The value _MUST_ be a string, and it _SHOULD_ be the value of the `Content-Type` header returned when the resource is dereferenced.
   *
   * * A content resource _SHOULD_ have the `format` property.
   * * Clients _MAY_ render the `format` of any content resource.
   * * Other types of resource _MUST NOT_ have the `format` property.
   * * Clients _SHOULD_ ignore `format` on other types of resource.
   */
  format: string;

  /**
   *  A schema or named set of functionality available from the resource. The profile can further clarify the `type` and/or `format` of an external resource or service, allowing clients to customize their handling of the resource that has the `profile` property.
   *
   *  The value _MUST_ be a string, either taken from the [profiles registry][registry-profiles] or a URI.
   *
   *  * Resources [referenced][prezi30-terminology] by the `seeAlso` or `service` properties _SHOULD_ have the `profile` property.
   *  * Clients _SHOULD_ process the `profile` of a service or external resource.
   *  * Other types of resource _MAY_ have the `profile` property.
   *  * Clients _MAY_ process the `profile` of other types of resource.
   */
  profile: string;

  /**
   *  The height of the Canvas or external content resource. For content resources, the value is in pixels. For Canvases, the value does not have a unit. In combination with the width, it conveys an aspect ratio for the space in which content resources are located.
   *
   *  The value _MUST_ be a positive integer.
   *
   *  * A Canvas _MAY_ have the `height` property. If it has a `height`, it _MUST_ also have a `width`.
   *  * Clients _MUST_ process `height` on a Canvas.
   *  * Content resources _SHOULD_ have the `height` property, with the value given in pixels, if appropriate to the resource type.
   *  * Clients _SHOULD_ process `height` on content resources.
   *  * Other types of resource _MUST NOT_ have the `height` property.
   *  * Clients _SHOULD_ ignore `height` on other types of resource.
   */
  height: number;

  /**
   * The width of the Canvas or external content resource. For content resources, the value is in pixels. For Canvases, the value does not have a unit. In combination with the height, it conveys an aspect ratio for the space in which content resources are located.
   *
   * The value _MUST_ be a positive integer.
   *
   *  * A Canvas _MAY_ have the `width` property. If it has a `width`, it _MUST_ also have a `height`.
   *  * Clients _MUST_ process `width` on a Canvas.
   *  * Content resources _SHOULD_ have the `width` property, with the value given in pixels, if appropriate to the resource type.
   *  * Clients _SHOULD_ process `width` on content resources.
   *  * Other types of resource _MUST NOT_ have the `width` property.
   *  * Clients _SHOULD_ ignore `width` on other types of resource.
   */
  width: number;

  /**
   *  The duration of the Canvas or external content resource, given in seconds.
   *
   *  The value _MUST_ be a positive floating point number.
   *
   *  * A Canvas _MAY_ have the `duration` property.
   *  * Clients _MUST_ process `duration` on a Canvas.
   *  * Content resources _SHOULD_ have the `duration` property, if appropriate to the resource type.
   *  * Clients _SHOULD_ process `duration` on content resources.
   *  * Other types of resource _MUST NOT_ have a `duration`.
   *  * Clients _SHOULD_ ignore `duration` on other types of resource.
   */
  duration: number;

  /**
   *  The direction in which a set of Canvases _SHOULD_ be displayed to the user. This specification defines four direction values in the table below. Others may be defined externally [as an extension][prezi30-ldce].
   *
   *  The value _MUST_ be a string.
   *
   *  * A Collection _MAY_ have the `viewingDirection` property.<br/>
   *  * Clients _SHOULD_ process `viewingDirection` on a Collection.
   *  * A Manifest _MAY_ have the `viewingDirection` property.<br/>
   *  * Clients _SHOULD_ process `viewingDirection` on a Manifest.
   *  * A Range _MAY_ have the `viewingDirection` property.<br/>
   *  * Clients _MAY_ process `viewingDirection` on a Range.
   *  * Other types of resource _MUST NOT_ have the `viewingDirection` property.<br/>
   *  * Clients _SHOULD_ ignore `viewingDirection` on other types of resource.
   */
  viewingDirection: ViewingDirection;

  /**
   *  A set of user experience features that the publisher of the content would prefer the client to use when presenting the resource. This specification defines the values in the table below. Others may be defined externally as an [extension][prezi30-ldce].
   *
   *  In order to determine the behaviors that are governing a particular resource, there are four inheritance rules from resources that reference the current resource:
   *  * Collections inherit behaviors from their referencing Collection.
   *  * Manifests **DO NOT** inherit behaviors from any referencing Collections.
   *  * Canvases inherit behaviors from their referencing Manifest, but **DO NOT** inherit behaviors from any referencing Ranges, as there might be several with different behaviors.
   *  * Ranges inherit behaviors from any referencing Range and referencing Manifest.
   *
   *  Clients should interpret behaviors on a Range only when that Range is selected or is in some other way the context for the user's current interaction with the resources. A Range with the `behavior` value `continuous`, in a Manifest with the `behavior` value `paged`, would mean that the Manifest's Canvases should be rendered in a paged fashion, unless the range is selected to be viewed, and its included Canvases would be rendered in that context only as being virtually stitched together. This might occur, for example, when a physical scroll is cut into pages and bound into a codex with other pages, and the publisher would like to provide the user the experience of the scroll in its original form.
   *
   *  The descriptions of the behavior values have a set of which other values they are disjoint with, meaning that the same resource _MUST NOT_ have both of two or more from that set. In order to determine which is in effect, the client _SHOULD_ follow the inheritance rules above, taking the value from the closest resource. The user interface effects of the possible permutations of non-disjoint behavior values are client dependent, and implementers are advised to look for relevant recipes in the [IIIF cookbook][annex-cookbook].
   *
   *  __Future Clarification Anticipated__<br/>
   *  Further clarifications about the implications of interactions between behavior values should be expected in subsequent minor releases.
   *
   *  The value _MUST_ be an array of strings.
   *
   *  * Any resource type _MAY_ have the `behavior` property with at least one item.<br/>
   *  Clients _SHOULD_ process `behavior` on any resource type.
   *
   *  > | Value | Description |
   *  | ----- | ----------- |
   *  || **Temporal Behaviors** |
   *  | `auto-advance` | Valid on Collections, Manifests, Canvases, and Ranges that include or are Canvases with at least the `duration` dimension. When the client reaches the end of a Canvas, or segment thereof as specified in a Range, with a duration dimension that has this behavior, it _SHOULD_ immediately proceed to the next Canvas or segment and render it. If there is no subsequent Canvas in the current context, then this behavior should be ignored. When applied to a Collection, the client should treat the first Canvas of the next Manifest as following the last Canvas of the previous Manifest, respecting any `start` property specified. Disjoint with `no-auto-advance`. |
   *  | `no-auto-advance` | Valid on Collections, Manifests, Canvases, and Ranges that include or are Canvases with at least the `duration` dimension. When the client reaches the end of a Canvas or segment with a duration dimension that has this behavior, it _MUST NOT_ proceed to the next Canvas, if any. This is a default temporal behavior if not specified. Disjoint with `auto-advance`.|
   *  | `repeat` | Valid on Collections and Manifests, that include Canvases that have at least the `duration` dimension. When the client reaches the end of the duration of the final Canvas in the resource, and the `behavior` value `auto-advance` is also in effect, then the client _SHOULD_ return to the first Canvas, or segment of Canvas, in the resource that has the `behavior` value `repeat` and start playing again. If the `behavior` value `auto-advance` is not in effect, then the client _SHOULD_ render a navigation control for the user to manually return to the first Canvas or segment. Disjoint with `no-repeat`.|
   *  | `no-repeat` | Valid on Collections and Manifests, that include Canvases that have at least the `duration` dimension. When the client reaches the end of the duration of the final Canvas in the resource, the client _MUST NOT_ return to the first Canvas, or segment of Canvas. This is a default temporal behavior if not specified. Disjoint with `repeat`.|
   *  | | **Layout Behaviors** |
   *  | `unordered` | Valid on Collections, Manifests and Ranges. The Canvases included in resources that have this behavior have no inherent order, and user interfaces _SHOULD_ avoid implying an order to the user. Disjoint with `individuals`, `continuous`, and `paged`.|
   *  | `individuals` | Valid on Collections, Manifests, and Ranges. For Collections that have this behavior, each of the included Manifests are distinct objects in the given order. For Manifests and Ranges, the included Canvases are distinct views, and _SHOULD NOT_ be presented in a page-turning interface. This is the default layout behavior if not specified. Disjoint with `unordered`, `continuous`, and `paged`. |
   *  | `continuous` | Valid on Collections, Manifests and Ranges, which include Canvases that have at least `height` and `width` dimensions. Canvases included in resources that have this behavior are partial views and an appropriate rendering might display all of the Canvases virtually stitched together, such as a long scroll split into sections. This behavior has no implication for audio resources. The `viewingDirection` of the Manifest will determine the appropriate arrangement of the Canvases. Disjoint with `unordered`, `individuals` and `paged`. |
   *  | `paged` | Valid on Collections, Manifests and Ranges, which include Canvases that have at least `height` and `width` dimensions. Canvases included in resources that have this behavior represent views that _SHOULD_ be presented in a page-turning interface if one is available. The first canvas is a single view (the first recto) and thus the second canvas likely represents the back of the object in the first canvas. If this is not the case, see the `behavior` value `non-paged`. Disjoint with `unordered`, `individuals`, `continuous`, `facing-pages` and `non-paged`. |
   *  | `facing-pages` | Valid only on Canvases, where the Canvas has at least `height` and `width` dimensions. Canvases that have this behavior, in a Manifest that has the `behavior` value `paged`, _MUST_ be displayed by themselves, as they depict both parts of the opening. If all of the Canvases are like this, then page turning is not possible, so simply use `individuals` instead. Disjoint with `paged` and `non-paged`.|
   *  | `non-paged` | Valid only on Canvases, where the Canvas has at least `height` and `width` dimensions. Canvases that have this behavior _MUST NOT_ be presented in a page turning interface, and _MUST_ be skipped over when determining the page order. This behavior _MUST_ be ignored if the current Manifest does not have the `behavior` value `paged`. Disjoint with `paged` and `facing-pages`. |
   *  | | **Collection Behaviors** |
   *  | `multi-part` | Valid only on Collections. Collections that have this behavior consist of multiple Manifests or Collections which together form part of a logical whole or a contiguous set, such as multi-volume books or a set of journal issues. Clients might render these Collections as a table of contents rather than with thumbnails, or provide viewing interfaces that can easily advance from one member to the next. Disjoint with `together`.|
   *  | `together` | Valid only on Collections. A client _SHOULD_ present all of the child Manifests to the user at once in a separate viewing area with its own controls. Clients _SHOULD_ catch attempts to create too many viewing areas. This behavior _SHOULD NOT_ be interpreted as applying to the members of any child resources. Disjoint with `multi-part`.|
   *  | | **Range Behaviors** |
   *  | `sequence` | Valid only on Ranges, where the Range is [referenced][prezi30-terminology] in the `structures` property of a Manifest. Ranges that have this behavior represent different orderings of the Canvases listed in the `items` property of the Manifest, and user interfaces that interact with this order _SHOULD_ use the order within the selected Range, rather than the default order of `items`. Disjoint with `thumbnail-nav` and `no-nav`.|
   *  | `thumbnail-nav` | Valid only on Ranges. Ranges that have this behavior _MAY_ be used by the client to present an alternative navigation or overview based on thumbnails, such as regular keyframes along a timeline for a video, or sections of a long scroll. Clients _SHOULD NOT_ use them to generate a conventional table of contents. Child Ranges of a Range with this behavior _MUST_ have a suitable `thumbnail` property. Disjoint with `sequence` and `no-nav`.|
   *  | `no-nav` | Valid only on Ranges. Ranges that have this behavior _MUST NOT_ be displayed to the user in a navigation hierarchy. This allows for Ranges to be present that capture unnamed regions with no interesting content, such as the set of blank pages at the beginning of a book, or dead air between parts of a performance, that are still part of the Manifest but do not need to be navigated to directly. Disjoint with `sequence` and `thumbnail-nav`.|
   *  | | **Miscellaneous Behaviors** |
   *  | `hidden` | Valid on Annotation Collections, Annotation Pages, Annotations, Specific Resources and Choices. If this behavior is provided, then the client _SHOULD NOT_ render the resource by default, but allow the user to turn it on and off. This behavior does not inherit, as it is not valid on Collections, Manifests, Ranges or Canvases. |
   */
  behavior: Array<LiteralUnion<SpecificationBehaviors>>;

  /**
   *  A mode associated with an Annotation that is to be applied to the rendering of any time-based media, or otherwise could be considered to have a duration, used as a body resource of that Annotation. Note that the association of `timeMode` with the Annotation means that different resources in the body cannot have different values. This specification defines the values specified in the table below. Others may be defined externally as an [extension][prezi30-ldce].
   *
   *  The value _MUST_ be a string.
   *
   *  * An Annotation _MAY_ have the `timeMode` property.<br/>
   *  Clients _SHOULD_ process `timeMode` on an Annotation.
   *
   */
  timeMode: SpecificationTimeMode | string | null;

  /**
   *  This specification defines two values for the Web Annotation property of `motivation`, or `purpose` when used on a Specific Resource or Textual Body.
   *
   *  While any resource _MAY_ be the `target` of an Annotation, this specification defines only motivations for Annotations that target Canvases. These motivations allow clients to determine how the Annotation should be rendered, by distinguishing between Annotations that provide the content of the Canvas, from ones with externally defined motivations which are typically comments about the Canvas.
   *
   *  Additional motivations may be added to the Annotation to further clarify the intent, drawn from [extensions][prezi30-ldce] or other sources. Clients _MUST_ ignore motivation values that they do not understand. Other motivation values given in the Web Annotation specification _SHOULD_ be used where appropriate, and examples are given in the [Presentation API Cookbook][annex-cookbook].
   *
   *  > | Value | Description |
   *  | ----- | ----------- |
   *  | `painting` | Resources associated with a Canvas by an Annotation that has the `motivation` value `painting`  _MUST_ be presented to the user as the representation of the Canvas. The content can be thought of as being _of_ the Canvas. The use of this motivation with target resources other than Canvases is undefined. For example, an Annotation that has the `motivation` value `painting`, a body of an Image and the target of the Canvas is an instruction to present that Image as (part of) the visual representation of the Canvas. Similarly, a textual body is to be presented as (part of) the visual representation of the Canvas and not positioned in some other part of the user interface.|
   *  | `supplementing` | Resources associated with a Canvas by an Annotation that has the `motivation` value `supplementing`  _MAY_ be presented to the user as part of the representation of the Canvas, or _MAY_ be presented in a different part of the user interface. The content can be thought of as being _from_ the Canvas. The use of this motivation with target resources other than Canvases is undefined. For example, an Annotation that has the `motivation` value `supplementing`, a body of an Image and the target of part of the Canvas is an instruction to present that Image to the user either in the Canvas's rendering area or somewhere associated with it, and could be used to present an easier to read representation of a diagram. Similarly, a textual body is to be presented either in the targeted region of the Canvas or otherwise associated with it, and might be OCR, a manual transcription or a translation of handwritten text, or captions for what is being said in a Canvas with audio content. |
   */
  motivation: string | null;
};
