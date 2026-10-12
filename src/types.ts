export type StudentBranch = 'CSE' | 'IT' | 'AI&DS' | 'ECE' | 'EEE' | 'Mechanical' | 'Civil';

export type UserRole = 'TPO' | 'Recruiter' | 'Student' | 'Coordinator';

export type ReadinessTier = 'Corporate Ready' | 'Near Ready' | 'Needs Training' | 'At Risk';

export type AppCategory =
  | 'All'
  | 'academic'
  | 'drives'
  | 'matching'
  | 'outcomes'
  | 'executive'
  | 'Academic & Student'
  | 'Corporate Drives'
  | 'Matching & Ops'
  | 'Outcomes & Radar'
  | 'Executive';

export interface StudentSkill {
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Frameworks' | 'Tools' | 'Cloud & DevOps' | 'Core CS';
  level: number; // 1 to 5
}

export interface SemesterCreditRecord {
  semester: number;
  sgpa: number;
  creditsEarned: number;
  backlogs: number;
  monthYear: string;
}

export interface APAARRecord {
  apaarId: string; // 12-digit Indian National Academic ID (e.g. 9842-1049-3821)
  abcId: string; // Academic Bank of Credits ID (e.g. ABC-849-204-192)
  digiLockerVerified: boolean;
  totalCreditsEarned: number;
  totalCreditsRequired: number;
  creditTransferStatus: 'Fully Synchronized' | 'Pending Verification';
  semesterRecords: SemesterCreditRecord[];
  universityRegNo: string;
  collegeAffiliation: string;
  degreeTitle: string;
  lastSyncDate: string;
}

export interface StudentInternship {
  id: string;
  company: string;
  role: string;
  duration: string;
  stipend?: string;
  description: string;
  skillsUsed: string[];
  certificateUrl?: string;
  verified: boolean;
}

export interface StudentProgram {
  id: string;
  title: string;
  provider: string; // e.g. "Rooman Technologies", "AWS Academy", "NPTEL", "Cisco Networking"
  category: 'Cloud' | 'Full Stack' | 'AI & Data' | 'Cybersecurity' | 'Core CS' | 'Soft Skills';
  completionDate: string;
  credentialId: string;
  scoreOrGrade: string;
  verified: boolean;
}

export interface StudentResumeInfo {
  atsScore: number; // 0 - 100
  lastUpdated: string;
  fileName: string;
  summary: string;
  keyKeywordsMatched: string[];
  missingKeywords: string[];
  improvements: string[];
}

export interface StudentProjectItem {
  id: string;
  title: string;
  domain: string;
  tech: string[];
  description: string;
  githubUrl?: string;
  demoUrl?: string;
  impact: string;
}

export interface StudentProfile {
  id: string;
  usn: string;
  name: string;
  email: string;
  phone: string;
  branch: StudentBranch;
  batch: string;
  cgpa: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  activeBacklogs: number;
  historyOfBacklogs: number;
  readinessScore: number; // 0 - 100
  tier: ReadinessTier;
  skills: StudentSkill[];
  certifications: string[];
  projectsCount: number;
  topProjects: { title: string; tech: string[]; description: string }[];
  projects: StudentProjectItem[];
  internships: StudentInternship[];
  programs: StudentProgram[];
  resume: StudentResumeInfo;
  apaarRecord: APAARRecord;
  prePlacementTalksAttended: string[];
  leetcodeSolved: number;
  githubRepos: number;
  mockInterviewScore: number; // 0 - 100
  aptitudeScore: number; // 0 - 100
  attendancePercent: number; // in placement training
  isAtRisk: boolean;
  riskReasons?: string[];
  resumeUrl?: string;
  placementStatus: 'Unplaced' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Joined';
  offersCount: number;
  highestPackageLPA?: number;
}

export interface PlacementPreTalk {
  id: string;
  driveId: string;
  companyName: string;
  logo: string;
  date: string;
  time: string;
  speaker: {
    name: string;
    designation: string;
  };
  venueOrLink: string;
  mode: 'In-Person Auditorium' | 'Virtual Live Stream' | 'Hybrid';
  mandatoryForBranches: StudentBranch[];
  registeredCount: number;
  topics: string[];
  ctcOverview: string;
  recordingOrDeckUrl?: string;
  status: 'Scheduled' | 'Live Now' | 'Completed';
  registeredStudentIds: string[];
  qnaCount: number;
}

export interface RecruiterDrive {
  id: string;
  companyName: string;
  logo: string;
  roleTitle: string;
  jobType: 'Full-Time' | 'Internship + PPO' | 'Apprenticeship';
  ctcLPA: number;
  stipendMonthly?: number;
  location: string;
  minCGPA: number;
  eligibleBranches: StudentBranch[];
  maxBacklogsAllowed: number;
  requiredSkills: string[];
  preferredSkills: string[];
  driveDate: string;
  deadlineDate: string;
  status: 'Upcoming' | 'Registration Open' | 'Shortlisting' | 'Assessment Active' | 'Interviews Ongoing' | 'Completed';
  venueOrPlatform: string;
  rounds: { name: string; date: string; time: string; type: 'Online' | 'Offline'; venue: string }[];
  shortlistedCount: number;
  registeredCount: number;
  selectedCount: number;
  description: string;
}

export interface CandidateFitScore {
  studentId: string;
  studentName: string;
  usn: string;
  branch: StudentBranch;
  cgpa: number;
  readinessScore: number;
  overallFitScore: number; // 0 - 100
  academicScore: number; // 0 - 100
  technicalScore: number; // 0 - 100
  projectScore: number; // 0 - 100
  assessmentScore: number; // 0 - 100
  isEligible: boolean;
  ineligibilityReason?: string;
  matchedSkills: string[];
  missingSkills: string[];
  explainabilityVerdict: string;
  improvementTip: string;
  shortlisted: boolean;
}

export interface DriveScheduleSlot {
  id: string;
  driveId: string;
  companyName: string;
  roundName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string; // e.g. "Computer Lab A", "Auditorium"
  interviewerCount: number;
  studentBatch: string;
  hasConflict?: boolean;
  conflictDetails?: string[];
}

export interface ScheduleConflict {
  id: string;
  type: 'Drive Overlap' | 'Venue Clashing' | 'Academic Exam Clash' | 'Interviewer Fatigue';
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  involvedItems: string[];
  recommendedResolution: string;
}

export interface OfferRecord {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  branch: StudentBranch;
  companyName: string;
  role: string;
  ctcLPA: number;
  offerLetterDate: string;
  acceptanceDeadline: string;
  joiningDate: string;
  workLocation: string;
  status: 'Offer Issued' | 'Accepted' | 'Documentation Pending' | 'Verified' | 'Joined' | 'Deferred' | 'Backed Out';
  bondYears?: number;
  documents: {
    name: string;
    verified: boolean;
    required: boolean;
    fileUploaded?: string;
  }[];
  notes?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  channel: 'WhatsApp' | 'Email' | 'SMS' | 'Portal';
  recipientsCount: number;
  audience: string;
  message: string;
  sentAt: string;
  status: 'Delivered' | 'Scheduled' | 'Draft';
  openRatePercent?: number;
}

export interface PlacementStats {
  totalEligible: number;
  totalPlaced: number;
  placementRate: number;
  avgPackageLPA: number;
  highestPackageLPA: number;
  medianPackageLPA?: number;
  totalOffers: number;
  activeDrives: number;
  upcomingDrives: number;
  atRiskCount: number;
  branchPlacements: { branch: StudentBranch; total: number; placed: number; avgLPA: number }[];
  tierDistribution: { tier: string; count: number; percentage: number; range: string }[];
  funnelData: { stage: string; count: number; dropRate: number }[];
}

export interface StudentApplication {
  id: string;
  studentId: string;
  driveId: string;
  companyName: string;
  roleTitle: string;
  logo: string;
  ctcLPA: number;
  appliedDate: string;
  status: 'Applied' | 'Shortlisted' | 'Assessment Active' | 'Technical Interview' | 'HR Round' | 'Offered' | 'Joined' | 'Rejected';
  currentRound: string;
  nextStepDeadline?: string;
  feedback?: string;
}

export interface PeerInterviewInsight {
  id: string;
  companyName: string;
  roleTitle: string;
  studentName: string;
  usn: string;
  batch: string;
  verdict: 'Selected & Joined' | 'Selected' | 'Made Final Round';
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Brutal';
  rating: number; // 1-5
  datePosted: string;
  roundsSummary: { roundName: string; summary: string; sampleQuestions: string[] }[];
  topTips: string[];
  preparationMaterialsUsed: string[];
  verifiedByTPO: boolean;
}

export interface CompanyMoU {
  id: string;
  companyName: string;
  logo: string;
  tier: 'Tier-1 Dream' | 'Super Dream' | 'Core Engineering' | 'Partner Enterprise';
  status: 'Active MoU' | 'Renewal Pending' | 'Under Review' | 'Prospective Outreach';
  signedOn: string;
  validUntil: string;
  targetHires: number;
  actualHiresThisYear: number;
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  notes?: string;
}

export interface CoordinatorVolunteerTask {
  id: string;
  volunteerName: string;
  usn: string;
  branch: StudentBranch;
  driveId?: string;
  companyName?: string;
  taskTitle: string;
  venue: string;
  timeSlot: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  priority: 'High' | 'Normal';
}

export interface GroundIssueTicket {
  id: string;
  title: string;
  category: 'Candidate No-Show' | 'Lab WiFi / Power' | 'Interviewer Delay' | 'Venue Conflict' | 'Document Missing';
  severity: 'Critical' | 'Medium' | 'Low';
  driveId: string;
  companyName: string;
  venue: string;
  reportedBy: string;
  timestamp: string;
  status: 'Open' | 'Action Taken' | 'Resolved';
  resolutionNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType: 'Status Change' | 'Drive Created' | 'Student Verified' | 'Offer Issued' | 'Permission Updated' | 'Broadcast Dispatched' | 'Stage Advanced';
  targetEntity: string;
  details: string;
}

export interface DriveApprovalRequest {
  id: string;
  driveId: string;
  companyName: string;
  requestedBy: string;
  requestType: 'Venue Change' | 'Extra Round' | 'Cutoff Waiver' | 'Slot Extension';
  description: string;
  status: 'Pending TPO' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  org: string;
  avatar?: string;
  badge: string;
  studentId?: string;
  password?: string;
  passwordHash?: string;
  status?: 'Active' | 'Pending' | 'Suspended';
  createdAt: string;
  updatedAt?: string;
  department?: string;
  phone?: string;
  usn?: string;
  cgpa?: number;
  branch?: string;
  isActualUser?: boolean;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
  title?: string;
  org?: string;
  phone?: string;
  usn?: string;
  branch?: string;
  department?: string;
  cgpa?: number;
}

export interface LogInPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: UserAccount;
  error?: string;
}

