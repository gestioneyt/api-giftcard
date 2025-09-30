import { signAndFetch } from "./_signAndFetch.js";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const token = req.headers["x-internal-token"];
    if (process.env.INTERNAL_TOKEN && token !== process.env.INTERNAL_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount, currencyCode } = req.body || {};
    if (!amount || !currencyCode) {
      return res.status(400).json({ error: "amount and currencyCode are required" });
    }

    const partnerId = process.env.AGCOD_PARTNER_ID;
    const creationRequestId = `${partnerId}${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`.slice(0, 40);

    const payload = {
      partnerId,
      creationRequestId,
      value: { amount, currencyCode }
    };

    const resp = await signAndFetch({
      baseUrl: process.env.AGCOD_BASE_URL,
      region: process.env.AGCOD_REGION || "eu-west-1",
      operation: "CreateGiftCard",
      bodyJson: payload,
      accessKeyId: process.env.AGCOD_ACCESS_KEY,
      secretAccessKey: process.env.AGCOD_SECRET_KEY
    });

    return res.status(200).json(resp);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
