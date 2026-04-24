import js from "@eslint/js";
import markdown from "@eslint/markdown";

import cannoliMarkdown from "eslint-cannoli-plugins";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

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
      cannoliMarkdown,
    },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
    rules: {
      "markdown/no-missing-label-refs": "off",
      "markdown/no-duplicate-headings": "off",
      "cannoliMarkdown/no-h1-headers": "error",
      "cannoliMarkdown/enforce-link-convention": "error",
      "cannoliMarkdown/no-escape-latex-delimiters": "warn",
      "cannoliMarkdown/enforce-frontmatter-schema": [
        "error",
        {
          title: "*",
        },
      ],
      // "cannoliMarkdown/require-blank-line-after-html": "error",
      // "cannoliMarkdown/require-display-math-formatting": "error",
      // "cannoliMarkdown/inline-math-alone-on-line": "error",
      // "cannoliMarkdown/validate-latex-delimiters": "error",
    },
  },
]);
