import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  FileCheck,
  MessageSquare,
  Award,
  Zap,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Code,
  Layers,
  ChevronRight,
  RotateCcw,
  Check,
  User,
  GraduationCap,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ShieldCheck,
  Terminal,
  Lightbulb
} from 'lucide-react';
import { StudentProfile, UserRole } from '../types';

interface MakePlacementReadyProps {
  students: StudentProfile[];
  currentStudentId?: string;
  userRole: UserRole;
  onUpdateStudent: (updatedStudent: StudentProfile) => void;
  onNavigateToTab?: (tab: string) => void;
}

function getSafeStudent(s?: StudentProfile): StudentProfile {
  if (!s) {
    return {
      id: 'std-candidate',
      usn: '1RM21CS001',
      name: 'Student Candidate',
      email: 'candidate@campuslink.edu',
      phone: '+91 98451 22341',
      branch: 'CSE',
      batch: '2026 Batch',
      cgpa: 8.92,
      tenthPercentage: 94.5,
      twelfthPercentage: 91.2,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      readinessScore: 92,
      tier: 'Corporate Ready',
      skills: [],
      certifications: ['AWS Certified Solutions Architect', 'Rooman Cloud Practitioner'],
      projectsCount: 2,
      topProjects: [],
      projects: [],
      internships: [],
      programs: [],
      prePlacementTalksAttended: [],
      leetcodeSolved: 180,
      githubRepos: 8,
      mockInterviewScore: 88,
      aptitudeScore: 85,
      attendancePercent: 92,
      isAtRisk: false,
      riskReasons: [],
      placementStatus: 'Unplaced',
      offersCount: 0,
      resume: {
        atsScore: 88,
        lastUpdated: '2026-03-15',
        fileName: 'Candidate_Resume.pdf',
        summary: 'Final year CSE undergraduate skilled in Distributed Systems, Python, React, and Cloud Architecture.',
        keyKeywordsMatched: ['React', 'Node.js', 'SQL', 'FastAPI', 'AWS'],
        missingKeywords: ['Redis', 'Docker'],
        improvements: ['Include quantified system latency metrics']
      },
      apaarRecord: {
        apaarId: '9842-1049-3821',
        abcId: 'ABC-849-204-192',
        digiLockerVerified: true,
        totalCreditsEarned: 138,
        totalCreditsRequired: 160,
        creditTransferStatus: 'Fully Synchronized',
        semesterRecords: [],
        universityRegNo: '1RM21CS042',
        collegeAffiliation: 'R.M. College of Engineering & Technology',
        degreeTitle: 'B.Tech CSE',
        lastSyncDate: '2026-03-15'
      }
    };
  }

  return {
    ...s,
    name: s.name || 'Student Candidate',
    usn: s.usn || '1RM21CS001',
    branch: s.branch || 'CSE',
    cgpa: s.cgpa || 8.0,
    tier: s.tier || 'Corporate Ready',
    readinessScore: s.readinessScore ?? 80,
    skills: s.skills || [],
    certifications: s.certifications || [],
    topProjects: s.topProjects || [],
    projects: s.projects || [],
    internships: s.internships || [],
    programs: s.programs || [],
    leetcodeSolved: s.leetcodeSolved ?? 120,
    mockInterviewScore: s.mockInterviewScore ?? 80,
    aptitudeScore: s.aptitudeScore ?? 80,
    attendancePercent: s.attendancePercent ?? 85,
    resume: {
      atsScore: s.resume?.atsScore ?? 85,
      lastUpdated: s.resume?.lastUpdated || new Date().toISOString().split('T')[0],
      fileName: s.resume?.fileName || 'Resume.pdf',
      summary: s.resume?.summary || 'Computer Science student skilled in Software Engineering.',
      keyKeywordsMatched: s.resume?.keyKeywordsMatched || ['React', 'Node.js', 'SQL'],
      missingKeywords: s.resume?.missingKeywords || [],
      improvements: s.resume?.improvements || []
    },
    apaarRecord: {
      apaarId: s.apaarRecord?.apaarId || `APAAR-2026-${(s.id || 'std').slice(-4)}`,
      abcId: s.apaarRecord?.abcId || `ABC-${(s.id || 'std').slice(-4)}`,
      digiLockerVerified: s.apaarRecord?.digiLockerVerified ?? true,
      totalCreditsEarned: s.apaarRecord?.totalCreditsEarned ?? 138,
      totalCreditsRequired: s.apaarRecord?.totalCreditsRequired ?? 160,
      creditTransferStatus: s.apaarRecord?.creditTransferStatus || 'Fully Synchronized',
      semesterRecords: s.apaarRecord?.semesterRecords || [],
      universityRegNo: s.apaarRecord?.universityRegNo || s.usn || '1RM21CS001',
      collegeAffiliation: s.apaarRecord?.collegeAffiliation || 'Engineering College',
      degreeTitle: s.apaarRecord?.degreeTitle || `B.Tech ${s.branch || 'CSE'}`,
      lastSyncDate: s.apaarRecord?.lastSyncDate || new Date().toISOString().split('T')[0]
    }
  };
}

export const MakePlacementReady: React.FC<MakePlacementReadyProps> = ({
  students,
  currentStudentId = 'std-105',
  userRole,
  onUpdateStudent,
  onNavigateToTab
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudentId);

  useEffect(() => {
    if (currentStudentId) {
      setSelectedStudentId(currentStudentId);
    }
  }, [currentStudentId]);

  const rawSelectedStudent =
    (userRole === 'Student'
      ? students.find((s) => s.id === currentStudentId) ||
        students.find((s) => s.email?.toLowerCase() === currentStudentId?.toLowerCase()) ||
        students.find((s) => s.usn?.toLowerCase() === currentStudentId?.toLowerCase()) ||
        students[0]
      : students.find((s) => s.id === selectedStudentId)) || students[0];

  const selectedStudent: StudentProfile = getSafeStudent(rawSelectedStudent);

  // Active module inside Placement Ready Hub
  const [activeSubTab, setActiveSubTab] = useState<'sprint' | 'mock-interview' | 'ats-resume' | 'diagnostic' | 'github-auditor'>('sprint');

  // Interactive 4-Week Checklist State
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    't-1': true,
    't-2': true,
    't-3': false,
    't-4': false,
    't-5': false,
    't-6': false,
    't-7': false,
    't-8': false
  });

  // Multi-Turn Mock Interview Simulator State
  const [selectedRole, setSelectedRole] = useState('Associate Cloud & AI Solutions Engineer');
  const [selectedCompany, setSelectedCompany] = useState('Rooman Technologies');
  const [interviewQuestion, setInterviewQuestion] = useState(
    'Describe a challenging project bug you resolved under tight deadlines. Walk me through your debugging methodology.'
  );
  const [candidateAnswer, setCandidateAnswer] = useState(
    'In our semester project, we faced memory leaks and database connection timeouts during concurrent user loads. I analyzed the logs using Python cProfile and realized our database pool was exhausted because connections were not being closed in async route exceptions. I implemented a context manager and connection retry pool, which dropped timeouts to zero.'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [interviewEvaluation, setInterviewEvaluation] = useState<any>(null);
  const [interviewHistory, setInterviewHistory] = useState<Array<{
    turnNumber: number;
    question: string;
    answer: string;
    score: number;
    starAnalysis: any;
    feedback: string;
    followUpChallenge: string;
  }>>([]);

  // 1-Click ATS Resume Tailorer State (Google X-Y-Z formula)
  const [targetCompanyForResume, setTargetCompanyForResume] = useState('Rooman Technologies');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [isTailoringResume, setIsTailoringResume] = useState(false);
  const [tailoredResumeData, setTailoredResumeData] = useState<any>(null);

  // GitHub Portfolio & Engineering Rigor Auditor State
  const [isAuditingPortfolio, setIsAuditingPortfolio] = useState(false);
  const [portfolioAudit, setPortfolioAudit] = useState<any>(null);

  // 1-Click Fast-Track Elevation
  const [isElevating, setIsElevating] = useState(false);
  const [elevationSuccess, setElevationSuccess] = useState(false);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      return next;
    });
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = 8;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  // AI Sprint Plan state
  const [aiSprintPlan, setAiSprintPlan] = useState<any>(null);

  // Handle 1-click upgrade to Placement Ready powered by Gemini AI
  const handleElevateToReady = async () => {
    setIsElevating(true);
    try {
      const response = await fetch('/api/gemini/make-placement-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: selectedStudent,
          targetCompany: selectedCompany,
          daysUntilDrive: 14
        })
      });
      const data = await response.json().catch(() => ({}));
      if (data.success && data.plan) {
        setAiSprintPlan(data.plan);
      }
      const scoreBoost = data.plan?.projectedScoreIncrease || 20;
      const updated: StudentProfile = {
        ...selectedStudent,
        readinessScore: Math.min(98, Math.max(selectedStudent.readinessScore + scoreBoost, 88)),
        tier: 'Corporate Ready',
        mockInterviewScore: Math.max(selectedStudent.mockInterviewScore, 88),
        aptitudeScore: Math.max(selectedStudent.aptitudeScore, 85),
        isAtRisk: false,
        riskReasons: [],
        certifications: [
          'Rooman Corporate Readiness Fast-Track Certified',
          ...selectedStudent.certifications.filter((c) => !c.includes('Fast-Track'))
        ]
      };
      onUpdateStudent(updated);
      setElevationSuccess(true);
      setTimeout(() => setElevationSuccess(false), 5000);
    } catch (err) {
      console.error('Error in AI Placement Ready accelerator:', err);
    } finally {
      setIsElevating(false);
    }
  };

  // Run AI Multi-Turn Interview Evaluation with Gemini endpoint (/api/gemini/interactive-interview)
  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const historyContext = interviewHistory.map((h) => ({
        role: 'user',
        text: `Q: ${h.question} | A: ${h.answer}`
      }));

      const response = await fetch('/api/gemini/interactive-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyContext,
          targetRole: selectedRole,
          targetCompany: selectedCompany,
          candidateAnswer,
          currentQuestion: interviewQuestion
        })
      });
      const data = await response.json().catch(() => ({}));
      if (data.success) {
        setInterviewEvaluation(data);
        const newTurn = {
          turnNumber: interviewHistory.length + 1,
          question: interviewQuestion,
          answer: candidateAnswer,
          score: data.turnScore || 85,
          starAnalysis: data.starAnalysis,
          feedback: data.feedback,
          followUpChallenge: data.followUpChallenge || 'Explain how your architecture scales.'
        };
        setInterviewHistory((prev) => [...prev, newTurn]);
        if (data.followUpChallenge) {
          setInterviewQuestion(data.followUpChallenge);
          setCandidateAnswer('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Run 1-Click Resume Tailorer with Google X-Y-Z formula (/api/gemini/tailor-resume)
  const handleTailorResume = async () => {
    setIsTailoringResume(true);
    try {
      const response = await fetch('/api/gemini/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeSummary: selectedStudent.resume?.summary || 'Computer science student seeking software development role',
          skills: selectedStudent.skills,
          targetRole: selectedRole,
          targetCompany: selectedCompany,
          experience: selectedStudent.internships
        })
      });
      const data = await response.json().catch(() => ({}));
      if (data.success) {
        setTailoredResumeData(data);
      }
    } catch (err) {
      console.error('Error tailoring resume:', err);
    } finally {
      setIsTailoringResume(false);
    }
  };

  // Run GitHub Portfolio & Engineering Rigor Auditor (/api/gemini/audit-portfolio)
  const handleAuditPortfolio = async () => {
    setIsAuditingPortfolio(true);
    try {
      const response = await fetch('/api/gemini/audit-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUsername: `${selectedStudent.name.toLowerCase().replace(/\s+/g, '')}-dev`,
          repos: selectedStudent.projects || [],
          studentName: selectedStudent.name
        })
      });
      const data = await response.json().catch(() => ({}));
      if (data.success) {
        setPortfolioAudit(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditingPortfolio(false);
    }
  };

  // Run AI ATS Resume Analysis with Gemini endpoint
  const handleAnalyzeResume = async () => {
    setIsAnalyzingResume(true);
    try {
      const response = await fetch('/api/gemini/ats-resume-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeSummary: selectedStudent.resume?.summary || 'Computer science student seeking software development role',
          skills: selectedStudent.skills,
          targetRole: selectedRole,
          experience: selectedStudent.internships
        })
      });
      const data = await response.json().catch(() => ({}));
      if (data.success) {
        setResumeAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  return (
    <div id="make-placement-ready-container" className="space-y-6">
      {/* Top Banner with Student Selector & Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-sm shrink-0">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Placement Readiness Accelerator
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 inline-flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                  AI Coach &amp; Clinic
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Elevate students from "Needs Training" or "Near Ready" to "Corporate Ready" through personalized sprints.
              </p>
            </div>
          </div>
        </div>

        {/* Student Selector & Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0">
              {userRole === 'Student' ? 'Candidate Portal:' : 'Student:'}
            </span>
            {userRole === 'Student' ? (
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[240px]">
                {selectedStudent.name} ({selectedStudent.branch})
              </span>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer max-w-[200px] sm:max-w-[240px] truncate"
              >
                {students.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1"
                  >
                    {s.name} ({s.branch} • {s.tier})
                  </option>
                ))}
              </select>
            )}
            <span
              className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                selectedStudent.tier === 'Corporate Ready'
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                  : selectedStudent.tier === 'Near Ready'
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
              }`}
            >
              {selectedStudent.tier}
            </span>
          </div>

          <button
            id="elevate-readiness-btn"
            onClick={handleElevateToReady}
            disabled={isElevating}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer active:scale-95 ${
              selectedStudent.tier === 'Corporate Ready'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isElevating ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Accelerating...</span>
              </>
            ) : selectedStudent.tier === 'Corporate Ready' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Corporate Ready • Re-run Clinic</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>1-Click Make Placement Ready</span>
              </>
            )}
          </button>
        </div>
      </div>

      {elevationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center space-x-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Student Successfully Elevated to Corporate Ready!</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Readiness index upgraded to 88%+, Rooman Remedial Clinic clearance issued, and recruiter shortlist eligibility unlocked.
            </p>
          </div>
        </div>
      )}

      {/* Student Overview Snapshot */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-md">
              {selectedStudent.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-black">{selectedStudent.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedStudent.tier === 'Corporate Ready'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : selectedStudent.tier === 'Near Ready'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  }`}
                >
                  {selectedStudent.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                USN: {selectedStudent.usn} • APAAR ID: {selectedStudent.apaarRecord.apaarId} • {selectedStudent.branch} (CGPA: {selectedStudent.cgpa})
              </p>
            </div>
          </div>

          {/* Readiness Meter & Key KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto text-xs">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">Readiness Index</span>
              <span className="text-lg font-black text-white">{selectedStudent.readinessScore}/100</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">LeetCode Solved</span>
              <span className="text-lg font-black text-white">{selectedStudent.leetcodeSolved}</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">Mock Interview</span>
              <span className="text-lg font-black text-white">{selectedStudent.mockInterviewScore}%</span>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 block">ATS Resume Score</span>
              <span className="text-lg font-black text-emerald-400">{selectedStudent.resume?.atsScore || 85}%</span>
            </div>
          </div>
        </div>

        {/* Sprint Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-semibold">
              Readiness Sprint Progress: {completedCount} of {totalTasks} Tasks Completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full sm:w-64 bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pill Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('sprint')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'sprint'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>4-Week Readiness Sprint</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mock-interview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'mock-interview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Technical Mock Interview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ats-resume')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'ats-resume'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>AI ATS Resume Optimizer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'diagnostic'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Multi-Metric Radar Diagnostic</span>
        </button>

        <button
          onClick={() => setActiveSubTab('github-auditor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'github-auditor'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>AI GitHub &amp; Code Auditor</span>
        </button>
      </div>

      {/* Sub-Tab 1: 4-Week Readiness Sprint Checklist */}
      {activeSubTab === 'sprint' && (
        <div className="space-y-5">
          {/* AI-Generated Dynamic Sprint Plan Card if available */}
          {aiSprintPlan && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700/50 shadow-md space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60">
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                        Gemini AI Generated Sprint
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        +{aiSprintPlan.projectedScoreIncrease || 18}% Projected Score Boost
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-0.5">
                      {aiSprintPlan.readinessSprintTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Target Company:</span>
                  <span className="font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800">
                    {selectedCompany}
                  </span>
                </div>
              </div>

              {/* Company Must-Know Topics & Rooman Remedial Clinics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {aiSprintPlan.mustKnowCompanyTopics && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block mb-1.5 flex items-center space-x-1">
                      <Target className="w-3.5 h-3.5 mr-1" />
                      Must-Know Technical Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiSprintPlan.mustKnowCompanyTopics.map((topic: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiSprintPlan.rooomRemedialClinicsRecommended && (
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-1.5 flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 mr-1" />
                      Recommended Rooman Remedial Clinics
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiSprintPlan.rooomRemedialClinicsRecommended.map((clinic: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                          {clinic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Daily Sprint Tasks breakdown if present */}
              {aiSprintPlan.dailySprintTasks && aiSprintPlan.dailySprintTasks.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-indigo-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                    Daily Action Modules (14-Day Fast-Track)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {aiSprintPlan.dailySprintTasks.map((task: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-indigo-300">Day {task.day} • {task.module}</span>
                          <span className="text-slate-400">{task.durationMinutes} mins</span>
                        </div>
                        <p className="text-slate-200 font-medium text-[11px]">{task.task}</p>
                        <p className="text-[10px] text-emerald-300">Goal: {task.benchmark}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Week 1 & 2 */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  Week 1: Algorithmic Foundations
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Target: Pass Cutoff Benchmarks</span>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    id: 't-1',
                    title: 'Solve 25 LeetCode Mediums on Two-Pointers & Sliding Window',
                    desc: 'Build speed under 20-minute constraints for Tier-1 coding tests.'
                  },
                  {
                    id: 't-2',
                    title: 'Complete Rooman Quantitative & Logical Reasoning Mock #1',
                    desc: 'Score minimum 75% across speed-math, probability & syllogisms.'
                  }
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                      completedTasks[t.id]
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        completedTasks[t.id]
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                  Week 2: Core CS &amp; System Architecture
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Target: Architecture Defense</span>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    id: 't-3',
                    title: 'Review Operating Systems (Process Scheduling, Deadlocks, Virtual Memory)',
                    desc: 'Prepare for technical round core theory questions.'
                  },
                  {
                    id: 't-4',
                    title: 'Design a Scalable Distributed Cache & Explain Redis Integration',
                    desc: 'Deliver an architecture diagram with trade-offs in project viva.'
                  }
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                      completedTasks[t.id]
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        completedTasks[t.id]
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Week 3 & 4 */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                  Week 3: Behavioral STAR &amp; Mock Technicals
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Target: Interview Readiness</span>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    id: 't-5',
                    title: 'Conduct Live 1-on-1 Rooman Mentor Technical Simulation',
                    desc: 'Simulate 45-minute live coding round with mentor feedback.'
                  },
                  {
                    id: 't-6',
                    title: 'Prepare 5 STAR Technique Stories for Leadership & Conflict',
                    desc: 'Structure Situation, Task, Action, and measurable Results.'
                  }
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                      completedTasks[t.id]
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        completedTasks[t.id]
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Week 4: Company Customization &amp; Final Clearance
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Target: Offer Conversion</span>
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    id: 't-7',
                    title: 'Tailor ATS Resume with 15+ Target Recruiter Keywords',
                    desc: 'Achieve ATS Compatibility score > 90% in AI validator.'
                  },
                  {
                    id: 't-8',
                    title: 'Attend Pre-Placement Talk (PPT) & Submit Attendance Confirmation',
                    desc: 'Mandatory prerequisite for online assessment link activation.'
                  }
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                      completedTasks[t.id]
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        completedTasks[t.id]
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Sub-Tab 2: AI Technical Mock Interview Simulator */}
      {activeSubTab === 'mock-interview' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI Technical &amp; Behavioral Mock Interview Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Practice corporate interview questions with real-time STAR method analysis powered by Gemini.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-hidden"
              >
                <option value="Rooman Technologies">Rooman Technologies</option>
                <option value="Google Cloud India">Google Cloud India</option>
                <option value="Cisco Systems">Cisco Systems</option>
                <option value="Deloitte USI">Deloitte USI</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Interview Question</label>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{interviewQuestion}</span>
              <button
                onClick={() => {
                  const questions = [
                    'Describe how you designed the database schema in your capstone project to handle high-concurrency writes.',
                    'How do you explain the difference between processes and threads to a non-technical stakeholder?',
                    'Tell me about a time when a team member missed a critical milestone. How did you handle it?',
                    'Explain how you would optimize an algorithmic solution from O(N^2) to O(N log N).'
                  ];
                  const nextQ = questions[Math.floor(Math.random() * questions.length)];
                  setInterviewQuestion(nextQ);
                }}
                className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center space-x-1 ml-3 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New Question</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Answer (Use the STAR Technique: Situation, Task, Action, Result)
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                Tip: Quantify your results with latency, throughput, or accuracy numbers!
              </span>
            </div>
            <textarea
              rows={4}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleEvaluateAnswer}
              disabled={isEvaluating}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-2 transition cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating STAR Response...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate with Gemini AI</span>
                </>
              )}
            </button>
          </div>

          {/* Multi-Turn Conversation Thread */}
          {interviewHistory.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Interactive Interview Thread ({interviewHistory.length} Turns Completed)
                </h4>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  Avg Rigor: {Math.round(interviewHistory.reduce((acc, h) => acc + h.score, 0) / interviewHistory.length)}/100
                </span>
              </div>

              <div className="space-y-3">
                {interviewHistory.map((turn) => (
                  <div key={turn.turnNumber} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-[10px]">
                        Turn #{turn.turnNumber}
                      </span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">
                        Turn Score: {turn.score} / 100
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Q: {turn.question}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 pl-3 border-l-2 border-indigo-500 italic">
                        "{turn.answer}"
                      </p>
                    </div>

                    {turn.starAnalysis && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Situation</span>
                          <span className="text-slate-700 dark:text-slate-300">{turn.starAnalysis.situation}</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Task</span>
                          <span className="text-slate-700 dark:text-slate-300">{turn.starAnalysis.task}</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Action</span>
                          <span className="text-slate-700 dark:text-slate-300">{turn.starAnalysis.action}</span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Metrics</span>
                          <span className="text-slate-700 dark:text-slate-300">{turn.starAnalysis.metrics}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-[11px]">
                      <span className="font-bold">Interviewer Coaching: </span>
                      {turn.feedback}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: AI ATS Resume Optimizer & 1-Click Tailorer */}
      {activeSubTab === 'ats-resume' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI ATS Resume Compatibility &amp; 1-Click Tailorer</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transforms passive bullet points into high-impact Google X-Y-Z statements and matches ATS keywords.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTailorResume}
                disabled={isTailoringResume}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm flex items-center space-x-2 transition cursor-pointer"
              >
                {isTailoringResume ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Tailoring with X-Y-Z...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-200" />
                    <span>1-Click Tailor Resume (Google X-Y-Z)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAnalyzeResume}
                disabled={isAnalyzingResume}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-2 transition cursor-pointer"
              >
                {isAnalyzingResume ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Scanning ATS Index...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run ATS Deep Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render 1-Click Tailored Resume Output if available */}
          {tailoredResumeData && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800/80">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase">
                    Google X-Y-Z Tailored Output
                  </span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                    {tailoredResumeData.tailoredHeadline}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Projected ATS Score</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {tailoredResumeData.projectedAtsScore || 94} / 100
                  </span>
                </div>
              </div>

              {/* Matched vs Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-1.5">
                    ✓ Matched Recruiter Keywords
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(tailoredResumeData.atsMatchedKeywords || []).map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block mb-1.5">
                    ⚠ Recommended Keywords to Inject
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(tailoredResumeData.atsMissingKeywords || []).map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded text-[10px] font-semibold">
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Google X-Y-Z Transform Bullets */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                  Google X-Y-Z Accomplishment Bullets
                </span>
                {(tailoredResumeData.xyzBullets || []).map((bullet: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-1.5">
                    <p className="text-slate-500 line-through text-[11px]">{bullet.original}</p>
                    <p className="font-bold text-slate-900 dark:text-white leading-relaxed">
                      ★ {bullet.xyzFormat}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Impact Rationale: {bullet.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Render Gemini AI ATS Deep Scan Analysis if available */}
          {resumeAnalysis && (
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-4 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-200 dark:border-indigo-800/80">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase">
                      Gemini Deep Scan Audit
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
                      ATS Benchmark: {resumeAnalysis.benchmarkTier || 'High Match'}
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Scanned ATS Match</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {resumeAnalysis.atsScore || 88} / 100
                  </span>
                </div>
              </div>

              {resumeAnalysis.overallVerdict && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400 block mb-1">
                    Recruiter Screening Verdict
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {resumeAnalysis.overallVerdict}
                  </p>
                </div>
              )}

              {/* Matched vs Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block mb-1.5">
                    ✓ Core Keywords Present
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(resumeAnalysis.keyMatchedKeywords || []).map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-semibold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-800">
                  <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block mb-1.5">
                    ⚠ Critical Keywords Missing
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(resumeAnalysis.missingCriticalKeywords || []).map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 rounded text-[10px] font-semibold">
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bullet Improvements from AI */}
              {resumeAnalysis.bulletImprovements && resumeAnalysis.bulletImprovements.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                    Targeted Bullet Enhancements
                  </span>
                  {resumeAnalysis.bulletImprovements.map((b: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800/80 space-y-1.5">
                      <p className="text-slate-500 line-through text-[11px]">{b.original}</p>
                      <p className="font-bold text-slate-900 dark:text-white leading-relaxed">
                        ★ {b.improved}
                      </p>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">
                        Why: {b.impactRationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Current ATS Score</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {selectedStudent.resume?.atsScore || 85}
                <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">/100</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Above 75% Campus Placement Threshold
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 md:col-span-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Resume Summary Checked</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{selectedStudent.resume?.summary || 'Computer science student seeking software engineering opportunities.'}"
              </p>
            </div>
          </div>

          {/* ATS Improvement Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Recommended Bullet Point Enhancements (Power Verbs + Metrics)
            </h4>

            <div className="space-y-3">
              {[
                {
                  original: 'Built a web application for booking appointments using React and Node.js.',
                  improved: 'Architected full-stack appointment platform in React & Node.js, reducing booking latency by 35% across 2,000+ daily sessions.',
                  rationale: 'Replaced passive verb with "Architected" and added quantifiable performance metrics.'
                },
                {
                  original: 'Worked on database queries and optimized performance.',
                  improved: 'Engineered composite PostgreSQL indexes and implemented Redis caching, cutting P95 database query response times by 48%.',
                  rationale: 'Specifies explicit tools (Redis, PostgreSQL) and P95 latency improvement.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                      Before
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 line-through">{item.original}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                      After
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.improved}</span>
                  </div>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium pl-14">
                    Why: {item.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Multi-Metric Radar Diagnostic */}
      {activeSubTab === 'diagnostic' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Multi-Parameter Corporate Readiness Diagnostic
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">1. Problem Solving (DSA)</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedStudent.leetcodeSolved} Solved</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (selectedStudent.leetcodeSolved / 350) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">Benchmark: 250+ Problems for Tier-1 Product Companies</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">2. Quantitative Aptitude</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedStudent.aptitudeScore}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${selectedStudent.aptitudeScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Benchmark: &gt;80% for Deloitte &amp; Rooman written rounds</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">3. Projects &amp; GitHub Rigor</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedStudent.projects?.length || 2} Deployed</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (selectedStudent.projects?.length || 2) * 33)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Benchmark: Min 2 Full-Stack or Systems Repos with Live Demos</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">4. Academic Credits (APAAR)</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">
                  {selectedStudent.apaarRecord.totalCreditsEarned} / {selectedStudent.apaarRecord.totalCreditsRequired}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${(selectedStudent.apaarRecord.totalCreditsEarned / selectedStudent.apaarRecord.totalCreditsRequired) * 100}%`
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">National Academic Depository &amp; DigiLocker Verified</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">5. Placement Training Attendance</span>
                <span
                  className={`font-black ${
                    selectedStudent.attendancePercent >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {selectedStudent.attendancePercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full ${
                    selectedStudent.attendancePercent >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${selectedStudent.attendancePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Mandatory Placement Cell Minimum: 75%</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">6. Mock Technical Interview</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedStudent.mockInterviewScore}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${selectedStudent.mockInterviewScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Communication &amp; System Design Defense Score</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: AI GitHub & Code Auditor */}
      {activeSubTab === 'github-auditor' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>AI GitHub Portfolio &amp; Code Rigor Auditor</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audits repository architecture, commit consistency, automated test coverage, and enterprise cleanliness using Gemini.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center space-x-2">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  @{selectedStudent.name.toLowerCase().replace(/\s+/g, '')}-dev
                </span>
              </div>

              <button
                onClick={handleAuditPortfolio}
                disabled={isAuditingPortfolio}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-2 transition cursor-pointer"
              >
                {isAuditingPortfolio ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Auditing Code Repositories...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Deep GitHub Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Student Repositories Checked */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Tracked Projects &amp; Public Repositories ({selectedStudent.projects?.length || 2} Connected)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {(selectedStudent.projects && selectedStudent.projects.length > 0 ? selectedStudent.projects : [
                {
                  id: 'p1',
                  title: 'Distributed Event Booking Service',
                  description: 'Microservice backend with Node.js, Redis locks, PostgreSQL, and Docker Compose.',
                  techStack: ['Node.js', 'Express', 'Redis', 'PostgreSQL', 'Docker'],
                  githubUrl: 'https://github.com/candidate/event-booking'
                },
                {
                  id: 'p2',
                  title: 'Cloud Medical Appointment Triage App',
                  description: 'React SPA with Tailwind CSS, FastAPI, and JWT role-based access control.',
                  techStack: ['React', 'TypeScript', 'FastAPI', 'Python', 'Tailwind'],
                  githubUrl: 'https://github.com/candidate/med-triage'
                }
              ]).map((proj: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{proj.title}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      main • synced
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(proj.techStack || []).map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Portfolio Audit Results */}
          {portfolioAudit ? (
            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-5 animate-fade-in text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200 dark:border-indigo-800/80">
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase">
                      Gemini Technical Rigor Audit
                    </span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-0.5">
                      Architecture Rating: {portfolioAudit.architectureRating}
                    </h4>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Engineering Rigor Score</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {portfolioAudit.engineeringRigorScore} / 100
                  </span>
                </div>
              </div>

              {/* Commit streak and consistency */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-start space-x-3">
                <GitCommit className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Commit Consistency &amp; Git Hygiene</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    {portfolioAudit.commitConsistency}
                  </p>
                </div>
              </div>

              {/* Strengths & Red Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Engineering Strengths</span>
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    {(portfolioAudit.strengths || []).map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hygiene Red Flags &amp; Improvements</span>
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    {(portfolioAudit.redFlags || []).map((rf: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-500 font-bold">⚠</span>
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Projects to bridge gap */}
              {portfolioAudit.recommendedProjects && portfolioAudit.recommendedProjects.length > 0 && (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block flex items-center space-x-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Recommended Projects to Elevate Recruiter Shortlist Tier</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {portfolioAudit.recommendedProjects.map((rec: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
              <Code className="w-8 h-8 text-indigo-500 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  Run Gemini Deep Repository Code Rigor Analysis
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Evaluates {selectedStudent.name}'s public codebases against Tier-1 product company engineering standards (Docker, tests, modular ORM, error-handling).
                </p>
              </div>
              <button
                onClick={handleAuditPortfolio}
                disabled={isAuditingPortfolio}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Live Portfolio Audit</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
