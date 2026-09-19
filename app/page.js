"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="landing">
      <div className="wrap">
        <nav>
          <div className="brand">Selaras</div>
          <div className="nav-links">
            <a href="#fitur">Fitur</a>
            <a href="#contoh">Contoh</a>
            <a href="#harga">Harga</a>
          </div>
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
              <a href="#contoh" className="btn-secondary-lg">
                Lihat contoh board
              </a>
            </div>
            <div className="hero-note">Gratis untuk board pertama. Tanpa kartu kredit.</div>
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
          <div>Lebih dari 12.000 board dibuat bulan ini</div>
        </div>

        <section className="section" id="fitur">
          <div className="section-head">
            <div className="eyebrow-plain">Cara kerjanya</div>
            <h2>Tiga langkah dari ide kosong ke board yang jadi</h2>
            <p>Nggak perlu mulai dari kanvas kosong. Selaras bantu kamu dari memilih arah sampai menyimpan hasil akhirnya.</p>
          </div>
          <div className="feature-grid">
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
          </div>
        </section>

        <section className="section" id="contoh">
          <div className="showcase">
            <div className="showcase-copy">
              <div className="eyebrow-plain">Contoh hasil</div>
              <h2>Board yang terasa milikmu sendiri, bukan template kosong</h2>
              <p>Setiap board bisa dibangun dari nol atau dimulai dari salah satu tema yang sudah kami siapkan, lalu disesuaikan sampai terasa pas.</p>
              <div className="theme-pills">
                <div className="pill">Karir dan pekerjaan</div>
                <div className="pill">Pernikahan</div>
                <div className="pill">Kesehatan</div>
                <div className="pill">Rumah dan tempat tinggal</div>
              </div>
            </div>
            <div className="board-mock">
              <div className="board-mock-grid">
                <div className="bm bm1" />
                <div className="bm bm2">
                  <span>satu langkah setiap hari</span>
                </div>
                <div className="bm bm3" />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="harga">
          <div className="section-head">
            <div className="eyebrow-plain">Harga</div>
            <h2>Mulai gratis, upgrade kalau sudah terasa perlu</h2>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-name">Gratis</div>
              <div className="price-amt">Rp0</div>
              <div className="price-list">
                <div>Board tanpa batas</div>
                <div>Semua fitur editor</div>
                <div>Unduhan dengan tanda air</div>
              </div>
              <Link href="/signup" className="price-btn">
                Mulai dari sini
              </Link>
            </div>
            <div className="price-card featured">
              <div className="badge">Paling dipilih</div>
              <div className="price-name">Premium</div>
              <div className="price-amt">
                Rp29rb<span>/sekali</span>
              </div>
              <div className="price-list">
                <div>Semua fitur Gratis</div>
                <div>Unduhan resolusi tinggi</div>
                <div>Tanpa tanda air</div>
              </div>
              <Link href="/signup" className="price-btn">
                Coba sekarang
              </Link>
            </div>
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
        .nav-links {
          display: none;
        }
        :global(.nav-cta) {
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
        h1 :global(em) {
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
        .hero-note {
          margin-top: 18px;
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        :global(.btn-primary-lg) {
          padding: 13px 22px;
          border-radius: 100px;
          background: var(--plum);
          color: #fff;
          font-size: 14.5px;
          font-weight: 500;
          text-decoration: none;
          text-align: center;
        }
        :global(.btn-secondary-lg) {
          font-size: 14.5px;
          color: var(--ink);
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid var(--line);
          padding-bottom: 3px;
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
          line-height: 1.7;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .trust :global(b) {
          color: var(--ink);
          font-weight: 600;
        }

        .section {
          padding: 56px 0;
        }
        .section-head {
          max-width: 52ch;
          margin-bottom: 36px;
        }
        .eyebrow-plain {
          font-size: 13px;
          color: var(--plum);
          font-weight: 500;
          margin-bottom: 12px;
        }
        h2 {
          font-size: clamp(24px, 4.4vw, 30px);
          line-height: 1.2;
        }
        .section-head p {
          margin-top: 14px;
          color: var(--ink-soft);
          font-size: 14.5px;
          line-height: 1.6;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1px;
          background: var(--line);
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
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

        .showcase {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .showcase-copy p {
          color: var(--ink-soft);
          font-size: 14.5px;
          line-height: 1.65;
          margin-top: 14px;
        }
        .theme-pills {
          display: flex;
          gap: 8px;
          margin-top: 22px;
          flex-wrap: wrap;
        }
        .pill {
          font-size: 12.5px;
          padding: 8px 14px;
          border-radius: 100px;
          border: 1px solid var(--line);
          color: var(--ink-soft);
        }
        .board-mock {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 30px 60px -35px rgba(36, 28, 51, 0.25);
        }
        .board-mock-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          grid-template-rows: 90px 90px;
          gap: 8px;
        }
        .bm {
          border-radius: 12px;
        }
        .bm1 {
          grid-row: span 2;
          background: linear-gradient(160deg, #d9bfa0, #c6714f);
        }
        .bm2 {
          background: var(--plum);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }
        .bm2 span {
          font-family: "Fraunces", serif;
          font-style: italic;
          color: #f3e9d8;
          font-size: 12px;
          text-align: center;
        }
        .bm3 {
          background: linear-gradient(160deg, #9fb08f, #71865f);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .price-card {
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 28px 24px;
          background: var(--panel);
          position: relative;
        }
        .price-card.featured {
          border-color: var(--plum);
          border-width: 2px;
        }
        .badge {
          position: absolute;
          top: -12px;
          left: 24px;
          background: var(--plum);
          color: #fff;
          font-size: 11.5px;
          padding: 4px 12px;
          border-radius: 100px;
          font-weight: 500;
        }
        .price-name {
          font-size: 14px;
          color: var(--ink-soft);
          margin-bottom: 6px;
        }
        .price-amt {
          font-family: "Fraunces", serif;
          font-size: 32px;
          font-weight: 500;
          letter-spacing: -0.02em;
        }
        .price-amt :global(span) {
          font-family: "Inter", sans-serif;
          font-size: 13px;
          color: var(--ink-soft);
          font-weight: 400;
        }
        .price-list {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .price-list div {
          font-size: 13.5px;
          color: var(--ink-soft);
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
        .price-list div::before {
          content: "—";
          color: var(--plum);
          flex-shrink: 0;
        }
        :global(.price-btn) {
          display: block;
          text-align: center;
          margin-top: 22px;
          padding: 12px;
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid var(--line);
          color: var(--ink);
        }
        .price-card.featured :global(.price-btn) {
          background: var(--plum);
          color: #fff;
          border: none;
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
          .nav-links {
            display: flex;
            align-items: center;
            gap: 28px;
            font-size: 14px;
            color: var(--ink-soft);
          }
          .nav-links a {
            text-decoration: none;
          }
          .nav-links a:hover {
            color: var(--ink);
          }
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
          .feature-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .showcase {
            grid-template-columns: 0.9fr 1.1fr;
            align-items: center;
          }
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr);
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
