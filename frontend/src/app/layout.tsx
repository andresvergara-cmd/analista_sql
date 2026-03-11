'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isPublicSurvey = pathname?.startsWith('/survey');
  const isPublicPage = isLoginPage || isPublicSurvey;

  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round|Material+Icons+Sharp|Material+Icons+Two+Tone" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} antialiased ${isPublicPage ? '' : 'flex'} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen`}>
        <AuthProvider>
          {!isPublicPage && <Sidebar />}
          <main className={isPublicPage ? '' : 'flex-1 ml-64 p-8 transition-all duration-300'}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
