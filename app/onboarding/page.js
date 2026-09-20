"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const GOALS = [
  {
    key: "Karir",
    label: "Karir dan pekerjaan",
    cls: "g1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    ),
  },
  {
    key: "Pernikahan",
    label: "Pernikahan dan hubungan",
    cls: "g2",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
      </svg>
    ),
  },
  {
    key: "Kesehatan",
    label: "Kesehatan dan kebiasaan",
    cls: "g3",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
      </svg>
    ),
  },
  {
    key: "Pengembangan diri",
    label: "Pengembangan diri",
    cls: "g4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

const QUOTES = {
  Karir: "satu langkah setiap hari",
  Pernikahan: "someday, i'll say i do",
  Kesehatan: "lebih kuat dari kemarin",
  "Pengembangan diri": "tumbuh sedikit tiap hari",
};

const TEMPLATES = {
  Tenang: { color1: "#C6714F", color2: "#6B4E71" },
  Segar: { color1: "#71865F", color2: "#D9A441" },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedTpl, setSelectedTpl] = useState("Tenang");
  const [creating, setCreating] = useState(false);
  const [newBoardId, setNewBoardId] = useState(null);

  async function createBoard() {
    setCreating(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const tpl = TEMPLATES[selectedTpl];
    const quote = QUOTES[selectedGoal] || "satu langkah setiap hari";

    const elements = [
      {
        id: crypto.randomUUID(),
        type: "color",
        x: 20,
        y: 20,
        width: 150,
        height: 190,
        rotation: -4,
        color: tpl.color1,
        text: "",
        textLight: true,
        imageUrl: null,
        caption: "",
      },
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 150,
        y: 60,
        width: 130,
        height: 130,
        rotation: 4,
        color: tpl.color2,
        text: quote,
        textXPct: 50,
        textYPct: 50,
        textLight: true,
      },
    ];

    const { data, error } = await supabase
      .from("boards")
      .insert({
        user_id: user.id,
        title: selectedGoal ? `Board ${selectedGoal}` : "Board pertamaku",
        elements,
      })
      .select()
      .single();

    await supabase
      .from("profiles")
      .upsert({ id: user.id, has_onboarded: true }, { onConflict: "id" });

    setCreating(false);
    if (!error && data) {
      setNewBoardId(data.id);
      setStep(3);
    }
  }

  function handleSkip() {
    setSelectedGoal(null);
    createBoard();
  }

  return (
    <div className="page-center" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div className="wrap">
        <div className="top">
          <div className="brand">Selaras</div>
          {step < 3 && (
            <a className="skip" onClick={handleSkip}>
              Lewati
            </a>
          )}
        </div>
        <div className="progress">
          <span className={step >= 1 ? "done" : ""} />
          <span className={step >= 2 ? "done" : ""} />
          <span className={step >= 3 ? "done" : ""} />
        </div>

        <div className="panel">
          {step === 1 && (
            <div>
              <div className="step-label">Langkah 1 dari 3</div>
              <h1>Board ini buat apa?</h1>
              <p className="subtitle">Biar kami siapkan template dan kata yang cocok untukmu.</p>
              <div className="goal-grid">
                {GOALS.map((g) => (
                  <div
                    key={g.key}
                    className={`goal ${g.cls}` + (selectedGoal === g.key ? " selected" : "")}
                    onClick={() => setSelectedGoal(g.key)}
                  >
                    <div className="check">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div className="ic">{g.icon}</div>
                    <p>{g.label}</p>
                  </div>
                ))}
              </div>
              <button className="btn" disabled={!selectedGoal} onClick={() => setStep(2)}>
                Lanjut
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="step-label">Langkah 2 dari 3</div>
              <h1>Pilih satu titik awal</h1>
              <p className="subtitle">Kamu bisa ubah semuanya nanti — ini cuma titik mulai.</p>
              <div className="tpl-grid">
                <div
                  className={"tpl" + (selectedTpl === "Tenang" ? " selected" : "")}
                  onClick={() => setSelectedTpl("Tenang")}
                >
                  <div className="tpl-preview">
                    <div className="t1a" />
                    <div className="t1b" />
                    <div className="t1a" style={{ gridColumn: "span 2", height: 24 }} />
                  </div>
                  <div className="tpl-name">Hangat dan tenang</div>
                </div>
                <div
                  className={"tpl" + (selectedTpl === "Segar" ? " selected" : "")}
                  onClick={() => setSelectedTpl("Segar")}
                >
                  <div className="tpl-preview">
                    <div className="t2a" />
                    <div className="t2b" />
                    <div className="t2a" style={{ gridColumn: "span 2", height: 24 }} />
                  </div>
                  <div className="tpl-name">Segar dan hidup</div>
                </div>
              </div>
              <div className="btn-row">
                <button className="btn-ghost" onClick={() => setStep(1)}>
                  Kembali
                </button>
                <button className="btn" style={{ flex: 1 }} onClick={createBoard} disabled={creating}>
                  {creating ? "Membuat..." : "Buat board"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="reveal-stage">
                <div className="reveal-stack">
                  <div className="rcard r1" />
                  <div className="rcard r2">
                    <span>{QUOTES[selectedGoal] || "satu langkah setiap hari"}</span>
                  </div>
                  <div className="rcard r3" />
                </div>
              </div>
              <div className="step3-copy">
                <h1>Board pertamamu sudah jadi</h1>
                <p className="subtitle">Tinggal ubah, tambah, atau susun ulang sesuai maumu.</p>
              </div>
              <button className="btn" onClick={() => router.push(`/board/${newBoardId}`)}>
                Buka board
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .wrap {
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        :global(.skip) {
          font-size: 13.5px;
          color: var(--ink-soft);
          text-decoration: none;
          cursor: pointer;
        }
        .progress {
          display: flex;
          gap: 6px;
          margin-bottom: 36px;
        }
        .progress span {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: var(--line);
          transition: background 0.3s;
        }
        .progress span.done {
          background: var(--plum);
        }
        .panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 40px 36px;
          box-shadow: 0 40px 80px -55px rgba(36, 28, 51, 0.3);
        }
        .step-label {
          font-size: 13px;
          color: var(--plum);
          font-weight: 500;
          margin-bottom: 10px;
        }
        h1 {
          font-family: "Fraunces", serif;
          font-weight: 500;
          font-size: 26px;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 14.5px;
          color: var(--ink-soft);
          line-height: 1.55;
          margin-bottom: 28px;
        }

        .goal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
        }
        .goal {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
        }
        .goal.selected {
          border: 2px solid var(--plum);
          background: rgba(107, 78, 113, 0.05);
        }
        .goal .ic {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .goal .ic :global(svg) {
          width: 16px;
          height: 16px;
          stroke-width: 1.8;
        }
        .goal p {
          font-size: 14px;
          font-weight: 500;
        }
        .g1 .ic {
          background: rgba(198, 113, 79, 0.14);
        }
        .g1 .ic :global(svg) {
          stroke: var(--clay);
        }
        .g2 .ic {
          background: rgba(107, 78, 113, 0.14);
        }
        .g2 .ic :global(svg) {
          stroke: var(--plum);
        }
        .g3 .ic {
          background: rgba(113, 134, 95, 0.14);
        }
        .g3 .ic :global(svg) {
          stroke: var(--sage);
        }
        .g4 .ic {
          background: rgba(217, 164, 65, 0.18);
        }
        .g4 .ic :global(svg) {
          stroke: var(--gold-deep, #b9832a);
        }
        .check {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--plum);
          display: none;
          align-items: center;
          justify-content: center;
        }
        .goal.selected .check {
          display: flex;
        }
        .check :global(svg) {
          width: 10px;
          height: 10px;
          stroke: #fff;
        }

        .tpl-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 28px;
        }
        .tpl {
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s;
        }
        .tpl.selected {
          border-color: var(--plum);
        }
        .tpl-preview {
          height: 110px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          padding: 6px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 14px 14px 0 0;
          border-bottom: none;
        }
        .tpl-preview div {
          border-radius: 6px;
        }
        .tpl-name {
          font-size: 13px;
          font-weight: 500;
          padding: 10px 4px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-top: none;
          border-radius: 0 0 14px 14px;
        }
        .t1a {
          background: linear-gradient(160deg, #e7d9c7, #d9bfa0);
        }
        .t1b {
          background: var(--plum);
        }
        .t2a {
          background: linear-gradient(160deg, #9fb08f, #71865f);
        }
        .t2b {
          background: var(--gold);
        }

        .btn {
          width: 100%;
          padding: 14px;
          border-radius: 100px;
          background: var(--plum);
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }
        .btn:hover {
          background: var(--plum-deep);
        }
        .btn:disabled {
          background: var(--line);
          color: var(--ink-soft);
          cursor: not-allowed;
        }
        .btn-row {
          display: flex;
          gap: 10px;
        }
        .btn-ghost {
          padding: 14px 22px;
          border-radius: 100px;
          background: none;
          border: 1px solid var(--line);
          color: var(--ink);
          font-size: 14.5px;
          font-weight: 500;
          cursor: pointer;
        }

        .reveal-stage {
          position: relative;
          height: 220px;
          margin-bottom: 20px;
          perspective: 1200px;
        }
        .reveal-stack {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateX(4deg);
        }
        .rcard {
          position: absolute;
          border-radius: 14px;
          opacity: 0;
          transform: translateY(18px) rotate(var(--r, 0deg));
          animation: rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: var(--d, 0s);
          box-shadow: 0 20px 40px -20px rgba(36, 28, 51, 0.3);
        }
        @keyframes rise {
          to {
            opacity: 1;
            transform: translateY(0) rotate(var(--r, 0deg));
          }
        }
        .r1 {
          width: 150px;
          height: 190px;
          left: 10px;
          top: 10px;
          --r: -5deg;
          --d: 0.05s;
          background: linear-gradient(160deg, #e7d9c7, #d9bfa0);
        }
        .r2 {
          width: 120px;
          height: 120px;
          left: 160px;
          top: 0;
          --r: 4deg;
          --d: 0.2s;
          background: var(--plum);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
        }
        .r2 span {
          font-family: "Fraunces", serif;
          font-style: italic;
          color: #f3e9d8;
          font-size: 12px;
          text-align: center;
        }
        .r3 {
          width: 130px;
          height: 100px;
          left: 170px;
          top: 130px;
          --r: -3deg;
          --d: 0.35s;
          background: var(--gold);
        }
        .step3-copy {
          text-align: center;
        }
        .step3-copy h1,
        .step3-copy .subtitle {
          text-align: center;
        }
      `}</style>
    </div>
  );
}
