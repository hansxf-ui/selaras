import "./globals.css";

export const metadata = {
  title: "Selaras — susun visimu",
  description: "Buat vision board digital dalam hitungan menit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
