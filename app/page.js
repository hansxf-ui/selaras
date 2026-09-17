import Link from "next/link";

export default function Home() {
  return (
    <div className="landing-wrap">
      <div className="brand" style={{ marginBottom: 40 }}>
        Selaras
      </div>

      <h1>
        Susun visimu jadi <em>satu papan</em> yang terus kamu lihat
      </h1>
      <p className="subtitle" style={{ margin: "0 auto 0" }}>
        Kumpulkan foto, warna, dan kata yang mewakili arah hidupmu — susun
        jadi satu halaman yang enak dipandang, tanpa perlu jago desain.
      </p>

      <div className="landing-preview">
        <div style={{ background: "linear-gradient(150deg,#E7D9C7,#D9BFA0)" }} />
        <div style={{ background: "#6B4E71" }} />
        <div style={{ background: "linear-gradient(150deg,#9FB08F,#71865F)" }} />
        <div style={{ background: "#D9A441" }} />
      </div>

      <div className="landing-ctas">
        <Link href="/signup">
          <button className="btn-primary">Buat board pertamamu</button>
        </Link>
        <Link href="/login">
          <button className="btn-outline">Sudah punya akun? Masuk</button>
        </Link>
      </div>
    </div>
  );
}
