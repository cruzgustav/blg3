import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { WebSiteJsonLd, OrganizationJsonLd } from "@/components/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Vortek Blog - Tecnologia e Design Editorial",
    template: "%s | Vortek Blog",
  },
  description: "Blog de tecnologia e design editorial da Vortek. Artigos sobre engenharia de software, design e inovação.",
  keywords: ["Vortek", "Tecnologia", "Design", "Engenharia de Software", "Blog", "Inovação", "Marketing", "Dados"],
  authors: [{ name: "Vortek Team" }],
  creator: "Vortek",
  publisher: "Vortek",
  metadataBase: new URL("https://vortek.blog"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Vortek Blog",
    description: "Marketing, Dados e Tecnologia para escalar seu negócio com inteligência.",
    siteName: "Vortek",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vortek Blog",
    description: "Marketing, Dados e Tecnologia para escalar seu negócio com inteligência.",
    creator: "@vortek",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerRegister />
          <WebSiteJsonLd />
          <OrganizationJsonLd />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
