import Link from "next/link";

export default function Home() {
  return (
    <div className="container" style={{ textAlign: "center" }}>
      <h1>Selaras</h1>
      <p className="subtitle">
        Susun visimu jadi satu papan yang terus kamu lihat.
      </p>
      <Link href="/signup">
        <button className="btn-primary" style={{ marginBottom: 12 }}>
          Buat board pertamamu
        </button>
      </Link>
      <Link href="/login">
        <button className="btn-primary" style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--ink)" }}>
          Sudah punya akun? Masuk
        </button>
      </Link>
    </div>
  );
}
