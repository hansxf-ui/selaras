"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="page-center">
        <div className="card-panel" style={{ textAlign: "center" }}>
          <h1>Cek emailmu</h1>
          <p className="subtitle">
            Kami mengirim tautan konfirmasi ke {email}. Buka tautan itu untuk
            mengaktifkan akunmu, lalu masuk.
          </p>
          <Link href="/login">
            <button className="btn-primary">Ke halaman masuk</button>
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
        <h1>Buat board pertamamu</h1>
        <p className="subtitle">Gratis untuk mulai, tanpa perlu kartu kredit.</p>

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
          <div className="field">
            <label htmlFor="password">Kata sandi</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Buat akun"}
          </button>
        </form>

        <p className="switch-line">
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
