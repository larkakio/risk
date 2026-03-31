import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { Providers } from "@/components/providers";
import { wagmiConfig } from "@/lib/wagmi-config";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin", "latin-ext"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "";

export const metadata: Metadata = {
  title: "Neon Risk — Base",
  description: "Cyberpunk Risk-style strategy for mobile. Wallet + daily check-in on Base.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const cookie = h.get("cookie") ?? undefined;
  const initialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <html
      lang="en"
      className={`${space.variable} ${jetbrains.variable} h-full font-sans antialiased`}
    >
      <head>
        {baseAppId ? (
          <meta name="base:app_id" content={baseAppId} />
        ) : null}
      </head>
      <body className="min-h-full bg-[#06020e] font-sans text-zinc-100">
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
