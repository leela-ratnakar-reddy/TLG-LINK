export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateUrl(rawUrl: string): ValidationResult {
  const url = rawUrl.trim();

  if (!url) {
    return { isValid: false, error: "Please enter a URL to shorten." };
  }

  if (url.length > 2048) {
    return {
      isValid: false,
      error: "URL is too long (maximum 2048 characters).",
    };
  }

  if (/\s/.test(url)) {
    return { isValid: false, error: "URL cannot contain spaces." };
  }

  const lowered = url.toLowerCase();
  const forbiddenSchemes = ["javascript:", "data:", "file:", "vbscript:", "blob:"];
  for (const scheme of forbiddenSchemes) {
    if (lowered.startsWith(scheme)) {
      return {
        isValid: false,
        error: "Dangerous URL schemes (javascript:, data:, file:) are strictly forbidden.",
      };
    }
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        error: "Please enter a valid HTTP or HTTPS URL.",
      };
    }
    if (!parsed.hostname || parsed.hostname.length < 1) {
      return {
        isValid: false,
        error: "URL must contain a valid domain name.",
      };
    }
    return { isValid: true, error: null };
  } catch {
    return {
      isValid: false,
      error: "Please enter a valid HTTP or HTTPS URL.",
    };
  }
}
