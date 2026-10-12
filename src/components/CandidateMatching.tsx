import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  ArrowUpDown,
  Search,
  Check,
  ChevronRight,
  Loader2,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { StudentProfile, RecruiterDrive, CandidateFitScore, StudentBranch } from '../types';

interface CandidateMatchingProps {
  students: StudentProfile[];
  drives: RecruiterDrive[];
  selectedDriveId?: string;
  onSelectDriveId?: (id: string) => void;
  onUpdateShortlist?: (driveId: string, studentId: string, shortlisted: boolean) => void;
}

export const CandidateMatching: React.FC<CandidateMatchingProps> = ({
  students,
  drives,
  selectedDriveId,
  onSelectDriveId,
  onUpdateShortlist,
}) => {
  const [activeDriveId, setActiveDriveId] = useState<string>(
    selectedDriveId || (drives[0] ? drives[0].id : '')
  );

  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [minFitScore, setMinFitScore] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [shortlistedSet, setShortlistedSet] = useState<Set<string>>(new Set(['std-101', 'std-102']));

  // Detailed AI match drawer state
  const [evaluatingStudent, setEvaluatingStudent] = useState<StudentProfile | null>(null);
  const [deepAiMatch, setDeepAiMatch] = useState<any | null>(null);
  const [isDeepMatching, setIsDeepMatching] = useState(false);

  const currentDrive = useMemo(() => {
    return drives.find((d) => d.id === activeDriveId) || drives[0];
  }, [drives, activeDriveId]);

  // Compute fit scores for each student for the current drive
  const candidateScores: CandidateFitScore[] = useMemo(() => {
    if (!currentDrive) return [];

    return students.map((std) => {
      const isAcademicEligible =
        std.cgpa >= currentDrive.minCGPA &&
        std.activeBacklogs <= currentDrive.maxBacklogsAllowed &&
        currentDrive.eligibleBranches.includes(std.branch);

      let ineligibilityReason = '';
      if (std.cgpa < currentDrive.minCGPA) {
        ineligibilityReason = `CGPA ${std.cgpa} below cutoff ${currentDrive.minCGPA}`;
      } else if (std.activeBacklogs > currentDrive.maxBacklogsAllowed) {
        ineligibilityReason = `${std.activeBacklogs} active backlogs (max allowed: ${currentDrive.maxBacklogsAllowed})`;
      } else if (!currentDrive.eligibleBranches.includes(std.branch)) {
        ineligibilityReason = `Branch ${std.branch} not listed in eligible branches`;
      }

      // Skill overlap
      const studentSkillNames = std.skills.map((s) => s.name.toLowerCase());
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      currentDrive.requiredSkills.forEach((reqSkill) => {
        const hasSkill = studentSkillNames.some(
          (sk) => sk.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(sk)
        );
        if (hasSkill) {
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      });

      const techScore = Math.min(
        100,
        Math.round((matchedSkills.length / Math.max(1, currentDrive.requiredSkills.length)) * 100)
      );
      const academicScore = Math.min(100, Math.round(std.cgpa * 10));
      const projectScore = Math.min(98, std.projectsCount * 22);
      const assessmentScore = Math.round((std.mockInterviewScore + std.aptitudeScore) / 2);

      const overallFit = isAcademicEligible
        ? Math.round(
            techScore * 0.45 +
              std.readinessScore * 0.3 +
              academicScore * 0.15 +
              projectScore * 0.1
          )
        : Math.max(25, Math.round(techScore * 0.3));

      let explainabilityVerdict = '';
      if (!isAcademicEligible) {
        explainabilityVerdict = `Disqualified by academic gate: ${ineligibilityReason}.`;
      } else if (overallFit >= 85) {
        explainabilityVerdict = `Top tier match with ${matchedSkills.length}/${currentDrive.requiredSkills.length} core technical requirements and high corporate readiness index.`;
      } else if (overallFit >= 70) {
        explainabilityVerdict = `Strong candidate with solid aptitude, though lacking prior experience in ${missingSkills.slice(0, 2).join(', ')}.`;
      } else {
        explainabilityVerdict = `Moderate fit. Requires upskilling on key domain skills before client rounds.`;
      }

      const improvementTip =
        missingSkills.length > 0
          ? `Complete immediate review on: ${missingSkills.join(', ')}.`
          : 'Practice system design and STAR behavioral interview frameworks.';

      return {
        studentId: std.id,
        studentName: std.name,
        usn: std.usn,
        branch: std.branch,
        cgpa: std.cgpa,
        readinessScore: std.readinessScore,
        overallFitScore: Math.min(99, overallFit),
        academicScore,
        technicalScore: techScore,
        projectScore,
        assessmentScore,
        isEligible: isAcademicEligible,
        ineligibilityReason,
        matchedSkills,
        missingSkills,
        explainabilityVerdict,
        improvementTip,
        shortlisted: shortlistedSet.has(std.id),
      };
    });
  }, [students, currentDrive, shortlistedSet]);

  // Sort by overallFitScore desc
  const sortedCandidates = useMemo(() => {
    return [...candidateScores]
      .sort((a, b) => b.overallFitScore - a.overallFitScore)
      .filter((c) => {
        const matchesEligible = !filterEligibleOnly || c.isEligible;
        const matchesBranch = selectedBranch === 'All' || c.branch === selectedBranch;
        const matchesScore = c.overallFitScore >= minFitScore;
        const matchesSearch =
          c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.usn.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesEligible && matchesBranch && matchesScore && matchesSearch;
      });
  }, [candidateScores, filterEligibleOnly, selectedBranch, minFitScore, searchQuery]);

  const toggleShortlist = (studentId: string) => {
    setShortlistedSet((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleShortlistAllEligible = () => {
    const eligibleIds = candidateScores.filter((c) => c.isEligible).map((c) => c.studentId);
    setShortlistedSet((prev) => {
      const next = new Set(prev);
      eligibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleExportCSV = () => {
    const headers = 'USN,Student Name,Branch,CGPA,Overall Fit Score,Academic Status,Technical Score,Shortlisted\n';
    const rows = sortedCandidates
      .map(
        (c) =>
          `"${c.usn}","${c.studentName}","${c.branch}",${c.cgpa},${c.overallFitScore}%,"${
            c.isEligible ? 'Eligible' : 'Ineligible'
          }",${c.technicalScore}%,${c.shortlisted ? 'YES' : 'NO'}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDrive?.companyName.replace(/\s+/g, '_')}_Shortlist_${new Date()
      .toISOString()
      .split('T')[0]}.csv`;
    a.click();
  };

  const triggerLiveAiDeepMatch = async (student: StudentProfile) => {
    setEvaluatingStudent(student);
    setIsDeepMatching(true);
    setDeepAiMatch(null);

    try {
      const res = await fetch('/api/gemini/match-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          drive: currentDrive,
        }),
      });
      const data = await res.json();
      if (data.match) {
        setDeepAiMatch(data.match);
      }
    } catch (err) {
      console.error('Error in deep AI match:', err);
    } finally {
      setIsDeepMatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Drive Selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Intelligent Candidate Match &amp; Explainable Ranking
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-dimensional AI matching across academic cutoffs, skill overlaps, coding benchmarks, and explainability verdicts.
          </p>
        </div>

        {/* Corporate Drive Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Active Drive:</span>
          <select
            value={activeDriveId}
            onChange={(e) => {
              setActiveDriveId(e.target.value);
              onSelectDriveId?.(e.target.value);
            }}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-indigo-950 dark:text-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.companyName} — {d.roleTitle} ({d.ctcLPA} LPA)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Drive Criteria Strip */}
      {currentDrive && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentDrive.logo}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm">{currentDrive.companyName}</span>
                <span className="bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono text-[10px]">
                  {currentDrive.ctcLPA} LPA
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                  Min CGPA: {currentDrive.minCGPA}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300 text-[11px] mt-0.5">
                <span>Max Backlogs: {currentDrive.maxBacklogsAllowed}</span>
                <span>•</span>
                <span>Branches: {currentDrive.eligibleBranches.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShortlistAllEligible}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Shortlist All Eligible</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1.5 rounded-lg transition text-xs flex items-center space-x-1 cursor-pointer border border-white/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Query Controls */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by student name, USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={filterEligibleOnly}
              onChange={(e) => setFilterEligibleOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Eligible Only</span>
          </label>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="All">All Branches</option>
            {['CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'Mechanical'].map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
            <span>Min Fit Score:</span>
            <input
              type="range"
              min={30}
              max={90}
              value={minFitScore}
              onChange={(e) => setMinFitScore(Number(e.target.value))}
              className="w-20 accent-indigo-600"
            />
            <span className="font-bold text-slate-900 dark:text-white w-8">{minFitScore}%</span>
          </div>

          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{sortedCandidates.length}</strong> candidates
          </span>
        </div>
      </div>

      {/* Candidate Ranking Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Rank &amp; Candidate</th>
                <th className="py-3 px-3">Branch &amp; CGPA</th>
                <th className="py-3 px-3">Eligibility Gate</th>
                <th className="py-3 px-3">Technical Overlap</th>
                <th className="py-3 px-3 text-center">AI Fit Score</th>
                <th className="py-3 px-4">Explainability Verdict</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCandidates.map((c, idx) => {
                const fullProfile = students.find((s) => s.id === c.studentId);
                const isTopThree = idx < 3;
                return (
                  <tr
                    key={c.studentId}
                    className={`hover:bg-slate-50/80 transition ${
                      c.shortlisted ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Rank & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-700/20 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{c.studentName}</span>
                            {c.shortlisted && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                Shortlisted
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{c.usn}</span>
                        </div>
                      </div>
                    </td>

                    {/* Branch & CGPA */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block">{c.branch}</span>
                      <span className="text-slate-500 text-[11px]">CGPA: {c.cgpa}</span>
                    </td>

                    {/* Eligibility Status */}
                    <td className="py-3 px-3">
                      {c.isEligible ? (
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Eligible
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-rose-200"
                          title={c.ineligibilityReason}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Ineligible
                        </span>
                      )}
                    </td>

                    {/* Technical Overlap */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">
                            {c.matchedSkills.length} matched
                          </span>
                          <span className="font-bold text-indigo-600">{c.technicalScore}%</span>
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${c.technicalScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* AI Fit Score */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-sm font-black px-2.5 py-0.5 rounded-lg ${
                            c.overallFitScore >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.overallFitScore >= 70
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.overallFitScore}%
                        </span>
                      </div>
                    </td>

                    {/* Explainability Verdict */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {c.explainabilityVerdict}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Shortlist */}
                        <button
                          onClick={() => toggleShortlist(c.studentId)}
                          className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition cursor-pointer ${
                            c.shortlisted
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {c.shortlisted ? 'Shortlisted' : 'Shortlist'}
                        </button>

                        {/* Deep Explainability Drawer Trigger */}
                        {fullProfile && (
                          <button
                            onClick={() => triggerLiveAiDeepMatch(fullProfile)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition cursor-pointer"
                            title="View Deep Explainability & Interview Questions"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Deep Evaluation & Explainability Modal */}
      {evaluatingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-modal-pop">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Explainable Fit Diagnostic: {evaluatingStudent.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target: {currentDrive.companyName} — {currentDrive.roleTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEvaluatingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {isDeepMatching ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="font-semibold text-slate-700">
                    Computing multi-dimensional neural match and STAR interview prompts...
                  </p>
                </div>
              ) : deepAiMatch ? (
                <>
                  {/* Multi-Dimensional Radar Bar Breakdown */}
                  <div>
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block mb-2">
                      Multi-Dimensional Fit Evaluation
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Overall Fit</span>
                        <span className="text-xl font-black text-indigo-600">
                          {deepAiMatch.overallFitScore}%
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Technical</span>
                        <span className="text-xl font-black text-slate-800">
                          {deepAiMatch.technicalScore}%
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Academic</span>
                        <span className="text-xl font-black text-slate-800">
                          {deepAiMatch.academicScore}%
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Projects</span>
                        <span className="text-xl font-black text-slate-800">
                          {deepAiMatch.projectScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explainability Verdict */}
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-950">
                    <span className="font-bold block text-xs mb-1">Explainability Verdict:</span>
                    <p className="leading-relaxed">{deepAiMatch.explainabilityVerdict}</p>
                  </div>

                  {/* Skills Match vs Missing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                      <span className="font-bold text-emerald-900 block mb-1.5 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                        Matched Required Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {deepAiMatch.matchedSkills?.map((s: string) => (
                          <span key={s} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                      <span className="font-bold text-amber-900 block mb-1.5 flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 mr-1" />
                        Identified Skill Gaps
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {deepAiMatch.missingSkills?.length > 0 ? (
                          deepAiMatch.missingSkills.map((s: string) => (
                            <span key={s} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Zero critical gaps detected!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interview Preparation Prompts for Recruiter/TPO */}
                  {deepAiMatch.suggestedInterviewQuestions && (
                    <div>
                      <span className="font-bold text-slate-900 block text-xs mb-2">
                        Suggested Technical Screening Questions:
                      </span>
                      <ul className="space-y-1.5 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 list-disc list-inside">
                        {deepAiMatch.suggestedInterviewQuestions.map((q: string, i: number) => (
                          <li key={i} className="leading-relaxed">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvement tip */}
                  {deepAiMatch.improvementTip && (
                    <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700">
                      <span className="font-bold block text-slate-900">Immediate Prep Advice:</span>
                      <p className="mt-0.5">{deepAiMatch.improvementTip}</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
