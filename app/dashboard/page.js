"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { subscribeToPush, isPushSubscribed } from "../../lib/pushClient";

function relativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return "Baru diubah";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getProgress(elements) {
  const list = elements || [];
  const total = list.length;
  const achieved = list.filter((el) => el.achieved).length;
  return { achieved, total };
}

function BoardPreview({ elements }) {
  const list = elements || [];
  const images = list.filter((el) => el.type === "image" && el.imageUrl).slice(0, 3);
  const colors = list.map((el) => (el.type === "image" ? null : el.color)).filter(Boolean).slice(0, 3);

  if (images.length > 0) {
    return (
      <div className="board-tile-preview" style={{ display: "flex", gap: 2, padding: 2, background: "var(--bg)" }}>
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.imageUrl}
            alt=""
            style={{ flex: 1, height: "100%", objectFit: "cover", borderRadius: 6, minWidth: 0 }}
          />
        ))}
        {images.length === 1 &&
          colors.slice(0, 2).map((c, i) => <div key={i} style={{ flex: 1, borderRadius: 6, background: c }} />)}
      </div>
    );
  }

  if (colors.length > 0) {
    return (
      <div className="board-tile-preview" style={{ display: "flex", gap: 2, padding: 2, background: "var(--bg)" }}>
        {colors.map((c, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 6, background: c }} />
        ))}
      </div>
    );
  }

  return <div className="board-tile-preview" style={{ background: "linear-gradient(150deg,#E7D9C7,#D9BFA0)" }} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealId, setRevealId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsPremium(profile.is_premium);
      } else {
        // profil belum ada (user lama sebelum fitur ini) -> buat baru
        await supabase.from("profiles").insert({ id: user.id, is_premium: false });
      }

      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!error) setBoards(data);
      setLoading(false);

      isPushSubscribed().then(setPushEnabled).catch(() => {});
    }
    load();
  }, [router]);

  async function handleEnablePush() {
    setPushError("");
    setPushLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await subscribeToPush(supabase, user.id);
      setPushEnabled(true);
    } catch (err) {
      setPushError(err.message || "Gagal mengaktifkan notifikasi.");
    }
    setPushLoading(false);
  }

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");

  function loadSnapScript() {
    return new Promise((resolve, reject) => {
      if (window.snap) return resolve();
      const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
      const script = document.createElement("script");
      script.src = isProd ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function startPayment() {
    setPayError("");
    setPayLoading(true);
    try {
      await loadSnapScript();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal memulai pembayaran");

      window.snap.pay(data.token, {
        onSuccess: function () {
          setIsPremium(true);
          setShowUpgrade(false);
        },
        onPending: function () {
          setShowUpgrade(false);
        },
        onError: function () {
          setPayError("Pembayaran gagal. Coba lagi ya.");
        },
        onClose: function () {
          // user menutup popup tanpa menyelesaikan pembayaran, tidak apa-apa
        },
      });
    } catch (err) {
      setPayError(err.message || "Gagal memulai pembayaran.");
    }
    setPayLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function createBoard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("boards")
      .insert({ user_id: user.id, title: "Board baru", elements: [] })
      .select()
      .single();

    if (!error) router.push(`/board/${data.id}`);
  }

  function askDeleteBoard(e, board) {
    e.stopPropagation();
    setPendingDelete(board);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await supabase.from("boards").delete().eq("id", pendingDelete.id);
    setBoards((prev) => prev.filter((b) => b.id !== pendingDelete.id));
    setPendingDelete(null);
    setRevealId(null);
  }

  function handleTileClick(board) {
    if (revealId === board.id) {
      router.push(`/board/${board.id}`);
    } else {
      setRevealId(board.id);
    }
  }

  if (loading) {
    return (
      <div className="dash-wrap">
        <p className="subtitle">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="dash-wrap">
      <div className="dash-top">
        <h1>
          Board saya
          {isPremium && <span className="premium-tag">Premium</span>}
        </h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!isPremium && (
            <button className="chip-upgrade" onClick={() => setShowUpgrade(true)}>
              ✨ Upgrade
            </button>
          )}
          <button className="icon-btn" onClick={createBoard} aria-label="Board baru">
            +
          </button>
          <button className="icon-btn" onClick={handleLogout} aria-label="Keluar" title="Keluar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
      <p className="dash-count">{boards.length} board tersimpan</p>

      {!pushEnabled && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "12px 14px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.4, margin: 0 }}>
            Aktifkan pengingat biar kamu nggak lupa sama board yang sedang disusun.
          </p>
          <button
            onClick={handleEnablePush}
            disabled={pushLoading}
            style={{
              flexShrink: 0,
              fontSize: 12.5,
              fontWeight: 500,
              color: "#fff",
              background: "var(--plum)",
              border: "none",
              padding: "8px 14px",
              borderRadius: 100,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {pushLoading ? "..." : "Aktifkan"}
          </button>
        </div>
      )}
      {pushError && <p className="error-text" style={{ marginTop: -12, marginBottom: 16 }}>{pushError}</p>}

      {showUpgrade && (
        <div
          onClick={() => setShowUpgrade(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(36,28,51,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--panel)", borderRadius: 20, maxWidth: 340, width: "100%", padding: "30px 26px", textAlign: "center" }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(217,164,65,0.16)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              ✨
            </div>
            <h1 style={{ fontSize: 19, marginBottom: 8 }}>Upgrade ke Premium</h1>
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55, marginBottom: 20 }}>
              Unduh board tanpa watermark, resolusi tinggi, board tanpa batas.
              <br />
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Rp29.000</span>
            </p>
            {payError && <p className="error-text" style={{ marginBottom: 14 }}>{payError}</p>}
            <button className="btn-primary" onClick={startPayment} disabled={payLoading} style={{ marginBottom: 10 }}>
              {payLoading ? "Memproses..." : "Lanjut ke pembayaran"}
            </button>
            <button className="btn-outline" onClick={() => setShowUpgrade(false)}>
              Batal
            </button>
          </div>
        </div>
      )}

      {boards.length === 0 ? (
        <div className="empty-state">
          <p style={{ marginBottom: 18 }}>Belum ada board. Yuk mulai yang pertama.</p>
          <button className="btn-primary" style={{ maxWidth: 220, margin: "0 auto" }} onClick={createBoard}>
            + Board baru
          </button>
        </div>
      ) : (
        <div className="board-grid" onClick={() => setRevealId(null)}>
          {boards.map((b, i) => (
            <div
              key={b.id}
              className="board-tile"
              style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
              onClick={(e) => { e.stopPropagation(); handleTileClick(b); }}
            >
              <div style={{ position: "relative" }}>
                <BoardPreview elements={b.elements} />
                {(() => {
                  const { achieved, total } = getProgress(b.elements);
                  return total > 0 && achieved === total ? (
                    <div className="achieved-all-badge">🎉 Tercapai penuh</div>
                  ) : null;
                })()}
                {revealId === b.id && (
                  <button
                    onClick={(e) => askDeleteBoard(e, b)}
                    aria-label="Hapus board"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(36,28,51,0.65)",
                      color: "#fff",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="board-tile-body">
                <p className="board-tile-title">{b.title}</p>
                <p className="board-tile-meta">
                  {revealId === b.id ? "Ketuk lagi untuk membuka" : relativeTime(b.updated_at || b.created_at)}
                </p>
                {(() => {
                  const { achieved, total } = getProgress(b.elements);
                  if (total === 0) return null;
                  return (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, borderRadius: 2, background: "var(--line)", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${(achieved / total) * 100}%`,
                            background: "var(--gold)",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
                        {achieved}/{total} tercapai
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
          <button className="board-tile-new" onClick={(e) => { e.stopPropagation(); createBoard(); }}>
            <span style={{ fontSize: 20 }}>+</span>
            <span>Board baru</span>
          </button>
        </div>
      )}

      {pendingDelete && (
        <div
          onClick={() => setPendingDelete(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(36,28,51,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--panel)",
              borderRadius: 20,
              maxWidth: 320,
              width: "100%",
              padding: "26px 24px",
              boxShadow: "0 30px 60px -20px rgba(36,28,51,0.4)",
            }}
          >
            <p style={{ fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 18, margin: "0 0 8px" }}>
              Hapus board ini?
            </p>
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5, margin: "0 0 22px" }}>
              "{pendingDelete.title}" akan terhapus permanen dan tidak bisa dikembalikan.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setPendingDelete(null)}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 100,
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "1px solid var(--line)",
                  background: "none",
                  color: "var(--ink)",
                }}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 100,
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  background: "var(--danger)",
                  color: "#fff",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
