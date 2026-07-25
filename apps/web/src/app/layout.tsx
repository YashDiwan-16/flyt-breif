import type { Metadata } from "next";

import { Toaster } from "@flyt-breif/ui/components/sonner";

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
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
