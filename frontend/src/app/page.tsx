"use client";

import Link from 'next/link';

export default function Home() {
  const modules = [
    {
      title: "Gestión de Organizaciones",
      desc: "Administre las empresas, sedes y unidades del ecosistema.",
      icon: "business",
      link: "/organizations",
      color: "bg-slate-700",
      active: true
    },
    {
      title: "Instrumento de medición",
      desc: "Aplique tests de madurez digital basados en marcos científicos (Kroh et al. 2020).",
      icon: "fact_check",
      link: "/measurement-instrument",
      color: "bg-primary",
      active: true
    },
    {
      title: "Consultas SQL (IA)",
      desc: "Analice datos en lenguaje natural para generar reportes SQL automáticos.",
      icon: "table_view",
      link: "/query",
      color: "bg-indigo-600",
      active: true
    },
    {
      title: "Modelos de IA",
      desc: "Configure los parámetros del asistente RAG y modelos de lenguaje.",
      icon: "psychology",
      link: "/models",
      color: "bg-violet-600",
      active: false
    },
    {
      title: "Gestión de Usuarios",
      desc: "Administre el acceso por roles para SuperAdmin, Profesores y Estudiantes.",
      icon: "groups",
      link: "/users",
      color: "bg-rose-600",
      active: true
    }
  ];

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center flex-shrink-0">
            <img src="/assets/logo.png" alt="Icesi" className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <nav className="flex text-[10px] text-slate-500 mb-2 gap-2 font-bold uppercase tracking-widest">
              <span>Admin</span>
              <span className="text-slate-300">/</span>
              <span className="text-primary font-black">Centro de Mando</span>
            </nav>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Panel de Administración Unificado</h2>
            <p className="text-slate-500 text-sm mt-1">Gestione el ecosistema de madurez digital e inteligencia de datos desde un solo lugar.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-sm shadow-sm">
            <span className="material-icons-outlined text-primary text-lg">sync</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">Sincronización Activa</span>
          </div>
        </div>
      </header>

      {/* Main Module Launchpad */}
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Módulos del Proyecto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {modules.map((m) => (
          <Link
            key={m.title}
            href={m.link}
            className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${m.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-bl-full transition-opacity`}></div>
            <div className={`w-12 h-12 rounded-2xl ${m.color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 mb-6`}>
              <span className="material-icons-outlined text-2xl">{m.icon}</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{m.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">{m.desc}</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Acceder ahora
              <span className="material-icons text-sm">arrow_forward</span>
            </div>
            {!m.active && (
              <span className="absolute top-4 right-4 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Próximamente</span>
            )}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Statistics & Activity */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-icons-outlined text-primary">history</span>
                Actividad Reciente
              </h3>
              <Link href="/measurement-instrument" className="text-xs text-primary font-black hover:underline uppercase tracking-wider">Ver todos</Link>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-[0.1em]">
                    <th className="px-8 py-4">Empresa</th>
                    <th className="px-8 py-4">Modelo</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Resultados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">AL</div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">Alpha Logistics</p>
                          <p className="text-[10px] text-slate-400">Pyme Industrial</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-semibold text-slate-500">Kroh et al. 2020</td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Completado
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link href="/diagnosis/kroh-result-123" className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                        <span className="material-icons text-xl">visibility</span>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System & IA Insights */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 rounded-3xl shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-white/5 opacity-20 group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined text-[180px]">auto_fix_high</span>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                <span className="material-icons-outlined">psychology</span>
              </div>
              <h4 className="text-xl font-black mb-2 tracking-tight">Análisis de IA Activo</h4>
              <p className="text-indigo-100/80 text-xs leading-relaxed mb-8 font-medium">
                El motor Llama-3 está procesando las últimas tendencias de madurez digital.
              </p>
              <Link href="/query" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-50 transition-colors shadow-lg shadow-black/10">
                Lanzar Asistente SQL
                <span className="material-icons text-sm">bolt</span>
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-icons-outlined text-sm">settings_input_component</span>
              Estado Ecosistema
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Servidor API</span>
                <span className="text-[10px] font-black text-emerald-500">OPERATIVO</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Base de Datos</span>
                <span className="text-[10px] font-black text-emerald-500">CONECTADO</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[100%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
