"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface Company {
    id: string;
    name: string;
    sector?: string;
}

interface CompanyAccess {
    id: string;
    companyId: string;
    canSurvey: boolean;
    canViewReports: boolean;
    canRunQueries: boolean;
    company?: Company;
}

interface CompanyPermission {
    companyId: string;
    companyName: string;
    selected: boolean;
    canSurvey: boolean;
    canViewReports: boolean;
    canRunQueries: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function UsersPageContent() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state for creating user
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });

    // Edit user state
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        role: 'STUDENT'
    });
    const [companyPermissions, setCompanyPermissions] = useState<CompanyPermission[]>([]);

    // Password change state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchCompanies();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Error al cargar usuarios');
            }

            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Error al cargar usuarios');
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/organizations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Error al cargar empresas');
            }

            const data = await res.json();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al crear usuario');
            }

            await fetchUsers();
            setIsModalOpen(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'STUDENT'
            });
        } catch (error: any) {
            console.error('Error creating user:', error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = async (user: User) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            role: user.role
        });

        // Fetch user's current company access
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/users/${user.id}/companies`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const accessList: CompanyAccess[] = await res.json();

                // Build permissions map
                const permissions: CompanyPermission[] = companies.map(company => {
                    const access = accessList.find(a => a.companyId === company.id);
                    return {
                        companyId: company.id,
                        companyName: company.name,
                        selected: !!access,
                        canSurvey: access?.canSurvey ?? true,
                        canViewReports: access?.canViewReports ?? true,
                        canRunQueries: access?.canRunQueries ?? false
                    };
                });

                setCompanyPermissions(permissions);
            }
        } catch (error) {
            console.error('Error fetching user companies:', error);
        }

        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');

            // Update basic user info
            const updateRes = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json();
                throw new Error(errorData.error || 'Error al actualizar usuario');
            }

            // Update company permissions using batch endpoint
            const selectedCompanies = companyPermissions
                .filter(p => p.selected)
                .map(p => ({
                    companyId: p.companyId,
                    canSurvey: p.canSurvey,
                    canViewReports: p.canViewReports,
                    canRunQueries: p.canRunQueries
                }));

            const permRes = await fetch(`${API_URL}/api/users/${selectedUser.id}/companies/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ companies: selectedCompanies })
            });

            if (!permRes.ok) {
                const errorData = await permRes.json();
                throw new Error(errorData.error || 'Error al actualizar permisos');
            }

            await fetchUsers();
            setIsEditModalOpen(false);
            setSelectedUser(null);
        } catch (error: any) {
            console.error('Error updating user:', error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCompany = (companyId: string) => {
        setCompanyPermissions(prev =>
            prev.map(p =>
                p.companyId === companyId
                    ? { ...p, selected: !p.selected }
                    : p
            )
        );
    };

    const togglePermission = (companyId: string, permission: 'canSurvey' | 'canViewReports' | 'canRunQueries') => {
        setCompanyPermissions(prev =>
            prev.map(p =>
                p.companyId === companyId
                    ? { ...p, [permission]: !p[permission] }
                    : p
            )
        );
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/api/users/${selectedUserId}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordFormData.currentPassword,
                    newPassword: passwordFormData.newPassword
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al cambiar contraseña');
            }

            setIsPasswordModalOpen(false);
            setPasswordFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setSelectedUserId('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            setError(error.message);
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
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 hover:bg-blue-500/10 text-blue-600 rounded-lg transition-colors"
                                                title="Editar usuario"
                                            >
                                                <span className="material-icons-outlined text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setIsPasswordModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                title="Cambiar contraseña"
                                            >
                                                <span className="material-icons-outlined text-lg">lock_reset</span>
                                            </button>
                                        </div>
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
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña</label>
                                    <input
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        type="password"
                                        placeholder="Contraseña segura"
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

            {/* Edit Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-[110] overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="p-10">
                            <header className="mb-8">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Editar Usuario</h3>
                                <p className="text-slate-500 text-sm mt-1">Modifique los datos y permisos del usuario {selectedUser.name}</p>
                            </header>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                                    <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Información Básica</h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                                        <input
                                            required
                                            value={editFormData.name}
                                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                                        <input
                                            required
                                            value={editFormData.email}
                                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            type="email"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rol</label>
                                        <select
                                            value={editFormData.role}
                                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                        >
                                            <option value="STUDENT">Estudiante</option>
                                            <option value="PROFESSOR">Profesor</option>
                                            <option value="SUPERADMIN">Super Administrador</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Company Permissions */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="material-icons text-lg">business</span>
                                        Empresas Autorizadas
                                    </h4>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 max-h-64 overflow-y-auto">
                                        {companyPermissions.length === 0 ? (
                                            <p className="text-slate-400 text-sm text-center py-4">No hay empresas disponibles</p>
                                        ) : (
                                            companyPermissions.map((perm) => (
                                                <div key={perm.companyId} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={perm.selected}
                                                            onChange={() => toggleCompany(perm.companyId)}
                                                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{perm.companyName}</span>
                                                    </label>

                                                    {perm.selected && (
                                                        <div className="ml-8 space-y-2">
                                                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={perm.canSurvey}
                                                                    onChange={() => togglePermission(perm.companyId, 'canSurvey')}
                                                                    className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                                                />
                                                                <span className="text-slate-600 dark:text-slate-300">Encuestar</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={perm.canViewReports}
                                                                    onChange={() => togglePermission(perm.companyId, 'canViewReports')}
                                                                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                                                                />
                                                                <span className="text-slate-600 dark:text-slate-300">Ver reportes</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={perm.canRunQueries}
                                                                    onChange={() => togglePermission(perm.companyId, 'canRunQueries')}
                                                                    className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
                                                                />
                                                                <span className="text-slate-600 dark:text-slate-300">Ejecutar consultas SQL</span>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-xl">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            <span className="material-icons text-xs align-middle mr-1">info</span>
                                            Los estudiantes solo podrán acceder a las empresas seleccionadas según los permisos otorgados.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            setSelectedUser(null);
                                            setError('');
                                        }}
                                        className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Change Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-[110] overflow-hidden animate-in zoom-in-95">
                        <div className="p-10">
                            <header className="mb-8">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">Cambiar Contraseña</h3>
                                <p className="text-slate-500 text-sm mt-1">Actualice la contraseña del usuario seleccionado.</p>
                            </header>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                                    <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contraseña Actual</label>
                                    <input
                                        required
                                        value={passwordFormData.currentPassword}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                                        type="password"
                                        placeholder="Contraseña actual"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nueva Contraseña</label>
                                    <input
                                        required
                                        value={passwordFormData.newPassword}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                                        type="password"
                                        placeholder="Nueva contraseña"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmar Nueva Contraseña</label>
                                    <input
                                        required
                                        value={passwordFormData.confirmPassword}
                                        onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                                        type="password"
                                        placeholder="Confirme la nueva contraseña"
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPasswordModalOpen(false);
                                            setPasswordFormData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                            setError('');
                                        }}
                                        className="flex-1 px-8 py-4 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-100 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary/90 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
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

export default function UsersPage() {
    return (
        <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
            <UsersPageContent />
        </ProtectedRoute>
    );
}
