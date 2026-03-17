import { useState } from "react";
import NeuromorphTree from "./NeuromorphTree";

const DemoFrame = () => {
  const [minimized, setMinimized] = useState(true);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-16 right-6 z-40 status-pill text-muted-foreground hover:text-foreground transition-colors"
      >
        ◈ Embed Demo
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-40 glass-panel glow-border rounded-2xl overflow-hidden animate-fade-in-up"
      style={{ width: 320, height: 320 }}
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
      <div className="w-full" style={{ height: 288 }}>
        <NeuromorphTree config={{ shineInterval: 2000, treeScale: 0.6, maxDepth: 5 }} />
      </div>
    </div>
  );
};

export default DemoFrame;
