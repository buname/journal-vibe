export type ParsedTag = {
  label: string;
  sourceUrl?: string;
};

function toHttpUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Supported linked-tag syntax:
 *   "search|https://youtube.com/..."
 * Everything before "|" is shown as tag label.
 */
export function parseTag(rawTag: string): ParsedTag {
  const value = rawTag.trim();
  if (!value) {
    return { label: "" };
  }

  const separatorIndex = value.indexOf("|");
  if (separatorIndex === -1) {
    return { label: value };
  }

  const label = value.slice(0, separatorIndex).trim();
  const maybeUrl = value.slice(separatorIndex + 1).trim();
  const sourceUrl = toHttpUrl(maybeUrl);

  if (!sourceUrl) {
    return { label: value };
  }

  return { label: label || value, sourceUrl };
}
