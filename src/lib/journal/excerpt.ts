export function excerptFromContent(content: string, max = 180): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (singleLine.length <= max) {
    return singleLine;
  }
  return `${singleLine.slice(0, max - 1)}…`;
}
