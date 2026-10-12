import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  UserCheck,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Building,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { UserRole, SignUpPayload } from '../types';
import { useAuth } from '../context/AuthContext';
import { CampusLinkLogo } from './CampusLinkLogo';

interface LoginPageProps {
  onLoginSuccess?: (role: UserRole) => void;
  onCancel?: () => void;
  isModal?: boolean;
  initialMode?: 'signin' | 'signup';
  initialRole?: UserRole;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  isModal = false,
  initialMode = 'signin',
  initialRole = 'Student'
}) => {
  const { logIn, signUp } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Optional Role-Specific State
  const [organization, setOrganization] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [usn, setUsn] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [cgpa, setCgpa] = useState('');

  // UI Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password validation calculation
  const hasMinLength = signUpPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(signUpPassword);
  const hasNumber = /[0-9]/.test(signUpPassword);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;
  const doPasswordsMatch = Boolean(
    signUpPassword && confirmPassword && signUpPassword === confirmPassword
  );

  const getPasswordStrength = () => {
    if (!signUpPassword) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (signUpPassword.length >= 8) score += 1;
    if (hasLetter && hasNumber) score += 1;
    if (/[^a-zA-Z0-9]/.test(signUpPassword) || signUpPassword.length >= 12) score += 1;

    if (score === 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, text: 'Medium', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  // Role Metadata
  const roleMeta: Record<
    UserRole,
    {
      title: string;
      badge: string;
      icon: React.ElementType;
      color: string;
      description: string;
      defaultOrg: string;
      defaultTitle: string;
    }
  > = {
    TPO: {
      title: 'Training & Placement Lead (TPO)',
      badge: 'Institutional Command',
      icon: ShieldCheck,
      color: 'from-indigo-600 to-blue-700',
      description: 'Executive placement authority over drives, MoUs, eligibility criteria, and college accreditation reports.',
      defaultOrg: 'CampusLink Placement Command',
      defaultTitle: 'Lead Placement Director & Officer'
    },
    Recruiter: {
      title: 'Corporate Recruiter',
      badge: 'Corporate Partner',
      icon: Building2,
      color: 'from-blue-600 to-cyan-700',
      description: 'Campus talent acquisition workspace for posting JDs, shortlisting candidates, and issuing placement offers.',
      defaultOrg: 'Corporate Hiring Partner',
      defaultTitle: 'Head of Campus Talent Acquisition'
    },
    Student: {
      title: 'Student Candidate',
      badge: 'Candidate Portal',
      icon: GraduationCap,
      color: 'from-emerald-600 to-teal-700',
      description: 'Unified career portal with eligible drive feeds, one-click applications, and APAAR DigiLocker verified credits.',
      defaultOrg: 'CampusLink Student Portal',
      defaultTitle: 'B.E. Candidate (2026 Batch)'
    },
    Coordinator: {
      title: 'Department Placement Coordinator',
      badge: 'Faculty Coordinator',
      icon: UserCheck,
      color: 'from-purple-600 to-indigo-700',
      description: 'Ground operations lead managing lab venues, live attendance QR check-ins, and remedial clinics.',
      defaultOrg: 'Department of Computer Science & Engineering',
      defaultTitle: 'Department Placement Coordinator'
    }
  };

  // Sign In Submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrimmed = signInEmail.trim();
    if (!emailTrimmed) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await logIn({
        email: emailTrimmed,
        password: signInPassword,
        rememberMe
      });

      setSuccessMessage('Logged in successfully! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess && res.user) {
          onLoginSuccess(res.user.role);
        }
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up Submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validations
    const nameTrimmed = fullName.trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      setErrorMessage('Please provide your full legal or professional name (at least 2 characters).');
      return;
    }

    const emailTrimmed = signUpEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setIsSubmitting(true);

    const meta = roleMeta[selectedRole];
    const payload: SignUpPayload = {
      name: nameTrimmed,
      email: emailTrimmed,
      password: signUpPassword,
      confirmPassword,
      role: selectedRole,
      title: title.trim() || meta.defaultTitle,
      org: organization.trim() || meta.defaultOrg,
      phone: phone.trim() || undefined,
      ...(selectedRole === 'Student'
        ? {
            usn: usn.trim().toUpperCase() || undefined,
            branch,
            cgpa: cgpa ? parseFloat(cgpa) : undefined
          }
        : {})
    };

    try {
      const res = await signUp(payload);
      setSuccessMessage(res.message || 'Account created successfully! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess && res.user) {
          onLoginSuccess(res.user.role);
        }
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="login-page-container"
      className={`${
        isModal
          ? 'fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in'
          : 'min-h-[85vh] flex flex-col justify-center py-4 sm:py-6 px-2 sm:px-6 lg:px-8'
      }`}
    >
      <div
        id="login-card-wrapper"
        className={`w-full max-w-4xl mx-auto my-auto bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] ${
          isModal ? 'animate-modal-pop' : ''
        }`}
      >
        {/* Top Header Ribbon */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 sm:px-7 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <CampusLinkLogo variant="compact" size="md" isDark={true} />
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center shrink-0">
              <Lock className="w-2.5 h-2.5 mr-1 text-indigo-300" />
              Secure Database Auth
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isModal && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-white px-2.5 py-1 rounded-xl hover:bg-slate-800 transition cursor-pointer text-xs font-semibold"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Auth Mode Toggle Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Create New Account
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            {authMode === 'signin'
              ? 'Enter verified credentials to continue'
              : 'Register an individual account in the database'}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-slate-200 dark:divide-slate-800 flex-1 min-h-0 overflow-y-auto">
          {/* Left Column: Platform Pillars / Context */}
          <div className="hidden xl:flex xl:col-span-5 p-5 bg-slate-50/70 dark:bg-slate-950/40 flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/80">
                  Institutional Security
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {authMode === 'signin' ? 'Welcome to CampusLink' : 'Join Your Placement Enclave'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  Connect students, corporate recruiters, department coordinators, and placement directors on one production-grade platform.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Role-Based Enclaves',
                    desc: 'Dedicated spaces for TPO Command, Recruiters, Students, and Ground Ops.'
                  },
                  {
                    icon: KeyRound,
                    title: 'Bcrypt Hash Security',
                    desc: 'Passwords are salted and securely hashed before storage. No plaintext leaks.'
                  },
                  {
                    icon: CheckCircle2,
                    title: 'Live Database Persistence',
                    desc: 'Individual records saved with timestamps, credentials, and academic verification.'
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-start space-x-3"
                    >
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-slate-600 dark:text-slate-300 text-xs">
              <div className="flex items-center space-x-2 font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Hardcoded Credentials</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                All accounts must be registered individually by actual users. Create your account on the right or sign in with your verified credentials.
              </p>
            </div>
          </div>

          {/* Right Column: Active Auth Form */}
          <div className="col-span-1 xl:col-span-7 p-4 sm:p-6 bg-white dark:bg-slate-900 overflow-y-auto w-full min-h-0">
            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-start space-x-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ======================================= */}
            {/* 1. SIGN IN FORM                         */}
            {/* ======================================= */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sign In to Your Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Access your personalized placement command workspace.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. user@college.edu or name@company.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your account password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showSignInPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignInPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded accent-indigo-600 border-slate-300 cursor-pointer"
                      />
                      <span className="text-slate-600 dark:text-slate-400">
                        Stay signed in (30 days)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ======================================= */}
            {/* 2. SIGN UP FORM                         */}
            {/* ======================================= */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create a New Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Register your verified credentials directly in the database.
                  </p>
                </div>

                {/* Role Selector Cards */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select Your Role &amp; Perspective <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Student', 'Recruiter', 'TPO', 'Coordinator'] as UserRole[]).map((r) => {
                      const meta = roleMeta[r];
                      const Icon = meta.icon;
                      const isSelected = selectedRole === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedRole(r)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div
                              className={`h-6 w-6 rounded-md flex items-center justify-center ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight truncate">{r}</p>
                            <p className="text-[10px] text-slate-400 truncate">{meta.badge}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal / Professional Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Institutional or Work Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@campuslink.edu"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 8 chars, letters & numbers"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            confirmPassword && !doPasswordsMatch
                              ? 'border-rose-400 dark:border-rose-600'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength & Match Status */}
                  {signUpPassword && (
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          Password strength: <strong>{strength.text}</strong>
                        </span>
                        {confirmPassword && (
                          <span
                            className={`font-semibold ${
                              doPasswordsMatch ? 'text-emerald-600' : 'text-rose-500'
                            }`}
                          >
                            {doPasswordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex space-x-1">
                        <div
                          className={`h-full transition-all ${
                            strength.score >= 1 ? strength.color : 'bg-transparent'
                          } flex-1`}
                        />
                        <div
                          className={`h-full transition-all ${
                            strength.score >= 2 ? strength.color : 'bg-transparent'
                          } flex-1`}
                        />
                        <div
                          className={`h-full transition-all ${
                            strength.score >= 3 ? strength.color : 'bg-transparent'
                          } flex-1`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Role-Specific Fields */}
                  {selectedRole === 'Student' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2.5">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                        Academic Credentials (Optional)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            USN / Seat No.
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1RM22CS088"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            Branch
                          </label>
                          <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            <option value="CSE">CSE</option>
                            <option value="ISE">ISE</option>
                            <option value="ECE">ECE</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                            CGPA
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            placeholder="8.50"
                            value={cgpa}
                            onChange={(e) => setCgpa(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedRole !== 'Student' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Organization / Company
                        </label>
                        <input
                          type="text"
                          placeholder={roleMeta[selectedRole].defaultOrg}
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Role Title / Designation
                        </label>
                        <input
                          type="text"
                          placeholder={roleMeta[selectedRole].defaultTitle}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Registering...' : 'Create Account & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
