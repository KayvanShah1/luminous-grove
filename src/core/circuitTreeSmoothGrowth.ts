import p5 from "p5";

const maxDepth = 6;
const maxBranchesPerNode = 3;
const shineSpeed = 130; // pixels per second
const treeScale = 0.92;
const growthDelay = 375; // ms per level
const childDelay = 120; // ms delay between child creation
const growthDuration = 1800; // ms for full branch growth
let swayDirection = { x: 0, y: 0 };
let swayStartTime = 0;
const swayDecayDuration = 3000; // ms

interface BranchOptions {
	angle: number;
	depth: number;
	parent: Branch | null;
	originX?: number;
	originY?: number;
}

interface Position {
	x: number;
	y: number;
	angle: number;
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

	constructor(p: p5, opts: BranchOptions, createdTime: number) {
		this.baseAngle = opts.angle;
		this.animatedAngle = this.baseAngle;
		this.depth = opts.depth;
		this.parent = opts.parent;
		this.originX = opts.originX;
		this.originY = opts.originY;
		this.createdTime = createdTime;
		this.length = p.random(20, 70) * treeScale;
		// Depth-based leaf probability (outer canopy more likely)
		this.hasLeaf = p.random() < p.map(this.depth, 1, maxDepth, 0.55, 0.9, true);
	}

	triggerShine(startTime: number) {
		this.shineProgress = 0;
		this.shineStartTime = startTime;
	}

	update(p: p5, now: number) {
		const t = now / 1000;
		const elapsedSinceCreated = now - this.createdTime;
		this.lengthProgress = p.constrain(elapsedSinceCreated / growthDuration, 0, 1);

		// ✅ A. Skip update if not growing and not shining
		if (this.lengthProgress < 0.05 && this.shineProgress < 0) return;

		if (this.depth >= 2) {
			const swayFactor = 1 / Math.sqrt(this.depth + 1);
			let swayOffset = Math.sin(t + this.depth) * 0.065 * swayFactor;

			// External sway influence
			const swayElapsed = now - swayStartTime;
			if (swayElapsed < swayDecayDuration) {
				const decayFactor = 1 - swayElapsed / swayDecayDuration;

				// one way
				const directionalInfluence = swayDirection.x * 0.00075; // tweak this factor
				const oscillation = Math.sin(t * 2 + this.depth) * 0.003;
				swayOffset += (directionalInfluence + oscillation) * decayFactor;
			}

			this.animatedAngle = this.baseAngle + swayOffset;
		} else {
			this.animatedAngle = this.baseAngle;
		}

		// Grow children after delay
		if (this.children.length === 0 && this.depth < maxDepth) {
			if (elapsedSinceCreated >= this.depth * growthDelay) {
				this.growChildren(p);
			}
		}

		// Shine logic
		if (this.shineProgress >= 0 && this.shineProgress < 1) {
			const shineElapsed = (now - (this.shineStartTime ?? now)) / 1000;
			this.shineProgress = Math.min(1, (shineElapsed * shineSpeed) / (this.length * this.lengthProgress || 1));
			if (this.shineProgress === 1) {
				for (const child of this.children) {
					if (child.shineProgress < 0) child.triggerShine(now);
				}
			}
		}

		for (const child of this.children) child.update(p, now);
	}

	willChildBeVisible(p: p5, angle: number): boolean {
		const start = this.getEndPosition();
		const previewLength = this.length * 0.9;
		const x = start.x + Math.cos(angle) * previewLength;
		const y = start.y + Math.sin(angle) * previewLength;

		// Random relaxed margin between 15 and 40px, scaled by depth
		const randomness = p.random(0, 1);
		const margin = randomness * (1 + this.depth / maxDepth);
		return x >= -margin && x <= p.width + margin && y >= -margin && y <= p.height + margin;
	}

	growChildren(p: p5) {
		// const shouldBranch = this.depth < 2 || p.random() < 0.92;
		const branchProbability = p.map(this.depth, 0, maxDepth, 1.0, 0.4); // deeper = less likely
		const shouldBranch = p.random() < branchProbability;
		// if (!shouldBranch) return;
		if (!shouldBranch && this.depth < 2) return; // early pruning

		const childAngles: number[] = [];

		if (this.depth <= 1) {
			const numChildren = p.int(p.random(2, maxBranchesPerNode + 1));
			const spread = p.PI / 3;
			for (let i = 0; i < numChildren; i++) {
				const offset = (i / (numChildren - 1) - 0.5) * spread;
				const angle = this.baseAngle + offset + p.random(-0.2, 0.2);
				childAngles.push(angle);
			}
		} else {
			const numChildren = p.int(p.random(1, maxBranchesPerNode + 1));
			for (let i = 0; i < numChildren; i++) {
				childAngles.push(this.baseAngle + p.random(-p.PI / 3.5, p.PI / 3.5));
			}
		}

		// Staggered creation
		for (let i = 0; i < childAngles.length; i++) {
			const angle = childAngles[i];
			const delay = childDelay * i;
			const childTime = this.createdTime + delay;

			if (this.willChildBeVisible(p, angle)) {
				this.children.push(
					new Branch(
						p,
						{
							angle,
							depth: this.depth + 1,
							parent: this,
							originX: this.getEndPosition().x,
							originY: this.getEndPosition().y,
						},
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

	getStartPosition(): Position {
		if (!this.parent) {
			return {
				x: this.originX ?? 300,
				y: this.originY ?? 325,
				angle: this.animatedAngle,
			};
		}
		const parentEnd = this.parent.getEndPosition();
		return { x: parentEnd.x, y: parentEnd.y, angle: this.animatedAngle };
	}

	getEndPosition() {
		const { x, y } = this.getStartPosition();
		const len = this.length * this.lengthProgress;
		return {
			x: x + Math.cos(this.animatedAngle) * len,
			y: y + Math.sin(this.animatedAngle) * len,
		};
	}

	draw(p: p5) {
		if (this.lengthProgress < 0.05 && this.shineProgress < 0) return;

		const start = this.getStartPosition();
		const end = this.getEndPosition();

		const maxWeight = 4;
		const minWeight = 0.5;
		const t = this.depth / maxDepth;
		p.strokeWeight(p.lerp(maxWeight, minWeight, t));
		p.stroke(120);
		p.line(start.x, start.y, end.x, end.y);

		// 🌿 Draw leaf at end if this is a terminal branch (attached state only)
		if (this.children.length === 0 && this.hasLeaf && this.lengthProgress >= 0.99) {
			// keep leaves small
			const base = p.map(this.depth, 2, maxDepth, 3, 6, true);
			const pulse = 1 + 0.06 * Math.sin(p.millis() / 500 + this.depth);

			// elliptical shape (wider than tall)
			const leafW = base * 0.65 * pulse;
			const leafH = base * 1.05 * pulse;

			// stable depth-based hue (no per-frame randomness)
			const hue = p.lerp(100, 140, this.depth / maxDepth);

			p.push();
			p.translate(end.x, end.y);
			p.rotate(this.animatedAngle + Math.PI / 2); // align across the branch

			// core leaf
			p.noStroke();
			p.fill(`hsla(${hue}, 100%, 52%, 0.85)`);
			p.ellipse(0, 0, leafW, leafH);

			// subtle halo
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
			// const pulse = 40 * p.lerp(2.0, 0.3, this.depth / maxDepth) + Math.sin(p.millis() / 100 + this.depth) * 4;

			// Config
			const segmentLength = 0.45;
			const steps = 7;
			const trailStart = Math.max(0, this.shineProgress - segmentLength);
			const trailEnd = this.shineProgress;
			const baseLenTrail = this.length * this.lengthProgress;
			// Green (120) → Yellow (60)
			const eased = Math.pow(this.shineProgress, 0.75);
			const shineHue = p.lerp(160, 60, eased);
			(p.drawingContext as CanvasRenderingContext2D).shadowBlur = 10;
			(p.drawingContext as CanvasRenderingContext2D).shadowColor = `hsla(${shineHue}, 100%, 50%, 0.8)`;

			// Draw segmented trail with fading width/opacity
			for (let i = 0; i < steps; i++) {
				const t1 = p.lerp(trailStart, trailEnd, i / steps);
				const t2 = p.lerp(trailStart, trailEnd, (i + 1) / steps);

				const x1 = start.x + Math.cos(this.animatedAngle) * baseLenTrail * t1;
				const y1 = start.y + Math.sin(this.animatedAngle) * baseLenTrail * t1;
				const x2 = start.x + Math.cos(this.animatedAngle) * baseLenTrail * t2;
				const y2 = start.y + Math.sin(this.animatedAngle) * baseLenTrail * t2;

				const fade = (i + 1) / steps;
				const alpha = p.lerp(0.05, 0.5, fade);
				const weight = p.lerp(0.5, 2.5, fade);

				p.strokeWeight(weight);
				const strokeColor = `hsla(${shineHue}, 100%, 65%, ${alpha})`;
				p.stroke(strokeColor);
				p.line(x1, y1, x2, y2);
			}
			(p.drawingContext as CanvasRenderingContext2D).shadowBlur = 0;

			// 🌈 Multicolor glow ripple + core shine
			const rippleCount = 4;
			for (let i = 0; i < rippleCount; i++) {
				const rippleProgress = i / rippleCount;
				const radius = 8 + rippleProgress * 18 + Math.sin(p.millis() / 150 + i) * 2;
				const alpha = 0.12 * (1 - rippleProgress);

				p.noStroke();
				p.fill(`hsla(${shineHue}, 100%, 45%, ${alpha})`);
				p.circle(shineDotX, shineDotY, radius);
			}

			// Core animated glow dot
			const pulseSize = 3.5 + Math.sin(p.millis() / 100 + this.depth) * 1.4;

			p.drawingContext.shadowBlur = 25;
			p.drawingContext.shadowColor = `hsla(${shineHue}, 100%, 60%, 0.9)`;
			p.noStroke();
			p.fill(`hsla(${shineHue}, 100%, 60%, 0.9)`);
			p.circle(shineDotX, shineDotY, pulseSize);

			p.drawingContext.shadowBlur = 0;
			p.noFill();
		}

		for (const child of this.children) child.draw(p);
	}

	isMouseNearBranch(mx: number, my: number): boolean {
		const start = this.getStartPosition();
		const end = this.getEndPosition();

		const d = this.pointToSegmentDistance(mx, my, start.x, start.y, end.x, end.y);
		return d < 8; // threshold in pixels (adjust as needed)
	}

	// Helper for point-line distance
	pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
		const A = px - x1;
		const B = py - y1;
		const C = x2 - x1;
		const D = y2 - y1;

		const dot = A * C + B * D;
		const lenSq = C * C + D * D;
		let param = -1;
		if (lenSq !== 0) param = dot / lenSq;

		let xx, yy;
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

	findClickedBranch(mx: number, my: number): Branch | null {
		if (this.isMouseNearBranch(mx, my)) return this;
		for (const child of this.children) {
			const hit = child.findClickedBranch(mx, my);
			if (hit) return hit;
		}
		return null;
	}
}

function getTimestamp() {
	const now = new Date();
	const pad = (n: number, width = 2) => n.toString().padStart(width, "0");

	const year = now.getUTCFullYear();
	const month = pad(now.getUTCMonth() + 1);
	const day = pad(now.getUTCDate());
	const hour = pad(now.getUTCHours());
	const minute = pad(now.getUTCMinutes());
	const second = pad(now.getUTCSeconds());
	const millis = pad(now.getUTCMilliseconds(), 3);

	const datePart = `${year}${month}${day}`;
	const timePart = `${hour}${minute}${second}${millis}`;

	return `${datePart}T${timePart}`;
}

const circuitTreeWithGrowthSmoothSketch = (p: p5) => {
	let root: Branch;
	let lastShineTime = 0;
	const shineInterval = 3000;
	let canvasElt: HTMLCanvasElement;

	const createTree = () =>
		new Branch(
			p,
			{
				angle: -Math.PI / 2 + p.random(-0.15, 0.15),
				depth: 0,
				parent: null,
				originX: p.width / 2,
				originY: p.height,
			},
			p.millis()
		);

	p.setup = () => {
		const cnv = p.createCanvas(600, 325).class("circuit-tree-canvas");
		canvasElt = cnv.elt as HTMLCanvasElement;

		// Make focusable and focus on click
		canvasElt.setAttribute("tabindex", "0");
		canvasElt.style.outline = "none";
		canvasElt.style.touchAction = "none"; // Disable touch actions
		canvasElt.addEventListener("mousedown", () => canvasElt.focus());

		p.clear();
		p.frameRate(45);
		root = createTree();

		// Disable context menu
		canvasElt.addEventListener("contextmenu", (e) => e.preventDefault());
	};

	p.draw = () => {
		p.clear();
		const now = p.millis();
		root.update(p, now);
		root.draw(p);

		if (now - lastShineTime > shineInterval) {
			root.resetShine();
			root.triggerShine(now);
			lastShineTime = now;
		}
	};

	// p.windowResized = () => {
	// 	p.resizeCanvas(600, 325);
	// 	root = createTree();
	// };

	function applyDirectionalSway(x: number, y: number) {
		const dx = x - p.width / 2;
		const dy = y - p.height;
		swayDirection = { x: dx, y: dy };
		swayStartTime = p.millis();
	}

	p.mousePressed = () => {
		if (!root) return;

		const clickedBranch = root.findClickedBranch(p.mouseX, p.mouseY);
		if (p.mouseButton["left"] == true) {
			if (clickedBranch) {
				applyDirectionalSway(p.mouseX, p.mouseY);
				// root.resetShine();
				// root.triggerShine(p.millis());
				// lastShineTime = p.millis();
			}
		}

		if (p.mouseButton["right"] == true) {
			if (clickedBranch) {
				root.resetShine();
				root.triggerShine(p.millis());
				lastShineTime = p.millis();
			}
		}
	};

	p.doubleClicked = () => {
		if (!root) return;
		if (document.activeElement == canvasElt) {
			// ⬅️ Double click = regenerate new tree
			root = createTree();
			root.triggerShine(p.millis());
			lastShineTime = p.millis();
			return false; // prevent default double click behavior
		}
	};

	p.keyPressed = () => {
		if (document.activeElement == canvasElt && p.key === "s") {
			const filename = `circuit_tree_ss_${getTimestamp()}`;
			p.saveCanvas(filename, "png");
		}
	};
};

export default circuitTreeWithGrowthSmoothSketch;
