"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { supabase } from "../../../lib/supabaseClient";

const COLORS = ["#6B4E71", "#D9A441", "#C6714F", "#71865F", "#7C93A8"];

function makeCard(type, extra = {}) {
  return {
    id: crypto.randomUUID(),
    type, // "text", "color", or "image"
    x: 30 + Math.random() * 100,
    y: 30 + Math.random() * 100,
    width: type === "text" ? 170 : type === "image" ? 190 : 150,
    height: type === "text" ? 130 : type === "image" ? 220 : 150,
    rotation: 0,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    text: type === "text" ? "kata baru" : "",
    textLight: true, // teks krem (terang) vs gelap
    imageUrl: null,
    caption: "",
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
  const [panelId, setPanelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState(null);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
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
  const panelCard = cards.find((c) => c.id === panelId);

  function updateCard(id, patch) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function addCard(type) {
    const card = makeCard(type);
    setCards((prev) => [...prev, card]);
    setSelectedId(card.id);
  }

  function deleteCard(id) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function triggerImagePicker() {
    fileInputRef.current?.click();
  }

  async function onImageSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    const card = makeCard("image", { uploading: true });
    setCards((prev) => [...prev, card]);
    setSelectedId(card.id);

    const mimeExt = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
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

  // ---------- drag & rotate (pointer events = mouse + touch dalam satu jalur) ----------

  function onCardPointerDown(e, card) {
    if (e.target.closest(".ctrl-btn")) return;
    setSelectedId(card.id);
    const canvasRect = canvasRef.current.getBoundingClientRect();
    dragState.current = {
      id: card.id,
      offsetX: e.clientX - canvasRect.left - card.x,
      offsetY: e.clientY - canvasRect.top - card.y,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onRotatePointerDown(e, card) {
    e.stopPropagation();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const centerX = canvasRect.left + card.x + card.width / 2;
    const centerY = canvasRect.top + card.y + card.height / 2;
    const startAngle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
    rotateState.current = { id: card.id, centerX, centerY, startAngle, startRotation: card.rotation };
    setSelectedId(card.id);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  }

  useEffect(() => {
    function onMove(e) {
      if (dragState.current) {
        const { id, offsetX, offsetY } = dragState.current;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const card = cards.find((c) => c.id === id);
        if (!card) return;
        let x = e.clientX - canvasRect.left - offsetX;
        let y = e.clientY - canvasRect.top - offsetY;
        // beri sedikit ruang lewat tepi biar terasa bebas, tapi kartu nggak hilang sepenuhnya
        const margin = 40;
        x = Math.max(-margin, Math.min(x, canvasRect.width - card.width + margin));
        y = Math.max(-margin, Math.min(y, canvasRect.height - card.height + margin));
        updateCard(id, { x, y });
      }
      if (rotateState.current) {
        const { id, centerX, centerY, startAngle, startRotation } = rotateState.current;
        const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
        updateCard(id, { rotation: startRotation + (angle - startAngle) });
      }
    }
    function onUp() {
      const activeId = dragState.current?.id || rotateState.current?.id;
      if (activeId) setPanelId(activeId);
      dragState.current = null;
      rotateState.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [cards]);

  // ---------- save / export / delete ----------

  async function saveBoard() {
    setSaving(true);
    await supabase
      .from("boards")
      .update({ title, elements: cards, updated_at: new Date().toISOString() })
      .eq("id", boardId);
    setSaving(false);
  }

  async function exportBoard() {
    setSelectedId(null);
    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 80));
    try {
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `${(title || "board").replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Gagal mengunduh board. Coba lagi ya.");
    }
    setExporting(false);
  }

  async function deleteBoard() {
    const sure = window.confirm(`Hapus board "${title}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!sure) return;
    await supabase.from("boards").delete().eq("id", boardId);
    router.push("/dashboard");
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--ink-soft)" }}>Memuat board...</div>;
  }

  if (notFound) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p className="subtitle">Board tidak ditemukan.</p>
        <button className="btn-primary" style={{ maxWidth: 220, margin: "0 auto" }} onClick={() => router.push("/dashboard")}>
          Kembali ke Board saya
        </button>
      </div>
    );
  }

  return (
    <div className="editor-shell">
      <div className="editor-top">
        <div className="editor-top-left">
          <button className="icon-plain" onClick={() => router.push("/dashboard")} aria-label="Kembali">
            ←
          </button>
          <input className="title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="editor-top-right">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageSelected} style={{ display: "none" }} />
          <button className="chip-btn" onClick={triggerImagePicker}>+ Foto</button>
          <button className="chip-btn" onClick={() => addCard("text")}>+ Teks</button>
          <button className="chip-btn" onClick={() => addCard("color")}>+ Kotak warna</button>
          <button className="chip-btn" onClick={exportBoard} disabled={exporting}>
            {exporting ? "..." : "Unduh"}
          </button>
          <button className="chip-btn chip-danger" onClick={deleteBoard}>Hapus</button>
          <button className="chip-btn chip-primary" onClick={saveBoard} disabled={saving}>
            {saving ? "..." : "Simpan"}
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="canvas-area" onPointerDown={(e) => { if (e.target === e.currentTarget) { setSelectedId(null); setPanelId(null); } }}>
          <div ref={canvasRef} className="canvas" onPointerDown={(e) => { if (e.target === e.currentTarget) { setSelectedId(null); setPanelId(null); } }}>
            <div className="watermark">dibuat dengan Selaras</div>

            {cards.map((card) => (
              <div
                key={card.id}
                onPointerDown={(e) => onCardPointerDown(e, card)}
                className={"board-card" + (selectedId === card.id ? " selected" : "")}
                style={{
                  left: card.x,
                  top: card.y,
                  width: card.width,
                  height: card.height,
                  transform: `rotate(${card.rotation}deg)`,
                }}
              >
                <div
                  className="card-fill"
                  style={{
                    background: card.type === "image" ? "#E7D9C7" : card.color,
                    padding: card.type === "image" ? 0 : 14,
                  }}
                >
                  {card.type === "text" && (
                    <p className="card-text" style={{ color: card.textLight ? "#F3E9D8" : "#241C33" }}>
                      {card.text}
                    </p>
                  )}

                  {card.type === "image" && card.uploading && <span className="card-status">Mengunggah...</span>}
                  {card.type === "image" && card.uploadError && <span className="card-status error">Gagal unggah</span>}
                  {card.type === "image" && card.imageUrl && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.imageUrl} alt="" draggable={false} crossOrigin="anonymous" className="card-img" />
                      {card.caption && <div className="card-caption">{card.caption}</div>}
                    </>
                  )}
                </div>

                {selectedId === card.id && (
                  <>
                    <div className="ctrl-btn del-btn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}>
                      ×
                    </div>
                    <div className="ctrl-btn rotate-btn" onPointerDown={(e) => onRotatePointerDown(e, card)}>
                      ↻
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {panelCard && (
          <>
            <div className="panel-veil" onClick={() => { setSelectedId(null); setPanelId(null); }} />
            <div className="side-panel">
              <div className="panel-handle" />
              <button className="panel-close" onClick={() => { setSelectedId(null); setPanelId(null); }}>Selesai</button>

              {panelCard.type !== "image" && (
                <div className="panel-section">
                  <p className="panel-label">Warna kotak</p>
                  <div className="swatch-row">
                    {COLORS.map((c) => (
                      <div
                        key={c}
                        className={"swatch" + (panelCard.color === c ? " active" : "")}
                        style={{ background: c }}
                        onClick={() => updateCard(panelCard.id, { color: c })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {panelCard.type === "text" && (
                <>
                  <div className="panel-section">
                    <p className="panel-label">Warna teks</p>
                    <div className="toggle-row">
                      <button
                        className={"toggle-btn" + (panelCard.textLight ? " active" : "")}
                        onClick={() => updateCard(panelCard.id, { textLight: true })}
                      >
                        Krem
                      </button>
                      <button
                        className={"toggle-btn" + (!panelCard.textLight ? " active" : "")}
                        onClick={() => updateCard(panelCard.id, { textLight: false })}
                      >
                        Gelap
                      </button>
                    </div>
                  </div>
                  <div className="panel-section">
                    <p className="panel-label">Teks</p>
                    <textarea
                      className="panel-textarea"
                      value={panelCard.text}
                      onChange={(e) => updateCard(panelCard.id, { text: e.target.value })}
                    />
                  </div>
                </>
              )}

              {panelCard.type === "image" && (
                <div className="panel-section">
                  <p className="panel-label">Teks di atas foto (opsional)</p>
                  <textarea
                    className="panel-textarea"
                    placeholder="Misal: satu langkah setiap hari"
                    value={panelCard.caption}
                    onChange={(e) => updateCard(panelCard.id, { caption: e.target.value })}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .editor-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .editor-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 14px;
          border-bottom: 1px solid var(--line);
          background: var(--panel);
          flex-wrap: wrap;
        }
        .editor-top-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .icon-plain {
          border: none;
          background: none;
          font-size: 18px;
          color: var(--ink-soft);
          cursor: pointer;
          padding: 4px;
        }
        .title-input {
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--ink);
          max-width: 140px;
          font-family: inherit;
        }
        .title-input:focus {
          outline: none;
        }
        .editor-top-right {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .chip-btn {
          padding: 8px 12px;
          border-radius: 100px;
          border: 1px solid var(--line);
          background: none;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink);
          cursor: pointer;
          white-space: nowrap;
        }
        .chip-primary {
          background: var(--plum);
          color: #fff;
          border: none;
        }
        .chip-danger {
          color: var(--danger);
          border-color: rgba(179, 68, 58, 0.3);
        }
        .editor-body {
          flex: 1;
          display: flex;
          position: relative;
          overflow: hidden;
        }
        .canvas-area {
          flex: 1;
          background: var(--canvas);
          padding: 20px;
          overflow: auto;
          display: flex;
          justify-content: center;
          touch-action: none;
        }
        .canvas {
          position: relative;
          width: 340px;
          min-height: 480px;
          background: var(--panel);
          border-radius: 16px;
          box-shadow: 0 20px 50px -30px rgba(36, 28, 51, 0.3);
          flex-shrink: 0;
          touch-action: none;
        }
        .watermark {
          position: absolute;
          bottom: 10px;
          right: 12px;
          font-size: 10.5px;
          color: rgba(36, 28, 51, 0.35);
          pointer-events: none;
          z-index: 1;
        }
        .board-card {
          position: absolute;
          border-radius: 12px;
          cursor: grab;
          user-select: none;
          box-shadow: 0 10px 24px -12px rgba(36, 28, 51, 0.25);
          touch-action: none;
        }
        .board-card.selected {
          box-shadow: 0 16px 32px -14px rgba(36, 28, 51, 0.35);
        }
        .card-fill {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
        }
        .board-card.selected .card-fill {
          border-color: var(--plum);
        }
        .card-text {
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 14px;
          text-align: center;
          margin: 0;
        }
        .card-status {
          font-size: 12px;
          color: var(--ink-soft);
        }
        .card-status.error {
          color: var(--danger);
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
        .card-caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(36, 28, 51, 0.55);
          color: #f3e9d8;
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 12.5px;
          text-align: center;
          padding: 8px 10px;
        }
        .ctrl-btn {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          z-index: 5;
          box-shadow: 0 4px 10px rgba(36, 28, 51, 0.3);
        }
        .del-btn {
          top: -14px;
          right: -14px;
          width: 34px;
          height: 34px;
          background: rgba(36, 28, 51, 0.75);
          color: #fff;
          font-size: 16px;
          touch-action: none;
        }
        .rotate-btn {
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 34px;
          height: 34px;
          background: var(--plum);
          color: #fff;
          font-size: 15px;
          cursor: grab;
          touch-action: none;
        }

        /* ---------- side panel: docked on wide screens, bottom sheet on mobile ---------- */
        .panel-veil {
          display: none;
        }
        .side-panel {
          width: 220px;
          border-left: 1px solid var(--line);
          background: var(--panel);
          padding: 18px;
          flex-shrink: 0;
          overflow-y: auto;
        }
        .panel-handle,
        .panel-close {
          display: none;
        }
        .panel-section {
          margin-bottom: 20px;
        }
        .panel-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink-soft);
          margin: 0 0 10px;
        }
        .swatch-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .swatch {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
        }
        .swatch.active {
          border-color: var(--ink);
        }
        .toggle-row {
          display: flex;
          gap: 8px;
        }
        .toggle-btn {
          flex: 1;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: none;
          font-size: 12.5px;
          cursor: pointer;
          color: var(--ink);
        }
        .toggle-btn.active {
          background: var(--ink);
          color: var(--bg);
          border-color: var(--ink);
        }
        .panel-textarea {
          width: 100%;
          height: 80px;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 10px;
          font-family: "Inter", sans-serif;
          font-size: 13px;
          resize: none;
          color: var(--ink);
          background: var(--panel);
        }
        .panel-textarea:focus {
          outline: none;
          border-color: var(--plum);
        }

        @media (max-width: 760px) {
          .editor-top-right {
            justify-content: flex-end;
          }
          .canvas-area {
            padding: 16px 12px 100px;
          }
          .panel-veil {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(36, 28, 51, 0.35);
            z-index: 20;
          }
          .side-panel {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            top: auto;
            width: 100%;
            max-height: 55vh;
            border-left: none;
            border-top: 1px solid var(--line);
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -12px 30px rgba(0, 0, 0, 0.15);
            padding: 12px 18px 24px;
            z-index: 21;
          }
          .panel-handle {
            display: block;
            width: 36px;
            height: 4px;
            border-radius: 2px;
            background: var(--line);
            margin: 4px auto 14px;
          }
          .panel-close {
            display: block;
            margin: 0 auto 16px;
            border: none;
            background: none;
            color: var(--plum);
            font-size: 13.5px;
            font-weight: 500;
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  );
}
