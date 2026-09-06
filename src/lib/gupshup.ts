export interface GupshupResponse {
  status: "submitted" | "failed";
  messageId?: string;
  error?: string;
}

/**
 * Sends a WhatsApp message using Gupshup's API.
 * Falls back to mock execution when environment variables are not configured.
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string
): Promise<GupshupResponse> {
  const apiKey = process.env.GUPSHUP_API_KEY;
  const appName = process.env.GUPSHUP_APP_NAME;
  const sourceNumber = process.env.GUPSHUP_SRC_PHONE;

  // Clean recipient number (remove plus sign, spaces)
  const cleanRecipient = recipientPhone.replace(/\+/g, "").replace(/\s+/g, "");

  if (!apiKey || !appName || !sourceNumber || apiKey.startsWith("your-api-key")) {
    console.log(`[MOCK WHATSAPP SEND] to ${cleanRecipient}: "${messageText}"`);
    return {
      status: "submitted",
      messageId: `mock-msg-${Math.floor(Math.random() * 1000000)}`,
    };
  }

  try {
    const params = new URLSearchParams();
    params.append("channel", "whatsapp");
    params.append("source", sourceNumber);
    params.append("destination", cleanRecipient);
    params.append("message", JSON.stringify({ type: "text", text: messageText }));
    params.append("src.name", appName);

    const response = await fetch("https://api.gupshup.io/sm/api/v1/msg", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": apiKey,
      },
      body: params,
    });

    const data = await response.json();
    
    if (response.ok && data.status === "submitted") {
      return {
        status: "submitted",
        messageId: data.messageId,
      };
    }

    return {
      status: "failed",
      error: data.message || "Failed sending via Gupshup.",
    };
  } catch (error: any) {
    console.error("Gupshup api failure:", error);
    return {
      status: "failed",
      error: error.message || "Internal server error.",
    };
  }
}
