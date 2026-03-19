import { defineConfig } from "tsup";

export default defineConfig([
	// 1. Library builds (ESM + CJS)
	{
		entry: {
			index: "src/index.ts", // React wrapper
			core: "src/core.ts", // framework-agnostic engine
		},
		format: ["esm", "cjs"],
		dts: true,
		sourcemap: true,
		clean: true,
		outDir: "dist",
		splitting: false,
		treeshake: true,
		target: "es2020",
		external: ["react", "react-dom"],
		tsconfig: "tsconfig.json",
		outExtension({ format }) {
			return {
				js: format === "cjs" ? ".cjs" : ".js",
			};
		},
	},

	// 2. IIFE (browser global - dev)
	{
		entry: {
			neuromorph: "src/core.ts",
		},
		format: ["iife"],
		globalName: "Neuromorph",
		sourcemap: true,
		minify: false,
		outDir: "dist/iife",
		target: "es2020",
	},

	// 3. IIFE (browser global - prod)
	{
		entry: {
			"neuromorph.min": "src/core.ts",
		},
		format: ["iife"],
		globalName: "Neuromorph",
		sourcemap: false,
		minify: true,
		outDir: "dist/iife",
		target: "es2020",
	},
]);
