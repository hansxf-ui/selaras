"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

const COLORS = ["#6B4E71", "#D9A441", "#C6714F", "#71865F", "#7C93A8"];

function makeCard(type, extra = {}) {
  return {
    id: crypto.randomUUID(),
    type, // "text", "color", or "image"
    x: 40 + Math.random() * 120,
    y: 40 + Math.random() * 120,
    width: type === "text" ? 170 : 150,
    height: type === "text" ? 130 : 150,
    rotation: 0,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    text: type === "text" ? "kata baru" : "",
    imageUrl: null,
    ...extra,
  };
}

export default function BoardEditorPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id;

  const [title, setTitle] = useState("Board baru");
  const [cards, setCards] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  const canvasRef = useRef(null);
  const dragState = useRef(null);
  const rotateState = useRef(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("id", boardId)
        .eq("user_id", authUser.id)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(data.title || "Board baru");
      setCards(Array.isArray(data.elements) ? data.elements : []);
      setLoading(false);
    }
    load();
  }, [boardId, router]);

  const selectedCard = cards.find((c) => c.id === selectedId);

  function updateCard(id, patch) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addCard(type) {
    const card = makeCard(type);
    setCards((prev) => [...prev, card]);
    setSelectedId(card.id);
  }

  function triggerImagePicker() {
    fileInputRef.current?.click();
  }

  async function onImageSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    // Tampilkan kartu langsung dengan status "mengunggah" sambil upload jalan
    const card = makeCard("image", { width: 190, height: 220, uploading: true });
    setCards((prev) => [...prev, card]);
    setSelectedId(card.id);

    const mimeExt = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = mimeExt[file.type] || (file.name.includes(".") ? file.name.split(".").pop() : "jpg");
    const path = `${user.id}/${card.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("board-images")
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

    if (uploadError) {
      updateCard(card.id, { uploading: false, uploadError: true });
      return;
    }

    const { data } = supabase.storage.from("board-images").getPublicUrl(path);
    updateCard(card.id, { imageUrl: data.publicUrl, uploading: false });
  }

  function deleteCard(id) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function onDragStart(e, card) {
    if (e.target.closest(".del") || e.target.closest(".rotate-handle")) return;
    setSelectedId(card.id);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragState.current = {
      id: card.id,
      offsetX: e.clientX - canvasRect.left - card.x,
      offsetY: e.clientY - canvasRect.top - card.y,
    };
    e.preventDefault();
  }

  function onRotateStart(e, card) {
    e.stopPropagation();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const centerX = canvasRect.left + card.x + card.width / 2;
    const centerY = canvasRect.top + card.y + card.height / 2;
    const startAngle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
    rotateState.current = { id: card.id, centerX, centerY, startAngle, startRotation: card.rotation };
    setSelectedId(card.id);
    e.preventDefault();
  }

  useEffect(() => {
    function onMove(e) {
      if (dragState.current) {
        const { id, offsetX, offsetY } = dragState.current;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        let x = e.clientX - canvasRect.left - offsetX;
        let y = e.clientY - canvasRect.top - offsetY;
        x = Math.max(0, Math.min(x, canvasRect.width - 40));
        y = Math.max(0, Math.min(y, canvasRect.height - 40));
        updateCard(id, { x, y });
      }
      if (rotateState.current) {
        const { id, centerX, centerY, startAngle, startRotation } = rotateState.current;
        const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
        updateCard(id, { rotation: startRotation + (angle - startAngle) });
      }
    }
    function onUp() {
      dragState.current = null;
      rotateState.current = null;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  async function saveBoard() {
    setSaving(true);
    await supabase
      .from("boards")
      .update({ title, elements: cards, updated_at: new Date().toISOString() })
      .eq("id", boardId);
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--ink-soft)" }}>
        Memuat board...
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p className="subtitle">Board tidak ditemukan.</p>
        <button className="btn-primary" onClick={() => router.push("/dashboard")}>
          Kembali ke Board saya
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--line)",
          background: "var(--panel)",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "var(--ink-soft)" }}
            aria-label="Kembali"
          >
            ←
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              border: "none",
              background: "none",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--ink)",
              maxWidth: 160,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageSelected}
            style={{ display: "none" }}
          />
          <button
            onClick={triggerImagePicker}
            style={{
              padding: "8px 14px",
              borderRadius: 100,
              border: "1px solid var(--line)",
              background: "none",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Gambar
          </button>
          <button
            onClick={() => addCard("text")}
            style={{
              padding: "8px 14px",
              borderRadius: 100,
              border: "1px solid var(--line)",
              background: "none",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Teks
          </button>
          <button
            onClick={() => addCard("color")}
            style={{
              padding: "8px 14px",
              borderRadius: 100,
              border: "1px solid var(--line)",
              background: "none",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Warna
          </button>
          <button
            onClick={saveBoard}
            disabled={saving}
            style={{
              padding: "8px 16px",
              borderRadius: 100,
              border: "none",
              background: "var(--plum)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        {/* canvas */}
        <div
          style={{
            flex: 1,
            background: "#F1ECE6",
            padding: 24,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          <div
            ref={canvasRef}
            style={{
              position: "relative",
              width: 340,
              minHeight: 480,
              background: "var(--panel)",
              borderRadius: 16,
              boxShadow: "0 20px 50px -30px rgba(36,28,51,0.3)",
              flexShrink: 0,
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelectedId(null);
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                onMouseDown={(e) => onDragStart(e, card)}
                style={{
                  position: "absolute",
                  left: card.x,
                  top: card.y,
                  width: card.width,
                  height: card.height,
                  background: card.type === "image" ? "#E7D9C7" : card.color,
                  borderRadius: 12,
                  cursor: "grab",
                  transform: `rotate(${card.rotation}deg)`,
                  boxShadow: "0 10px 24px -12px rgba(36,28,51,0.25)",
                  border: selectedId === card.id ? "2px solid var(--plum)" : "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: card.type === "image" ? 0 : 14,
                  userSelect: "none",
                  overflow: "hidden",
                }}
              >
                {card.type === "text" && (
                  <p
                    style={{
                      fontFamily: "Fraunces, serif",
                      fontStyle: "italic",
                      color: "#F3E9D8",
                      fontSize: 14,
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    {card.text}
                  </p>
                )}

                {card.type === "image" && card.uploading && (
                  <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>Mengunggah...</span>
                )}
                {card.type === "image" && card.uploadError && (
                  <span style={{ fontSize: 12, color: "#B3443A", padding: 10, textAlign: "center" }}>
                    Gagal unggah
                  </span>
                )}
                {card.type === "image" && card.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.imageUrl}
                    alt=""
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                  />
                )}

                {selectedId === card.id && (
                  <>
                    <div
                      className="del"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCard(card.id);
                      }}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "rgba(36,28,51,0.65)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </div>
                    <div
                      className="rotate-handle"
                      onMouseDown={(e) => onRotateStart(e, card)}
                      style={{
                        position: "absolute",
                        top: -30,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "var(--plum)",
                        cursor: "grab",
                        boxShadow: "0 4px 10px rgba(36,28,51,0.3)",
                      }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* side panel */}
        {selectedCard && (
          <div
            style={{
              width: 200,
              borderLeft: "1px solid var(--line)",
              background: "var(--panel)",
              padding: 18,
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-soft)", marginBottom: 12 }}>
              Warna
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {selectedCard.type !== "image" &&
                COLORS.map((c) => (
                  <div
                    key={c}
                    onClick={() => updateCard(selectedCard.id, { color: c })}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border: selectedCard.color === c ? "2px solid var(--ink)" : "2px solid transparent",
                    }}
                  />
                ))}
              {selectedCard.type === "image" && (
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                  Ganti gambar dengan menghapus lalu unggah ulang.
                </p>
              )}
            </div>

            {selectedCard.type === "text" && (
              <div>
                <label style={{ fontSize: 12, color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>
                  Teks
                </label>
                <textarea
                  value={selectedCard.text}
                  onChange={(e) => updateCard(selectedCard.id, { text: e.target.value })}
                  style={{
                    width: "100%",
                    height: 70,
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: 10,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    resize: "none",
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
