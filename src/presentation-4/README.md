# IIIF Presentation API 4.0 Implementation

This directory contains the implementation of IIIF Presentation API 4.0 for the parser. Version 4.0 introduces significant new capabilities including 3D content support, enhanced temporal handling, and dynamic content states.

## Overview

The Presentation API 4.0 brings major architectural changes and new features:

### Key New Features

- **3D Content Support**: Scenes, Models, Cameras, Lights, Audio Emitters
- **Enhanced Container Types**: Timeline (temporal), Canvas (2D+temporal), Scene (3D+temporal)
- **Advanced Selectors**: PointSelector, WktSelector, AnimationSelector, etc.
- **Content States**: Dynamic scene modification and storytelling capabilities
- **Physical Dimensions**: Real-world scale mapping via `spatialScale` and `temporalScale`
- **Interactive Annotations**: `activating` motivation for user interactions
- **Enhanced Media Support**: Better audio/video handling with positioning

### Breaking Changes from v3

1. **Container Model**: Canvas is now one of three container types (Timeline, Canvas, Scene)
2. **3D Coordinate System**: Right-handed Cartesian (positive Y up, positive X right, positive Z forward)
3. **New Required Properties**: Timeline requires `duration`, Scene may have `duration`
4. **Motivation Changes**: New `contentState` and `activating` motivations
5. **Behavior Enhancements**: New behavior values for 3D interactions and temporal control

## Architecture

### Directory Structure

```
presentation-4/
├── README.md                          # This file
├── index.ts                          # Main exports
├── empty-types.ts                    # Default/empty entity definitions for v4
├── normalize.ts                      # Normalization logic for v4 entities
├── traverse.ts                       # Traversal logic for v4 resources
├── serialize.ts                      # Base serialization utilities
├── serialize-presentation-4.ts       # v4 output serialization
├── serialize-presentation-3.ts       # v4→v3 downgrade serialization
├── upgrade-from-v3.ts               # v3→v4 upgrade utilities
├── utilities.ts                     # v4-specific utility functions
├── strict-upgrade.ts                # Validation and strict upgrading
└── types/                           # TypeScript type definitions
    ├── containers.ts                # Timeline, Canvas, Scene types
    ├── content-resources.ts         # Model, Audio, Video, etc.
    ├── scene-components.ts          # Cameras, Lights, Audio Emitters
    ├── selectors.ts                 # New selector types
    ├── transforms.ts                # Transform types
    └── extended-properties.ts       # New v4 properties
```

## Implementation Plan

### Phase 1: Core Infrastructure (Foundation)

**Goal**: Basic v4 parsing and normalization

1. **Type Definitions**
   - Define v4-specific TypeScript interfaces
   - Extend base types for new containers (Timeline, Scene)
   - Define 3D-specific types (Camera, Light, Transform, etc.)

2. **Empty Types & Defaults**
   - Create default objects for all new v4 entities
   - Timeline, Scene, Camera, Light, AudioEmitter defaults
   - New selector defaults (PointSelector, WktSelector, etc.)

3. **Basic Normalization**
   - Parse v4 JSON into normalized entities
   - Handle new container types in traversal
   - Basic validation of required properties

4. **Utility Functions**
   - 3D coordinate system utilities
   - Physical dimension conversion helpers
   - Content state resolution utilities

**Deliverables:**

- `types/*.ts` - All v4 type definitions
- `empty-types.ts` - Default entities
- `utilities.ts` - Core utilities
- Basic `normalize.ts` structure

### Phase 2: Traversal & Serialization (Core Logic)

**Goal**: Complete v4 processing pipeline

1. **Enhanced Traversal**
   - Support Timeline, Canvas, Scene traversal
   - Handle 3D content resources (Models, Cameras, Lights)
   - Process new selector types
   - Content state annotation processing

2. **Native v4 Serialization**
   - Output clean v4 JSON
   - Handle all new properties and structures
   - Maintain annotation structure integrity
   - Support content state serialization

3. **Validation & Strict Upgrading**
   - Validate v4 requirements
   - Check coordinate system consistency
   - Verify required properties for new containers

**Deliverables:**

- Complete `traverse.ts`
- `serialize-presentation-4.ts`
- `strict-upgrade.ts`
- Core `normalize.ts` implementation

### Phase 3: Bidirectional Conversion (Compatibility)

**Goal**: Seamless conversion between v3 and v4

1. **v3 → v4 Upgrade**
   - Convert v3 Canvases to v4 Canvases
   - Handle manifest structure changes
   - Preserve all v3 functionality
   - Add default v4 properties where needed

2. **v4 → v3 Downgrade**
   - Convert v4 back to v3 (excluding 3D features)
   - Map Timelines to v3 Canvases with duration
   - Strip 3D-only features gracefully
   - Preserve semantic meaning where possible
   - Handle content state graceful degradation

3. **Compatibility Layer**
   - Automatic detection of v3 vs v4 content
   - Seamless API for consuming applications
   - Migration utilities for existing data

**Deliverables:**

- `upgrade-from-v3.ts`
- `serialize-presentation-3.ts` (downgrade)
- Migration documentation
- Compatibility test suite

### Phase 4: Advanced Features (Enhancement)

**Goal**: Full v4 feature support

1. **Content State Processing**
   - Dynamic scene modification
   - Scope-based content states
   - Reset and cumulative behaviors
   - Linear navigation support

2. **3D Scene Composition**
   - Nested scene support
   - Transform application
   - Camera and lighting management
   - Audio positioning

3. **Interactive Features**
   - Activating annotation processing
   - Animation selector support
   - Hotspot and interaction handling

4. **Physical Dimensions**
   - Scale conversion utilities
   - Real-world measurement support
   - Cross-container scaling

**Deliverables:**

- Advanced content state processing
- 3D composition utilities
- Interaction handlers
- Physical dimension calculators

## Conversion Strategy

### v3 → v4 Upgrade

```typescript
// Example upgrade logic
function upgradeManifestV3ToV4(v3Manifest: ManifestV3): ManifestV4 {
  return {
    ...v3Manifest,
    "@context": "http://iiif.io/api/presentation/4/context.json",
    items: v3Manifest.items.map((canvas) => upgradeCanvasV3ToV4(canvas)),
  };
}

function upgradeCanvasV3ToV4(v3Canvas: CanvasV3): CanvasV4 {
  return {
    ...v3Canvas,
    type: "Canvas", // Explicit container type
    // duration preserved if present
    // Add v4-specific defaults
  };
}
```

### v4 → v3 Downgrade

```typescript
// Example downgrade logic
function downgradeManifestV4ToV3(v4Manifest: ManifestV4): ManifestV3 {
  return {
    ...v4Manifest,
    "@context": "http://iiif.io/api/presentation/3/context.json",
    items: v4Manifest.items
      .filter(isV3Compatible) // Remove Scenes, unsupported features
      .map((container) => downgradeContainerV4ToV3(container)),
  };
}

function downgradeContainerV4ToV3(container: ContainerV4): CanvasV3 {
  switch (container.type) {
    case "Timeline":
      // Convert Timeline to Canvas with duration, default dimensions
      return {
        ...container,
        type: "Canvas",
        width: 1, // Minimal dimensions for temporal content
        height: 1,
        duration: container.duration,
      };
    case "Canvas":
      // Direct mapping, remove v4-only properties
      return stripV4Properties(container);
    case "Scene":
      // Scenes cannot be downgraded - would need special handling
      throw new Error("Scene containers cannot be downgraded to v3");
  }
}
```

## Usage Examples

### Parsing v4 Content

```typescript
import { normalize as normalizeV4 } from "./presentation-4";

// Parse v4 manifest
const v4Manifest = await fetch("https://example.org/manifest-v4.json").then((r) => r.json());
const { entities, resource, mapping } = normalizeV4(v4Manifest);

// Access 3D scene
const scene = entities.Scene[resource.items[0].id];
const cameras = scene.items.filter((item) => entities.Annotation[item.id]?.body?.type?.includes("Camera"));
```

### Converting Between Versions

```typescript
import { upgradeFromV3, serialize } from "./presentation-4";
import { serializeConfigPresentation3 } from "./serialize-presentation-3";

// Upgrade v3 to v4
const v3Manifest = await fetch("https://example.org/manifest-v3.json").then((r) => r.json());
const v4Normalized = upgradeFromV3(v3Manifest);

// Downgrade v4 to v3 (excluding 3D features)
const v3Compatible = serialize(v4Normalized.entities, v4Normalized.resource, serializeConfigPresentation3);
```

### Working with 3D Content

```typescript
// Process Scene with 3D models
const scene = entities.Scene[sceneId];
const modelAnnotations = scene.items
  .flatMap((page) => entities.AnnotationPage[page.id]?.items || [])
  .map((annoId) => entities.Annotation[annoId])
  .filter((anno) => anno?.body?.type === "Model");

// Extract camera positions
const cameras = scene.items
  .flatMap((page) => entities.AnnotationPage[page.id]?.items || [])
  .map((annoId) => entities.Annotation[annoId])
  .filter((anno) => anno?.body?.type?.includes("Camera"))
  .map((anno) => ({
    camera: anno.body,
    position: anno.target.selector, // PointSelector with x,y,z
  }));
```

## Configuration Options

### Serialization Configs

```typescript
// Native v4 output
import { serializeConfigPresentation4 } from "./serialize-presentation-4";

// v3 compatible output (downgrade)
import { serializeConfigPresentation3 } from "./serialize-presentation-3";

// Custom config with specific feature toggles
const customConfig = {
  ...serializeConfigPresentation4,
  stripUnsupported3DFeatures: true,
  preserveContentStates: false,
  downgradeScenesToCanvas: true,
};
```

### Upgrade Options

```typescript
interface UpgradeOptions {
  preserveV3Semantics: boolean; // Keep v3-style behavior
  addDefaultV4Properties: boolean; // Add v4 defaults
  enableContentStates: boolean; // Process content state annotations
  enable3DFeatures: boolean; // Support Scene containers
}
```

## Development Guidelines

### Code Organization

1. **Separation of Concerns**: Keep v3 and v4 completely separate
2. **Type Safety**: Use strict TypeScript for all v4 types
3. **Backwards Compatibility**: Always provide graceful degradation
4. **Testing**: Comprehensive test coverage for conversions

### Naming Conventions

- v4-specific files: `*-presentation-4.ts`
- Downgrade files: `*-presentation-3.ts` (in v4 directory)
- Upgrade utilities: `upgrade-from-v3.ts`
- Type files: `types/*.ts`

### Error Handling

- Graceful degradation for unsupported features
- Clear error messages for invalid v4 content
- Validation warnings for missing required properties
- Conversion logs for debugging

## Testing Strategy

### Unit Tests

- Individual function testing for normalization
- Serialization round-trip testing
- Type validation testing

### Integration Tests

- Full manifest processing pipelines
- v3↔v4 conversion accuracy
- Real-world manifest compatibility

### Performance Tests

- Large manifest processing
- Memory usage optimization
- Conversion speed benchmarks

### Compatibility Tests

- Cross-version feature matrix
- Edge case handling
- Error condition testing

## Future Considerations

### Potential Shared Utilities

After initial implementation, consider extracting shared utilities:

- **Language map processing**: Common between v3/v4
- **URI validation**: Same across versions
- **Basic annotation processing**: Core logic unchanged
- **JSON-LD context handling**: Similar patterns

### Extension Points

- Custom selector support
- Additional 3D content types
- Enhanced content state behaviors
- Community-defined motivations

### Performance Optimizations

- Lazy loading of 3D content
- Efficient coordinate system transformations
- Streaming processing for large scenes
- Memory-efficient entity storage

## Migration Path

For existing applications:

1. **Phase 1**: Add v4 support alongside existing v3
2. **Phase 2**: Migrate to v4 parsing with v3 output
3. **Phase 3**: Enable v4 features incrementally
4. **Phase 4**: Full v4 native implementation

This approach ensures zero-downtime migration and gradual feature adoption.
