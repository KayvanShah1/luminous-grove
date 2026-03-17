export interface TreeConfig {
  maxDepth: number;
  maxBranches: number;
  branchSpread: number;
  treeScale: number;
  shineSpeed: number;
  swayIntensity: number;
  swayDecay: number;
  growthDelay: number;
  childDelay: number;
  growthDuration: number;
  leafGlowIntensity: number;
  leafDensity: number;
  branchThickness: number;
  glowStrength: number;
  shineInterval: number;
}

export const defaultConfig: TreeConfig = {
  maxDepth: 6,
  maxBranches: 3,
  branchSpread: 50,
  treeScale: 0.92,
  shineSpeed: 130,
  swayIntensity: 0.065,
  swayDecay: 3000,
  growthDelay: 375,
  childDelay: 120,
  growthDuration: 1800,
  leafGlowIntensity: 0.85,
  leafDensity: 0.7,
  branchThickness: 4,
  glowStrength: 25,
  shineInterval: 3000,
};
