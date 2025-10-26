import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import WeatherAnimation from "@/components/WeatherAnimation";

// Police gothique élégante pour les titres
const cinzel = Cinzel({
  subsets: ["latin", "latin-ext"],
  variable: "--font-cinzel",
  display: "swap",
});

// Police serif élégante pour le contenu
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});

// Police sans-serif moderne pour les UI elements
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bookie - Your Personal Library Companion",
  description: "Manage your reading journey, discover new books, track your progress, and connect with fellow book lovers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${cinzel.variable} ${playfair.variable} ${inter.variable} font-serif antialiased bg-library-pattern`}>
        <WeatherAnimation />
        <div className="flex flex-col min-h-screen relative z-10">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
