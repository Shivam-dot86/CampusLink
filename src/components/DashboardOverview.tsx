import React from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Briefcase,
  AlertTriangle,
  Building2,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { PlacementStats, RecruiterDrive, ScheduleConflict } from '../types';

interface DashboardOverviewProps {
  stats: PlacementStats;
  drives: RecruiterDrive[];
  conflicts: ScheduleConflict[];
  onNavigateTab: (tab: string) => void;
  onSelectDrive: (driveId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  drives,
  conflicts,
  onNavigateTab,
  onSelectDrive,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome & Context Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Placement Cycle 2025 - 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Executive Placement &amp; Corporate Intelligence
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-2xl leading-relaxed">
              Real-time campus-to-corporate readiness monitoring, AI-driven candidate shortlisting, and predictive conversion analytics powered by Rooman Technologies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('matching')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition shadow-md shadow-indigo-900/40 flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Match Engine</span>
            </button>
            <button
              onClick={() => onNavigateTab('drives')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-medium text-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Manage Drives</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar if conflicts or at-risk */}
      {(conflicts.length > 0 || stats.atRiskCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conflicts.length > 0 && (
            <div className="bg-amber-50/90 dark:bg-slate-900/90 border border-amber-200/90 dark:border-amber-500/30 rounded-xl p-4 flex items-start space-x-3 transition-colors shadow-2xs">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                    {conflicts.length} Drive Schedule Conflict{conflicts.length > 1 ? 's' : ''} Detected
                  </h4>
                  <button
                    onClick={() => onNavigateTab('scheduler')}
                    className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 underline flex items-center cursor-pointer"
                  >
                    Resolve in Scheduler <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-slate-300 mt-1">
                  {conflicts[0].description}
                </p>
              </div>
            </div>
          )}

          {stats.atRiskCount > 0 && (
            <div className="bg-rose-50/90 dark:bg-slate-900/90 border border-rose-200/90 dark:border-rose-500/30 rounded-xl p-4 flex items-start space-x-3 transition-colors shadow-2xs">
              <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-700 dark:text-rose-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                    {stats.atRiskCount} Students Flagged At-Risk
                  </h4>
                  <button
                    onClick={() => onNavigateTab('at-risk')}
                    className="text-xs font-semibold text-rose-800 dark:text-rose-400 hover:text-rose-950 dark:hover:text-rose-200 underline flex items-center cursor-pointer"
                  >
                    View Interventions <ArrowUpRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
                <p className="text-xs text-rose-800/90 dark:text-slate-300 mt-1">
                  Active backlogs and low training attendance threaten placement eligibility. AI remedial roadmaps available.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Placement Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.placementRate}%</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">+6.2% YoY</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">362 of 480 placed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average CTC</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.avgPackageLPA}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LPA</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Highest: {stats.highestPackageLPA} LPA</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Offers</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalOffers}</span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">1.18 per placed</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">42 dual-offer holders</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Drives</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.activeDrives}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">now</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{stats.upcomingDrives} scheduled</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Cohort</span>
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalEligible}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Students</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Across 6 Engineering branches</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">At-Risk Radar</span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{stats.atRiskCount}</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Students</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Needs mentor intervention</p>
        </div>
      </div>

      {/* Primary Analytics Row: Funnel & Branch Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Placement Conversion Funnel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Placement Lifecycle Conversion Funnel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Batch of 2026: Student attrition and progression across drive stages</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
              Overall Conv: {Math.round((stats.funnelData[stats.funnelData.length - 1].count / stats.funnelData[0].count) * 100)}%
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {stats.funnelData.map((stage, idx) => {
              const pct = Math.round((stage.count / stats.funnelData[0].count) * 100);
              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                      <span className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] mr-2 font-bold">
                        {idx + 1}
                      </span>
                      {stage.stage}
                    </span>
                    <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                      {stage.dropRate > 0 && (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded">
                          -{stage.dropRate}% drop
                        </span>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white">{stage.count}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-mono w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-indigo-600'
                          : idx === 1
                          ? 'bg-blue-600'
                          : idx === 2
                          ? 'bg-sky-500'
                          : idx === 3
                          ? 'bg-teal-500'
                          : idx === 4
                          ? 'bg-emerald-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Branch-wise Performance */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Branch-wise Placement Rates</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Conversion % &amp; Average CTC achieved</p>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold flex items-center"
            >
              Filter <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {stats.branchPlacements.map((b) => {
              const rate = Math.round((b.placed / b.total) * 100);
              return (
                <div key={b.branch} className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 w-16">{b.branch}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        ({b.placed}/{b.total} placed)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        Avg {b.avgLPA} LPA
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white w-10 text-right">{rate}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        rate >= 80 ? 'bg-emerald-500' : rate >= 65 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second Analytics Row: Salary Tiers & Live Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CTC Tier Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Salary Tier Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Offers grouped by package brackets</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.tierDistribution.map((t) => (
              <div key={t.tier} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t.tier}
                </span>
                <div className="mt-1 flex items-baseline space-x-1.5">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">{t.count}</span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">({t.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: `${t.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-indigo-50/80 dark:bg-slate-800/60 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="text-indigo-900 dark:text-indigo-300 font-medium">Super Dream Packages accounted for 18.8%</span>
            <button
              onClick={() => onNavigateTab('offers')}
              className="font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 underline cursor-pointer"
            >
              View Offer Letters
            </button>
          </div>
        </div>

        {/* Ongoing Corporate Drives Tracker */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ongoing &amp; Upcoming Corporate Drives</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live recruitment statuses &amp; applicant counts</p>
            </div>
            <button
              onClick={() => onNavigateTab('drives')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              All Drives ({drives.length})
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {drives.map((drv) => (
              <div
                key={drv.id}
                onClick={() => {
                  onSelectDrive(drv.id);
                  onNavigateTab('matching');
                }}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                    {drv.logo}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{drv.companyName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {drv.ctcLPA} LPA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{drv.roleTitle}</p>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>Drive Date: {drv.driveDate}</span>
                      <span>•</span>
                      <span>Min CGPA: {drv.minCGPA}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {drv.shortlistedCount} / {drv.registeredCount}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Shortlisted</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                      drv.status === 'Shortlisting'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : drv.status === 'Assessment Active'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {drv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
