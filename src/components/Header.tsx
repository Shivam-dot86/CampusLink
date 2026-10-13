import React, { useState } from 'react';
import {
  Menu,
  X,
  Search,
  Sparkles,
  Building2,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle2,
  Sun,
  Moon,
  Users,
  Settings
} from 'lucide-react';
import { UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: { name: string; email: string; title: string };
  onOpenLoginModal: () => void;
  onLogout?: () => void;
  onOpenAuditTrail?: () => void;
  onOpenSettings?: () => void;
  conflictCount: number;
  atRiskCount: number;
  onOpenQuickSearch: () => void;
  activeSectionTitle?: string;
  activeTabLabel?: string;
  onOpenLandingPage?: () => void;
  onOpenAddUser?: () => void;
  onOpenUserManagement?: () => void;
  onOpenDatabaseConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  userRole,
  setUserRole,
  currentUser,
  onOpenLoginModal,
  onLogout,
  onOpenAuditTrail,
  onOpenSettings,
  conflictCount,
  atRiskCount,
  onOpenQuickSearch,
  activeSectionTitle = 'Placement Operations',
  activeTabLabel = 'Dashboard',
  onOpenLandingPage,
  onOpenAddUser,
  onOpenUserManagement
}) => {
  const { user, registeredUsers } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roleConfigs: Record<
    UserRole,
    { label: string; icon: React.ElementType; color: string; badge: string }
  > = {
    TPO: {
      label: 'T&P Lead (TPO)',
      icon: ShieldCheck,
      color: 'bg-indigo-600 text-white',
      badge: 'Institutional'
    },
    Recruiter: {
      label: 'Corporate Recruiter',
      icon: Building2,
      color: 'bg-blue-600 text-white',
      badge: 'Corporate'
    },
    Student: {
      label: 'Student Candidate',
      icon: GraduationCap,
      color: 'bg-emerald-600 text-white',
      badge: 'Candidate'
    },
    Coordinator: {
      label: 'Lead Coordinator',
      icon: UserCheck,
      color: 'bg-purple-600 text-white',
      badge: 'Coordinator'
    }
  };

  const activeRoleConfig = (userRole && roleConfigs[userRole]) ? roleConfigs[userRole] : roleConfigs.Student;
  const CurrentRoleIcon = activeRoleConfig.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs h-16 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      {/* Left: Three-line sidebar toggle button & Breadcrumb Context */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-center shrink-0"
          aria-label="Toggle navigation sidebar"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Context */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline font-medium">
            {activeSectionTitle}
          </span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">/</span>
          <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
            {activeTabLabel}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search, System Badges, Theme Toggle, Role Switcher */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Quick Search */}
        <button
          onClick={onOpenQuickSearch}
          className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-400 dark:text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center justify-center shadow-2xs"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 p-1.5 sm:pr-3 rounded-xl transition text-left cursor-pointer"
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${activeRoleConfig.color}`}
            >
              <CurrentRoleIcon className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {currentUser?.name || 'Authorized User'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{activeRoleConfig.label}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Clean User Account Popover */}
          {showRoleDropdown && (
            <>
              {/* Invisible Click-away Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleDropdown(false)}
              />

              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fade-in animate-modal-pop text-xs">
                {/* Account Identity Header */}
                <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-1 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                      {currentUser?.name || 'Authorized User'}
                    </p>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 px-1.5 py-0.5 rounded">
                      {activeRoleConfig.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {currentUser?.email || ''}
                  </p>
                </div>

                {/* Clean Essential Menu Actions */}
                <div className="space-y-0.5">
                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>Account &amp; Settings</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
