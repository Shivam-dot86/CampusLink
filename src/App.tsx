import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentReadiness } from './components/StudentReadiness';
import { RecruiterDrives } from './components/RecruiterDrives';
import { CandidateMatching } from './components/CandidateMatching';
import { DriveScheduler } from './components/DriveScheduler';
import { OfferTracking } from './components/OfferTracking';
import { NotificationsCenter } from './components/NotificationsCenter';
import { AtRiskAnalytics } from './components/AtRiskAnalytics';
import { PlacementPreTalks } from './components/PlacementPreTalks';
import { MakePlacementReady } from './components/MakePlacementReady';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { RolePermissionGate } from './components/RolePermissionGate';
import { useAuth, ROLE_DEFAULT_TABS } from './context/AuthContext';
import { api } from './api';

import { StudentCareerHub } from './components/StudentCareerHub';
import { TpoCommandCenter } from './components/TpoCommandCenter';
import { RecruiterWorkspace } from './components/RecruiterWorkspace';
import { CoordinatorGroundOps } from './components/CoordinatorGroundOps';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { AddUserModal } from './components/AddUserModal';
import { UserManagementModal } from './components/UserManagementModal';
import { DatabaseConfigModal } from './components/DatabaseConfigModal';
import { CampusHelpdeskChatbot } from './components/CampusHelpdeskChatbot';
import { ErrorBoundary } from './components/ErrorBoundary';

import {
  INITIAL_STUDENTS,
  INITIAL_DRIVES,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_CONFLICTS,
  INITIAL_OFFERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STATS,
  INITIAL_PRE_TALKS,
  INITIAL_APPLICATIONS,
  INITIAL_PEER_INSIGHTS,
  INITIAL_MOUS,
  INITIAL_VOLUNTEERS,
  INITIAL_GROUND_ISSUES,
  INITIAL_AUDIT_LOGS,
  INITIAL_APPROVAL_REQUESTS
} from './data/mockData';

import {
  StudentProfile,
  RecruiterDrive,
  DriveScheduleSlot,
  ScheduleConflict,
  OfferRecord,
  BroadcastNotification,
  UserRole,
  PlacementPreTalk,
  StudentApplication,
  PeerInterviewInsight,
  CompanyMoU,
  CoordinatorVolunteerTask,
  GroundIssueTicket,
  AuditLogEntry,
  DriveApprovalRequest
} from './types';

export default function App() {
  const {
    user,
    role: currentRole,
    isAuthenticated,
    login,
    logout,
    switchRole,
    hasPermission,
    getAllowedTabs,
    getPermittedRoles
  } = useAuth();

  // Navigation & Role State (Landing Page by default)
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Application Data State backed by persistent database
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [drives, setDrives] = useState<RecruiterDrive[]>(INITIAL_DRIVES);
  const [preTalks, setPreTalks] = useState<PlacementPreTalk[]>(INITIAL_PRE_TALKS);
  const [slots, setSlots] = useState<DriveScheduleSlot[]>(INITIAL_SCHEDULE_SLOTS);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>(INITIAL_CONFLICTS);
  const [offers, setOffers] = useState<OfferRecord[]>(INITIAL_OFFERS);
  const [notifications, setNotifications] = useState<BroadcastNotification[]>(INITIAL_NOTIFICATIONS);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  // Specialized Role & Ops State
  const [applications, setApplications] = useState<StudentApplication[]>(INITIAL_APPLICATIONS);
  const [peerInsights, setPeerInsights] = useState<PeerInterviewInsight[]>(INITIAL_PEER_INSIGHTS);
  const [mous, setMous] = useState<CompanyMoU[]>(INITIAL_MOUS);
  const [volunteers, setVolunteers] = useState<CoordinatorVolunteerTask[]>(INITIAL_VOLUNTEERS);
  const [groundIssues, setGroundIssues] = useState<GroundIssueTicket[]>(INITIAL_GROUND_ISSUES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [approvalRequests, setApprovalRequests] = useState<DriveApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);

  // Global modals state
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);
  const [isDbConfigModalOpen, setIsDbConfigModalOpen] = useState<boolean>(false);

  // Cross-component link state
  const [matchingDriveId, setMatchingDriveId] = useState<string>(INITIAL_DRIVES[0]?.id || '');
  const [acceleratorStudentId, setAcceleratorStudentId] = useState<string>('std-101');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Dynamically resolve or synthesize the student profile for the currently authenticated user
  const currentStudentProfile: StudentProfile = React.useMemo(() => {
    if (!user) return students[0] || INITIAL_STUDENTS[0];

    // 1. Try finding by user.studentId
    if (user.studentId) {
      const match = students.find((s) => s.id === user.studentId);
      if (match) return match;
    }

    // 2. Try finding by user.email
    if (user.email) {
      const emailNorm = user.email.toLowerCase().trim();
      const match = students.find((s) => s.email.toLowerCase().trim() === emailNorm);
      if (match) return match;
    }

    // 3. Try finding by user.usn
    if ((user as any).usn) {
      const usnNorm = String((user as any).usn).toUpperCase().trim();
      const match = students.find((s) => s.usn.toUpperCase().trim() === usnNorm);
      if (match) return match;
    }

    // 4. Try finding by user.name
    if (user.name) {
      const nameNorm = user.name.toLowerCase().trim();
      const match = students.find((s) => s.name.toLowerCase().trim() === nameNorm);
      if (match) return match;
    }

    // 5. If logged-in user has no student profile entry in students array, synthesize one for them
    const userUsn = (user as any).usn || `1RM22CS${Math.floor(100 + Math.random() * 900)}`;
    const userBranch = (user as any).branch || (user as any).department || 'CSE';
    const userCgpa = (user as any).cgpa || 8.92;

    return {
      id: user.studentId || user.id || `std-${Date.now()}`,
      usn: userUsn,
      name: user.name || 'Student Candidate',
      email: user.email || 'student@campuslink.edu',
      phone: (user as any).phone || '+91 98451 22341',
      branch: userBranch as any,
      batch: '2026 Batch',
      cgpa: Number(userCgpa),
      tenthPercentage: 92,
      twelfthPercentage: 90,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      readinessScore: 92,
      tier: 'Corporate Ready',
      skills: [
        { name: 'Data Structures & Algorithms', category: 'Technical', level: 5 },
        { name: 'Python & FastAPI', category: 'Technical', level: 5 },
        { name: 'React.js & TypeScript', category: 'Frameworks', level: 4 },
        { name: 'SQL & Database Architecture', category: 'Tools', level: 4 }
      ],
      certifications: ['Rooman Cloud & Full Stack Certification', 'AWS Certified Developer'],
      projectsCount: 2,
      topProjects: [
        {
          title: 'CampusLink Student Career Hub',
          tech: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
          description: 'Automated placement analytics, readiness tracking, and drive applications.'
        }
      ],
      projects: [
        {
          id: `prj-${user.id}-1`,
          title: 'CampusLink Student Career Hub',
          domain: 'Web Architecture',
          tech: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
          description: 'Automated placement analytics, readiness tracking, and drive applications.',
          githubUrl: 'https://github.com/shivam/campuslink-hub',
          demoUrl: 'https://campuslink.edu',
          impact: 'Serves real-time job readiness stats and corporate match scoring.'
        }
      ],
      internships: [],
      programs: [],
      resume: {
        atsScore: 92,
        lastUpdated: new Date().toISOString().split('T')[0],
        fileName: `${(user.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`,
        summary: `Senior ${userBranch} undergraduate student with expertise in Full-Stack Web Development, Data Structures, and Cloud Systems.`,
        keyKeywordsMatched: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'],
        missingKeywords: [],
        improvements: ['Profile fully verified across campus placement standards.']
      },
      apaarRecord: {
        apaarId: `9842-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        abcId: `ABC-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
        digiLockerVerified: true,
        totalCreditsEarned: 146,
        totalCreditsRequired: 160,
        creditTransferStatus: 'Fully Synchronized',
        semesterRecords: [],
        universityRegNo: userUsn,
        collegeAffiliation: 'Rooman Autonomous Institute of Technology / VTU',
        degreeTitle: `Bachelor of Engineering (B.E.) ${userBranch}`,
        lastSyncDate: new Date().toISOString().split('T')[0]
      },
      prePlacementTalksAttended: [],
      leetcodeSolved: 280,
      githubRepos: 16,
      mockInterviewScore: 92,
      aptitudeScore: 90,
      attendancePercent: 92,
      isAtRisk: false,
      riskReasons: [],
      placementStatus: 'Interviewing',
      offersCount: 1
    };
  }, [user, students]);

  // Keep students state in sync with current logged in user's student profile
  useEffect(() => {
    if (user && (user.role === 'Student' || currentRole === 'Student')) {
      const exists = students.some(
        (s) =>
          s.id === currentStudentProfile.id ||
          (user.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
          (user.name && s.name.toLowerCase() === user.name.toLowerCase())
      );
      if (!exists) {
        setStudents((prev) => [currentStudentProfile, ...prev]);
        api.students.update(currentStudentProfile.id, currentStudentProfile).catch((err) => {
          console.warn('Auto-syncing logged in student profile:', err);
        });
      }
    }
  }, [user, currentRole, currentStudentProfile, students]);

  // Keyboard shortcut for Global Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load database on mount
  useEffect(() => {
    let mounted = true;
    const fetchDbState = async () => {
      try {
        const state = await api.getState();
        if (mounted && state) {
          if (state.students?.length) setStudents(state.students);
          if (state.drives?.length) {
            setDrives(state.drives);
            setMatchingDriveId(state.drives[0]?.id || '');
          }
          if (state.preTalks?.length) setPreTalks(state.preTalks);
          if (state.slots?.length) setSlots(state.slots);
          if (state.conflicts?.length) setConflicts(state.conflicts);
          if (state.offers?.length) setOffers(state.offers);
          if (state.notifications?.length) setNotifications(state.notifications);
          if (state.stats) setStats(state.stats);
        }
      } catch (err) {
        console.warn('Backend sync starting or using initial state:', err);
      } finally {
        if (mounted) setIsLoadingDb(false);
      }
    };
    fetchDbState();
    return () => { mounted = false; };
  }, []);

  // Tab metadata for header breadcrumbs
  const tabMetadata: Record<string, { section: string; label: string }> = {
    'tpo-command': { section: 'Executive & TPO Command', label: 'T&P Command Center' },
    'student-hub': { section: 'Student Career Hub', label: 'Student Career Hub' },
    'recruiter-workspace': { section: 'Corporate Recruiter Hub', label: 'Hiring & Applicant Kanban' },
    'coordinator-ops': { section: 'Ground Operations', label: 'Ground Operations Command' },
    overview: { section: 'Executive Intelligence', label: 'Command Center Overview' },
    students: { section: 'Student & Readiness Hub', label: 'Student 360 & APAAR ID' },
    'placement-ready': { section: 'Student & Readiness Hub', label: 'Make Placement Ready (AI Coach)' },
    drives: { section: 'Corporate Engagement', label: 'Recruiter Placement Drives' },
    'pre-talks': { section: 'Corporate Engagement', label: 'Placement Pre-Talks (PPT)' },
    matching: { section: 'Matching & Operations', label: 'AI Candidate Match & Ranking' },
    scheduler: { section: 'Matching & Operations', label: 'Drive Scheduler & Conflict Manager' },
    offers: { section: 'Outcomes & Radar', label: 'Offers & KYC Document Clearance' },
    'at-risk': { section: 'Outcomes & Radar', label: 'At-Risk Radar & Triage Clinics' },
    notifications: { section: 'Outcomes & Radar', label: 'Omnichannel Broadcasts' },
    landing: { section: 'Public Showcase', label: 'Landing Page & Hero Design' },
  };


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Login handler
  const handleLoginSuccess = (newRole: UserRole) => {
    setShowLoginModal(false);
    showToast(`Signed in successfully as ${newRole}`);
    const defaultTab = ROLE_DEFAULT_TABS[newRole] || 'overview';
    setActiveTab(defaultTab);
  };

  // Persistent Handlers with Database Mutation
  const handleAddNewDrive = async (newDrive: RecruiterDrive) => {
    setDrives((prev) => [newDrive, ...prev]);
    showToast(`Active Drive created for ${newDrive.companyName} (${newDrive.roleTitle})`);
    try {
      await api.drives.create(newDrive);
    } catch (e) {
      console.error('Failed to persist new drive:', e);
    }
  };

  const handleSelectDriveForMatching = (driveId: string) => {
    setMatchingDriveId(driveId);
    setActiveTab('matching');
  };

  const handleUpdateStudent = async (updatedStudent: StudentProfile) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    showToast(`${updatedStudent.name}'s readiness score elevated to ${updatedStudent.readinessScore}!`);
    try {
      await api.students.update(updatedStudent.id, updatedStudent);
    } catch (e) {
      console.error('Failed to persist updated student:', e);
    }
  };

  const handleRegisterForTalk = async (talkId: string, studentId: string) => {
    setPreTalks((prev) =>
      prev.map((t) => {
        if (t.id === talkId) {
          const isRegistered = t.registeredStudentIds.includes(studentId);
          const updatedIds = isRegistered
            ? t.registeredStudentIds.filter((id) => id !== studentId)
            : [...t.registeredStudentIds, studentId];
          return {
            ...t,
            registeredStudentIds: updatedIds,
            registeredCount: updatedIds.length
          };
        }
        return t;
      })
    );

    // Also update student profile attendance record
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const talks = s.prePlacementTalksAttended || [];
          const updatedTalks = talks.includes(talkId)
            ? talks.filter((id) => id !== talkId)
            : [...talks, talkId];
          return { ...s, prePlacementTalksAttended: updatedTalks };
        }
        return s;
      })
    );

    showToast('Placement Pre-Talk RSVP attendance status updated');

    try {
      await api.preTalks.toggleRsvp(talkId, studentId);
    } catch (e) {
      console.error('Failed to persist RSVP:', e);
    }
  };

  const handleScheduleTalk = async (newTalk: PlacementPreTalk) => {
    setPreTalks((prev) => [newTalk, ...prev]);
    showToast(`Corporate Pre-Placement Talk scheduled for ${newTalk.companyName}`);
    try {
      await api.preTalks.create(newTalk);
    } catch (e) {
      console.error('Failed to persist talk:', e);
    }
  };

  const handleAddScheduleSlot = async (newSlot: DriveScheduleSlot) => {
    setSlots((prev) => [...prev, newSlot]);
    if (newSlot.hasConflict) {
      showToast(`Schedule clash detected for ${newSlot.companyName} in ${newSlot.venue}`);
      setConflicts((prev) => [
        ...prev,
        {
          id: `cnf-${Date.now()}`,
          type: 'Venue Clashing',
          severity: 'High',
          description: `Collision in ${newSlot.venue} on ${newSlot.date}`,
          involvedItems: [newSlot.companyName, newSlot.venue],
          recommendedResolution: 'Allocate alternative CAD / Seminar Lab',
        },
      ]);
    } else {
      showToast(`Drive round for ${newSlot.companyName} confirmed without clashes`);
    }

    try {
      const res = await api.scheduler.addSlot(newSlot);
      if (res.conflicts) setConflicts(res.conflicts);
    } catch (e) {
      console.error('Failed to persist slot:', e);
    }
  };

  const handleResolveConflict = async (conflictId: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
    setSlots((prev) =>
      prev.map((s) => ({
        ...s,
        hasConflict: false,
        conflictDetails: undefined,
      }))
    );
    showToast('Schedule collision marked resolved and calendar re-aligned');

    try {
      const res = await api.scheduler.resolveConflict(conflictId);
      if (res.conflicts) setConflicts(res.conflicts);
    } catch (e) {
      console.error('Failed to persist conflict resolution:', e);
    }
  };

  const handleUpdateOfferStatus = async (offerId: string, newStatus: OfferRecord['status']) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
    );
    showToast(`Offer status updated to "${newStatus}"`);

    try {
      await api.offers.updateStatus(offerId, newStatus);
    } catch (e) {
      console.error('Failed to persist offer status:', e);
    }
  };

  const handleUpdateDocumentVerified = async (offerId: string, docIndex: number, verified: boolean) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          const updatedDocs = [...o.documents];
          if (updatedDocs[docIndex]) {
            updatedDocs[docIndex] = { ...updatedDocs[docIndex], verified };
          }
          return { ...o, documents: updatedDocs };
        }
        return o;
      })
    );
    showToast(verified ? 'Document verified and clearance recorded' : 'Verification revoked');

    try {
      await api.offers.verifyDoc(offerId, docIndex, verified);
    } catch (e) {
      console.error('Failed to persist document verification:', e);
    }
  };

  const handleSendNotification = async (notif: BroadcastNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Notice broadcast successfully dispatched via ${notif.channel}!`);

    try {
      await api.notifications.send(notif);
    } catch (e) {
      console.error('Failed to persist broadcast notification:', e);
    }
  };

  // Action Handlers for Specialized Role Workspaces
  const handleApproveRequest = (requestId: string) => {
    setApprovalRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r))
    );
    const req = approvalRequests.find((r) => r.id === requestId);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        actorName: user?.name || 'TPO Lead',
        actorRole: currentRole,
        actionType: 'Status Change',
        targetEntity: req ? `${req.companyName} (${req.requestType})` : requestId,
        details: 'Approved drive modification request'
      },
      ...prev
    ]);
    showToast(`Drive request ${req?.companyName || requestId} approved`);
  };

  const handleRejectRequest = (requestId: string) => {
    setApprovalRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Rejected' } : r))
    );
    const req = approvalRequests.find((r) => r.id === requestId);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        actorName: user?.name || 'TPO Lead',
        actorRole: currentRole,
        actionType: 'Status Change',
        targetEntity: req ? `${req.companyName} (${req.requestType})` : requestId,
        details: 'Returned drive modification request for review'
      },
      ...prev
    ]);
    showToast(`Drive request ${req?.companyName || requestId} returned for review`);
  };

  const handleBroadcastAnnouncement = (audience: string, msg: string) => {
    const notif: BroadcastNotification = {
      id: `nt-${Date.now()}`,
      title: `TPO Official Notice: ${audience}`,
      message: msg,
      sentAt: 'Just now',
      status: 'Delivered',
      channel: 'Portal',
      audience,
      recipientsCount: 480
    };
    handleSendNotification(notif);
  };

  const handleApplyToDrive = (driveId: string) => {
    const drv = drives.find((d) => d.id === driveId);
    const stdId = user?.studentId || acceleratorStudentId;
    const std = students.find((s) => s.id === stdId);
    
    // Check if already applied
    const already = applications.some((a) => a.studentId === stdId && a.driveId === driveId);
    if (already) {
      showToast(`Already applied to ${drv?.companyName || driveId}`);
      return;
    }

    const newApp: StudentApplication = {
      id: `app-${Date.now()}`,
      studentId: stdId,
      driveId: driveId,
      companyName: drv?.companyName || 'Corporate Partner',
      roleTitle: drv?.roleTitle || 'Graduate Trainee',
      logo: drv?.logo || '',
      ctcLPA: drv?.ctcLPA || 12,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      currentRound: 'Online Aptitude & Technical Screening'
    };

    setApplications((prev) => [newApp, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        actorName: std?.name || user?.name || 'Student Candidate',
        actorRole: currentRole,
        actionType: 'Status Change',
        targetEntity: `${drv?.companyName} - ${drv?.roleTitle}`,
        details: 'Submitted candidate application for drive'
      },
      ...prev
    ]);
    showToast(`Application successfully submitted to ${drv?.companyName}!`);
  };

  const handleUpdateCandidateStage = (studentId: string, driveId: string, newStage: string) => {
    const validStageMap: Record<string, StudentApplication['status']> = {
      'Applied': 'Applied',
      'Shortlisted': 'Shortlisted',
      'Assessment Active': 'Assessment Active',
      'Technical Interview': 'Technical Interview',
      'HR Round': 'HR Round',
      'Offered': 'Offered',
      'Joined': 'Joined',
      'Rejected': 'Rejected'
    };
    const mappedStatus = validStageMap[newStage] || 'Shortlisted';

    setApplications((prev) =>
      prev.map((a) =>
        a.studentId === studentId && a.driveId === driveId
          ? { ...a, status: mappedStatus, currentRound: newStage }
          : a
      )
    );
    const std = students.find((s) => s.id === studentId);
    const drv = drives.find((d) => d.id === driveId);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        actorName: user?.name || 'Corporate Recruiter',
        actorRole: currentRole,
        actionType: 'Stage Advanced',
        targetEntity: `${std?.name || studentId} @ ${drv?.companyName || driveId}`,
        details: `Advanced candidate to ${newStage}`
      },
      ...prev
    ]);
    showToast(`${std?.name || 'Candidate'} advanced to "${newStage}" stage`);
  };

  const handleGenerateOffer = (offerData: Partial<OfferRecord>) => {
    const std = students.find((s) => s.id === offerData.studentId);
    const drv = drives.find((d) => d.companyName === offerData.companyName) || drives[0];
    const newOffer: OfferRecord = {
      id: `off-${Date.now()}`,
      studentId: offerData.studentId || students[0].id,
      studentName: std?.name || offerData.studentName || 'Student Candidate',
      usn: std?.usn || offerData.usn || '1RM21CS001',
      branch: std?.branch || offerData.branch || 'CSE',
      companyName: offerData.companyName || drv?.companyName || 'Corporate Partner',
      role: offerData.role || drv?.roleTitle || 'Software Engineer',
      ctcLPA: offerData.ctcLPA || drv?.ctcLPA || 12,
      offerLetterDate: new Date().toISOString().split('T')[0],
      acceptanceDeadline: '2026-03-31',
      joiningDate: '2026-07-01',
      workLocation: offerData.workLocation || 'Bengaluru / Hybrid',
      status: 'Offer Issued',
      documents: [
        { name: 'Offer Letter PDF', verified: false, required: true },
        { name: 'Signed Acceptance', verified: false, required: true },
        { name: 'Final Semester Marksheet', verified: false, required: true },
        { name: 'No Objection Certificate (NOC)', verified: false, required: true }
      ]
    };
    setOffers((prev) => [newOffer, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        actorName: user?.name || 'Corporate Recruiter',
        actorRole: currentRole,
        actionType: 'Offer Issued',
        targetEntity: `${newOffer.studentName} @ ${newOffer.companyName} (${newOffer.ctcLPA} LPA)`,
        details: `Issued formal offer letter for role of ${newOffer.role}`
      },
      ...prev
    ]);
    showToast(`Offer issued to ${newOffer.studentName} for ${newOffer.ctcLPA} LPA!`);
  };

  const handleResolveIssue = (issueId: string, notes: string) => {
    setGroundIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: 'Resolved', resolutionNotes: notes } : i))
    );
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        actorName: user?.name || 'Lead Coordinator',
        actorRole: currentRole,
        actionType: 'Status Change',
        targetEntity: `Ticket ${issueId}`,
        details: `Resolved ground ticket: ${notes}`
      },
      ...prev
    ]);
    showToast(`Ground ticket ${issueId} resolved successfully`);
  };

  const handleAssignVolunteerTask = (newTask: CoordinatorVolunteerTask) => {
    setVolunteers((prev) => [newTask, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: 'Just now',
        actorName: user?.name || 'Lead Coordinator',
        actorRole: currentRole,
        actionType: 'Permission Updated',
        targetEntity: `${newTask.volunteerName}: ${newTask.taskTitle}`,
        details: `Assigned venue duty at ${newTask.venue}`
      },
      ...prev
    ]);
    showToast(`Task assigned to volunteer ${newTask.volunteerName}`);
  };

  const atRiskCount = students.filter((s) => s.isAtRisk || s.activeBacklogs > 0).length;

  // Standalone Landing Page View
  if (activeTab === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => {
            if (!isAuthenticated) {
              setShowLoginModal(true);
            } else {
              setActiveTab(ROLE_DEFAULT_TABS[currentRole] || 'overview');
            }
          }}
          onOpenLogin={(role) => {
            if (role) switchRole(role);
            setShowLoginModal(true);
          }}
        />
        {showLoginModal && (
          <LoginPage
            initialRole={currentRole}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setShowLoginModal(false)}
            isModal={true}
          />
        )}
      </>
    );
  }

  // If user signed out and not on landing, show dedicated full-page Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 px-4 transition-colors duration-200">
        <div className="max-w-5xl mx-auto w-full mb-3 flex items-center justify-between">
          <button
            onClick={() => setActiveTab('landing')}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition cursor-pointer"
          >
            ← Return to Public Showcase
          </button>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Institutional Role-Based Gateway
          </span>
        </div>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          initialRole={currentRole}
          isModal={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Collapsible Left Categorized Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={currentRole}
        currentUser={{
          name: user?.name || 'Authorized User',
          email: user?.email || '',
          title: user?.title || ''
        }}
        conflictCount={conflicts.length}
        atRiskCount={atRiskCount}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenQuickSearch={() => setIsGlobalSearchOpen(true)}
        onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenAddUser={() => setIsAddUserModalOpen(true)}
        onLogout={() => {
          logout();
          setActiveTab('landing');
          showToast('Signed out of CampusLink');
        }}
        hasPermission={hasPermission}
      />

      {/* Main Content Area with Header */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
      }`}>
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userRole={currentRole}
          setUserRole={(role) => {
            switchRole(role);
            const targetTab = hasPermission(activeTab) ? activeTab : (ROLE_DEFAULT_TABS[role] || 'overview');
            setActiveTab(targetTab);
            showToast(`Active perspective switched to ${role}`);
          }}
          currentUser={{
            name: user?.name || 'Authorized User',
            email: user?.email || '',
            title: user?.title || ''
          }}
          onOpenLoginModal={() => setShowLoginModal(true)}
          onOpenAddUser={() => setIsAddUserModalOpen(true)}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onOpenDatabaseConfig={() => setIsDbConfigModalOpen(true)}
          onLogout={() => {
            logout();
            setActiveTab('landing');
            showToast('Signed out of CampusLink');
          }}
          onOpenAuditTrail={() => setIsAuditTrailOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          conflictCount={conflicts.length}
          atRiskCount={atRiskCount}
          onOpenQuickSearch={() => setIsGlobalSearchOpen(true)}
          activeSectionTitle={tabMetadata[activeTab]?.section}
          activeTabLabel={tabMetadata[activeTab]?.label}
          onOpenLandingPage={() => setActiveTab('landing')}
        />

        {/* Dynamic Main Body Content */}
        <main key={activeTab} className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
          <ErrorBoundary key={activeTab} fallbackTitle={`Unable to render ${tabMetadata[activeTab]?.label || activeTab} view`}>
            {!hasPermission(activeTab) ? (
              <RolePermissionGate
                tabId={activeTab}
                tabLabel={tabMetadata[activeTab]?.label || activeTab}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenLoginModal={() => setShowLoginModal(true)}
              />
            ) : (
              <>
              {activeTab === 'tpo-command' && (
                <TpoCommandCenter
                  stats={stats}
                  drives={drives}
                  students={students}
                  mous={mous}
                  approvalRequests={approvalRequests}
                  conflicts={conflicts}
                  onSelectDrive={handleSelectDriveForMatching}
                  onNavigateTab={setActiveTab}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                  onBroadcastAnnouncement={handleBroadcastAnnouncement}
                  onOpenAddUser={() => setIsAddUserModalOpen(true)}
                  onOpenUserManagement={() => setIsUserManagementOpen(true)}
                />
              )}

              {activeTab === 'student-hub' && (
                <StudentCareerHub
                  student={currentStudentProfile}
                  drives={drives}
                  applications={applications}
                  peerInsights={peerInsights}
                  offers={offers}
                  onApplyToDrive={handleApplyToDrive}
                  onAcceptOffer={(offId) => handleUpdateOfferStatus(offId, 'Accepted')}
                  onDeclineOffer={(offId) => handleUpdateOfferStatus(offId, 'Backed Out')}
                  onOpenMakePlacementReady={() => setActiveTab('placement-ready')}
                />
              )}

              {activeTab === 'recruiter-workspace' && (
                <RecruiterWorkspace
                  drives={drives}
                  students={students}
                  offers={offers}
                  onAddNewDrive={handleAddNewDrive}
                  onUpdateCandidateStage={handleUpdateCandidateStage}
                  onGenerateOffer={handleGenerateOffer}
                />
              )}

              {activeTab === 'coordinator-ops' && (
                <CoordinatorGroundOps
                  drives={drives}
                  students={students}
                  volunteers={volunteers}
                  issues={groundIssues}
                  onBroadcastToStudents={(msg) =>
                    handleSendNotification({
                      id: `nt-${Date.now()}`,
                      title: 'Ground Ops Coordinator Broadcast',
                      message: msg,
                      sentAt: 'Just now',
                      status: 'Delivered',
                      channel: 'Portal',
                      audience: 'All Registered Candidates',
                      recipientsCount: 480
                    })
                  }
                  onResolveIssue={handleResolveIssue}
                  onAssignVolunteerTask={handleAssignVolunteerTask}
                />
              )}

              {activeTab === 'overview' && (
                <DashboardOverview
                  stats={stats}
                  drives={drives}
                  conflicts={conflicts}
                  onNavigateTab={(tab) => {
                    if (tab === 'dashboard') setActiveTab('overview');
                    else if (tab === 'readiness') setActiveTab('students');
                    else setActiveTab(tab);
                  }}
                  onSelectDrive={handleSelectDriveForMatching}
                />
              )}

              {activeTab === 'students' && (
                <StudentReadiness
                  students={students}
                  onOpenMatchForStudent={() => setActiveTab('matching')}
                  onOpenPlacementReady={(stdId) => {
                    setAcceleratorStudentId(stdId);
                    setActiveTab('placement-ready');
                  }}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}

              {activeTab === 'placement-ready' && (
                <MakePlacementReady
                  students={students}
                  currentStudentId={currentStudentProfile.id}
                  userRole={currentRole}
                  onUpdateStudent={handleUpdateStudent}
                  onNavigateToTab={setActiveTab}
                />
              )}

              {activeTab === 'pre-talks' && (
                <PlacementPreTalks
                  preTalks={preTalks}
                  students={students}
                  userRole={currentRole}
                  currentStudentId={currentStudentProfile.id}
                  onRegisterForTalk={handleRegisterForTalk}
                  onScheduleTalk={handleScheduleTalk}
                />
              )}

              {activeTab === 'matching' && (
                <CandidateMatching
                  students={students}
                  drives={drives}
                  selectedDriveId={matchingDriveId}
                  onSelectDriveId={setMatchingDriveId}
                />
              )}

              {activeTab === 'drives' && (
                <RecruiterDrives
                  drives={drives}
                  onSelectDriveForMatching={handleSelectDriveForMatching}
                  onAddNewDrive={handleAddNewDrive}
                />
              )}

              {activeTab === 'scheduler' && (
                <DriveScheduler
                  slots={slots}
                  conflicts={conflicts}
                  drives={drives}
                  onAddSlot={handleAddScheduleSlot}
                  onResolveConflict={handleResolveConflict}
                />
              )}

              {activeTab === 'offers' && (
                <OfferTracking
                  offers={offers}
                  students={students}
                  onUpdateOfferStatus={handleUpdateOfferStatus}
                  onUpdateDocumentVerified={handleUpdateDocumentVerified}
                />
              )}

              {activeTab === 'at-risk' && (
                <AtRiskAnalytics
                  students={students}
                  onOpenStudentProfile={() => {
                    setActiveTab('students');
                  }}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsCenter
                  notifications={notifications}
                  drives={drives}
                  onSendNotification={handleSendNotification}
                />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

        {/* Login Portal Modal */}
        {showLoginModal && (
          <LoginPage
            initialRole={currentRole}
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setShowLoginModal(false)}
            isModal={true}
          />
        )}

        {/* Global Modals for All Roles */}
        <GlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          students={students}
          drives={drives}
          mous={mous}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setIsGlobalSearchOpen(false);
          }}
        />

        <AuditTrailModal
          isOpen={isAuditTrailOpen}
          onClose={() => setIsAuditTrailOpen(false)}
          logs={auditLogs}
        />

        <ProfileSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Add Actual User Modal */}
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onUserAdded={(newUser) => {
            showToast(`Actual user "${newUser.name}" provisioned and saved to database!`);
          }}
        />

        {/* User Management Directory Modal */}
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          onOpenAddUser={() => {
            setIsUserManagementOpen(false);
            setIsAddUserModalOpen(true);
          }}
        />

        {/* MongoDB Atlas Configuration Modal */}
        <DatabaseConfigModal
          isOpen={isDbConfigModalOpen}
          onClose={() => setIsDbConfigModalOpen(false)}
          onConnected={() => {
            showToast('Connected to MongoDB Atlas! Synced collections & users.');
          }}
        />



        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-white">CAMPUSLINK</span>
              <span>•</span>
              <span>Rooman Technologies AI-Powered Campus-to-Corporate Placement Management Platform</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
              <button
                onClick={() => setIsDbConfigModalOpen(true)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                MongoDB Atlas Setup
              </button>
              <span>•</span>
              <span>APAAR / ABC Integrated</span>
              <span>•</span>
              <span>Gemini 3.8-Flash Accelerated</span>
              <span>•</span>
              <span>Zero-Spreadsheet Placement Lifecycle</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 24/7 Global AI Campus Placement Helpdesk Chatbot */}
      {activeTab !== 'login' && activeTab !== 'landing' && (
        <CampusHelpdeskChatbot
          userRole={currentRole}
          userName={user?.name || 'Student'}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 text-xs flex items-center space-x-2 animate-fade-in-up">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
