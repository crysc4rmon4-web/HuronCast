import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "HuronCast",
  description: "What to wear today, guided by a dancing ferret and real weather data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}