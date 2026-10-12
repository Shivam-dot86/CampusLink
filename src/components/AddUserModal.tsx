import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  Building2,
  GraduationCap,
  UserCheck,
  Mail,
  Lock,
  Phone,
  Building,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserRole, UserAccount } from '../types';
import { useAuth } from '../context/AuthContext';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: (user: UserAccount) => void;
  defaultRole?: UserRole;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
];

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onUserAdded,
  defaultRole = 'TPO'
}) => {
  const { addActualUser } = useAuth();

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [password, setPassword] = useState('password123');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Student specific
  const [usn, setUsn] = useState('');
  const [cgpa, setCgpa] = useState('8.5');
  const [branch, setBranch] = useState('CSE');

  // Recruiter specific
  const [hiringDomain, setHiringDomain] = useState('Cloud & Full-Stack Engineering');

  // Options
  const [autoLogin, setAutoLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const roleDefinitions: Record<
    UserRole,
    {
      title: string;
      desc: string;
      icon: React.ElementType;
      badge: string;
      defaultTitle: string;
      defaultOrg: string;
      color: string;
    }
  > = {
    TPO: {
      title: 'T&P Officer / Director',
      desc: 'Placement Lead with executive authority over drives, MoUs, and analytics.',
      icon: ShieldCheck,
      badge: 'Institutional Command',
      defaultTitle: 'Lead Placement Director & Administrator',
      defaultOrg: 'CampusLink Institutional Command',
      color: 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
    },
    Recruiter: {
      title: 'Corporate Recruiter',
      desc: 'Campus Talent Acquisition partner posting JDs, shortlisting candidates, and releasing offers.',
      icon: Building2,
      badge: 'Corporate Partner',
      defaultTitle: 'Campus Talent Acquisition Head',
      defaultOrg: 'Corporate Hiring Partner',
      color: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
    },
    Student: {
      title: 'Student Candidate',
      desc: 'Placement aspirant applying to drives, tracking eligibility, and taking AI assessments.',
      icon: GraduationCap,
      badge: 'Candidate Portal',
      defaultTitle: 'B.E. Candidate (2026 Batch)',
      defaultOrg: 'Rooman Institute of Technology',
      color: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    },
    Coordinator: {
      title: 'Department Coordinator',
      desc: 'Faculty lead managing attendance, room allocations, and live round clearance.',
      icon: UserCheck,
      badge: 'Faculty Coordinator',
      defaultTitle: 'Department Placement Coordinator',
      defaultOrg: 'Department of Computer Science & Engineering',
      color: 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
    }
  };

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    // Auto-fill default title and org if empty or matching previous default
    if (!title || Object.values(roleDefinitions).some((d) => d.defaultTitle === title)) {
      setTitle(roleDefinitions[r].defaultTitle);
    }
    if (!org || Object.values(roleDefinitions).some((d) => d.defaultOrg === org)) {
      setOrg(roleDefinitions[r].defaultOrg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a full legal or professional name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    const chosenAvatar = customAvatarUrl.trim() || avatar;
    const finalTitle = title.trim() || roleDefinitions[role].defaultTitle;
    const finalOrg = org.trim() || roleDefinitions[role].defaultOrg;

    const payload: Partial<UserAccount> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      title: finalTitle,
      org: finalOrg,
      badge: roleDefinitions[role].badge,
      avatar: chosenAvatar,
      phone: phone.trim() || '+91 98765 43210',
      password: password || 'password123',
      status: 'Active',
      isActualUser: true,
      ...(role === 'Student'
        ? {
            usn: usn.trim() || `1RM22CS${Math.floor(100 + Math.random() * 900)}`,
            cgpa: parseFloat(cgpa) || 8.5,
            branch: branch
          }
        : {})
    };

    try {
      const res = await addActualUser(payload, autoLogin);
      if (!res.success) {
        setError(res.error || 'Failed to add user account.');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      if (onUserAdded && res.user) {
        onUserAdded(res.user);
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(false);
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Unexpected error creating user account.');
      setIsSubmitting(false);
    }
  };

  const activeDef = roleDefinitions[role];
  const RoleIcon = activeDef.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-modal-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Add Actual User</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60">
                  Database Synced
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create a persistent real user account with role permissions and immediate login support.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Actual user account provisioned successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. ROLE SELECTOR */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Select Account Role &amp; Permission Enclave
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['TPO', 'Recruiter', 'Student', 'Coordinator'] as UserRole[]).map((r) => {
                  const def = roleDefinitions[r];
                  const Icon = def.icon;
                  const isSelected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {r}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {def.badge}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. BASIC PROFILE INFORMATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Legal / Professional Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'Student' ? 'e.g. Rahul Sharma' : role === 'Recruiter' ? 'e.g. Suman Sen' : 'e.g. Dr. K. Narayanan'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Institutional / Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder={role === 'Student' ? 'student@college.edu' : 'user@company.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Organization / Department
                </label>
                <input
                  type="text"
                  placeholder={roleDefinitions[role].defaultOrg}
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  placeholder={roleDefinitions[role].defaultTitle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Initial Password / Access Key
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. ROLE-SPECIFIC ATTRIBUTES */}
            {role === 'Student' && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Academic Credentials &amp; APAAR Sync</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      University Seat Number (USN)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1RM22CS095"
                      value={usn}
                      onChange={(e) => setUsn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Branch / Department
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    >
                      <option value="CSE">CSE (Computer Science)</option>
                      <option value="ISE">ISE (Information Science)</option>
                      <option value="ECE">ECE (Electronics &amp; Comm)</option>
                      <option value="MECH">MECH (Mechanical)</option>
                      <option value="CIVIL">CIVIL (Civil Engineering)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === 'Recruiter' && (
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                  <Building2 className="w-4 h-4" />
                  <span>Corporate Recruiting Profile</span>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Hiring Domain / Technologies
                  </label>
                  <input
                    type="text"
                    value={hiringDomain}
                    onChange={(e) => setHiringDomain(e.target.value)}
                    placeholder="e.g. Cloud, AI/ML, Full-Stack, Embedded"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* 4. AVATAR PICKER */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex items-center space-x-3 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatar(av);
                      setCustomAvatarUrl('');
                    }}
                    className={`h-11 w-11 rounded-full p-0.5 border-2 transition shrink-0 cursor-pointer ${
                      avatar === av && !customAvatarUrl
                        ? 'border-indigo-600 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar option" className="h-full w-full rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* 5. LIVE PREVIEW BADGE */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={customAvatarUrl || avatar}
                  alt="Preview"
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {name || 'New User Name'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {email || 'user@example.com'} • {org || roleDefinitions[role].defaultOrg}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Active
              </span>
            </div>

            {/* 6. AUTO-LOGIN CHECKBOX */}
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-600 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="font-medium">
                Log in as this user immediately after provisioning
              </span>
            </label>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Provisioning...' : 'Provision Actual User'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
