import { createClient } from "@supabase/supabase-js";

const PREMIUM_PRICE = 29000; // dalam Rupiah

export async function POST(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return Response.json({ error: "Belum masuk." }, { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return Response.json({ error: "Sesi tidak valid, coba masuk ulang." }, { status: 401 });
  }

  const orderId = `selaras-${user.id}-${Date.now()}`;
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  const authString = Buffer.from(`${serverKey}:`).toString("base64");

  const midtransRes = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: PREMIUM_PRICE,
      },
      item_details: [
        {
          id: "selaras-premium",
          price: PREMIUM_PRICE,
          quantity: 1,
          name: "Selaras Premium",
        },
      ],
      customer_details: {
        email: user.email,
      },
    }),
  });

  const midtransData = await midtransRes.json();

  if (!midtransRes.ok) {
    return Response.json({ error: midtransData.error_messages?.join(", ") || "Gagal membuat transaksi." }, { status: 500 });
  }

  return Response.json({ token: midtransData.token });
}
