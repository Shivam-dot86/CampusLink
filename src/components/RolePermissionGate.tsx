import React from 'react';
import { ShieldAlert, ArrowRight, Lock, UserCheck, LayoutDashboard } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth, ROLE_DEFAULT_TABS } from '../context/AuthContext';

interface RolePermissionGateProps {
  tabId: string;
  tabLabel: string;
  onNavigateToTab: (tabId: string) => void;
  onOpenLoginModal: () => void;
}

export const RolePermissionGate: React.FC<RolePermissionGateProps> = ({
  tabId,
  tabLabel,
  onNavigateToTab,
  onOpenLoginModal
}) => {
  const { role, user, switchRole, getPermittedRoles } = useAuth();
  const permittedRoles = getPermittedRoles(tabId);
  const defaultTabForCurrentRole = ROLE_DEFAULT_TABS[role] || 'landing';

  const roleLabels: Record<UserRole, string> = {
    TPO: 'Training & Placement Lead (TPO)',
    Recruiter: 'Corporate Recruiter',
    Student: 'Student Candidate',
    Coordinator: 'Placement Coordinator'
  };

  const roleColors: Record<UserRole, string> = {
    TPO: 'bg-indigo-600 text-white',
    Recruiter: 'bg-blue-600 text-white',
    Student: 'bg-emerald-600 text-white',
    Coordinator: 'bg-purple-600 text-white'
  };

  return (
    <div className="w-full py-10 flex items-center justify-center animate-fade-in">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center">
        {/* Shield Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 mb-3">
          Role-Based Access Guard
        </span>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Restricted Institutional Module
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6 leading-relaxed">
          The <span className="font-bold text-slate-900 dark:text-white">"{tabLabel}"</span> enclave requires elevated role privileges. You are currently authenticated under the{' '}
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{role}</span> perspective.
        </p>

        {/* Current User Snapshot */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 max-w-md mx-auto mb-6 text-left flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {user?.name || 'Authorized User'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{user?.title}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${roleColors[role]}`}>
            {role}
          </span>
        </div>

        {/* Permitted Roles Section */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            Authorized Roles for this Module
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {permittedRoles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>{roleLabels[r]}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Quick Role Switch / Navigation Actions */}
        <div className="space-y-3 max-w-md mx-auto">
          {permittedRoles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Switch to an authorized role to test this section:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {permittedRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      onNavigateToTab(tabId);
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Switch to {r}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => onNavigateToTab(defaultTabForCurrentRole)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Back to {role} Dashboard</span>
            </button>

            <button
              onClick={onOpenLoginModal}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 transition cursor-pointer"
            >
              <span>Sign In with Different Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
