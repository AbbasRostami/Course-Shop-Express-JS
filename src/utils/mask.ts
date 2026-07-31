// [UTIL] Mask email - e.g. ali@gmail.com → ali***@gmail.com
export const maskEmail = (email: string | null | undefined): string | null => {
  if (!email || typeof email !== "string") return null;

  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  if (localPart.length <= 3) return `***@${domain}`;

  return `${localPart.slice(0, 3)}***@${domain}`;
};

// [UTIL] Mask phone - e.g. 09121112233 → 0912****233
export const maskPhone = (phone: string | null | undefined): string | null => {
  if (!phone || typeof phone !== "string") return null;
  if (phone.length < 8) return phone;

  const start = phone.slice(0, 4);
  const end = phone.slice(-3);
  return `${start}****${end}`;
};

type MaskType = "email" | "phone" | "auto";

interface MaskOptions {
  fields: string[];
  type?: MaskType;
}

// [UTIL] Get nested object value by dot path
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

// [UTIL] Set nested object value by dot path
const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split(".");
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...current[key] };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return newObj;
};

// [UTIL] Auto-detect field mask type
const detectMaskType = (fieldName: string, value: string): MaskType => {
  const lowerField = fieldName.toLowerCase();

  if (lowerField.includes("email") || value.includes("@")) return "email";
  if (lowerField.includes("phone") || lowerField.includes("mobile"))
    return "phone";
  return "auto";
};

// [UTIL] Mask fields on array of items
export function maskFields<T>(
  items: T[],
  options: MaskOptions | string[],
): T[] {
  const opts: MaskOptions = Array.isArray(options)
    ? { fields: options, type: "auto" }
    : options;

  const { fields, type = "auto" } = opts;

  return items.map((item) => {
    let newItem = { ...item };

    fields.forEach((field) => {
      const value = getNestedValue(newItem, field);

      if (value && typeof value === "string") {
        const fieldType = type === "auto" ? detectMaskType(field, value) : type;

        let maskedValue: string | null;
        switch (fieldType) {
          case "email":
            maskedValue = maskEmail(value);
            break;
          case "phone":
            maskedValue = maskPhone(value);
            break;
          default:
            maskedValue = value;
        }

        newItem = setNestedValue(newItem, field, maskedValue);
      }
    });

    return newItem as T;
  });
}

// [UTIL] Mask fields on single item
export function maskItem<T>(item: T, options: MaskOptions | string[]): T {
  return maskFields([item], options)[0];
}