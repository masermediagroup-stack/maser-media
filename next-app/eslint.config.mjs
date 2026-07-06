import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored Lightswind demos: not part of the app TS graph (see tsconfig exclude); lint only imported files explicitly if needed.
    "src/components/lightswind/**",
    "!src/components/lightswind/glowing-cards.tsx",
    "!src/components/lightswind/smokey-background.tsx",
    "!src/components/lightswind/ascii-wave.tsx",
  ]),
]);

export default eslintConfig;
