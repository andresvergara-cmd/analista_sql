"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  const menuItems = [
    { href: "/", label: "Panel Principal", icon: "dashboard" },
    { href: "/organizations", label: "Organizaciones", icon: "business" },
    { href: "/measurement-instrument", label: "Instrumento de Medición", icon: "fact_check" },
    { href: "/reports", label: "Reportes", icon: "description" },
    { href: "/analysis", label: "Análisis con IA", icon: "psychology" },
    { href: "/query", label: "Consultas SQL", icon: "table_view" },
    { href: "/config", label: "Configuración", icon: "settings" },
  ];

  // Determine if we are in a sub-module (like assessment or diagnosis)
  const isModuleActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar responsive */}
      <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-50 transition-all duration-300 ${pathname !== "/" ? "bg-slate-50 dark:bg-slate-950" : "bg-white dark:bg-slate-900"
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-6">
        <div className="flex flex-col gap-2">
          <img
            src="/assets/logo.png"
            alt="Icesi Logo"
            className="w-full h-auto object-contain"
          />
          <div className="mt-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Madurez Empresarial</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {menuItems.map((item) => {
          const active = isModuleActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 group ${active
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
            >
              <span className={`material-icons-outlined text-[20px] ${active ? "text-white" : "group-hover:text-primary"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full border-2 border-primary dark:border-primary bg-primary/10 flex items-center justify-center">
            <span className="material-icons-outlined text-primary text-[20px]">
              person
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black truncate">{user?.name || 'Usuario'}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">
              {user?.role === 'SUPERADMIN' ? 'Superadministrador' : user?.role === 'ADMIN' ? 'Administrador' : 'Estudiante'}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <span className="material-icons-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
