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
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: orderRow } = await supabaseAdmin
      .from("order_payments")
      .select("user_id")
      .eq("order_id", order_id)
      .single();

    if (orderRow) {
      await supabaseAdmin
        .from("profiles")
        .update({ is_premium: true, updated_at: new Date().toISOString() })
        .eq("id", orderRow.user_id);
    }
  }

  return Response.json({ received: true });
}
