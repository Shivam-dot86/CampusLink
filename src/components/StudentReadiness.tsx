import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Code2,
  Github,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Clock,
  Send,
  Loader2,
  Fingerprint,
  Building2,
  Briefcase,
  ExternalLink,
  GraduationCap,
  ShieldCheck,
  Radio,
  FileCheck,
  RefreshCw,
  Download,
  QrCode,
  Lock,
  Check
} from 'lucide-react';
import { StudentProfile, StudentBranch, ReadinessTier } from '../types';

interface StudentReadinessProps {
  students: StudentProfile[];
  onOpenMatchForStudent?: (studentId: string) => void;
  onOpenPlacementReady?: (studentId: string) => void;
  onUpdateStudent?: (student: StudentProfile) => void;
}

export const StudentReadiness: React.FC<StudentReadinessProps> = ({
  students,
  onOpenMatchForStudent,
  onOpenPlacementReady,
  onUpdateStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedPlacementStatus, setSelectedPlacementStatus] = useState<string>('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Modal Sub-Tab
  const [modalTab, setModalTab] = useState<'apaar' | 'internships' | 'programs' | 'projects' | 'resume' | 'ai-plan'>('apaar');

  // AI Gap Analysis State
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [targetRoleDomain, setTargetRoleDomain] = useState('Cloud & Full-Stack Solutions');

  // DigiLocker Link & Sync State
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [digiLockerStep, setDigiLockerStep] = useState<'input' | 'otp' | 'syncing' | 'success'>('input');
  const [inputApaarId, setInputApaarId] = useState('');
  const [inputAbcId, setInputAbcId] = useState('');
  const [inputUniversity, setInputUniversity] = useState('Visvesvaraya Technological University (VTU)');
  const [inputConsent, setInputConsent] = useState(true);
  const [inputOtp, setInputOtp] = useState('842910');
  const [syncStepIndex, setSyncStepIndex] = useState(0);
  const [showPrintableCard, setShowPrintableCard] = useState<StudentProfile | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const handleOpenDigiLockerSync = (student?: StudentProfile) => {
    const target = student || (selectedStudent || students[0]);
    if (target) {
      setTargetStudentId(target.id);
      setInputApaarId(target.apaarRecord?.apaarId || '9842-1049-3821');
      setInputAbcId(target.apaarRecord?.abcId || 'ABC-849-204-192');
      setInputUniversity(target.apaarRecord?.collegeAffiliation || 'Visvesvaraya Technological University (VTU)');
      setInputConsent(true);
      setInputOtp('842910');
      setDigiLockerStep('input');
      setIsDigiLockerModalOpen(true);
    }
  };

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputApaarId || !inputConsent) return;
    setDigiLockerStep('otp');
  };

  const handleStartDigiLockerSync = () => {
    setDigiLockerStep('syncing');
    setSyncStepIndex(1);

    setTimeout(() => setSyncStepIndex(2), 600);
    setTimeout(() => setSyncStepIndex(3), 1300);
    setTimeout(() => {
      setSyncStepIndex(4);
      const target = students.find((s) => s.id === targetStudentId);
      if (target) {
        const todayStr = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const currentEarned = target.apaarRecord?.totalCreditsEarned || 134;
        const newCredits = Math.min(target.apaarRecord?.totalCreditsRequired || 160, currentEarned + 4);

        const updatedStudent: StudentProfile = {
          ...target,
          readinessScore: Math.min(100, target.readinessScore + 3),
          tier: (target.readinessScore + 3 >= 85) ? 'Corporate Ready' : target.tier,
          apaarRecord: {
            ...target.apaarRecord,
            apaarId: inputApaarId,
            abcId: inputAbcId || `ABC-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
            collegeAffiliation: inputUniversity,
            digiLockerVerified: true,
            creditTransferStatus: 'Fully Synchronized',
            lastSyncDate: `${todayStr} (DigiLocker Authenticated)`,
            totalCreditsEarned: newCredits,
          }
        };

        if (onUpdateStudent) {
          onUpdateStudent(updatedStudent);
        }
        if (selectedStudent && selectedStudent.id === updatedStudent.id) {
          setSelectedStudent(updatedStudent);
        }
        setSyncSuccessMessage(
          `Verified & Synced with National Academic Depository! ${updatedStudent.name}'s credit total is now ${newCredits} Credits.`
        );
      }
      setDigiLockerStep('success');
    }, 2100);
  };

  const branches: StudentBranch[] = ['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical'];
  const tiers: ReadinessTier[] = ['Corporate Ready', 'Near Ready', 'Needs Training', 'At Risk'];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.apaarRecord?.apaarId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.apaarRecord?.abcId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skills.some((sk) => sk.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBranch = selectedBranch === 'All' || s.branch === selectedBranch;
    const matchesTier = selectedTier === 'All' || s.tier === selectedTier;
    const matchesStatus = selectedPlacementStatus === 'All' || s.placementStatus === selectedPlacementStatus;
    return matchesSearch && matchesBranch && matchesTier && matchesStatus;
  });

  const generateAiInterventionPlan = async (student: StudentProfile) => {
    setIsGeneratingPlan(true);
    setAiPlan(null);
    try {
      const res = await fetch('/api/gemini/skill-gap-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          targetDomain: targetRoleDomain,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setAiPlan(data.plan);
      }
    } catch (err) {
      console.error('Error generating AI plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Student Readiness Index &amp; 360° APAAR Portfolios</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              {students.length} Profiles Tracked
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            APAAR Academic Bank of Credits (ABC), Internships, Programs, ATS Resumes, Projects &amp; Placement Pre-Talk Records.
          </p>
        </div>

        {/* Tier Summary Pills & DigiLocker Trigger */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => handleOpenDigiLockerSync()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs hover:shadow transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sync DigiLocker APAAR</span>
          </button>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
            Ready: {students.filter((s) => s.tier === 'Corporate Ready').length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800">
            Near: {students.filter((s) => s.tier === 'Near Ready').length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-800">
            Needs Training: {students.filter((s) => s.tier === 'Needs Training').length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800">
            At Risk: {students.filter((s) => s.tier === 'At Risk').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student, USN, APAAR ID (e.g. 9842), skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Branch selector */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Readiness Tier selector */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Readiness Tiers</option>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Placement Status selector */}
          <select
            value={selectedPlacementStatus}
            onChange={(e) => setSelectedPlacementStatus(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Placement Statuses</option>
            <option value="Offered">Offered</option>
            <option value="Joined">Joined</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Unplaced">Unplaced</option>
          </select>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((s) => {
          return (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-700">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</h3>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{s.usn}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{s.branch}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.tier === 'Corporate Ready'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : s.tier === 'Near Ready'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : s.tier === 'Needs Training'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {s.tier}
                    </span>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                      {s.readinessScore}
                      <span className="text-[10px] font-normal text-slate-400">/100</span>
                    </div>
                  </div>
                </div>

                {/* APAAR ID & ABC ID pill */}
                <div className="mt-2.5 p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-[11px]">
                  <span className="flex items-center space-x-1 text-emerald-900 dark:text-emerald-300 font-mono font-medium">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>APAAR: {s.apaarRecord.apaarId}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded">
                    {s.apaarRecord.totalCreditsEarned} Credits
                  </span>
                </div>

                {/* Metrics Pill Row */}
                <div className="grid grid-cols-4 gap-1 py-2.5 my-2 border-y border-slate-100 dark:border-slate-800 text-center">
                  <div className="bg-slate-50/80 dark:bg-slate-800/60 p-1 rounded">
                    <span className="text-[9px] text-slate-400 block">CGPA</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.cgpa}</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-800/60 p-1 rounded">
                    <span className="text-[9px] text-slate-400 block">LeetCode</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.leetcodeSolved}</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-800/60 p-1 rounded">
                    <span className="text-[9px] text-slate-400 block">Internships</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.internships?.length || 0}</span>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-800/60 p-1 rounded">
                    <span className="text-[9px] text-slate-400 block">ATS Score</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{s.resume?.atsScore || 80}%</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Skills &amp; Projects
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {s.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk.name}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {sk.name}
                      </span>
                    ))}
                    {s.skills.length > 3 && (
                      <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                        +{s.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedStudent(s);
                    setModalTab('apaar');
                    setAiPlan(null);
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-semibold py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center space-x-1"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>APAAR 360°</span>
                </button>

                {onOpenPlacementReady && (
                  <button
                    onClick={() => onOpenPlacementReady(s.id)}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold"
                    title="Open Placement Readiness Accelerator"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}

                {s.isAtRisk && (
                  <span
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                    title="Flagged on At-Risk Radar"
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 360° Student Assessment & APAAR Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors animate-modal-pop">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 flex items-start justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {selectedStudent.usn}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedStudent.tier === 'Corporate Ready'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : selectedStudent.tier === 'Near Ready'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                          : selectedStudent.tier === 'Needs Training'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {selectedStudent.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedStudent.branch} • {selectedStudent.email} • {selectedStudent.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Navigator */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 dark:bg-slate-900/60 px-6 flex space-x-3 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setModalTab('apaar')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 transition ${
                  modalTab === 'apaar'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>APAAR ID &amp; Academic History</span>
              </button>
              <button
                onClick={() => setModalTab('internships')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 transition ${
                  modalTab === 'internships'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Internships ({selectedStudent.internships?.length || 0})</span>
              </button>
              <button
                onClick={() => setModalTab('programs')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 transition ${
                  modalTab === 'programs'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Programs &amp; Certifications</span>
              </button>
              <button
                onClick={() => setModalTab('projects')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 transition ${
                  modalTab === 'projects'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Portfolio Projects</span>
              </button>
              <button
                onClick={() => setModalTab('resume')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 transition ${
                  modalTab === 'resume'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>ATS Resume &amp; Pre-Talks</span>
              </button>
              <button
                onClick={() => setModalTab('ai-plan')}
                className={`py-3 border-b-2 flex items-center space-x-1.5 transition ${
                  modalTab === 'ai-plan'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Remedial Plan</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs">
              {/* Tab 1: APAAR Academic Bank of Credits */}
              {modalTab === 'apaar' && (
                <div className="space-y-5">
                  {/* Digital APAAR Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-slate-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                          <Fingerprint className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black tracking-wider text-emerald-400">
                              APAAR / ACADEMIC BANK OF CREDITS
                            </span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              DigiLocker Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Ministry of Education, Govt. of India • National Academic Depository
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Status</span>
                        <span className="text-xs font-bold text-emerald-400">
                          {selectedStudent.apaarRecord.creditTransferStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">APAAR ID</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {selectedStudent.apaarRecord.apaarId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">ABC ID (NAD)</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {selectedStudent.apaarRecord.abcId}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Credits Earned</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          {selectedStudent.apaarRecord.totalCreditsEarned} / {selectedStudent.apaarRecord.totalCreditsRequired}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">University Reg No</span>
                        <span className="font-mono text-white text-sm font-bold">
                          {selectedStudent.apaarRecord.universityRegNo}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                      <div className="text-[11px] text-slate-400 space-y-0.5">
                        <div>Affiliation: {selectedStudent.apaarRecord.collegeAffiliation}</div>
                        <div className="flex items-center space-x-1.5">
                          <span>Last DigiLocker Sync:</span>
                          <span className="text-emerald-400 font-semibold">{selectedStudent.apaarRecord.lastSyncDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenDigiLockerSync(selectedStudent)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Re-Sync DigiLocker</span>
                        </button>
                        <button
                          onClick={() => setShowPrintableCard(selectedStudent)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Official Card</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Semester Progression Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                      Semester-by-Semester Academic History &amp; SGPA Progression
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {selectedStudent.apaarRecord.semesterRecords.map((sem) => (
                        <div
                          key={sem.semester}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center"
                        >
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                            Semester {sem.semester}
                          </span>
                          <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                            {sem.sgpa.toFixed(2)}
                          </span>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            {sem.creditsEarned} Credits
                          </div>
                          <span
                            className={`mt-1 inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              sem.backlogs > 0 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {sem.backlogs > 0 ? `${sem.backlogs} Backlog` : 'Cleared'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schooling Records */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">10th Standard / Matriculation</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.tenthPercentage}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">12th Standard / Pre-University</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudent.twelfthPercentage}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Internships */}
              {modalTab === 'internships' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Corporate Internships &amp; Practical Industry Deployments
                  </h4>

                  {selectedStudent.internships && selectedStudent.internships.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.internships.map((intern) => (
                        <div
                          key={intern.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                {intern.company} • <span className="text-indigo-700 dark:text-indigo-300">{intern.role}</span>
                              </h5>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Verified Certificate
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{intern.duration}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Stipend: {intern.stipend}</span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{intern.description}</p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {intern.skillsUsed.map((sk) => (
                              <span key={sk} className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                      No prior corporate internships recorded. Enrolled in Rooman Virtual Internship Clinic.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Value-Added Programs & Certifications */}
              {modalTab === 'programs' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Rooman Institutional Programs &amp; Professional Certifications
                  </h4>

                  <div className="space-y-3">
                    {selectedStudent.programs && selectedStudent.programs.length > 0 ? (
                      selectedStudent.programs.map((prog) => (
                        <div
                          key={prog.id}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs">{prog.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {prog.provider} • Completed: {prog.completionDate} • ID: {prog.credentialId}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {prog.scoreOrGrade}
                          </span>
                        </div>
                      ))
                    ) : null}

                    {selectedStudent.certifications.map((cert) => (
                      <div
                        key={cert}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-800 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cert}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Verified by Placement Cell</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Projects & Systems */}
              {modalTab === 'projects' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Full-Stack &amp; Systems Engineering Projects
                  </h4>

                  <div className="space-y-3">
                    {(selectedStudent.projects || []).map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                              {proj.domain}
                            </span>
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{proj.title}</h5>
                          </div>

                          <div className="flex items-center space-x-2">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {proj.demoUrl && (
                              <a
                                href={proj.demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{proj.description}</p>

                        {proj.impact && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-[11px]">
                            <span className="font-bold">Measurable Impact: </span>
                            {proj.impact}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {proj.tech.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: ATS Resume & Pre-Placement Talks */}
              {modalTab === 'resume' && (
                <div className="space-y-5">
                  {/* ATS Intelligence Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                        <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>ATS Resume Parser &amp; Keyword Match</span>
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ATS Score: {selectedStudent.resume?.atsScore || 85}/100
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 italic">
                      "{selectedStudent.resume?.summary || 'No summary text provided.'}"
                    </p>

                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                        Matched Recruiter Keywords:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedStudent.resume?.keyKeywordsMatched?.map((kw) => (
                          <span
                            key={kw}
                            className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedStudent.resume?.missingKeywords && selectedStudent.resume.missingKeywords.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 uppercase block mb-1">
                          Recommended Missing Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {selectedStudent.resume?.missingKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md"
                            >
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pre-Placement Talks Attended */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Placement Pre-Talks (PPT) Attended ({selectedStudent.prePlacementTalksAttended?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {(selectedStudent.prePlacementTalksAttended || []).map((talkId) => (
                        <div
                          key={talkId}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                            <Radio className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Orientation Code: {talkId}</span>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center text-[11px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Attendance Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: AI Remedial Plan */}
              {modalTab === 'ai-plan' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">4-Week Remedial Acceleration Sprint</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Tailored interventions to close specific DSA, system design, or communication gaps.
                      </p>
                    </div>

                    <button
                      onClick={() => generateAiInterventionPlan(selectedStudent)}
                      disabled={isGeneratingPlan}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs flex items-center space-x-1 hover:bg-indigo-700 transition cursor-pointer"
                    >
                      {isGeneratingPlan ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Regenerate AI Plan</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiPlan ? (
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiPlan.summaryVerdict}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {aiPlan.fourWeekActionPlan?.map((wk: any) => (
                          <div key={wk.week} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="font-bold text-indigo-700 dark:text-indigo-400">Week {wk.week}: {wk.focus}</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{wk.deliverable}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                      Click "Regenerate AI Plan" to formulate an intervention roadmap for {selectedStudent.name}.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* DigiLocker APAAR Link & Verification Studio Modal */}
      {isDigiLockerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-modal-pop text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold tracking-tight">DigiLocker APAAR Sync Gateway</h3>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                      Govt of India / NAD
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/80">
                    National Academic Depository &amp; Academic Bank of Credits Integration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDigiLockerModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className={`flex items-center space-x-1.5 font-semibold ${digiLockerStep === 'input' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${digiLockerStep === 'input' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>1</span>
                <span>APAAR Details</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">→</span>
              <div className={`flex items-center space-x-1.5 font-semibold ${digiLockerStep === 'otp' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${digiLockerStep === 'otp' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>2</span>
                <span>Aadhaar e-KYC</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">→</span>
              <div className={`flex items-center space-x-1.5 font-semibold ${digiLockerStep === 'syncing' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${digiLockerStep === 'syncing' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>3</span>
                <span>NAD Pull</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">→</span>
              <div className={`flex items-center space-x-1.5 font-semibold ${digiLockerStep === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${digiLockerStep === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>4</span>
                <span>Verified</span>
              </div>
            </div>

            {/* Step 1: Input Details */}
            {digiLockerStep === 'input' && (
              <form onSubmit={handleProceedToOtp} className="p-6 space-y-4">
                {/* Select Student */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Candidate
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => {
                      setTargetStudentId(e.target.value);
                      const std = students.find((s) => s.id === e.target.value);
                      if (std) {
                        setInputApaarId(std.apaarRecord?.apaarId || '9842-1049-3821');
                        setInputAbcId(std.apaarRecord?.abcId || 'ABC-849-204-192');
                        setInputUniversity(std.apaarRecord?.collegeAffiliation || 'Visvesvaraya Technological University (VTU)');
                      }
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.usn} • {s.branch}) - Current APAAR: {s.apaarRecord?.apaarId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* APAAR ID (12-digit) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      12-Digit APAAR ID (One Nation One Student ID)
                    </label>
                    <span className="text-[10px] text-emerald-600 font-mono">Format: XXXX-XXXX-XXXX</span>
                  </div>
                  <div className="relative">
                    <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9842-1049-3821"
                      value={inputApaarId}
                      onChange={(e) => setInputApaarId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 font-mono text-sm tracking-wider rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* ABC ID & University */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Academic Bank of Credits (ABC) ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABC-849-204-192"
                      value={inputAbcId}
                      onChange={(e) => setInputAbcId(e.target.value)}
                      className="w-full px-3 py-2 font-mono text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Affiliated University / Board
                    </label>
                    <select
                      value={inputUniversity}
                      onChange={(e) => setInputUniversity(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Visvesvaraya Technological University (VTU)">Visvesvaraya Technological University (VTU)</option>
                      <option value="Anna University, Chennai">Anna University, Chennai</option>
                      <option value="Jawaharlal Nehru Technological University (JNTU)">JNTU Hyderabad / Kakinada</option>
                      <option value="Delhi Technological University (DTU)">Delhi Technological University (DTU)</option>
                      <option value="University of Mumbai">University of Mumbai</option>
                      <option value="Autonomous Engineering College Depository">Autonomous Institute Autonomous Depository</option>
                    </select>
                  </div>
                </div>

                {/* Mandatory Regulatory Consent */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5">
                  <label className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputConsent}
                      onChange={(e) => setInputConsent(e.target.checked)}
                      className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-snug">
                      <strong>Digital Consent Authorization:</strong> I authorize CampusLink to query DigiLocker &amp; National Academic Depository (NAD) via API under Section 43A of Information Technology Act 2000 to fetch authentic semester transcripts, ABC credits, and degree verification.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsDigiLockerModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!inputConsent || !inputApaarId}
                    className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <span>Proceed to Aadhaar e-KYC</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Simulated Aadhaar e-KYC OTP */}
            {digiLockerStep === 'otp' && (
              <div className="p-6 space-y-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    DigiLocker OTP Authentication
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    A 6-digit verification code has been transmitted to the Aadhaar-registered mobile number ending in <strong>•••• 4821</strong>.
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value)}
                    className="w-full text-center tracking-[0.4em] font-mono text-xl font-black py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="842910"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Valid for: <strong className="text-emerald-600">04:48 min</strong></span>
                    <button
                      type="button"
                      onClick={() => setInputOtp('842910')}
                      className="text-emerald-600 hover:underline font-semibold"
                    >
                      Autofill Demo OTP
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDigiLockerStep('input')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStartDigiLockerSync}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize &amp; Sync Credits</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Live Verification & Syncing Animation */}
            {digiLockerStep === 'syncing' && (
              <div className="p-8 space-y-6 text-center">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-950 border-t-emerald-600 animate-spin" />
                  <Fingerprint className="w-7 h-7 text-emerald-600" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Interfacing with National Academic Depository...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Authenticating credentials via Ministry of Education DigiLocker Gateway
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 text-left bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className={`flex items-center space-x-2 ${syncStepIndex >= 1 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-4 h-4 ${syncStepIndex >= 1 ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Connecting to <code className="text-[11px]">api.digitallocker.gov.in</code> gateway</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${syncStepIndex >= 2 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-4 h-4 ${syncStepIndex >= 2 ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Pulling XML transcript for APAAR: <strong>{inputApaarId}</strong></span>
                  </div>
                  <div className={`flex items-center space-x-2 ${syncStepIndex >= 3 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-4 h-4 ${syncStepIndex >= 3 ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Verifying SHA-256 Digital Signature from Certifying Authority (NIC)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${syncStepIndex >= 4 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    <Check className={`w-4 h-4 ${syncStepIndex >= 4 ? 'opacity-100' : 'opacity-30'}`} />
                    <span>Updating Academic Bank of Credits (ABC) &amp; Semester CGPA Ledger</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Verification Success Confirmation */}
            {digiLockerStep === 'success' && (
              <div className="p-6 space-y-5 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">
                    APAAR ID Verified &amp; Synchronized!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                    {syncSuccessMessage || `National Academic Depository records successfully updated with active semester credits.`}
                  </p>
                </div>

                {/* Digital Proof Summary Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-left text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      Academic Bank of Credits • DigiLocker Verified
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Fully Synchronized
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">APAAR ID</span>
                      <span className="font-mono font-bold text-white text-sm">{inputApaarId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ABC ID (NAD)</span>
                      <span className="font-mono font-bold text-white text-sm">{inputAbcId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDigiLockerModalOpen(false);
                      const std = students.find((s) => s.id === targetStudentId);
                      if (std) setShowPrintableCard(std);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View Official Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDigiLockerModalOpen(false)}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Close &amp; Return
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Printable DigiLocker APAAR Digital Card Modal */}
      {showPrintableCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-300 dark:border-slate-800 animate-modal-pop text-slate-900 dark:text-white">
            {/* National Identity Header Strip with Indian Tricolor accents */}
            <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
            <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase block">
                    GOVERNMENT OF INDIA • MINISTRY OF EDUCATION
                  </span>
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    AUTOMATED PERMANENT ACADEMIC ACCOUNT REGISTRY
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    National Academic Depository (NAD) &amp; Academic Bank of Credits
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPrintableCard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
              {/* Candidate Info with Photo & QR */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-black text-xl flex items-center justify-center border-2 border-slate-300 dark:border-slate-700 shadow-xs">
                    {showPrintableCard.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{showPrintableCard.name}</h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">USN: {showPrintableCard.usn}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{showPrintableCard.branch} Engineering • CGPA: {showPrintableCard.cgpa}</p>
                    <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 mr-1" /> DigiLocker Verified
                    </span>
                  </div>
                </div>

                {/* Simulated QR Code for DigiLocker validation */}
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center shadow-xs">
                  <QrCode className="w-16 h-16 text-slate-800 dark:text-slate-200 mx-auto" />
                  <span className="text-[8px] font-mono font-bold text-slate-500 dark:text-slate-400 block mt-0.5">SCAN TO VERIFY</span>
                </div>
              </div>

              {/* APAAR & ABC Identifiers */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-900 dark:bg-slate-950 rounded-2xl text-white border border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">12-Digit APAAR ID</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400 tracking-wider">
                    {showPrintableCard.apaarRecord.apaarId}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">ABC Account ID</span>
                  <span className="font-mono text-base font-extrabold text-indigo-300 tracking-wider">
                    {showPrintableCard.apaarRecord.abcId}
                  </span>
                </div>
              </div>

              {/* Credit Status & Affiliation */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Credits</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {showPrintableCard.apaarRecord.totalCreditsEarned} / {showPrintableCard.apaarRecord.totalCreditsRequired}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Active Backlogs</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {showPrintableCard.activeBacklogs === 0 ? 'Zero (Cleared)' : `${showPrintableCard.activeBacklogs} Pending`}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Sync Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {showPrintableCard.apaarRecord.creditTransferStatus}
                  </span>
                </div>
              </div>

              {/* Digital Signature Footer */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between">
                <div>
                  <p>Affiliated to: <strong className="text-slate-700 dark:text-slate-300">{showPrintableCard.apaarRecord.collegeAffiliation}</strong></p>
                  <p>Last Sync: {showPrintableCard.apaarRecord.lastSyncDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">✓ Digitally Signed</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">National Informatics Centre (NIC)</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Official NEP 2020 Academic Identity</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintableCard(null)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
