import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#4338ca", // El color índigo de tu gradiente
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "HuronCast - ¿Qué me pongo hoy?",
  description: "Tu outfit perfecto decidido por el clima real y la sabiduría de un hurón. Tecnología de precisión para autónomos y gente con estilo.",
  keywords: ["clima", "outfit", "moda", "tiempo", "hurón", "HuronCast", "Crys Carmona"],
  authors: [{ name: "Crys C4rmon4" }],
  openGraph: {
    title: "HuronCast - ¿Qué me pongo hoy?",
    description: "Deja que el hurón analice el clima y elija tu ropa por ti. Rápido, preciso y con estilo.",
    url: "https://huroncast.app", // Cámbialo por tu URL real de Vercel cuando la tengas
    siteName: "HuronCast",
    images: [
      {
        url: "/huron/home-hero.png", // Asegúrate de que esta ruta sea pública
        width: 1200,
        height: 630,
        alt: "HuronCast - Tu guía de estilo climática",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HuronCast",
    description: "La app que traduce el clima en decisiones de ropa.",
    images: ["/huron/home-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}