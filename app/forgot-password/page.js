"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendLabel, setResendLabel] = useState("Kirim ulang");

  async function sendReset(e) {
    if (e) e.preventDefault();
    setError("");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setEmailErr(!emailOk);
    if (!emailOk) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setError("Gagal mengirim email. Coba lagi ya.");
      return;
    }
    setSent(true);
  }

  async function handleResend() {
    setResendLabel("Terkirim");
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setTimeout(() => setResendLabel("Kirim ulang"), 2000);
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="brand">Selaras</div>
        <div className="steps">
          <span className="done" />
          <span className={sent ? "done" : ""} />
          <span />
        </div>

        {!sent ? (
          <>
            <div className="icon-circle">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <h1>Lupa kata sandi?</h1>
            <p className="subtitle">Masukkan email akunmu, kami kirimkan tautan untuk mengatur ulang kata sandi.</p>
            <form onSubmit={sendReset}>
              <div className={"field" + (emailErr ? " has-error" : "")}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="error-msg">Masukkan email yang valid</div>
              </div>
              {error && <p className="error-msg" style={{ display: "block", marginTop: -8, marginBottom: 14 }}>{error}</p>}
              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Mengirim..." : "Kirim tautan reset"}
              </button>
            </form>
            <Link href="/login" className="back-link">
              ← Kembali ke halaman masuk
            </Link>
          </>
        ) : (
          <>
            <div className="icon-circle success">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1>Periksa emailmu</h1>
            <p className="subtitle">
              Kami mengirim tautan reset ke <b>{email}</b>. Buka tautan itu untuk membuat kata sandi baru.
            </p>
            <p className="resend">
              Tidak menerima email?{" "}
              <a onClick={handleResend} style={{ cursor: "pointer" }}>
                {resendLabel}
              </a>
            </p>
            <Link href="/login" className="back-link">
              ← Kembali ke halaman masuk
            </Link>
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
        .subtitle :global(b) {
          color: var(--ink);
          font-weight: 500;
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
        :global(.back-link) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          color: var(--ink-soft);
          text-decoration: none;
          margin-top: 22px;
        }
        .resend {
          font-size: 13.5px;
          color: var(--ink-soft);
          margin-top: 20px;
          text-align: center;
        }
        .resend :global(a) {
          color: var(--plum);
          font-weight: 500;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
