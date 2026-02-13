import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import P from "pino"

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text
    const from = msg.key.remoteJid

    if (!text) return

    // Anti-link
    if (text.includes("http")) {
      await sock.sendMessage(from, { text: "Link detectat. Curaj interesant." })
      await sock.sendMessage(from, { delete: msg.key })
    }

    // Zar
    if (text === "!zar") {
      const random = Math.floor(Math.random() * 6) + 1
      await sock.sendMessage(from, { text: `Rezultat: ${random}. Noroc discutabil.` })
    }

    // Strict mode
    if (text === "!strict on") {
      await sock.sendMessage(from, { text: "Mod strict activat. Conversație filtrată." })
    }
  })
}

startBot()
