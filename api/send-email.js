import { Resend } from "resend";

export default async function handler(req, res) {
  const allow = process.env.CORS_ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: process.env.MAIL_FROM || "noreply@your-domain.com",
      to: process.env.MAIL_TO || "owner@example.com",
      reply_to: email,
      subject: `お問い合わせ: ${name}`,
      text: `from: ${name} <${email}>\n\n${message}`,
    });

    return res.status(200).json({ ok: true, id: result?.data?.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
