"use client";

import { useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'student_pass_123', // Default for now
        role: 'STUDENT'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:3001/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                await fetchUsers();
                setIsModalOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    password: 'student_pass_123',
                    role: 'STUDENT'
                });
            }
        } catch (error) {
            console.error('Error creating user:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'SUPERADMIN':
                return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black uppercase">Super Admin</span>;
            case 'PROFESSOR':
                return <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase">Profesor</span>;
            default:
                return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase">Estudiante</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Gestión de Usuarios</h2>
                    <p className="text-slate-500 text-sm mt-1">Controle el acceso y asigne roles a los integrantes del proyecto.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
                >
                    <span className="material-icons text-xl group-hover:rotate-180 transition-transform">person_add</span>
                    Nuevo Usuario
                </button>
            </header>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">groups</span>
                        Listado de Usuarios
                    </h3>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-slate-400 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-[0.1em]">
                                <th className="px-8 py-4">Usuario</th>
                                <th className="px-8 py-4">Email</th>
                                <th className="px-8 py-4">Rol</th>
                                <th className="px-8 py-4">F. Registro</th>
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
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                                <span className="material-icons">person</span>
                                            </div>
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-slate-500 font-medium">{user.email}</td>
                                    <td className="px-8 py-5">{getRoleBadge(user.role)}</td>
                                    <td className="px-8 py-5 text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                            <span className="material-icons-outlined text-lg">manage_accounts</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-[110] overflow-hidden animate-in zoom-in-95">
                        <div className="p-10">
                            <header className="mb-8">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Registrar Usuario</h3>
                                <p className="text-slate-500 text-sm mt-1">Defina el nivel de acceso del nuevo integrante.</p>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        type="text"
                                        placeholder="Ej: Andres Vergara"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Institucional</label>
                                    <input
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        type="email"
                                        placeholder="usuario@icesi.edu.co"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rol Asignado</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold appearance-none"
                                    >
                                        <option value="STUDENT">Estudiante</option>
                                        <option value="PROFESSOR">Profesor</option>
                                        <option value="SUPERADMIN">Super Administrador</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Crear Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
