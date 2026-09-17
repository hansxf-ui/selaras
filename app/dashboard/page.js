"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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

function BoardPreview({ elements }) {
  const colors = (elements || [])
    .map((el) => (el.type === "image" ? null : el.color))
    .filter(Boolean)
    .slice(0, 3);

  if (colors.length === 0) {
    return (
      <div className="board-tile-preview" style={{ background: "linear-gradient(150deg,#E7D9C7,#D9BFA0)" }} />
    );
  }

  return (
    <div className="board-tile-preview" style={{ display: "flex", gap: 2, padding: 2, background: "var(--bg)" }}>
      {colors.map((c, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 6, background: c }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealId, setRevealId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

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
    }
    load();
  }, [router]);

  async function activatePremium() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ is_premium: true, updated_at: new Date().toISOString() }).eq("id", user.id);
    setIsPremium(true);
    setShowUpgrade(false);
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
        <h1>Board saya</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isPremium ? (
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#B9832A",
                background: "rgba(217,164,65,0.15)",
                padding: "6px 12px",
                borderRadius: 100,
              }}
            >
              ✓ Premium
            </span>
          ) : (
            <button
              onClick={() => setShowUpgrade(true)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#fff",
                background: "var(--gold)",
                border: "none",
                padding: "8px 14px",
                borderRadius: 100,
                cursor: "pointer",
              }}
            >
              Upgrade Premium
            </button>
          )}
          <button className="icon-btn" onClick={createBoard} aria-label="Board baru">
            +
          </button>
        </div>
      </div>
      <p className="dash-count">{boards.length} board tersimpan</p>

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
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                (Mode simulasi — pembayaran asli belum terhubung)
              </span>
            </p>
            <button className="btn-primary" onClick={activatePremium} style={{ marginBottom: 10 }}>
              Aktifkan Premium
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
          {boards.map((b) => (
            <div key={b.id} className="board-tile" onClick={(e) => { e.stopPropagation(); handleTileClick(b); }}>
              <div style={{ position: "relative" }}>
                <BoardPreview elements={b.elements} />
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
