# Neuromorph — Interactive Generative Circuit Forest

**Neuromorph** is an immersive generative visualization that blends **neural
circuitry, organic growth, and bioluminescent forest aesthetics**. The
experience presents a living digital organism that grows, pulses with signals,
and responds to user interaction.

The project consists of two layers:

1. **Neuromorph Website** — a polished interactive showcase built with Next.js.
2. **Neuromorph Engine** — a reusable JavaScript package that renders the
   circuit tree.

The website acts as a **product-quality playground** and documentation site for
the visualization engine.

---

# 1. Technology Stack

Frontend Framework

- Next.js (App Router)
- React
- Tailwind CSS

UI and Icons

- Lucide React icons only

Animation

- React hooks
- requestAnimationFrame
- CSS transitions
- optional small utilities for easing

No UI component frameworks should be used.

---

# 2. Product Design Philosophy

Neuromorph should feel like a **premium interactive product experience** rather
than a typical demo.

Design language inspired by high-end product pages from companies like Apple or
Samsung.

Core principles:

Minimalism Large breathing spaces and clean hierarchy.

Soft Motion Subtle animated transitions and ambient motion.

Depth and Atmosphere Gradients, fog layers, and glow effects.

Precision Layout Strict grid alignment and responsive scaling.

Intentional Interaction Every hover, animation, and transition should feel
purposeful.

---

# 3. Visual Theme — Digital Night Forest

The visual identity should evoke a **bioluminescent forest at night**.

## Background Environment

Layered dark gradients such as:

- midnight blue
- charcoal
- deep forest green

Add subtle visual richness:

- film grain or noise overlay
- fog-like gradients
- soft atmospheric glow

Example conceptual layering:

Background gradient Fog overlay Distant forest silhouettes Particles/fireflies
Tree visualization

---

# 4. Hero Visualization — The Living Tree

The tree is the **centerpiece** of the experience.

Important constraint:

The tree **must not appear inside a boxed canvas**.

Instead:

- It blends into the environment
- Edges fade naturally
- The base dissolves into the forest floor

Conceptually it should feel like:

> a glowing organism growing inside a forest clearing.

Layout characteristics:

- full-width hero section
- immersive height (80–100vh)
- responsive scaling
- no visible canvas boundaries

---

# 5. Forest Environment Layer

Beyond the main tree, the environment should feel alive.

Subtle generative elements may include:

Firefly particles Small glowing nodes in distance Soft drifting fog Silhouettes
of distant trees Ambient vertical light beams

Movement should be extremely slow and calming.

The environment must **support the main tree without distracting from it**.

---

# 6. Neuromorph Modes

Provide two visualization modes.

## 1. Single Tree Mode

A single central tree grows and animates.

Used for:

- main hero
- interaction demo
- parameter customization

## 2. Forest Mode

Multiple trees grow simultaneously across the environment.

Each tree varies in:

- depth
- branching factor
- scale
- glow intensity

This creates a **digital forest of neural organisms**.

Users should be able to switch between modes using a minimal toggle.

---

# 7. Interaction Design

The experience should encourage playful exploration.

User interactions must feel responsive but smooth.

### Mouse interactions

Left click Applies directional sway to the tree.

Right click Triggers a signal pulse that travels through branches.

Double click Regenerates the tree with new randomness.

### Keyboard interaction

S Saves a screenshot of the canvas.

### Interaction philosophy

Interactions should feel like **touching a living organism**.

Responses should propagate through the tree structure rather than triggering
instant changes.

---

# 8. Instruction Tooltip System

A minimal instruction overlay explains controls.

Design requirements:

- small floating tooltip
- subtle glass-like UI
- rounded corners
- soft glow border

Content example:

Controls

Left Click → Apply sway Right Click → Signal pulse Double Click → Regenerate
tree S → Save screenshot

Behavior:

- visible on first load
- can be dismissed
- toggle button brings it back

The tooltip state should persist using **localStorage**.

---

# 9. Tree Customizer Panel

A floating configuration interface allows users to modify tree behavior.

Design style:

- minimal
- translucent glass panel
- floating on the side
- subtle shadow and blur

Avoid typical form-heavy UI.

Instead:

- sliders
- toggles
- minimal labels

---

## Customization Categories

### Tree Structure

maxDepth maxBranches branchSpread treeScale

### Animation

shineSpeed swayIntensity swayDecay

### Growth Behavior

growthDelay childDelay growthDuration

### Visual Style

leafGlowIntensity leafDensity branchThickness glowStrength

---

# 10. Customizer Implementation Constraint

The customizer must **connect to the tree configuration without modifying the
original core algorithm file**.

Implementation approach:

Adapter layer.

Example structure:

```
core/
  originalTreeLogic.ts

engine/
  TreeController.ts
```

TreeController:

- reads UI parameters
- passes them to the core logic
- triggers regeneration

This preserves the **dramatic separation between engine and UI controls**.

---

# 11. Demo Frame (Embedded Version)

A small framed demo should appear elsewhere on the page.

Purpose:

Show how the tree can be embedded as a reusable component.

This frame should be:

- small
- minimal
- isolated canvas

Example usage context:

"Embed Neuromorph anywhere."

---

# 12. Reusable JavaScript Package

The visualization engine should be published as a reusable package.

Package name:

```
neuromorph
```

Directory structure:

```
packages/
  neuromorph/
    src/
      CircuitTree.ts
      Forest.ts
      types.ts
      index.ts
    dist/
    package.json
```

---

# 13. Package API

Minimal, clean API.

Example usage:

```javascript
import { NeuromorphTree } from "neuromorph";

const tree = new NeuromorphTree({
	container: "#tree",
	maxDepth: 6,
	shineInterval: 3000,
});

tree.start();
```

---

## Public Methods

start() stop() regenerate() triggerPulse() applySway(direction)
captureScreenshot()

---

## Configuration Options

Example configuration object:

```
{
  maxDepth: number
  maxBranches: number
  branchSpread: number
  growthDelay: number
  childDelay: number
  growthDuration: number
  leafGlowIntensity: number
  leafDensity: number
  branchThickness: number
  glowStrength: number
}
```

---

# 14. README Documentation

The repository should include a professional README.

Sections:

Overview Features Installation Usage Configuration Options Interaction Controls
Local Development Deployment

Overview example:

Neuromorph is a generative visualization that simulates a bioluminescent
circuit-tree growing inside a digital forest. Inspired by neural networks and
organic growth, it visualizes signal propagation through branching structures.

---

# 15. Local Development

Commands:

Install dependencies

```
npm install
```

Run development server

```
npm run dev
```

Build project

```
npm run build
```

---

# 16. GitHub Actions — Website Deployment

Create a workflow for automatic GitHub Pages deployment.

File:

```
.github/workflows/deploy-pages.yml
```

Workflow triggers:

```
on:
  push:
    branches: [ main ]
```

Key steps:

1. Checkout repository
2. Setup Node
3. Install dependencies
4. Build Next.js static site
5. Deploy to GitHub Pages

Example workflow:

```yaml
name: Deploy Site

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest

        permissions:
            pages: write
            id-token: write
            contents: read

        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: 20

            - run: npm install

            - run: npm run build

            - run: npm run export

            - uses: actions/upload-pages-artifact@v2
              with:
                  path: ./out

            - uses: actions/deploy-pages@v2
```

---

# 17. GitHub Actions — Publish NPM Package

Create a workflow to publish the engine package.

File:

```
.github/workflows/publish-npm.yml
```

Trigger:

```
on:
  push:
    tags:
      - "v*"
```

Example workflow:

```yaml
name: Publish Package

on:
    push:
        tags:
            - "v*"

jobs:
    publish:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: 20
                  registry-url: https://registry.npmjs.org/

            - run: npm install

            - run: npm run build --workspace=packages/neuromorph

            - run: npm publish --workspace=packages/neuromorph
              env:
                  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Repository secret required:

```
NPM_TOKEN
```

---

# 18. Production Quality Goals

The final experience should demonstrate:

- refined interaction design
- cinematic environmental visuals
- responsive layout
- smooth animation loops
- thoughtful motion
- accessible controls
- reusable visualization engine

The result should feel like **exploring a living digital forest**, not
interacting with a static canvas demo.
