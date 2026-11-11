import path from "node:path"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname),
      // `server-only` throws outside a React Server Components bundle.
      // Tests run in plain Node, so swap it for an empty module.
      "server-only": path.resolve(import.meta.dirname, "test/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["test/setup.ts"],
    // These tests talk to a real (possibly remote) Postgres database.
    testTimeout: 30_000,
  },
})
