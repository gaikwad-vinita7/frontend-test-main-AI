import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { plugin as mdPlugin, Mode } from "vite-plugin-markdown";

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss(),
    mdPlugin({ mode: [Mode.HTML, Mode.TOC] }),
  ],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
  server: {
    fs: {
      allow: ["./README.md"],
    },
  },
});
