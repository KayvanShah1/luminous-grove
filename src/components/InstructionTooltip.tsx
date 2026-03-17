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
        className="fixed bottom-6 left-6 z-50 w-9 h-9 rounded-full glass-panel flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        title="Controls"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <text x="8" y="12" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="var(--font-mono)">i</text>
        </svg>
      </button>

      {/* Tooltip */}
      {visible && (
        <div
          className="fixed bottom-16 left-6 z-50 glass-panel glow-border rounded-xl p-4 w-64 animate-fade-in-up"
          style={{ animationDuration: "0.3s" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-display font-semibold tracking-wider uppercase text-foreground/80">Controls</span>
            <button
              onClick={dismiss}
              className="text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 font-mono text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="text-foreground/60">Left Click</span>
              <span className="text-primary/80">Apply sway</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Right Click</span>
              <span className="text-primary/80">Signal pulse</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Double Click</span>
              <span className="text-primary/80">Regenerate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">S</span>
              <span className="text-primary/80">Screenshot</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructionTooltip;
