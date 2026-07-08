import { defineConfig } from "tsup";
import * as dotenv from "dotenv";

dotenv.config();

declare const process: {
  env: {
    PROD_API_URL?: string;
    DEV_API_URL?: string;
    [key: string]: string | undefined;
  };
};

const envVars = {
  PROD_API_URL: process.env.PROD_API_URL || "https://support-api.company.com",
  DEV_API_URL: process.env.DEV_API_URL || "https://support-api-dev.company.com",
};

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
    env: envVars,
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
    env: envVars,
    loader: {
      ".png": "dataurl",
      ".css": "text",
      ".html": "text",
    },
  },
]);
