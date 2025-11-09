import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: 'swap'
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-poppins",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "GitResume - AI-Powered Developer Analysis",
  description: "Transform your GitHub profile into a professional resume with Tiger Cloud AI analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${poppins.variable}`}>
      <body className={`${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
