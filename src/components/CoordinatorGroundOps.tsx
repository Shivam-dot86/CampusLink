import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Users,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Send,
  Clock,
  Building2,
  FileCheck2,
  Check,
  X,
  Search,
  Plus,
  MessageSquare,
  FileSpreadsheet,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  RecruiterDrive,
  StudentProfile,
  CoordinatorVolunteerTask,
  GroundIssueTicket,
  UserRole
} from '../types';

interface CoordinatorGroundOpsProps {
  drives: RecruiterDrive[];
  students: StudentProfile[];
  volunteers: CoordinatorVolunteerTask[];
  issues: GroundIssueTicket[];
  onBroadcastToStudents?: (msg: string) => void;
  onResolveIssue?: (issueId: string, notes: string) => void;
  onAssignVolunteerTask?: (task: CoordinatorVolunteerTask) => void;
}

export const CoordinatorGroundOps: React.FC<CoordinatorGroundOpsProps> = ({
  drives,
  students,
  volunteers: initialVolunteers,
  issues: initialIssues,
  onBroadcastToStudents,
  onResolveIssue,
  onAssignVolunteerTask
}) => {
  const [activeTab, setActiveTab] = useState<
    'schedule' | 'attendance' | 'volunteers' | 'live-tracker' | 'issues' | 'doc-check' | 'wrap-up'
  >('schedule');

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'Present' | 'Waiting' | 'No-Show'>>(() => {
    const map: Record<string, 'Present' | 'Waiting' | 'No-Show'> = {};
    students.forEach((s, idx) => {
      map[s.id] = idx < 3 ? 'Present' : idx === 3 ? 'Waiting' : 'Present';
    });
    return map;
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Live round tracker (Cleared vs Eliminated)
  const [roundClearance, setRoundClearance] = useState<Record<string, 'Cleared' | 'In Progress' | 'Eliminated'>>(() => {
    const map: Record<string, 'Cleared' | 'In Progress' | 'Eliminated'> = {};
    students.forEach((s, idx) => {
      map[s.id] = idx === 0 ? 'Cleared' : idx === 1 ? 'In Progress' : idx === 2 ? 'Cleared' : 'In Progress';
    });
    return map;
  });

  // Volunteers state
  const [volunteerList, setVolunteerList] = useState(initialVolunteers);
  const [newVolName, setNewVolName] = useState('Rahul M');
  const [newVolTask, setNewVolTask] = useState('Audi A Waiting Buffer Coordinator');
  const [newVolVenue, setNewVolVenue] = useState('Auditorium A');

  // Ground issues state
  const [issueList, setIssueList] = useState(initialIssues);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueSeverity, setNewIssueSeverity] = useState<'Critical' | 'Medium' | 'Low'>('Medium');
  const [newIssueVenue, setNewIssueVenue] = useState('Computer Lab 3');

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastAlert, setBroadcastAlert] = useState(false);

  // First-level doc verification
  const [docVerifications, setDocVerifications] = useState<Record<string, boolean>>({
    'std-101': true,
    'std-102': true,
    'std-103': false
  });

  const handleToggleAttendance = (studentId: string, status: 'Present' | 'Waiting' | 'No-Show') => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleToggleClearance = (studentId: string, status: 'Cleared' | 'In Progress' | 'Eliminated') => {
    setRoundClearance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleAddVolunteerTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVolName.trim()) return;
    const created: CoordinatorVolunteerTask = {
      id: `vol-${Date.now()}`,
      volunteerName: newVolName,
      usn: '1RM22CS099',
      branch: 'CSE',
      taskTitle: newVolTask,
      venue: newVolVenue,
      timeSlot: '01:00 PM - 05:00 PM',
      status: 'In Progress',
      priority: 'Normal'
    };
    setVolunteerList([created, ...volunteerList]);
    if (onAssignVolunteerTask) onAssignVolunteerTask(created);
    setNewVolName('');
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;
    const created: GroundIssueTicket = {
      id: `iss-${Date.now()}`,
      title: newIssueTitle,
      category: 'Lab WiFi / Power',
      severity: newIssueSeverity,
      driveId: drives[0]?.id || 'drv-01',
      companyName: drives[0]?.companyName || 'Amazon Web Services',
      venue: newIssueVenue,
      reportedBy: 'Prof. Shalini Rao (Coordinator)',
      timestamp: 'Just now',
      status: 'Open'
    };
    setIssueList([created, ...issueList]);
    setNewIssueTitle('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    if (onBroadcastToStudents) onBroadcastToStudents(broadcastText);
    setBroadcastAlert(true);
    setBroadcastText('');
    setTimeout(() => setBroadcastAlert(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Coordinator Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-purple-300" />
                Lead Placement Coordinator
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-400/20 text-purple-200 border border-purple-300/30">
                Ground Operations Control
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Day-Of-Drive Ground Command
            </h1>
            <p className="text-sm text-purple-100 max-w-xl leading-relaxed">
              Monitoring venues, interview panels, QR check-ins, student volunteer tasking, and real-time round clearing.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-purple-950 hover:bg-slate-100 shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-purple-700" />
              <span>Launch QR Scanner</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-8 pt-4 border-t border-white/20 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'schedule', label: "Today's Venues & Panels", icon: Calendar },
            { id: 'attendance', label: 'Attendance & Check-In', icon: CheckCircle2 },
            { id: 'live-tracker', label: 'Live Round Cleared Tracker', icon: Clock },
            { id: 'volunteers', label: 'Student Volunteer Roster', icon: Users, count: volunteerList.length },
            { id: 'issues', label: 'Ground Incident Log', icon: AlertTriangle, count: issueList.filter(i => i.status === 'Open').length },
            { id: 'doc-check', label: 'Document Pre-Verification', icon: FileCheck2 },
            { id: 'wrap-up', label: 'Drive Wrap-Up & Report', icon: FileSpreadsheet }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-white text-purple-950 shadow-md scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. TODAY'S VENUES & PANELS */}
      {activeTab === 'schedule' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Venue, Lab &amp; Panel Allocation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time status of physical rooms and assigned interview panels for today's drives.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { room: 'Auditorium A', event: 'AWS Placement Pre-Talk & Briefing', status: 'In Session', capacity: '250 Seats', incharge: 'Karthik Rao (Vol)' },
                { room: 'Computer Lab 3 (Turing)', event: 'AWS 90-Min Coding Assessment (Batch 1)', status: 'Active Coding', capacity: '60 Terminals', incharge: 'Nikhil Gowda (Vol)' },
                { room: 'Executive Rooms 1-6', event: 'Cisco Systems Technical Interviews', status: 'Panels Interviewing', capacity: '6 Private Panels', incharge: 'Tanvi Joshi (Vol)' }
              ].map((v, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{v.room}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {v.status}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">{v.event}</p>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>{v.capacity}</span>
                    <span>In-charge: {v.incharge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE & CHECK-IN */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Student Attendance &amp; Hall Check-In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark students present upon reporting to Auditorium / Labs before tests begin.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search USN or Name..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            {students
              .filter(
                (s) =>
                  s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                  s.usn.toLowerCase().includes(studentSearch.toLowerCase())
              )
              .map((s) => {
                const status = attendanceRecords[s.id] || 'Waiting';
                return (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                        <span className="text-[10px] text-slate-400">({s.usn})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {s.branch} • CGPA: {s.cgpa}
                      </span>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => handleToggleAttendance(s.id, 'Present')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                          status === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                        }`}
                      >
                        Present ✓
                      </button>
                      <button
                        onClick={() => handleToggleAttendance(s.id, 'Waiting')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                          status === 'Waiting'
                            ? 'bg-amber-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                        }`}
                      >
                        Waiting
                      </button>
                      <button
                        onClick={() => handleToggleAttendance(s.id, 'No-Show')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                          status === 'No-Show'
                            ? 'bg-rose-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                        }`}
                      >
                        No-Show ✕
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 3. LIVE ROUND TRACKER (CLEARED VS ELIMINATED) */}
      {activeTab === 'live-tracker' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Real-Time Round Advancement &amp; Elimination Tracker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update who cleared or was eliminated live as recruiters submit evaluation slips.
            </p>
          </div>

          <div className="space-y-2.5">
            {students.map((s) => {
              const state = roundClearance[s.id] || 'In Progress';
              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      USN: {s.usn} • {s.branch}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleClearance(s.id, 'Cleared')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        state === 'Cleared'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                      }`}
                    >
                      Cleared to Next Round ✓
                    </button>
                    <button
                      onClick={() => handleToggleClearance(s.id, 'In Progress')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        state === 'In Progress'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                      }`}
                    >
                      In Progress ⏳
                    </button>
                    <button
                      onClick={() => handleToggleClearance(s.id, 'Eliminated')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        state === 'Eliminated'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                      }`}
                    >
                      Eliminated ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. VOLUNTEER TEAM ROSTER */}
      {activeTab === 'volunteers' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student Placement Volunteer Roster &amp; Task Assignments
            </h3>

            {/* Quick Task Assign Form */}
            <form onSubmit={handleAddVolunteerTask} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="Volunteer Name..."
                value={newVolName}
                onChange={(e) => setNewVolName(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Task Description..."
                value={newVolTask}
                onChange={(e) => setNewVolTask(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Venue / Lab..."
                value={newVolVenue}
                onChange={(e) => setNewVolVenue(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
              >
                + Assign Task
              </button>
            </form>

            <div className="space-y-2.5 pt-2">
              {volunteerList.map((vol) => (
                <div
                  key={vol.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {vol.volunteerName} ({vol.branch})
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">{vol.taskTitle}</span>
                    <span className="text-[10px] text-slate-400 block">
                      Venue: {vol.venue} • {vol.timeSlot}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                    {vol.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. GROUND INCIDENT LOG */}
      {activeTab === 'issues' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ground Incident &amp; Discrepancy Log
            </h3>

            {/* Quick Report Form */}
            <form onSubmit={handleAddIssue} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="Issue Description..."
                value={newIssueTitle}
                onChange={(e) => setNewIssueTitle(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:col-span-2"
              />
              <select
                value={newIssueSeverity}
                onChange={(e) => setNewIssueSeverity(e.target.value as any)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Critical">Critical</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                type="submit"
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                + Log Incident
              </button>
            </form>

            <div className="space-y-2.5 pt-2">
              {issueList.map((iss) => (
                <div
                  key={iss.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          iss.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {iss.severity}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{iss.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Venue: {iss.venue} • Reported by: {iss.reportedBy} ({iss.timestamp})
                    </p>
                    {iss.resolutionNotes && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        ✓ {iss.resolutionNotes}
                      </p>
                    )}
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[10px]">
                    {iss.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. FIRST-LEVEL DOCUMENT PRE-CHECK */}
      {activeTab === 'doc-check' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              First-Level Document &amp; Marks Card Pre-Check Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify original documents on the ground before TPO issues final clearance.
            </p>
          </div>

          <div className="space-y-2.5">
            {students.slice(0, 4).map((s) => {
              const verified = docVerifications[s.id] ?? false;
              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      APAAR: {s.apaarRecord.apaarId} • CGPA: {s.cgpa}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setDocVerifications((prev) => ({ ...prev, [s.id]: !verified }))
                    }
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center space-x-1 ${
                      verified
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                    }`}
                  >
                    {verified ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{verified ? 'Pre-Checked ✓' : 'Mark Verified'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. POST-DRIVE WRAP-UP */}
      {activeTab === 'wrap-up' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-fade-in">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Post-Drive Wrap-Up &amp; Executive Summary Handoff
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit drive outcomes, feedback notes, and final selected lists to TPO.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
            <div className="flex justify-between font-bold">
              <span>Drive: Amazon Web Services (drv-01)</span>
              <span className="text-emerald-600">Final Selections: 12 Students</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              All 3 rounds concluded successfully. AWS recruiter panel expressed high satisfaction with candidate DSA depth. No pending grievances.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => alert('Drive executive wrap-up signed and transmitted to TPO Dr. Rajesh Hegde.')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
              >
                Transmit Final Summary to TPO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Simulation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl animate-modal-pop">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Camera QR Attendance Scanner
            </h3>
            <div className="w-48 h-48 mx-auto bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-purple-500 rounded-2xl flex items-center justify-center text-slate-400">
              <QrCode className="w-24 h-24 text-purple-600 animate-pulse" />
            </div>
            <p className="text-xs text-slate-500">
              Point camera at student's digital APAAR Card QR on mobile screen to log check-in.
            </p>
            <button
              onClick={() => {
                alert('Scanned Aarav Sharma (1RM21CS042). Marked Present.');
                setShowQrModal(false);
              }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Simulate Scan: Aarav Sharma
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
