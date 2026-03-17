import { useState } from "react";
import { Github, SlidersHorizontal } from "lucide-react";
import { TreeConfig, defaultConfig } from "@/engine/types";

interface CustomizerPanelProps {
  config: TreeConfig;
  onChange: (config: TreeConfig) => void;
  onRegenerate: () => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

const SliderRow = ({ label, value, min, max, step = 1, onChange }: SliderRowProps) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
    <div className="flex items-center gap-2 flex-1 justify-end">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-track w-20"
      />
      <span className="font-mono text-xs text-foreground/70 w-10 text-right tabular-nums">
        {step < 1 ? value.toFixed(2) : value}
      </span>
    </div>
  </div>
);

const CustomizerPanel = ({ config, onChange, onRegenerate }: CustomizerPanelProps) => {
  const [collapsed, setCollapsed] = useState(true);

  const update = (key: keyof TreeConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  if (collapsed) {
    return (
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setCollapsed(false)}
          className="glass-panel glow-border rounded-xl px-4 py-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
        >
          <SlidersHorizontal size={14} />
          Tune
        </button>
        <a
          href="https://github.com/kayvanshah1/luminous-grove"
          target="_blank"
          rel="noreferrer"
          className="glass-panel glow-border rounded-xl px-3 py-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          aria-label="Open GitHub repository"
        >
          <Github size={14} />
          GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-50 glass-panel glow-border rounded-2xl p-5 w-72 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-display font-semibold tracking-wider uppercase text-foreground/80">
          Parameters
        </span>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/kayvanshah1/luminous-grove"
            target="_blank"
            rel="noreferrer"
            className="glass-panel glow-border rounded-lg px-2 py-1 text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 text-[10px] font-mono"
            aria-label="Open GitHub repository"
          >
            <Github size={12} />
            GitHub
          </a>
          <button
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tree Structure */}
      <div className="mb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary/50 mb-2 block">Structure</span>
        <div className="space-y-2">
          <SliderRow label="Depth" value={config.maxDepth} min={2} max={8} onChange={(v) => update("maxDepth", v)} />
          <SliderRow label="Branches" value={config.maxBranches} min={1} max={5} onChange={(v) => update("maxBranches", v)} />
          <SliderRow label="Spread" value={config.branchSpread} min={10} max={100} onChange={(v) => update("branchSpread", v)} />
          <SliderRow label="Scale" value={config.treeScale} min={0.4} max={1.5} step={0.05} onChange={(v) => update("treeScale", v)} />
        </div>
      </div>

      {/* Animation */}
      <div className="mb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary/50 mb-2 block">Animation</span>
        <div className="space-y-2">
          <SliderRow label="Shine" value={config.shineSpeed} min={30} max={300} onChange={(v) => update("shineSpeed", v)} />
          <SliderRow label="Sway" value={config.swayIntensity} min={0} max={0.2} step={0.005} onChange={(v) => update("swayIntensity", v)} />
          <SliderRow label="Decay" value={config.swayDecay} min={500} max={8000} step={100} onChange={(v) => update("swayDecay", v)} />
        </div>
      </div>

      {/* Growth */}
      <div className="mb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary/50 mb-2 block">Growth</span>
        <div className="space-y-2">
          <SliderRow label="Delay" value={config.growthDelay} min={100} max={1000} step={25} onChange={(v) => update("growthDelay", v)} />
          <SliderRow label="Duration" value={config.growthDuration} min={500} max={4000} step={100} onChange={(v) => update("growthDuration", v)} />
        </div>
      </div>

      {/* Visual */}
      <div className="mb-4">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary/50 mb-2 block">Visual</span>
        <div className="space-y-2">
          <SliderRow label="Leaf Glow" value={config.leafGlowIntensity} min={0} max={1} step={0.05} onChange={(v) => update("leafGlowIntensity", v)} />
          <SliderRow label="Leaf Density" value={config.leafDensity} min={0.1} max={1} step={0.05} onChange={(v) => update("leafDensity", v)} />
          <SliderRow label="Thickness" value={config.branchThickness} min={1} max={8} step={0.5} onChange={(v) => update("branchThickness", v)} />
          <SliderRow label="Glow" value={config.glowStrength} min={0} max={50} onChange={(v) => update("glowStrength", v)} />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChange({ ...defaultConfig })}
          className="flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-wider bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors border border-border/30"
        >
          Reset
        </button>
        <button
          onClick={onRegenerate}
          className="flex-1 py-2 rounded-lg text-xs font-mono uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
};

export default CustomizerPanel;


