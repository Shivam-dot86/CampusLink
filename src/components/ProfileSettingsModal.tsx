import React, { useState } from 'react';
import { User, Shield, Bell, Key, X, Check, Save } from 'lucide-react';
import { UserAccount, useAuth } from '../context/AuthContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-modal-pop">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Profile &amp; Institutional Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your verified credentials and notification dispatches.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Full Legal / Academic Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Active Role &amp; Authorization Enclave
            </span>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white">
                {role}
              </span>
              <span className="text-slate-500 text-[11px]">{user?.title}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Placement Alert Channels
            </span>
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300">WhatsApp Instant Broadcasts (Preferred)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Institutional Email Digests</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Emergency SMS Alerts for Room &amp; Schedule Clashes</span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
