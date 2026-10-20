import { copyFileSync, cpSync, mkdirSync } from "node:fs";

const rootFiles = [
  "tokens.css",
  "tokens.json",
  "fonts.css",
  "components.css",
  "styles.css",
  "pricing-config.js",
  "CNAME",
  "favicon.ico",
];

mkdirSync("public", { recursive: true });

for (const file of rootFiles) {
  copyFileSync(file, `public/${file}`);
}

cpSync("assets", "public/assets", { recursive: true });
