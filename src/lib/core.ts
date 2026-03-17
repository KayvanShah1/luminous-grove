import { TreeController } from "../engine/TreeController";
import { TreeConfig, defaultConfig } from "../engine/types";

export type { TreeConfig };
export { defaultConfig, TreeController };

export interface NeuromorphInstance {
  controller: TreeController;
  destroy: () => void;
  updateConfig: (config: Partial<TreeConfig>) => void;
  regenerate: () => void;
}

export const createNeuromorphTree = (
  container: HTMLElement,
  config: Partial<TreeConfig> = {},
  onNodeCount?: (count: number) => void
): NeuromorphInstance => {
  const controller = new TreeController(config);
  controller.start(container, onNodeCount);

  return {
    controller,
    destroy: () => controller.stop(),
    updateConfig: (next) => controller.updateConfig(next),
    regenerate: () => controller.regenerate(),
  };
};
