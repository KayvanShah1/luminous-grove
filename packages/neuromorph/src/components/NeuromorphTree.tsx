import { useEffect, useRef } from "react";
import { TreeController } from "../engine/TreeController";
import { TreeConfig } from "../engine/types";

export interface NeuromorphTreeProps {
  config?: Partial<TreeConfig>;
  className?: string;
  onNodeCount?: (count: number) => void;
}

const NeuromorphTree = ({ config, className = "", onNodeCount }: NeuromorphTreeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<TreeController | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new TreeController(config);
    controllerRef.current = controller;
    controller.start(containerRef.current, onNodeCount);

    return () => {
      controller.stop();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (controllerRef.current && config) {
      controllerRef.current.updateConfig(config);
    }
  }, [config]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
};

export default NeuromorphTree;
