"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    // Supabase otomatis membuat sesi sementara dari tautan email yang diklik,
    // jadi updateUser di sini akan berlaku untuk akun yang sesuai.
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Tautan reset sudah kedaluwarsa atau tidak valid. Minta tautan baru ya.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="page-center">
        <div className="card-panel" style={{ textAlign: "center" }}>
          <h1>Kata sandi berhasil diubah</h1>
          <p className="subtitle">Kamu sekarang bisa masuk dengan kata sandi barumu.</p>
          <button className="btn-primary" onClick={() => router.push("/login")}>
            Masuk sekarang
          </button>
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
        <h1>Buat kata sandi baru</h1>
        <p className="subtitle">Pastikan kata sandi barumu berbeda dari yang sebelumnya digunakan.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="password">Kata sandi baru</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Konfirmasi kata sandi</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan kata sandi baru"}
          </button>
        </form>
      </div>
    </div>
  );
}
