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
  const frontmatterMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
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

/**
 * Find all fenced code block ranges in the text
 * Returns an array of [startLine, endLine] pairs (0-indexed)
 * Correctly handles indented code blocks (e.g., nested under list items)
 * because fence delimiters are detected anywhere on the line after trimming
 */
export function getFencedCodeBlockRanges(text: string): Array<[number, number]> {
  const lines = text.split("\n");
  const ranges: Array<[number, number]> = [];

  let inCodeBlock = false;
  let blockStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for fence delimiter regardless of indentation level
    if (/^(```|~~~)/.test(trimmed)) {
      if (inCodeBlock) {
        // End of code block
        ranges.push([blockStartLine, i]);
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
        blockStartLine = i;
      }
    }
  }

  // If there's an unclosed code block at EOF, still track it
  if (inCodeBlock) {
    ranges.push([blockStartLine, lines.length - 1]);
  }

  return ranges;
}

/**
 * Check if a line index is inside a fenced code block
 * Uses binary search for O(log n) efficiency on sorted ranges
 */
export function isLineInFencedCodeBlock(
  lineIndex: number,
  codeBlockRanges: Array<[number, number]>
): boolean {
  let left = 0;
  let right = codeBlockRanges.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const [start, end] = codeBlockRanges[mid];

    if (lineIndex < start) {
      right = mid - 1;
    } else if (lineIndex > end) {
      left = mid + 1;
    } else {
      return true;
    }
  }

  return false;
}
