/**
 * Check if the current file path matches the directory filter
 */
export function shouldApplyRule(filename: string, dirFilter: string | undefined): boolean {
  if (!dirFilter) {
    return true;
  }

  const normalizedDir = dirFilter.replace(/\\/g, "/");
  const normalizedPath = filename.replace(/\\/g, "/");

  return normalizedPath.includes(normalizedDir);
}

/**
 * Returns the frontmatter string (without the --- delimiters) if it exists
 */
export function extractFrontmatter(text: string): string | null {
  const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
  return frontmatterMatch ? frontmatterMatch[1] : null;
}

/**
 * Find the line number where frontmatter ends after the closing --- delimiter
 */
export function getFrontmatterEndLine(text: string): number {
  const lines = text.split("\n");

  if (lines[0] !== "---") {
    return 0;
  }

  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      return i + 1;
    }
  }

  return 0; // no closing --- found
}
