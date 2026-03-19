# 🌿 Neuromorph Tree

[![npm version](https://img.shields.io/npm/v/@kayvanshah1/neuromorph?color=orange&logo=npm)](https://www.npmjs.com/package/@kayvanshah1/neuromorph)
[![Publish Package](https://github.com/KayvanShah1/luminous-grove/actions/workflows/publish-npm.yml/badge.svg)](https://github.com/KayvanShah1/luminous-grove/actions/workflows/publish-npm.yml)
[![Deploy Pages](https://github.com/KayvanShah1/luminous-grove/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/KayvanShah1/luminous-grove/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**A biomimetic neural tree visualization — where biology meets circuitry.**

Neuromorph Tree is a real-time, interactive generative art piece that renders
bioluminescent fractal trees using the HTML5 Canvas API. Inspired by the
branching patterns found in neural dendrites, fungal mycelium, and circuit board
traces, it produces living, breathing digital organisms that respond to your
touch.

## Overview

Neuromorph is an algorithmic art project that simulates organic neural growth
structures. Watch as branches emerge with adaptive probability, energy pulses
cascade through pathways with chromatic shifting, and your interactions create
ripples through the entire network.

The visualization combines sophisticated procedural generation with
physics-based interactivity, creating unique structures that feel alive and
responsive.

## ✨ Features

- **Smooth fractal growth** — branches unfurl organically with staggered timing,
  mimicking natural morphogenesis
- **Bioluminescent glow** — neon-lit edges and leaf nodes with configurable
  bloom and shadow effects
- **Signal pulse propagation** — right-click sends a light pulse that cascades
  through the entire branch network
- **Physics-based sway** — click to disturb the tree; watch it ripple and settle
  with exponential decay
- **Customizer panel** — tweak depth, spread, scale, glow, thickness, and timing
  in real time
- **Screenshot export** — press `S` to capture the current tree as a PNG
- **Forest environment** — ambient floating particles and layered radial
  gradients create depth
- **Responsive & performant** — pure Canvas 2D, zero dependencies on heavy
  graphics libraries

## Live Demo

Visit the live demo to explore interactive neural growth:
https://kayvanshah1.github.io/luminous-grove/

## 🎮 Interactions

| Input            | Action                                  |
| ---------------- | --------------------------------------- |
| **Left-click**   | Trigger organic sway across branches    |
| **Right-click**  | Fire a signal pulse from root to leaves |
| **Double-click** | Regenerate with a new random seed       |
| **Press S**      | Save screenshot to clipboard/download   |

## 🧬 Motivation

Nature's most efficient networks — from the veins of a leaf to the axons of a
neuron — all converge on recursive branching. Neuromorph Tree is an exploration
of that universal pattern, rendered through the lens of bioluminescent
circuitry.

The goal: make something that feels _alive_ — that breathes, reacts, and glows —
using nothing but math and light.

## Technical Details

### Architecture

Recursive branching algorithms simulate natural growth:

1. **Growth Phase**: Staggered branch development creates organic unfolding
2. **Leaf Formation**: Terminal branches receive leaves based on depth
   probability
3. **Energy Propagation**: Luminous signals cascade from root through network
4. **Physics Simulation**: Branches respond to forces with realistic sway

### Performance

- **Frame Rate**: Optimized 45 FPS
- **Canvas**: Responsive, defaults 600x325px
- **Rendering**: Efficient glow with shadow blurs
- **Memory**: Minimal footprint

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## ⚙️ Configuration

All parameters are exposed via `TreeConfig`:

```ts
interface TreeConfig {
	maxDepth: number; // Recursion depth (default: 6)
	maxBranches: number; // Children per node (default: 3)
	branchSpread: number; // Angular spread in degrees (default: 50)
	treeScale: number; // Overall scale factor (default: 0.92)
	shineSpeed: number; // Pulse travel speed in ms (default: 130)
	swayIntensity: number; // Sway amplitude (default: 0.065)
	swayDecay: number; // Sway damping in ms (default: 3000)
	growthDelay: number; // Base growth stagger in ms (default: 375)
	childDelay: number; // Per-child stagger in ms (default: 120)
	growthDuration: number; // Branch grow animation in ms (default: 1800)
	leafGlowIntensity: number; // Leaf brightness 0–1 (default: 0.85)
	leafDensity: number; // Probability of leaf nodes (default: 0.7)
	branchThickness: number; // Base stroke width (default: 4)
	glowStrength: number; // Shadow blur radius (default: 25)
	shineInterval: number; // Auto-pulse interval in ms (default: 3000)
}
```

## Installation

```bash
npm install @kayvanshah1/neuromorph
```

## Usage

### React Component

```tsx
import { NeuromorphTree } from "@kayvanshah1/neuromorph";

<div style={{ height: 600 }}>
	<NeuromorphTree
		config={{ maxDepth: 7, branchSpread: 60, glowStrength: 30 }}
		onNodeCount={(n) => console.log(`${n} nodes`)}
	/>
</div>;
```

### Core (Framework-Agnostic)

```ts
import { createNeuromorphTree } from "@kayvanshah1/neuromorph/core";

const container = document.getElementById("neuromorph")!;
const instance = createNeuromorphTree(container, { treeScale: 0.85 }, (count) =>
	console.log(count),
);

// Later:
instance.updateConfig({ glowStrength: 40 });
instance.regenerate();
instance.destroy();
```

## Customization

### Theming

Colors use Tailwind CSS. Customize theme variables in the configuration.

### Canvas Dimensions

The canvas fills its parent container. Set the container size via CSS.

### Animation Timing

Adjust parameters through configuration object.

## Performance Optimization

For lower-end devices:

- Reduce `maxDepth` to 4-5
- Lower particle count in ForestBackground
- Disable automatic shine with `shineInterval: Infinity`
- Use smaller canvas dimensions

## Contributing

Contributions welcome! Submit a Pull Request.

## License

Read the [MIT](/LICENSE) here.

## Credits

Inspired by neural networks, procedural generation, and natural growth patterns.

**Explore the living forest. Shape the neural growth. Create something unique.**
