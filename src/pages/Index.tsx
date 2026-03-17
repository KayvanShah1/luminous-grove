import { useState, useCallback, useRef } from "react";
import NeuromorphTree from "@/components/NeuromorphTree";
import ForestEnvironment from "@/components/ForestEnvironment";
import InstructionTooltip from "@/components/InstructionTooltip";
import CustomizerPanel from "@/components/CustomizerPanel";
import StatusPill from "@/components/StatusPill";
import DemoFrame from "@/components/DemoFrame";
import { TreeConfig, defaultConfig } from "@/engine/types";

const Index = () => {
  const [config, setConfig] = useState<TreeConfig>({ ...defaultConfig });
  const [nodeCount, setNodeCount] = useState(0);
  const [treeKey, setTreeKey] = useState(0);

  const handleRegenerate = useCallback(() => {
    setTreeKey((k) => k + 1);
  }, []);

  const handleNodeCount = useCallback((count: number) => {
    setNodeCount(count);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background gradient layers */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 120% 80% at 50% 100%, hsla(150, 30%, 8%, 0.8) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsla(180, 20%, 12%, 0.3) 0%, transparent 70%)",
          }}
        />
        {/* Distant forest silhouettes */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.04]"
          style={{
            background: "repeating-conic-gradient(from 0deg at 50% 100%, hsl(150, 30%, 20%) 0deg 2deg, transparent 2deg 8deg)",
          }}
        />
      </div>

      {/* Forest environment particles */}
      <ForestEnvironment />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Hero section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Background title */}
        <h1
          className="absolute font-display font-bold text-foreground/[0.04] select-none pointer-events-none leading-none"
          style={{ fontSize: "clamp(4rem, 12vw, 10rem)", letterSpacing: "-0.04em" }}
        >
          NEUROMORPH
        </h1>

        {/* Tree visualization */}
        <div className="relative w-full tree-canvas-mask" style={{ height: "85vh" }}>
          <NeuromorphTree
            key={treeKey}
            config={config}
            onNodeCount={handleNodeCount}
          />
        </div>

        {/* Tagline */}
        <div className="absolute top-8 left-8 z-20">
          <p className="font-display text-sm text-foreground/30 tracking-widest uppercase glow-text">
            A living architecture of light
          </p>
        </div>
      </section>

      {/* UI Overlays */}
      <CustomizerPanel
        config={config}
        onChange={setConfig}
        onRegenerate={handleRegenerate}
      />
      <InstructionTooltip />
      <StatusPill nodeCount={nodeCount} />
      <DemoFrame />
    </div>
  );
};

export default Index;
