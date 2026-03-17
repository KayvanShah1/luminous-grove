import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	server: {
		host: "::",
		port: 8080,
		hmr: {
			overlay: false,
		},
	},
	plugins: [react()],
	base: (() => {
		if (mode !== "production") return "/";
		const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
		if (repo && repo.endsWith(".github.io")) return "/";
		return `/${repo ?? "luminous-grove"}/`;
	})(),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
