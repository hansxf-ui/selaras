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
    textXPct: 50,
    textYPct: 50,
    textLight: true, // teks krem (terang) vs gelap
    imageUrl: null,
    caption: "",
    captionXPct: 50,
    captionYPct: 85,
    captionWidth: 140,
    captionScale: 1,
    captionRotation: 0,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragState = useRef(null);
  const rotateState = useRef(null);
  const resizeState = useRef(null);
  const captionDragState = useRef(null);
  const captionResizeState = useRef(null);
  const captionRotateState = useRef(null);

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

  function onResizePointerDown(e, card) {
    e.stopPropagation();
    resizeState.current = {
      id: card.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: card.width,
      startHeight: card.height,
    };
    setSelectedId(card.id);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onInnerTextPointerDown(e, card, xKey, yKey) {
    e.stopPropagation();
    const fillRect = e.currentTarget.parentElement.getBoundingClientRect();
    captionDragState.current = {
      id: card.id,
      xKey,
      yKey,
      fillWidth: fillRect.width,
      fillHeight: fillRect.height,
      startX: e.clientX,
      startY: e.clientY,
      startXPct: card[xKey],
      startYPct: card[yKey],
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onCaptionResizePointerDown(e, card) {
    e.stopPropagation();
    captionResizeState.current = {
      id: card.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: card.captionWidth,
      startScale: card.captionScale,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onCaptionRotatePointerDown(e, card) {
    e.stopPropagation();
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
    captionRotateState.current = { id: card.id, centerX, centerY, startAngle, startRotation: card.captionRotation };
    e.currentTarget.setPointerCapture?.(e.pointerId);
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
      if (resizeState.current) {
        const { id, startX, startY, startWidth, startHeight } = resizeState.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const width = Math.max(60, Math.min(400, startWidth + dx));
        const height = Math.max(60, Math.min(460, startHeight + dy));
        updateCard(id, { width, height });
      }
      if (captionDragState.current) {
        const { id, xKey, yKey, fillWidth, fillHeight, startX, startY, startXPct, startYPct } = captionDragState.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const xPct = Math.max(8, Math.min(92, startXPct + (dx / fillWidth) * 100));
        const yPct = Math.max(8, Math.min(92, startYPct + (dy / fillHeight) * 100));
        updateCard(id, { [xKey]: xPct, [yKey]: yPct });
      }
      if (captionResizeState.current) {
        const { id, startX, startY, startWidth, startScale } = captionResizeState.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const captionWidth = Math.max(70, Math.min(300, startWidth + dx));
        const captionScale = Math.max(0.6, Math.min(2.5, startScale + dy / 100));
        updateCard(id, { captionWidth, captionScale });
      }
      if (captionRotateState.current) {
        const { id, centerX, centerY, startAngle, startRotation } = captionRotateState.current;
        const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
        updateCard(id, { captionRotation: startRotation + (angle - startAngle) });
      }
    }
    function onUp() {
      dragState.current = null;
      rotateState.current = null;
      resizeState.current = null;
      captionDragState.current = null;
      captionResizeState.current = null;
      captionRotateState.current = null;
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
      setToast("Gagal mengunduh board. Coba lagi ya.");
      setTimeout(() => setToast(""), 3000);
    }
    setExporting(false);
  }

  async function confirmDeleteBoard() {
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
          <button className="chip-btn chip-danger" onClick={() => setShowDeleteConfirm(true)}>Hapus</button>
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
                    <p
                      className="card-text"
                      onPointerDown={(e) => onInnerTextPointerDown(e, card, "textXPct", "textYPct")}
                      style={{
                        color: card.textLight ? "#F3E9D8" : "#241C33",
                        left: `${card.textXPct}%`,
                        top: `${card.textYPct}%`,
                      }}
                    >
                      {card.text}
                    </p>
                  )}

                  {card.type === "image" && card.uploading && <span className="card-status">Mengunggah...</span>}
                  {card.type === "image" && card.uploadError && <span className="card-status error">Gagal unggah</span>}
                  {card.type === "image" && card.imageUrl && (
                    <>
                      <div className="photo-clip">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={card.imageUrl} alt="" draggable={false} crossOrigin="anonymous" className="card-img" />
                      </div>
                      {card.caption && (
                        <div
                          className="card-caption"
                          onPointerDown={(e) => onInnerTextPointerDown(e, card, "captionXPct", "captionYPct")}
                          style={{
                            left: `${card.captionXPct}%`,
                            top: `${card.captionYPct}%`,
                            width: `${card.captionWidth}px`,
                            transform: `translate(-50%, -50%) rotate(${card.captionRotation}deg) scale(${card.captionScale})`,
                          }}
                        >
                          {card.caption}
                          {selectedId === card.id && (
                            <>
                              <div className="caption-handle caption-rotate" onPointerDown={(e) => onCaptionRotatePointerDown(e, card)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-3-6.7" /><path d="M21 3v6h-6" /></svg>
                              </div>
                              <div className="caption-handle caption-resize" onPointerDown={(e) => onCaptionResizePointerDown(e, card)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {selectedId === card.id && (
                  <>
                    <div className="ctrl-btn del-btn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </div>
                    <div className="ctrl-btn rotate-btn" onPointerDown={(e) => onRotatePointerDown(e, card)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-3-6.7" /><path d="M21 3v6h-6" /></svg>
                    </div>
                    <div className="ctrl-btn edit-btn" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setPanelId(card.id); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
                    </div>
                    <div className="ctrl-btn resize-btn" onPointerDown={(e) => onResizePointerDown(e, card)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {panelCard && (
          <>
            <div className="panel-veil" onClick={() => setPanelId(null)} />
            <div className="side-panel">
              <div className="panel-handle" />
              <button className="panel-close" onClick={() => setPanelId(null)}>Selesai</button>

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

      {showDeleteConfirm && (
        <div className="confirm-veil" onClick={() => setShowDeleteConfirm(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-title">Hapus board ini?</p>
            <p className="confirm-body">"{title}" akan terhapus permanen dan tidak bisa dikembalikan.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowDeleteConfirm(false)}>Batal</button>
              <button className="confirm-delete" onClick={confirmDeleteBoard}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}

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
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
        }
        .board-card.selected .card-fill {
          border-color: var(--plum);
        }
        .photo-clip {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          overflow: hidden;
        }
        .card-text {
          position: absolute;
          transform: translate(-50%, -50%);
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 14px;
          text-align: center;
          margin: 0;
          max-width: 88%;
          cursor: grab;
          touch-action: none;
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
          box-sizing: border-box;
          background: rgba(36, 28, 51, 0.6);
          color: #f3e9d8;
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 12.5px;
          text-align: center;
          padding: 7px 12px;
          border-radius: 10px;
          cursor: grab;
          touch-action: none;
          z-index: 3;
        }
        .caption-handle {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(36, 28, 51, 0.78);
          color: #fff;
          cursor: pointer;
          touch-action: none;
          box-shadow: 0 3px 8px rgba(36, 28, 51, 0.35);
        }
        .caption-handle :global(svg) {
          width: 11px;
          height: 11px;
        }
        .caption-rotate {
          top: -26px;
          left: 50%;
          transform: translateX(-50%);
          cursor: grab;
        }
        .caption-resize {
          bottom: -9px;
          right: -9px;
          cursor: nwse-resize;
          padding: 0 1px;
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
          background: rgba(36, 28, 51, 0.78);
          color: #fff;
          width: 32px;
          height: 32px;
          touch-action: none;
        }
        .ctrl-btn :global(svg) {
          width: 14px;
          height: 14px;
        }
        .del-btn {
          top: -13px;
          right: -13px;
        }
        .rotate-btn {
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          cursor: grab;
        }
        .edit-btn {
          top: -13px;
          left: -13px;
        }
        .resize-btn {
          bottom: -13px;
          right: -13px;
          cursor: nwse-resize;
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

        .confirm-veil {
          position: fixed;
          inset: 0;
          background: rgba(36, 28, 51, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 24px;
        }
        .confirm-box {
          background: var(--panel);
          border-radius: 20px;
          max-width: 320px;
          width: 100%;
          padding: 26px 24px;
          box-shadow: 0 30px 60px -20px rgba(36, 28, 51, 0.4);
        }
        .confirm-title {
          font-family: "Fraunces", serif;
          font-weight: 500;
          font-size: 18px;
          margin: 0 0 8px;
        }
        .confirm-body {
          font-size: 13.5px;
          color: var(--ink-soft);
          line-height: 1.5;
          margin: 0 0 22px;
        }
        .confirm-actions {
          display: flex;
          gap: 10px;
        }
        .confirm-cancel,
        .confirm-delete {
          flex: 1;
          padding: 11px;
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
        }
        .confirm-cancel {
          border: 1px solid var(--line);
          background: none;
          color: var(--ink);
        }
        .confirm-delete {
          border: none;
          background: var(--danger);
          color: #fff;
        }
        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ink);
          color: var(--bg);
          padding: 12px 20px;
          border-radius: 100px;
          font-size: 13px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          z-index: 60;
        }
      `}</style>
    </div>
  );
}
