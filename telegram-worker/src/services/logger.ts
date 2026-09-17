export type LogLevel = "info" | "error"

const secretPattern = /(api[_-]?hash|api[_-]?id|session|string|password|code)/i
function safe(value: unknown): unknown {
  if (typeof value === "string" && secretPattern.test(value)) return "[redacted]"
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, secretPattern.test(key) ? "[redacted]" : safe(item)]))
  return value
}
export function log(level: LogLevel, message: string, context?: Record<string, unknown>) { console[level === "error" ? "error" : "log"](`[telegram-worker] ${message}`, context ? safe(context) : "") }
