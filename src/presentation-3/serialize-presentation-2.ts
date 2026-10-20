import { SerializeConfig } from "./serialize";
import type {
  FragmentSelector,
  InternationalString,
  Reference,
  Selector,
  SpecificResource,
  TechnicalProperties,
} from "./types";
import type { DescriptiveNormalized, LinkingNormalized } from "../presentation-3-normalized/types";
import type * as Presentation2 from "../presentation-2/types";
import { compressSpecificResource } from "../shared/compress-specific-resource";
import { IS_EXTERNAL } from "./utilities";

export function languageString2to3(
  value: InternationalString | null | undefined
): Presentation2.LanguageProperty | Presentation2.LanguageProperty[] | undefined {
  if (!value) {
    return undefined;
  }

  const languages = Object.keys(value);

  if (languages.length === 0) {
    return undefined;
  }

  // If there is only one, then return it as a string.
  if (languages.length === 1) {
    const language = languages[0];
    if (!language) {
      return "";
    }

    const singleValue = (value[language] || []).join("");

    if (language === "@none" || language === "none" || language === "en") {
      return singleValue;
    }

    return {
      "@language": language,
      "@value": singleValue,
    };
  }

  return languages.map((language) => {
    return {
      "@language": language,
      "@value": (value[language] || []).join(""),
    };
  });
}

function parseCanvasTarget(target: any): any {
  if (!target) return undefined;
  if (Array.isArray(target)) {
    return target.map((t) => parseCanvasTarget(t));
  }

  if (typeof target === "string") {
    return target;
  }

  if (target.type && target.type === "Canvas") {
    return target.id;
  }

  if (target.type === "SpecificResource") {
    const source = typeof target.source === "string" ? target.source : target.source.id;
    if (!target.selector) return source;
    if (target.selector.type === "FragmentSelector" && !target.styleClass) {
      return `${source}#${target.selector.value}`;
    }
    return {
      "@type": "oa:SpecificResource",
      full: source,
      selector: selectorToPresentation2(target.selector),
      ...(target.styleClass ? { style: target.styleClass } : {}),
    };
  }

  if (target.items) return target.items.map(parseCanvasTarget);

  return target;
}

function selectorToPresentation2(selector: any): any {
  if (Array.isArray(selector)) {
    return {
      "@type": "oa:Choice",
      default: selectorToPresentation2(selector[0]),
      item: selector.slice(1).map(selectorToPresentation2),
    };
  }
  if (selector.type === "SvgSelector") return { "@type": "oa:SvgSelector", chars: selector.value };
  if (selector.type === "ImageApiSelector") {
    const { type: _type, ...parameters } = selector;
    return {
      "@context": "http://iiif.io/api/annex/openannotation/context.json",
      "@type": "iiif:ImageApiSelector",
      ...parameters,
    };
  }
  const { type, ...properties } = selector;
  return { "@type": `oa:${type}`, ...properties };
}

function unNestArray<T>(oneOrArray: T[] | undefined, onlyOne = false): T | T[] | undefined {
  if (!oneOrArray) {
    return undefined;
  }

  if (oneOrArray.length > 1 && !onlyOne) {
    return oneOrArray;
  }
  return oneOrArray[0] || undefined;
}

function convertService(service: any) {
  if (!service) {
    return undefined;
  }

  if (typeof service === "string") {
    return {
      "@id": service,
    };
  }

  if ("@id" in service) {
    const newService = { ...service };
    delete newService["@type"];
    return newService;
  }

  // @todo support auth.
  return {
    "@context": "http://iiif.io/api/image/2/context.json",
    "@id": service.id,
    profile: `http://iiif.io/api/image/2/profiles/${service.profile}.json`,
  };
}

function technicalProperties(props: Partial<TechnicalProperties>, type?: string) {
  return [
    ["@id", props.id?.startsWith("vault://") ? undefined : props.id],
    ["@type", type],
    ["format", props.format],
    ["height", props.height],
    ["width", props.width],
    ["viewingDirection", props.viewingDirection !== "left-to-right" ? props.viewingDirection : undefined],

    // Non-standard property.
    ["license", (props as any).license ? (props as any).license : undefined],
    // @todo Viewing hint is merged with behavior
    // ['viewingHint', props.]
  ];
}

function* descriptiveProperties(prop: Partial<DescriptiveNormalized>): Generator<any, any, any> {
  const provider = prop.provider ? yield prop.provider[0] : undefined;

  return [
    ["label", languageString2to3(prop.label)],
    [
      "metadata",
      prop.metadata && prop.metadata.length
        ? prop.metadata.map((item) => ({
            label: languageString2to3(item.label) || "",
            value: languageString2to3(item.value) || "",
          }))
        : undefined,
    ],
    ["description", languageString2to3(prop.summary)],
    ["thumbnail", unNestArray(yield prop.thumbnail)],
    ["navDate", prop.navDate],
    // @todo these needs consideration if the way provider is parsed changes.
    ["logo", provider ? unNestArray(provider.logo) : undefined],
    ["homepage", provider ? provider.homepage : undefined],
    ["attribution", prop.requiredStatement ? languageString2to3(prop.requiredStatement.value) : undefined],
  ];
}

function* linkingProperties(prop: Partial<LinkingNormalized>) {
  const startProp =
    prop.start && prop.start.type && (prop.start as any).type === "SpecificResource"
      ? compressSpecificResource(prop.start as any)
      : prop.start;

  return [
    ["seeAlso", unNestArray(yield prop.seeAlso)],
    // @todo support more services (like auth)
    ["service", unNestArray((prop.service || []).map(convertService))],
    ["rendering", unNestArray(yield prop.rendering)],
    // @todo part of to within
    // ['within', unNestArray(yield prop.partOf)],
    // @todo this may not work completely.
    ["startCanvas", startProp ? startProp.id : undefined],
  ];
}

function isSpecificResource(resource: unknown): resource is SpecificResource {
  return (resource as any).type === "SpecificResource";
}
function isFragmentSelector(resource: unknown): resource is FragmentSelector {
  return (resource as any) && (resource as any).type === "FragmentSelector";
}

function specificResourceToString(resource: Reference<any> | SpecificResource) {
  if (resource && isSpecificResource(resource)) {
    let id = typeof resource.source === "string" ? resource.source : resource.source.id;
    const selector: Selector | undefined = resource.selector
      ? Array.isArray(resource.selector)
        ? resource.selector[0]
        : resource.selector
      : undefined;

    if (isFragmentSelector(selector)) {
      id += "#" + selector.value;
    }
    return id;
  }
  return resource?.id;
}

export const serializeConfigPresentation2: SerializeConfig = {
  Manifest: function* (entity, state, { isTopLevel }) {
    if (!isTopLevel) {
      return [...technicalProperties(entity, "sc:Manifest"), ...(yield* descriptiveProperties(entity))];
    }
    return [
      ...(isTopLevel ? [["@context", "http://iiif.io/api/presentation/2/context.json"]] : []),
      ...technicalProperties(entity, "sc:Manifest"),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      // Structural.
      // @todo structures
      [
        "sequences",
        [
          {
            "@id": `${entity.id}/sequence0`,
            "@type": "sc:Sequence",
            canvases: yield entity.items,
          },
        ],
      ],
      ["structures", yield entity.structures],
    ];
  },

  Canvas: function* (entity) {
    const paintingPage = yield entity.items;
    const resources = paintingPage.flatMap((page: any) => page.resources || []);
    return [
      // Items.
      ...technicalProperties(entity, "sc:Canvas"),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ["images", resources.length ? resources : undefined],
      [
        // @todo use otherContent if they are inlined
        "otherContent",
        entity.annotations && entity.annotations.length ? yield entity.annotations : undefined,
      ],
    ];
  },

  AnnotationPage: function* (entity, state, { isTopLevel }) {
    return [
      ...(isTopLevel ? [["@context", "http://iiif.io/api/presentation/2/context.json"]] : []),
      ...technicalProperties(entity, "sc:AnnotationList"),
      ...(yield* descriptiveProperties(entity)),
      ["resources", (entity as any)[IS_EXTERNAL] ? undefined : yield entity.items],
    ];
  },

  Annotation: function* (entity, state, { isTopLevel }) {
    const bodies = [];
    const annotationBodies = (Array.isArray(entity.body) ? entity.body : entity.body ? [entity.body] : []) as any[];
    for (const body of annotationBodies) {
      if (isSpecificResource(body)) {
        bodies.push({
          "@type": "oa:SpecificResource",
          full: yield body.source,
          ...(body.selector ? { selector: selectorToPresentation2(body.selector) } : {}),
          ...(body.styleClass ? { style: body.styleClass } : {}),
        });
      } else {
        bodies.push(yield body);
      }
    }
    const motivations = (
      Array.isArray(entity.motivation) ? entity.motivation : entity.motivation ? [entity.motivation] : []
    ).map((motivation) =>
      motivation.includes(":") ? motivation : `${motivation === "painting" ? "sc" : "oa"}:${motivation}`
    );
    return [
      ...(isTopLevel ? [["@context", "http://iiif.io/api/presentation/2/context.json"]] : []),
      ...technicalProperties(entity as any, "oa:Annotation"),
      ...(yield* descriptiveProperties(entity as any)),
      ...(yield* linkingProperties(entity)),
      ["motivation", unNestArray(motivations)],
      ["on", parseCanvasTarget(entity.target)],
      ["resource", unNestArray(bodies)],
    ];
  },

  ContentResource: function* (entity: any) {
    switch (entity.type) {
      case "TextualBody":
        return [
          ...technicalProperties(entity, "cnt:ContentAsText"),
          ["chars", entity.value ?? entity.chars],
          ["language", entity.language],
          ...(yield* descriptiveProperties(entity)),
        ];
      case "Choice": {
        const items = yield entity.items;
        return [...technicalProperties(entity, "oa:Choice"), ["default", items[0]], ["item", items.slice(1)]];
      }
      case "Image":
        return [
          // Image properties.
          ...technicalProperties(entity, "dctypes:Image"),
          ...(yield* descriptiveProperties(entity)),
          ...(yield* linkingProperties(entity)),
        ];
      case "Text":
      case "Dataset":
      case "Sound":
      case "Video":
      default:
        return [
          ...technicalProperties(
            entity,
            entity.type === "Sound" ? "dctypes:Sound" : entity.type === "Video" ? "dctypes:MovingImage" : undefined
          ),
          ["chars", entity.chars ?? entity.value],
          ...(yield* descriptiveProperties(entity)),
        ];
    }
  },

  AnnotationCollection: function* (entity) {
    return [
      // @todo expand properties if they are actually used.
      ["@id", entity.id],
      ["@type", "sc:Layer"],
      ["label", languageString2to3(entity.label)],
    ];
  },

  Collection: function* (entity, state, { isTopLevel }) {
    return [
      ...(isTopLevel ? [["@context", "http://iiif.io/api/presentation/2/context.json"]] : []),
      ...technicalProperties(entity, "sc:Collection"),
      ...["first", "last", "prev", "next"].map((key) => [key, (entity as any)[key]?.id || (entity as any)[key]]),
      ["total", (entity as any).total],
      ["startIndex", (entity as any).startIndex],
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ["members", isTopLevel ? yield entity.items : undefined],
    ];
  },

  Range: function* (entity) {
    const members = [];
    const canvases = [];

    if (entity.items) {
      for (const _item of entity.items) {
        const item = _item.type === "SpecificResource" ? _item.source : _item;
        if (item) {
          const canvas = yield item;
          members.push({
            "@id": specificResourceToString(_item),
            "@type": `sc:${item.type}`,
            label: canvas ? canvas.label : undefined,
            within: entity.id,
          });
          if (item.type === "Canvas") {
            canvases.push(specificResourceToString(_item));
          }
        }
      }
    }

    return [
      ...technicalProperties(entity, "sc:Range"),
      ...(yield* descriptiveProperties(entity)),
      ...(yield* linkingProperties(entity)),
      ["canvases", canvases.length === members.length ? canvases : undefined],
      ["members", canvases.length !== members.length ? members : undefined],
    ];
  },
};
