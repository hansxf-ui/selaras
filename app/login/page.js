"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <path
        fill="currentColor"
        d="M13.2 9.6c0-2.16 1.77-3.2 1.85-3.25-1.01-1.48-2.58-1.68-3.14-1.7-1.34-.14-2.61.79-3.29.79-.68 0-1.72-.77-2.83-.75-1.46.02-2.8.85-3.55 2.16-1.51 2.62-.39 6.51 1.09 8.63.72 1.04 1.58 2.2 2.71 2.16 1.09-.04 1.5-.7 2.82-.7 1.31 0 1.68.7 2.83.68 1.17-.02 1.91-1.06 2.62-2.11.83-1.2 1.17-2.37 1.19-2.43-.03-.01-2.28-.88-2.3-3.48zM11.1 2.98c.59-.72 1-1.71.89-2.71-.86.04-1.9.57-2.51 1.29-.55.63-1.03 1.65-.9 2.62.94.07 1.9-.48 2.52-1.2z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [passErr, setPassErr] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthError, setOauthError] = useState("");

  function validate() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passOk = password.length >= 8;
    setEmailErr(!emailOk);
    setPassErr(!passOk);
    return emailOk && passOk;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError("Email atau kata sandi salah.");
      return;
    }
    router.push("/dashboard");
  }

  async function handleOAuth(provider) {
    setOauthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setOauthError(`Masuk dengan ${provider} belum aktif di akun ini.`);
  }

  return (
    <div className="shell">
      <div className="visual">
        <div className="brand">Selaras</div>
        <div className="stage">
          <div className="stack">
            <div className="card k1" />
            <div className="card k2">
              <span>rumah sendiri, 2028</span>
            </div>
            <div className="card k3" />
          </div>
        </div>
        <div className="visual-quote">
          <p>Tempat semua yang kamu tuju berkumpul jadi satu pandangan.</p>
          <span>Dipakai untuk menyusun lebih dari 12.000 board bulan ini</span>
        </div>
      </div>

      <div className="form-side">
        <div className="form-box">
          <div className="tabs">
            <button className="tab active" type="button">
              Masuk
            </button>
            <Link href="/signup" className="tab">
              Daftar
            </Link>
          </div>

          <h1>Selamat datang kembali</h1>
          <p className="subtitle">Masuk untuk lanjutkan board yang sedang kamu susun.</p>

          <form onSubmit={handleSubmit}>
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

            <div className={"field" + (passErr ? " has-error" : "")}>
              <label htmlFor="password">Kata sandi</label>
              <input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="error-msg">Kata sandi minimal 8 karakter</div>
            </div>

            <div className="row-between">
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Ingat
                saya
              </label>
              <Link href="/forgot-password" className="forgot">
                Lupa kata sandi?
              </Link>
            </div>

            {error && <p className="error-text-line">{error}</p>}

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="divider">atau lanjutkan dengan</div>
          {oauthError && <p className="error-text-line" style={{ marginBottom: 10 }}>{oauthError}</p>}
          <button className="btn-social" type="button" onClick={() => handleOAuth("google")}>
            <GoogleLogo /> Google
          </button>
          <button className="btn-social" type="button" onClick={() => handleOAuth("apple")}>
            <AppleLogo /> Apple
          </button>

          <p className="switch-line">
            Belum punya akun? <Link href="/signup">Daftar di sini</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .shell {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 100vh;
        }
        .visual {
          display: none;
          position: relative;
          background: var(--plum);
          color: #f3e9d8;
          padding: 48px;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }
        .visual::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 15%, rgba(217, 164, 65, 0.18), transparent 55%),
            radial-gradient(circle at 80% 85%, rgba(198, 113, 79, 0.22), transparent 50%);
        }
        .brand {
          font-family: "Fraunces", serif;
          font-size: 22px;
          font-weight: 600;
          position: relative;
          z-index: 2;
        }
        .stage {
          position: relative;
          height: 340px;
          perspective: 1300px;
          z-index: 2;
        }
        .stack {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateY(10deg) rotateX(4deg);
        }
        .card {
          position: absolute;
          border-radius: 16px;
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.4);
          opacity: 0;
          transform: translateY(22px) rotate(var(--r, 0deg));
          animation: rise 0.85s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: var(--d, 0s);
        }
        @keyframes rise {
          to {
            opacity: 1;
            transform: translateY(0) translateZ(var(--z, 0px)) rotate(var(--r, 0deg));
          }
        }
        .k1 {
          width: 190px;
          height: 240px;
          left: 10px;
          top: 10px;
          --z: 20px;
          --r: -5deg;
          --d: 0.05s;
          background: linear-gradient(160deg, #e7d9c7, #d9bfa0);
        }
        .k2 {
          width: 140px;
          height: 140px;
          left: 190px;
          top: 40px;
          --z: 70px;
          --r: 4deg;
          --d: 0.2s;
          background: var(--gold);
          display: flex;
          align-items: flex-end;
          padding: 16px;
        }
        .k2 span {
          font-size: 12px;
          font-weight: 600;
          color: #4a3352;
        }
        .k3 {
          width: 160px;
          height: 120px;
          left: 60px;
          top: 230px;
          --z: 50px;
          --r: -3deg;
          --d: 0.35s;
          background: linear-gradient(160deg, #9fb08f, #71865f);
        }
        .visual-quote {
          position: relative;
          z-index: 2;
        }
        .visual-quote p {
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 22px;
          line-height: 1.4;
          max-width: 26ch;
        }
        .visual-quote span {
          display: block;
          margin-top: 14px;
          font-size: 13px;
          color: rgba(243, 233, 216, 0.7);
        }

        .form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
        }
        .form-box {
          width: 100%;
          max-width: 380px;
        }
        .tabs {
          display: flex;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 100px;
          padding: 4px;
          margin-bottom: 32px;
        }
        .tab {
          flex: 1;
          text-align: center;
          padding: 10px 0;
          font-size: 14px;
          font-weight: 500;
          border-radius: 100px;
          cursor: pointer;
          color: var(--ink-soft);
          border: none;
          background: none;
          text-decoration: none;
        }
        .tab.active {
          background: var(--ink);
          color: var(--bg);
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
          margin-bottom: 28px;
          line-height: 1.5;
        }
        .field {
          margin-bottom: 16px;
        }
        .field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-soft);
          margin-bottom: 6px;
        }
        .field input {
          width: 100%;
          padding: 12px 14px;
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
        .error-text-line {
          font-size: 12.5px;
          color: var(--danger);
          margin: -6px 0 14px;
        }
        .row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: -2px 0 20px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .remember {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--ink-soft);
        }
        .remember input {
          width: 15px;
          height: 15px;
          accent-color: var(--plum);
        }
        :global(.forgot) {
          font-size: 13px;
          color: var(--plum);
          text-decoration: none;
          font-weight: 500;
        }
        .btn-submit {
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
        .btn-submit:hover {
          background: var(--plum-deep);
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        .btn-social {
          width: 100%;
          padding: 11px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--ink);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-social:hover {
          background: var(--bg);
        }
        .switch-line {
          text-align: center;
          margin-top: 26px;
          font-size: 14px;
          color: var(--ink-soft);
        }
        :global(.switch-line a) {
          color: var(--plum);
          font-weight: 500;
          text-decoration: none;
        }

        @media (min-width: 820px) {
          .shell {
            grid-template-columns: 1.05fr 1fr;
          }
          .visual {
            display: flex;
          }
          .form-side {
            padding: 48px 32px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .card {
            animation: none;
            opacity: 1;
            transform: translateZ(var(--z, 0px)) rotate(var(--r, 0deg));
          }
        }
      `}</style>
    </div>
  );
}
