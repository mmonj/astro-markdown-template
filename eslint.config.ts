import js from "@eslint/js";
import markdown from "@eslint/markdown";

import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

import { noH1Headers } from "./eslint-configs/rules/markdown/no-h1-headers";
import { requireFrontmatter } from "./eslint-configs/rules/markdown/require-frontmatter";

export default defineConfig([
  {
    ignores: ["dist/", ".astro/"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,mts,cts}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/**/*.md"],
    plugins: {
      // @ts-expect-error - Type 'typeof plugin' is not assignable to type 'Plugin'.
      markdown,
      custom: {
        rules: {
          "require-frontmatter": requireFrontmatter,
          "no-h1-headers": noH1Headers,
        },
      },
    },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
    rules: {
      "custom/require-frontmatter": "error",
      "custom/no-h1-headers": "error",
      "markdown/no-missing-label-refs": "off",
    },
  },
]);
