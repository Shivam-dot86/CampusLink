import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Search,
  Plus,
  Radio,
  Download,
  Send,
  UserCheck
} from 'lucide-react';
import { PlacementPreTalk, StudentProfile, UserRole } from '../types';

interface PlacementPreTalksProps {
  preTalks: PlacementPreTalk[];
  students: StudentProfile[];
  userRole: UserRole;
  currentStudentId?: string;
  onRegisterForTalk: (talkId: string, studentId: string) => void;
  onMarkAttendance?: (talkId: string, studentId: string, attended: boolean) => void;
  onScheduleTalk?: (newTalk: PlacementPreTalk) => void;
}

export const PlacementPreTalks: React.FC<PlacementPreTalksProps> = ({
  preTalks,
  students,
  userRole,
  currentStudentId = 'std-101',
  onRegisterForTalk,
  onMarkAttendance,
  onScheduleTalk,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTalk, setSelectedTalk] = useState<PlacementPreTalk>(preTalks[0] || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'qna' | 'resources'>('overview');

  // Interactive Q&A local state
  const [qnaList, setQnaList] = useState<{ id: string; user: string; question: string; time: string; answer?: string }[]>([
    {
      id: 'q1',
      user: 'Aarav Sharma (CSE)',
      question: 'Is the 8th semester internship mandatory at Rooman HQ or can it be pursued remotely from campus?',
      time: '2 hours ago',
      answer: 'It is a hybrid format: 3 days on-site at Bengaluru Cloud Labs and 2 days remote with continuous mentor check-ins.'
    },
    {
      id: 'q2',
      user: 'Kavya Raghavan (EEE)',
      question: 'Are EEE graduates eligible for the AI Solutions track if we have verified Python certifications?',
      time: '1 hour ago',
      answer: 'Yes! Rooman recognizes students who completed the Rooman Python & Cloud Immersion or equivalent APAAR verified credits.'
    }
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  // Modal to schedule new PPT
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTalkForm, setNewTalkForm] = useState({
    companyName: '',
    date: '2026-09-30',
    time: '10:00 AM - 11:30 AM',
    speakerName: '',
    speakerDesignation: '',
    venueOrLink: 'Main Auditorium & Stream',
    mode: 'Hybrid' as 'In-Person Auditorium' | 'Virtual Live Stream' | 'Hybrid',
    ctcOverview: '₹10.0 LPA + ₹40,000/mo Internship',
    topics: 'Company Tech Stack, Role Expectations, Interview Process, Q&A'
  });

  const filteredTalks = preTalks.filter((talk) => {
    const matchesSearch =
      talk.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talk.speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talk.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || talk.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const currentStudent = students.find((s) => s.id === currentStudentId);
    setQnaList((prev) => [
      {
        id: `q-${Date.now()}`,
        user: currentStudent ? `${currentStudent.name} (${currentStudent.branch})` : 'Student',
        question: newQuestion.trim(),
        time: 'Just now'
      },
      ...prev
    ]);
    setNewQuestion('');
  };

  // AI Copilot response for Pre-Placement Talk Q&A
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  const handleAskAiCopilot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newQuestion.trim()) return;
    setIsAiAnswering(true);
    const qText = newQuestion.trim();
    try {
      const res = await fetch('/api/gemini/ppt-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveDetails: {
            company: selectedTalk.companyName,
            role: selectedTalk.topics.join(', '),
            ctc: selectedTalk.ctcOverview
          },
          question: qText
        })
      });
      const data = await res.json();
      if (data.success) {
        const currentStudent = students.find((s) => s.id === currentStudentId);
        const answerFormatted = `${data.answer} (Rounds: ${(data.relevantRounds || []).join(', ')}. ${data.eligibilityVerdict || ''})`;
        setQnaList((prev) => [
          {
            id: `q-${Date.now()}`,
            user: currentStudent ? `${currentStudent.name} (${currentStudent.branch})` : 'Student',
            question: qText,
            time: 'Just now',
            answer: answerFormatted
          },
          ...prev
        ]);
        setNewQuestion('');
      }
    } catch (err) {
      console.error('Error fetching AI PPT answer:', err);
    } finally {
      setIsAiAnswering(false);
    }
  };

  const handleCreateTalk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTalkForm.companyName) return;
    const created: PlacementPreTalk = {
      id: `ppt-${Date.now()}`,
      driveId: `drv-${Date.now()}`,
      companyName: newTalkForm.companyName,
      logo: '🏢',
      date: newTalkForm.date,
      time: newTalkForm.time,
      speaker: {
        name: newTalkForm.speakerName || 'Corporate Campus Lead',
        designation: newTalkForm.speakerDesignation || 'Talent Acquisition Director'
      },
      venueOrLink: newTalkForm.venueOrLink,
      mode: newTalkForm.mode,
      mandatoryForBranches: ['CSE', 'IT', 'AI&DS', 'ECE'],
      registeredCount: 0,
      topics: newTalkForm.topics.split(',').map((t) => t.trim()),
      ctcOverview: newTalkForm.ctcOverview,
      status: 'Scheduled',
      registeredStudentIds: [],
      qnaCount: 0
    };
    if (onScheduleTalk) {
      onScheduleTalk(created);
    }
    setShowScheduleModal(false);
  };

  const isCurrentStudentRegistered =
    selectedTalk?.registeredStudentIds?.includes(currentStudentId);

  return (
    <div id="placement-pre-talks-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Radio className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Placement Pre-Talks (PPT) Hub
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Corporate Briefings, Role Orientations, CTC Disclosures &amp; Mandatory Pre-Drive Orientations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {(userRole === 'TPO' || userRole === 'Recruiter' || userRole === 'Coordinator') && (
            <button
              id="schedule-ppt-btn"
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Pre-Talk</span>
            </button>
          )}

          <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mandatory Attendance Rule: Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Catalog / Right Talk Detailed Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pre-Talk Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company, speaker, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Live Now">Live Now</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Talk Cards List */}
          <div className="space-y-3">
            {filteredTalks.map((talk) => {
              const isSelected = selectedTalk?.id === talk.id;
              const isRegistered = talk.registeredStudentIds.includes(currentStudentId);

              return (
                <div
                  key={talk.id}
                  id={`ppt-card-${talk.id}`}
                  onClick={() => setSelectedTalk(talk)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-400/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-lg">
                        {talk.logo}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{talk.companyName}</h3>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              talk.status === 'Live Now'
                                ? 'bg-rose-500 text-white animate-pulse'
                                : talk.status === 'Completed'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {talk.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{talk.speaker.name} • {talk.speaker.designation}</p>
                      </div>
                    </div>

                    {isRegistered && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Attending
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{talk.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{talk.time}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[180px]">{talk.venueOrLink}</span>
                    </span>
                    <span className="font-medium text-indigo-600">
                      {talk.registeredCount} Registered
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTalks.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                No Pre-Placement Talks match your criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Selected Talk Dossier */}
        <div className="lg:col-span-7">
          {selectedTalk ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Talk Top Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-3xl">
                      {selectedTalk.logo}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-black text-white">{selectedTalk.companyName}</h2>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                          {selectedTalk.mode}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        Pre-Placement Talk (PPT) &amp; Technical Role Orientation
                      </p>
                    </div>
                  </div>

                  {/* Student RSVP Action */}
                  <div>
                    {isCurrentStudentRegistered ? (
                      <button
                        onClick={() => onRegisterForTalk(selectedTalk.id, currentStudentId)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition flex items-center space-x-1.5 shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Registered &amp; Confirmed</span>
                      </button>
                    ) : (
                      <button
                        id="register-for-ppt-btn"
                        onClick={() => onRegisterForTalk(selectedTalk.id, currentStudentId)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1.5 shadow-lg active:scale-95"
                      >
                        <Radio className="w-4 h-4 text-white animate-pulse" />
                        <span>Confirm Attendance (RSVP)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Key Logistics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 text-xs">
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-200 block">Date</span>
                    <span className="font-bold text-white">{selectedTalk.date}</span>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-200 block">Time</span>
                    <span className="font-bold text-white">{selectedTalk.time}</span>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-200 block">Venue / Link</span>
                    <span className="font-bold text-white truncate block">{selectedTalk.venueOrLink}</span>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-indigo-200 block">Audience</span>
                    <span className="font-bold text-white">{selectedTalk.mandatoryForBranches.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="border-b border-slate-200 bg-slate-50 px-6 flex space-x-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 border-b-2 transition ${
                    activeTab === 'overview'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Overview &amp; Agenda
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`py-3 border-b-2 transition flex items-center space-x-1 ${
                    activeTab === 'attendance'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>Student Attendance Roll</span>
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
                    {selectedTalk.registeredCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('qna')}
                  className={`py-3 border-b-2 transition flex items-center space-x-1 ${
                    activeTab === 'qna'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span>Interactive Q&amp;A</span>
                  <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full text-[10px]">
                    {qnaList.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`py-3 border-b-2 transition ${
                    activeTab === 'resources'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Decks &amp; Recordings
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Speaker Card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                          {selectedTalk.speaker.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{selectedTalk.speaker.name}</p>
                          <p className="text-[11px] text-slate-500">{selectedTalk.speaker.designation}</p>
                          <p className="text-[10px] text-indigo-600 font-medium">Guest Corporate Speaker</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg font-semibold text-slate-700 dark:text-slate-200">
                          {selectedTalk.companyName}
                        </span>
                      </div>
                    </div>

                    {/* CTC & Compensation Overview */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-800/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 mb-1">
                        Compensation &amp; Stipend Breakdown
                      </h4>
                      <p className="text-base font-extrabold text-indigo-950 dark:text-white">
                        {selectedTalk.ctcOverview}
                      </p>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1">
                        Full terms, benefits, health insurance, and bond/retention provisions explained during the talk.
                      </p>
                    </div>

                    {/* Pre-Talk Agenda Topics */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                        Key Briefing Agenda &amp; Focus Topics
                      </h4>
                      <div className="space-y-2">
                        {selectedTalk.topics.map((topic, i) => (
                          <div
                            key={i}
                            className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                          >
                            <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="font-medium">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mandatory Rule Notice */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Placement Cell Mandatory Policy:</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Students who do not attend the Pre-Placement Talk will have their drive registration flagged and will not receive the online assessment link.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        Registered Candidates for {selectedTalk.companyName} PPT ({selectedTalk.registeredStudentIds.length})
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Attendance verified for online assessment eligibility
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                      {students
                        .filter((s) => selectedTalk.registeredStudentIds.includes(s.id))
                        .map((std) => (
                          <div
                            key={std.id}
                            className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                                {std.name.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{std.name}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {std.usn} • {std.branch} • CGPA: {std.cgpa}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Attendance Confirmed
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'qna' && (
                  <div className="space-y-5">
                    {/* Ask Question Box */}
                    <form onSubmit={handlePostQuestion} className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Ask Recruiter / Coordinator a Question
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="e.g. Will there be negative marking in the coding assessment?"
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={handleAskAiCopilot}
                          disabled={isAiAnswering}
                          className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs"
                        >
                          {isAiAnswering ? (
                            <>
                              <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Thinking...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                              <span>Ask Copilot (AI)</span>
                            </>
                          )}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Post</span>
                        </button>
                      </div>
                    </form>

                    {/* Q&A Thread */}
                    <div className="space-y-3">
                      {qnaList.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">{item.user}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.time}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">{item.question}</p>

                          {item.answer && (
                            <div className="mt-2 pl-3 border-l-2 border-indigo-500 bg-white dark:bg-slate-800 p-2.5 rounded-r-lg">
                              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block">
                                Corporate Speaker Response:
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {selectedTalk.companyName}_Campus_Drive_2026_Deck.pdf
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Official Pre-Placement Talk Slides (4.8 MB)</p>
                        </div>
                      </div>

                      <a
                        href={selectedTalk.recordingOrDeckUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Live Recording &amp; Q&amp;A Session
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {selectedTalk.status === 'Completed'
                              ? 'Watch full archived recording (74 Mins)'
                              : 'Stream link active 15 mins prior to commencement'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Redirecting to video session for ${selectedTalk.companyName}...`)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Stream</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
              Select a Pre-Placement Talk to view details and register
            </div>
          )}
        </div>
      </div>

      {/* Schedule PPT Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-modal-pop">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Corporate Pre-Placement Talk</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTalk} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rooman Technologies"
                  value={newTalkForm.companyName}
                  onChange={(e) => setNewTalkForm({ ...newTalkForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newTalkForm.date}
                    onChange={(e) => setNewTalkForm({ ...newTalkForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Window</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 11:30 AM"
                    value={newTalkForm.time}
                    onChange={(e) => setNewTalkForm({ ...newTalkForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Speaker Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Manish Kumar"
                    value={newTalkForm.speakerName}
                    onChange={(e) => setNewTalkForm({ ...newTalkForm, speakerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Speaker Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Talent Director"
                    value={newTalkForm.speakerDesignation}
                    onChange={(e) => setNewTalkForm({ ...newTalkForm, speakerDesignation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / Online Link</label>
                <input
                  type="text"
                  value={newTalkForm.venueOrLink}
                  onChange={(e) => setNewTalkForm({ ...newTalkForm, venueOrLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">CTC &amp; Stipend Overview</label>
                <input
                  type="text"
                  value={newTalkForm.ctcOverview}
                  onChange={(e) => setNewTalkForm({ ...newTalkForm, ctcOverview: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Save Pre-Placement Talk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
