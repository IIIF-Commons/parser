import { ResourceProvider } from '../resources/provider';
import { Canvas } from '../resources/canvas';
import { ContentResource } from '../resources/contentResource';

export type InternationalString = {
  [language: string]: string[] | undefined;
};

export type MetadataItem = {
  label: InternationalString;
  value: InternationalString;
};

export type DescriptiveProperties = {
  /**
   * Label
   *
   *   - A human-readable label, name or title. The label property is intended to be displayed as a short, textual surrogate for the resource if a human needs to make a distinction between it and similar resources, for example between objects, pages, or options for a choice of images to display. The label property can be fully internationalized, and each language can have multiple values. This pattern is described in more detail in the {@link InternationalString} section.
   *  The value of the property must be a JSON object, as described in the {@link InternationalString} section.
   *
   *   - A {@link Collection} must have the label property with at least one entry.
   *   - Clients must render label on a Collection.
   *   - A {@link Manifest} must have the label property with at least one entry.
   *   - Clients must render label on a Manifest.
   *   - A {@link Canvas} should have the label property with at least one entry.
   *   - Clients must render label on a Canvas, and should generate a label for Canvases that do not have them.
   *   - A {@link ContentResource} may have the label property with at least one entry. If there is a Choice of content resource for the same Canvas, then they should each have at least the label property with at least one entry.
   *   - Clients may render label on content resources, and should render them when part of a Choice.
   *   - A {@link Range} should have the label property with at least one entry.
   *   - Clients must render label on a Range.
   *   - An {@link AnnotationCollection} should have the label property with at least one entry.
   *   - Clients should render label on an {@link AnnotationCollection}.
   *   - Other types of resource may have the label property with at least one entry.
   *   - Clients may render label on other types of resource.
   *
   */
  label: InternationalString | null;

  /**
   * Metadata
   *
   * An ordered list of descriptions to be displayed to the user when they interact with the resource, given as pairs of human readable `label` and `value` entries. The content of these entries is intended for presentation only; descriptive semantics _SHOULD NOT_ be inferred. An entry might be used to convey information about the creation of the object, a physical description, ownership information, or other purposes.
   *
   * The value of the `metadata` property _MUST_ be an array of JSON objects, where each item in the array has both `label` and `value` properties. The values of both `label` and `value` _MUST_ be JSON objects, as described in the {@link InternationalString} section.
   *
   *   * A {@link Collection} _SHOULD_ have the `metadata` property with at least one item.
   *   * Clients _MUST_ render `metadata` on a Collection.
   *   * A {@link Manifest} _SHOULD_ have the `metadata` property with at least one item.
   *   * Clients _MUST_ render `metadata` on a Manifest.
   *   * A {@link Canvas} _MAY_ have the `metadata` property with at least one item.
   *   * Clients _SHOULD_ render `metadata` on a Canvas.
   *   * Other types of resource _MAY_ have the `metadata` property with at least one item.
   *   * Clients _MAY_ render `metadata` on other types of resource.
   *
   *   Clients _SHOULD_ display the entries in the order provided. Clients _SHOULD_ expect to encounter long texts in the `value` property, and render them appropriately, such as with an expand button, or in a tabbed interface.
   */
  metadata: MetadataItem[];

  /**
   * Summary
   *
   * A short textual summary intended to be conveyed to the user when the `metadata` entries for the resource are not being displayed. This could be used as a brief description for item level search results, for small-screen environments, or as an alternative user interface when the `metadata` property is not currently being rendered. The `summary` property follows the same pattern as the `label` property described above.
   *
   * The value of the property _MUST_ be a JSON object, as described in the {@link InternationalString} section.
   *
   *   * A {@link Collection} _SHOULD_ have the `summary` property with at least one entry.
   *   * Clients _SHOULD_ render `summary` on a Collection.
   *   * A {@link Manifest} _SHOULD_ have the `summary` property with at least one entry.
   *   * Clients _SHOULD_ render `summary` on a Manifest.
   *   * A {@link Canvas} _MAY_ have the `summary` property with at least one entry.
   *   * Clients _SHOULD_ render `summary` on a Canvas.
   *   * Other types of resource _MAY_ have the `summary` property with at least one entry.
   *   * Clients _MAY_ render `summary` on other types of resource.
   */
  summary: InternationalString | null;

  /**
   * Required statement
   *
   * Text that _MUST_ be displayed when the resource is displayed or used. For example, the `requiredStatement` property could be used to present copyright or ownership statements, an acknowledgement of the owning and/or publishing institution, or any other text that the publishing organization deems critical to display to the user. Given the wide variation of potential client user interfaces, it will not always be possible to display this statement to the user in the client's initial state. If initially hidden, clients _MUST_ make the method of revealing it as obvious as possible.
   *
   *    The value of the property _MUST_ be a JSON object, that has the `label` and `value` properties, in the same way as a `metadata` property entry. The values of both `label` and `value` _MUST_ be JSON objects, as described in the [languages][prezi30-languages] section.
   *
   *    * Any resource type _MAY_ have the `requiredStatement` property.
   *    * Clients _MUST_ render `requiredStatement` on every resource type.
   */
  requiredStatement: MetadataItem | null;

  /**
   * A string that identifies a license or rights statement that applies to the content of the resource, such as the JSON of a Manifest or the pixels of an image. The value _MUST_ be drawn from the set of [Creative Commons][org-cc-licenses] license URIs, the [RightsStatements.org][org-rs-terms] rights statement URIs, or those added via the [extension][prezi30-ldce] mechanism. The inclusion of this property is informative, and for example could be used to display an icon representing the rights assertions.
   *
   * If displaying rights information directly to the user is the desired interaction, or a publisher-defined label is needed, then it is _RECOMMENDED_ to include the information using the `requiredStatement` property or in the `metadata` property.
   *
   * The value _MUST_ be a string. If the value is drawn from Creative Commons or RightsStatements.org, then the string _MUST_ be a URI defined by that specification.
   *
   *   * Any resource type _MAY_ have the `rights` property.
   *   * Clients _MAY_ render `rights` on any resource type.
   */
  rights: string | null;

  /**
   * Nav date
   *
   * A date that clients may use for navigation purposes when presenting the resource to the user in a date-based user interface, such as a calendar or timeline. More descriptive date ranges, intended for display directly to the user, _SHOULD_ be included in the `metadata` property for human consumption. If the resource contains Canvases that have the `duration` property, the datetime given corresponds to the navigation datetime of the start of the resource. For example, a Range that includes a Canvas that represents a set of video content recording a historical event, the `navDate` is the datetime of the first moment of the recorded event.
   *
   * The value _MUST_ be an XSD dateTime literal. The value _MUST_ have a timezone, and _SHOULD_ be given in UTC with the `Z` timezone indicator, but _MAY_ instead be given as an offset of the form `+hh:mm`.
   *
   *  * A {@link Collection} _MAY_ have the `navDate` property.
   *  * Clients _MAY_ render `navDate` on a Collection.
   *  * A {@link Manifest} _MAY_ have the `navDate` property.
   *  * Clients _MAY_ render `navDate` on a Manifest.
   *  * A {@link Range} _MAY_ have the `navDate` property.
   *  * Clients _MAY_ render `navDate` on a Range.
   *  * A {@link Canvas} _MAY_ have the `navDate` property.
   *  * Clients _MAY_ render `navDate` on a Canvas.
   *  * Other types of resource _MUST NOT_ have the `navDate` property.
   *  * Clients _SHOULD_ ignore `navDate` on other types of resource.
   */
  navDate: string | null;

  /**
   *  The language or languages used in the content of this external resource. This property is already available from the Web Annotation model for content resources that are the body or target of an Annotation, however it _MAY_ also be used for resources [referenced][prezi30-terminology] from `homepage`, `rendering`, and `partOf`.
   *
   *  The value _MUST_ be an array of strings. Each item in the array _MUST_ be a valid language code, as described in the [languages section][prezi30-languages].
   *
   *  * An external resource _SHOULD_ have the `language` property with at least one item.<br/>
   *  * Clients _SHOULD_ process the `language` of external resources.
   *  * Other types of resource _MUST NOT_ have the `language` property.<br/>
   *  * Clients _SHOULD_ ignore `language` on other types of resource.
   *
   */
  language: string[];

  /**
   * A content resource, such as a small image or short audio clip, that represents the resource that has the thumbnail property. A resource may have multiple thumbnail resources that have the same or different type and format.
   *
   * The value must be an array of JSON objects, each of which must have the id and type properties, and should have the format property. Images and videos should have the width and height properties, and time-based media should have the duration property. It is recommended that a IIIF Image API service be available for images to enable manipulations such as resizing.
   *
   *   * A {@link Collection} should have the thumbnail property with at least one item.
   *   * Clients should render thumbnail on a Collection.
   *   * A {@link Manifest} should have the thumbnail property with at least one item.
   *   * Clients should render thumbnail on a Manifest.
   *   * A {@link Canvas} may have the thumbnail property with at least one item. A Canvas should have the thumbnail property if there are multiple resources that make up the view.
   *   * Clients should render thumbnail on a Canvas.
   *   * A {@link ContentResource} may have the thumbnail property with at least one item. Content resources should have the thumbnail property with at least one item if it is an option in a Choice of resources.
   *   * Clients should render thumbnail on a content resource.
   *   * Other types of resource may have the thumbnail property with at least one item.
   *   * Clients may render thumbnail on other types of resource.
   */
  thumbnail: ContentResource[];

  /**
   * An organization or person that contributed to providing the content of the resource. Clients can then display this information to the user to acknowledge the provider’s contributions. This differs from the requiredStatement property, in that the data is structured, allowing the client to do more than just present text but instead have richer information about the people and organizations to use in different interfaces.
   *
   * The organization or person is represented as an Agent resource.
   *
   *   * Agents must have the id property, and its value must be a string. The string must be a URI that identifies the agent.
   *   * Agents must have the type property, and its value must be the string “Agent”.
   *   * Agents must have the label property, and its value must be a JSON object as described in the languages section.
   *   * Agents should have the homepage property, and its value must be an array of JSON objects as described in the homepage section.
   *   * Agents should have the logo property, and its value must be an array of JSON objects as described in the logo section.
   *   * Agents may have the seeAlso property, and its value must be an array of JSON object as described in the seeAlso section.
   *   * The value must be an array of JSON objects, where each item in the array conforms to the structure of an Agent, as described above.
   *
   * A Collection should have the provider property with at least one item.
   *   * Clients must render provider on a Collection.
   *   * A Manifest should have the provider property with at least one item.
   *   * Clients must render provider on a Manifest.
   *   * Other types of resource may have the provider property with at least one item.
   *   * Clients should render provider on other types of resource.
   */
  provider: ResourceProvider[];

  /**
   * A single Canvas that provides additional content for use before the main content of the resource that has the `placeholderCanvas` property is rendered, or as an advertisement or stand-in for that content. Examples include images, text and sound standing in for video content before the user initiates playback; or a film poster to attract user attention. The content provided by `placeholderCanvas` differs from a thumbnail: a client might use `thumbnail` to summarize and navigate multiple resources, then show content from `placeholderCanvas` as part of the initial presentation of a single resource. A placeholder Canvas is likely to have different dimensions to those of the Canvas(es) of the resource that has the `placeholderCanvas` property.
   *   *
   *   Clients _MAY_ display the content of a linked placeholder Canvas when presenting the resource. When more than one such Canvas is available, for example if `placeholderCanvas` is provided for the currently selected Range and the current Manifest, the client _SHOULD_ pick the one most specific to the content. Publishers _SHOULD NOT_ assume that the placeholder Canvas will be processed by all clients. Clients _SHOULD_ take care to avoid conflicts between time-based media in the rendered placeholder Canvas and the content of the resource that has the `placeholderCanvas` property.
   *
   *   The value _MUST_ be a JSON object with the `id` and `type` properties, and _MAY_ have other properties of Canvases. The value of `type` _MUST_ be the string `Canvas`. The object _MUST NOT_ have the `placeholderCanvas` property, nor the `accompanyingCanvas` property.
   *
   *   * A {@link Collection} _MAY_ have the `placeholderCanvas` property.
   *   * Clients _MAY_ render `placeholderCanvas` on a Collection.
   *   * A {@link Manifest} _MAY_ have the `placeholderCanvas` property.
   *   * Clients _MAY_ render `placeholderCanvas` on a Manifest.
   *   * A {@link Canvas} _MAY_ have the `placeholderCanvas` property.
   *   * Clients _MAY_ render `placeholderCanvas` on a Canvas.
   *   * A {@link Range} _MAY_ have the `placeholderCanvas` property.
   *   * Clients _MAY_ render `placeholderCanvas` on a Range.
   *   * Other types of resource _MUST NOT_ have the `placeholderCanvas` property.
   *   * Clients _SHOULD_ ignore `placeholderCanvas` on other types of resource.
   *
   */
  placeholderCanvas: Canvas;

  /**
   * A single Canvas that provides additional content for use while rendering the resource that has the `accompanyingCanvas` property. Examples include an image to show while a duration-only Canvas is playing audio; or background audio to play while a user is navigating an image-only Manifest.
   *
   *  Clients _MAY_ display the content of an accompanying Canvas when presenting the resource. As with `placeholderCanvas` above, when more than one accompanying Canvas is available, the client _SHOULD_ pick the one most specific to the content. Publishers _SHOULD NOT_ assume that the accompanying Canvas will be processed by all clients. Clients _SHOULD_ take care to avoid conflicts between time-based media in the accompanying Canvas and the content of the resource that has the `accompanyingCanvas` property.
   *
   *  The value _MUST_ be a JSON object with the `id` and `type` properties, and _MAY_ have other properties of Canvases. The value of `type` _MUST_ be the string `Canvas`. The object _MUST NOT_ have the `placeholderCanvas` property, nor the `accompanyingCanvas` property.
   *
   *  * A {@link Collection} _MAY_ have the `accompanyingCanvas` property.
   *  * Clients _MAY_ render `accompanyingCanvas` on a Collection.
   *  * A {@link Manifest} _MAY_ have the `accompanyingCanvas` property.
   *  * Clients _MAY_ render `accompanyingCanvas` on a Manifest.
   *  * A {@link Canvas} _MAY_ have the `accompanyingCanvas` property.
   *  * Clients _MAY_ render `accompanyingCanvas` on a Canvas.
   *  * A {@link Range} _MAY_ have the `accompanyingCanvas` property.
   *  * Clients _MAY_ render `accompanyingCanvas` on a Range.
   *  * Other types of resource _MUST NOT_ have the `accompanyingCanvas` property.
   *  * Clients _SHOULD_ ignore `accompanyingCanvas` on other types of resource.
   */
  accompanyingCanvas: Canvas;
};
