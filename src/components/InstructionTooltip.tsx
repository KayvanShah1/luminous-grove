import { useState, useEffect } from "react";

const InstructionTooltip = () => {
	const [visible, setVisible] = useState(false);
	const [dismissed, setDismissed] = useState(true);

	useEffect(() => {
		const wasDismissed = localStorage.getItem("nm_tutorial_dismissed");
		if (!wasDismissed) {
			setDismissed(false);
			setVisible(true);
		}
	}, []);

	const dismiss = () => {
		setVisible(false);
		setDismissed(true);
		localStorage.setItem("nm_tutorial_dismissed", "true");
	};

	const toggle = () => {
		if (dismissed && !visible) {
			setVisible(true);
		} else {
			dismiss();
		}
	};

	return (
		<>
			{/* Toggle button */}
			<button
				onClick={toggle}
				className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-8 h-8 sm:w-9 sm:h-9 rounded-full glass-panel flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
				title="Controls"
			>
				<svg
					width="14"
					height="14"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="sm:w-4 sm:h-4"
				>
					<circle
						cx="8"
						cy="8"
						r="7"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
					<text
						x="8"
						y="12"
						textAnchor="middle"
						fill="currentColor"
						fontSize="10"
						fontFamily="var(--font-mono)"
					>
						i
					</text>
				</svg>
			</button>

			{/* Tooltip */}
			{visible && (
				<div
					className="fixed bottom-14 left-4 sm:bottom-16 sm:left-6 z-50 glass-panel glow-border rounded-xl p-3 sm:p-4 w-56 sm:w-64 animate-fade-in-up"
					style={{ animationDuration: "0.3s" }}
				>
					<div className="flex items-center justify-between mb-2 sm:mb-3">
						<span className="text-[10px] sm:text-xs font-display font-semibold tracking-wider uppercase text-foreground/80">
							Controls
						</span>
						<button
							onClick={dismiss}
							className="text-muted-foreground hover:text-foreground transition-colors text-xs"
						>
							✕
						</button>
					</div>
					<div className="space-y-1.5 sm:space-y-2 font-mono text-[10px] sm:text-xs text-muted-foreground">
						<div className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
							<span className="text-foreground/60">
								Tap / Click
							</span>
							<span className="text-primary/80 text-left">
								Apply sway
							</span>
						</div>

						<div className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
							<span className="text-foreground/60">
								Long Press / Right Click
							</span>
							<span className="text-primary/80 text-left">
								Signal pulse
							</span>
						</div>

						<div className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
							<span className="text-foreground/60">
								Double Tap
							</span>
							<span className="text-primary/80 text-left">
								Regenerate
							</span>
						</div>

						<div className="grid grid-cols-[1fr_auto] gap-2 items-baseline">
							<span className="text-foreground/60">Press S</span>
							<span className="text-primary/80 text-left">
								Screenshot
							</span>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default InstructionTooltip;
