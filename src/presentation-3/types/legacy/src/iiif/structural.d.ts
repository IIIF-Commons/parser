import { AnnotationPage } from '../resources/annotationPage';
import { Range } from '../resources/range';

/**
 * These properties define the structure of the object being represented in IIIF by allowing the inclusion of child
 * resources within parents, such as a Canvas within a Manifest, or a Manifest within a Collection. The majority of
 * cases use items, however there are two special cases for different sorts of structures.
 */
export type StructuralProperties<T> = {
  /**
   * Much of the functionality of the IIIF Presentation API is simply recording the order in which child resources
   * occur within a parent resource, such as Collections or Manifests within a parent Collection, or Canvases within
   * a Manifest. All of these situations are covered with a single property, items.
   *
   * The value must be an array of JSON objects. Each item must have the id and type properties. The items will be
   * resources of different types, as described below.
   *
   *   * A Collection must have the items property. Each item must be either a Collection or a Manifest.
   *   * Clients must process items on a Collection.
   *   * A Manifest must have the items property with at least one item. Each item must be a Canvas.
   *   * Clients must process items on a Manifest.
   *   * A Canvas should have the items property with at least one item. Each item must be an Annotation Page.
   *   * Clients must process items on a Canvas.
   *   * An Annotation Page should have the items property with at least one item. Each item must be an Annotation.
   *   * Clients must process items on an Annotation Page.
   *   * A Range must have the items property with at least one item. Each item must be a Range, a Canvas or a Specific Resource where the source is a Canvas.
   *   * Clients should process items on a Range.
   *   * Other types of resource must not have the items property.
   *   * Clients should ignore items on other types of resource.
   */
  items: T[];

  /**
   * An ordered list of Annotation Pages that contain commentary or other Annotations about this resource, separate
   * from the Annotations that are used to paint content on to a Canvas. The motivation of the Annotations must not
   * be painting, and the target of the Annotations must include this resource or part of it.
   *
   * The value must be an array of JSON objects. Each item must have at least the id and type properties.
   *
   *   * A Collection may have the annotations property with at least one item.
   *   * Clients should process annotations on a Collection.
   *   * A Manifest may have the annotations property with at least one item.
   *   * Clients should process annotations on a Manifest,.
   *   * A Canvas may have the annotations property with at least one item.
   *   * Clients should process annotations on a Canvas.
   *   * A Range may have the annotations property with at least one item.
   *   * Clients should process annotations on a Range.
   *   * A content resource may have the annotations property with at least one item.
   *   * Clients should process annotations on a content resource.
   *   * Other types of resource must not have the annotations property.
   *   * Clients should ignore annotations on other types of resource.
   */
  annotations: AnnotationPage[];

  /**
   * The structure of an object represented as a Manifest can be described using a hierarchy of Ranges. Ranges can be
   * used to describe the “table of contents” of the object or other structures that the user can interact with beyond
   * the order given by the items property of the Manifest. The hierarchy is built by nesting the child Range resources
   * in the items array of the higher level Range. The top level Ranges of these hierarchies are given in the
   * structures property.
   *
   * The value must be an array of JSON objects. Each item must have the id and type properties, and the type must be
   * Range.
   *
   *  * A Manifest may have the structures property.
   *  * Clients should process structures on a Manifest. The first hierarchy should be presented to the user by default, and further hierarchies should be able to be selected as alternative structures by the user.
   *  * Other types of resource must not have the structures property.
   *  * Clients should ignore structures on other types of resource.
   */
  structures: Range[];
};
