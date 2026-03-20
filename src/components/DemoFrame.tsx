import { useState } from "react";
import { NeuromorphTree } from "@kayvanshah1/neuromorph";

const DemoFrame = () => {
  const [minimized, setMinimized] = useState(true);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-[3.25rem] right-4 sm:bottom-16 sm:right-6 z-40 status-pill text-muted-foreground hover:text-foreground transition-colors text-[10px] sm:text-xs"
      >
        ◈ Embed Demo
      </button>
    );
  }

  return (
    <div className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 z-40 glass-panel glow-border rounded-2xl overflow-hidden animate-fade-in-up"
      style={{ width: "min(280px, calc(100vw - 2rem))", height: 280 }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Mini-Morph</span>
        <button
          onClick={() => setMinimized(true)}
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="w-full" style={{ height: 248 }}>
        <NeuromorphTree config={{ shineInterval: 2000, treeScale: 0.6, maxDepth: 5 }} />
      </div>
    </div>
  );
};

export default DemoFrame;
