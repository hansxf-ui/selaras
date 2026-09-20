"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passErr, setPassErr] = useState(false);
  const [confirmErr, setConfirmErr] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const passOk = password.length >= 8;
    const matchOk = password === confirmPassword && confirmPassword.length > 0;
    setPassErr(!passOk);
    setConfirmErr(!matchOk);
    if (!passOk || !matchOk) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Tautan reset sudah kedaluwarsa atau tidak valid. Minta tautan baru ya.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="brand">Selaras</div>
        <div className="steps">
          <span className="done" />
          <span className="done" />
          <span className={done ? "done" : ""} />
        </div>

        {!done ? (
          <>
            <div className="icon-circle">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
            </div>
            <h1>Buat kata sandi baru</h1>
            <p className="subtitle">Pastikan kata sandi barumu berbeda dari yang sebelumnya digunakan.</p>
            <form onSubmit={handleSubmit}>
              <div className={"field" + (passErr ? " has-error" : "")}>
                <label htmlFor="newpass">Kata sandi baru</label>
                <input
                  id="newpass"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="error-msg">Kata sandi minimal 8 karakter</div>
              </div>
              <div className={"field" + (confirmErr ? " has-error" : "")}>
                <label htmlFor="confirmpass">Konfirmasi kata sandi</label>
                <input
                  id="confirmpass"
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="error-msg">Konfirmasi tidak cocok</div>
              </div>
              {error && <p className="error-msg" style={{ display: "block", marginTop: -8, marginBottom: 14 }}>{error}</p>}
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan kata sandi baru"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="icon-circle success">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1>Kata sandi berhasil diubah</h1>
            <p className="subtitle">Kamu sekarang bisa masuk dengan kata sandi barumu.</p>
            <button className="btn" type="button" onClick={() => router.push("/login")}>
              Masuk sekarang
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .card {
          width: 100%;
          max-width: 400px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 40px 34px;
          box-shadow: 0 40px 80px -50px rgba(36, 28, 51, 0.3);
        }
        .brand {
          font-family: "Fraunces", serif;
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 30px;
        }
        .steps {
          display: flex;
          gap: 6px;
          margin-bottom: 28px;
        }
        .steps span {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: var(--line);
          transition: background 0.3s;
        }
        .steps span.done {
          background: var(--plum);
        }
        .icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(107, 78, 113, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .icon-circle :global(svg) {
          width: 22px;
          height: 22px;
          stroke: var(--plum);
        }
        .icon-circle.success {
          background: rgba(59, 109, 17, 0.12);
        }
        .icon-circle.success :global(svg) {
          stroke: #3b6d11;
        }
        h1 {
          font-family: "Fraunces", serif;
          font-weight: 500;
          font-size: 24px;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 14.5px;
          color: var(--ink-soft);
          line-height: 1.55;
          margin-bottom: 28px;
        }
        .field {
          margin-bottom: 18px;
        }
        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-soft);
          margin-bottom: 7px;
        }
        .field input {
          width: 100%;
          padding: 13px 15px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--ink);
          font-size: 14.5px;
          font-family: "Inter", sans-serif;
        }
        .field input:focus {
          outline: none;
          border-color: var(--plum);
          box-shadow: 0 0 0 3px rgba(107, 78, 113, 0.14);
        }
        .error-msg {
          font-size: 12.5px;
          color: var(--danger);
          margin-top: 6px;
          display: none;
        }
        .field.has-error input {
          border-color: var(--danger);
        }
        .field.has-error .error-msg {
          display: block;
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
      `}</style>
    </div>
  );
}
