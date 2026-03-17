import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/lib/index.ts",
    core: "src/lib/core.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist-lib",
  splitting: false,
  treeshake: true,
  target: "es2020",
  external: ["react", "react-dom"],
  tsconfig: "tsconfig.lib.json",
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
