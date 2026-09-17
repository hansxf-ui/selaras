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

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
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

  async function deleteBoard(e, board) {
    e.stopPropagation();
    const sure = window.confirm(`Hapus board "${board.title}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!sure) return;
    await supabase.from("boards").delete().eq("id", board.id);
    setBoards((prev) => prev.filter((b) => b.id !== board.id));
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
        <button className="icon-btn" onClick={createBoard} aria-label="Board baru">
          +
        </button>
      </div>
      <p className="dash-count">{boards.length} board tersimpan</p>

      {boards.length === 0 ? (
        <div className="empty-state">
          <p style={{ marginBottom: 18 }}>Belum ada board. Yuk mulai yang pertama.</p>
          <button className="btn-primary" style={{ maxWidth: 220, margin: "0 auto" }} onClick={createBoard}>
            + Board baru
          </button>
        </div>
      ) : (
        <div className="board-grid">
          {boards.map((b) => (
            <div key={b.id} className="board-tile" onClick={() => router.push(`/board/${b.id}`)}>
              <div style={{ position: "relative" }}>
                <BoardPreview elements={b.elements} />
                <button
                  onClick={(e) => deleteBoard(e, b)}
                  aria-label="Hapus board"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(36,28,51,0.55)",
                    color: "#fff",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
              <div className="board-tile-body">
                <p className="board-tile-title">{b.title}</p>
                <p className="board-tile-meta">{relativeTime(b.updated_at || b.created_at)}</p>
              </div>
            </div>
          ))}
          <button className="board-tile-new" onClick={createBoard}>
            <span style={{ fontSize: 20 }}>+</span>
            <span>Board baru</span>
          </button>
        </div>
      )}
    </div>
  );
}
