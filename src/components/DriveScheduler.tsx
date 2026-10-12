import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Plus,
  Users,
  Building2,
  X,
  Loader2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { DriveScheduleSlot, ScheduleConflict, RecruiterDrive } from '../types';

interface DriveSchedulerProps {
  slots: DriveScheduleSlot[];
  conflicts: ScheduleConflict[];
  drives: RecruiterDrive[];
  onAddSlot: (slot: DriveScheduleSlot) => void;
  onResolveConflict: (conflictId: string) => void;
}

export const DriveScheduler: React.FC<DriveSchedulerProps> = ({
  slots,
  conflicts,
  drives,
  onAddSlot,
  onResolveConflict,
}) => {
  const [selectedConflict, setSelectedConflict] = useState<ScheduleConflict | null>(null);
  const [aiResolution, setAiResolution] = useState<any | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Add slot modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState(drives[0]?.companyName || 'Rooman Technologies');
  const [newRound, setNewRound] = useState('Technical Interview Round 1');
  const [newDate, setNewDate] = useState('2026-09-27');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('13:00');
  const [newVenue, setNewVenue] = useState('Computer Lab 1');
  const [newInterviewers, setNewInterviewers] = useState(4);
  const [newBatch, setNewBatch] = useState('Shortlisted Cohort (40 Students)');

  const venuesList = [
    'Computer Lab 1 (120 seats)',
    'Computer Lab 2 (100 seats)',
    'Computer Lab 3 (80 seats)',
    'Main Auditorium (500 capacity)',
    'Placement Boardroom 1-4',
    'Seminar Hall 1',
    'Virtual / Proctored Online'
  ];

  const handleTriggerAiConflictResolver = async (conflict: ScheduleConflict) => {
    setSelectedConflict(conflict);
    setIsResolving(true);
    setAiResolution(null);

    try {
      const res = await fetch('/api/gemini/resolve-schedule-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflict,
          venues: venuesList,
        }),
      });
      const data = await res.json();
      if (data.resolution) {
        setAiResolution(data.resolution);
      }
    } catch (err) {
      console.error('Error resolving conflict:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleCreateSlot = () => {
    // Check if slot has conflict with existing slots on same date & venue
    const hasVenueClash = slots.some(
      (s) => s.date === newDate && s.venue.includes(newVenue) && s.startTime === newStartTime
    );

    const slot: DriveScheduleSlot = {
      id: `slot-${Date.now()}`,
      driveId: drives.find((d) => d.companyName === newCompany)?.id || 'drv-gen',
      companyName: newCompany,
      roundName: newRound,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      venue: newVenue,
      interviewerCount: Number(newInterviewers),
      studentBatch: newBatch,
      hasConflict: hasVenueClash,
      conflictDetails: hasVenueClash
        ? [`Time overlap with existing drive in ${newVenue} on ${newDate}`]
        : undefined,
    };

    onAddSlot(slot);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Conflict-Aware Placement Drive Scheduler</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {slots.length} Rounds Scheduled
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated collision detection across recruitment rounds, university semester exams, and infrastructure lab capacities.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule Round</span>
        </button>
      </div>

      {/* Active Conflict Warning Section */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/60 rounded-2xl p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                Active Schedule Collisions ({conflicts.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded">
              Requires TPO Action
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                      {c.type}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      Severity: {c.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2 leading-relaxed">
                    {c.description}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Involved: {c.involvedItems.join(' • ')}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleTriggerAiConflictResolver(c)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Clash Resolver</span>
                  </button>

                  <button
                    onClick={() => onResolveConflict(c.id)}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Matrix Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span>Placement Round Timeline &amp; Room Allocations</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Chronological order</span>
        </h3>

        <div className="space-y-3">
          {slots.map((s) => (
            <div
              key={s.id}
              className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                s.hasConflict
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-800/70'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    s.hasConflict
                      ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                      : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  <CalendarIcon className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{s.companyName}</span>
                    <span className="text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                      {s.roundName}
                    </span>
                    {s.hasConflict && (
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Clash Alert
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5">
                    <span className="flex items-center font-semibold text-indigo-900">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {s.date} • {s.startTime} - {s.endTime}
                    </span>
                    <span className="flex items-center text-slate-600">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {s.venue}
                    </span>
                    <span className="text-slate-500">• {s.studentBatch}</span>
                  </div>

                  {s.conflictDetails && (
                    <div className="mt-2 text-[11px] font-medium text-rose-800 bg-rose-100/60 p-1.5 rounded">
                      ⚠️ {s.conflictDetails.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Right status */}
              <div className="flex items-center space-x-3 justify-end">
                <span className="text-xs text-slate-500">
                  {s.interviewerCount} Interviewers
                </span>
                {s.hasConflict ? (
                  <button
                    onClick={() =>
                      handleTriggerAiConflictResolver({
                        id: s.id,
                        type: 'Venue Clashing',
                        severity: 'High',
                        description: s.conflictDetails?.[0] || 'Room clash detected',
                        involvedItems: [s.companyName, s.venue],
                        recommendedResolution: 'Reallocate venue or stagger timing',
                      })
                    }
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Resolve</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Conflict Free
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Conflict Resolver Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-modal-pop">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Drive Schedule Conflict Optimizer
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Conflict: {selectedConflict.type} ({selectedConflict.severity} Priority)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedConflict(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200">
                <span className="font-bold block">Issue Identified:</span>
                <p className="mt-0.5">{selectedConflict.description}</p>
              </div>

              {isResolving ? (
                <div className="py-10 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                  <p className="font-medium text-slate-600 dark:text-slate-400">
                    Scanning available labs, exam calendars, and student batch overlaps...
                  </p>
                </div>
              ) : aiResolution ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">
                       Recommended Optimization Plan:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {aiResolution.recommendedAction}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                        Optimal Time Window
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                        {aiResolution.suggestedTimeSlot}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                        Alternative Venues
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                        {aiResolution.alternativeVenues?.join(', ') || 'CAD Lab & Lab 2'}
                      </span>
                    </div>
                  </div>

                  {aiResolution.studentNotificationNote && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white block mb-1">
                        Automated Student Broadcast Memo:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 italic">
                        "{aiResolution.studentNotificationNote}"
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        onResolveConflict(selectedConflict.id);
                        setSelectedConflict(null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Apply Resolution &amp; Update Matrix</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Placement Drive Round</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recruiter / Drive</label>
              <select
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-medium focus:outline-hidden"
              >
                {drives.map((d) => (
                  <option key={d.id} value={d.companyName}>
                    {d.companyName} ({d.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Round Title</label>
              <input
                type="text"
                value={newRound}
                onChange={(e) => setNewRound(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="e.g. Technical Interview Round 1"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Allocated Venue</label>
                <select
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  {venuesList.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Interviewers Count</label>
                <input
                  type="number"
                  value={newInterviewers}
                  onChange={(e) => setNewInterviewers(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  min={1}
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSlot}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                Confirm &amp; Detect Clashes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
