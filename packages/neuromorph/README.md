# Neuromorph

[![npm version](https://img.shields.io/npm/v/@kayvanshah1/neuromorph?color=cb3837&logo=npm)](https://www.npmjs.com/package/@kayvanshah1/neuromorph)
[![npm downloads](https://img.shields.io/npm/dm/@kayvanshah1/neuromorph?color=blue&logo=npm)](https://www.npmjs.com/package/@kayvanshah1/neuromorph)
[![Publish Package](https://github.com/KayvanShah1/luminous-grove/actions/workflows/publish-npm.yml/badge.svg)](https://github.com/KayvanShah1/luminous-grove/actions/workflows/publish-npm.yml)
[![Deploy Pages](https://github.com/KayvanShah1/luminous-grove/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/KayvanShah1/luminous-grove/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A biomimetic neural tree visualization where biology meets circuitry.

Neuromorph is a real-time generative system that simulates neural-style
branching structures with interactive physics and bioluminescent signal
propagation.

## Features

- Fractal, recursive tree generation
- Signal pulse propagation through branches
- Physics-based sway interactions
- Real-time configurable parameters
- Lightweight (Canvas 2D, no heavy dependencies)
- React + framework-agnostic core API

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
const instance = createNeuromorphTree(container, { treeScale: 0.85 }, (count) =>
	console.log(count),
);

instance.updateConfig({ glowStrength: 40 });
instance.regenerate();
instance.destroy();
```

## Usage (Vanilla HTML)

### ESM (modern browsers)

```html
<div id="neuromorph" style="height: 600px"></div>

<script type="module">
	import { createNeuromorphTree } from "https://cdn.jsdelivr.net/npm/@kayvanshah1/neuromorph/dist/core.js";

	const el = document.getElementById("neuromorph");
	createNeuromorphTree(el, { treeScale: 0.9 });
</script>
```

### Script tag (no modules)

```html
<div id="neuromorph" style="height: 600px"></div>

<script src="https://cdn.jsdelivr.net/npm/@kayvanshah1/neuromorph/dist/iife/neuromorph.min.js"></script>
<script>
	const el = document.getElementById("neuromorph");
	Neuromorph.createNeuromorphTree(el, { treeScale: 0.9 });
</script>
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

**Notes:**

- Parent container must have an explicit size
- `config` is merged with defaults
- `onNodeCount` fires after init and regeneration

### `createNeuromorphTree` (Core)

```ts
function createNeuromorphTree(
	container: HTMLElement,
	config?: Partial<TreeConfig>,
	onNodeCount?: (count: number) => void,
): NeuromorphInstance;

type NeuromorphInstance = {
	controller: TreeController;
	destroy: () => void;
	updateConfig: (config: Partial<TreeConfig>) => void;
	regenerate: () => void;
};
```

**Notes:**

- Call `destroy()` to clean up listeners and animation
- `updateConfig()` applies changes without full rebuild
- `regenerate()` creates a new tree with a fresh seed

## Configuration

### `TreeConfig`

| Key                 | Default | Description                    |
| ------------------- | ------- | ------------------------------ |
| `maxDepth`          | `6`     | Recursion depth                |
| `maxBranches`       | `3`     | Max children per node          |
| `branchSpread`      | `50`    | Angular spread (degrees)       |
| `treeScale`         | `0.92`  | Overall size multiplier        |
| `shineSpeed`        | `130`   | Pulse speed (ms)               |
| `swayIntensity`     | `0.065` | Sway amplitude                 |
| `swayDecay`         | `3000`  | Sway damping (ms)              |
| `growthDelay`       | `375`   | Initial growth delay (ms)      |
| `childDelay`        | `120`   | Per-child delay (ms)           |
| `growthDuration`    | `1800`  | Branch animation duration (ms) |
| `leafGlowIntensity` | `0.85`  | Leaf brightness (0–1)          |
| `leafDensity`       | `0.7`   | Leaf probability               |
| `branchThickness`   | `4`     | Stroke width                   |
| `glowStrength`      | `25`    | Glow intensity                 |
| `shineInterval`     | `3000`  | Auto pulse interval (ms)       |

## Build

```bash
pnpm --filter @kayvanshah1/neuromorph build
```

## License

MIT
