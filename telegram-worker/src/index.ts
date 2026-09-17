import "dotenv/config"
import http from "node:http"
import { disconnectTelegram, getSessionStatus, getTelegramAccount, requestLoginCode, startTelegramClient, verifyLoginCode, verifyTwoFactorPassword } from "./telegram/client.js"
import { startMessageListener } from "./telegram/listener.js"
import { getAvailableChats } from "./telegram/chats.js"
import { log } from "./services/logger.js"

const port = Number(process.env.PORT ?? 8787)
const internalToken = process.env.TELEGRAM_WORKER_TOKEN
let listenerStarted = false
let reconnectTimer: NodeJS.Timeout | undefined
let shuttingDown = false

function authorized(request: http.IncomingMessage) { return !internalToken || request.headers["x-internal-token"] === internalToken }
async function body(request: http.IncomingMessage) { let raw = ""; for await (const chunk of request) raw += chunk; return JSON.parse(raw || "{}") as Record<string, string> }
function json(response: http.ServerResponse, value: unknown, status = 200) { response.statusCode = status; response.setHeader("content-type", "application/json; charset=utf-8"); response.end(JSON.stringify(value)) }

const server = http.createServer(async (request, response) => {
  if (!authorized(request)) return json(response, { status: "error", message: "Não autorizado." }, 401)
  try {
    if (request.method === "GET" && request.url === "/health") return json(response, { status: "ok", telegram: getSessionStatus() })
    if (request.method === "GET" && request.url === "/telegram/status") return json(response, { status: getSessionStatus(), account: await getTelegramAccount() })
    if (request.method === "GET" && request.url === "/chats") return json(response, await getAvailableChats())
    if (request.method === "POST" && request.url === "/telegram/auth") {
      const payload = await body(request)
      if (payload.action === "start") return json(response, { status: await requestLoginCode(String(payload.phone ?? "")) })
      if (payload.action === "confirm-code") return json(response, { status: await verifyLoginCode(String(payload.phone ?? ""), String(payload.code ?? ""), payload.password) })
      if (payload.action === "confirm-2fa") return json(response, { status: await verifyTwoFactorPassword(String(payload.password ?? "")) })
      if (payload.action === "disconnect") { await disconnectTelegram(); return json(response, { status: "disconnected" }) }
      if (payload.action === "test") return json(response, { status: getSessionStatus(), account: await getTelegramAccount() })
      return json(response, { status: "error", message: "Ação inválida." }, 400)
    }
    return json(response, { error: "Not found" }, 404)
  } catch (error) { log("error", "Erro na API do worker", { message: error instanceof Error ? error.message : "erro desconhecido" }); return json(response, { status: "error", message: error instanceof Error ? error.message : "Erro interno." }, 500) }
})

async function connectAndListen() { try { await startTelegramClient(); if (getSessionStatus() === "connected" && !listenerStarted) { startMessageListener(); listenerStarted = true } } catch (error) { log("error", "Erro ao conectar ao Telegram; nova tentativa em 10 segundos", { message: error instanceof Error ? error.message : "erro desconhecido" }); if (!shuttingDown) reconnectTimer = setTimeout(() => void connectAndListen(), 10_000) } }
async function main() { server.listen(port, () => log("info", `Health check em http://localhost:${port}/health`)); await connectAndListen() }
function shutdown() { shuttingDown = true; if (reconnectTimer) clearTimeout(reconnectTimer); server.close(() => process.exit(0)) }
process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
void main()
