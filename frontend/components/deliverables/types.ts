export type DeliverableOutput = Record<string, unknown>;
export const highlights = (output: DeliverableOutput) =>
  Array.isArray(output.highlights) ? output.highlights.map(String) : [];
export const text = (output: DeliverableOutput, key: string) =>
  String(output[key] || "");
