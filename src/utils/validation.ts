export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s()-]/g, '');
  return /^(\+254|254|0)(7|1)\d{8}$/.test(cleaned) || /^\+?\d{9,15}$/.test(cleaned);
}

export function isValidSafeUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain at least one letter and one number.';
  }
  return null;
}

export function sanitizeText(value: string): string {
  return value.trim();
}
