import React from 'react';
import { Clock, ShieldCheck, X, FileText, ArrowRight } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-modal-pop">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Multi-Role Audit Trail &amp; Activity Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable, timestamped record of operational changes and permissions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white">{log.actorName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    {log.actorRole}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">• {log.actionType}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{log.timestamp}</span>
              </div>

              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {log.details}
              </p>

              <span className="text-[10px] text-slate-400 block pt-0.5">
                Target: {log.targetEntity}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
