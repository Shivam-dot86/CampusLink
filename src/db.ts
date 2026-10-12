import fs from 'fs';
import path from 'path';
import {
  StudentProfile,
  RecruiterDrive,
  DriveScheduleSlot,
  ScheduleConflict,
  OfferRecord,
  BroadcastNotification,
  PlacementStats,
  PlacementPreTalk,
  UserAccount
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_DRIVES,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_CONFLICTS,
  INITIAL_OFFERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STATS,
  INITIAL_PRE_TALKS
} from './data/mockData';

export const INITIAL_USERS: UserAccount[] = [];

export interface DatabaseState {
  users: UserAccount[];
  students: StudentProfile[];
  drives: RecruiterDrive[];
  slots: DriveScheduleSlot[];
  conflicts: ScheduleConflict[];
  offers: OfferRecord[];
  notifications: BroadcastNotification[];
  preTalks: PlacementPreTalk[];
  stats: PlacementStats;
  lastUpdated: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// In-memory cache for ultra-fast queries and sync
let dbState: DatabaseState;

function getDefaultState(): DatabaseState {
  return {
    users: [],
    students: INITIAL_STUDENTS,
    drives: INITIAL_DRIVES,
    slots: INITIAL_SCHEDULE_SLOTS,
    conflicts: INITIAL_CONFLICTS,
    offers: INITIAL_OFFERS,
    notifications: INITIAL_NOTIFICATIONS,
    preTalks: INITIAL_PRE_TALKS,
    stats: INITIAL_STATS,
    lastUpdated: new Date().toISOString()
  };
}

// Helper to remove password hashes from output objects
export function sanitizeUser(user: UserAccount): UserAccount {
  const { passwordHash, ...safe } = user;
  return safe as UserAccount;
}

// Initialize on boot
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbState = JSON.parse(raw);
    if (!Array.isArray(dbState.users)) {
      dbState.users = [];
      persistSync();
    }
    console.log(`[DB] Loaded persistent database with ${dbState.users?.length || 0} users, ${dbState.students.length} students and ${dbState.drives.length} drives.`);
  } else {
    dbState = getDefaultState();
    persistSync();
    console.log('[DB] Bootstrapped initial persistent database.');
  }
} catch (err) {
  console.error('[DB] Failed to load database file, restoring defaults:', err);
  dbState = getDefaultState();
}

function persistSync() {
  try {
    dbState.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Failed to persist data to disk:', err);
  }
}

// Recalculate stats dynamically based on current state
function recalculateStats() {
  const total = dbState.students.length;
  const placed = dbState.students.filter(s => s.placementStatus === 'Offered' || s.placementStatus === 'Joined').length;
  const atRisk = dbState.students.filter(s => s.isAtRisk || s.activeBacklogs > 0).length;

  const validOffers = dbState.offers.filter(o => o.status === 'Accepted' || o.status === 'Offer Issued' || o.status === 'Joined');
  const maxOffer = validOffers.reduce((max, o) => Math.max(max, o.ctcLPA), 0);
  const avgOffer = validOffers.length > 0 
    ? Number((validOffers.reduce((sum, o) => sum + o.ctcLPA, 0) / validOffers.length).toFixed(2))
    : 14.5;

  dbState.stats = {
    ...dbState.stats,
    totalEligible: total,
    totalPlaced: placed,
    placementRate: total > 0 ? Math.round((placed / total) * 100) : 74,
    totalOffers: dbState.offers.length,
    activeDrives: dbState.drives.filter(d => d.status === 'Assessment Active' || d.status === 'Interviews Ongoing' || d.status === 'Registration Open').length,
    avgPackageLPA: avgOffer,
    highestPackageLPA: maxOffer > 0 ? maxOffer : 45.0,
    atRiskCount: atRisk,
  };
}

export const db = {
  // Snapshot
  getAll: () => {
    recalculateStats();
    return dbState;
  },

  resetDefaults: () => {
    dbState = getDefaultState();
    persistSync();
    return dbState;
  },

  // Students
  students: {
    findMany: (filter?: (s: StudentProfile) => boolean) => {
      return filter ? dbState.students.filter(filter) : dbState.students;
    },
    findById: (id: string) => {
      return dbState.students.find(s => s.id === id || s.usn === id);
    },
    create: (student: StudentProfile) => {
      dbState.students.unshift(student);
      recalculateStats();
      persistSync();
      return student;
    },
    update: (id: string, updates: Partial<StudentProfile>) => {
      const idx = dbState.students.findIndex(s => s.id === id || s.usn === id);
      if (idx === -1) return null;
      dbState.students[idx] = { ...dbState.students[idx], ...updates };
      recalculateStats();
      persistSync();
      return dbState.students[idx];
    },
    delete: (id: string) => {
      const idx = dbState.students.findIndex(s => s.id === id);
      if (idx === -1) return false;
      dbState.students.splice(idx, 1);
      recalculateStats();
      persistSync();
      return true;
    }
  },

  // Recruiter Drives
  drives: {
    findMany: () => dbState.drives,
    findById: (id: string) => dbState.drives.find(d => d.id === id),
    create: (drive: RecruiterDrive) => {
      dbState.drives.unshift(drive);
      recalculateStats();
      persistSync();
      return drive;
    },
    update: (id: string, updates: Partial<RecruiterDrive>) => {
      const idx = dbState.drives.findIndex(d => d.id === id);
      if (idx === -1) return null;
      dbState.drives[idx] = { ...dbState.drives[idx], ...updates };
      recalculateStats();
      persistSync();
      return dbState.drives[idx];
    },
    delete: (id: string) => {
      const idx = dbState.drives.findIndex(d => d.id === id);
      if (idx === -1) return false;
      dbState.drives.splice(idx, 1);
      recalculateStats();
      persistSync();
      return true;
    }
  },

  // Placement Pre-Talks
  preTalks: {
    findMany: () => dbState.preTalks,
    findById: (id: string) => dbState.preTalks.find(t => t.id === id),
    create: (talk: PlacementPreTalk) => {
      dbState.preTalks.unshift(talk);
      persistSync();
      return talk;
    },
    update: (id: string, updates: Partial<PlacementPreTalk>) => {
      const idx = dbState.preTalks.findIndex(t => t.id === id);
      if (idx === -1) return null;
      dbState.preTalks[idx] = { ...dbState.preTalks[idx], ...updates };
      persistSync();
      return dbState.preTalks[idx];
    },
    toggleRsvp: (talkId: string, studentId: string) => {
      const talk = dbState.preTalks.find(t => t.id === talkId);
      if (!talk) return null;
      const isReg = talk.registeredStudentIds.includes(studentId);
      const updatedIds = isReg 
        ? talk.registeredStudentIds.filter(id => id !== studentId)
        : [...talk.registeredStudentIds, studentId];
      talk.registeredStudentIds = updatedIds;
      talk.registeredCount = updatedIds.length;

      // Also update student attendance record
      const student = dbState.students.find(s => s.id === studentId);
      if (student) {
        const talksAttended = student.prePlacementTalksAttended || [];
        student.prePlacementTalksAttended = isReg
          ? talksAttended.filter(id => id !== talkId)
          : [...talksAttended, talkId];
      }

      persistSync();
      return talk;
    }
  },

  // Slots & Conflicts
  slots: {
    findMany: () => dbState.slots,
    create: (slot: DriveScheduleSlot) => {
      dbState.slots.push(slot);
      if (slot.hasConflict) {
        dbState.conflicts.push({
          id: `cnf-${Date.now()}`,
          type: 'Venue Clashing',
          severity: 'High',
          description: `Collision in ${slot.venue} on ${slot.date}`,
          involvedItems: [slot.companyName, slot.venue],
          recommendedResolution: 'Allocate alternative CAD / Seminar Lab'
        });
      }
      persistSync();
      return slot;
    },
    resolveConflict: (conflictId: string) => {
      dbState.conflicts = dbState.conflicts.filter(c => c.id !== conflictId);
      dbState.slots = dbState.slots.map(s => ({ ...s, hasConflict: false, conflictDetails: undefined }));
      persistSync();
      return true;
    }
  },

  conflicts: {
    findMany: () => dbState.conflicts
  },

  // Offers
  offers: {
    findMany: () => dbState.offers,
    findById: (id: string) => dbState.offers.find(o => o.id === id),
    create: (offer: OfferRecord) => {
      dbState.offers.unshift(offer);
      // Update student status to placed or in-process
      const student = dbState.students.find(s => s.id === offer.studentId);
      if (student && (offer.status === 'Accepted' || offer.status === 'Offer Issued' || offer.status === 'Joined')) {
        student.placementStatus = offer.status === 'Joined' ? 'Joined' : 'Offered';
        student.offersCount = (student.offersCount || 0) + 1;
        if (!student.highestPackageLPA || offer.ctcLPA > student.highestPackageLPA) {
          student.highestPackageLPA = offer.ctcLPA;
        }
      }
      recalculateStats();
      persistSync();
      return offer;
    },
    updateStatus: (id: string, status: OfferRecord['status']) => {
      const offer = dbState.offers.find(o => o.id === id);
      if (!offer) return null;
      offer.status = status;
      const student = dbState.students.find(s => s.id === offer.studentId);
      if (student) {
        if (status === 'Joined') {
          student.placementStatus = 'Joined';
        } else if (status === 'Accepted' || status === 'Offer Issued') {
          student.placementStatus = 'Offered';
        } else if (status === 'Backed Out' || status === 'Deferred') {
          student.placementStatus = 'Unplaced';
        }
      }
      recalculateStats();
      persistSync();
      return offer;
    },
    verifyDoc: (offerId: string, docIndex: number, verified: boolean) => {
      const offer = dbState.offers.find(o => o.id === offerId);
      if (!offer || !offer.documents[docIndex]) return null;
      offer.documents[docIndex].verified = verified;
      persistSync();
      return offer;
    }
  },

  // Notifications
  notifications: {
    findMany: () => dbState.notifications,
    create: (notif: BroadcastNotification) => {
      dbState.notifications.unshift(notif);
      persistSync();
      return notif;
    }
  },

  // Users
  users: {
    findMany: () => (dbState.users || []).map(sanitizeUser),
    findById: (id: string) => {
      const u = (dbState.users || []).find(x => x.id === id);
      return u ? sanitizeUser(u) : undefined;
    },
    findByEmail: (email: string) => {
      const u = (dbState.users || []).find(x => x.email.toLowerCase() === email.toLowerCase());
      return u ? sanitizeUser(u) : undefined;
    },
    findByEmailWithPassword: (email: string) => {
      return (dbState.users || []).find(x => x.email.toLowerCase() === email.toLowerCase());
    },
    create: (user: UserAccount) => {
      if (!dbState.users) dbState.users = [];
      const now = new Date().toISOString();
      const userToStore = {
        ...user,
        createdAt: user.createdAt || now,
        updatedAt: now
      };
      const existingIdx = dbState.users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (existingIdx !== -1) {
        dbState.users[existingIdx] = { ...dbState.users[existingIdx], ...userToStore, updatedAt: now };
        persistSync();
        return sanitizeUser(dbState.users[existingIdx]);
      }
      dbState.users.push(userToStore);
      persistSync();
      return sanitizeUser(userToStore);
    },
    update: (id: string, updates: Partial<UserAccount>) => {
      if (!dbState.users) dbState.users = [];
      const idx = dbState.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      dbState.users[idx] = { ...dbState.users[idx], ...updates, updatedAt: new Date().toISOString() };
      persistSync();
      return sanitizeUser(dbState.users[idx]);
    },
    delete: (id: string) => {
      if (!dbState.users) return false;
      const initialLen = dbState.users.length;
      dbState.users = dbState.users.filter(u => u.id !== id);
      if (dbState.users.length !== initialLen) {
        persistSync();
        return true;
      }
      return false;
    }
  },

  // Stats
  stats: {
    get: () => {
      recalculateStats();
      return dbState.stats;
    }
  }
};
