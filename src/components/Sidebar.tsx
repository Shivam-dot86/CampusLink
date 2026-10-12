import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  Building2,
  Presentation,
  Cpu,
  CalendarDays,
  FileCheck2,
  AlertTriangle,
  Megaphone,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Search,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Briefcase,
  X
} from 'lucide-react';
import { UserRole } from '../types';
import { CampusLinkLogo } from './CampusLinkLogo';

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  description: string;
  badge?: string | number;
  badgeColor?: string;
  rolePill?: string;
}

export interface NavSection {
  id: string;
  title: string;
  tagline: string;
  items: NavItem[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  currentUser?: { name: string; email: string; title?: string };
  conflictCount: number;
  atRiskCount: number;
  isOpen: boolean;
  onCloseMobile?: () => void;
  onOpenQuickSearch: () => void;
  onOpenLoginModal: () => void;
  onOpenAuditTrail?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onOpenAddUser?: () => void;
  hasPermission?: (tabId: string) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  currentUser,
  conflictCount,
  atRiskCount,
  isOpen,
  onCloseMobile,
  onOpenQuickSearch,
  onOpenLoginModal,
  onOpenAuditTrail,
  onOpenSettings,
  onLogout,
  onOpenAddUser,
  hasPermission
}) => {
  // Navigation sections categorized clearly
  const sections: NavSection[] = [
    {
      id: 'core-overview',
      title: 'Executive & TPO Command',
      tagline: 'High-level metrics & institutional health',
      items: [
        {
          id: 'tpo-command',
          label: 'T&P Command Center',
          shortLabel: 'TPO Command',
          icon: ShieldCheck,
          description: 'KPI strip, MoUs, eligibility engine & NIRF reports',
          badge: 'TPO Lead',
          badgeColor: 'bg-indigo-600 text-white'
        },
        {
          id: 'overview',
          label: 'Executive Overview',
          shortLabel: 'Overview',
          icon: LayoutDashboard,
          description: 'Conversion rates, CTC bands & drive pipeline'
        },
        {
          id: 'landing',
          label: 'Landing Page Showcase',
          shortLabel: 'Landing Page',
          icon: Layers,
          description: 'Modern high-converting hero & navigation design',
          badge: 'Live',
          badgeColor: 'bg-[#6366F1] text-white'
        }
      ]
    },
    {
      id: 'student-readiness',
      title: 'Student Career Hub',
      tagline: 'Personal career hub & skill coaching',
      items: [
        {
          id: 'student-hub',
          label: 'Student Career Hub',
          shortLabel: 'Student Hub',
          icon: GraduationCap,
          description: 'Eligible drives feed, 1-click apply, prep hub & peer insights',
          badge: 'Student',
          badgeColor: 'bg-emerald-600 text-white'
        },
        {
          id: 'placement-ready',
          label: 'Make Placement Ready',
          shortLabel: 'AI Accelerator',
          icon: Sparkles,
          description: 'AI resume audit, skill gaps & mock interview boost',
          badge: 'AI Coach',
          badgeColor: 'bg-indigo-600 text-white'
        },
        {
          id: 'students',
          label: 'Student 360 & APAAR ID',
          shortLabel: 'Students & APAAR',
          icon: FileCheck2,
          description: 'APAAR/ABC verified records, CGPA & backlogs',
          badge: 'APAAR',
          badgeColor: 'bg-emerald-600 text-white'
        }
      ]
    },
    {
      id: 'corporate-drives',
      title: 'Corporate Recruiter Hub',
      tagline: 'Applicant pipeline, candidate matching & JDs',
      items: [
        {
          id: 'recruiter-workspace',
          label: 'Recruiter Workspace',
          shortLabel: 'Recruiter Hub',
          icon: Building2,
          description: 'Kanban pipeline, explainable fit, JD posting & scorecards',
          badge: 'Recruiter',
          badgeColor: 'bg-blue-600 text-white'
        },
        {
          id: 'drives',
          label: 'Recruiter Drives',
          shortLabel: 'Recruiter Drives',
          icon: Briefcase,
          description: 'Job specs, CTC packages, criteria & dates'
        },
        {
          id: 'pre-talks',
          label: 'Placement Pre-Talks (PPT)',
          shortLabel: 'Pre-Talks (PPT)',
          icon: Presentation,
          description: 'Pre-placement webinars, Q&As & live RSVPs',
          badge: 'Live RSVP',
          badgeColor: 'bg-blue-600 text-white'
        }
      ]
    },
    {
      id: 'ground-operations',
      title: 'Ground Operations & Matching',
      tagline: 'Day-of-drive logistics & conflict engine',
      items: [
        {
          id: 'coordinator-ops',
          label: 'Ground Operations Lead',
          shortLabel: 'Ground Ops',
          icon: UserCheck,
          description: 'Today’s schedule, QR check-in, volunteers & live tracker',
          badge: 'Coordinator',
          badgeColor: 'bg-purple-600 text-white'
        },
        {
          id: 'matching',
          label: 'AI Candidate Match',
          shortLabel: 'AI Match & Rank',
          icon: Cpu,
          description: 'Explainable AI ranking & gap analysis'
        },
        {
          id: 'scheduler',
          label: 'Drive Scheduler',
          shortLabel: 'Conflict Scheduler',
          icon: CalendarDays,
          description: 'Multi-room slots & clash auto-resolution',
          badge: conflictCount > 0 ? `${conflictCount} Clashes` : undefined,
          badgeColor: 'bg-amber-500 text-white'
        }
      ]
    },
    {
      id: 'outcomes-tracking',
      title: 'Outcomes & Radar',
      tagline: 'Offers, risk clinics & alerts',
      items: [
        {
          id: 'offers',
          label: 'Offers & KYC Verification',
          shortLabel: 'Offers & Letters',
          icon: FileCheck2,
          description: 'PPOs, acceptance tracking & document clearance'
        },
        {
          id: 'at-risk',
          label: 'At-Risk Radar & Clinics',
          shortLabel: 'At-Risk Radar',
          icon: AlertTriangle,
          description: 'Unplaced triage, remedial roadmaps & mentors',
          badge: atRiskCount > 0 ? `${atRiskCount} At Risk` : undefined,
          badgeColor: 'bg-rose-500 text-white'
        },
        {
          id: 'notifications',
          label: 'Omnichannel Broadcasts',
          shortLabel: 'Broadcasts',
          icon: Megaphone,
          description: 'WhatsApp, SMS, Email & Web push dispatches'
        }
      ]
    }
  ];

  const handleItemClick = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
          <div className="flex items-center space-x-2">
            <CampusLinkLogo variant="compact" size="md" />
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-400/30 px-1.5 py-0.5 rounded shrink-0">
              AI OS
            </span>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Button in Sidebar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 dark:bg-slate-900/60">
          <button
            onClick={onOpenQuickSearch}
            className="w-full flex items-center justify-between bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-2xs transition"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Search APAAR, drives...</span>
            </div>
            <kbd className="text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-500 dark:text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Categorized Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section) => {
            const visibleItems = section.items.filter((item) => (hasPermission ? hasPermission(item.id) : true));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.id} className="space-y-1.5">
                <div className="px-3 pb-1">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{section.title}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {section.tagline}
                  </p>
                </div>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full group flex items-start text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/90 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg mr-2.5 shrink-0 transition ${
                          isActive
                            ? 'bg-indigo-700/60 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${
                                isActive ? 'bg-indigo-800 text-white' : item.badgeColor
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[10px] truncate font-normal mt-0.5 ${
                            isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                      <ChevronRight
                        className={`w-3.5 h-3.5 ml-1 mt-1 shrink-0 transition-transform ${
                          isActive
                            ? 'text-indigo-200 translate-x-0.5'
                            : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>

        {/* Sidebar Footer / APAAR NAD Status & Perspective Pill */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 space-y-2">
          {/* APAAR National Academic Depository Badge */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Govt APAAR / ABC
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800">
                Connected
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Syncing credits with National Academic Depository & DigiLocker
            </p>
          </div>

          {/* Authenticated User Status & Role Switcher */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || 'Authorized User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.email || ''}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 shrink-0">
                {userRole}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <button
                onClick={onOpenLoginModal}
                className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold transition border border-indigo-200/50 dark:border-indigo-800/60 cursor-pointer"
                title="Switch Perspective or Authenticate"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Switch Role</span>
              </button>
              {onOpenAddUser && (
                <button
                  onClick={onOpenAddUser}
                  className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition cursor-pointer text-[10px]"
                  title="Add Actual User to Database"
                >
                  + User
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 rounded-lg font-semibold transition border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900 cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              )}
            </div>

            {(onOpenAuditTrail || onOpenSettings) && (
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                {onOpenAuditTrail && (
                  <button
                    onClick={onOpenAuditTrail}
                    className="flex-1 text-left hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                  >
                    📋 View Audit Trail
                  </button>
                )}
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="text-right hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer"
                  >
                    ⚙ Settings
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
