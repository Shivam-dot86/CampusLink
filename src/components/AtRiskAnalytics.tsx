import React, { useState } from 'react';
import {
  AlertTriangle,
  Users,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingDown,
  Clock,
  Send,
  Download,
  Filter,
  Search,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { StudentProfile } from '../types';

interface AtRiskAnalyticsProps {
  students: StudentProfile[];
  onOpenStudentProfile: (student: StudentProfile) => void;
}

export const AtRiskAnalytics: React.FC<AtRiskAnalyticsProps> = ({
  students,
  onOpenStudentProfile,
}) => {
  const [filterReason, setFilterReason] = useState<string>('All');
  const [assignedMentors, setAssignedMentors] = useState<Record<string, string>>({
    'std-105': 'Prof. Raghavan (CSE Lead)',
  });

  // AI Predictive Risk Audit Modal State
  const [auditStudent, setAuditStudent] = useState<StudentProfile | null>(null);
  const [isAuditingRisk, setIsAuditingRisk] = useState<boolean>(false);
  const [riskAuditData, setRiskAuditData] = useState<any>(null);

  const handleRunAiRiskRadar = async (student: StudentProfile) => {
    setAuditStudent(student);
    setIsAuditingRisk(true);
    setRiskAuditData(null);
    try {
      const res = await fetch('/api/gemini/predict-at-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student })
      });
      const data = await res.json();
      if (data.success) {
        setRiskAuditData(data);
      }
    } catch (err) {
      console.error('Error running AI risk prediction:', err);
    } finally {
      setIsAuditingRisk(false);
    }
  };

  const atRiskStudents = students.filter((s) => s.isAtRisk || s.activeBacklogs > 0 || s.attendancePercent < 75);

  const filtered = atRiskStudents.filter((s) => {
    if (filterReason === 'Backlogs') return s.activeBacklogs > 0;
    if (filterReason === 'Attendance') return s.attendancePercent < 75;
    if (filterReason === 'MockScore') return s.mockInterviewScore < 60;
    return true;
  });

  const assignMentor = (studentId: string, mentorName: string) => {
    setAssignedMentors((prev) => ({
      ...prev,
      [studentId]: mentorName,
    }));
  };

  const handleExportAtRiskReport = () => {
    const headers = 'USN,Student Name,Branch,CGPA,Active Backlogs,Attendance %,Mock Score %,Assigned Mentor,Primary Risk\n';
    const rows = filtered
      .map(
        (s) =>
          `"${s.usn}","${s.name}","${s.branch}",${s.cgpa},${s.activeBacklogs},${s.attendancePercent}%,${s.mockInterviewScore}%,"${
            assignedMentors[s.id] || 'Unassigned'
          }","${(s.riskReasons || []).join('; ')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAMPUSLINK_AtRisk_Intervention_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Predictive At-Risk Student Radar &amp; Remedial Interventions</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              {atRiskStudents.length} Students Monitored
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Proactive intervention engine identifying academic backlogs, low mock test performance, and attendance dips before recruiter cutoffs lock.
          </p>
        </div>

        <button
          onClick={handleExportAtRiskReport}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Export Intervention Audit CSV</span>
        </button>
      </div>

      {/* Recommended Rooman Intervention Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <BookOpen className="w-4 h-4" />
            <span>Track A: DSA &amp; Coding Accelerator</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            4-week intense problem-solving cohort focusing on LeetCode patterns for students with &lt;100 coding problems.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">18 Students Enrolled</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">88% Completion</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <Clock className="w-4 h-4" />
            <span>Track B: Academic Backlog Clearance</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            Faculty-led evening tutorial clinics targeted at clearing Math &amp; Core engineering backlog subjects.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">12 Students Enrolled</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">Special Exam Slot</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Track C: Corporate Soft Skills &amp; Mock HR</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
            1-on-1 Rooman corporate trainer sessions addressing interview anxiety, STAR storytelling, and resume polishing.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">14 Students Enrolled</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Filter By Risk Vector:</span>
          {(['All', 'Backlogs', 'Attendance', 'MockScore'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterReason(r)}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterReason === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {r === 'All' ? 'All Risks' : r === 'Backlogs' ? 'Active Backlogs' : r === 'Attendance' ? 'Low Attendance (<75%)' : 'Mock Score (<60%)'}
            </button>
          ))}
        </div>

        <span className="text-slate-400 dark:text-slate-500 text-[11px]">
          Showing {filtered.length} priority students
        </span>
      </div>

      {/* At Risk Student Grid */}
      <div className="space-y-3">
        {filtered.map((s) => {
          const mentor = assignedMentors[s.id];
          return (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Student Info */}
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</h3>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      {s.usn}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {s.branch} • CGPA: {s.cgpa}
                    </span>
                  </div>

                  {/* Risk Badges */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.activeBacklogs > 0 && (
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                        {s.activeBacklogs} Active Backlog{s.activeBacklogs > 1 ? 's' : ''}
                      </span>
                    )}
                    {s.attendancePercent < 75 && (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        Attendance: {s.attendancePercent}% (Mandatory 75%)
                      </span>
                    )}
                    {s.mockInterviewScore < 60 && (
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        Mock Interview: {s.mockInterviewScore}%
                      </span>
                    )}
                  </div>

                  {s.riskReasons && (
                    <ul className="mt-2 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {s.riskReasons.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right Mentor & Action Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Assigned Mentor</span>
                  {mentor ? (
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded block">
                      {mentor}
                    </span>
                  ) : (
                    <select
                      onChange={(e) => assignMentor(s.id, e.target.value)}
                      defaultValue=""
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200"
                    >
                      <option value="" disabled>
                        + Assign Faculty Mentor
                      </option>
                      <option value="Prof. Raghavan (CSE)">Prof. Raghavan (CSE)</option>
                      <option value="Dr. Sangeetha (IT)">Dr. Sangeetha (IT)</option>
                      <option value="Rooman Career Counselor">Rooman Career Counselor</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRunAiRiskRadar(s)}
                    className="bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 cursor-pointer shadow-xs text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Risk Radar</span>
                  </button>

                  <button
                    onClick={() => onOpenStudentProfile(s)}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 cursor-pointer shadow-xs text-xs"
                  >
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Predictive Risk Radar Modal */}
      {auditStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    AI Predictive At-Risk Radar &amp; Remedial Roadmap
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Evaluating {auditStudent.name} ({auditStudent.usn} • {auditStudent.branch}) via Gemini 3.8-Flash
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAuditStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {isAuditingRisk ? (
                <div className="py-12 text-center space-y-3">
                  <span className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block" />
                  <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
                    Analyzing historical drive cutoffs, LeetCode trajectory &amp; attendance metrics...
                  </p>
                  <p className="text-xs text-slate-400">
                    Generating customized 4-week turnaround milestone plan
                  </p>
                </div>
              ) : riskAuditData ? (
                <>
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                          Unplaced Probability
                        </span>
                        <span className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1 block">
                          {riskAuditData.unplacedProbabilityPercent}%
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        {riskAuditData.riskSeverity} Risk
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        Projected Post-Remedial Impact
                      </span>
                      <p className="text-[11px] text-emerald-900 dark:text-emerald-200 font-semibold mt-1 leading-snug">
                        {riskAuditData.expectedImpact}
                      </p>
                    </div>
                  </div>

                  {/* Core Risk Drivers */}
                  {riskAuditData.coreRiskDrivers && riskAuditData.coreRiskDrivers.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Core Placement Risk Drivers</span>
                      </span>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                        {riskAuditData.coreRiskDrivers.map((driver: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 4-Week Remedial Sprint Roadmap */}
                  {riskAuditData.remedialRoadmap && (
                    <div className="space-y-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
                        Proactive 4-Week Turnaround Sprint Roadmap
                      </span>
                      <div className="space-y-2.5">
                        {riskAuditData.remedialRoadmap.map((step: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                                Week {step.week}: {step.title}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                Milestone: {step.milestone}
                              </span>
                            </div>
                            <ul className="pl-4 list-disc text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                              {(step.actions || []).map((act: string, j: number) => (
                                <li key={j}>{act}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-2">
              <button
                onClick={() => setAuditStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (auditStudent) onOpenStudentProfile(auditStudent);
                  setAuditStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Open Full Student Clinic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
