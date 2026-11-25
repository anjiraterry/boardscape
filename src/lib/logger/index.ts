export type LogLevel = "info" | "warn" | "error";

interface LogContext {
  correlationId?: string;
  actorId?: string;
  orgId?: string;
  [key: string]: unknown;
}

function redactSensitive(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;
  const blocked = new Set(["password", "token", "secret", "serviceRoleKey", "documentContent"]);
  const clean: LogContext = {};
  for (const [k, v] of Object.entries(context)) {
    clean[k] = blocked.has(k) ? "[REDACTED]" : v;
  }
  return clean;
}

export const logger = {
  log(level: LogLevel, message: string, context?: LogContext) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(redactSensitive(context) ?? {}),
    };
    if (level === "error") {
      console.error(JSON.stringify(payload));
    } else if (level === "warn") {
      console.warn(JSON.stringify(payload));
    } else {
      console.info(JSON.stringify(payload));
    }
  },
  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  },
  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  },
  error(message: string, context?: LogContext) {
    this.log("error", message, context);
  },
};
