const SENSITIVE_KEYS = new Set([
  'authorization', 'cookie', 'x-user-id', 'password', 'secret', 'client_secret',
  'access_token', 'refresh_token', 'token', 'auth_token', 'jwt_secret',
]);

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(/(Authorization[:\s]+Bearer\s+)\S+/gi, '$1[REDACTED]')
      .replace(/(auth_token=)[^;\s&]+/gi, '$1[REDACTED]')
      .replace(/(token=)[^;\s&]+/gi, '$1[REDACTED]')
      .replace(/(client_secret=)[^;\s&]+/gi, '$1[REDACTED]');
  }
  if (value instanceof Error) {
    return { message: value.message, name: value.name, stack: value.stack };
  }
  if (value && typeof value === 'object') {
    const sanitized: Record<string, any> = Array.isArray(value) ? [] as any : {};
    for (const [key, val] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeValue(val);
      }
    }
    return sanitized;
  }
  return value;
}

function sanitizeArgs(args: any[]): any[] {
  return args.map(sanitizeValue);
}

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...sanitizeArgs(args));
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...sanitizeArgs(args));
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...sanitizeArgs(args));
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...sanitizeArgs(args));
    }
  },
};
