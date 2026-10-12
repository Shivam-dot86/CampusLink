import React, { useState } from 'react';
import {
  Building2,
  Users,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Eye,
  Mail,
  UserCheck,
  Calendar,
  Award,
  Layers,
  Check,
  X,
  Plus,
  Send,
  Star,
  FileText,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  RecruiterDrive,
  StudentProfile,
  CandidateFitScore,
  OfferRecord,
  UserRole
} from '../types';

interface RecruiterWorkspaceProps {
  drives: RecruiterDrive[];
  students: StudentProfile[];
  offers: OfferRecord[];
  onAddNewDrive: (newDrive: RecruiterDrive) => void;
  onUpdateCandidateStage?: (studentId: string, driveId: string, newStage: string) => void;
  onGenerateOffer?: (offerData: Partial<OfferRecord>) => void;
}

export const RecruiterWorkspace: React.FC<RecruiterWorkspaceProps> = ({
  drives,
  students,
  offers,
  onAddNewDrive,
  onUpdateCandidateStage,
  onGenerateOffer
}) => {
  const [activeTab, setActiveTab] = useState<
    'pipeline' | 'matching' | 'post-jd' | 'drive-day' | 'assessment' | 'analytics'
  >('pipeline');

  const [selectedDriveId, setSelectedDriveId] = useState<string>(drives[0]?.id || '');
  const selectedDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];

  // Kanban Pipeline State
  // Columns: Applied -> Shortlisted -> Test -> Interview -> Offer -> Joined
  type PipelineStage = 'Applied' | 'Shortlisted' | 'Assessment Active' | 'Technical Interview' | 'HR & Offer' | 'Joined';

  const stages: PipelineStage[] = [
    'Applied',
    'Shortlisted',
    'Assessment Active',
    'Technical Interview',
    'HR & Offer',
    'Joined'
  ];

  // Local candidate stages mapped to students
  const [candidateStages, setCandidateStages] = useState<Record<string, PipelineStage>>(() => {
    const map: Record<string, PipelineStage> = {};
    students.forEach((s, idx) => {
      if (idx === 0) map[s.id] = 'Technical Interview';
      else if (idx === 1) map[s.id] = 'HR & Offer';
      else if (idx === 2) map[s.id] = 'Assessment Active';
      else if (idx === 3) map[s.id] = 'Shortlisted';
      else map[s.id] = 'Applied';
    });
    return map;
  });

  const [selectedCandidatesForBulk, setSelectedCandidatesForBulk] = useState<string[]>([]);
  const [bulkActionSuccess, setBulkActionSuccess] = useState<string | null>(null);

  // Selected candidate profile modal
  const [inspectingStudent, setInspectingStudent] = useState<StudentProfile | null>(null);

  // Per-candidate scorecard / evaluation form state
  const [evaluatingStudent, setEvaluatingStudent] = useState<StudentProfile | null>(null);
  const [evalRating, setEvalRating] = useState<number>(4);
  const [evalVerdict, setEvalVerdict] = useState<'Strong Hire' | 'Hire' | 'Borderline' | 'Reject'>('Hire');
  const [evalNotes, setEvalNotes] = useState<string>('Strong core algorithms knowledge. Clean syntax on whiteboarding.');

  // New JD Posting Form state
  const [newCompanyName, setNewCompanyName] = useState('Google');
  const [newRoleTitle, setNewRoleTitle] = useState('Software Engineer - Systems');
  const [newCtc, setNewCtc] = useState(24.5);
  const [newLocation, setNewLocation] = useState('Bangalore / Hyderabad');
  const [newMinCgpa, setNewMinCgpa] = useState(8.0);
  const [newMaxBacklogs, setNewMaxBacklogs] = useState(0);
  const [newBond, setNewBond] = useState('No Bond');
  const [newSkills, setNewSkills] = useState('Go, Distributed Systems, Python, Linux Internals');
  const [jdSuccess, setJdSuccess] = useState(false);

  // Move candidate between stages
  const moveCandidate = (studentId: string, targetStage: PipelineStage) => {
    setCandidateStages((prev) => ({ ...prev, [studentId]: targetStage }));
    if (onUpdateCandidateStage && selectedDrive) {
      onUpdateCandidateStage(studentId, selectedDrive.id, targetStage);
    }
  };

  // Bulk actions
  const handleBulkMove = (targetStage: PipelineStage) => {
    setCandidateStages((prev) => {
      const next = { ...prev };
      selectedCandidatesForBulk.forEach((id) => {
        next[id] = targetStage;
      });
      return next;
    });
    setBulkActionSuccess(`Advanced ${selectedCandidatesForBulk.length} selected candidates to "${targetStage}".`);
    setSelectedCandidatesForBulk([]);
    setTimeout(() => setBulkActionSuccess(null), 4000);
  };

  const toggleSelectCandidate = (id: string) => {
    if (selectedCandidatesForBulk.includes(id)) {
      setSelectedCandidatesForBulk(selectedCandidatesForBulk.filter((i) => i !== id));
    } else {
      setSelectedCandidatesForBulk([...selectedCandidatesForBulk, id]);
    }
  };

  // Submit new JD
  const handleCreateJd = (e: React.FormEvent) => {
    e.preventDefault();
    const created: RecruiterDrive = {
      id: `drv-${Date.now()}`,
      companyName: newCompanyName,
      logo: newCompanyName.slice(0, 3).toUpperCase(),
      roleTitle: newRoleTitle,
      jobType: 'Full-Time',
      ctcLPA: newCtc,
      location: newLocation,
      minCGPA: newMinCgpa,
      eligibleBranches: ['CSE', 'IT', 'AI&DS'],
      maxBacklogsAllowed: newMaxBacklogs,
      requiredSkills: newSkills.split(',').map((s) => s.trim()),
      preferredSkills: ['System Design', 'Docker', 'Kubernetes'],
      driveDate: '2026-10-24',
      deadlineDate: '2026-10-20',
      status: 'Registration Open',
      venueOrPlatform: 'Auditorium Main & HackerRank Platform',
      rounds: [
        { name: 'Online Coding Test', date: '2026-10-21', time: '10:00 AM', type: 'Online', venue: 'Virtual' },
        { name: 'Technical Interview', date: '2026-10-24', time: '09:00 AM', type: 'Offline', venue: 'Lab 3' },
        { name: 'HR & Fit Discussion', date: '2026-10-24', time: '03:00 PM', type: 'Offline', venue: 'Executive Lounge' }
      ],
      shortlistedCount: 0,
      registeredCount: 0,
      selectedCount: 0,
      description: `Hiring ${newRoleTitle} at ${newCompanyName} for high-scale backend services.`
    };

    onAddNewDrive(created);
    setSelectedDriveId(created.id);
    setJdSuccess(true);
    setTimeout(() => {
      setJdSuccess(false);
      setActiveTab('pipeline');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Recruiter Workspace Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1 text-cyan-300" />
                Corporate Recruiter Workspace
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                Active Drive: {selectedDrive?.companyName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Talent Acquisition Command
            </h1>
            <p className="text-sm text-cyan-100 max-w-xl leading-relaxed">
              Managing the applicant funnel for <span className="font-bold">{selectedDrive?.roleTitle}</span> (₹{selectedDrive?.ctcLPA} LPA).
              Shortlist verified profiles, review explainable AI fit scores, and release official offers.
            </p>
          </div>

          {/* Drive Selector */}
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0 space-y-2">
            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-wider block">
              Active Job Campaign
            </span>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-900/90 text-white border border-white/30 rounded-xl p-2.5 focus:outline-none"
            >
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.companyName} — {d.roleTitle} (₹{d.ctcLPA} LPA)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-white/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'pipeline', label: 'Applicant Kanban Pipeline', icon: Layers },
            { id: 'matching', label: 'AI Match & Fit Explanation', icon: Sparkles },
            { id: 'drive-day', label: 'Drive-Day Live View', icon: Calendar },
            { id: 'assessment', label: 'Assessment & Cutoffs', icon: Award },
            { id: 'post-jd', label: 'Post New Drive / JD', icon: Plus },
            { id: 'analytics', label: 'Hiring Funnel Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-900 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Action Notification Bar */}
      {bulkActionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center space-x-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{bulkActionSuccess}</span>
        </div>
      )}

      {/* 1. KANBAN APPLICANT PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4 animate-fade-in">
          {/* Bulk Action Controls */}
          {selectedCandidatesForBulk.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-950/60 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
              <span className="font-bold text-indigo-900 dark:text-indigo-200">
                {selectedCandidatesForBulk.length} candidates selected for bulk action:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkMove('Shortlisted')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Move to Shortlisted
                </button>
                <button
                  onClick={() => handleBulkMove('Assessment Active')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Send Assessment Link
                </button>
                <button
                  onClick={() => handleBulkMove('Technical Interview')}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => handleBulkMove('HR & Offer')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Generate Offers
                </button>
                <button
                  onClick={() => setSelectedCandidatesForBulk([])}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Kanban Board Horizontal Scroll */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
            {stages.map((stage) => {
              const candidatesInStage = students.filter(
                (s) => (candidateStages[s.id] || 'Applied') === stage
              );

              return (
                <div
                  key={stage}
                  className="bg-slate-100 dark:bg-slate-900/90 rounded-2xl p-3 border border-slate-200/90 dark:border-slate-800 min-w-[210px] space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {stage}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {candidatesInStage.length}
                    </span>
                  </div>

                  {/* Cards inside stage */}
                  <div className="space-y-2.5 min-h-[300px]">
                    {candidatesInStage.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                        No candidates in this stage
                      </div>
                    ) : (
                      candidatesInStage.map((student) => {
                        const isSelected = selectedCandidatesForBulk.includes(student.id);

                        return (
                          <div
                            key={student.id}
                            className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-400/20'
                                : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectCandidate(student.id)}
                                  className="rounded accent-indigo-600 cursor-pointer"
                                />
                                <span className="font-bold text-slate-900 dark:text-white truncate">
                                  {student.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                                {student.cgpa} CGPA
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                              <span>{student.branch} • {student.batch}</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {student.readinessScore}% Match
                              </span>
                            </div>

                            {/* Actions on candidate */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                              <button
                                onClick={() => setInspectingStudent(student)}
                                className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                              >
                                View Profile
                              </button>

                              <button
                                onClick={() => setEvaluatingStudent(student)}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                              >
                                Evaluate Form
                              </button>
                            </div>

                            {/* Quick Next Stage Advance button */}
                            {stage !== 'Joined' && (
                              <button
                                onClick={() => {
                                  const nextIdx = stages.indexOf(stage) + 1;
                                  if (nextIdx < stages.length) {
                                    moveCandidate(student.id, stages[nextIdx]);
                                  }
                                }}
                                className="w-full py-1 text-[10px] font-bold bg-slate-50 dark:bg-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-lg transition border border-slate-200 dark:border-slate-600 cursor-pointer flex items-center justify-center space-x-1"
                              >
                                <span>Advance to Next Stage</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AI CANDIDATE MATCHING & FIT EXPLANATIONS */}
      {activeTab === 'matching' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Explainable AI Fit Rankings for {selectedDrive.companyName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidates ranked by semantic JD compatibility, verified course credits, and project portfolio.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
              {students.length} Total Ranked Profiles
            </span>
          </div>

          <div className="space-y-3">
            {students.map((student, rankIdx) => (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start space-x-3.5">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                    #{rankIdx + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {student.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {student.cgpa} CGPA
                      </span>
                      <span className="text-slate-400">• {student.branch}</span>
                    </div>

                    {/* Explainability Verdict */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 mt-2 max-w-2xl text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                      <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                        ✓ Why this candidate matches:
                      </p>
                      <p className="leading-relaxed">
                        Matches {student.skills.slice(0, 3).map((s) => s.name).join(', ')}. Strong hands-on
                        portfolio in {student.projects[0]?.title || 'Distributed Systems'}.
                        DigiLocker APAAR Verified with {student.apaarRecord.totalCreditsEarned} academic credits.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 self-end lg:self-center">
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">
                      {Math.max(72, student.readinessScore)}% Fit
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Semantic Fit Score</span>
                  </div>

                  <button
                    onClick={() => {
                      moveCandidate(student.id, 'Shortlisted');
                      alert(`Shortlisted ${student.name} for ${selectedDrive.companyName}`);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                  >
                    1-Click Shortlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. POST NEW DRIVE / JD WIZARD */}
      {activeTab === 'post-jd' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-3xl mx-auto animate-fade-in">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Post New Campus Recruitment Drive / Job Specification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publishing will auto-calculate student cohort eligibility and open the student application portal.
            </p>
          </div>

          {jdSuccess && (
            <div className="p-3 mb-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Drive published successfully! Redirecting to applicant pipeline...</span>
            </div>
          )}

          <form onSubmit={handleCreateJd} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  CTC Package (LPA)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newCtc}
                  onChange={(e) => setNewCtc(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Min CGPA Cutoff
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newMinCgpa}
                  onChange={(e) => setNewMinCgpa(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Service Agreement / Bond
                </label>
                <input
                  type="text"
                  value={newBond}
                  onChange={(e) => setNewBond(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Required Core Skills (Comma-separated)
              </label>
              <input
                type="text"
                required
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Drive &amp; Open Student Registration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. DRIVE-DAY LIVE VIEW */}
      {activeTab === 'drive-day' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Drive-Day Live Operations &amp; Interview Panel Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live attendance, student waiting buffer, and round movement for {selectedDrive.companyName}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Checked In Today</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">48 Students</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Present</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Currently Interviewing</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">6 Panels Active</span>
              <span className="text-[10px] text-slate-400 font-semibold">Rooms 1-6 Occupied</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cleared to Next Round</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">18 Candidates</span>
              <span className="text-[10px] text-slate-400 font-semibold">Ready for Final HR</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. HIRING FUNNEL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Corporate Hiring Funnel &amp; Time-to-Hire Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conversion drop rates across rounds for {selectedDrive.companyName}.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { stage: 'Stage 1: Applied & Screened', count: 180, pct: '100%' },
              { stage: 'Stage 2: Shortlisted by Cutoff', count: 84, pct: '46.6%' },
              { stage: 'Stage 3: Coding Assessment Cleared', count: 32, pct: '17.7%' },
              { stage: 'Stage 4: Technical Interviews Cleared', count: 14, pct: '7.7%' },
              { stage: 'Stage 5: Final Offers Extended', count: 8, pct: '4.4%' }
            ].map((st, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between mb-1.5 font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{st.stage}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{st.count} Candidates ({st.pct})</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: st.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Profile Inspection Modal */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {inspectingStudent.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {inspectingStudent.branch} • USN: {inspectingStudent.usn} • CGPA: {inspectingStudent.cgpa}
                </p>
              </div>
              <button
                onClick={() => setInspectingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Verified Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingStudent.skills.map((s) => (
                    <span
                      key={s.name}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border text-[10px] font-bold text-slate-700 dark:text-slate-300"
                    >
                      {s.name} (Lvl {s.level})
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Key Projects:
                </span>
                {inspectingStudent.projects.map((p) => (
                  <div key={p.id} className="mb-2">
                    <p className="font-bold text-slate-900 dark:text-white">{p.title}</p>
                    <p className="text-slate-500 text-[11px]">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-indigo-600 text-white cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Scorecard / Evaluation Form Modal */}
      {evaluatingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Candidate Evaluation Scorecard
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {evaluatingStudent.name} • {selectedDrive.companyName}
                </p>
              </div>
              <button
                onClick={() => setEvaluatingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Overall Rating (1 - 5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEvalRating(star)}
                      className={`p-2 rounded-xl border font-black transition cursor-pointer ${
                        evalRating === star
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hiring Recommendation
                </label>
                <select
                  value={evalVerdict}
                  onChange={(e) => setEvalVerdict(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Borderline">Borderline / Waitlist</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Interviewer Notes &amp; Whiteboard Feedback
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setEvaluatingStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Evaluation saved! Verdict: "${evalVerdict}" recorded.`);
                  setEvaluatingStudent(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
              >
                Save Evaluation Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
