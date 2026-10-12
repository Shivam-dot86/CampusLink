import React, { useState } from 'react';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Calendar,
  Award,
  BookOpen,
  Users,
  ChevronRight,
  TrendingUp,
  Download,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  Star,
  ShieldCheck,
  Send,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  StudentProfile,
  RecruiterDrive,
  StudentApplication,
  PeerInterviewInsight,
  OfferRecord,
  UserRole
} from '../types';

interface StudentCareerHubProps {
  student: StudentProfile;
  drives: RecruiterDrive[];
  applications: StudentApplication[];
  peerInsights: PeerInterviewInsight[];
  offers: OfferRecord[];
  onApplyToDrive: (driveId: string) => void;
  onAcceptOffer?: (offerId: string) => void;
  onDeclineOffer?: (offerId: string) => void;
  onOpenMakePlacementReady?: () => void;
}

export const StudentCareerHub: React.FC<StudentCareerHubProps> = ({
  student,
  drives,
  applications,
  peerInsights,
  offers,
  onApplyToDrive,
  onAcceptOffer,
  onDeclineOffer,
  onOpenMakePlacementReady
}) => {
  const [activeTab, setActiveTab] = useState<
    'drives' | 'applications' | 'profile' | 'prep' | 'calendar' | 'offers' | 'peer-insights'
  >('drives');

  const [drivesFilter, setDrivesFilter] = useState<'all' | 'eligible' | 'ineligible'>('eligible');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsight, setSelectedInsight] = useState<PeerInterviewInsight | null>(null);
  const [appliedDriveIds, setAppliedDriveIds] = useState<string[]>(
    applications.map((a) => a.driveId)
  );
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  // Check eligibility for each drive
  const checkEligibility = (drive: RecruiterDrive) => {
    const reasons: string[] = [];
    let isEligible = true;

    if (student.cgpa < drive.minCGPA) {
      isEligible = false;
      reasons.push(`CGPA ${student.cgpa} is below min requirement (${drive.minCGPA})`);
    }

    if (!drive.eligibleBranches.includes(student.branch)) {
      isEligible = false;
      reasons.push(`${student.branch} branch not in eligible list (${drive.eligibleBranches.join(', ')})`);
    }

    if (student.activeBacklogs > drive.maxBacklogsAllowed) {
      isEligible = false;
      reasons.push(`Has ${student.activeBacklogs} backlogs; max allowed is ${drive.maxBacklogsAllowed}`);
    }

    return { isEligible, reasons };
  };

  const handleApply = (driveId: string) => {
    if (!appliedDriveIds.includes(driveId)) {
      setAppliedDriveIds([...appliedDriveIds, driveId]);
      setJustAppliedId(driveId);
      setTimeout(() => setJustAppliedId(null), 3000);
      onApplyToDrive(driveId);
    }
  };

  // Filter drives
  const filteredDrives = drives.filter((d) => {
    const { isEligible } = checkEligibility(d);
    const matchesSearch =
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (drivesFilter === 'eligible') return isEligible;
    if (drivesFilter === 'ineligible') return !isEligible;
    return true;
  });

  // Calculate profile completeness
  const profileCompletenessScore = (() => {
    let score = 50; // base academic info
    if ((student.skills?.length || 0) >= 5) score += 15;
    if ((student.projects?.length || 0) >= 2) score += 15;
    if ((student.internships?.length || 0) >= 1) score += 10;
    if (student.apaarRecord?.digiLockerVerified) score += 10;
    return Math.min(score, 100);
  })();

  const studentOffers = offers.filter((o) => o.studentId === student.id);

  return (
    <div className="space-y-6">
      {/* Top Student Persona Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Student Career Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/30 text-emerald-100 border border-emerald-300/40">
                APAAR ID: {student.apaarRecord?.apaarId || '9842-1049-3821'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {student.name}!
            </h1>
            <p className="text-sm text-emerald-100 max-w-xl leading-relaxed">
              {student.branch} • USN: {student.usn} • CGPA: {student.cgpa} • Batch: {student.batch}.
              Tracking {applications.length} active drive applications with {studentOffers.length} released offers.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
              <span className="text-xs text-emerald-100 block">Readiness Score</span>
              <span className="text-xl sm:text-2xl font-black">{student.readinessScore}/100</span>
              <span className="text-[10px] text-emerald-200 block font-medium">Corporate Ready</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
              <span className="text-xs text-emerald-100 block">Applications</span>
              <span className="text-xl sm:text-2xl font-black">{applications.length}</span>
              <span className="text-[10px] text-emerald-200 block font-medium">In Process</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-emerald-100 block">Job Offers</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300">{studentOffers.length}</span>
              <span className="text-[10px] text-emerald-200 block font-medium">
                {studentOffers.length > 0 ? 'Offer Secured!' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-8 pt-4 border-t border-white/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'drives', label: 'Eligible Drives', icon: Briefcase, count: drives.length },
            { id: 'applications', label: 'My Applications', icon: Clock, count: applications.length },
            { id: 'profile', label: 'Smart Profile & ATS', icon: FileText, badge: `${profileCompletenessScore}%` },
            { id: 'prep', label: 'Prep Hub & Skill Gap', icon: BookOpen },
            { id: 'calendar', label: 'Timeline & Deadlines', icon: Calendar },
            { id: 'offers', label: 'Offer Center', icon: Award, count: studentOffers.length },
            { id: 'peer-insights', label: 'Peer Insights', icon: Users, badge: 'Seniors Tips' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-white/20 text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                      isActive ? 'bg-indigo-100 text-indigo-900' : 'bg-emerald-300 text-slate-900'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Alert for Instant Apply */}
      {justAppliedId && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">
              Application submitted successfully! Your APAAR verified profile has been transmitted to the recruiter.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
          >
            Track Application →
          </button>
        </div>
      )}

      {/* 1. ELIGIBLE DRIVES FEED */}
      {activeTab === 'drives' && (
        <div className="space-y-5 animate-fade-in">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="font-bold text-slate-600 dark:text-slate-400">Filter Feed:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setDrivesFilter('eligible')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    drivesFilter === 'eligible'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Eligible For You
                </button>
                <button
                  onClick={() => setDrivesFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    drivesFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Campus Drives
                </button>
                <button
                  onClick={() => setDrivesFilter('ineligible')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    drivesFilter === 'ineligible'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Ineligible Drives
                </button>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search company, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Drives List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDrives.map((drive) => {
              const { isEligible, reasons } = checkEligibility(drive);
              const isApplied = appliedDriveIds.includes(drive.id);

              return (
                <div
                  key={drive.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isEligible
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-sm shadow-xs">
                        {drive.logo || drive.companyName.slice(0, 3)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {drive.companyName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {drive.roleTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                        ₹{drive.ctcLPA} LPA
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                        {drive.jobType}
                      </span>
                    </div>
                  </div>

                  {/* Criteria summary */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[11px] mb-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Min Cutoff</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        CGPA {drive.minCGPA}+ (Backlogs ≤ {drive.maxBacklogsAllowed})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Branches</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {drive.eligibleBranches.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {drive.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Eligibility / Ineligibility Banner */}
                  {isEligible ? (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>You are 100% Eligible</span>
                      </div>

                      <button
                        onClick={() => handleApply(drive.id)}
                        disabled={isApplied}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          isApplied
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Applied</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>1-Click Apply</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-rose-700 dark:text-rose-300 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Why Not Eligible:</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-rose-600 dark:text-rose-400 pl-1">
                        {reasons.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MY APPLICATIONS PIPELINE */}
      {activeTab === 'applications' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Application Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent status tracking across all corporate rounds and interview invites.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
              {applications.length} Active Records
            </span>
          </div>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                    {app.logo}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {app.companyName}
                      </h4>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        ₹{app.ctcLPA} LPA
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {app.roleTitle} • Applied on {app.appliedDate}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs">
                    <span className="text-[10px] text-slate-400 block font-semibold">Current Round</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{app.currentRound}</span>
                    {app.nextStepDeadline && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">
                        ⏳ {app.nextStepDeadline}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-center ${
                      app.status === 'Offered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300'
                        : app.status === 'Technical Interview'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SMART PROFILE & AI RESUME ATS ANALYZER */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          {/* Completeness Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Smart Profile Completeness Meter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Higher completeness significantly increases recruiter shortlist rate on CampusLink.
                </p>
              </div>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {profileCompletenessScore}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full transition-all duration-500"
                style={{ width: `${profileCompletenessScore}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>APAAR DigiLocker Sync (+10%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Skills Matrix (+15%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Internships & Projects (+25%)</span>
              </div>
            </div>
          </div>

          {/* AI ATS Resume Analyzer */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    AI Resume ATS Scorer & Bullet Point Optimizer
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    File: {student.resume?.fileName || 'Resume.pdf'} • Scanned with Rooman AI ATS Model
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {student.resume?.atsScore || 85}/100
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">Tier-1 Ready</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-2">
                  ✓ Matched Keywords ({student.resume?.keyKeywordsMatched?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(student.resume?.keyKeywordsMatched || []).map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                <span className="font-bold text-amber-800 dark:text-amber-300 block mb-2">
                  ⚠️ Missing High-Impact Keywords ({student.resume?.missingKeywords?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(student.resume?.missingKeywords || []).map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[10px] font-bold"
                    >
                      +{k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Actionable Recommendations */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                AI Suggested Bullet Point Revisions:
              </span>
              {(student.resume?.improvements || []).map((imp, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. PREP HUB & SKILL GAP */}
      {activeTab === 'prep' && (
        <div className="space-y-6 animate-fade-in">
          {/* Skill-Gap Diagnostic Banner */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              AI Skill-Gap & Role Match Radar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Compare your current profile against tier-1 job specifications to target practice drills.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block text-sm">
                  AWS Cloud & DevOps (84% Fit)
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  You match DSA and Python. Learn Terraform & Kubernetes to reach 96% fit.
                </p>
                <button
                  onClick={onOpenMakePlacementReady}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  Launch 4-Week Sprint →
                </button>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-sm">
                  Cisco Networking SDE (92% Fit)
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Strong socket programming fundamentals. Recommended: review BGP & Subnetting MCQs.
                </p>
                <button
                  onClick={onOpenMakePlacementReady}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  Start Network Drills →
                </button>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
                <span className="font-bold text-purple-900 dark:text-purple-200 block text-sm">
                  AI & Medical Imaging (76% Fit)
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Requires hands-on PyTorch CNN experience and medical dataset validation.
                </p>
                <button
                  onClick={onOpenMakePlacementReady}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] cursor-pointer"
                >
                  View ML Cheat Sheets →
                </button>
              </div>
            </div>
          </div>

          {/* Practice Question Bank */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Curated Placement Question Banks & Mock Practice
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Top 75 LeetCode DSA
                </span>
                <span className="text-[10px] text-slate-400 block mb-2">Arrays, Trees, Graphs & DP</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  {student.leetcodeSolved}/75 Solved
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Core CS Fundamentals
                </span>
                <span className="text-[10px] text-slate-400 block mb-2">OS, DBMS, Networks & OOPs</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                  Score: {student.aptitudeScore}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Mock Interview Simulator
                </span>
                <span className="text-[10px] text-slate-400 block mb-2">AI Behavioral + Tech Audio</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold text-[11px]">
                  Score: {student.mockInterviewScore}/100
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Company Cheat Sheets
                </span>
                <span className="text-[10px] text-slate-400 block mb-2">AWS, Cisco, Siemens, TCS</span>
                <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                  4 Guides Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. OFFER CENTER & DREAM OFFER POLICY */}
      {activeTab === 'offers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Institutional Policy Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-indigo-950 dark:text-indigo-200">
                  Institutional "One Student, One Offer" & Dream Offer Policy
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl text-[11px]">
                Upon receiving an initial offer, students may only appear for designated "Dream Drives"
                (CTC ≥ ₹12 LPA) or "Super Dream Drives" (CTC ≥ ₹18 LPA). Accepting an offer locks joining
                clearance and notifies the Training & Placement Cell.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs shrink-0">
              Policy Status: Eligible for Dream Offers
            </span>
          </div>

          {/* Offers list */}
          {studentOffers.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Award className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200">No Released Offers Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                You currently have {applications.length} applications in progress. Offers will be posted here
                immediately upon corporate clearance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentOffers.map((off) => (
                <div
                  key={off.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          Official Offer
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                          {off.companyName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {off.role} • Joining Date: {off.joiningDate} • Location: {off.workLocation}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                        ₹{off.ctcLPA} LPA
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        Acceptance Due: {off.acceptanceDeadline}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Required Documents for Clearance:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {off.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          {doc.verified ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span className="truncate">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-2">
                    {onDeclineOffer && off.status !== 'Accepted' && (
                      <button
                        onClick={() => onDeclineOffer(off.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        Decline
                      </button>
                    )}
                    {onAcceptOffer && off.status !== 'Accepted' && (
                      <button
                        onClick={() => onAcceptOffer(off.id)}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-95 cursor-pointer"
                      >
                        Accept Offer &amp; Lock Position
                      </button>
                    )}
                    {off.status === 'Accepted' && (
                      <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        ✓ Offer Accepted &amp; Institutional Verification Cleared
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. PEER INSIGHTS & SENIORS TIPS (THE DIFFERENTIATOR) */}
      {activeTab === 'peer-insights' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Peer & Alumni Interview Experiences
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                  Verified by TPO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ground truths, actual questions asked, and strategies shared by seniors placed in top firms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {peerInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {insight.companyName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {insight.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    {insight.roleTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    Shared by {insight.studentName} ({insight.batch}) • {insight.verdict}
                  </p>

                  <div className="space-y-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Rounds Overview:
                    </span>
                    {insight.roundsSummary.map((rnd, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-[11px]"
                      >
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{rnd.roundName}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">{rnd.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInsight(insight)}
                  className="w-full py-2 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>Read Full Experience &amp; Tips</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Deep modal for selected peer experience */}
          {selectedInsight && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-modal-pop">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                      {selectedInsight.companyName} — {selectedInsight.roleTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Interview debrief by {selectedInsight.studentName} ({selectedInsight.batch})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Actual questions asked */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Rounds Breakdown &amp; Real Questions:
                  </h4>
                  {selectedInsight.roundsSummary.map((rnd, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{rnd.roundName}</p>
                      <p className="text-slate-600 dark:text-slate-300">{rnd.summary}</p>
                      {rnd.sampleQuestions.length > 0 && (
                        <div className="pt-1">
                          <span className="font-semibold text-[11px] text-slate-500 block mb-1">
                            Sample Questions Asked:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 pl-1 font-mono text-[11px]">
                            {rnd.sampleQuestions.map((q, qIdx) => (
                              <li key={qIdx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Top Tips */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    💡 Senior's Key Advice &amp; Dos &amp; Don'ts:
                  </span>
                  {selectedInsight.topTips.map((tip, idx) => (
                    <p key={idx} className="text-emerald-900 dark:text-emerald-200 text-[11px]">
                      • {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. TIMELINE & DEADLINES */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Upcoming Deadlines, Online Assessments &amp; Interviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronized chronological placement calendar. Never miss an assessment cutoff.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                time: 'Today, 02:30 PM',
                title: 'AWS Bar Raiser Technical Interview (Aarav Sharma)',
                type: 'Interview',
                badge: 'Panel 2 • Audi A'
              },
              {
                time: 'Oct 13, 2026 (11:59 PM)',
                title: 'Siemens Healthineers Python ML Assessment Deadline',
                type: 'Assessment',
                badge: 'HackerRank 90 Mins'
              },
              {
                time: 'Oct 14, 2026 (04:00 PM)',
                title: 'Microsoft Pre-Placement Talk (PPT) & Azure Q&A',
                type: 'Pre-Talk',
                badge: 'Auditorium Main'
              },
              {
                time: 'Oct 16, 2026 (10:00 AM)',
                title: 'Schneider Electric IoT Platform Technical Round 1',
                type: 'Interview',
                badge: 'Lab 2 Virtual'
              },
              {
                time: 'Oct 18, 2026 (05:00 PM)',
                title: 'Cisco Systems Offer Acceptance Final Deadline',
                type: 'Offer',
                badge: 'Portal Action Due'
              }
            ].map((event, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{event.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{event.time}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800">
                  {event.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
