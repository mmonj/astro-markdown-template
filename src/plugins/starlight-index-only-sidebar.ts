import type { HookParameters } from "@astrojs/starlight/types";

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

type TDirectoryConfig = {
  label: string;
  directory: string;
};

type TSidebarGroup = {
  label: string;
  items: Array<TSidebarItem>;
};

type TSidebarItem = string | TSidebarGroup | { label: string; slug: string };

type TIndexOnlySidebarPluginOptions = {
  directories: Array<TDirectoryConfig>;
  dirnameDeterminesLabel?: boolean;
};

const SITE_DOCS_ROOT = "./src/content/docs";

function getTitleFromFrontmatter(mdFilePath: string): string | null {
  try {
    const content = readFileSync(mdFilePath, "utf-8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const frontmatter = match[1];
    const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
    return titleMatch ? titleMatch[1] : null;
  } catch {
    return null;
  }
}

/**
 * Convert a directory path segment to a human-readable label
 * @param {string} pathSegment - A segment of the path (e.g., "csci-316")
 * @returns {string} - Human-readable label (e.g., "CSCI 316")
 */
function pathSegmentToLabel(pathSegment: string): string {
  let label = pathSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Handle pattern like "csci 316" -> uppercase first group
  const match = label.match(/^([a-z]+) [0-9]{2,}/i);
  if (match) {
    const firstGroup = match[1];
    const uppercasedFirstGroup = firstGroup.toUpperCase();
    label = uppercasedFirstGroup + label.substring(firstGroup.length);
  }

  return label;
}

/**
 * Recursively scan directory for index.md files and build sidebar structure
 */
function buildIndexSidebar(
  dir: string,
  basePath: string = "",
  docsRoot: string,
  dirDeterminesLabel: boolean = false
): Array<TSidebarItem> {
  const items: Array<TSidebarItem> = [];

  try {
    // Check if current dir has an index.md
    if (basePath && !basePath.includes("/")) {
      const indexPath = join(dir, "index.md");
      try {
        statSync(indexPath);
        if (dirDeterminesLabel) {
          const lastSegment = basePath.split("/").pop() || basePath;
          items.push({
            label: pathSegmentToLabel(lastSegment),
            slug: basePath,
          });
        } else {
          items.push(basePath);
        }
      } catch {
        // No index.md in this directory
      }
    }

    const entries = readdirSync(dir).sort();

    for (const entry of entries) {
      if (entry.startsWith(".")) continue;

      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const indexPath = join(fullPath, "index.md");
        const slug = basePath ? `${basePath}/${entry}` : entry;

        try {
          // Check if this directory has an index.md
          statSync(indexPath);

          // Recursively check for subdirectories with index.md
          const subItems = buildIndexSidebar(fullPath, slug, docsRoot, dirDeterminesLabel);
          if (subItems.length > 0) {
            // Create a group for nested items using the directory's title or path
            let groupLabel: string;
            if (dirDeterminesLabel) {
              groupLabel = pathSegmentToLabel(entry);
            } else {
              const title = getTitleFromFrontmatter(indexPath);
              groupLabel = title || entry;
            }
            items.push({
              label: groupLabel,
              items: [dirDeterminesLabel ? { label: groupLabel, slug: slug } : slug, ...subItems],
            });
          } else {
            // No subdirectories with index.md, add as a standalone item
            if (dirDeterminesLabel) {
              items.push({
                label: pathSegmentToLabel(entry),
                slug: slug,
              });
            } else {
              items.push(slug);
            }
          }
        } catch {
          // No index.md in this directory, but check subdirectories
          const subItems = buildIndexSidebar(fullPath, slug, docsRoot, dirDeterminesLabel);
          if (subItems.length > 0) {
            items.push(...subItems);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  // Sort items: strings and page items first, then groups
  return items.sort((a, b) => {
    const aIsGroup = typeof a === "object" && "items" in a;
    const bIsGroup = typeof b === "object" && "items" in b;
    if (!aIsGroup && bIsGroup) return -1;
    if (aIsGroup && !bIsGroup) return 1;

    return 0;
  });
}

export default function starlightIndexOnlySidebar(options: TIndexOnlySidebarPluginOptions) {
  return {
    name: "index-only-sidebar",
    hooks: {
      "config:setup": (hookOptions: HookParameters<"config:setup">) => {
        const { updateConfig } = hookOptions;

        const sidebarItems = options.directories.map((dirConfig) => {
          const dirItems = buildIndexSidebar(
            join(SITE_DOCS_ROOT, dirConfig.directory),
            dirConfig.directory,
            SITE_DOCS_ROOT,
            options.dirnameDeterminesLabel ?? false
          );

          return {
            label: dirConfig.label,
            items: dirItems,
          };
        });

        updateConfig({
          sidebar: sidebarItems,
        });
      },
    },
  };
}
