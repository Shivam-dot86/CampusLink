import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Building2,
  GraduationCap,
  UserCheck,
  Trash2,
  LogIn,
  CheckCircle,
  Mail,
  Building,
  Sparkles,
  Phone
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddUser: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenAddUser
}) => {
  const { user: currentUser, registeredUsers, loginWithAccount, deleteActualUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | UserRole>('All');
  const [filterType, setFilterType] = useState<'All' | 'Actual' | 'Preset'>('All');
  const [switchedSuccess, setSwitchedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleIcons: Record<UserRole, React.ElementType> = {
    TPO: ShieldCheck,
    Recruiter: Building2,
    Student: GraduationCap,
    Coordinator: UserCheck
  };

  const roleColors: Record<UserRole, string> = {
    TPO: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    Recruiter: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    Student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    Coordinator: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
  };

  const filteredUsers = registeredUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.org && u.org.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.usn && u.usn.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = filterRole === 'All' || u.role === filterRole;

    const isActual = Boolean(u.isActualUser || u.email.toLowerCase() === 'singhs54314@gmail.com');
    const matchesType =
      filterType === 'All' ||
      (filterType === 'Actual' && isActual) ||
      (filterType === 'Preset' && !isActual);

    return matchesSearch && matchesRole && matchesType;
  });

  const handleSwitchUser = (targetUser: UserAccount) => {
    loginWithAccount(targetUser);
    setSwitchedSuccess(targetUser.name);
    setTimeout(() => {
      setSwitchedSuccess(null);
    }, 1500);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove user "${name}"?`)) {
      await deleteActualUser(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Actual Users &amp; Team Directory</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {registeredUsers.length} Accounts
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage all registered actual users and preset demo personas across your placement network.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddUser();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Actual User</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, email, department, or USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Roles</option>
              <option value="TPO">TPO Lead</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Student">Student</option>
              <option value="Coordinator">Coordinator</option>
            </select>

            {/* Account Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="All">All Types</option>
              <option value="Actual">Actual Users Only</option>
              <option value="Preset">Preset Demos</option>
            </select>
          </div>
        </div>

        {/* Switch Toast */}
        {switchedSuccess && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Switched active user session to <strong>{switchedSuccess}</strong>!</span>
          </div>
        )}

        {/* User Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No users found matching your filters.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddUser();
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
              >
                + Add Actual User Now
              </button>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const RoleIcon = roleIcons[u.role];
              const isCurrent = currentUser?.id === u.id;
              const isActual = Boolean(u.isActualUser || u.email.toLowerCase() === 'singhs54314@gmail.com');

              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={u.name}
                      className="h-11 w-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {u.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${roleColors[u.role]}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          <span>{u.role}</span>
                        </span>
                        {isActual ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            Actual User
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Preset
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                            Current Active
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-3 flex-wrap">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </span>
                        <span>•</span>
                        <span>{u.title}</span>
                        {u.org && (
                          <>
                            <span>•</span>
                            <span>{u.org}</span>
                          </>
                        )}
                        {u.usn && (
                          <>
                            <span>•</span>
                            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              USN: {u.usn}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    {!isCurrent && (
                      <button
                        onClick={() => handleSwitchUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log In As</span>
                      </button>
                    )}

                    {isActual && u.id !== 'usr-singh-01' && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {filteredUsers.length} of {registeredUsers.length} total users
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
