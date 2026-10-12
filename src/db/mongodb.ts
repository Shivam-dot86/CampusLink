import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { db } from '../db';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'mongodb_config.json');

// Memory state tracker
interface MongoStatus {
  connected: boolean;
  uriConfigured: boolean;
  clusterHost?: string;
  databaseName?: string;
  modelsLoaded: string[];
  lastError?: string;
  mode: 'MongoDB Atlas' | 'Local JSON Store';
}

let connectionState: MongoStatus = {
  connected: false,
  uriConfigured: false,
  modelsLoaded: [],
  mode: 'Local JSON Store'
};

// Retrieve saved URI from .env or data/mongodb_config.json
export function getSavedMongoUri(): string | null {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.uri && typeof parsed.uri === 'string') {
        return parsed.uri.trim();
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function saveMongoUri(uri: string): void {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ uri, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
    process.env.MONGODB_URI = uri;
  } catch (err) {
    console.error('[MongoDB] Failed to persist URI to config file:', err);
  }
}

// -------------------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// -------------------------------------------------------------

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String },
  role: { type: String, required: true },
  title: { type: String },
  org: { type: String },
  badge: { type: String },
  avatar: { type: String },
  status: { type: String, default: 'Active' },
  isActualUser: { type: Boolean, default: true },
  studentId: { type: String },
  department: { type: String },
  phone: { type: String },
  usn: { type: String },
  cgpa: { type: Number },
  branch: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String }
}, { strict: false });

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  branch: { type: String },
  cgpa: { type: Number },
  tier: { type: String },
  placementStatus: { type: String }
}, { strict: false });

const DriveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  companyName: { type: String, required: true },
  roleTitle: { type: String, required: true },
  status: { type: String }
}, { strict: false });

const SlotSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  driveId: { type: String },
  companyName: { type: String },
  venue: { type: String },
  date: { type: String }
}, { strict: false });

const ConflictSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  type: { type: String },
  severity: { type: String },
  description: { type: String }
}, { strict: false });

const OfferSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  studentId: { type: String },
  companyName: { type: String },
  status: { type: String }
}, { strict: false });

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String },
  channel: { type: String }
}, { strict: false });

const PreTalkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  companyName: { type: String },
  date: { type: String },
  registeredStudentIds: { type: [String], default: [] }
}, { strict: false });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const StudentModel = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const DriveModel = mongoose.models.Drive || mongoose.model('Drive', DriveSchema);
export const SlotModel = mongoose.models.Slot || mongoose.model('Slot', SlotSchema);
export const ConflictModel = mongoose.models.Conflict || mongoose.model('Conflict', ConflictSchema);
export const OfferModel = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const PreTalkModel = mongoose.models.PreTalk || mongoose.model('PreTalk', PreTalkSchema);

let isConnecting = false;

export async function initMongoDB(): Promise<boolean> {
  const uri = getSavedMongoUri();
  if (!uri) {
    connectionState.connected = false;
    connectionState.uriConfigured = false;
    connectionState.mode = 'Local JSON Store';
    return false;
  }

  connectionState.uriConfigured = true;

  if (mongoose.connection.readyState === 1) {
    connectionState.connected = true;
    connectionState.mode = 'MongoDB Atlas';
    return true;
  }

  if (isConnecting) return false;
  isConnecting = true;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      connectTimeoutMS: 10000,
    });

    connectionState.connected = true;
    connectionState.mode = 'MongoDB Atlas';
    connectionState.clusterHost = mongoose.connection.host;
    connectionState.databaseName = mongoose.connection.name;
    connectionState.modelsLoaded = Object.keys(mongoose.models);
    connectionState.lastError = undefined;

    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
    isConnecting = false;
    return true;
  } catch (err: any) {
    isConnecting = false;
    connectionState.connected = false;
    connectionState.mode = 'Local JSON Store';
    connectionState.lastError = err?.message || String(err);
    console.warn('[MongoDB] Connection failed, continuing on Local JSON Store:', connectionState.lastError);
    return false;
  }
}

export function getMongoStatus(): MongoStatus {
  const isConn = mongoose.connection.readyState === 1;
  return {
    ...connectionState,
    connected: isConn,
    mode: isConn ? 'MongoDB Atlas' : 'Local JSON Store'
  };
}

// -------------------------------------------------------------
// RESILIENT REPOSITORY WRAPPER (FALLBACK TO LOCAL STORE)
// -------------------------------------------------------------

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

export const mongoDb = {
  getState: async () => {
    if (!isMongoReady()) return db.getState();
    try {
      const [students, drives, slots, conflicts, offers, notifications, preTalks] = await Promise.all([
        StudentModel.find({}).lean(),
        DriveModel.find({}).lean(),
        SlotModel.find({}).lean(),
        ConflictModel.find({}).lean(),
        OfferModel.find({}).lean(),
        NotificationModel.find({}).lean(),
        PreTalkModel.find({}).lean(),
      ]);

      const localState = db.getState();
      return {
        students: students.length ? students : localState.students,
        drives: drives.length ? drives : localState.drives,
        slots: slots.length ? slots : localState.slots,
        conflicts: conflicts.length ? conflicts : localState.conflicts,
        offers: offers.length ? offers : localState.offers,
        notifications: notifications.length ? notifications : localState.notifications,
        preTalks: preTalks.length ? preTalks : localState.preTalks,
        stats: localState.stats,
      };
    } catch {
      return db.getState();
    }
  },

  resetDefaults: async () => {
    return db.resetDefaults();
  },

  users: {
    findMany: async () => {
      if (!isMongoReady()) return db.users.findMany();
      try {
        const users = await UserModel.find({}).lean();
        return users.length ? users : db.users.findMany();
      } catch {
        return db.users.findMany();
      }
    },
    findById: async (id: string) => {
      if (!isMongoReady()) return db.users.findById(id);
      try {
        return (await UserModel.findOne({ id }).lean()) || db.users.findById(id);
      } catch {
        return db.users.findById(id);
      }
    },
    findByEmailWithPassword: async (email: string) => {
      if (!isMongoReady()) return db.users.findByEmailWithPassword(email);
      try {
        return (await UserModel.findOne({ email }).lean()) || db.users.findByEmailWithPassword(email);
      } catch {
        return db.users.findByEmailWithPassword(email);
      }
    },
    create: async (user: any) => {
      db.users.create(user); // Keep local store in sync
      if (!isMongoReady()) return user;
      try {
        return await UserModel.create(user);
      } catch {
        return user;
      }
    },
    update: async (id: string, updates: any) => {
      db.users.update(id, updates);
      if (!isMongoReady()) return db.users.findById(id);
      try {
        return await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      } catch {
        return db.users.findById(id);
      }
    },
    delete: async (id: string) => {
      db.users.delete(id);
      if (!isMongoReady()) return true;
      try {
        await UserModel.deleteOne({ id });
        return true;
      } catch {
        return true;
      }
    }
  },

  students: {
    findMany: async (filters?: any) => {
      if (!isMongoReady()) return db.students.findMany(filters);
      try {
        const res = await StudentModel.find({}).lean();
        return res.length ? res : db.students.findMany(filters);
      } catch {
        return db.students.findMany(filters);
      }
    },
    findById: async (id: string) => {
      if (!isMongoReady()) return db.students.findById(id);
      try {
        return (await StudentModel.findOne({ id }).lean()) || db.students.findById(id);
      } catch {
        return db.students.findById(id);
      }
    },
    create: async (student: any) => {
      db.students.create(student);
      if (!isMongoReady()) return student;
      try {
        return await StudentModel.create(student);
      } catch {
        return student;
      }
    },
    update: async (id: string, updates: any) => {
      db.students.update(id, updates);
      if (!isMongoReady()) return db.students.findById(id);
      try {
        return await StudentModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      } catch {
        return db.students.findById(id);
      }
    },
    delete: async (id: string) => {
      db.students.delete(id);
      if (!isMongoReady()) return true;
      try {
        await StudentModel.deleteOne({ id });
        return true;
      } catch {
        return true;
      }
    }
  },

  drives: {
    findMany: async () => {
      if (!isMongoReady()) return db.drives.findMany();
      try {
        const drives = await DriveModel.find({}).lean();
        return drives.length ? drives : db.drives.findMany();
      } catch {
        return db.drives.findMany();
      }
    },
    findById: async (id: string) => {
      if (!isMongoReady()) return db.drives.findById(id);
      try {
        return (await DriveModel.findOne({ id }).lean()) || db.drives.findById(id);
      } catch {
        return db.drives.findById(id);
      }
    },
    create: async (drive: any) => {
      db.drives.create(drive);
      if (!isMongoReady()) return drive;
      try {
        return await DriveModel.create(drive);
      } catch {
        return drive;
      }
    },
    update: async (id: string, updates: any) => {
      db.drives.update(id, updates);
      if (!isMongoReady()) return db.drives.findById(id);
      try {
        return await DriveModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
      } catch {
        return db.drives.findById(id);
      }
    },
    delete: async (id: string) => {
      db.drives.delete(id);
      if (!isMongoReady()) return true;
      try {
        await DriveModel.deleteOne({ id });
        return true;
      } catch {
        return true;
      }
    }
  },

  slots: {
    findMany: async () => {
      if (!isMongoReady()) return db.slots.findMany();
      try {
        const s = await SlotModel.find({}).lean();
        return s.length ? s : db.slots.findMany();
      } catch {
        return db.slots.findMany();
      }
    },
    create: async (slot: any) => {
      db.slots.create(slot);
      if (!isMongoReady()) return slot;
      try {
        return await SlotModel.create(slot);
      } catch {
        return slot;
      }
    },
    resolveConflict: async (conflictId: string) => {
      return db.slots.resolveConflict(conflictId);
    }
  },

  conflicts: {
    findMany: async () => {
      if (!isMongoReady()) return db.conflicts.findMany();
      try {
        const c = await ConflictModel.find({}).lean();
        return c.length ? c : db.conflicts.findMany();
      } catch {
        return db.conflicts.findMany();
      }
    }
  },

  offers: {
    findMany: async () => {
      if (!isMongoReady()) return db.offers.findMany();
      try {
        const o = await OfferModel.find({}).lean();
        return o.length ? o : db.offers.findMany();
      } catch {
        return db.offers.findMany();
      }
    },
    create: async (offer: any) => {
      db.offers.create(offer);
      if (!isMongoReady()) return offer;
      try {
        return await OfferModel.create(offer);
      } catch {
        return offer;
      }
    },
    updateStatus: async (id: string, status: any) => {
      return db.offers.updateStatus(id, status);
    },
    verifyDoc: async (id: string, docIndex: number, verified: boolean) => {
      return db.offers.verifyDoc(id, docIndex, verified);
    }
  },

  notifications: {
    findMany: async () => {
      if (!isMongoReady()) return db.notifications.findMany();
      try {
        const n = await NotificationModel.find({}).lean();
        return n.length ? n : db.notifications.findMany();
      } catch {
        return db.notifications.findMany();
      }
    },
    create: async (notif: any) => {
      db.notifications.create(notif);
      if (!isMongoReady()) return notif;
      try {
        return await NotificationModel.create(notif);
      } catch {
        return notif;
      }
    }
  },

  preTalks: {
    findMany: async () => {
      if (!isMongoReady()) return db.preTalks.findMany();
      try {
        const p = await PreTalkModel.find({}).lean();
        return p.length ? p : db.preTalks.findMany();
      } catch {
        return db.preTalks.findMany();
      }
    },
    create: async (talk: any) => {
      db.preTalks.create(talk);
      if (!isMongoReady()) return talk;
      try {
        return await PreTalkModel.create(talk);
      } catch {
        return talk;
      }
    },
    toggleRsvp: async (talkId: string, studentId: string) => {
      return db.preTalks.toggleRsvp(talkId, studentId);
    }
  },

  stats: {
    get: async () => {
      return db.stats.get();
    }
  }
};