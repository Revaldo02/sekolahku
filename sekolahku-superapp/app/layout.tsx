import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SekolahKu — Semua urusan sekolah, lebih mudah",
  description: "Dashboard layanan sekolah terpadu untuk siswa, guru, orang tua, dan pengelola sekolah.",
  applicationName: "SekolahKu",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "SekolahKu", statusBarStyle: "default" }
};

export const viewport: Viewport = {
  themeColor: "#f4f7fb",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
