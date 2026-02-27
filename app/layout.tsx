import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const jamiiFont = localFont({
  src: [
    {
      path: "../fonts/AkzidenzGroteskFull/fonts/fonnts.com-Akzidenz_Grotesk_Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/AkzidenzGroteskFull/fonts/fonnts.com-Akzidenz_Grotesk_Light_Italic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/AkzidenzGroteskFull/fonts/fonnts.com-Akzidenz_Grotesk_Roman.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/AkzidenzGroteskFull/fonts/fonnts.com-Akzidenz_Grotesk_Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/AkzidenzGroteskFull/fonts/fonnts.com-Akzidenz_Grotesk_Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-jamii",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jamii Aide - In-Home Healthcare for Your Loved Ones",
  description: "Professional in-home healthcare services connecting families with qualified nurses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body 
        className={`${jamiiFont.variable} font-sans antialiased`}
        suppressHydrationWarning // Local storage is being accessed
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}