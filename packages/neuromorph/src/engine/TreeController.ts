import { TreeConfig, defaultConfig } from "./types";

// Simple seeded random for reproducibility
function makeRandom() {
	return () => Math.random();
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function map(
	value: number,
	start1: number,
	stop1: number,
	start2: number,
	stop2: number,
	clamp = false,
): number {
	const mapped =
		start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
	if (!clamp) return mapped;
	return Math.min(
		Math.max(mapped, Math.min(start2, stop2)),
		Math.max(start2, stop2),
	);
}

function constrain(value: number, low: number, high: number): number {
	return Math.min(Math.max(value, low), high);
}

function randomRange(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

interface Bounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export class TreeController {
	private animFrameId: number | null = null;
	private config: TreeConfig;
	private container: HTMLElement | null = null;
	private canvas: HTMLCanvasElement | null = null;
	private ctx: CanvasRenderingContext2D | null = null;
	private onNodeCountUpdate?: (count: number) => void;
	private root: Branch | null = null;
	private startTime = 0;
	private lastShineTime = 0;
	private swayDirection = { x: 0, y: 0 };
	private swayStartTime = 0;
	private width = 0;
	private height = 0;

	constructor(config: Partial<TreeConfig> = {}) {
		this.config = { ...defaultConfig, ...config };
	}

	start(container: HTMLElement, onNodeCountUpdate?: (count: number) => void) {
		this.container = container;
		this.onNodeCountUpdate = onNodeCountUpdate;
		this.createCanvas();
	}

	stop() {
		if (this.animFrameId !== null) {
			cancelAnimationFrame(this.animFrameId);
			this.animFrameId = null;
		}
		if (this.canvas && this.container) {
			this.canvas.removeEventListener("mousedown", this.handleMouseDown);
			this.canvas.removeEventListener("dblclick", this.handleDblClick);
			this.canvas.removeEventListener(
				"contextmenu",
				this.handleContextMenu,
			);
			this.canvas.removeEventListener("keydown", this.handleKeyDown);
			window.removeEventListener("resize", this.handleResize);
			this.container.removeChild(this.canvas);
			this.canvas = null;
			this.ctx = null;
		}
	}

	updateConfig(newConfig: Partial<TreeConfig>) {
		this.config = { ...this.config, ...newConfig };
	}

	regenerate() {
		if (this.container) {
			this.root = this.createTree();
			this.lastShineTime = 0;
		}
	}

	getConfig(): TreeConfig {
		return { ...this.config };
	}

	countNodes(root: Branch | null): number {
		if (!root) return 0;
		let count = 1;
		for (const child of root.children) {
			count += this.countNodes(child);
		}
		return count;
	}

	private handleContextMenu = (e: Event) => {
		e.preventDefault();
	};

	private handleMouseDown = (e: MouseEvent) => {
		if (!this.root || !this.canvas) return;
		const rect = this.canvas.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;
		if (mx < 0 || mx > this.width || my < 0 || my > this.height) return;

		this.canvas.focus();
		const clickedBranch =
			this.root.findClickedBranch(mx, my, this.config.hitTestRadius) !==
			null;
		if (!clickedBranch) return;

		if (e.button === 0) {
			// Left click - sway
			const dx = mx - this.width / 2;
			const dy = my - this.height;
			this.swayDirection = { x: dx, y: dy };
			this.swayStartTime = performance.now();
		}

		if (e.button === 2) {
			// Right click - signal pulse
			e.preventDefault();
			this.root.resetShine();
			this.root.triggerShine(performance.now());
			this.lastShineTime = performance.now();
		}
	};

	private handleDblClick = () => {
		if (!this.root) return;
		this.root = this.createTree();
		this.root.triggerShine(performance.now());
		this.lastShineTime = performance.now();
	};

	private handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "s" && this.canvas) {
			const now = new Date();
			const filename = `neuromorph_${now.toISOString().replace(/[:.]/g, "")}`;
			const region = this.getScreenshotRegion();
			const exportCanvas = document.createElement("canvas");
			exportCanvas.width = region.width;
			exportCanvas.height = region.height;
			const exportCtx = exportCanvas.getContext("2d");
			if (!exportCtx) return;

			// Keep original rendered resolution, then crop around the tree.
			exportCtx.drawImage(
				this.canvas,
				region.x,
				region.y,
				region.width,
				region.height,
				0,
				0,
				region.width,
				region.height,
			);

			const link = document.createElement("a");
			link.download = `${filename}.png`;
			link.href = exportCanvas.toDataURL("image/png");
			link.click();
		}
	};

	private handleResize = () => {
		if (!this.container || !this.canvas) return;
		const previousWidth = this.width;
		const previousHeight = this.height;
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		if (!this.root) {
			this.root = this.createTree();
			return;
		}

		const dx = this.width / 2 - previousWidth / 2;
		const dy = this.height - previousHeight;
		this.root.translate(dx, dy);
		this.root.updateCanvasBounds(this.width, this.height);
	};

	private getScreenshotRegion(): {
		x: number;
		y: number;
		width: number;
		height: number;
	} {
		const canvasWidth = Math.max(1, this.canvas?.width ?? this.width);
		const canvasHeight = Math.max(1, this.canvas?.height ?? this.height);
		if (!this.root) {
			return { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
		}

		const bounds = this.root.getTreeBounds(this.config);
		const rootStart = this.root.getStartPosition();
		const sidePadding = Math.max(18, this.config.branchThickness * 6);
		const topPadding = Math.max(20, this.config.branchThickness * 7);
		const bottomPadding = Math.max(28, this.config.branchThickness * 10);

		const minX = constrain(bounds.minX - sidePadding, 0, canvasWidth - 1);
		const minY = constrain(bounds.minY - topPadding, 0, canvasHeight - 1);
		const maxX = constrain(bounds.maxX + sidePadding, 1, canvasWidth);
		const maxY = constrain(
			Math.max(bounds.maxY + sidePadding, rootStart.y + bottomPadding),
			1,
			canvasHeight,
		);

		const x = Math.floor(minX);
		const y = Math.floor(minY);
		let width = Math.max(1, Math.ceil(maxX) - x);
		let height = Math.max(1, Math.ceil(maxY) - y);
		let cropX = x;
		let cropY = y;

		// Prevent very tight crops from producing visually tiny screenshots.
		const minCropWidth = Math.min(
			canvasWidth,
			Math.max(420, Math.floor(canvasWidth * 0.52)),
		);
		const minCropHeight = Math.min(
			canvasHeight,
			Math.max(300, Math.floor(canvasHeight * 0.6)),
		);

		if (width < minCropWidth) {
			const grow = minCropWidth - width;
			cropX -= Math.floor(grow / 2);
			width = minCropWidth;
		}

		if (height < minCropHeight) {
			const grow = minCropHeight - height;
			cropY -= Math.floor(grow / 2);
			height = minCropHeight;
		}

		cropX = constrain(cropX, 0, canvasWidth - width);
		cropY = constrain(cropY, 0, canvasHeight - height);

		return { x: cropX, y: cropY, width, height };
	}

	private createTree(): Branch {
		const now = performance.now();
		return new Branch(
			{
				angle: -Math.PI / 2 + randomRange(-0.15, 0.15),
				depth: 0,
				parent: null,
				originX: this.width / 2,
				originY: this.height,
			},
			now,
			this.config,
			this.width,
			this.height,
		);
	}

	private createCanvas() {
		if (!this.container) return;

		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;

		const canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.style.display = "block";
		canvas.style.outline = "none";
		canvas.style.touchAction = "none";
		canvas.setAttribute("tabindex", "0");

		this.container.appendChild(canvas);
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d")!;
		this.startTime = performance.now();

		canvas.addEventListener("mousedown", this.handleMouseDown);
		canvas.addEventListener("dblclick", this.handleDblClick);
		canvas.addEventListener("contextmenu", this.handleContextMenu);
		canvas.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("resize", this.handleResize);

		this.root = this.createTree();
		this.lastShineTime = 0;
		this.loop();
	}

	private loop = () => {
		this.animFrameId = requestAnimationFrame(this.loop);
		if (!this.ctx || !this.root) return;

		const now = performance.now();
		const ctx = this.ctx;

		ctx.clearRect(0, 0, this.width, this.height);

		this.root.updateTree(
			now,
			this.swayDirection,
			this.swayStartTime,
			this.config,
		);
		this.root.drawTree(ctx, this.config);

		if (now - this.lastShineTime > this.config.shineInterval) {
			this.root.resetShine();
			this.root.triggerShine(now);
			this.lastShineTime = now;

			if (this.onNodeCountUpdate) {
				this.onNodeCountUpdate(this.countNodes(this.root));
			}
		}
	};
}

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
	canvasWidth: number;
	canvasHeight: number;

	constructor(
		opts: {
			angle: number;
			depth: number;
			parent: Branch | null;
			originX?: number;
			originY?: number;
		},
		createdTime: number,
		config: TreeConfig,
		canvasWidth: number,
		canvasHeight: number,
	) {
		this.baseAngle = opts.angle;
		this.animatedAngle = this.baseAngle;
		this.depth = opts.depth;
		this.parent = opts.parent;
		this.originX = opts.originX;
		this.originY = opts.originY;
		this.createdTime = createdTime;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.length = randomRange(20, 70) * config.treeScale;
		this.hasLeaf =
			Math.random() <
			(map(this.depth, 1, config.maxDepth, 0.55, 0.9, true) *
				config.leafDensity) /
				0.7;
	}

	triggerShine(startTime: number) {
		this.shineProgress = 0;
		this.shineStartTime = startTime;
	}

	updateTree(
		now: number,
		swayDirection: { x: number; y: number },
		swayStartTime: number,
		config: TreeConfig,
	) {
		const t = now / 1000;
		const elapsedSinceCreated = now - this.createdTime;
		this.lengthProgress = constrain(
			elapsedSinceCreated / config.growthDuration,
			0,
			1,
		);

		if (this.lengthProgress < 0.05 && this.shineProgress < 0) return;

		if (this.depth >= 2) {
			const swayFactor = 1 / Math.sqrt(this.depth + 1);
			let swayOffset =
				Math.sin(t + this.depth) * config.swayIntensity * swayFactor;

			const swayElapsed = now - swayStartTime;
			if (swayElapsed < config.swayDecay) {
				const decayFactor = 1 - swayElapsed / config.swayDecay;
				const directionalInfluence = swayDirection.x * 0.00075;
				const oscillation = Math.sin(t * 2 + this.depth) * 0.003;
				swayOffset +=
					(directionalInfluence + oscillation) * decayFactor;
			}

			this.animatedAngle = this.baseAngle + swayOffset;
		} else {
			this.animatedAngle = this.baseAngle;
		}

		if (this.children.length === 0 && this.depth < config.maxDepth) {
			if (elapsedSinceCreated >= this.depth * config.growthDelay) {
				this.growChildren(config);
			}
		}

		if (this.shineProgress >= 0 && this.shineProgress < 1) {
			const shineElapsed = (now - (this.shineStartTime ?? now)) / 1000;
			this.shineProgress = Math.min(
				1,
				(shineElapsed * config.shineSpeed) /
					(this.length * this.lengthProgress || 1),
			);
			if (this.shineProgress === 1) {
				for (const child of this.children) {
					if (child.shineProgress < 0) child.triggerShine(now);
				}
			}
		}

		for (const child of this.children)
			child.updateTree(now, swayDirection, swayStartTime, config);
	}

	willChildBeVisible(angle: number): boolean {
		const start = this.getEndPosition();
		const previewLength = this.length * 0.9;
		const x = start.x + Math.cos(angle) * previewLength;
		const y = start.y + Math.sin(angle) * previewLength;
		const margin = Math.random() * (1 + this.depth / 6);
		return (
			x >= -margin &&
			x <= this.canvasWidth + margin &&
			y >= -margin &&
			y <= this.canvasHeight + margin
		);
	}

	growChildren(config: TreeConfig) {
		const branchProbability = map(this.depth, 0, config.maxDepth, 1.0, 0.4);
		const shouldBranch = Math.random() < branchProbability;
		if (!shouldBranch && this.depth < 2) return;

		const childAngles: number[] = [];
		const spread = (config.branchSpread / 50) * (Math.PI / 3);

		if (this.depth <= 1) {
			const numChildren = Math.floor(
				randomRange(2, config.maxBranches + 1),
			);
			for (let i = 0; i < numChildren; i++) {
				const offset = (i / (numChildren - 1) - 0.5) * spread;
				const angle = this.baseAngle + offset + randomRange(-0.2, 0.2);
				childAngles.push(angle);
			}
		} else {
			const numChildren = Math.floor(
				randomRange(1, config.maxBranches + 1),
			);
			for (let i = 0; i < numChildren; i++) {
				childAngles.push(
					this.baseAngle + randomRange(-spread / 2, spread / 2),
				);
			}
		}

		for (let i = 0; i < childAngles.length; i++) {
			const angle = childAngles[i];
			const delay = config.childDelay * i;
			const childTime = this.createdTime + delay;

			if (this.willChildBeVisible(angle)) {
				const end = this.getEndPosition();
				this.children.push(
					new Branch(
						{
							angle,
							depth: this.depth + 1,
							parent: this,
							originX: end.x,
							originY: end.y,
						},
						childTime,
						config,
						this.canvasWidth,
						this.canvasHeight,
					),
				);
			}
		}
	}

	resetShine() {
		this.shineProgress = -1;
		this.shineStartTime = null;
		for (const child of this.children) child.resetShine();
	}

	getStartPosition(): { x: number; y: number } {
		if (!this.parent) {
			return {
				x: this.originX ?? this.canvasWidth / 2,
				y: this.originY ?? this.canvasHeight,
			};
		}
		const parentEnd = this.parent.getEndPosition();
		return { x: parentEnd.x, y: parentEnd.y };
	}

	getEndPosition(): { x: number; y: number } {
		const { x, y } = this.getStartPosition();
		const len = this.length * this.lengthProgress;
		return {
			x: x + Math.cos(this.animatedAngle) * len,
			y: y + Math.sin(this.animatedAngle) * len,
		};
	}

	getTreeBounds(config: TreeConfig): Bounds {
		const start = this.getStartPosition();
		const end = this.getEndPosition();
		const thickness = lerp(
			config.branchThickness,
			0.5,
			this.depth / config.maxDepth,
		);
		const branchPad = Math.max(1, thickness / 2);

		let minX = Math.min(start.x, end.x) - branchPad;
		let minY = Math.min(start.y, end.y) - branchPad;
		let maxX = Math.max(start.x, end.x) + branchPad;
		let maxY = Math.max(start.y, end.y) + branchPad;

		if (
			this.children.length === 0 &&
			this.hasLeaf &&
			this.lengthProgress >= 0.99
		) {
			const leafRadius = map(this.depth, 2, config.maxDepth, 3, 6, true) * 1.35;
			minX = Math.min(minX, end.x - leafRadius);
			minY = Math.min(minY, end.y - leafRadius);
			maxX = Math.max(maxX, end.x + leafRadius);
			maxY = Math.max(maxY, end.y + leafRadius);
		}

		if (this.shineProgress >= 0 && this.shineProgress < 1) {
			const baseLen = this.length * this.lengthProgress;
			const shineDotX =
				start.x +
				Math.cos(this.animatedAngle) * baseLen * this.shineProgress;
			const shineDotY =
				start.y +
				Math.sin(this.animatedAngle) * baseLen * this.shineProgress;
			const glowRadius = Math.max(config.glowStrength, 26);
			minX = Math.min(minX, shineDotX - glowRadius);
			minY = Math.min(minY, shineDotY - glowRadius);
			maxX = Math.max(maxX, shineDotX + glowRadius);
			maxY = Math.max(maxY, shineDotY + glowRadius);
		}

		for (const child of this.children) {
			const childBounds = child.getTreeBounds(config);
			minX = Math.min(minX, childBounds.minX);
			minY = Math.min(minY, childBounds.minY);
			maxX = Math.max(maxX, childBounds.maxX);
			maxY = Math.max(maxY, childBounds.maxY);
		}

		return { minX, minY, maxX, maxY };
	}

	isMouseNearBranch(mx: number, my: number, hitTestRadius: number): boolean {
		const start = this.getStartPosition();
		const end = this.getEndPosition();
		const distance = this.pointToSegmentDistance(
			mx,
			my,
			start.x,
			start.y,
			end.x,
			end.y,
		);
		return distance < hitTestRadius;
	}

	pointToSegmentDistance(
		px: number,
		py: number,
		x1: number,
		y1: number,
		x2: number,
		y2: number,
	): number {
		const A = px - x1;
		const B = py - y1;
		const C = x2 - x1;
		const D = y2 - y1;
		const dot = A * C + B * D;
		const lenSq = C * C + D * D;
		let param = -1;
		if (lenSq !== 0) {
			param = dot / lenSq;
		}

		let xx: number;
		let yy: number;
		if (param < 0) {
			xx = x1;
			yy = y1;
		} else if (param > 1) {
			xx = x2;
			yy = y2;
		} else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}

		const dx = px - xx;
		const dy = py - yy;
		return Math.sqrt(dx * dx + dy * dy);
	}

	findClickedBranch(
		mx: number,
		my: number,
		hitTestRadius: number,
	): Branch | null {
		if (this.isMouseNearBranch(mx, my, hitTestRadius)) {
			return this;
		}
		for (const child of this.children) {
			const hit = child.findClickedBranch(mx, my, hitTestRadius);
			if (hit) {
				return hit;
			}
		}
		return null;
	}

	translate(dx: number, dy: number) {
		if (!this.parent) {
			this.originX = (this.originX ?? this.canvasWidth / 2) + dx;
			this.originY = (this.originY ?? this.canvasHeight) + dy;
		}
	}

	updateCanvasBounds(width: number, height: number) {
		this.canvasWidth = width;
		this.canvasHeight = height;
		for (const child of this.children) {
			child.updateCanvasBounds(width, height);
		}
	}

	drawTree(ctx: CanvasRenderingContext2D, config: TreeConfig) {
		if (this.lengthProgress < 0.05 && this.shineProgress < 0) return;

		const start = this.getStartPosition();
		const end = this.getEndPosition();

		const maxWeight = config.branchThickness;
		const minWeight = 0.5;
		const t = this.depth / config.maxDepth;
		const weight = lerp(maxWeight, minWeight, t);

		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);
		ctx.strokeStyle = "rgb(120, 120, 120)";
		ctx.lineWidth = weight;
		ctx.stroke();

		// Leaves
		if (
			this.children.length === 0 &&
			this.hasLeaf &&
			this.lengthProgress >= 0.99
		) {
			const base = map(this.depth, 2, config.maxDepth, 3, 6, true);
			const pulse =
				1 +
				0.06 *
					config.leafGlowIntensity *
					Math.sin(performance.now() / 500 + this.depth);
			const leafW = base * 0.65 * pulse;
			const leafH = base * 1.05 * pulse;
			const hue = lerp(100, 140, this.depth / config.maxDepth);

			ctx.save();
			ctx.translate(end.x, end.y);
			ctx.rotate(this.animatedAngle + Math.PI / 2);

			ctx.beginPath();
			ctx.ellipse(0, 0, leafW / 2, leafH / 2, 0, 0, Math.PI * 2);
			ctx.fillStyle = `hsla(${hue}, 100%, 52%, ${config.leafGlowIntensity})`;
			ctx.fill();

			ctx.beginPath();
			ctx.ellipse(
				0,
				0,
				(leafW * 1.35) / 2,
				(leafH * 1.35) / 2,
				0,
				0,
				Math.PI * 2,
			);
			ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.18)`;
			ctx.lineWidth = 0.6;
			ctx.stroke();

			ctx.restore();
		}

		// Shine trail
		if (this.shineProgress >= 0 && this.shineProgress < 1) {
			const baseLen = this.length * this.lengthProgress;
			const shineDotX =
				start.x +
				Math.cos(this.animatedAngle) * baseLen * this.shineProgress;
			const shineDotY =
				start.y +
				Math.sin(this.animatedAngle) * baseLen * this.shineProgress;

			const segmentLength = 0.45;
			const steps = 7;
			const trailStart = Math.max(0, this.shineProgress - segmentLength);
			const trailEnd = this.shineProgress;
			const eased = Math.pow(this.shineProgress, 0.75);
			const shineHue = lerp(160, 60, eased);

			ctx.shadowBlur = 10;
			ctx.shadowColor = `hsla(${shineHue}, 100%, 50%, 0.8)`;

			for (let i = 0; i < steps; i++) {
				const t1 = lerp(trailStart, trailEnd, i / steps);
				const t2 = lerp(trailStart, trailEnd, (i + 1) / steps);
				const x1 =
					start.x + Math.cos(this.animatedAngle) * baseLen * t1;
				const y1 =
					start.y + Math.sin(this.animatedAngle) * baseLen * t1;
				const x2 =
					start.x + Math.cos(this.animatedAngle) * baseLen * t2;
				const y2 =
					start.y + Math.sin(this.animatedAngle) * baseLen * t2;
				const fade = (i + 1) / steps;
				const alpha = lerp(0.05, 0.5, fade);
				const lineW = lerp(0.5, 2.5, fade);
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.strokeStyle = `hsla(${shineHue}, 100%, 65%, ${alpha})`;
				ctx.lineWidth = lineW;
				ctx.stroke();
			}
			ctx.shadowBlur = 0;

			// Ripples
			for (let i = 0; i < 4; i++) {
				const rippleProgress = i / 4;
				const radius =
					8 +
					rippleProgress * 18 +
					Math.sin(performance.now() / 150 + i) * 2;
				const alpha = 0.12 * (1 - rippleProgress);
				ctx.beginPath();
				ctx.arc(shineDotX, shineDotY, radius / 2, 0, Math.PI * 2);
				ctx.fillStyle = `hsla(${shineHue}, 100%, 45%, ${alpha})`;
				ctx.fill();
			}

			// Pulse dot
			const pulseSize =
				3.5 + Math.sin(performance.now() / 100 + this.depth) * 1.4;
			ctx.shadowBlur = config.glowStrength;
			ctx.shadowColor = `hsla(${shineHue}, 100%, 60%, 0.9)`;
			ctx.beginPath();
			ctx.arc(shineDotX, shineDotY, pulseSize / 2, 0, Math.PI * 2);
			ctx.fillStyle = `hsla(${shineHue}, 100%, 60%, 0.9)`;
			ctx.fill();
			ctx.shadowBlur = 0;
		}

		for (const child of this.children) child.drawTree(ctx, config);
	}
}
