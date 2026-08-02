export function formatArchiveTableValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not recorded";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "Not recorded" : value.toISOString();
  }

  if (Array.isArray(value)) {
    const items = value.map(formatArchiveTableValue).filter((item) => item !== "Not recorded");
    return items.length > 0 ? items.join("; ") : "None";
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const body = typeof record.body === "string" ? record.body : null;

    if (body) {
      const author = typeof record.authorName === "string" && record.authorName.trim()
        ? record.authorName.trim()
        : "Internal note";
      const createdAt = typeof record.createdAt === "string" && record.createdAt.trim()
        ? ` (${record.createdAt})`
        : "";
      return `${author}: ${body}${createdAt}`;
    }

    try {
      return JSON.stringify(record);
    } catch {
      return "Structured archive data";
    }
  }

  return String(value);
}