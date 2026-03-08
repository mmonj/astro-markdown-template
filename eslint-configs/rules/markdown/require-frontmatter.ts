import type { Rule } from "eslint";

import { extractFrontmatter, shouldApplyRule } from "./utils";

export const requireFrontmatter: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require title field in frontmatter",
    },
    schema: [
      {
        type: "object",
        properties: {
          dir: {
            type: "string",
            description: "Directory path to enforce this rule for",
          },
        },
        additionalProperties: false,
      },
    ],
  } as const,
  create(context: Rule.RuleContext): Rule.RuleListener {
    const options = (context.options[0] as { dir?: string }) || {};
    const dirFilter = options.dir;
    let alreadyProcessed = false;

    return {
      "*": (node: Rule.Node) => {
        if (alreadyProcessed || (node as unknown as { type: string }).type !== "root") return;

        alreadyProcessed = true;

        // check if the file is in the specified directory if provided
        if (!shouldApplyRule(context.filename, dirFilter)) {
          return;
        }

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
