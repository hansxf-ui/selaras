import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const dynamic = "force-dynamic";

// Jalan tiap boardnya sudah tidak disentuh selama sekian hari
const REMIND_AFTER_DAYS = 3;
// Jangan kirim ulang ke orang yang sama dalam rentang hari ini
const MIN_GAP_BETWEEN_REMINDERS_DAYS = 3;

export async function GET(request) {
  // Vercel Cron otomatis mengirim header ini kalau CRON_SECRET di-set sebagai env var
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hello@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const { data: subscriptions, error: subError } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*");

  if (subError) {
    return Response.json({ error: subError.message }, { status: 500 });
  }

  const remindThreshold = new Date();
  remindThreshold.setDate(remindThreshold.getDate() - REMIND_AFTER_DAYS);

  const gapThreshold = new Date();
  gapThreshold.setDate(gapThreshold.getDate() - MIN_GAP_BETWEEN_REMINDERS_DAYS);

  let sent = 0;
  let removed = 0;

  for (const sub of subscriptions || []) {
    if (sub.last_reminded_at && new Date(sub.last_reminded_at) > gapThreshold) {
      continue; // baru saja diingatkan
    }

    const { data: boards } = await supabaseAdmin
      .from("boards")
      .select("title, last_opened_at, updated_at")
      .eq("user_id", sub.user_id)
      .order("last_opened_at", { ascending: false })
      .limit(1);

    if (!boards || boards.length === 0) continue;

    const board = boards[0];
    const lastTouched = new Date(board.last_opened_at || board.updated_at);
    if (lastTouched > remindThreshold) continue; // masih baru dibuka, tidak perlu diingatkan

    const payload = JSON.stringify({
      title: "Selaras",
      body: `Kamu belum buka "${board.title}" beberapa hari ini — yuk lihat lagi progressmu.`,
      url: "/dashboard",
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent++;
      await supabaseAdmin
        .from("push_subscriptions")
        .update({ last_reminded_at: new Date().toISOString() })
        .eq("id", sub.id);
    } catch (err) {
      // langganan sudah tidak valid (misal user uninstall/blokir notifikasi) -> bersihkan
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        removed++;
      }
    }
  }

  return Response.json({ sent, removed, checked: subscriptions?.length || 0 });
}
