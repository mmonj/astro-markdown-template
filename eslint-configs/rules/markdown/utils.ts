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
function getFencedCodeBlockRanges(text: string): Array<[number, number]> {
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

export class FencedCodeBlockTracker {
  private ranges: Array<[number, number]>;
  private currentRangeIndex: number = 0;

  constructor(text: string) {
    this.ranges = getFencedCodeBlockRanges(text);
  }

  isLineInFencedCodeBlock(lineIndex: number): boolean {
    if (this.ranges.length === 0) {
      return false;
    }

    if (this.currentRangeIndex >= this.ranges.length) {
      return false;
    }

    const [start, end] = this.ranges[this.currentRangeIndex];

    if (lineIndex < start) {
      return false;
    }

    if (lineIndex <= end) {
      return true;
    }

    this.currentRangeIndex++;
    if (this.currentRangeIndex >= this.ranges.length) {
      return false;
    }

    const [nextStart, nextEnd] = this.ranges[this.currentRangeIndex];
    if (lineIndex >= nextStart && lineIndex <= nextEnd) {
      return true;
    }

    return false;
  }
}
