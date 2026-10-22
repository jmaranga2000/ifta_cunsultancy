import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { PwaRegistration } from "@/components/pwa/pwa-registration";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "IFTA Consulting",
  title: {
    default: "IFTA Consulting Client Portal",
    template: "%s | IFTA Consulting",
  },
  description:
    "Secure consulting client portal and workflow management platform for IFTA Consulting (K) Ltd.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IFTA Consulting",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#123B6D" },
    { media: "(prefers-color-scheme: dark)", color: "#123B6D" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `var r=document.documentElement;try{var s=localStorage.getItem("ifta-theme");var t=(s==="light"||s==="dark")?s:((window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light");r.classList.remove("light","dark");r.classList.add(t);r.dataset.theme=t;r.style.colorScheme=t;var f=localStorage.getItem("ifta-font-size");if(f==="small"||f==="medium"||f==="large")r.dataset.fontSize=f;}catch(e){r.classList.add("light");r.dataset.theme="light";r.style.colorScheme="light";}`,
          }}
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
