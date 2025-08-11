// /lib/normalize.ts
export type Primitive = string | number | boolean | null | undefined;

export type JSONParseResult =
  | { ok: true; obj: any }
  | { ok: false; error: string };

export function parseJSONSafe(value: any): JSONParseResult {
  if (value === null || value === undefined || value === "") {
    return { ok: true, obj: {} };
  }
  if (typeof value === "object") {
    return { ok: true, obj: value };
  }
  try {
    // direct parse
    const obj = JSON.parse(String(value));
    return { ok: true, obj };
  } catch {
    // try fixing common issues
    try {
      const attempt = String(value)
        .replace(/'/g, '"')
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      const obj = JSON.parse(attempt);
      return { ok: true, obj };
    } catch {
      return { ok: false, error: "Invalid JSON" };
    }
  }
}

export type NumberListResult = { ok: true; arr: number[] } | { ok: false };

export function parseNumberList(value: any): NumberListResult {
  if (value == null || value === "") return { ok: true, arr: [] };
  if (Array.isArray(value)) {
    const arr = value.map(Number).filter((n) => !Number.isNaN(n));
    return { ok: true, arr };
  }

  let s = String(value).trim();
  s = s.replace(/\u00A0/g, " "); // remove non-breaking spaces
  s = s.replace(/^\[|\]$/g, ""); // remove surrounding brackets if present
  s = s.replace(/\s+/g, " "); // collapse multiple spaces into single

  // try JSON parse first
  try {
    const p = JSON.parse(`[${s}]`); // wrap in [] in case we stripped them
    if (Array.isArray(p)) {
      const arr = p.map(Number).filter((n) => !Number.isNaN(n));
      return { ok: true, arr };
    }
  } catch {
    // ignore and continue manual parsing
  }

  // Split by comma
  const parts = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  let arr: number[] = [];

  for (const part of parts) {
    // handle ranges like "1-3" or "1 - 3" or "1  -  3"
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const a = Number(rangeMatch[1]);
      const b = Number(rangeMatch[2]);
      if (b >= a) {
        arr.push(...Array.from({ length: b - a + 1 }, (_, i) => a + i));
      }
    } else {
      const n = Number(part);
      if (!Number.isNaN(n)) arr.push(n);
    }
  }

  // deduplicate and sort
  arr = Array.from(new Set(arr)).sort((a, b) => a - b);

  return arr.length ? { ok: true, arr } : { ok: false };
}

export type StringListResult = { ok: true; arr: string[] } | { ok: false };

export function parseStringList(value: any): StringListResult {
  if (value == null || value === "") return { ok: true, arr: [] };
  if (Array.isArray(value)) return { ok: true, arr: value.map(String) };

  const s = String(value).trim();

  try {
    const p = JSON.parse(s);
    if (Array.isArray(p)) return { ok: true, arr: p.map(String) };
  } catch {}

  const arr = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  return { ok: true, arr };
}
