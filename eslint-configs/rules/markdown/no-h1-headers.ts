import type { Rule } from "eslint";

import { getFrontmatterEndLine, shouldApplyRule } from "./utils";

export const noH1Headers: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow h1 headers in markdown files since the frontmatter title already serves that purpose",
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
        const lines = text.split("\n");
        const frontmatterEndLine = getFrontmatterEndLine(text);

        // check for h1 headers
        for (let i = frontmatterEndLine; i < lines.length; i++) {
          const line = lines[i];
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
