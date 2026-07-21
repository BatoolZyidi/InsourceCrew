export type DeliverableOutput = Record<string, unknown>;
export const highlights = (output: DeliverableOutput) =>
  Array.isArray(output.highlights) ? output.highlights.map(String) : [];
export const text = (output: DeliverableOutput, key: string) =>
  String(output[key] || "");

/** Converts variable LLM JSON values into safe, readable UI text. */
export const displayValue = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(displayValue).join(" · ");
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    if (item.value !== undefined && item.evidence !== undefined) {
      return `${displayValue(item.value)} — ${displayValue(item.evidence)}`;
    }
    if (item.value !== undefined) return displayValue(item.value);
    if (item.evidence !== undefined) return displayValue(item.evidence);
    return Object.entries(item)
      .map(([key, entry]) => `${key.replaceAll("_", " ")}: ${displayValue(entry)}`)
      .join(" · ");
  }
  return "Not provided";
};

export const cleanLabel = (value?: string): string =>
  (value || "")
    .replace(/^[^:]+:\s*/, "")
    .replace(/\\n/g, "\n")
    .trim();
