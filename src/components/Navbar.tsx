import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Radio,
  FileCheck,
  Layers,
  LogOut,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { UserRole, AppCategory } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: { name: string; email: string; title: string };
  onOpenLoginModal: () => void;
  onLogout?: () => void;
  conflictCount: number;
  atRiskCount: number;
  onOpenQuickSearch: () => void;
  hasPermission?: (tabId: string) => boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  currentUser,
  onOpenLoginModal,
  onLogout,
  conflictCount,
  atRiskCount,
  onOpenQuickSearch,
  hasPermission
}) => {
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('All');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Grouped tabs under clear functional categories
  const allTabs = [
    {
      id: 'students',
      label: 'Student 360 & APAAR ID',
      category: 'Academic & Student' as AppCategory,
      badge: 'APAAR',
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'placement-ready',
      label: 'Make Placement Ready',
      category: 'Academic & Student' as AppCategory,
      badge: 'AI Coach',
      badgeColor: 'bg-indigo-600'
    },
    {
      id: 'drives',
      label: 'Recruiter Drives',
      category: 'Corporate Drives' as AppCategory
    },
    {
      id: 'pre-talks',
      label: 'Placement Pre-Talks (PPT)',
      category: 'Corporate Drives' as AppCategory,
      badge: 'Live RSVP',
      badgeColor: 'bg-indigo-500'
    },
    {
      id: 'matching',
      label: 'AI Candidate Match',
      category: 'Matching & Ops' as AppCategory
    },
    {
      id: 'scheduler',
      label: 'Drive Scheduler',
      category: 'Matching & Ops' as AppCategory,
      badge: conflictCount > 0 ? `${conflictCount} Conflicts` : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'offers',
      label: 'Offers & KYC Verification',
      category: 'Outcomes & Radar' as AppCategory
    },
    {
      id: 'at-risk',
      label: 'At-Risk Radar & Clinics',
      category: 'Outcomes & Radar' as AppCategory,
      badge: atRiskCount > 0 ? `${atRiskCount} At Risk` : undefined,
      badgeColor: 'bg-rose-500'
    },
    {
      id: 'notifications',
      label: 'Omnichannel Broadcasts',
      category: 'Outcomes & Radar' as AppCategory
    },
    {
      id: 'overview',
      label: 'Executive Analytics',
      category: 'Executive' as AppCategory
    }
  ];

  const categories: AppCategory[] = [
    'All',
    'Academic & Student',
    'Corporate Drives',
    'Matching & Ops',
    'Outcomes & Radar',
    'Executive'
  ];

  const visibleTabs = allTabs.filter(
    (tab) =>
      (selectedCategory === 'All' || tab.category === selectedCategory) &&
      (hasPermission ? hasPermission(tab.id) : true)
  );

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

  const CurrentRoleIcon = roleConfigs[userRole].icon;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top Banner with Org Branding & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black tracking-tight text-slate-900 dark:text-white text-lg">
                  CAMPUS<span className="text-indigo-600 dark:text-indigo-400">LINK</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-indigo-500" />
                  Rooman Technologies
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <span>Placement &amp; Corporate Relations</span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">APAAR/ABC Synchronized</span>
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={onOpenQuickSearch}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search students, APAAR IDs, drives...</span>
              <kbd className="text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* User Profile, Theme Switcher & Role Switcher */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition shadow-2xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Active User Chip */}
            <div className="relative">
              <button
                id="user-role-dropdown-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 p-1.5 pr-3 rounded-xl transition text-left"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${roleConfigs[userRole].color}`}
                >
                  <CurrentRoleIcon className="w-4 h-4" />
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{roleConfigs[userRole].label}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Role Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold">
                      {roleConfigs[userRole].label}
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Switch Active Role
                    </span>

                    {(['TPO', 'Recruiter', 'Student', 'Coordinator'] as UserRole[]).map((role) => {
                      const cfg = roleConfigs[role];
                      const Icon = cfg.icon;
                      const isSelected = userRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            setUserRole(role);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onOpenLoginModal();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Switch Role / Portal</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0 flex items-center">
              <Layers className="w-3 h-3 mr-1" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick active student context indicator */}
          <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>National Academic Depository Connected</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1.5 overflow-x-auto py-2 no-scrollbar text-xs font-medium">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative whitespace-nowrap px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                        isActive ? 'bg-indigo-800' : tab.badgeColor || 'bg-slate-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
