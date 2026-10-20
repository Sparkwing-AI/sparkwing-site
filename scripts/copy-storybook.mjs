import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dest = "public/storybook";
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync("storybook-static", dest, { recursive: true });

writeFileSync(
  join(dest, "robots.txt"),
  "User-agent: *\nDisallow: /\n",
  "utf8"
);
