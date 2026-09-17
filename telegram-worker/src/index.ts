import "dotenv/config"
import http from "node:http"
import { getSessionStatus, startTelegramClient } from "./telegram/client.js"
import { startMessageListener } from "./telegram/listener.js"
import { getAvailableChats } from "./telegram/chats.js"
import { log } from "./services/logger.js"

const port = Number(process.env.PORT ?? 8787)
const server = http.createServer(async (request, response) => { response.setHeader("content-type", "application/json; charset=utf-8"); if (request.method === "GET" && request.url === "/health") { response.end(JSON.stringify({ status: "ok", telegram: getSessionStatus() === "connected" ? "connected" : "disconnected" })); return } if (request.method === "GET" && request.url === "/chats") { try { response.end(JSON.stringify(await getAvailableChats())) } catch (error) { response.statusCode = 503; response.end(JSON.stringify({ error: "Telegram não conectado" })) }; return } response.statusCode = 404; response.end(JSON.stringify({ error: "Not found" })) })
let listenerStarted = false
let reconnectTimer: NodeJS.Timeout | undefined
let shuttingDown = false

async function connectAndListen() {
  try {
    await startTelegramClient()
    if (getSessionStatus() === "connected" && !listenerStarted) {
      startMessageListener()
      listenerStarted = true
    }
  } catch (error) {
    log("error", "Erro ao conectar ao Telegram; nova tentativa em 10 segundos", { message: error instanceof Error ? error.message : "erro desconhecido" })
    if (!shuttingDown) reconnectTimer = setTimeout(() => void connectAndListen(), 10_000)
  }
}

async function main() {
  server.listen(port, () => log("info", `Health check em http://localhost:${port}/health`))
  await connectAndListen()
}

function shutdown() {
  shuttingDown = true
  if (reconnectTimer) clearTimeout(reconnectTimer)
  server.close(() => process.exit(0))
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
void main()
