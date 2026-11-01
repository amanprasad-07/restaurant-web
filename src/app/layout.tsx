import type { Metadata, Viewport } from "next";

import { Providers } from "@/providers/Providers";
import "./globals.css";

const inter = { variable: "" };

export const metadata: Metadata = {
  title: "Demo Bistro · Table ordering",
  description: "Scan, order and track your meal without leaving your seat.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c2410c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
