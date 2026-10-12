import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  Users,
  Briefcase,
  X,
  Loader2,
  ArrowRight,
  FileText
} from 'lucide-react';
import { RecruiterDrive, StudentBranch } from '../types';

interface RecruiterDrivesProps {
  drives: RecruiterDrive[];
  onSelectDriveForMatching: (driveId: string) => void;
  onAddNewDrive: (newDrive: RecruiterDrive) => void;
}

export const RecruiterDrives: React.FC<RecruiterDrivesProps> = ({
  drives,
  onSelectDriveForMatching,
  onAddNewDrive,
}) => {
  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [companyInput, setCompanyInput] = useState('Amazon Web Services (AWS)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  const sampleJDs = [
    {
      title: 'AWS Cloud Support Associate (Sample)',
      company: 'Amazon Web Services (AWS)',
      text: `Role: Cloud Support Associate
Location: Bengaluru / Hyderabad
Package: 14.5 LPA (Full Time)
Eligibility: B.E / B.Tech in CSE, IT, ECE with CGPA 7.5 and above. Maximum 0 active backlogs allowed.
Key Technical Requirements:
- Core networking concepts (TCP/IP, DNS, VPN, OSI layers)
- Linux operating system fundamentals and Bash scripting
- Programming experience in Python or Java
- Familiarity with AWS services like EC2, S3, RDS, IAM is preferred
- Good verbal and written analytical communication
Selection Process:
1. Online Assessment (Technical MCQs + 2 Coding Problems)
2. Technical Interview 1: Networking & Linux Deep Dive
3. Technical Interview 2: Problem Solving & Troubleshooting
4. HR & Cultural Fitment Round`
    },
    {
      title: 'Salesforce Developer Trainee (Sample)',
      company: 'Salesforce India',
      text: `Role: Associate Member of Technical Staff (AMTS)
Package: 18.0 LPA
Branches: CSE, IT, AI&DS. Min CGPA 8.0 with zero backlogs throughout.
Skills Required: Java, OOP, Data Structures, Algorithms, Relational Database & SQL, REST APIs.
Preferred: Apex, Lightning Web Components, JavaScript ES6.
Rounds: HackerRank Online Coding, 2 Rounds of Technical Interviews, Leadership Fitment.`
    }
  ];

  const handleParseJD = async () => {
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    setParsedResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdText,
          companyName: companyInput,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setParsedResult(data.analysis);
      }
    } catch (err) {
      console.error('Error analyzing JD:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveParsedDrive = () => {
    if (!parsedResult) return;

    const newDrive: RecruiterDrive = {
      id: `drv-${Date.now()}`,
      companyName: companyInput || 'Corporate Partner',
      logo: '🏢',
      roleTitle: parsedResult.roleTitle || 'Graduate Trainee Engineer',
      jobType: parsedResult.jobType || 'Full-Time',
      ctcLPA: Number(parsedResult.ctcLPA) || 10.0,
      stipendMonthly: Number(parsedResult.stipendMonthly) || 35000,
      location: 'Bengaluru / Hybrid',
      minCGPA: Number(parsedResult.minCGPA) || 7.0,
      eligibleBranches: (parsedResult.eligibleBranches as StudentBranch[]) || ['CSE', 'IT', 'AI&DS'],
      maxBacklogsAllowed: Number(parsedResult.maxBacklogsAllowed) || 0,
      requiredSkills: parsedResult.requiredSkills || ['Data Structures', 'Python', 'SQL'],
      preferredSkills: parsedResult.preferredSkills || ['Cloud', 'Docker'],
      driveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deadlineDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Registration Open',
      venueOrPlatform: 'Placement Suites & Virtual Proctor',
      rounds: (parsedResult.selectionRounds || ['Online Assessment', 'Technical Interview', 'HR Round']).map(
        (roundName: string, i: number) => ({
          name: roundName,
          date: new Date(Date.now() + (7 + i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00 AM',
          type: 'Online',
          venue: 'Computer Lab 1'
        })
      ),
      shortlistedCount: 0,
      registeredCount: 0,
      selectedCount: 0,
      description: jdText.substring(0, 200) + '...',
    };

    onAddNewDrive(newDrive);
    setIsParserModalOpen(false);
    setParsedResult(null);
    setJdText('');
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>Corporate Recruiter Drives &amp; JDs</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-500/20">
              {drives.length} Active Drives
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage company recruitment drives, configure academic eligibility benchmarks, and parse unstructured recruiter JDs.
          </p>
        </div>

        <button
          onClick={() => {
            setIsParserModalOpen(true);
            setParsedResult(null);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Parse Recruiter JD</span>
        </button>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {drives.map((drv) => (
          <div
            key={drv.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                    {drv.logo}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{drv.companyName}</h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{drv.roleTitle}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {drv.location}
                      </span>
                      <span>•</span>
                      <span>{drv.jobType}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {drv.ctcLPA} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">LPA</span>
                  </div>
                  {drv.stipendMonthly && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      Stipend: ₹{drv.stipendMonthly.toLocaleString()}/mo
                    </span>
                  )}
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      drv.status === 'Shortlisting'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : drv.status === 'Assessment Active'
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {drv.status}
                  </span>
                </div>
              </div>

              {/* Eligibility Criteria Matrix */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Academic Eligibility Benchmark
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Min CGPA</span>
                    <span className="font-bold text-slate-900 dark:text-white">{drv.minCGPA}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Max Backlogs</span>
                    <span className="font-bold text-slate-900 dark:text-white">{drv.maxBacklogsAllowed}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Drive Date</span>
                    <span className="font-bold text-slate-900 dark:text-white">{drv.driveDate}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Branches:</span>
                  <div className="flex flex-wrap gap-1">
                    {drv.eligibleBranches.map((b) => (
                      <span key={b} className="text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-slate-700 dark:text-slate-200">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mt-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Targeted Skill Matrix
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {drv.requiredSkills.map((sk) => (
                    <span key={sk} className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                      {sk}
                    </span>
                  ))}
                  {drv.preferredSkills?.map((sk) => (
                    <span key={sk} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {sk} (Pref)
                    </span>
                  ))}
                </div>
              </div>

              {/* Rounds */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Selection Rounds ({drv.rounds.length})
                </span>
                <div className="space-y-1">
                  {drv.rounds.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded">
                      <span className="font-medium">
                        {i + 1}. {r.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {r.time} • {r.venue}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">{drv.shortlistedCount}</span> shortlisted /{' '}
                <span className="font-bold text-slate-900">{drv.registeredCount}</span> registered
              </div>

              <button
                onClick={() => onSelectDriveForMatching(drv.id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Match Candidates</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Job Description Parser Modal */}
      {isParserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-modal-pop">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Recruiter Job Description (JD) Parser
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Extracts structured eligibility benchmarks, technical requirements, and interview topics with Gemini.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsParserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Company name input */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company / Recruiter Name</label>
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  placeholder="e.g. Amazon, Google Cloud, Rooman Technologies"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Sample loader */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 dark:text-slate-400">Or test with pre-loaded recruiter samples:</span>
                {sampleJDs.map((s) => (
                  <button
                    key={s.title}
                    onClick={() => {
                      setCompanyInput(s.company);
                      setJdText(s.text);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-1 rounded transition cursor-pointer"
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Text Area */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Paste Raw Job Description / Email / Brochure
                </label>
                <textarea
                  rows={7}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste complete or partial recruiter job description here..."
                  className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleParseJD}
                  disabled={isAnalyzing || !jdText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Structured Specification</span>
                    </>
                  )}
                </button>
              </div>

              {/* Parsed Result Display */}
              {parsedResult && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Structured Hiring Specification Extracted
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px] border border-emerald-200/60 dark:border-emerald-800">
                      {parsedResult.roleTitle}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Min CGPA</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{parsedResult.minCGPA}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">CTC (LPA)</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{parsedResult.ctcLPA} LPA</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Max Backlogs</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{parsedResult.maxBacklogsAllowed}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Type</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{parsedResult.jobType}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">Target Technical Stack:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {parsedResult.requiredSkills?.map((s: string) => (
                        <span key={s} className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded font-medium text-[11px] border border-indigo-200/50 dark:border-indigo-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {parsedResult.screeningAdviceForTPO && (
                    <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-indigo-900 dark:text-indigo-200">
                      <span className="font-bold block">TPO Screening Advice:</span>
                      <p className="mt-0.5">{parsedResult.screeningAdviceForTPO}</p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveParsedDrive}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Create &amp; Publish Active Drive</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
