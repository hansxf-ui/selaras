import Link from "next/link";

export default function Home() {
  return (
    <div className="landing">
      <div className="wrap">
        <nav>
          <div className="brand">Selaras</div>
          <Link href="/signup" className="nav-cta">
            Mulai gratis
          </Link>
        </nav>

        <section className="hero">
          <div>
            <div className="kicker">Vision board digital</div>
            <h1>
              Susun visimu jadi <em>satu papan</em> yang terus kamu lihat
            </h1>
            <p>
              Kumpulkan foto, warna, dan kata yang mewakili arah hidupmu — susun
              jadi satu halaman yang enak dipandang, tanpa perlu jago desain.
            </p>
            <div className="hero-ctas">
              <Link href="/signup" className="btn-primary-lg">
                Buat board pertamamu
              </Link>
              <Link href="/login" className="btn-secondary-lg">
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>

          <div className="stage">
            <div className="stack">
              <div className="card c1" />
              <div className="card c2">
                <span>tahun ini, lebih tenang</span>
              </div>
              <div className="card c3" />
              <div className="card c4" />
              <div className="card c5">
                <span>rumah sendiri, 2028</span>
              </div>
            </div>
          </div>
        </section>

        <div className="trust">
          <div>
            Dipakai untuk menyusun <b>rencana karir</b>, <b>pernikahan</b>, dan{" "}
            <b>kebiasaan baru</b>
          </div>
        </div>

        <section className="features">
          <div className="feature">
            <span className="num">satu</span>
            <h3>Pilih arah board</h3>
            <p>Karir, hubungan, kesehatan, atau rencana pribadi — mulai dari yang paling relevan buatmu.</p>
          </div>
          <div className="feature">
            <span className="num">dua</span>
            <h3>Susun bebas</h3>
            <p>Tarik foto, ubah warna, tambah kutipan. Semua elemen bisa digeser, diputar, dan diubah ukurannya.</p>
          </div>
          <div className="feature">
            <span className="num">tiga</span>
            <h3>Simpan dan unduh</h3>
            <p>Board tersimpan otomatis di akunmu, dan bisa diunduh jadi gambar kapan saja.</p>
          </div>
        </section>

        <div className="cta-band">
          <h2>Mulai dari satu gambar, satu kata dulu</h2>
          <p>Board pertamamu bisa jadi dalam waktu kurang dari lima menit.</p>
          <Link href="/signup" className="btn-primary-lg" style={{ marginTop: 22 }}>
            Buat board gratis
          </Link>
        </div>

        <footer>
          <div>Selaras — dibuat untuk yang masih menyusun arah</div>
        </footer>
      </div>

      <style jsx>{`
        .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 0;
        }
        .nav-cta {
          padding: 9px 18px;
          border-radius: 100px;
          background: var(--ink);
          color: var(--bg);
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 20px 0 48px;
        }
        .kicker {
          font-size: 13px;
          color: var(--plum);
          font-weight: 500;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .kicker::before {
          content: "";
          width: 18px;
          height: 1px;
          background: var(--plum);
        }
        h1 {
          font-size: clamp(30px, 7vw, 40px);
          line-height: 1.1;
          letter-spacing: -0.01em;
        }
        h1 em {
          font-style: italic;
          color: var(--plum);
          font-weight: 500;
        }
        .hero p {
          margin-top: 16px;
          font-size: 15.5px;
          line-height: 1.6;
          color: var(--ink-soft);
          max-width: 42ch;
        }
        .hero-ctas {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 26px;
        }
        .btn-primary-lg {
          padding: 13px 22px;
          border-radius: 100px;
          background: var(--plum);
          color: #fff;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
        }
        .btn-secondary-lg {
          padding: 13px 22px;
          border-radius: 100px;
          border: 1px solid var(--line);
          color: var(--ink);
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
        }

        .stage {
          position: relative;
          height: 260px;
          perspective: 1200px;
        }
        .stack {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateY(-12deg) rotateX(5deg);
        }
        .card {
          position: absolute;
          border-radius: 16px;
          box-shadow: 0 24px 48px -20px rgba(36, 28, 51, 0.35);
          opacity: 0;
          transform: translateY(20px) rotate(var(--r, 0deg));
          animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          animation-delay: var(--d, 0s);
        }
        @keyframes rise {
          to {
            opacity: 1;
            transform: translateY(0) translateZ(var(--z, 0px)) rotate(var(--r, 0deg));
          }
        }
        .c1 {
          width: 140px;
          height: 175px;
          left: 6px;
          top: 12px;
          --z: 8px;
          --r: -6deg;
          --d: 0.05s;
          background: linear-gradient(160deg, #e7d9c7, #d9bfa0);
        }
        .c2 {
          width: 100px;
          height: 100px;
          left: 140px;
          top: 0px;
          --z: 45px;
          --r: 4deg;
          --d: 0.18s;
          background: var(--plum);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .c2 span {
          font-family: "Fraunces", serif;
          font-style: italic;
          color: #f3e9d8;
          font-size: 11px;
          text-align: center;
          padding: 12px;
          line-height: 1.3;
        }
        .c3 {
          width: 120px;
          height: 85px;
          left: 148px;
          top: 112px;
          --z: 30px;
          --r: -3deg;
          --d: 0.3s;
          background: linear-gradient(160deg, #9fb08f, #71865f);
        }
        .c4 {
          width: 100px;
          height: 125px;
          left: 26px;
          top: 150px;
          --z: 60px;
          --r: 5deg;
          --d: 0.42s;
          background: linear-gradient(160deg, #c6714f, #a5543a);
        }
        .c5 {
          width: 88px;
          height: 72px;
          left: 40px;
          top: -22px;
          --z: 80px;
          --r: -8deg;
          --d: 0.55s;
          background: var(--gold);
          display: flex;
          align-items: flex-end;
          padding: 10px;
        }
        .c5 span {
          font-size: 10px;
          font-weight: 600;
          color: #4a3352;
        }

        .trust {
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 18px 0;
          font-size: 12.5px;
          color: var(--ink-soft);
          line-height: 1.5;
        }
        .trust b {
          color: var(--ink);
          font-weight: 600;
        }

        .features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1px;
          background: var(--line);
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
          margin: 40px 0;
        }
        .feature {
          background: var(--panel);
          padding: 26px 22px;
        }
        .num {
          font-family: "Fraunces", serif;
          font-style: italic;
          font-size: 13px;
          color: var(--plum);
          margin-bottom: 12px;
          display: block;
        }
        .feature h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .feature p {
          font-size: 13.5px;
          color: var(--ink-soft);
          line-height: 1.55;
        }

        .cta-band {
          background: var(--plum);
          color: #f3e9d8;
          border-radius: 24px;
          padding: 44px 28px;
          text-align: center;
          margin-bottom: 56px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .cta-band h2 {
          font-family: "Fraunces", serif;
          font-weight: 500;
          font-size: 22px;
          color: #f3e9d8;
          max-width: 18ch;
        }
        .cta-band p {
          color: rgba(243, 233, 216, 0.75);
          margin-top: 10px;
          font-size: 13.5px;
        }
        .cta-band :global(.btn-primary-lg) {
          background: var(--gold);
          color: #3a2c1e;
        }

        footer {
          border-top: 1px solid var(--line);
          padding: 24px 0 40px;
          font-size: 12.5px;
          color: var(--ink-soft);
        }

        @media (min-width: 760px) {
          .hero {
            grid-template-columns: 1.05fr 0.95fr;
            align-items: center;
            padding: 48px 0 72px;
          }
          .hero-ctas {
            flex-direction: row;
            align-items: center;
          }
          .stage {
            height: 340px;
          }
          .features {
            grid-template-columns: repeat(3, 1fr);
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
