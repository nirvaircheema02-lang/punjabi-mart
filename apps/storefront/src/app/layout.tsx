import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ds/Header";
import { AnnouncementBar } from "@/components/ds/Banner";
import { Footer } from "@/components/ds/Footer";
import { WhatsAppFab } from "@/components/ds/WhatsAppFab";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  // Without this, Next cannot resolve relative OG/Twitter image URLs and warns
  // at build time; set NEXT_PUBLIC_SITE_URL to the real domain once deployed.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://punjabimarts.example"),
  title: "PunjabiMarts — Everything Punjabi, one marketplace",
  description:
    "Turbans, phulkari, juttis, kurta pajama, wedding and ceremony essentials, jewellery and gifting — sourced from trusted shops across Punjab and shipped India-wide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <a className="pm-skip-link" href="#main-content">
            Skip to content
          </a>
          <AnnouncementBar message="Free delivery on orders over ₹999 · Dispatched from Punjab" />
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <WhatsAppFab />
        </StoreProvider>
      </body>
    </html>
  );
}
