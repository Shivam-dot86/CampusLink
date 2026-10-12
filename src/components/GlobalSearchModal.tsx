import React, { useState, useEffect } from 'react';
import { Search, X, Briefcase, GraduationCap, Building2, Calendar, FileText, ArrowRight } from 'lucide-react';
import { StudentProfile, RecruiterDrive, CompanyMoU } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  drives: RecruiterDrive[];
  mous: CompanyMoU[];
  onNavigateTab: (tabId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  students,
  drives,
  mous,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled by parent
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.usn.toLowerCase().includes(query.toLowerCase()) ||
      s.branch.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDrives = drives.filter(
    (d) =>
      d.companyName.toLowerCase().includes(query.toLowerCase()) ||
      d.roleTitle.toLowerCase().includes(query.toLowerCase()) ||
      d.requiredSkills.some((sk) => sk.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredMous = mous.filter(
    (m) =>
      m.companyName.toLowerCase().includes(query.toLowerCase()) ||
      m.pocName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-modal-pop">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search students, drives, MoUs, skills, venues... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {/* Drives Results */}
          {filteredDrives.length > 0 && (
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-2">
                Placement Drives ({filteredDrives.length})
              </span>
              <div className="space-y-1.5">
                {filteredDrives.slice(0, 4).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onNavigateTab('drives');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {d.logo}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {d.companyName} — {d.roleTitle}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ₹{d.ctcLPA} LPA • Min CGPA: {d.minCGPA}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Students Results */}
          {filteredStudents.length > 0 && (
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-2">
                Students &amp; APAAR Records ({filteredStudents.length})
              </span>
              <div className="space-y-1.5">
                {filteredStudents.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigateTab('students');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {s.name} ({s.usn})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {s.branch} • CGPA: {s.cgpa} • APAAR: {s.apaarRecord.apaarId}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MoUs */}
          {filteredMous.length > 0 && (
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-2">
                Corporate MoUs ({filteredMous.length})
              </span>
              <div className="space-y-1.5">
                {filteredMous.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {m.companyName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {m.tier} • Valid Until {m.validUntil}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredDrives.length === 0 && filteredStudents.length === 0 && filteredMous.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press Esc to exit</span>
          <span>CAMPUSLINK Global Multi-Role Index</span>
        </div>
      </div>
    </div>
  );
};
