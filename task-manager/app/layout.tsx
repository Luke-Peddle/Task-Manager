import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { AppSidebar } from "@/components/AppSidebar";
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
        <Providers>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}