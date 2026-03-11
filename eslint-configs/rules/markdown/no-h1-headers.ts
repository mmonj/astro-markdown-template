import type { Rule } from "eslint";

import { getFencedCodeBlockRanges, getFrontmatterEndLine, isLineInFencedCodeBlock } from "./utils";

export const noH1Headers: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow h1 headers in markdown files since the frontmatter title already serves that purpose",
    },
  } as const,
  create(context: Rule.RuleContext): Rule.RuleListener {
    let alreadyProcessed = false;

    return {
      "*": (node: Rule.Node) => {
        if (alreadyProcessed || (node as unknown as { type: string }).type !== "root") return;

        alreadyProcessed = true;

        const sourceCode = context.sourceCode;
        if (!sourceCode) return;

        const text = sourceCode.getText();
        const lines = text.split("\n");
        const frontmatterEndLine = getFrontmatterEndLine(text);
        const codeBlockRanges = getFencedCodeBlockRanges(text);

        // check for h1 headers
        for (let i = frontmatterEndLine; i < lines.length; i++) {
          const line = lines[i];

          // skip lines inside fenced code blocks
          if (isLineInFencedCodeBlock(i, codeBlockRanges)) {
            continue;
          }

          if (/^#\s+/.test(line)) {
            context.report({
              loc: { line: i + 1, column: 0 },
              message:
                "H1 headings are not allowed in Astro markdown files; use the frontmatter title field instead",
            });
          }
        }
      },
    };
  },
};
