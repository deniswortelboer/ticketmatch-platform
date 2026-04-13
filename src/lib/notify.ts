/**
 * Unified notification helper — Telegram + WhatsApp
 * Both are non-blocking (fire-and-forget).
 * Set env vars in Vercel:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_TO (admin phone in international format, e.g. 31612345678)
 */

export function sendTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  }).catch(() => {});
}

export function sendWhatsApp(message: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const to = process.env.WHATSAPP_TO;
  if (!token || !phoneId || !to) return;

  fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  }).catch(() => {});
}

/** Send to both Telegram + WhatsApp */
export function notifyAdmin(message: string) {
  sendTelegram(message);
  sendWhatsApp(message);
}
