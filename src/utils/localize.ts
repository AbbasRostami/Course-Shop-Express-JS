// [UTIL] Localize Prisma objects (Fa/En) dynamically
export function localizePayload<T>(data: T, lang: "fa" | "en"): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => localizePayload(item, lang));
  }

  if (data instanceof Date) return data;

  const result: Record<string, any> = {};
  const processedKeys = new Set<string>();

  for (const [key, value] of Object.entries(data)) {
    const match = key.match(/^(.*)(Fa|En)$/);

    if (match) {
      const baseKey = match[1];
      if (!processedKeys.has(baseKey)) {
        processedKeys.add(baseKey);
        const targetSuffix = lang === "en" ? "En" : "Fa";
        const fallbackSuffix = lang === "en" ? "Fa" : "En";

        result[baseKey] =
          (data as any)[`${baseKey}${targetSuffix}`] ??
          (data as any)[`${baseKey}${fallbackSuffix}`];
      }
    } else {
      if (
        typeof value === "object" &&
        value !== null &&
        !(value instanceof Date)
      ) {
        result[key] = localizePayload(value, lang);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
