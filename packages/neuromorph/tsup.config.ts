import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: {
			index: "src/index.ts",
			core: "src/core.ts",
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
			return { js: format === "cjs" ? ".cjs" : ".js" };
		},
	},
	{
		entry: {
			"core.iife": "src/core.ts",
		},
		format: ["iife"],
		globalName: "Neuromorph",
		sourcemap: true,
		minify: false,
		outDir: "dist",
		target: "es2020",
	},
	{
		entry: {
			"core.iife.min": "src/core.ts",
		},
		format: ["iife"],
		globalName: "Neuromorph",
		sourcemap: false,
		minify: true,
		outDir: "dist",
		target: "es2020",
	},
]);
