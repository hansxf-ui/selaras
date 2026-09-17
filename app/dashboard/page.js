"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

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
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("boards")
      .insert({ user_id: user.id, title: "Board baru", elements: [] })
      .select()
      .single();

    if (!error) router.push(`/board/${data.id}`);
  }

  if (loading) {
    return (
      <div className="container">
        <p className="subtitle">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h1>Board saya</h1>
      <p className="subtitle">{boards.length} board tersimpan</p>

      <button className="btn-primary" style={{ marginBottom: 24 }} onClick={createBoard}>
        + Board baru
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {boards.map((b) => (
          <div
            key={b.id}
            onClick={() => router.push(`/board/${b.id}`)}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 16,
              cursor: "pointer",
              background: "var(--panel)",
            }}
          >
            <p style={{ fontWeight: 500, fontSize: 14 }}>{b.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
