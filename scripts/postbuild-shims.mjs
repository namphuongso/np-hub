import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const shims = [
  { name: "react", dist: "react" },
  { name: "widget", dist: "register" },
];

for (const { name, dist } of shims) {
  writeFileSync(
    join(root, `${name}.d.ts`),
    `export * from "./dist/${dist}";\n`,
  );
  writeFileSync(
    join(root, `${name}.js`),
    `export * from "./dist/${dist}.js";\n`,
  );
  writeFileSync(
    join(root, `${name}.cjs`),
    `module.exports = require("./dist/${dist}.cjs");\n`,
  );
}
