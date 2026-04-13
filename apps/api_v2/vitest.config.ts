import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		environment: "node",
		testTimeout: 30000,
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
	},
});
