import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request) {
  const body = await request.json();
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return Response.json({ error: "Invalid signature" }, { status: 403 });
  }

  const isSuccess =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (isSuccess) {
    // order_id formatnya: selaras-<user_id>-<timestamp>
    const parts = order_id.split("-");
    const userId = parts.slice(1, -1).join("-");

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabaseAdmin
      .from("profiles")
      .update({ is_premium: true, updated_at: new Date().toISOString() })
      .eq("id", userId);
  }

  return Response.json({ received: true });
}
