import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  BarChart3,
  Shield,
  Layers,
  ChevronRight,
  X,
  Play,
  Star,
  ExternalLink,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import saasProductImg from '../assets/images/campuslink_hero_preview.svg';
import workflowImg from '../assets/images/campus_to_corporate_workflow.svg';
import { useTheme } from '../context/ThemeContext';
import { CampusLinkLogo } from './CampusLinkLogo';

interface LandingPageProps {
  onEnterApp?: () => void;
  onOpenLogin?: (role?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenLogin }) => {
  const { theme, toggleTheme } = useTheme();
  const [activeNav, setActiveNav] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll handler with offset consideration
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    e.preventDefault();
    setActiveNav(label);
    setMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLaunchAuth = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else if (onEnterApp) {
      onEnterApp();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#6366F1] selection:text-white relative overflow-x-hidden transition-colors duration-200">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#6366F1]/10 dark:from-[#6366F1]/15 via-[#6366F1]/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[160px] pointer-events-none -z-10" />

      {/* 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0F172A]/85 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 transition-colors duration-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 md:gap-8">
          {/* Left: Official Logo */}
          <a
            href="#home"
            onClick={(e) => scrollToSection(e, '#home', 'Home')}
            className="flex items-center group shrink-0"
          >
            <CampusLinkLogo variant="full" size="md" />
          </a>

          {/* Center: Primary Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            {[
              { label: 'Home', href: '#home' },
              { label: 'Features', href: '#features' },
              { label: 'About', href: '#about' }
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href, link.label)}
                className={`relative py-1 transition-colors duration-200 whitespace-nowrap ${
                  activeNav === link.label
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {link.label}
                {activeNav === link.label && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#6366F1] rounded-full shadow-[0_0_8px_#6366F1]" />
                )}
              </a>
            ))}
          </nav>

          {/* Right: High-Contrast Call-to-Action (CTA) */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2 rounded-[8px] border border-slate-300 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/70 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700 transition flex items-center justify-center shadow-xs cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {onOpenLogin && (
              <button
                onClick={() => onOpenLogin()}
                className="hidden sm:inline-flex text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-2 rounded-[8px] transition hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
            <button
              onClick={handleLaunchAuth}
              className="relative inline-flex items-center justify-center px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#5558E6] rounded-[8px] shadow-sm shadow-[#6366F1]/25 hover:shadow-lg hover:shadow-[#6366F1]/35 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0F172A] whitespace-nowrap active:scale-[0.98] cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-[8px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md px-4 py-4 space-y-3 animate-fade-in-down">
            {[
              { label: 'Home', href: '#home' },
              { label: 'Features', href: '#features' },
              { label: 'About', href: '#about' }
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href, link.label)}
                className={`block py-2 text-sm font-medium transition ${
                  activeNav === link.label ? 'text-[#6366F1] font-semibold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
            {onOpenLogin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full text-left py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (Split Dynamic Layout) */}
      <section id="home" className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Action Area */}
            <div className="lg:col-span-6 space-y-7 z-10">
              {/* Quiet Micro Tag */}
              <div className="inline-flex items-center space-x-2 text-xs font-medium text-indigo-600 dark:text-indigo-300/90 tracking-wide bg-indigo-50 dark:bg-transparent px-2.5 py-1 rounded-full dark:px-0 dark:py-0 border border-indigo-100 dark:border-transparent">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                <span>Next-Gen Placement Intelligence & Analytics</span>
              </div>

              {/* Compelling Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] text-balance">
                Accelerate campus hiring with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-[#6366F1] to-violet-600 dark:from-indigo-300 dark:via-[#6366F1] dark:to-violet-400">
                  predictive placement
                </span>{' '}
                intelligence.
              </h1>

              {/* Supporting Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
                Eliminate spreadsheets forever. Connect colleges, students, and tier-1 corporate recruiters in real-time with APAAR sync, explainable AI job matching, and conflict-free drive scheduling.
              </p>

              {/* Action Buttons: Primary CTA & Secondary Ghost Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={handleLaunchAuth}
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-[#6366F1] hover:bg-[#5558E6] rounded-[8px] shadow-md shadow-[#6366F1]/30 hover:shadow-xl hover:shadow-[#6366F1]/45 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] active:scale-[0.98] cursor-pointer"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>

                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, '#features', 'Features')}
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white bg-white hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 rounded-[8px] shadow-2xs transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <span>Learn More</span>
                </a>
              </div>

              {/* Trust Indicators / Social Proof Strip */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#6366F1]" />
                  <span>Real Database Persistence</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#6366F1]" />
                  <span>Encrypted JWT Sessions</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-[#6366F1]" />
                  <span>Instant MongoDB &amp; APAAR sync</span>
                </div>
              </div>
            </div>

            {/* Right Column: Sleek Product Preview Image / Illustration */}
            <div className="lg:col-span-6 relative">
              {/* Subtle Ambient Back-Glow Behind Image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/20 to-violet-600/10 rounded-[8px] blur-2xl transform scale-95 pointer-events-none" />

              {/* Product Preview Card Container with 8px radius & hairline border */}
              <div className="relative rounded-[8px] overflow-hidden border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/80 shadow-2xl shadow-slate-300/50 dark:shadow-black/60 group transition-all duration-500 hover:border-indigo-400 dark:hover:border-indigo-500/50">
                {/* Browser-style Top Bar */}
                <div className="bg-slate-100 dark:bg-slate-900/95 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800/90 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
                  </div>
                  <div className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 px-3 py-0.5 rounded-[6px] text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                    app.campuslink.io/dashboard
                  </div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Live 2026</div>
                </div>

                {/* Sleek Generated Product Preview Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img
                    src={saasProductImg}
                    alt="CAMPUSLINK SaaS Placement Intelligence & Analytics Dashboard Preview"
                    className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.02] filter drop-shadow-md"
                  />

                  {/* Gentle gradient scrim at bottom edge for contrast harmony */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                  {/* Interactive Floating Pill Inside Preview */}
                  <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 dark:bg-[#0F172A]/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 p-2.5 rounded-[8px] shadow-lg flex items-center justify-between sm:space-x-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-[6px] bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1]">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">AI Matching Complete</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">98% Fit Score for Cloud Trainee Drive</p>
                      </div>
                    </div>
                    {onEnterApp && (
                      <button
                        onClick={onEnterApp}
                        className="text-[11px] text-[#6366F1] hover:text-indigo-700 dark:hover:text-white font-semibold transition flex items-center space-x-1 pl-2 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY HIGHLIGHTS / PROOF STRIP */}
      <section className="border-y border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/40 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { metric: '94%', label: 'Placement Conversion Rate' },
              { metric: '3.4x', label: 'Faster Recruiter Shortlisting' },
              { metric: '100%', label: 'Conflict-Free Drive Timelines' },
              { metric: '12k+', label: 'Verified Student Profiles' }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                  {stat.metric}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (Anchor #features) */}
      <section id="features" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6366F1]">
            Core Platform Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for modern placement cells.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Everything your training & placement office needs to coordinate students, corporate recruiters, and interview drives under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'Explainable AI Candidate Matching',
              desc: 'Compute multi-dimensional fit scores across CGPA, verified skills, and coding problem counts with transparent hiring verdicts.'
            },
            {
              icon: Shield,
              title: 'APAAR & Academic Bank of Credits',
              desc: 'Direct synchronization with Indian National Academic APAAR IDs, semester credit histories, and DigiLocker certificates.'
            },
            {
              icon: Zap,
              title: 'Automated Drive Conflict Resolver',
              desc: 'Detect lab collisions and overlapping interview windows instantly with algorithmic rescheduling recommendations.'
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-[8px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-xs dark:shadow-none transition-all duration-200 space-y-4 group"
              >
                <div className="w-10 h-10 rounded-[8px] bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1] group-hover:bg-[#6366F1]/20 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4.5. WORKFLOW ILLUSTRATION SECTION */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-[12px] bg-slate-900 border border-slate-800/90 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none" />
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6366F1]">
              Automated Campus-To-Corporate Engine
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              From Student Registration to Corporate Offer Clearance
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Four unified stages powering Rooman Autonomous Institute &amp; corporate hiring partners.
            </p>
          </div>

          <div className="relative rounded-[8px] overflow-hidden border border-slate-800 bg-slate-950/60 p-2 sm:p-4 shadow-lg transition-transform duration-500 hover:scale-[1.01]">
            <img
              src={workflowImg}
              alt="CAMPUSLINK Campus-to-Corporate Placement Workflow Architecture"
              className="w-full h-auto object-contain rounded-[6px]"
            />
          </div>
        </div>
      </section>

      {/* 5. ABOUT SECTION (Anchor #about) */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6366F1]">
              About CAMPUSLINK
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Built for Rooman Technologies and forward-thinking universities.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              CAMPUSLINK was born out of real placement frustrations: disorganized spreadsheets, frantic last-minute interview room clashes, and missing student academic verification. We designed a clean, cloud-native platform that bridges academic credentials with corporate talent acquisition.
            </p>
            <div className="pt-2 flex items-center space-x-4">
              {onEnterApp && (
                <button
                  onClick={onEnterApp}
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-white bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-[8px] transition cursor-pointer shadow-2xs"
                >
                  <span>Open Operational Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-6 rounded-[8px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Platform Standards</h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p>• <strong>Full Stack Architecture:</strong> React 19, Vite, Express, and MongoDB Atlas.</p>
              <p>• <strong>Zero Mock Stubs:</strong> Real database operations with live Mongoose ODM queries.</p>
              <p>• <strong>Enterprise Readiness:</strong> Scalable schema validations with zero-pill visual discipline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. QUIET FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0F172A] py-8 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CampusLinkLogo variant="compact" size="sm" />
            <span>·</span>
            <span>© 2026 Rooman Technologies. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            {[
              { label: 'Home', href: '#home' },
              { label: 'Features', href: '#features' },
              { label: 'About', href: '#about' }
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href, link.label)}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
