import type { Rule } from "eslint";

import { extractFrontmatter } from "./utils";

export const requireFrontmatter: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require title field in frontmatter",
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
        const frontmatter = extractFrontmatter(text);

        if (frontmatter) {
          if (!/^\s*title\s*:/m.test(frontmatter)) {
            context.report({
              loc: { line: 1, column: 0 },
              message: "Missing required 'title' field in frontmatter",
            });
          }
        } else {
          context.report({
            loc: { line: 1, column: 0 },
            message: "Missing frontmatter",
          });
        }
      },
    };
  },
};
