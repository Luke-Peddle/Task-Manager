import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Personal task manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hanken.className} min-h-screen bg-muted/40 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}