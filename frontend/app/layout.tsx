import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/hooks/useToast";

export const metadata: Metadata = {
  title: "TLG LINK • Short links. Smart analytics.",
  description:
    "Production-quality URL shortening platform with high-speed redirects, client-side QR codes, and real click analytics.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#080B12",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
