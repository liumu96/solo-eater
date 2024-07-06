"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { DataProvider } from "@/context/DataContext";
import { VideoProvider } from "@/context/VideoContext";

import CameraPermission from "@/components/CameraPermission";
import { GA_TRACKING_ID, pageview } from "../utils/gtag";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

import { metadata } from "./metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      window.GA_INITIALIZED = true;
    }
    pageview(pathname);
  }, [pathname]);
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="ga-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <DataProvider>
          <PreferencesProvider>
            <VideoProvider>
              {children}
              <CameraPermission />
            </VideoProvider>
          </PreferencesProvider>
        </DataProvider>
      </body>
    </html>
  );
}
