type LogContext = Record<string, unknown>;

function log(
  level: "error" | "info" | "warn",
  message: string,
  context?: LogContext,
): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
  const output = JSON.stringify(entry, (_key, value: unknown) =>
    value instanceof Error
      ? { message: value.message, name: value.name, stack: value.stack }
      : value,
  );

  process.stderr.write(`${output}\n`);
}

const logger = {
  error: (message: string, context?: LogContext) =>
    log("error", message, context),
  info: (message: string, context?: LogContext) =>
    log("info", message, context),
  warn: (message: string, context?: LogContext) =>
    log("warn", message, context),
};

export { logger };
