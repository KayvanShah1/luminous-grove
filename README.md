# 🌿 Neuromorph Tree

**A biomimetic neural tree visualization — where biology meets circuitry.**

Neuromorph Tree is a real-time, interactive generative art piece that renders bioluminescent fractal trees using the HTML5 Canvas API. Inspired by the branching patterns found in neural dendrites, fungal mycelium, and circuit board traces, it produces living, breathing digital organisms that respond to your touch.

---

## ✨ Features

- **Smooth fractal growth** — branches unfurl organically with staggered timing, mimicking natural morphogenesis
- **Bioluminescent glow** — neon-lit edges and leaf nodes with configurable bloom and shadow effects
- **Signal pulse propagation** — right-click sends a light pulse that cascades through the entire branch network
- **Physics-based sway** — click to disturb the tree; watch it ripple and settle with exponential decay
- **Customizer panel** — tweak depth, spread, scale, glow, thickness, and timing in real time
- **Screenshot export** — press `S` to capture the current tree as a PNG
- **Forest environment** — ambient floating particles and layered radial gradients create depth
- **Responsive & performant** — pure Canvas 2D, zero dependencies on heavy graphics libraries

## 🎮 Interactions

| Input | Action |
|---|---|
| **Left-click** | Trigger organic sway across branches |
| **Right-click** | Fire a signal pulse from root to leaves |
| **Double-click** | Regenerate with a new random seed |
| **Press S** | Save screenshot to clipboard/download |

## 🧬 Motivation

Nature's most efficient networks — from the veins of a leaf to the axons of a neuron — all converge on recursive branching. Neuromorph Tree is an exploration of that universal pattern, rendered through the lens of bioluminescent circuitry.

The goal: make something that feels *alive* — that breathes, reacts, and glows — using nothing but math and light.

## ⚙️ Configuration

All parameters are exposed via `TreeConfig`:

```ts
interface TreeConfig {
  maxDepth: number;        // Recursion depth (default: 6)
  maxBranches: number;     // Children per node (default: 3)
  branchSpread: number;    // Angular spread in degrees (default: 50)
  treeScale: number;       // Overall scale factor (default: 0.92)
  shineSpeed: number;      // Pulse travel speed in ms (default: 130)
  swayIntensity: number;   // Sway amplitude (default: 0.065)
  swayDecay: number;       // Sway damping in ms (default: 3000)
  growthDelay: number;     // Base growth stagger in ms (default: 375)
  childDelay: number;      // Per-child stagger in ms (default: 120)
  growthDuration: number;  // Branch grow animation in ms (default: 1800)
  leafGlowIntensity: number; // Leaf brightness 0–1 (default: 0.85)
  leafDensity: number;     // Probability of leaf nodes (default: 0.7)
  branchThickness: number; // Base stroke width (default: 4)
  glowStrength: number;    // Shadow blur radius (default: 25)
  shineInterval: number;   // Auto-pulse interval in ms (default: 3000)
}
```

## 🚀 Usage

```tsx
import NeuromorphTree from "@/components/NeuromorphTree";

<NeuromorphTree
  config={{ maxDepth: 7, branchSpread: 60, glowStrength: 30 }}
  onNodeCount={(n) => console.log(`${n} nodes`)}
/>
```

## 🛠 Tech Stack

- **React 18** + TypeScript
- **HTML5 Canvas 2D** — no WebGL, no p5.js, pure native rendering
- **Tailwind CSS** — layout and theming via semantic design tokens
- **Vite** — blazing-fast dev server and optimized production builds
- **Framer Motion** — UI panel animations

## 📦 CI/CD

- **GitHub Pages** — auto-deploys on push to `main` (`.github/workflows/deploy-pages.yml`)
- **npm publish** — triggered by version tags `v*` (`.github/workflows/publish-npm.yml`)

## 📄 License

MIT
