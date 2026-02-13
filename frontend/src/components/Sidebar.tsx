"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

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
    <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-50 transition-colors duration-500 ${pathname !== "/" ? "bg-slate-50 dark:bg-slate-950" : "bg-white dark:bg-slate-900"
      }`}>
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
          <img className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZvWIi5H1URqvvJ0EtQumvwtWsZUx2zIujOw7MAlFCzTBoSGj802fx0gDKBzWLV5jZjswJGBADbLxSlt2NGTxUwA9GtmlQVX0XPoSIdi8VqmmQ6Ua3kFMjldbDQKP8a-5lnFDSs6oZoTEC7NmBrWnTcV6eshzXV1NlvC3NxI1dJTzbK0IK5zhXnIiJQQ7gq7tfSfan9jhz058QMbpN970zjIi1ruppF9NAlGQO4PzMuTmlP-MlAplLNdkYG-atSHy6mYmPxlovfJkw" alt="Perfil" />
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black truncate">Dr. Ricardo Silva</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">Administrador</p>
          </div>
          <button className="text-slate-400 hover:text-danger transition-colors">
            <span className="material-icons-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
