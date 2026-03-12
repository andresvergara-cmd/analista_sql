'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isPublicSurvey = pathname?.startsWith('/survey');
  const isPublicPage = isLoginPage || isPublicSurvey;
  const { toggleSidebar } = useSidebar();

  return (
    <>
      {!isPublicPage && <Sidebar />}

      {/* Botón hamburguesa para móvil */}
      {!isPublicPage && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-30 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Abrir menú"
        >
          <span className="material-icons text-primary">menu</span>
        </button>
      )}

      <main className={isPublicPage ? '' : 'flex-1 lg:ml-64 p-8 pt-20 lg:pt-8 transition-all duration-300'}>
        {children}
      </main>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round|Material+Icons+Sharp|Material+Icons+Two+Tone" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} antialiased flex bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen`}>
        <AuthProvider>
          <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
