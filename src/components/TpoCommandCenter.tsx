import React, { useState } from 'react';
import {
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck2,
  Download,
  Filter,
  ShieldCheck,
  Send,
  Sliders,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  Award,
  Layers,
  Lock,
  Plus,
  UserPlus,
  LogIn,
  Mail,
  Trash2
} from 'lucide-react';
import {
  PlacementStats,
  RecruiterDrive,
  StudentProfile,
  CompanyMoU,
  DriveApprovalRequest,
  ScheduleConflict,
  UserRole
} from '../types';
import { useAuth } from '../context/AuthContext';

interface TpoCommandCenterProps {
  stats: PlacementStats;
  drives: RecruiterDrive[];
  students: StudentProfile[];
  mous: CompanyMoU[];
  approvalRequests: DriveApprovalRequest[];
  conflicts: ScheduleConflict[];
  onSelectDrive?: (driveId: string) => void;
  onNavigateTab: (tabId: string) => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
  onBroadcastAnnouncement?: (audience: string, msg: string) => void;
  onOpenAddUser?: () => void;
  onOpenUserManagement?: () => void;
}

export const TpoCommandCenter: React.FC<TpoCommandCenterProps> = ({
  stats,
  drives,
  students,
  mous,
  approvalRequests,
  conflicts,
  onSelectDrive,
  onNavigateTab,
  onApproveRequest,
  onRejectRequest,
  onBroadcastAnnouncement,
  onOpenAddUser,
  onOpenUserManagement
}) => {
  const { registeredUsers, user: currentUser, loginWithAccount, deleteActualUser } = useAuth();
  const [activeSubView, setActiveSubView] = useState<
    'overview' | 'drives' | 'companies' | 'eligibility' | 'branches' | 'approvals' | 'reports' | 'coordinators'
  >('overview');

  // Eligibility Engine interactive state
  const [minCgpa, setMinCgpa] = useState<number>(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    'CSE',
    'IT',
    'AI&DS',
    'ECE'
  ]);
  const [selectedBatchYear, setSelectedBatchYear] = useState<string>('2026');
  const [shortlistedCountNotice, setShortlistedCountNotice] = useState<string | null>(null);

  // Quick broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState('All 2026 Batch');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Approvals local state
  const [localApprovals, setLocalApprovals] = useState(approvalRequests);

  // AI Statutory Report State & Handlers
  const [isGeneratingStatutory, setIsGeneratingStatutory] = useState(false);
  const [statutoryReport, setStatutoryReport] = useState<any>(null);

  const handleGenerateStatutory = async () => {
    setIsGeneratingStatutory(true);
    try {
      const res = await fetch('/api/gemini/generate-statutory-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academicYear: '2025-2026',
          department: 'All Departments',
          stats
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatutoryReport(data);
      }
    } catch (err) {
      console.error('Error generating statutory report:', err);
    } finally {
      setIsGeneratingStatutory(false);
    }
  };

  const handleDownloadStatutoryCsv = () => {
    if (!statutoryReport?.csvData) return;
    const blob = new Blob([statutoryReport.csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAMPUSLINK_NIRF_NAAC_Accreditation_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate live eligible pool based on engine criteria
  const eligibleStudentsPool = students.filter((s) => {
    return (
      s.cgpa >= minCgpa &&
      s.activeBacklogs <= maxBacklogs &&
      selectedBranches.includes(s.branch)
    );
  });

  const handleBranchToggle = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleRunAutoShortlist = () => {
    setShortlistedCountNotice(
      `Engine auto-shortlisted ${eligibleStudentsPool.length} verified students across ${selectedBranches.join(
        ', '
      )} meeting CGPA ≥ ${minCgpa} and Backlogs ≤ ${maxBacklogs}.`
    );
    setTimeout(() => setShortlistedCountNotice(null), 5000);
  };

  const handleApprove = (id: string) => {
    setLocalApprovals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    if (onApproveRequest) onApproveRequest(id);
  };

  const handleReject = (id: string) => {
    setLocalApprovals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    if (onRejectRequest) onRejectRequest(id);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    if (onBroadcastAnnouncement) {
      onBroadcastAnnouncement(broadcastTarget, broadcastMessage);
    }
    setBroadcastSent(true);
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSent(false), 3500);
  };

  // Branch analytics calculations
  const branchList = [
    { name: 'CSE', total: 150, placed: 138, pct: 92.0, target: 95, lag: false, avgLPA: 12.4 },
    { name: 'IT', total: 90, placed: 81, pct: 90.0, target: 90, lag: false, avgLPA: 10.8 },
    { name: 'AI&DS', total: 60, placed: 52, pct: 86.6, target: 90, lag: false, avgLPA: 10.1 },
    { name: 'ECE', total: 80, placed: 62, pct: 77.5, target: 85, lag: true, gap: '-7.5%', avgLPA: 7.9 },
    { name: 'EEE', total: 40, placed: 27, pct: 67.5, target: 80, lag: true, gap: '-12.5%', avgLPA: 6.8 },
    { name: 'Mechanical', total: 60, placed: 36, pct: 60.0, target: 75, lag: true, gap: '-15.0%', avgLPA: 5.8 }
  ];

  const unplacedCount = students.filter((s) => s.placementStatus === 'Unplaced').length;
  const inProcessCount = students.filter(
    (s) => s.placementStatus === 'Shortlisted' || s.placementStatus === 'Interviewing'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top TPO Command Header */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                T&P Lead Command Center
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Season 2025-26 Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Institutional Placement Headquarters
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time executive oversight: tracking registered cohorts, ongoing corporate hiring rounds,
              MoUs, department parity, and AI-flagged at-risk interventions.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => setActiveSubView('reports')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>NIRF / NAAC Export</span>
            </button>
            <button
              onClick={() => onNavigateTab('scheduler')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Manage Conflicts ({conflicts.length})</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Registered
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{stats.totalEligible}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Eligible Batch</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Placed
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{stats.totalPlaced}</span>
            <span className="text-[10px] text-emerald-300 block font-semibold">{stats.placementRate}% Rate</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              In Process
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-400">{inProcessCount}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Active Rounds</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Unplaced
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400">{unplacedCount}</span>
            <span className="text-[10px] text-amber-300 block font-semibold">Triage Focus</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Highest CTC
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">₹{stats.highestPackageLPA}</span>
            <span className="text-[10px] text-slate-400 block font-medium">LPA</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Average CTC
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">₹{stats.avgPackageLPA}</span>
            <span className="text-[10px] text-slate-400 block font-medium">LPA</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Median CTC
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-300">
              ₹{stats.medianPackageLPA || 7.8}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">LPA</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Offers
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{stats.totalOffers}</span>
            <span className="text-[10px] text-slate-400 block font-medium">Issued Letters</span>
          </div>
        </div>

        {/* Sub-View Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'overview', label: 'Drive Pipeline & Status', icon: Briefcase },
            { id: 'eligibility', label: 'Eligibility & Auto-Shortlist Engine', icon: Sliders },
            { id: 'companies', label: 'Company Management & MoUs', icon: Building2, count: mous.length },
            { id: 'branches', label: 'Branch Analytics & Gap View', icon: TrendingUp },
            { id: 'approvals', label: 'Approvals Queue', icon: FileCheck2, count: localApprovals.filter(a => a.status === 'Pending TPO').length },
            { id: 'reports', label: 'NIRF / AICTE Reports', icon: FileSpreadsheet },
            { id: 'coordinators', label: 'Role & Coordinator Access', icon: Users }
          ].map((sub) => {
            const Icon = sub.icon;
            const isSelected = activeSubView === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubView(sub.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.label}</span>
                {sub.count !== undefined && sub.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-900">
                    {sub.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. DRIVE PIPELINE WITH ROUND-WISE STATUS */}
      {activeSubView === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Corporate Drive Pipeline & Round-Wise Tracker
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time status across upcoming, active, and completed placement sessions.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('drives')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1"
              >
                <span>View All Drives Hub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {drives.map((drive) => (
                <div
                  key={drive.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                      {drive.logo || drive.companyName.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {drive.companyName}
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          ₹{drive.ctcLPA} LPA
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {drive.roleTitle} • Drive Date: {drive.driveDate}
                      </p>
                    </div>
                  </div>

                  {/* Round indicators */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {drive.rounds.map((rnd, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center"
                      >
                        <span className="text-[9px] text-slate-400 block font-semibold">R{idx + 1}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px] truncate max-w-[80px] block">
                          {rnd.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        drive.status === 'Assessment Active' || drive.status === 'Interviews Ongoing'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                          : drive.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {drive.status}
                    </span>

                    {onSelectDrive && (
                      <button
                        onClick={() => onSelectDrive(drive.id)}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                        title="Open in Matching & Review"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ELIGIBILITY ENGINE & AUTO-SHORTLISTER */}
      {activeSubView === 'eligibility' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Institutional Eligibility Engine & Auto-Shortlisting Tool
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure multi-attribute recruitment cutoffs and instantly calculate verified cohort eligibility.
                </p>
              </div>
            </div>

            {shortlistedCountNotice && (
              <div className="p-3 my-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{shortlistedCountNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
              {/* CGPA Slider */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Minimum CGPA</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{minCgpa.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="9.5"
                  step="0.1"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Adjust cutoff threshold</span>
              </div>

              {/* Max Backlogs */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Max Active Backlogs</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">{maxBacklogs}</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  {[0, 1, 2].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxBacklogs(num)}
                      className={`flex-1 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                        maxBacklogs === num
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                      }`}
                    >
                      {num === 0 ? 'Strict 0' : `≤ ${num}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch Year */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Graduation Batch
                </span>
                <select
                  value={selectedBatchYear}
                  onChange={(e) => setSelectedBatchYear(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="2026">2026 Passing Out Batch</option>
                  <option value="2025">2025 Placement Alumni</option>
                  <option value="2027">2027 Pre-Final Year (Internships)</option>
                </select>
              </div>

              {/* Live Count Result */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center flex flex-col justify-center">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                  Verified Eligible Pool
                </span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {eligibleStudentsPool.length}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                  Ready for 1-Click Shortlist
                </span>
              </div>
            </div>

            {/* Branch Checkboxes */}
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Eligible Branches:
              </span>
              <div className="flex flex-wrap gap-2">
                {['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical', 'Civil'].map((br) => {
                  const isChecked = selectedBranches.includes(br);
                  return (
                    <button
                      key={br}
                      type="button"
                      onClick={() => handleBranchToggle(br)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                      <span>{br}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Calculated in real-time against verified student APAAR database records.
              </span>
              <button
                onClick={handleRunAutoShortlist}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Shortlist &amp; Lock Eligible Cohort</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPANY MANAGEMENT & MOUS */}
      {activeSubView === 'companies' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Corporate Partnership &amp; MoU Registry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track multi-year hiring memorandums, minimum hire commitments, and corporate outreach.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {mous.length} Institutional MoUs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mous.map((mou) => (
                <div
                  key={mou.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {mou.companyName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mou.status === 'Active MoU'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {mou.status}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-2">
                      {mou.tier}
                    </span>

                    <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between">
                        <span>MoU Validity:</span>
                        <span className="font-semibold">{mou.validUntil}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Hires:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {mou.actualHiresThisYear} / {mou.targetHires} Hires
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Corporate POC:</span>
                        <span className="font-semibold truncate max-w-[140px]">{mou.pocName}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    "{mou.notes}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. BRANCH ANALYTICS & GAP VIEW */}
      {activeSubView === 'branches' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Department Placement % &amp; Branch Gap Diagnostic
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Identify lagging engineering disciplines and recommend targeted remediation drives.
            </p>

            <div className="space-y-4">
              {branchList.map((b) => (
                <div
                  key={b.name}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-slate-900 dark:text-white text-sm w-24">
                        {b.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {b.placed} / {b.total} Placed ({b.pct.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Avg: ₹{b.avgLPA} LPA
                      </span>
                      {b.lag ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] border border-rose-300">
                          Lagging Target ({b.gap})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                          Target Met ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${b.lag ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>

                  {b.lag && (
                    <div className="pt-1 text-[11px] text-amber-700 dark:text-amber-400 flex items-center justify-between">
                      <span>
                        💡 Intervention: Schedule core embedded/industrial automation drives for {b.name}.
                      </span>
                      <button
                        onClick={() => onNavigateTab('at-risk')}
                        className="font-bold underline cursor-pointer"
                      >
                        Launch Remedial Clinic →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. APPROVALS QUEUE */}
      {activeSubView === 'approvals' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              TPO Approvals &amp; Clearance Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Requests submitted by Department Coordinators requiring final executive authorization.
            </p>

            <div className="space-y-3">
              {localApprovals.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold text-[10px]">
                        {req.requestType}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {req.companyName}
                      </span>
                      <span className="text-slate-400">• {req.submittedAt}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">{req.description}</p>
                    <p className="text-[10px] text-slate-400">Submitted by: {req.requestedBy}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {req.status === 'Pending TPO' ? (
                      <>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-xl font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. REPORTS & EXPORTS */}
      {activeSubView === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                NIRF, NAAC &amp; AICTE Statutory Placement Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-Click compliant tabular extracts ready for accreditation filing and governance review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  NIRF 2026 Engineering Data
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total graduates, number of placed students, median salary (₹7.8 LPA), students selected for higher studies.
                </p>
                <button
                  onClick={handleGenerateStatutory}
                  disabled={isGeneratingStatutory}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  {isGeneratingStatutory ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate NIRF Table</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  NAAC Criterion 5.2.1 Matrix
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Employer details, appointment letter verification hashes, and package distributions.
                </p>
                <button
                  onClick={handleGenerateStatutory}
                  disabled={isGeneratingStatutory}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  {isGeneratingStatutory ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate NAAC Deck</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  AICTE Mandatory Disclosure
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Comprehensive audit extract linking verified APAAR credits, academic backlog clearances, and median CTCs.
                </p>
                <button
                  onClick={handleGenerateStatutory}
                  disabled={isGeneratingStatutory}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  {isGeneratingStatutory ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run AICTE Audit Extract</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Statutory Report Output */}
            {statutoryReport && (
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-4 text-xs animate-fade-in mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200 dark:border-indigo-800/80">
                  <div className="flex items-center space-x-3">
                    <span className="p-2 rounded-xl bg-indigo-600 text-white">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">
                        Official AICTE &amp; NBA Auditor Verdict
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        Compliance Rating: {statutoryReport.complianceGrade}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadStatutoryCsv}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official Accreditation CSV</span>
                  </button>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {statutoryReport.auditorStatement}
                  </p>
                  {statutoryReport.executiveNarrative && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      {statutoryReport.executiveNarrative}
                    </p>
                  )}
                </div>

                {statutoryReport.formattedTable && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left bg-white dark:bg-slate-900">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3">Eligible</th>
                          <th className="py-2.5 px-3">Placed</th>
                          <th className="py-2.5 px-3">Placement %</th>
                          <th className="py-2.5 px-3">Avg LPA</th>
                          <th className="py-2.5 px-3">Highest LPA</th>
                          <th className="py-2.5 px-3">Accreditation Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                        {statutoryReport.formattedTable.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.department}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{row.eligible}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold">{row.placed}</td>
                            <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">{row.placementPercentage}%</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300">₹{row.avgLpa} L</td>
                            <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">₹{row.highestLpa} L</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                {row.complianceStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. ROLE, ACTUAL USERS & COORDINATOR ACCESS */}
      {activeSubView === 'coordinators' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Users Management Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Actual Users &amp; Team Management</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60">
                    {registeredUsers.length} Users Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage real user accounts, configure role permissions, and test user sessions.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {onOpenAddUser && (
                  <button
                    onClick={onOpenAddUser}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Actual User</span>
                  </button>
                )}
                {onOpenUserManagement && (
                  <button
                    onClick={onOpenUserManagement}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Directory
                  </button>
                )}
              </div>
            </div>

            {/* List of Registered Users */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Live Registered Accounts in Database
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {registeredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isActual = Boolean(u.isActualUser || u.email.toLowerCase() === 'singhs54314@gmail.com');
                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                              {u.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {u.role}
                            </span>
                            {isActual && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Actual
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {u.email}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {u.title} • {u.org}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        {!isCurrent ? (
                          <button
                            onClick={() => loginWithAccount(u)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                            title="Log in as this user"
                          >
                            <LogIn className="w-3 h-3" />
                            <span>Switch</span>
                          </button>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold">
                            Active
                          </span>
                        )}

                        {isActual && u.id !== 'usr-singh-01' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete user ${u.name}?`)) {
                                deleteActualUser(u.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Department Faculty Coordinators & Ground Ops Access */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Faculty Coordinators &amp; Access Control
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Departmental leads configured with ground operations access to attendance, remedial clinics, and eligibility waivers.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: 'Prof. Shalini Rao', dept: 'CSE & IT Lead Coordinator', permissions: 'Full Ground Ops + Pre-Talks + Remedial Triage', status: 'Active' },
                { name: 'Dr. Venkat Raman', dept: 'ECE Coordinator', permissions: 'Attendance QR + Document Pre-check', status: 'Active' },
                { name: 'Prof. Anitha Murthy', dept: 'Mechanical Coordinator', permissions: 'Remedial Clinics Only', status: 'Active' }
              ].map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{c.dept}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{c.permissions}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
