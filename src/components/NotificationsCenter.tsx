import React, { useState } from 'react';
import {
  Bell,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Copy,
  Plus,
  Loader2
} from 'lucide-react';
import { BroadcastNotification, RecruiterDrive } from '../types';

interface NotificationsCenterProps {
  notifications: BroadcastNotification[];
  drives: RecruiterDrive[];
  onSendNotification: (notif: BroadcastNotification) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  drives,
  onSendNotification,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'WhatsApp' | 'Email' | 'SMS' | 'Portal'>('WhatsApp');
  const [targetPurpose, setTargetPurpose] = useState('Shortlist Call Letter');
  const [selectedDriveCompany, setSelectedDriveCompany] = useState(drives[0]?.companyName || 'Rooman Technologies');
  const [targetAudience, setTargetAudience] = useState('Shortlisted Candidates');
  const [additionalDetails, setAdditionalDetails] = useState('Formal dress code, report at 09:00 AM sharp with 2 resume copies');

  const [isDrafting, setIsDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState<any | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleGenerateAiDraft = async () => {
    setIsDrafting(true);
    setDraftResult(null);

    try {
      const res = await fetch('/api/gemini/draft-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: targetPurpose,
          companyName: selectedDriveCompany,
          channel: selectedChannel,
          targetAudience,
          extraDetails: additionalDetails,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setDraftResult(data.draft);
      }
    } catch (err) {
      console.error('Error drafting notification:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleBroadcast = () => {
    if (!draftResult) return;

    const notif: BroadcastNotification = {
      id: `ntf-${Date.now()}`,
      title: draftResult.subjectOrHeadline || `${targetPurpose} - ${selectedDriveCompany}`,
      channel: selectedChannel,
      recipientsCount: 42,
      audience: targetAudience,
      message: draftResult.messageBody,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Delivered',
      openRatePercent: 95,
    };

    onSendNotification(notif);
    setDraftResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Automated Notification &amp; Placement Broadcast Engine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Multi-Channel Omnipresence
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Zero-friction communication over WhatsApp, Email, SMS, and Student Portals with AI-generated high-clarity call letters.
          </p>
        </div>
      </div>

      {/* Two Column Layout: AI Broadcast Generator & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Drafter */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Notification Drafter</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Compose optimized, tone-adjusted notices for WhatsApp, Email, or SMS in seconds.
              </p>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Delivery Channel</label>
            <div className="grid grid-cols-4 gap-2">
              {(['WhatsApp', 'Email', 'SMS', 'Portal'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition border ${
                    selectedChannel === ch
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ch === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5" />}
                  {ch === 'Email' && <Mail className="w-3.5 h-3.5" />}
                  {ch === 'SMS' && <Smartphone className="w-3.5 h-3.5" />}
                  {ch === 'Portal' && <Bell className="w-3.5 h-3.5" />}
                  <span>{ch}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Purpose & Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Broadcast Purpose</label>
              <select
                value={targetPurpose}
                onChange={(e) => setTargetPurpose(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                <option value="Shortlist Call Letter">Shortlist Call Letter</option>
                <option value="Drive Schedule Announcement">Drive Announcement</option>
                <option value="Online Assessment Credentials">Assessment Link</option>
                <option value="Document Submission Reminder">Document Reminder</option>
                <option value="Offer Letter Congratulations">Offer Congratulations</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Recruiter / Drive</label>
              <select
                value={selectedDriveCompany}
                onChange={(e) => setSelectedDriveCompany(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                {drives.map((d) => (
                  <option key={d.id} value={d.companyName}>
                    {d.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audience & Extra Instructions */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              placeholder="e.g. Shortlisted CSE/IT Candidates for Round 2"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Instructions / Venue / Deadlines
            </label>
            <textarea
              rows={2}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
              placeholder="e.g. Bring resume, photo ID, dress formally"
            />
          </div>

          <button
            onClick={handleGenerateAiDraft}
            disabled={isDrafting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isDrafting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Official Broadcast Notice</span>
              </>
            )}
          </button>

          {/* AI Draft Result Preview */}
          {draftResult && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900">{draftResult.subjectOrHeadline}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {selectedChannel} Ready
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 whitespace-pre-line font-sans text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">
                {draftResult.messageBody}
              </div>

              {draftResult.keyChecklist && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] mb-1">
                    Mandatory Candidate Checklist:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {draftResult.keyChecklist.map((c: string, idx: number) => (
                      <span key={idx} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded text-[10px]">
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(draftResult.messageBody);
                    setCopiedMessage(true);
                    setTimeout(() => setCopiedMessage(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedMessage ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={handleBroadcast}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Broadcast History & Analytics */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Broadcast Logs &amp; Delivery</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Audience reach &amp; read confirmation receipts</p>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`p-1.5 rounded-lg text-white font-bold text-[10px] ${
                        n.channel === 'WhatsApp'
                          ? 'bg-emerald-600'
                          : n.channel === 'Email'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                      }`}
                    >
                      {n.channel}
                    </span>
                    <h4 className="font-bold text-slate-900">{n.title}</h4>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {n.status}
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] line-clamp-2 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Audience: {n.audience} ({n.recipientsCount} recipients)</span>
                  <span>Sent: {n.sentAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
