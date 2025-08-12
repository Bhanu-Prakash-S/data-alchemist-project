// /lib/normalize.ts
export type Primitive = string | number | boolean | null | undefined;

export type JSONParseResult =
  | { ok: true; obj: any }
  | { ok: false; error: string };

export type NumberListResult = { ok: true; arr: number[] } | { ok: false };

// export function parseNumberList(value: any): NumberListResult {
//   if (value == null || value === "") return { ok: true, arr: [] };
//   if (Array.isArray(value)) {
//     const arr = value.map(Number).filter((n) => !Number.isNaN(n));
//     return { ok: true, arr };
//   }

//   let s = String(value).trim();
//   s = s.replace(/\u00A0/g, " "); // remove non-breaking spaces
//   s = s.replace(/^\[|\]$/g, ""); // remove surrounding brackets if present
//   s = s.replace(/\s+/g, " "); // collapse multiple spaces into single

//   // try JSON parse first
//   try {
//     const p = JSON.parse(`[${s}]`); // wrap in [] in case we stripped them
//     if (Array.isArray(p)) {
//       const arr = p.map(Number).filter((n) => !Number.isNaN(n));
//       return { ok: true, arr };
//     }
//   } catch {
//     // ignore and continue manual parsing
//   }

//   // Split by comma
//   const parts = s
//     .split(",")
//     .map((p) => p.trim())
//     .filter(Boolean);
//   let arr: number[] = [];

//   for (const part of parts) {
//     // handle ranges like "1-3" or "1 - 3" or "1  -  3"
//     const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
//     if (rangeMatch) {
//       const a = Number(rangeMatch[1]);
//       const b = Number(rangeMatch[2]);
//       if (b >= a) {
//         arr.push(...Array.from({ length: b - a + 1 }, (_, i) => a + i));
//       }
//     } else {
//       const n = Number(part);
//       if (!Number.isNaN(n)) arr.push(n);
//     }
//   }

//   // deduplicate and sort
//   arr = Array.from(new Set(arr)).sort((a, b) => a - b);

//   return arr.length ? { ok: true, arr } : { ok: false };
// }

export type StringListResult = { ok: true; arr: string[] } | { ok: false };

// export function parseStringList(value: any): StringListResult {
//   if (value == null || value === "") return { ok: true, arr: [] };
//   if (Array.isArray(value)) return { ok: true, arr: value.map(String) };

//   const s = String(value).trim();

//   try {
//     const p = JSON.parse(s);
//     if (Array.isArray(p)) return { ok: true, arr: p.map(String) };
//   } catch {}

//   const arr = s
//     .split(",")
//     .map((p) => p.trim())
//     .filter(Boolean);

//   return { ok: true, arr };
// }

export function parseJSONSafe(
  value: any
): { ok: true; parsed: any } | { ok: false; error: string } {
  if (value === null || value === undefined || value === "")
    return { ok: true, parsed: {} };
  if (typeof value === "object") return { ok: true, parsed: value };
  try {
    const parsed = JSON.parse(String(value));
    return { ok: true, parsed };
  } catch {
    try {
      const attempt = String(value)
        .replace(/'/g, '"')
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");
      const parsed = JSON.parse(attempt);
      return { ok: true, parsed };
    } catch {
      return { ok: false, error: "Invalid JSON" };
    }
  }
}

// Strict numeric-only parser
export function parseNumberList(
  value: any
): { ok: true; arr: number[] } | { ok: false } {
  if (value == null || value === "") return { ok: true, arr: [] };
  const s = String(value).trim();
  if (!s) return { ok: true, arr: [] };

  let nums: number[] = [];

  // First, try to parse as JSON array (handles [1,2,3] format)
  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        const validNums = parsed
          .map((n) => Number(n))
          .filter((n) => !Number.isNaN(n));
        if (validNums.length > 0) {
          return { ok: true, arr: validNums.sort((a, b) => a - b) };
        }
      }
    } catch {
      // If JSON parsing fails, continue with original logic
      const content = s.slice(1, -1); // Remove [ and ]
      const parts = content
        .split(",")
        .map((p) => p.trim())
        .map((p) => Number(p))
        .filter((n) => !Number.isNaN(n));

      if (parts.length > 0) {
        return { ok: true, arr: parts.sort((a, b) => a - b) };
      }
    }
  }

  // Match ranges like 1-5, 1 - 5, [1 - 5]
  const rangePattern = /(\d+)\s*-\s*(\d+)/g;
  let match;
  while ((match = rangePattern.exec(s)) !== null) {
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      nums = nums.concat(
        Array.from({ length: end - start + 1 }, (_, i) => start + i)
      );
    }
  }

  // Remove ranges from string to handle remaining comma-separated numbers
  let cleaned = s.replace(rangePattern, "");
  const parts = cleaned
    .split(/[, ]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => Number(p))
    .filter((n) => !Number.isNaN(n));

  nums = nums.concat(parts);

  // Deduplicate and sort
  nums = Array.from(new Set(nums)).sort((a, b) => a - b);

  if (nums.length === 0) return { ok: false };
  return { ok: true, arr: nums };
}

export function parseStringList(
  value: any
): { ok: true; arr: string[] } | { ok: false } {
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
