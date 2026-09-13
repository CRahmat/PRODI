export default {
  async fetch(request, env) {
    const allowOrigin = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Method tidak diizinkan" }, 405, cors);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Body bukan JSON yang valid" }, 400, cors);
    }

    if (typeof data.website === "string" && data.website.trim() !== "") {
      return json({ ok: true }, 200, cors);
    }

    const nama = String(data.nama || "").trim();
    const email = String(data.email || "").trim();
    const whatsapp = String(data.whatsapp || "").trim();
    const pesan = String(data.pesan || "").trim();

    if (!nama || !email || !pesan) {
      return json({ error: "Nama, email, dan pertanyaan wajib diisi." }, 400, cors);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Format email tidak valid." }, 400, cors);
    }
    if (nama.length > 120 || whatsapp.length > 40 || pesan.length > 5000) {
      return json({ error: "Isian terlalu panjang." }, 400, cors);
    }
    if (!env.RESEND_API_KEY || !env.TO_EMAIL) {
      return json({ error: "Worker belum dikonfigurasi (RESEND_API_KEY / TO_EMAIL)." }, 500, cors);
    }

    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || "Tanya Produk <onboarding@resend.dev>",
        to: [env.TO_EMAIL],
        reply_to: email,
        subject: `Pertanyaan produk dari ${nama}`,
        html: `
          <h2 style="font-family:sans-serif">Pertanyaan baru dari landing page</h2>
          <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:4px 12px 4px 0"><strong>Nama</strong></td><td>${esc(nama)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Email</strong></td><td>${esc(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>WhatsApp</strong></td><td>${esc(whatsapp) || "-"}</td></tr>
          </table>
          <p style="font-family:sans-serif;font-size:14px;margin-top:16px"><strong>Pertanyaan:</strong></p>
          <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${esc(pesan)}</p>
        `,
        text:
          `Pertanyaan baru dari landing page\n\n` +
          `Nama    : ${nama}\n` +
          `Email   : ${email}\n` +
          `WhatsApp: ${whatsapp || "-"}\n\n` +
          `Pertanyaan:\n${pesan}\n`,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => "");
      return json({ error: "Gagal mengirim email.", detail }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
