import mongoose, { Schema, Document } from 'mongoose';
import fs from 'fs';
import path from 'path';
import {
  StudentProfile,
  RecruiterDrive,
  DriveScheduleSlot,
  ScheduleConflict,
  OfferRecord,
  BroadcastNotification,
  PlacementPreTalk,
  PlacementStats,
  UserAccount
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_DRIVES,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_CONFLICTS,
  INITIAL_OFFERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRE_TALKS,
  INITIAL_STATS
} from '../data/mockData';
import { db as fileDb, sanitizeUser } from '../db';

// -------------------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// -------------------------------------------------------------

// 1. Student Schema
const StudentSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  usn: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  branch: { type: String, required: true },
  batch: { type: String, default: '2022-2026' },
  cgpa: { type: Number, required: true },
  tenthPercentage: { type: Number, default: 85 },
  twelfthPercentage: { type: Number, default: 85 },
  activeBacklogs: { type: Number, default: 0 },
  historyOfBacklogs: { type: Number, default: 0 },
  readinessScore: { type: Number, default: 50 },
  tier: { type: String, default: 'Needs Training' },
  skills: { type: Array, default: [] },
  certifications: { type: [String], default: [] },
  projectsCount: { type: Number, default: 0 },
  topProjects: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  internships: { type: Array, default: [] },
  programs: { type: Array, default: [] },
  resume: { type: Object, default: {} },
  apaarRecord: { type: Object, default: {} },
  prePlacementTalksAttended: { type: [String], default: [] },
  leetcodeSolved: { type: Number, default: 0 },
  githubRepos: { type: Number, default: 0 },
  mockInterviewScore: { type: Number, default: 0 },
  aptitudeScore: { type: Number, default: 0 },
  attendancePercent: { type: Number, default: 80 },
  isAtRisk: { type: Boolean, default: false },
  riskReasons: { type: [String], default: [] },
  resumeUrl: { type: String },
  placementStatus: { type: String, default: 'Unplaced' },
  offersCount: { type: Number, default: 0 },
  highestPackageLPA: { type: Number }
}, { timestamps: true, strict: false });

export const StudentModel = (mongoose.models.Student as mongoose.Model<StudentProfile>) || mongoose.model<StudentProfile>('Student', StudentSchema);

// 2. Recruiter Drive Schema
const DriveSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  companyName: { type: String, required: true },
  logo: { type: String, default: '' },
  roleTitle: { type: String, required: true },
  jobType: { type: String, default: 'Full-Time' },
  ctcLPA: { type: Number, required: true },
  stipendMonthly: { type: Number },
  location: { type: String, default: 'Bangalore / Hybrid' },
  minCGPA: { type: Number, default: 7.0 },
  eligibleBranches: { type: [String], default: ['CSE', 'IT', 'AI&DS'] },
  maxBacklogsAllowed: { type: Number, default: 0 },
  requiredSkills: { type: [String], default: [] },
  preferredSkills: { type: [String], default: [] },
  driveDate: { type: String, default: '' },
  deadlineDate: { type: String, default: '' },
  status: { type: String, default: 'Upcoming' },
  venueOrPlatform: { type: String, default: 'Campus / Virtual' },
  rounds: { type: Array, default: [] },
  shortlistedCount: { type: Number, default: 0 },
  registeredCount: { type: Number, default: 0 },
  selectedCount: { type: Number, default: 0 },
  description: { type: String, default: '' }
}, { timestamps: true, strict: false });

export const DriveModel = (mongoose.models.Drive as mongoose.Model<RecruiterDrive>) || mongoose.model<RecruiterDrive>('Drive', DriveSchema);

// 3. Placement Pre-Talk Schema
const PreTalkSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  driveId: { type: String, required: true },
  companyName: { type: String, required: true },
  logo: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  speaker: { type: Object, default: { name: 'Campus Lead', designation: 'Technical Recruiter' } },
  venueOrLink: { type: String, default: 'Main Auditorium' },
  mode: { type: String, default: 'In-Person Auditorium' },
  mandatoryForBranches: { type: [String], default: [] },
  registeredCount: { type: Number, default: 0 },
  topics: { type: [String], default: [] },
  ctcOverview: { type: String, default: '' },
  recordingOrDeckUrl: { type: String },
  status: { type: String, default: 'Scheduled' },
  registeredStudentIds: { type: [String], default: [] },
  qnaCount: { type: Number, default: 0 }
}, { timestamps: true, strict: false });

export const PreTalkModel = (mongoose.models.PreTalk as mongoose.Model<PlacementPreTalk>) || mongoose.model<PlacementPreTalk>('PreTalk', PreTalkSchema);

// 4. Drive Schedule Slot Schema
const ScheduleSlotSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  driveId: { type: String, required: true },
  companyName: { type: String, required: true },
  roundName: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  interviewerCount: { type: Number, default: 3 },
  studentBatch: { type: String, default: 'Batch A' },
  hasConflict: { type: Boolean, default: false },
  conflictDetails: { type: [String], default: [] }
}, { timestamps: true, strict: false });

export const ScheduleSlotModel = (mongoose.models.ScheduleSlot as mongoose.Model<DriveScheduleSlot>) || mongoose.model<DriveScheduleSlot>('ScheduleSlot', ScheduleSlotSchema);

// 5. Schedule Conflict Schema
const ScheduleConflictSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },
  severity: { type: String, required: true },
  description: { type: String, required: true },
  involvedItems: { type: [String], default: [] },
  recommendedResolution: { type: String, default: '' }
}, { timestamps: true, strict: false });

export const ScheduleConflictModel = (mongoose.models.ScheduleConflict as mongoose.Model<ScheduleConflict>) || mongoose.model<ScheduleConflict>('ScheduleConflict', ScheduleConflictSchema);

// 6. Offer Record Schema
const OfferSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  usn: { type: String, required: true },
  branch: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  ctcLPA: { type: Number, required: true },
  offerLetterDate: { type: String, required: true },
  acceptanceDeadline: { type: String, required: true },
  joiningDate: { type: String, required: true },
  workLocation: { type: String, default: 'Bangalore' },
  status: { type: String, default: 'Offer Issued' },
  bondYears: { type: Number },
  documents: { type: Array, default: [] },
  notes: { type: String }
}, { timestamps: true, strict: false });

export const OfferModel = (mongoose.models.Offer as mongoose.Model<OfferRecord>) || mongoose.model<OfferRecord>('Offer', OfferSchema);

// 7. Broadcast Notification Schema
const NotificationSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  channel: { type: String, required: true },
  recipientsCount: { type: Number, default: 0 },
  audience: { type: String, required: true },
  message: { type: String, required: true },
  sentAt: { type: String, required: true },
  status: { type: String, default: 'Delivered' },
  openRatePercent: { type: Number, default: 90 }
}, { timestamps: true, strict: false });

export const NotificationModel = (mongoose.models.Notification as mongoose.Model<BroadcastNotification>) || mongoose.model<BroadcastNotification>('Notification', NotificationSchema);

// 8. User Schema (Production-Ready Auth & Profile Persistence)
const UserSchema = new Schema<any>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['TPO', 'Recruiter', 'Student', 'Coordinator'], default: 'Student' },
  title: { type: String, default: '' },
  org: { type: String, default: '' },
  avatar: { type: String, default: '' },
  badge: { type: String, default: '' },
  studentId: { type: String },
  status: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
  department: { type: String },
  phone: { type: String },
  usn: { type: String },
  cgpa: { type: Number },
  branch: { type: String },
  isActualUser: { type: Boolean, default: true }
}, { timestamps: true, strict: false });

export const UserModel = (mongoose.models.User as mongoose.Model<any>) || mongoose.model<any>('User', UserSchema);


// -------------------------------------------------------------
// MONGODB CONNECTION & LIFECYCLE MANAGEMENT
// -------------------------------------------------------------

interface MongoConnectionStatus {
  connected: boolean;
  uriConfigured: boolean;
  clusterHost?: string;
  databaseName?: string;
  modelsLoaded: string[];
  lastError?: string;
  mode: 'MongoDB Atlas' | 'Local Resilient Store (Pending Atlas URI)';
}

let connectionStatus: MongoConnectionStatus = {
  connected: false,
  uriConfigured: Boolean(process.env.MONGODB_URI),
  modelsLoaded: ['Student', 'Drive', 'PreTalk', 'ScheduleSlot', 'ScheduleConflict', 'Offer', 'Notification', 'User'],
  mode: process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local Resilient Store (Pending Atlas URI)'
};

let retryTimer: NodeJS.Timeout | null = null;

/**
 * Helper to save MongoDB URI permanently to disk (data/mongodb_config.json and .env)
 */
export function saveMongoUri(uri: string) {
  let cleanUri = uri.trim();
  if (cleanUri.includes('.mongodb.net/?')) {
    cleanUri = cleanUri.replace('.mongodb.net/?', '.mongodb.net/placement_ready?');
  } else if (cleanUri.endsWith('.mongodb.net/')) {
    cleanUri = cleanUri + 'placement_ready?retryWrites=true&w=majority';
  } else if (cleanUri.endsWith('.mongodb.net')) {
    cleanUri = cleanUri + '/placement_ready?retryWrites=true&w=majority';
  }

  process.env.MONGODB_URI = cleanUri;

  // 1. Save to ./data/mongodb_config.json
  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const configPath = path.join(dataDir, 'mongodb_config.json');
    fs.writeFileSync(configPath, JSON.stringify({ uri: cleanUri, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
    console.log('[MongoDB] URI saved to ./data/mongodb_config.json');
  } catch (err) {
    console.warn('[MongoDB] Could not save URI to mongodb_config.json:', err);
  }

  // 2. Save to .env
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }
    if (envContent.includes('MONGODB_URI=')) {
      envContent = envContent.replace(/MONGODB_URI=.*/g, `MONGODB_URI="${cleanUri}"`);
    } else {
      envContent = (envContent.trim() ? envContent.trim() + '\n' : '') + `MONGODB_URI="${cleanUri}"\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('[MongoDB] MONGODB_URI saved to .env successfully.');
  } catch (e) {
    console.warn('[MongoDB] Could not save URI to .env file:', e);
  }
}

/**
 * Initializes MongoDB connection using MONGODB_URI.
 * Automatically checks environment, data/mongodb_config.json, and .env file on server start.
 */
export async function initMongoDB() {
  let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : '';

  if (!uri) {
    // 1. Try reading from ./data/mongodb_config.json
    try {
      const configPath = path.resolve(process.cwd(), 'data', 'mongodb_config.json');
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.uri && typeof parsed.uri === 'string' && parsed.uri.trim()) {
          uri = parsed.uri.trim();
          process.env.MONGODB_URI = uri;
          console.log('[MongoDB] Automatically loaded saved MONGODB_URI from ./data/mongodb_config.json on app start.');
        }
      }
    } catch (e) {
      console.warn('[MongoDB] Failed to load mongodb_config.json:', e);
    }
  }

  if (!uri) {
    // 2. Try reading from .env file
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
        if (match && match[1] && match[1].trim()) {
          uri = match[1].trim();
          process.env.MONGODB_URI = uri;
          console.log('[MongoDB] Automatically loaded MONGODB_URI from .env file on app start.');
        }
      }
    } catch (e) {
      console.warn('[MongoDB] Failed to read .env file:', e);
    }
  }

  if (uri) {
    if (uri.includes('.mongodb.net/?')) {
      uri = uri.replace('.mongodb.net/?', '.mongodb.net/placement_ready?');
    } else if (uri.endsWith('.mongodb.net/')) {
      uri = uri + 'placement_ready?retryWrites=true&w=majority';
    } else if (uri.endsWith('.mongodb.net')) {
      uri = uri + '/placement_ready?retryWrites=true&w=majority';
    }
    process.env.MONGODB_URI = uri;
  }

  if (!uri) {
    console.log('[MongoDB] MONGODB_URI is not set in environment or config. Operating in Local Resilient Store mode.');
    connectionStatus.connected = false;
    connectionStatus.uriConfigured = false;
    connectionStatus.mode = 'Local Resilient Store (Pending Atlas URI)';
    return;
  }

  connectionStatus.uriConfigured = true;

  try {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch (discErr) {
        // ignore
      }
    }
    console.log('[MongoDB] Connecting automatically to MongoDB Atlas cluster...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    connectionStatus.connected = true;
    connectionStatus.mode = 'MongoDB Atlas';
    connectionStatus.clusterHost = mongoose.connection.host;
    connectionStatus.databaseName = mongoose.connection.name;
    connectionStatus.lastError = undefined;

    console.log(`[MongoDB] Connected successfully to MongoDB Atlas! Host: ${mongoose.connection.host}, DB: ${mongoose.connection.name}`);

    // Seed/sync collections including users into MongoDB Atlas
    await seedMongoIfEmpty();
  } catch (err: any) {
    console.log('[MongoDB] Connection attempt error:', err?.message || err);
    connectionStatus.connected = false;
    connectionStatus.lastError = err?.message || String(err);
    connectionStatus.mode = 'Local Resilient Store (Pending Atlas URI)';

    // Soft retry in background
    if (!retryTimer && process.env.MONGODB_URI) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        if (!connectionStatus.connected) {
          initMongoDB();
        }
      }, 30000);
    }
  }
}



/**
 * Automatically seeds benchmark placement data into MongoDB collections if empty.
 */
async function seedMongoIfEmpty() {
  if (!connectionStatus.connected) return;

  try {
    const studentCount = await StudentModel.countDocuments();
    if (studentCount === 0) {
      console.log('[MongoDB] Seeding initial students into MongoDB Atlas...');
      await StudentModel.insertMany(INITIAL_STUDENTS);
    }

    const driveCount = await DriveModel.countDocuments();
    if (driveCount === 0) {
      console.log('[MongoDB] Seeding initial placement drives into MongoDB Atlas...');
      await DriveModel.insertMany(INITIAL_DRIVES);
    }

    const preTalkCount = await PreTalkModel.countDocuments();
    if (preTalkCount === 0) {
      console.log('[MongoDB] Seeding initial pre-placement talks into MongoDB Atlas...');
      await PreTalkModel.insertMany(INITIAL_PRE_TALKS);
    }

    const slotCount = await ScheduleSlotModel.countDocuments();
    if (slotCount === 0) {
      console.log('[MongoDB] Seeding initial schedule slots into MongoDB Atlas...');
      await ScheduleSlotModel.insertMany(INITIAL_SCHEDULE_SLOTS);
    }

    const conflictCount = await ScheduleConflictModel.countDocuments();
    if (conflictCount === 0) {
      console.log('[MongoDB] Seeding initial schedule conflicts into MongoDB Atlas...');
      await ScheduleConflictModel.insertMany(INITIAL_CONFLICTS);
    }

    const offerCount = await OfferModel.countDocuments();
    if (offerCount === 0) {
      console.log('[MongoDB] Seeding initial placement offers into MongoDB Atlas...');
      await OfferModel.insertMany(INITIAL_OFFERS);
    }

    const notifCount = await NotificationModel.countDocuments();
    if (notifCount === 0) {
      console.log('[MongoDB] Seeding initial broadcast notifications into MongoDB Atlas...');
      await NotificationModel.insertMany(INITIAL_NOTIFICATIONS);
    }

    // Sync all users from fileDb to MongoDB Atlas 'users' collection
    console.log('[MongoDB] Seeding/Syncing users into MongoDB Atlas...');
    const fullUsers = (fileDb.getAll() as any).users || [];
    if (fullUsers.length > 0) {
      for (const u of fullUsers) {
        if (u.email) {
          await UserModel.findOneAndUpdate(
            { email: u.email.toLowerCase() },
            u,
            { upsert: true, new: true }
          );
        }
      }
      console.log(`[MongoDB] Successfully synced ${fullUsers.length} user(s) to MongoDB Atlas 'users' collection.`);
    }

    // Bi-directional sync: Import any users from MongoDB Atlas 'users' collection into local store
    try {
      const atlasUsers = await UserModel.find().lean().exec();
      if (atlasUsers && atlasUsers.length > 0) {
        let importedCount = 0;
        for (const au of atlasUsers) {
          if (au.email) {
            fileDb.users.create(au);
            importedCount++;
          }
        }
        console.log(`[MongoDB] Bi-directional sync verified: ${importedCount} user(s) in local store synced with MongoDB Atlas.`);
      }
    } catch (syncErr) {
      console.warn('[MongoDB] Note during Atlas user back-fill to local store:', syncErr);
    }

    console.log('[MongoDB] Atlas database collections initialized and verified.');
  } catch (err) {
    console.error('[MongoDB] Error during collection seeding:', err);
  }
}

export function getMongoStatus(): MongoConnectionStatus {
  return {
    ...connectionStatus,
    connected: mongoose.connection.readyState === 1,
    clusterHost: mongoose.connection.host || connectionStatus.clusterHost,
    databaseName: mongoose.connection.name || connectionStatus.databaseName
  };
}

// -------------------------------------------------------------
// UNIFIED DATA REPOSITORY (MongoDB with Resilient Local Fallback)
// -------------------------------------------------------------

function isMongoActive(): boolean {
  return mongoose.connection.readyState === 1;
}

export const mongoDb = {
  getStatus: getMongoStatus,

  // Full state snapshot
  getState: async () => {
    if (isMongoActive()) {
      try {
        const [students, drives, slots, conflicts, offers, notifications, preTalks] = await Promise.all([
          StudentModel.find().lean().exec() as Promise<StudentProfile[]>,
          DriveModel.find().lean().exec() as Promise<RecruiterDrive[]>,
          ScheduleSlotModel.find().lean().exec() as Promise<DriveScheduleSlot[]>,
          ScheduleConflictModel.find().lean().exec() as Promise<ScheduleConflict[]>,
          OfferModel.find().lean().exec() as Promise<OfferRecord[]>,
          NotificationModel.find().lean().exec() as Promise<BroadcastNotification[]>,
          PreTalkModel.find().lean().exec() as Promise<PlacementPreTalk[]>
        ]);

        const total = students.length;
        const placed = students.filter(s => s.placementStatus === 'Offered' || s.placementStatus === 'Joined').length;
        const atRisk = students.filter(s => s.isAtRisk || s.activeBacklogs > 0).length;
        const validOffers = offers.filter(o => o.status === 'Accepted' || o.status === 'Offer Issued' || o.status === 'Joined');
        const maxOffer = validOffers.reduce((max, o) => Math.max(max, o.ctcLPA), 0);
        const avgOffer = validOffers.length > 0
          ? Number((validOffers.reduce((sum, o) => sum + o.ctcLPA, 0) / validOffers.length).toFixed(2))
          : 14.5;

        const dynamicStats: PlacementStats = {
          ...INITIAL_STATS,
          totalEligible: total,
          totalPlaced: placed,
          placementRate: total > 0 ? Math.round((placed / total) * 100) : 74,
          totalOffers: offers.length,
          activeDrives: drives.filter(d => d.status === 'Assessment Active' || d.status === 'Interviews Ongoing' || d.status === 'Registration Open').length,
          avgPackageLPA: avgOffer,
          highestPackageLPA: maxOffer > 0 ? maxOffer : 45.0,
          atRiskCount: atRisk,
        };

        return {
          students,
          drives,
          slots,
          conflicts,
          offers,
          notifications,
          preTalks,
          stats: dynamicStats,
          dataSource: 'MongoDB Atlas',
          mongoConnected: true
        };
      } catch (err) {
        console.error('[MongoDB] Error reading state from MongoDB, falling back to local file store:', err);
      }
    }

    const fileState = fileDb.getAll();
    return {
      ...fileState,
      dataSource: 'Local Persistent Store (Fallback)',
      mongoConnected: false
    };
  },

  // Reset database
  resetDefaults: async () => {
    if (isMongoActive()) {
      try {
        await Promise.all([
          StudentModel.deleteMany({}),
          DriveModel.deleteMany({}),
          ScheduleSlotModel.deleteMany({}),
          ScheduleConflictModel.deleteMany({}),
          OfferModel.deleteMany({}),
          NotificationModel.deleteMany({}),
          PreTalkModel.deleteMany({})
        ]);

        await Promise.all([
          StudentModel.insertMany(INITIAL_STUDENTS),
          DriveModel.insertMany(INITIAL_DRIVES),
          ScheduleSlotModel.insertMany(INITIAL_SCHEDULE_SLOTS),
          ScheduleConflictModel.insertMany(INITIAL_CONFLICTS),
          OfferModel.insertMany(INITIAL_OFFERS),
          NotificationModel.insertMany(INITIAL_NOTIFICATIONS),
          PreTalkModel.insertMany(INITIAL_PRE_TALKS)
        ]);

        return await mongoDb.getState();
      } catch (err) {
        console.error('[MongoDB] Error resetting Mongo collections:', err);
      }
    }
    const state = fileDb.resetDefaults();
    return { ...state, dataSource: 'Local Persistent Store', mongoConnected: false };
  },

  // 1. STUDENTS
  students: {
    findMany: async (filter?: any) => {
      if (isMongoActive()) {
        const query: any = {};
        if (filter?.branch && filter.branch !== 'All') query.branch = filter.branch;
        if (filter?.tier && filter.tier !== 'All') query.tier = filter.tier;
        if (filter?.status && filter.status !== 'All') query.placementStatus = filter.status;
        if (filter?.query) {
          const regex = new RegExp(filter.query, 'i');
          query.$or = [{ name: regex }, { usn: regex }, { 'apaarRecord.apaarId': regex }];
        }
        return await StudentModel.find(query).lean().exec() as StudentProfile[];
      }
      return fileDb.students.findMany();
    },

    findById: async (id: string) => {
      if (isMongoActive()) {
        return await StudentModel.findOne({ $or: [{ id }, { usn: id }] }).lean().exec() as StudentProfile | null;
      }
      return fileDb.students.findById(id);
    },

    create: async (student: StudentProfile) => {
      // Sync local file store as well
      fileDb.students.create(student);
      if (isMongoActive()) {
        try {
          const doc = await StudentModel.create(student);
          return doc.toObject() as StudentProfile;
        } catch (err) {
          console.error('[MongoDB] Error inserting student into MongoDB:', err);
        }
      }
      return student;
    },

    update: async (id: string, updates: Partial<StudentProfile>) => {
      fileDb.students.update(id, updates);
      if (isMongoActive()) {
        try {
          const updated = await StudentModel.findOneAndUpdate(
            { $or: [{ id }, { usn: id }] },
            { $set: updates },
            { new: true }
          ).lean().exec();
          if (updated) return updated as StudentProfile;
        } catch (err) {
          console.error('[MongoDB] Error updating student in MongoDB:', err);
        }
      }
      return fileDb.students.findById(id);
    },

    delete: async (id: string) => {
      fileDb.students.delete(id);
      if (isMongoActive()) {
        try {
          const res = await StudentModel.deleteOne({ $or: [{ id }, { usn: id }] });
          return res.deletedCount > 0;
        } catch (err) {
          console.error('[MongoDB] Error deleting student from MongoDB:', err);
        }
      }
      return true;
    }
  },

  // 2. RECRUITER DRIVES
  drives: {
    findMany: async () => {
      if (isMongoActive()) {
        return await DriveModel.find().lean().exec() as RecruiterDrive[];
      }
      return fileDb.drives.findMany();
    },

    findById: async (id: string) => {
      if (isMongoActive()) {
        return await DriveModel.findOne({ id }).lean().exec() as RecruiterDrive | null;
      }
      return fileDb.drives.findById(id);
    },

    create: async (drive: RecruiterDrive) => {
      fileDb.drives.create(drive);
      if (isMongoActive()) {
        try {
          const doc = await DriveModel.create(drive);
          return doc.toObject() as RecruiterDrive;
        } catch (err) {
          console.error('[MongoDB] Error creating drive in MongoDB:', err);
        }
      }
      return drive;
    },

    update: async (id: string, updates: Partial<RecruiterDrive>) => {
      fileDb.drives.update(id, updates);
      if (isMongoActive()) {
        try {
          const updated = await DriveModel.findOneAndUpdate(
            { id },
            { $set: updates },
            { new: true }
          ).lean().exec();
          if (updated) return updated as RecruiterDrive;
        } catch (err) {
          console.error('[MongoDB] Error updating drive in MongoDB:', err);
        }
      }
      return fileDb.drives.findById(id);
    },

    delete: async (id: string) => {
      fileDb.drives.delete(id);
      if (isMongoActive()) {
        try {
          const res = await DriveModel.deleteOne({ id });
          return res.deletedCount > 0;
        } catch (err) {
          console.error('[MongoDB] Error deleting drive from MongoDB:', err);
        }
      }
      return true;
    }
  },

  // 3. PLACEMENT PRE-TALKS
  preTalks: {
    findMany: async () => {
      if (isMongoActive()) {
        return await PreTalkModel.find().lean().exec() as PlacementPreTalk[];
      }
      return fileDb.preTalks.findMany();
    },

    findById: async (id: string) => {
      if (isMongoActive()) {
        return await PreTalkModel.findOne({ id }).lean().exec() as PlacementPreTalk | null;
      }
      return fileDb.preTalks.findById(id);
    },

    create: async (talk: PlacementPreTalk) => {
      fileDb.preTalks.create(talk);
      if (isMongoActive()) {
        try {
          const doc = await PreTalkModel.create(talk);
          return doc.toObject() as PlacementPreTalk;
        } catch (err) {
          console.error('[MongoDB] Error creating pre-talk in MongoDB:', err);
        }
      }
      return talk;
    },

    toggleRsvp: async (talkId: string, studentId: string) => {
      const talk = fileDb.preTalks.toggleRsvp(talkId, studentId);
      if (isMongoActive()) {
        try {
          const currentTalk = await PreTalkModel.findOne({ id: talkId });
          if (currentTalk) {
            const isReg = currentTalk.registeredStudentIds.includes(studentId);
            const updatedIds = isReg
              ? currentTalk.registeredStudentIds.filter((id: string) => id !== studentId)
              : [...currentTalk.registeredStudentIds, studentId];

            currentTalk.registeredStudentIds = updatedIds;
            currentTalk.registeredCount = updatedIds.length;
            await currentTalk.save();

            // Also update student attendance in MongoDB
            const student = await StudentModel.findOne({ $or: [{ id: studentId }, { usn: studentId }] });
            if (student) {
              const talksAttended = student.prePlacementTalksAttended || [];
              student.prePlacementTalksAttended = isReg
                ? talksAttended.filter((id: string) => id !== talkId)
                : [...talksAttended, talkId];
              await student.save();
            }

            return currentTalk.toObject() as PlacementPreTalk;
          }

        } catch (err) {
          console.error('[MongoDB] Error toggling RSVP in MongoDB:', err);
        }
      }
      return talk;
    }
  },

  // 4. SCHEDULER SLOTS & CONFLICTS
  slots: {
    findMany: async () => {
      if (isMongoActive()) {
        return await ScheduleSlotModel.find().lean().exec() as DriveScheduleSlot[];
      }
      return fileDb.slots.findMany();
    },

    create: async (slot: DriveScheduleSlot) => {
      fileDb.slots.create(slot);
      if (isMongoActive()) {
        try {
          await ScheduleSlotModel.create(slot);
          if (slot.hasConflict) {
            await ScheduleConflictModel.create({
              id: `cnf-${Date.now()}`,
              type: 'Venue Clashing',
              severity: 'High',
              description: `Collision in ${slot.venue} on ${slot.date}`,
              involvedItems: [slot.companyName, slot.venue],
              recommendedResolution: 'Allocate alternative CAD / Seminar Lab'
            });
          }
        } catch (err) {
          console.error('[MongoDB] Error creating slot in MongoDB:', err);
        }
      }
      return slot;
    },

    resolveConflict: async (conflictId: string) => {
      fileDb.slots.resolveConflict(conflictId);
      if (isMongoActive()) {
        try {
          await ScheduleConflictModel.deleteOne({ id: conflictId });
          await ScheduleSlotModel.updateMany({}, { $set: { hasConflict: false } });
        } catch (err) {
          console.error('[MongoDB] Error resolving conflict in MongoDB:', err);
        }
      }
      return true;
    }
  },

  conflicts: {
    findMany: async () => {
      if (isMongoActive()) {
        return await ScheduleConflictModel.find().lean().exec() as ScheduleConflict[];
      }
      return fileDb.conflicts.findMany();
    }
  },

  // 5. OFFERS
  offers: {
    findMany: async () => {
      if (isMongoActive()) {
        return await OfferModel.find().lean().exec() as OfferRecord[];
      }
      return fileDb.offers.findMany();
    },

    create: async (offer: OfferRecord) => {
      fileDb.offers.create(offer);
      if (isMongoActive()) {
        try {
          const doc = await OfferModel.create(offer);
          if (offer.status === 'Accepted' || offer.status === 'Offer Issued' || offer.status === 'Joined') {
            await StudentModel.findOneAndUpdate(
              { $or: [{ id: offer.studentId }, { usn: offer.studentId }] },
              {
                $set: {
                  placementStatus: offer.status === 'Joined' ? 'Joined' : 'Offered',
                  highestPackageLPA: offer.ctcLPA
                },
                $inc: { offersCount: 1 }
              }
            );
          }
          return doc.toObject() as OfferRecord;
        } catch (err) {
          console.error('[MongoDB] Error creating offer in MongoDB:', err);
        }
      }
      return offer;
    },

    updateStatus: async (id: string, status: OfferRecord['status']) => {
      fileDb.offers.updateStatus(id, status);
      if (isMongoActive()) {
        try {
          const offer = await OfferModel.findOneAndUpdate({ id }, { $set: { status } }, { new: true });
          if (offer) {
            const placementStatus = status === 'Joined' ? 'Joined' : (status === 'Accepted' || status === 'Offer Issued' ? 'Offered' : 'Unplaced');
            await StudentModel.findOneAndUpdate(
              { $or: [{ id: offer.studentId }, { usn: offer.studentId }] },
              { $set: { placementStatus } }
            );
            return offer.toObject() as OfferRecord;
          }
        } catch (err) {
          console.error('[MongoDB] Error updating offer status in MongoDB:', err);
        }
      }
      return fileDb.offers.findById(id);
    },

    verifyDoc: async (offerId: string, docIndex: number, verified: boolean) => {
      fileDb.offers.verifyDoc(offerId, docIndex, verified);
      if (isMongoActive()) {
        try {
          const offer = await OfferModel.findOne({ id: offerId });
          if (offer && offer.documents && offer.documents[docIndex]) {
            offer.documents[docIndex].verified = verified;
            offer.markModified('documents');
            await offer.save();
            return offer.toObject() as OfferRecord;
          }
        } catch (err) {
          console.error('[MongoDB] Error verifying document in MongoDB:', err);
        }
      }
      return fileDb.offers.findById(offerId);
    }
  },

  // 6. NOTIFICATIONS
  notifications: {
    findMany: async () => {
      if (isMongoActive()) {
        return await NotificationModel.find().lean().exec() as BroadcastNotification[];
      }
      return fileDb.notifications.findMany();
    },

    create: async (notif: BroadcastNotification) => {
      fileDb.notifications.create(notif);
      if (isMongoActive()) {
        try {
          const doc = await NotificationModel.create(notif);
          return doc.toObject() as BroadcastNotification;
        } catch (err) {
          console.error('[MongoDB] Error creating notification in MongoDB:', err);
        }
      }
      return notif;
    }
  },

  // 7. STATS
  stats: {
    get: async () => {
      const state = await mongoDb.getState();
      return state.stats;
    }
  },

  // 8. USERS (ACTUAL & PRODUCTION ACCOUNTS)
  users: {
    findMany: async () => {
      if (isMongoActive()) {
        try {
          const docs = await UserModel.find().select('-passwordHash').lean().exec();
          if (docs && docs.length > 0) return docs as UserAccount[];
        } catch (err) {
          console.warn('[MongoDB] UserModel find error, falling back to local store:', err);
        }
      }
      return fileDb.users.findMany();
    },
    findById: async (id: string) => {
      if (isMongoActive()) {
        try {
          const doc = await UserModel.findOne({ id }).select('-passwordHash').lean().exec();
          if (doc) return doc as UserAccount;
        } catch (err) {
          console.warn('[MongoDB] UserModel findById error:', err);
        }
      }
      return fileDb.users.findById(id);
    },
    findByEmail: async (email: string) => {
      const emailNorm = email.trim().toLowerCase();
      if (isMongoActive()) {
        try {
          const doc = await UserModel.findOne({ email: emailNorm }).select('-passwordHash').lean().exec();
          if (doc) return doc as UserAccount;
        } catch (err) {
          console.warn('[MongoDB] UserModel findByEmail error:', err);
        }
      }
      return fileDb.users.findByEmail(emailNorm);
    },
    findByEmailWithPassword: async (email: string) => {
      const emailNorm = email.trim().toLowerCase();
      if (isMongoActive()) {
        try {
          const doc = await UserModel.findOne({ email: emailNorm }).lean().exec();
          if (doc) return doc as UserAccount;
        } catch (err) {
          console.warn('[MongoDB] UserModel findByEmailWithPassword error:', err);
        }
      }
      return fileDb.users.findByEmailWithPassword(emailNorm);
    },
    create: async (user: any) => {
      fileDb.users.create(user);
      if (isMongoActive()) {
        try {
          await UserModel.findOneAndUpdate(
            { email: user.email.toLowerCase() },
            user,
            { upsert: true, new: true }
          );
        } catch (err) {
          console.error('[MongoDB] Error saving user to MongoDB Atlas:', err);
        }
      }
      return sanitizeUser(user);
    },
    update: async (id: string, updates: any) => {
      const updated = fileDb.users.update(id, updates);
      if (isMongoActive()) {
        try {
          await UserModel.findOneAndUpdate({ id }, updates, { new: true });
        } catch (err) {
          console.error('[MongoDB] Error updating user in MongoDB Atlas:', err);
        }
      }
      return updated;
    },
    delete: async (id: string) => {
      const ok = fileDb.users.delete(id);
      if (isMongoActive()) {
        try {
          await UserModel.findOneAndDelete({ id });
        } catch (err) {
          console.error('[MongoDB] Error deleting user in MongoDB Atlas:', err);
        }
      }
      return ok;
    }
  }
};
