import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      register: "src/register.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
    loader: {
      ".png": "dataurl",
      ".css": "text",
      ".html": "text",
    },
  },
  {
    entry: {
      "np-hub.min": "src/register.ts",
    },
    format: ["iife"],
    globalName: "SupportWidget",
    dts: false,
    sourcemap: false,
    clean: false,
    minify: true,
    loader: {
      ".png": "dataurl",
      ".css": "text",
      ".html": "text",
    },
  },
]);
