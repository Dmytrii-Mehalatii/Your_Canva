import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your canva",
  description: "Basic canva website where you can place your thoughts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
