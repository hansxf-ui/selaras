"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
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

  if (sent) {
    return (
      <div className="page-center">
        <div className="card-panel" style={{ textAlign: "center" }}>
          <h1>Periksa emailmu</h1>
          <p className="subtitle">
            Kami mengirim tautan reset kata sandi ke {email}. Buka tautan itu untuk membuat kata sandi baru.
          </p>
          <Link href="/login">
            <button className="btn-primary">Kembali ke halaman masuk</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="card-panel">
        <div className="brand" style={{ marginBottom: 24 }}>
          Selaras
        </div>
        <h1>Lupa kata sandi?</h1>
        <p className="subtitle">Masukkan email akunmu, kami kirimkan tautan untuk mengatur ulang kata sandi.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Mengirim..." : "Kirim tautan reset"}
          </button>
        </form>

        <p className="switch-line">
          <Link href="/login">Kembali ke halaman masuk</Link>
        </p>
      </div>
    </div>
  );
}
