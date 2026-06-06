import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neural City | State of Indian Streets 2026",
  description:
    "Outcome based automated street assessment. Compare Indian cities on cleanliness, walkability, road quality, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var m=t||(d?'dark':'light');document.documentElement.classList.toggle('dark',m==='dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-[13px] leading-normal text-foreground md:text-sm">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
