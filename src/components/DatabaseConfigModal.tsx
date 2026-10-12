import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Server,
  Layers,
  Check,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { api } from '../api';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnected
}) => {
  const [uri, setUri] = useState('');
  const [showUri, setShowUri] = useState(false);
  const [status, setStatus] = useState<{
    connected: boolean;
    uriConfigured: boolean;
    clusterHost?: string;
    databaseName?: string;
    mode: string;
    lastError?: string;
    modelsLoaded: string[];
  }>({
    connected: false,
    uriConfigured: false,
    mode: 'Checking...',
    modelsLoaded: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedExample, setCopiedExample] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.mongodb.getStatus();
      setStatus({
        connected: res.connected,
        uriConfigured: res.uriConfigured,
        clusterHost: res.clusterHost,
        databaseName: res.databaseName,
        mode: res.mode,
        lastError: res.lastError,
        modelsLoaded: res.modelsLoaded || []
      });
      if (res.connected) {
        setErrorMsg(null);
      }
    } catch (e: any) {
      console.warn('Could not fetch mongo status:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uri.trim()) {
      setErrorMsg('Please paste a valid MongoDB connection string.');
      return;
    }

    if (!uri.trim().startsWith('mongodb://') && !uri.trim().startsWith('mongodb+srv://')) {
      setErrorMsg('Connection string must start with mongodb:// or mongodb+srv://');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await api.mongodb.connect(uri.trim());
      if (result.connected) {
        setSuccessMsg(`Successfully connected to MongoDB Atlas (${result.databaseName || 'campuslink'})! All collections including 'users' are synced.`);
        setStatus(result);
        if (onConnected) onConnected();
      } else {
        setStatus(result);
        if (result.lastError?.includes('bad auth') || result.lastError?.includes('Authentication failed')) {
          setErrorMsg('Authentication failed: Please check that you replaced <password> with your actual MongoDB user password.');
        } else if (result.lastError?.includes('whitelist') || result.lastError?.includes('IP') || result.lastError?.includes('timed out')) {
          setErrorMsg('Connection timed out: In MongoDB Atlas Network Access, ensure you have added IP 0.0.0.0/0 (Allow access from anywhere).');
        } else {
          setErrorMsg(result.lastError || 'Could not connect to MongoDB cluster. Please check your credentials and Atlas Network Access.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Connection failed. Please check the network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySampleFormat = () => {
    navigator.clipboard.writeText('mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/campuslink?retryWrites=true&w=majority');
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative transition-all duration-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl ${status.connected ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                MongoDB Atlas Setup
                {status.connected ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
                    Local Store Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste your Atlas connection URI to sync users, drives, and student records.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              Active Backend Storage:
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {status.mode}
            </span>
          </div>

          {status.connected && status.clusterHost && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Cluster Host:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 text-[11px] truncate max-w-[240px]">
                  {status.clusterHost}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Database:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {status.databaseName || 'campuslink'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Synced Collections:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  users, students, drives, pretalks, offers
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Atlas Connected Successfully!</p>
              <p className="mt-0.5 text-emerald-700 dark:text-emerald-300">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Connection Issue</p>
              <p className="mt-0.5 text-rose-700 dark:text-rose-300">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* URI Form */}
        <form onSubmit={handleConnect} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="mongo-uri-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Paste MongoDB Connection String (URI)
              </label>
              <button
                type="button"
                onClick={copySampleFormat}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedExample ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedExample ? 'Copied example' : 'Copy URI format'}
              </button>
            </div>

            <div className="relative">
              <textarea
                id="mongo-uri-input"
                rows={3}
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                placeholder="mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/campuslink?retryWrites=true&w=majority"
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Replace <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px] text-indigo-600 dark:text-indigo-300">&lt;password&gt;</code> with your MongoDB database user password.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !uri.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to MongoDB Atlas...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connect &amp; Sync Collections</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={fetchStatus}
              title="Refresh status"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Step-by-Step Instructions */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2.5">
            <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
            How to get your URI from cloud.mongodb.com:
          </h3>
          <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-decimal list-inside leading-relaxed pl-1">
            <li>Log in to <span className="font-semibold text-slate-800 dark:text-slate-200">cloud.mongodb.com</span> and go to <strong>Database / Clusters</strong>.</li>
            <li>Click the <strong>Connect</strong> button next to your cluster (e.g. <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Cluster0</code>).</li>
            <li>Select <strong>Drivers</strong> (Node.js) and copy the connection string.</li>
            <li>Replace <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">&lt;password&gt;</code> with your actual database user password.</li>
            <li>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Important:</span> Under Atlas <strong>Network Access</strong>, ensure IP <code className="font-mono text-[11px] bg-amber-50 dark:bg-amber-950/60 px-1 py-0.5 rounded text-amber-700 dark:text-amber-300">0.0.0.0/0</code> (Allow Access from Anywhere) is added so the cloud app can connect.
            </li>
          </ol>
        </div>

        {/* Or Paste in Chat Note */}
        <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
          <span className="font-bold shrink-0">💬 Tip:</span>
          <span>You can also simply paste your URI into the AI Studio chat message, and I will configure it automatically!</span>
        </div>
      </div>
    </div>
  );
};
