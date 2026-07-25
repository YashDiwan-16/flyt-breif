import type { Metadata } from "next";

import { Toaster } from "@flyt-breif/ui/components/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "FlytBDR Copilot",
  description: "FlytBase inbound contact intake and admin sales intelligence cockpit.",
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
