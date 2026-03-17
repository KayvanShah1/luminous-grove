import p5 from "p5";
import { TreeConfig, defaultConfig } from "./types";

export class TreeController {
  private p5Instance: p5 | null = null;
  private config: TreeConfig;
  private container: HTMLElement | null = null;
  private onNodeCountUpdate?: (count: number) => void;

  constructor(config: Partial<TreeConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  start(container: HTMLElement, onNodeCountUpdate?: (count: number) => void) {
    this.container = container;
    this.onNodeCountUpdate = onNodeCountUpdate;
    this.createSketch();
  }

  stop() {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
  }

  updateConfig(newConfig: Partial<TreeConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  regenerate() {
    if (this.container) {
      this.stop();
      this.createSketch();
    }
  }

  getConfig(): TreeConfig {
    return { ...this.config };
  }

  private countNodes(root: any): number {
    let count = 1;
    if (root.children) {
      for (const child of root.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  private createSketch() {
    if (!this.container) return;

    const config = this.config;
    const controller = this;
    const onNodeCount = this.onNodeCountUpdate;

    const sketch = (p: p5) => {
      let root: any;
      let lastShineTime = 0;
      let canvasElt: HTMLCanvasElement;
      let swayDirection = { x: 0, y: 0 };
      let swayStartTime = 0;

      class Branch {
        baseAngle: number;
        animatedAngle: number;
        depth: number;
        length: number;
        lengthProgress = 0;
        children: Branch[] = [];
        parent: Branch | null;
        shineProgress = -1;
        shineStartTime: number | null = null;
        originX?: number;
        originY?: number;
        createdTime: number;
        hasLeaf: boolean;

        constructor(opts: { angle: number; depth: number; parent: Branch | null; originX?: number; originY?: number }, createdTime: number) {
          this.baseAngle = opts.angle;
          this.animatedAngle = this.baseAngle;
          this.depth = opts.depth;
          this.parent = opts.parent;
          this.originX = opts.originX;
          this.originY = opts.originY;
          this.createdTime = createdTime;
          this.length = p.random(20, 70) * config.treeScale;
          this.hasLeaf = p.random() < p.map(this.depth, 1, config.maxDepth, 0.55, 0.9, true) * config.leafDensity / 0.7;
        }

        triggerShine(startTime: number) {
          this.shineProgress = 0;
          this.shineStartTime = startTime;
        }

        update(now: number) {
          const t = now / 1000;
          const elapsedSinceCreated = now - this.createdTime;
          this.lengthProgress = p.constrain(elapsedSinceCreated / config.growthDuration, 0, 1);

          if (this.lengthProgress < 0.05 && this.shineProgress < 0) return;

          if (this.depth >= 2) {
            const swayFactor = 1 / Math.sqrt(this.depth + 1);
            let swayOffset = Math.sin(t + this.depth) * config.swayIntensity * swayFactor;

            const swayElapsed = now - swayStartTime;
            if (swayElapsed < config.swayDecay) {
              const decayFactor = 1 - swayElapsed / config.swayDecay;
              const directionalInfluence = swayDirection.x * 0.00075;
              const oscillation = Math.sin(t * 2 + this.depth) * 0.003;
              swayOffset += (directionalInfluence + oscillation) * decayFactor;
            }

            this.animatedAngle = this.baseAngle + swayOffset;
          } else {
            this.animatedAngle = this.baseAngle;
          }

          if (this.children.length === 0 && this.depth < config.maxDepth) {
            if (elapsedSinceCreated >= this.depth * config.growthDelay) {
              this.growChildren();
            }
          }

          if (this.shineProgress >= 0 && this.shineProgress < 1) {
            const shineElapsed = (now - (this.shineStartTime ?? now)) / 1000;
            this.shineProgress = Math.min(1, (shineElapsed * config.shineSpeed) / (this.length * this.lengthProgress || 1));
            if (this.shineProgress === 1) {
              for (const child of this.children) {
                if (child.shineProgress < 0) child.triggerShine(now);
              }
            }
          }

          for (const child of this.children) child.update(now);
        }

        willChildBeVisible(angle: number): boolean {
          const start = this.getEndPosition();
          const previewLength = this.length * 0.9;
          const x = start.x + Math.cos(angle) * previewLength;
          const y = start.y + Math.sin(angle) * previewLength;
          const randomness = p.random(0, 1);
          const margin = randomness * (1 + this.depth / config.maxDepth);
          return x >= -margin && x <= p.width + margin && y >= -margin && y <= p.height + margin;
        }

        growChildren() {
          const branchProbability = p.map(this.depth, 0, config.maxDepth, 1.0, 0.4);
          const shouldBranch = p.random() < branchProbability;
          if (!shouldBranch && this.depth < 2) return;

          const childAngles: number[] = [];
          const spread = (config.branchSpread / 50) * (p.PI / 3);

          if (this.depth <= 1) {
            const numChildren = p.int(p.random(2, config.maxBranches + 1));
            for (let i = 0; i < numChildren; i++) {
              const offset = (i / (numChildren - 1) - 0.5) * spread;
              const angle = this.baseAngle + offset + p.random(-0.2, 0.2);
              childAngles.push(angle);
            }
          } else {
            const numChildren = p.int(p.random(1, config.maxBranches + 1));
            for (let i = 0; i < numChildren; i++) {
              childAngles.push(this.baseAngle + p.random(-spread / 2, spread / 2));
            }
          }

          for (let i = 0; i < childAngles.length; i++) {
            const angle = childAngles[i];
            const delay = config.childDelay * i;
            const childTime = this.createdTime + delay;

            if (this.willChildBeVisible(angle)) {
              this.children.push(
                new Branch(
                  { angle, depth: this.depth + 1, parent: this, originX: this.getEndPosition().x, originY: this.getEndPosition().y },
                  childTime
                )
              );
            }
          }
        }

        resetShine() {
          this.shineProgress = -1;
          this.shineStartTime = null;
          for (const child of this.children) child.resetShine();
        }

        getStartPosition() {
          if (!this.parent) {
            return { x: this.originX ?? p.width / 2, y: this.originY ?? p.height, angle: this.animatedAngle };
          }
          const parentEnd = this.parent.getEndPosition();
          return { x: parentEnd.x, y: parentEnd.y, angle: this.animatedAngle };
        }

        getEndPosition() {
          const { x, y } = this.getStartPosition();
          const len = this.length * this.lengthProgress;
          return { x: x + Math.cos(this.animatedAngle) * len, y: y + Math.sin(this.animatedAngle) * len };
        }

        draw() {
          if (this.lengthProgress < 0.05 && this.shineProgress < 0) return;

          const start = this.getStartPosition();
          const end = this.getEndPosition();

          const maxWeight = config.branchThickness;
          const minWeight = 0.5;
          const t = this.depth / config.maxDepth;
          p.strokeWeight(p.lerp(maxWeight, minWeight, t));
          p.stroke(120);
          p.line(start.x, start.y, end.x, end.y);

          // Leaves
          if (this.children.length === 0 && this.hasLeaf && this.lengthProgress >= 0.99) {
            const base = p.map(this.depth, 2, config.maxDepth, 3, 6, true);
            const pulse = 1 + 0.06 * config.leafGlowIntensity * Math.sin(p.millis() / 500 + this.depth);
            const leafW = base * 0.65 * pulse;
            const leafH = base * 1.05 * pulse;
            const hue = p.lerp(100, 140, this.depth / config.maxDepth);

            p.push();
            p.translate(end.x, end.y);
            p.rotate(this.animatedAngle + Math.PI / 2);
            p.noStroke();
            p.fill(`hsla(${hue}, 100%, 52%, ${config.leafGlowIntensity})`);
            p.ellipse(0, 0, leafW, leafH);
            p.noFill();
            p.strokeWeight(0.6);
            p.stroke(`hsla(${hue}, 100%, 60%, 0.18)`);
            p.ellipse(0, 0, leafW * 1.35, leafH * 1.35);
            p.pop();
          }

          // Shine trail
          if (this.shineProgress >= 0 && this.shineProgress < 1) {
            const baseLen = this.length * this.lengthProgress;
            const shineDotX = start.x + Math.cos(this.animatedAngle) * baseLen * this.shineProgress;
            const shineDotY = start.y + Math.sin(this.animatedAngle) * baseLen * this.shineProgress;

            const segmentLength = 0.45;
            const steps = 7;
            const trailStart = Math.max(0, this.shineProgress - segmentLength);
            const trailEnd = this.shineProgress;
            const eased = Math.pow(this.shineProgress, 0.75);
            const shineHue = p.lerp(160, 60, eased);

            const ctx = p.drawingContext as CanvasRenderingContext2D;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsla(${shineHue}, 100%, 50%, 0.8)`;

            for (let i = 0; i < steps; i++) {
              const t1 = p.lerp(trailStart, trailEnd, i / steps);
              const t2 = p.lerp(trailStart, trailEnd, (i + 1) / steps);
              const x1 = start.x + Math.cos(this.animatedAngle) * baseLen * t1;
              const y1 = start.y + Math.sin(this.animatedAngle) * baseLen * t1;
              const x2 = start.x + Math.cos(this.animatedAngle) * baseLen * t2;
              const y2 = start.y + Math.sin(this.animatedAngle) * baseLen * t2;
              const fade = (i + 1) / steps;
              const alpha = p.lerp(0.05, 0.5, fade);
              const weight = p.lerp(0.5, 2.5, fade);
              p.strokeWeight(weight);
              p.stroke(`hsla(${shineHue}, 100%, 65%, ${alpha})`);
              p.line(x1, y1, x2, y2);
            }
            ctx.shadowBlur = 0;

            const rippleCount = 4;
            for (let i = 0; i < rippleCount; i++) {
              const rippleProgress = i / rippleCount;
              const radius = 8 + rippleProgress * 18 + Math.sin(p.millis() / 150 + i) * 2;
              const alpha = 0.12 * (1 - rippleProgress);
              p.noStroke();
              p.fill(`hsla(${shineHue}, 100%, 45%, ${alpha})`);
              p.circle(shineDotX, shineDotY, radius);
            }

            const pulseSize = 3.5 + Math.sin(p.millis() / 100 + this.depth) * 1.4;
            ctx.shadowBlur = config.glowStrength;
            ctx.shadowColor = `hsla(${shineHue}, 100%, 60%, 0.9)`;
            p.noStroke();
            p.fill(`hsla(${shineHue}, 100%, 60%, 0.9)`);
            p.circle(shineDotX, shineDotY, pulseSize);
            ctx.shadowBlur = 0;
            p.noFill();
          }

          for (const child of this.children) child.draw();
        }

        findClickedBranch(mx: number, my: number): Branch | null {
          const start = this.getStartPosition();
          const end = this.getEndPosition();
          const d = pointToSegmentDistance(mx, my, start.x, start.y, end.x, end.y);
          if (d < 8) return this;
          for (const child of this.children) {
            const hit = child.findClickedBranch(mx, my);
            if (hit) return hit;
          }
          return null;
        }
      }

      function pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
      }

      const createTree = () => {
        const tree = new Branch(
          { angle: -Math.PI / 2 + p.random(-0.15, 0.15), depth: 0, parent: null, originX: p.width / 2, originY: p.height },
          p.millis()
        );
        return tree;
      };

      p.setup = () => {
        const w = controller.container!.clientWidth;
        const h = controller.container!.clientHeight;
        const cnv = p.createCanvas(w, h);
        canvasElt = cnv.elt as HTMLCanvasElement;
        canvasElt.setAttribute("tabindex", "0");
        canvasElt.style.outline = "none";
        canvasElt.style.touchAction = "none";
        canvasElt.addEventListener("mousedown", () => canvasElt.focus());
        canvasElt.addEventListener("contextmenu", (e) => e.preventDefault());
        p.clear();
        p.frameRate(45);
        root = createTree();
      };

      p.draw = () => {
        p.clear();
        const now = p.millis();
        root.update(now);
        root.draw();

        if (now - lastShineTime > config.shineInterval) {
          root.resetShine();
          root.triggerShine(now);
          lastShineTime = now;

          if (onNodeCount) {
            onNodeCount(controller.countNodes(root));
          }
        }
      };

      p.windowResized = () => {
        if (controller.container) {
          const w = controller.container.clientWidth;
          const h = controller.container.clientHeight;
          p.resizeCanvas(w, h);
          root = createTree();
        }
      };

      p.mousePressed = () => {
        if (!root) return;
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;

        if (p.mouseButton === p.LEFT) {
          const dx = p.mouseX - p.width / 2;
          const dy = p.mouseY - p.height;
          swayDirection = { x: dx, y: dy };
          swayStartTime = p.millis();
        }

        if (p.mouseButton === p.RIGHT) {
          root.resetShine();
          root.triggerShine(p.millis());
          lastShineTime = p.millis();
        }
      };

      p.doubleClicked = () => {
        if (!root) return;
        if (document.activeElement === canvasElt) {
          root = createTree();
          root.triggerShine(p.millis());
          lastShineTime = p.millis();
          return false;
        }
      };

      p.keyPressed = () => {
        if (document.activeElement === canvasElt && p.key === "s") {
          const now = new Date();
          const filename = `neuromorph_${now.toISOString().replace(/[:.]/g, "")}`;
          p.saveCanvas(filename, "png");
        }
      };
    };

    this.p5Instance = new p5(sketch, this.container);
  }
}
