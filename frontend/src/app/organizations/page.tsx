"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Organization {
    id: string;
    name: string;
    legalId: string;
    sector: string;
    size: string;
    contactEmail: string;
    status: string;
    createdAt: string;
    answers?: any[];
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        legalId: '',
        sector: 'Manufactura',
        size: 'Pyme (11-50)',
        contactEmail: ''
    });

    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [profileOrg, setProfileOrg] = useState<Organization | null>(null);

    useEffect(() => {
        setHasMounted(true);
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const res = await fetch(`${API_URL}/api/organizations`);
            const data = await res.json();
            setOrganizations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            setOrganizations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = editingOrg
                ? `${API_URL}/api/organizations/${editingOrg.id}`
                : `${API_URL}/api/organizations`;

            const method = editingOrg ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchOrganizations();
                setIsModalOpen(false);
                setEditingOrg(null);
                setFormData({
                    name: '',
                    legalId: '',
                    sector: 'Manufactura',
                    size: 'Pyme (11-50)',
                    contactEmail: ''
                });
            }
        } catch (error) {
            console.error('Error saving organization:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (org: Organization) => {
        setEditingOrg(org);
        setFormData({
            name: org.name,
            legalId: org.legalId,
            sector: org.sector,
            size: org.size,
            contactEmail: org.contactEmail
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de que desea eliminar esta organización?')) return;
        try {
            const res = await fetch(`${API_URL}/api/organizations/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                await fetchOrganizations();
            }
        } catch (error) {
            console.error('Error deleting organization:', error);
        }
    };

    if (!hasMounted) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Gestión de Organizaciones</h2>
                    <p className="text-slate-500 text-sm mt-1">Administre las empresas y unidades vinculadas al ecosistema de madurez.</p>
                </div>
                <button
                    suppressHydrationWarning
                    onClick={() => {
                        setEditingOrg(null);
                        setFormData({
                            name: '',
                            legalId: '',
                            sector: 'Manufactura',
                            size: 'Pyme (11-50)',
                            contactEmail: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
                >
                    <span className="material-icons text-xl group-hover:rotate-90 transition-transform">add</span>
                    Nueva Organización
                </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Organizaciones', val: organizations.length, icon: 'business', color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Sectores Activos', val: new Set(organizations.map(o => o.sector)).size, icon: 'category', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Nuevas este mes', val: organizations.filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth()).length, icon: 'new_releases', color: 'text-emerald-500', bg: 'bg-emerald-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} dark:bg-slate-800 flex items-center justify-center ${stat.color}`}>
                            <span className="material-icons-outlined">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">list_alt</span>
                        Listado de Empresas
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-slate-400 text-sm">search</span>
                            <input
                                suppressHydrationWarning
                                type="text"
                                placeholder="Buscar Nit o Nombre..."
                                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-[0.1em]">
                                <th className="px-8 py-4">Organización</th>
                                <th className="px-8 py-4">NIT / Identificación</th>
                                <th className="px-8 py-4">Sector</th>
                                <th className="px-8 py-4">Instrumento</th>
                                <th className="px-8 py-4">Estado</th>
                                <th className="px-8 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/20 dark:bg-slate-800/10"></td>
                                    </tr>
                                ))
                            ) : organizations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-medium">
                                        No hay organizaciones registradas. Comience creando una.
                                    </td>
                                </tr>
                            ) : organizations.map((org) => (
                                <tr key={org.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm uppercase">
                                                {org.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{org.name}</p>
                                                <p className="text-[10px] text-slate-400">{org.size}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs font-mono text-slate-500 font-bold">{org.legalId}</td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                            {org.sector}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {org.answers && org.answers.length > 0 ? (
                                            <span className="flex items-center gap-1.5 text-blue-500 text-[10px] font-black uppercase">
                                                <span className="material-icons text-sm">check_circle</span>
                                                Aplicado
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase">
                                                <span className="material-icons text-sm">pending</span>
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(org)}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                            >
                                                <span className="material-icons-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => setProfileOrg(org)}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                            >
                                                <span className="material-icons-outlined text-lg">fact_check</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(org.id)}
                                                className="p-2 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors"
                                            >
                                                <span className="material-icons-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-[110] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        <div className="p-10">
                            <header className="mb-8">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                                    <span className="material-icons text-3xl">{editingOrg ? 'edit_note' : 'add_business'}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                                    {editingOrg ? 'Editar Organización' : 'Registrar Organización'}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    {editingOrg ? `Modificando datos de ${editingOrg.name}` : 'Complete los datos básicos para iniciar diagnósticos.'}
                                </p>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Comercial</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            type="text"
                                            placeholder="Ej: Agroindustrias Pacifico"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NIT / ID Legal</label>
                                        <input
                                            required
                                            value={formData.legalId}
                                            onChange={(e) => setFormData({ ...formData, legalId: e.target.value })}
                                            type="text"
                                            placeholder="900.000.000-1"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sector Industrial</label>
                                        <select
                                            value={formData.sector}
                                            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold appearance-none"
                                        >
                                            <option>Manufactura</option>
                                            <option>Servicios</option>
                                            <option>Comercio</option>
                                            <option>Tecnología</option>
                                            <option>Agroindustria</option>
                                            <option>Transporte</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tamaño de Empresa</label>
                                        <select
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold appearance-none"
                                        >
                                            <option>Micro (1-10 emp)</option>
                                            <option>Pyme (11-50 emp)</option>
                                            <option>Mediana (51-200 emp)</option>
                                            <option>Grande (+200 emp)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo de Contacto</label>
                                        <input
                                            required
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                            type="email"
                                            placeholder="contacto@organizacion.co"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                {editingOrg ? 'Guardar Cambios' : 'Registrar Organización'}
                                                <span className="material-icons text-sm">{editingOrg ? 'save' : 'rocket_launch'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile View Modal */}
            {profileOrg && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setProfileOrg(null)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-[110] overflow-hidden animate-in slide-in-from-right-10 duration-500">
                        <div className="p-0 flex flex-col h-[80vh] max-h-[800px]">
                            <header className="bg-primary p-10 text-white relative">
                                <button onClick={() => setProfileOrg(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                                    <span className="material-icons">close</span>
                                </button>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary font-black text-3xl shadow-2xl">
                                        {profileOrg.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter">{profileOrg.name}</h3>
                                        <div className="flex items-center gap-3 mt-1 opacity-80 font-bold text-sm">
                                            <span>NIT: {profileOrg.legalId}</span>
                                            <span className="w-1 h-1 bg-white rounded-full"></span>
                                            <span>{profileOrg.sector}</span>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                <section>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Información de Contacto</h4>
                                    <div className="grid grid-cols-2 gap-6 font-bold text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                            <span className="material-icons text-primary/60">email</span>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Email Principal</p>
                                                <p className="text-sm truncate">{profileOrg.contactEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                            <span className="material-icons text-primary/60">domain</span>
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Tamaño</p>
                                                <p className="text-sm">{profileOrg.size}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Estado de Diagnóstico</h4>
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <span className="material-icons">verified</span>
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-emerald-800 dark:text-emerald-400 leading-none">Perfil Activo</p>
                                                <p className="text-sm text-emerald-600 dark:text-emerald-500/70 mt-1 font-bold">Vínculo verificado con el ecosistema Icesi.</p>
                                            </div>
                                        </div>
                                        <button className="bg-white dark:bg-slate-800 px-6 py-3 rounded-xl font-black text-sm text-emerald-600 shadow-sm hover:shadow-md transition-all">Ver Historial</button>
                                    </div>
                                </section>

                                <section className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <p className="text-xs text-slate-400 font-bold">Registrada el {new Date(profileOrg.createdAt).toLocaleDateString()}</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => { handleEdit(profileOrg); setProfileOrg(null); }} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-200 transition-all">Editar Información</button>
                                        <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-200 transition-all">Generar Reporte PDF</button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
