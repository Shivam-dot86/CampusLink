import React, { useState } from 'react';
import {
  FileCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  FileText,
  Download,
  Search,
  Sparkles,
  X,
  UserCheck,
  ShieldCheck,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OfferRecord, StudentProfile } from '../types';

interface OfferTrackingProps {
  offers: OfferRecord[];
  students: StudentProfile[];
  onUpdateOfferStatus: (offerId: string, newStatus: OfferRecord['status']) => void;
  onUpdateDocumentVerified: (offerId: string, docIndex: number, verified: boolean) => void;
}

export const OfferTracking: React.FC<OfferTrackingProps> = ({
  offers,
  students,
  onUpdateOfferStatus,
  onUpdateDocumentVerified,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);

  // AI Offer & Bond Risk Analyzer state
  const [isAnalyzingOffer, setIsAnalyzingOffer] = useState(false);
  const [offerAnalysis, setOfferAnalysis] = useState<any>(null);

  const handleAnalyzeOfferAi = async (offer: OfferRecord) => {
    setIsAnalyzingOffer(true);
    setOfferAnalysis(null);
    try {
      const res = await fetch('/api/gemini/analyze-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer })
      });
      const data = await res.json();
      if (data.success) {
        setOfferAnalysis(data);
      }
    } catch (err) {
      console.error('Error analyzing offer letter:', err);
    } finally {
      setIsAnalyzingOffer(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.usn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (offer: OfferRecord, newStatus: OfferRecord['status']) => {
    onUpdateOfferStatus(offer.id, newStatus);
    if (newStatus === 'Joined' || newStatus === 'Accepted') {
      // Trigger joyful celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
      });
    }
  };

  const totalOffersCount = offers.length;
  const joinedCount = offers.filter((o) => o.status === 'Joined').length;
  const verifiedCount = offers.filter((o) => o.status === 'Verified' || o.status === 'Joined').length;
  const avgCTC =
    offers.length > 0
      ? (offers.reduce((acc, curr) => acc + curr.ctcLPA, 0) / offers.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Offer Letters, KYC &amp; Corporate Joining Tracking</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              {offers.length} Offers Issued
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end audit trail of corporate offer letters, academic clearance document verification, and joining onboarding milestones.
          </p>
        </div>

        {/* Celebration stats pill */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <span className="text-slate-500 dark:text-slate-400">Average CTC:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{avgCTC} LPA</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
            <PartyPopper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{joinedCount} Joined Corporate</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Offers Issued
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{totalOffersCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">100% digitally verified</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Offer Acceptance
          </span>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {Math.round(((joinedCount + offers.filter((o) => o.status === 'Accepted').length) / Math.max(1, offers.length)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Low backed out rate</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Documentation Verified
          </span>
          <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">{verifiedCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Degree &amp; KYC audited</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Joining Confirmed
          </span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{joinedCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Onboarding active</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student, USN, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 dark:text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Offer Issued">Offer Issued</option>
            <option value="Accepted">Accepted</option>
            <option value="Documentation Pending">Documentation Pending</option>
            <option value="Verified">Verified</option>
            <option value="Joined">Joined</option>
            <option value="Backed Out">Backed Out</option>
          </select>
        </div>
      </div>

      {/* Offer Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student &amp; USN</th>
                <th className="py-3 px-3">Recruiter &amp; Role</th>
                <th className="py-3 px-3">CTC Package</th>
                <th className="py-3 px-3">Joining Date</th>
                <th className="py-3 px-3">Document KYC</th>
                <th className="py-3 px-3">Offer Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredOffers.map((offer) => {
                const verifiedDocsCount = offer.documents.filter((d) => d.verified).length;
                const totalDocsCount = offer.documents.length;
                const isDocsComplete = verifiedDocsCount === totalDocsCount;

                return (
                  <tr key={offer.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{offer.studentName}</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {offer.usn} • {offer.branch}
                        </span>
                      </div>
                    </td>

                    {/* Company & Role */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-bold text-indigo-950 dark:text-indigo-300 block">{offer.companyName}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{offer.role}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{offer.workLocation}</span>
                      </div>
                    </td>

                    {/* CTC */}
                    <td className="py-3.5 px-3">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        {offer.ctcLPA} LPA
                      </span>
                      {offer.bondYears ? (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded font-medium">
                          {offer.bondYears} Yr Bond
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-medium">
                          No Bond
                        </span>
                      )}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 block">{offer.joiningDate}</span>
                      <span className="text-[10px] text-slate-400">
                        Deadline: {offer.acceptanceDeadline}
                      </span>
                    </td>

                    {/* Document Checklist */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => setSelectedOffer(offer)}
                        className="flex items-center space-x-1 text-slate-700 hover:text-indigo-600 font-medium"
                      >
                        <ShieldCheck
                          className={`w-4 h-4 ${
                            isDocsComplete ? 'text-emerald-500' : 'text-amber-500'
                          }`}
                        />
                        <span>
                          {verifiedDocsCount}/{totalDocsCount} Verified
                        </span>
                      </button>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-3">
                      <select
                        value={offer.status}
                        onChange={(e) =>
                          handleStatusChange(offer, e.target.value as OfferRecord['status'])
                        }
                        className={`text-xs font-bold rounded-lg px-2 py-1 border transition cursor-pointer ${
                          offer.status === 'Joined'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : offer.status === 'Verified'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                            : offer.status === 'Accepted'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        <option value="Offer Issued">Offer Issued</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Documentation Pending">Documentation Pending</option>
                        <option value="Verified">Verified</option>
                        <option value="Joined">Joined (Corporate)</option>
                        <option value="Backed Out">Backed Out</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOffer(offer)}
                        className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 px-3 py-1 rounded-lg font-semibold transition"
                      >
                        Verify Docs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Verification & Audit Checklist Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Document Verification Checklist
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  {selectedOffer.studentName} ({selectedOffer.usn}) — {selectedOffer.companyName}
                </p>
              </div>

              <button
                onClick={() => setSelectedOffer(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedOffer.documents.map((doc, idx) => (
                <div
                  key={doc.name}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">{doc.name}</span>
                      {doc.fileUploaded ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          ✓ Uploaded: {doc.fileUploaded}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">Pending candidate upload</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onUpdateDocumentVerified(selectedOffer.id, idx, !doc.verified);
                      // mutate local modal view
                      doc.verified = !doc.verified;
                    }}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      doc.verified
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {doc.verified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              ))}
            </div>

            {/* AI Offer & Bond Risk Audit Section */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Gemini Legal Bond &amp; CTC Deconstruction</span>
                </span>
                <button
                  onClick={() => handleAnalyzeOfferAi(selectedOffer)}
                  disabled={isAnalyzingOffer}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800 transition flex items-center space-x-1 cursor-pointer"
                >
                  {isAnalyzingOffer ? (
                    <>
                      <span className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Audit Offer Letter</span>
                    </>
                  )}
                </button>
              </div>

              {offerAnalysis && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-800/80">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Legal Risk: {offerAnalysis.riskRating}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
                      Fixed: ₹{offerAnalysis.fixedBaseLpa}L | Variable: ₹{offerAnalysis.variableBonusLpa}L
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Bond Lock-in</span>
                      <span className="font-bold text-slate-900 dark:text-white">{offerAnalysis.bondPeriodMonths} Months</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Liquidated Damages</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{offerAnalysis.bondPenaltyAmount}</span>
                    </div>
                  </div>

                  {offerAnalysis.hiddenCaveats && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Identified Clauses &amp; Caveats
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                        {offerAnalysis.hiddenCaveats.map((c: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-amber-500 font-bold">⚠</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[11px] text-indigo-900 dark:text-indigo-200 bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900">
                    <span className="font-bold">Auditor Verdict: </span>
                    {offerAnalysis.legalVerdict}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Placement Cell Rooman Technologies KYC Protocol
              </span>
              <button
                onClick={() => setSelectedOffer(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
