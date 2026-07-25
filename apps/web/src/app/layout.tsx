import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FlytBDR Copilot",
  description: "Internal sales intelligence dashboard for inbound BDR workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
