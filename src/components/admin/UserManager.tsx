import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Wrench,
  Search,
  Edit,
  Trash2,
  Key,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  Lock,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, currentUser } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [targetUserForPassword, setTargetUserForPassword] = useState<User | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Password reset modal state
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Open Create Modal
  const openNewUserModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('technician');
    setPhone('');
    setPassword('123456');
    setActive(true);
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPhone(u.phone || '');
    setPassword(u.password || '');
    setActive(u.active !== false);
    setFormError('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Password Modal
  const openChangePasswordModal = (u: User) => {
    setTargetUserForPassword(u);
    setNewPassword('');
    setShowNewPassword(false);
    setPasswordSuccess(false);
    setIsPasswordModalOpen(true);
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setNewPassword(pass);
  };

  // Handle Form Submit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim()) {
      setFormError('El nombre y correo electrónico son obligatorios.');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: phone.trim(),
          password: password.trim() || editingUser.password,
          active,
          avatar: name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        });
      } else {
        await addUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          phone: phone.trim(),
          password: password.trim() || '123456',
          active,
          avatar: name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el usuario.');
    }
  };

  // Handle Password Update Submit
  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForPassword || !newPassword.trim()) return;

    try {
      await updateUser(targetUserForPassword.id, { password: newPassword.trim() });
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(false);
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar contraseña.');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.active !== false) ||
      (statusFilter === 'inactive' && u.active === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // KPI Metrics
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const techCount = users.filter((u) => u.role === 'technician').length;
  const activeCount = users.filter((u) => u.active !== false).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-950/60 text-brand-teal-600 dark:text-brand-teal-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Usuarios
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {totalUsers}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Administradores
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {adminCount}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Técnicos de Campo
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {techCount}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Cuentas Activas
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {activeCount}
            </span>
          </div>
        </div>

      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
        
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-teal-500 shadow-xs"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500 shadow-xs"
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">Administradores</option>
            <option value="technician">Técnicos de Campo</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-teal-500 shadow-xs"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Solo Activos</option>
            <option value="inactive">Solo Inactivos</option>
          </select>
        </div>

        {/* Create User Button */}
        <button
          onClick={openNewUserModal}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Usuario</span>
        </button>

      </div>

      {/* Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => {
          const isMe = currentUser?.id === user.id;
          const isAdmin = user.role === 'admin';
          const isActive = user.active !== false;

          return (
            <div
              key={user.id}
              className={`rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-md hover:shadow-lg flex flex-col justify-between overflow-hidden ${
                !isActive
                  ? 'border-slate-300 dark:border-slate-800 opacity-70 bg-slate-50/60 dark:bg-slate-900/50'
                  : isAdmin
                  ? 'border-slate-300 dark:border-slate-800 hover:border-purple-500'
                  : 'border-slate-300 dark:border-slate-800 hover:border-brand-teal-500'
              }`}
            >
              
              <div className="p-5 space-y-4">
                
                {/* User Card Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner ${
                        isAdmin
                          ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40'
                          : 'bg-brand-teal-100 dark:bg-brand-teal-950/80 text-brand-teal-700 dark:text-brand-teal-300 border border-brand-teal-300 dark:border-brand-teal-500/40'
                      }`}
                    >
                      {user.avatar || user.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                          {user.name}
                        </h4>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded bg-brand-teal-500 text-slate-950 text-[10px] font-black uppercase shadow-xs">
                            Tú
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border shadow-xs ${
                            isAdmin
                              ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                          <span>{isAdmin ? 'Administrador' : 'Técnico de Campo'}</span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{isActive ? 'Activo' : 'Inactivo'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate">{user.email}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Registrado: {user.createdAt || 'Enero 2025'}</span>
                  </div>
                </div>

              </div>

              {/* Action Toolbar */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                
                <div className="flex items-center gap-1.5">
                  {/* Change Password Button */}
                  <button
                    onClick={() => openChangePasswordModal(user)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-teal-600 border border-slate-300 dark:border-slate-700 shadow-xs text-xs font-bold flex items-center gap-1"
                    title="Cambiar contraseña"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] hidden sm:inline">Clave</span>
                  </button>

                  {/* Toggle Active Status */}
                  <button
                    onClick={async () => {
                      try {
                        await toggleUserStatus(user.id);
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    disabled={isMe}
                    className={`p-1.5 rounded-lg text-xs font-bold border shadow-xs transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 border-slate-300 dark:border-slate-700'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                    title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
                  >
                    {isActive ? <XCircle className="w-3.5 h-3.5 text-rose-500" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Edit User Button */}
                  <button
                    onClick={() => openEditUserModal(user)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-xs"
                    title="Editar datos del usuario"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete User Button */}
                  <button
                    onClick={async () => {
                      if (confirm(`¿Estás seguro de eliminar el usuario ${user.name} (${user.email})?`)) {
                        try {
                          await deleteUser(user.id);
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }
                    }}
                    disabled={isMe}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700 shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isMe ? 'No puedes auto-eliminarte' : 'Eliminar usuario'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-teal-50 dark:bg-brand-teal-950 text-brand-teal-600 dark:text-brand-teal-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Control de permisos y credenciales de acceso al CRM
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Rafael Martínez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-xs font-medium"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                  Correo Electrónico (Usuario de Acceso) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@martineztech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-teal-500 shadow-xs"
                />
              </div>

              {/* Role & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    Rol y Permisos *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-xs"
                  >
                    <option value="admin">Administrador (Acceso Total)</option>
                    <option value="technician">Técnico de Campo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. (809) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-teal-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    Contraseña {editingUser ? '(dejar igual o cambiar)' : '*'}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-brand-teal-600 dark:text-brand-teal-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generar Aleatoria</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    placeholder={editingUser ? '••••••••' : 'Ingresa la contraseña'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-teal-500 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeUserCheckbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-300 text-brand-teal-600 focus:ring-brand-teal-500"
                />
                <label htmlFor="activeUserCheckbox" className="text-xs font-bold text-slate-800 dark:text-slate-300 cursor-pointer">
                  Cuenta Activa (Habilitada para iniciar sesión en el CRM)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-teal-600 hover:bg-brand-teal-500 text-white font-bold text-xs shadow-md border border-brand-teal-700/20"
                >
                  {editingUser ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && targetUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-7 relative shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Cambiar Contraseña
                </h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Establece una nueva clave de acceso para <strong className="text-slate-900 dark:text-white">{targetUserForPassword.name}</strong> ({targetUserForPassword.email}).
            </p>

            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    Nueva Contraseña *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-brand-teal-600 dark:text-brand-teal-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generar Clave</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Escribe la nueva contraseña..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-brand-teal-500 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-300 dark:border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-slate-950 font-black text-xs shadow-md border border-brand-teal-600/30"
                >
                  {passwordSuccess ? '¡Clave Actualizada!' : 'Actualizar Clave'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
