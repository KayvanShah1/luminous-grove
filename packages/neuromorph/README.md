# Neuromorph

A biomimetic neural tree visualization where biology meets circuitry.

This package provides:
- `NeuromorphTree` React component
- `createNeuromorphTree` core API for framework-agnostic use

## Install

```bash
npm install @kayvanshah1/neuromorph
```

## Peer Dependencies

```text
react ^18
react-dom ^18
```

## Usage (React)

```tsx
import { NeuromorphTree } from "@kayvanshah1/neuromorph";

export function Demo() {
  return (
    <div style={{ height: 600 }}>
      <NeuromorphTree
        config={{ maxDepth: 7, branchSpread: 60, glowStrength: 30 }}
        onNodeCount={(n) => console.log(`${n} nodes`)}
      />
    </div>
  );
}
```

## Usage (Core)

```ts
import { createNeuromorphTree } from "@kayvanshah1/neuromorph/core";

const container = document.getElementById("neuromorph")!;
const instance = createNeuromorphTree(
  container,
  { treeScale: 0.85 },
  (count) => console.log(count)
);

instance.updateConfig({ glowStrength: 40 });
instance.regenerate();
instance.destroy();
```

## API Reference

### `NeuromorphTree` (React)

```ts
type NeuromorphTreeProps = {
  config?: Partial<TreeConfig>;
  className?: string;
  onNodeCount?: (count: number) => void;
};
```

Notes:
- The component renders into a full-size container. Ensure the parent has an explicit size.
- `config` is merged over defaults; update it to tweak behavior at runtime.
- `onNodeCount` is called after initialization and on regeneration.

### `createNeuromorphTree` (Core)

```ts
function createNeuromorphTree(
  container: HTMLElement,
  config?: Partial<TreeConfig>,
  onNodeCount?: (count: number) => void
): NeuromorphInstance;

type NeuromorphInstance = {
  controller: TreeController;
  destroy: () => void;
  updateConfig: (config: Partial<TreeConfig>) => void;
  regenerate: () => void;
};
```

Notes:
- Call `destroy()` to clean up listeners and animation.
- `updateConfig()` applies changes without rebuilding the instance.
- `regenerate()` rebuilds the tree with a new random seed.

### Config Exports

```ts
type TreeConfig = { /* see Tunable Parameters */ };
const defaultConfig: TreeConfig;
```

## Tunable Parameters

All parameters below map to `TreeConfig`. Units are milliseconds where noted.

| Key | Default | Description |
| --- | --- | --- |
| `maxDepth` | `6` | Recursion depth for branch generation. |
| `maxBranches` | `3` | Maximum child branches per node. |
| `branchSpread` | `50` | Angular spread (degrees) between branches. |
| `treeScale` | `0.92` | Overall size multiplier for the tree. |
| `shineSpeed` | `130` | Pulse travel speed (ms). |
| `swayIntensity` | `0.065` | Sway amplitude during physics motion. |
| `swayDecay` | `3000` | Sway damping time (ms). |
| `growthDelay` | `375` | Base delay before growth starts (ms). |
| `childDelay` | `120` | Per-child stagger delay (ms). |
| `growthDuration` | `1800` | Branch growth animation duration (ms). |
| `leafGlowIntensity` | `0.85` | Leaf glow strength (0–1). |
| `leafDensity` | `0.7` | Probability of leaf nodes (0–1). |
| `branchThickness` | `4` | Base stroke width for branches. |
| `glowStrength` | `25` | Shadow blur radius for glow. |
| `shineInterval` | `3000` | Auto-pulse interval (ms). |

## Build

```bash
pnpm --filter @kayvanshah1/neuromorph build
```

## License

MIT
