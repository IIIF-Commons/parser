import type { ContentResourceNormalized } from "./contentResource";

export type SceneComponentNormalized = ContentResourceNormalized & {
  type?:
    | "PerspectiveCamera"
    | "OrthographicCamera"
    | "AmbientLight"
    | "DirectionalLight"
    | "PointLight"
    | "SpotLight"
    | "AmbientAudio"
    | "PointAudio"
    | "SpotAudio";
};
