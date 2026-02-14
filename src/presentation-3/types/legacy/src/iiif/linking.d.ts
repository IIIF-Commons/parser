import { ContentResource } from '../resources/contentResource';
import { Service } from '../resources/service';
import { Canvas } from '../resources/canvas';
import { AnnotationCollection } from '../resources/annotationCollection';
import { Reference } from '../reference';

export type LinkingProperties = {
  /**
   * A machine-readable resource such as an XML or RDF description that is related to the current resource that has the
   * seeAlso property. Properties of the resource should be given to help the client select between multiple
   * descriptions (if provided), and to make appropriate use of the document. If the relationship between the resource
   * and the document needs to be more specific, then the document should include that relationship rather than the
   * IIIF resource. Other IIIF resources are also valid targets for seeAlso, for example to link to a Manifest that
   * describes a related object. The URI of the document must identify a single representation of the data in a
   * particular format. For example, if the same data exists in JSON and XML, then separate resources should be added
   * for each representation, with distinct id and format properties.
   *
   *
   * The value must be an array of JSON objects. Each item must have the id and type properties, and should have the
   * label, format and profile properties.
   *
   *
   *   * Any resource type may have the seeAlso property with at least one item.
   *  *  Clients may process seeAlso on any resource type.
   */
  seeAlso: ContentResource[];

  /**
   * A service that the client might interact with directly and gain additional information or functionality for using
   * the resource that has the service property, such as from an Image to the base URI of an associated IIIF Image API
   * service. The service resource should have additional information associated with it in order to allow the client
   * to determine how to make appropriate use of it. Please see the Service Registry document for the details of
   * currently known service types.
   *
   *
   * The value must be an array of JSON objects. Each object will have properties depending on the service’s definition,
   * but must have either the id or @id and type or @type properties. Each object should have a profile property.
   *
   *
   * Any resource type may have the service property with at least one item.
   * Clients may process service on any resource type, and should process the IIIF Image API service.
   *
   *
   * Implementations should be prepared to recognize the @id and @type property names used by older specifications, as
   * well as id and type. Note that the @context key should not be present within the service, but instead included at
   * the beginning of the document. The example below includes both version 2 and version 3 IIIF Image API services.
   */
  service: Service[];

  /**
   * A list of one or more service definitions on the top-most resource of the document, that are typically shared by
   * more than one subsequent resource. This allows for these shared services to be collected together in a single
   * place, rather than either having their information duplicated potentially many times throughout the document,
   * or requiring a consuming client to traverse the entire document structure to find the information. The resource
   * that the service applies to must still have the service property, as described above, where the service resources
   * have at least the id and type or @id and @type properties. This allows the client to know that the service applies
   * to that resource. Usage of the services property is at the discretion of the publishing system.
   *
   *
   * A client encountering a service property where the definition consists only of an id and type should then check
   * the services property on the top-most resource for an expanded definition. If the service is not present in the
   * services list, and the client requires more information in order to use the service, then it should dereference
   * the id (or @id) of the service in order to retrieve a service description.
   *
   *
   * The value must be an array of JSON objects. Each object must a service resource, as described above.
   *
   *
   * A Collection may have the services property, if it is the topmost Collection in a response document.
   * Clients should process services on a Collection.
   * A Manifest may have the services property.
   * Clients should process services on a Manifest.
   */
  services: Service[];

  /**
   * A resource that is an alternative, non-IIIF representation of the resource that has the rendering property. Such
   * representations typically cannot be painted onto a single Canvas, as they either include too many views, have
   * incompatible dimensions, or are compound resources requiring additional rendering functionality. The rendering
   * resource must be able to be displayed directly to a human user, although the presentation may be outside of the
   * IIIF client. The resource must not have a splash page or other interstitial resource that mediates access to it.
   * If access control is required, then the IIIF Authentication API is recommended. Examples include a rendering of a
   * book as a PDF or EPUB, a slide deck with images of a building, or a 3D model of a statue.
   *
   *
   * The value must be an array of JSON objects. Each item must have the id, type and label properties, and should
   * have a format property.
   *
   *
   *   * Any resource type may have the rendering property with at least one item.
   *   * Clients should render rendering on a Collection, Manifest or Canvas, and may render rendering on other types of resource.
   */
  rendering: ContentResource[];

  /**
   * A containing resource that includes the resource that has the partOf property. When a client encounters the partOf
   * property, it might retrieve the referenced containing resource, if it is not embedded in the current
   * representation, in order to contribute to the processing of the contained resource. For example, the partOf
   * property on a Canvas can be used to reference an external Manifest in order to enable the discovery of further
   * relevant information. Similarly, a Manifest can reference a containing Collection using partOf to aid in
   * navigation.
   *
   *
   * The value must be an array of JSON objects. Each item must have the id and type properties, and should have the
   * label property.
   *
   *   * Any resource type may have the partOf property with at least one item
   *   * Clients may render partOf on any resource type.
   */
  partOf: Array<ContentResource | Canvas | AnnotationCollection | Reference<'Manifest'> | Reference<'Collection'>>;

  /**
   * A Canvas, or part of a Canvas, which the client should show on initialization for the resource that has the start
   * property. The reference to part of a Canvas is handled in the same way that Ranges reference parts of Canvases.
   * This property allows the client to begin with the first Canvas that contains interesting content rather than
   * requiring the user to manually navigate to find it.
   *
   *
   * The value must be a JSON object, which must have the id and type properties. The object must be either a Canvas
   * (as in the first example below), or a Specific Resource with a Selector and a source property where the value is
   * a Canvas (as in the second example below).
   *
   *   * A Manifest may have the start property.
   *   * Clients should process start on a Manifest.
   *   * A Range may have the start property.
   *   * Clients should process start on a Range.
   *   * Other types of resource must not have the start property.
   *   * Clients should ignore start on other types of resource.
   */
  start: Canvas | Partial<Canvas> | null;

  /**
   * A link from this Range to an Annotation Collection that includes the supplementing Annotations of content
   * resources for the Range. Clients might use this to present additional content to the user from a different
   * Canvas when interacting with the Range, or to jump to the next part of the Range within the same Canvas. For
   * example, the Range might represent a newspaper article that spans non-sequential pages, and then uses the
   * supplementary property to reference an Annotation Collection that consists of the Annotations that record the
   * text, split into Annotation Pages per newspaper page. Alternatively, the Range might represent the parts of a
   * manuscript that have been transcribed or translated, when there are other parts that have yet to be worked on.
   * The Annotation Collection would be the Annotations that transcribe or translate, respectively.
   *
   *
   * The value must be a JSON object, which must have the id and type properties, and the type must be
   * {@link AnnotationCollection}.
   *
   *
   *   * A Range may have the supplementary property.
   *   * Clients may process supplementary on a Range.
   *   * Other types of resource must not have the supplementary property.
   *   * Clients should ignore supplementary on other types of resource.
   */
  supplementary: ContentResource[];
  /**
   * @deprecated since 3.0-beta - use provider.logo
   */
  logo: ContentResource[];

  /**
   * A web page that is about the object represented by the resource that has the homepage property. The web page is
   * usually published by the organization responsible for the object, and might be generated by a content management
   * system or other cataloging system. The resource must be able to be displayed directly to the user. Resources that
   * are related, but not home pages, must instead be added into the metadata property, with an appropriate label or
   * value to describe the relationship.
   *
   *
   * The value of this property must be an array of JSON objects, each of which must have the id, type, and label
   * properties, should have a format property, and may have the language property.
   *
   *
   *   * Any resource type may have the homepage property.
   *   * Clients should render homepage on a Collection, Manifest or Canvas, and may render homepage on other types of resource.
   */
  homepage: ContentResource[];
};
