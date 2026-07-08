import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      register: "src/register.ts",
      react: "src/react/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
    target: "es2018",
    external: ["react", "react-dom"],
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
    target: "es2018",
    loader: {
      ".png": "dataurl",
      ".css": "text",
      ".html": "text",
    },
  },
]);
