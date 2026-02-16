import { describe, expect, test } from 'vitest';
import type { Manifest as Manifest4 } from '../../src/presentation-4/types';

// Generated from fixtures/presentation-4 and fixtures/cookbook-v4 to preserve literal discriminants.
const manifestsByFixture = {
  fixtures_cookbook_v4_0001_mvm_image_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://preview.iiif.io/cookbook/v4/recipe/0001-mvm-image/v4/manifest.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Simplest Image Example (IIIF Presentation v4)"
        ]
      },
      "items": [
        {
          "id": "https://preview.iiif.io/cookbook/v4/recipe/0001-mvm-image/v4/canvas/p1",
          "type": "Canvas",
          "height": 1800,
          "width": 1200,
          "items": [
            {
              "id": "https://preview.iiif.io/cookbook/v4/recipe/0001-mvm-image/v4/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://preview.iiif.io/cookbook/v4/recipe/0001-mvm-image/v4/annotation/p0001-image",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": [
                    {
                      "id": "http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png",
                      "type": "Image",
                      "format": "image/png",
                      "height": 1800,
                      "width": 1200
                    }
                  ],
                  "target": [
                    {
                      "id": "https://preview.iiif.io/cookbook/v4/recipe/0001-mvm-image/v4/canvas/p1",
                      "type": "Canvas"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_cookbook_v4_0002_mvm_audio_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://preview.iiif.io/cookbook/v4/recipe/0002-mvm-audio/v4/manifest.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Simplest Audio Example (IIIF Presentation v4)"
        ]
      },
      "items": [
        {
          "id": "https://preview.iiif.io/cookbook/v4/recipe/0002-mvm-audio/v4/timeline",
          "type": "Timeline",
          "duration": 1985.024,
          "items": [
            {
              "id": "https://preview.iiif.io/cookbook/v4/recipe/0002-mvm-audio/v4/timeline/page",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://preview.iiif.io/cookbook/v4/recipe/0002-mvm-audio/v4/timeline/page/annotation",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": [
                    {
                      "id": "https://fixtures.iiif.io/audio/indiana/mahler-symphony-3/CD1/medium/128Kbps.mp4",
                      "type": "Sound",
                      "format": "audio/mp4",
                      "duration": 1985.024
                    }
                  ],
                  "target": [
                    {
                      "id": "https://preview.iiif.io/cookbook/v4/recipe/0002-mvm-audio/v4/timeline",
                      "type": "Timeline"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_cookbook_v4_0003_mvm_video_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://preview.iiif.io/cookbook/v4/recipe/0003-mvm-video/v4/manifest.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Simplest Video Example (IIIF Presentation 4)"
        ]
      },
      "items": [
        {
          "id": "https://preview.iiif.io/cookbook/v4/recipe/0003-mvm-video/v4/canvas",
          "type": "Canvas",
          "height": 360,
          "width": 480,
          "duration": 572.034,
          "items": [
            {
              "id": "https://preview.iiif.io/cookbook/v4/recipe/0003-mvm-video/v4/canvas/page",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://preview.iiif.io/cookbook/v4/recipe/0003-mvm-video/v4/canvas/page/annotation",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": [
                    {
                      "id": "https://fixtures.iiif.io/video/indiana/lunchroom_manners/high/lunchroom_manners_1024kb.mp4",
                      "type": "Video",
                      "height": 360,
                      "width": 480,
                      "duration": 572.034,
                      "format": "video/mp4"
                    }
                  ],
                  "target": [
                    {
                      "id": "https://preview.iiif.io/cookbook/v4/recipe/0003-mvm-video/v4/canvas",
                      "type": "Canvas"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_cookbook_v4_0608_mvm_3d_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://preview.iiif.io/cookbook/v4/recipe/0608-mvm-3d/v4/manifest.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Simplest Model Example (IIIF Presentation v4)"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin and then add default lighting and camera"
        ]
      },
      "items": [
        {
          "id": "https://preview.iiif.io/cookbook/v4/recipe/0608-mvm-3d/v4/scene/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://preview.iiif.io/cookbook/v4/recipe/0608-mvm-3d/v4/scene/1/annotationPage/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://preview.iiif.io/cookbook/v4/recipe/0608-mvm-3d/v4/scene/1/annotationPage/1/anno/1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": [
                    {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    }
                  ],
                  "target": [
                    {
                      "id": "https://preview.iiif.io/cookbook/v4/recipe/0608-mvm-3d/v4/scene/1",
                      "type": "Scene"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_01_model_in_scene_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Single Model"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin, and then viewer should add default lighting and camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_02_model_with_background_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Single Model with background color"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the origin, with a background color of purple, and then viewer should add default lighting and camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "backgroundColor": "#FF00FE",
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_03_perspective_camera_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Model with Explicit Perspective Camera"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin, and the camera at the scene origin facing -Z, then add default lighting"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Scene with Model and Camera"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/3d/cameras/1",
                    "type": "PerspectiveCamera",
                    "label": {
                      "en": [
                        "Perspective Camera 1"
                      ]
                    }
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_04_perpsective_camera_with_annotation_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Model with Explicit Perspective Camera Looking at an Annotation"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin with a perspective camera looking in the direction of the Model Annotation, and add default lighting"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Scene with Model and Camera"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/3d/cameras/1",
                    "type": "PerspectiveCamera",
                    "label": {
                      "en": [
                        "Perspective Camera 1"
                      ]
                    },
                    "lookAt": {
                      "id": "https://example.org/iiif/3d/anno1",
                      "type": "Annotation"
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 3,
                        "z": -10
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_05_perspective_camerea_with_point_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Model with Explicit Perspective Camera Looking at a Point"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin with a perspective camera looking toward the PointSelector coordinates, and add default lighting"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Scene with a Model and Camera Looking at a Point"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/3d/cameras/1",
                    "type": "PerspectiveCamera",
                    "label": {
                      "en": [
                        "Perspective Camera 1"
                      ]
                    },
                    "lookAt": {
                      "type": "PointSelector",
                      "x": 2,
                      "y": 1,
                      "z": 0
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 3,
                        "z": -10
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_06_perspective_camera_with_choice_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/choice_of_cameras.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Choice of cameras WARNING use of Choice"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin with two cameras, a perspective camera with field of view 50, and an orthographic camera, and add default lighting. The viewer defaults to the perspective camera but should offer the option to switch to the orthographic camera."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/choice",
                  "type": "Choice",
                  "items": [
                    {
                      "id": "https://example.org/iiif/3d/anno2",
                      "type": "Annotation",
                      "motivation": [
                        "painting"
                      ],
                      "body": {
                        "id": "https://example.org/iiif/3d/cameras/1",
                        "type": "PerspectiveCamera",
                        "fieldOfView": 50,
                        "label": {
                          "en": [
                            "Perspective Camera 1"
                          ]
                        },
                        "lookAt": {
                          "type": "PointSelector",
                          "x": 2,
                          "y": 1,
                          "z": 0
                        }
                      },
                      "target": {
                        "type": "SpecificResource",
                        "source": {
                          "id": "https://example.org/iiif/scene1/page/p1/1",
                          "type": "Scene"
                        },
                        "selector": [
                          {
                            "type": "PointSelector",
                            "x": 0,
                            "y": 3,
                            "z": -10
                          }
                        ]
                      }
                    },
                    {
                      "id": "https://example.org/iiif/3d/anno3",
                      "type": "Annotation",
                      "motivation": [
                        "painting"
                      ],
                      "body": {
                        "id": "https://example.org/iiif/3d/cameras/2",
                        "type": "OrthographicCamera",
                        "label": {
                          "en": [
                            "Orthographic Camera 1"
                          ]
                        },
                        "lookAt": {
                          "type": "PointSelector",
                          "x": 2,
                          "y": 1,
                          "z": 0
                        }
                      },
                      "target": {
                        "type": "SpecificResource",
                        "source": {
                          "id": "https://example.org/iiif/scene1/page/p1/1",
                          "type": "Scene"
                        },
                        "selector": [
                          {
                            "type": "PointSelector",
                            "x": 0,
                            "y": 3,
                            "z": -10
                          }
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_07_orthographic_camera_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/orthographic_camera.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Orthographic Camera"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin and an Orthographic camera looking at the model, and add default lighting."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/3d/cameras/2",
                    "type": "OrthographicCamera",
                    "label": {
                      "en": [
                        "Orthographic Camera 1"
                      ]
                    },
                    "lookAt": {
                      "type": "Annotation",
                      "id": "https://example.org/iiif/3d/anno1"
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 3,
                        "z": -10
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_08_ambient_light_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Model with Green AmbientLight"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin with green AmbientLight, and add default camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Scene with Model and AmbientLight"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/3d/cameras/1",
                    "type": "AmbientLight",
                    "label": {
                      "en": [
                        "Ambient Green Light"
                      ]
                    },
                    "color": "#00FF00",
                    "intensity": {
                      "type": "Value",
                      "value": 0.5,
                      "unit": "relative"
                    }
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_09_directional_light_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Model with DirectionalLight"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin with a DirectionalLight positioned at the point in the Scene defined by the PointSelector and facing the the Model, then add default camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Scene with Model and DirectionalLight"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/3d/lights/1",
                    "type": "DirectionalLight",
                    "label": {
                      "en": [
                        "Directional Light 1"
                      ]
                    },
                    "lookAt": {
                      "id": "https://example.org/iiif/3d/anno1",
                      "type": "Annotation"
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 3,
                        "z": 10
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_10_directional_light_rotated_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Model with Rotated DirectionalLight"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin with a DirectionalLight rotated 30 degrees on the x axis, then add default camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Scene with Model and Rotated DirectionalLight"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/lights/1",
                      "type": "DirectionalLight",
                      "label": {
                        "en": [
                          "Directional Light 1"
                        ]
                      }
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": 30,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "id": "https://example.org/iiif/scene1/page/p1/1",
                    "type": "Scene"
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_11_multiple_lights_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Multiple lights with intensities and colors."
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin, and then viewer should add one red spotlight pointing at the front of the helmet, one blue spotlight point at the front-center of the model, and an ambient green light source. The viewer should add a default camera but NOT any other lighting."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Model with Two Spotlights and an Ambient light"
            ]
          },
          "backgroundColor": "#33404d",
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/lights/1",
                      "type": "SpotLight",
                      "label": {
                        "en": [
                          "Red Spot Light"
                        ]
                      },
                      "color": "#ff0000",
                      "intensity": {
                        "type": "Value",
                        "value": 100,
                        "unit": "relative"
                      },
                      "angle": 5
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": 90,
                        "y": 0,
                        "z": 0
                      },
                      {
                        "type": "TranslateTransform",
                        "x": 0,
                        "y": 3.5,
                        "z": 3.5
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    }
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/lights/1",
                      "type": "AmbientLight",
                      "label": {
                        "en": [
                          "Green Ambient Light"
                        ]
                      },
                      "color": "#7aff40",
                      "intensity": {
                        "type": "Value",
                        "value": 0.5,
                        "unit": "relative"
                      }
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    }
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/lights/1",
                      "type": "SpotLight",
                      "label": {
                        "en": [
                          "Blue Spot Light"
                        ]
                      },
                      "color": "#0f00ff",
                      "intensity": {
                        "type": "Value",
                        "value": 10,
                        "unit": "relative"
                      },
                      "angle": 5
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": 90,
                        "y": 0,
                        "z": 0
                      },
                      {
                        "type": "TranslateTransform",
                        "x": 0,
                        "y": 2.5,
                        "z": 3.5
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    }
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno4",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "label": {
                        "en": [
                          "Astronaut"
                        ]
                      },
                      "format": "model/gltf-binary"
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_12_mode_position_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Single Positioned Model"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at (-1,0,1), and then viewer should add default lighting and camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -1,
                        "y": 0,
                        "z": 1
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_13_mirrored_model_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_transform_negative_scale_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Model shown normally and mirrored"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model twice, once at normal scale and once at normal scale but mirrored. Then the viewer should add default lighting and camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    },
                    "transform": [
                      {
                        "type": "ScaleTransform",
                        "x": -1,
                        "y": 1,
                        "z": 1
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_14_rotated_model_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_transform_rotate_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Rotated Model"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model rotated by 180 degrees around the Y axis"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": 0,
                        "y": 180,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_15_rotated_translated_model_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_transform_rotate_translate_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Rotated Translated Model"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model after rotating by 180 degrees around the Y axis, then translating 1 in X, resulting in him being at 1 in X"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": 0,
                        "y": 180,
                        "z": 0
                      },
                      {
                        "type": "TranslateTransform",
                        "x": 1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_16_rotated_translated_models_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_transform_scale_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Scaled, Translated Model with original for comparison"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model twice, once at normal scale and once at double scale after moving in the local coordinate space, and then the viewer should add default lighting and camera. Thus the model will end up at (5,4,4) due to doubling the scale of the local coordinate space."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    },
                    "transform": [
                      {
                        "type": "TranslateTransform",
                        "x": 2,
                        "y": 2,
                        "z": 2
                      },
                      {
                        "type": "ScaleTransform",
                        "x": 2,
                        "y": 2,
                        "z": 2
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_17_rotated_scaled_models_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_transform_scale_translate_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Scaled, Translated Model with original for comparison"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model twice, once at normal scale and once at double scale after moving in the local coordinate space, and then the viewer should add default lighting and camera. Thus the model will end up at (3,2,2) due to doubling the scale of the local coordinate space."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    },
                    "transform": [
                      {
                        "type": "ScaleTransform",
                        "x": 2,
                        "y": 2,
                        "z": 2
                      },
                      {
                        "type": "TranslateTransform",
                        "x": 2,
                        "y": 2,
                        "z": 2
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_18_translated_rotated_model_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_transform_translate_rotate_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Translated Rotated Model"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model after moving 1 in X, then rotating by 180 degrees around the Y axis, resulting in him being at -1 in X"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    },
                    "transform": [
                      {
                        "type": "TranslateTransform",
                        "x": 1,
                        "y": 0,
                        "z": 0
                      },
                      {
                        "type": "RotateTransform",
                        "x": 0,
                        "y": 180,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_19_scaled_models_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_transform_translate_scale_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Scaled Model with original for comparison"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model twice, once at normal scale and once at double scale, and then the viewer should add default lighting and camera"
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "format": "model/gltf-binary"
                    },
                    "transform": [
                      {
                        "type": "ScaleTransform",
                        "x": 2,
                        "y": 2,
                        "z": 2
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 1,
                        "y": 0,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_20_whale_cranium_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/whale_cranium_and_mandible_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Whale Cranium and Mandible Positioned"
        ]
      },
      "summary": {
        "en": [
          "Renders two 3D models to display a whale skull. Viewer should render the mandible at (0, 0.03, 0.05) and the cranium at (0, 0.18, 0). This should place the cranium and mandible in something approximating anatomical position relative to each other."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene Containing a Whale Cranium and Mandible"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_mandible.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.03,
                        "z": 0.05
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_cranium.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.18,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_21_scene_within_canvas_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Scene with a Canvas"
        ]
      },
      "summary": {
        "en": [
          "..."
        ]
      },
      "structures": [
        {
          "id": "https://example.org/iiif/ranges/1",
          "type": "Range",
          "behavior": [
            "sequence"
          ],
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "Scene"
            }
          ]
        }
      ],
      "items": [
        {
          "id": "https://example.org/iiif/scene1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/canvas/1",
                    "type": "Canvas"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PolygonZSelector",
                        "value": "POLYGONZ((-1.0843 2.8273 -2, 1.0843 2.8273 -2, 1.0843 0 -2, -1.0843 0 -2))"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "https://example.org/iiif/canvas/1",
          "type": "Canvas",
          "label": {
            "en": [
              "Painting"
            ]
          },
          "backgroundColor": "#c0c0c0",
          "height": 28273,
          "width": 21687,
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://media.nga.gov/iiif/public/objects/1/0/6/3/8/2/106382-primary-0-nativeres.ptif/full/full/0/default.jpg",
                    "type": "Image",
                    "height": 28273,
                    "width": 21687,
                    "format": "image/jpeg",
                    "service": [
                      {
                        "@id": "https://media.nga.gov/iiif/public/objects/1/0/6/3/8/2/106382-primary-0-nativeres.ptif",
                        "@type": "ImageService2",
                        "profile": "http://iiif.io/api/image/2/level1.json"
                      }
                    ]
                  },
                  "target": "https://example.org/iiif/canvas/1"
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_22_scene_within_canvas_2_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Scene with a Canvas"
        ]
      },
      "summary": {
        "en": [
          "..."
        ]
      },
      "structures": [
        {
          "id": "https://example.org/iiif/ranges/1",
          "type": "Range",
          "behavior": [
            "sequence"
          ],
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "Scene"
            }
          ]
        }
      ],
      "items": [
        {
          "id": "https://example.org/iiif/scene1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://example.org/iiif/canvas/1",
                    "type": "Canvas"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PolygonZSelector",
                        "value": "POLYGONZ((-1.0843 2.8273 -2, -1.0843 0 -2, 1.0843 0 -2, 1.0843 2.8273 -2))"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          "id": "https://example.org/iiif/canvas/1",
          "type": "Canvas",
          "label": {
            "en": [
              "Painting"
            ]
          },
          "backgroundColor": "#c0c0c0",
          "height": 28273,
          "width": 21687,
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://media.nga.gov/iiif/public/objects/1/0/6/3/8/2/106382-primary-0-nativeres.ptif/full/full/0/default.jpg",
                    "type": "Image",
                    "height": 28273,
                    "width": 21687,
                    "format": "image/jpeg",
                    "service": [
                      {
                        "@id": "https://media.nga.gov/iiif/public/objects/1/0/6/3/8/2/106382-primary-0-nativeres.ptif",
                        "@type": "ImageService2",
                        "profile": "http://iiif.io/api/image/2/level1.json"
                      }
                    ]
                  },
                  "target": "https://example.org/iiif/canvas/1"
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_23_astronaut_comment_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/astronaut_comment.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Single Model with Comment Annotations"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin and two comment annotations, one targeting a point near the astronaut's glove and the other targeting a point near the astronaut's helmet."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": "https://example.org/iiif/scene1/page/p1/1"
                }
              ]
            }
          ],
          "annotations": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "bodyValue": "Glove",
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 1.075,
                        "y": 1.894,
                        "z": 0.204
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "bodyValue": "Helmet",
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0.006,
                        "y": 3.498,
                        "z": 0.703
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_24_multi_comment_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/model_origin.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Single Model with Multilingual Comment Annotations"
        ]
      },
      "summary": {
        "en": [
          "Viewer should render the model at the scene origin and two multilingual comment annotations, one targeting a point near the astronaut's glove and the other targeting a point near the astronaut's helmet."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1/page/p1/1",
          "type": "Scene",
          "label": {
            "en": [
              "Single Model with Comment Annotations"
            ],
            "es": [
              "Modelo único con anotaciones de comentarios"
            ]
          },
          "backgroundColor": "#33404d",
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/astronaut/astronaut.glb",
                      "type": "Model",
                      "label": {
                        "en": [
                          "Astronaut"
                        ]
                      },
                      "format": "model/gltf-binary"
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    }
                  }
                }
              ]
            }
          ],
          "annotations": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "body": [
                    {
                      "type": "Choice",
                      "items": [
                        {
                          "type": "TextualBody",
                          "value": "Glove",
                          "language": "en",
                          "format": "text/plain"
                        },
                        {
                          "type": "TextualBody",
                          "value": "Guante",
                          "language": "es",
                          "format": "text/plain"
                        }
                      ]
                    }
                  ],
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 1.075,
                        "y": 1.894,
                        "z": 0.204
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "body": [
                    {
                      "type": "Choice",
                      "items": [
                        {
                          "type": "TextualBody",
                          "value": "Helmet",
                          "language": "en",
                          "format": "text/plain"
                        },
                        {
                          "type": "TextualBody",
                          "value": "Casco",
                          "language": "es",
                          "format": "text/plain"
                        }
                      ]
                    }
                  ],
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1/page/p1/1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0.006,
                        "y": 3.498,
                        "z": 0.703
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_25_whale_comment_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/whale_comment.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Whale Cranium and Mandible with Point Comment Annotation"
        ]
      },
      "summary": {
        "en": [
          "Simple text comment on point on whale cranium. Viewer should render the mandible at (0, 0.03, 0.05) and the cranium at (0, 0.18, 0). This should place the cranium and mandible in something approximating anatomical position relative to each other. A commenting annotation for the hook-like process on the right medial pterygoid plate, the right pterygoid hamulus process, should be placed at (0.04, 0.063, -0.066). This commenting annotation is on the underside of the cranium (basicranium) between the cranium and the mandible, and is intentionally awkwardly placed in terms of view perspective."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene Containing a Whale Cranium and Mandible"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_mandible.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.03,
                        "z": 0.05
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_cranium.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.18,
                        "z": 0
                      }
                    ]
                  }
                }
              ]
            }
          ],
          "annotations": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "bodyValue": "Right pterygoid hamulus",
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0.04,
                        "y": 0.063,
                        "z": -0.066
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_26_whale_comment_camera_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/whale_comment_label_body_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Whale Cranium and Mandible with Point Comment Annotation Oriented Toward Camera"
        ]
      },
      "summary": {
        "en": [
          "Camera view of point comment annotation of whale cranium, where comment annotation label body is explicitly offset from the comment annotation. Viewer should render the mandible at (0, 0.03, 0.05) and the cranium at (0, 0.18, 0). This should place the cranium and mandible in something approximating anatomical position relative to each other. A commenting annotation for the hook-like process on the right medial pterygoid plate, the right pterygoid hamulus process, should be placed at (0.04, 0.063, -0.066). This commenting annotation is on the underside of the cranium (basicranium) between the cranium and the mandible, and is intentionally awkwardly placed in terms of view perspective. A camera has been specified and should be used to see the pterygoid hamulus clearly. The label body of the commenting annotation has been offset downward from the annotation itself and should be placed at (0.04, 0.0, -0.066). The label body should still be viewable from the camera perspective."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene Containing a Whale Cranium and Mandible"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_mandible.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.03,
                        "z": 0.05
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_cranium.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.18,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno4",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/cameras/1",
                      "type": "PerspectiveCamera",
                      "label": {
                        "en": [
                          "Perspective Camera Pointed At Pterygoid Hamulus"
                        ]
                      },
                      "fieldOfView": 50,
                      "near": 0.1,
                      "far": 2000
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": -15,
                        "y": 215,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -0.25,
                        "y": 0,
                        "z": -0.5
                      }
                    ]
                  }
                }
              ]
            }
          ],
          "annotations": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "body": {
                    "type": "TextualBody",
                    "value": "<p>Right pterygoid hamulus</p>",
                    "format": "text/html",
                    "language": "en",
                    "position": {
                      "type": "SpecificResource",
                      "source": {
                        "id": "https://example.org/iiif/scene1",
                        "type": "Scene"
                      },
                      "selector": [
                        {
                          "type": "PointSelector",
                          "x": 0.04,
                          "y": 0,
                          "z": -0.066
                        }
                      ]
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0.04,
                        "y": 0.063,
                        "z": -0.066
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_27_whale_comment_position_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/whale_comment_label_body_position.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Whale Cranium and Mandible with Point Comment Annotation Oriented Toward Camera"
        ]
      },
      "summary": {
        "en": [
          "Camera view of point comment annotation of whale cranium, where comment annotation label body is explicitly offset from the comment annotation. Viewer should render the mandible at (0, 0.03, 0.05) and the cranium at (0, 0.18, 0). This should place the cranium and mandible in something approximating anatomical position relative to each other. A commenting annotation for the hook-like process on the right medial pterygoid plate, the right pterygoid hamulus process, should be placed at (0.04, 0.063, -0.066). This commenting annotation is on the underside of the cranium (basicranium) between the cranium and the mandible, and is intentionally awkwardly placed in terms of view perspective. A camera has been specified and should be used to see the pterygoid hamulus clearly. The label body of the commenting annotation has been offset downward from the annotation itself and should be placed at (0.04, 0.0, -0.066). The label body should still be viewable from the camera perspective."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene Containing a Whale Cranium and Mandible"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_mandible.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.03,
                        "z": 0.05
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_cranium.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.18,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno4",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/cameras/1",
                      "type": "PerspectiveCamera",
                      "label": {
                        "en": [
                          "Perspective Camera Pointed At Pterygoid Hamulus"
                        ]
                      },
                      "fieldOfView": 50,
                      "near": 0.1,
                      "far": 2000
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": -15,
                        "y": 215,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -0.25,
                        "y": 0,
                        "z": -0.5
                      }
                    ]
                  }
                }
              ]
            }
          ],
          "annotations": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "body": {
                    "type": "TextualBody",
                    "value": "<p>Right pterygoid hamulus</p>",
                    "format": "text/html",
                    "language": "en",
                    "position": {
                      "type": "SpecificResource",
                      "source": {
                        "id": "https://example.org/iiif/scene1",
                        "type": "Scene"
                      },
                      "selector": [
                        {
                          "type": "PointSelector",
                          "x": 0.04,
                          "y": 0,
                          "z": -0.066
                        }
                      ]
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0.04,
                        "y": 0.063,
                        "z": -0.066
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_28_whale_camera_rotate_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/whale_comment_label_body_position_rotate.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Whale Cranium and Mandible with Point Comment Annotation Oriented Toward Camera"
        ]
      },
      "summary": {
        "en": [
          "Camera view of point comment annotation of whale cranium, where comment annotation label body is explicitly offset from the comment annotation. Viewer should render the mandible at (0, 0.03, 0.05) and the cranium at (0, 0.18, 0). This should place the cranium and mandible in something approximating anatomical position relative to each other. A commenting annotation for the hook-like process on the right medial pterygoid plate, the right pterygoid hamulus process, should be placed at (0.04, 0.063, -0.066). This commenting annotation is on the underside of the cranium (basicranium) between the cranium and the mandible, and is intentionally awkwardly placed in terms of view perspective. A camera has been specified and should be used to see the pterygoid hamulus clearly. The label body of the commenting annotation has been offset downward from the annotation itself and should be placed at (0.04, 0.0, -0.066). However, the label body has also been rotated to face away away from the camera perspective."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene Containing a Whale Cranium and Mandible"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_mandible.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.03,
                        "z": 0.05
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_cranium.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.18,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno4",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/cameras/1",
                      "type": "PerspectiveCamera",
                      "label": {
                        "en": [
                          "Perspective Camera Pointed At Pterygoid Hamulus"
                        ]
                      },
                      "fieldOfView": 50,
                      "near": 0.1,
                      "far": 2000
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": -15,
                        "y": 215,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -0.25,
                        "y": 0,
                        "z": -0.5
                      }
                    ]
                  }
                }
              ]
            }
          ],
          "annotations": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "body": {
                    "type": "TextualBody",
                    "value": "<p>Right pterygoid hamulus</p>",
                    "format": "text/html",
                    "language": "en",
                    "position": {
                      "type": "SpecificResource",
                      "source": {
                        "id": "https://example.org/iiif/scene1",
                        "type": "Scene"
                      },
                      "selector": [
                        {
                          "type": "PointSelector",
                          "x": 0.04,
                          "y": 0,
                          "z": -0.066
                        }
                      ],
                      "transform": [
                        {
                          "type": "RotateTransform",
                          "x": 0,
                          "y": 180,
                          "z": 0
                        }
                      ]
                    }
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0.04,
                        "y": 0.063,
                        "z": -0.066
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
  fixtures_presentation_4_29_whale_camera_shape_json:     {
      "@context": "http://iiif.io/api/presentation/4/context.json",
      "id": "https://example.org/iiif/3d/whale_comment_point_polygon.json",
      "type": "Manifest",
      "label": {
        "en": [
          "Whale Cranium and Mandible with Point and 2D Shape Comment Annotations"
        ]
      },
      "summary": {
        "en": [
          "Multiple commenting annotations with camera view. Viewer should render the mandible at (0, 0.03, 0.05) and the cranium at (0, 0.18, 0). This should place the cranium and mandible in something approximating anatomical position relative to each other. A first commenting annotation for the hook-like process on the right medial pterygoid plate, the right pterygoid hamulus process, should be placed at (0.04, 0.063, -0.066). A second commenting annotation for a 2D polygon outlining the foramen magnum, the large hole through which the spinal cord passes, should also be rendered. Both commenting annotations are intentionally awkwardly placed in terms of view perspective. A camera has been specified and should be used to see both commenting annotations clearly."
        ]
      },
      "items": [
        {
          "id": "https://example.org/iiif/scene1",
          "type": "Scene",
          "label": {
            "en": [
              "A Scene Containing a Whale Cranium and Mandible"
            ]
          },
          "items": [
            {
              "id": "https://example.org/iiif/scene1/page/p1/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno1",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_mandible.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.03,
                        "z": 0.05
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno2",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "id": "https://raw.githubusercontent.com/IIIF/3d/main/assets/whale/whale_cranium.glb",
                    "type": "Model",
                    "format": "model/gltf-binary"
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0,
                        "y": 0.18,
                        "z": 0
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno3",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "bodyValue": "Right pterygoid hamulus",
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": 0.04,
                        "y": 0.063,
                        "z": -0.066
                      }
                    ]
                  }
                },
                {
                  "id": "https://example.org/iiif/3d/anno5",
                  "type": "Annotation",
                  "motivation": [
                    "painting"
                  ],
                  "body": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/3d/cameras/1",
                      "type": "PerspectiveCamera",
                      "label": {
                        "en": [
                          "Perspective Camera Pointed At Pterygoid Hamulus"
                        ]
                      },
                      "fieldOfView": 50,
                      "near": 0.1,
                      "far": 2000
                    },
                    "transform": [
                      {
                        "type": "RotateTransform",
                        "x": -15,
                        "y": 215,
                        "z": 0
                      }
                    ]
                  },
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "PointSelector",
                        "x": -0.25,
                        "y": 0,
                        "z": -0.5
                      }
                    ]
                  }
                }
              ]
            }
          ],
          "annotations": [
            {
              "id": "https://example.org/iiif/scene1/page/p2/1",
              "type": "AnnotationPage",
              "items": [
                {
                  "id": "https://example.org/iiif/3d/anno4",
                  "type": "Annotation",
                  "motivation": [
                    "commenting"
                  ],
                  "bodyValue": "Foramen magnum",
                  "target": {
                    "type": "SpecificResource",
                    "source": {
                      "id": "https://example.org/iiif/scene1",
                      "type": "Scene"
                    },
                    "selector": [
                      {
                        "type": "WKTSelector",
                        "value": "POLYGON Z ((0 0.18 -0.23, -0.03 0.16 -0.23, -0.015 0.12 -0.23, 0.006 0.12 -0.23, 0.027 0.16 -0.230))"
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    } satisfies Manifest4,
} as const;

describe('presentation-4 manifest fixture typing', () => {
  test('all p4 manifest fixtures satisfy Manifest4', () => {
    expect(Object.keys(manifestsByFixture)).toHaveLength(33);
  });
});
