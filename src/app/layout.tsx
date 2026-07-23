import type { Metadata, Viewport } from "next";
import { Outfit, Syne, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Narenj Uploader — Free Image Upload",
    template: "%s | Narenj Uploader",
  },
  description:
    "Free, fast image uploader. Drop an image and get a shareable CDN link in seconds.",
  keywords: [
    "image uploader",
    "free image upload",
    "CDN image hosting",
    "Narenj Uploader",
    "share images",
  ],
  authors: [{ name: "Narenj" }],
  creator: "Narenj",
  publisher: "Narenj Uploader",
  metadataBase: new URL("https://picser.pages.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Narenj Uploader",
    title: "Narenj Uploader — Free Image Upload",
    description:
      "Free, fast image uploader. Drop an image and get a shareable CDN link in seconds.",
    images: [
      {
        url: "/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "Narenj Uploader",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Narenj Uploader — Free Image Upload",
    description:
      "Free, fast image uploader. Drop an image and get a shareable CDN link in seconds.",
    images: ["/og/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  category: "utilities",
};

export const viewport: Viewport = {
  themeColor: "#e85d04",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Narenj Uploader",
    description:
      "Free, fast image uploader. Drop an image and get a shareable CDN link in seconds.",
    applicationCategory: "Utility",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Narenj" />
        <meta name="application-name" content="Narenj Uploader" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${syne.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
