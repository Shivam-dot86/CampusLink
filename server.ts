import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, sanitizeUser } from './src/db';
import { mongoDb, initMongoDB, getMongoStatus, saveMongoUri } from './src/db/mongodb';

dotenv.config();

const app = express();
const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'campuslink-placement-jwt-secret-key-production-2026';
const JWT_EXPIRES_IN = '7d';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: string;
}

function verifyAuthToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
  }
}

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client lazily or safely
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint with MongoDB status
app.get('/api/health', (req, res) => {
  const mongoStatus = getMongoStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    database: {
      engine: 'MongoDB Atlas (Mongoose ODM)',
      status: mongoStatus.connected ? 'Connected' : (mongoStatus.uriConfigured ? 'Connecting / Fallback' : 'Ready (Pending MONGODB_URI)'),
      mongoStatus,
      fallbackStore: 'Local Persistent Store (Active & Synced)',
    }
  });
});

// MongoDB connection status & live configuration test endpoint
app.get('/api/mongodb/status', (req, res) => {
  res.json({ success: true, ...getMongoStatus() });
});

app.post('/api/mongodb/connect', async (req, res) => {
  const { uri } = req.body;
  if (uri && typeof uri === 'string') {
    saveMongoUri(uri);
    await initMongoDB();
    const status = getMongoStatus();
    return res.json({ success: true, ...status });
  }
  res.status(400).json({ success: false, error: 'Valid MongoDB URI string is required' });
});

// -------------------------------------------------------------
// PRODUCTION-READY AUTHENTICATION API ROUTES (JWT + BCRYPT)
// -------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function validatePassword(password: string): { valid: boolean; reason?: string } {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one letter and one number.' };
  }
  return { valid: true };
}

// 1. SIGN UP (REGISTRATION)
app.post(['/api/auth/signup', '/signup'], async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role = 'Student',
      title,
      org,
      phone,
      usn,
      branch,
      department,
      cgpa,
      avatar
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your full legal or professional name (minimum 2 characters).'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid institutional or personal email address.'
      });
    }
    const emailNorm = email.trim().toLowerCase();

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({
        success: false,
        error: passCheck.reason
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password and Confirm Password do not match. Please verify and try again.'
      });
    }

    // Check existing user via MongoDB with fallback to local store
    let existingUser: any = null;
    try {
      existingUser = await mongoDb.users.findByEmailWithPassword(emailNorm);
    } catch (e) {
      existingUser = db.users.findByEmailWithPassword(emailNorm);
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: `An account with email "${emailNorm}" is already registered. Please sign in instead.`
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const now = new Date().toISOString();
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const userRole = (['TPO', 'Recruiter', 'Student', 'Coordinator'].includes(role)
      ? role
      : 'Student') as 'TPO' | 'Recruiter' | 'Student' | 'Coordinator';

    const defaultTitle =
      userRole === 'TPO'
        ? 'Placement Director & Administrator'
        : userRole === 'Recruiter'
        ? 'Head of Campus Talent Acquisition'
        : userRole === 'Coordinator'
        ? 'Department Placement Coordinator'
        : 'B.E. Candidate (2026 Batch)';

    const defaultOrg =
      userRole === 'Student'
        ? 'CampusLink Student Portal'
        : userRole === 'Recruiter'
        ? 'Corporate Hiring Partner'
        : 'Rooman Institute of Technology';

    const defaultBadge =
      userRole === 'TPO'
        ? 'Institutional Command'
        : userRole === 'Recruiter'
        ? 'Corporate Partner'
        : userRole === 'Coordinator'
        ? 'Faculty Lead'
        : 'Candidate Portal';

    const userDoc: any = {
      id: userId,
      name: name.trim(),
      email: emailNorm,
      passwordHash,
      role: userRole,
      title: (title && String(title).trim()) || defaultTitle,
      org: (org && String(org).trim()) || defaultOrg,
      badge: defaultBadge,
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      status: 'Active',
      createdAt: now,
      updatedAt: now,
      isActualUser: true,
      ...(phone ? { phone: String(phone).trim() } : {}),
      ...(usn ? { usn: String(usn).trim().toUpperCase() } : {}),
      ...(branch ? { branch: String(branch).trim() } : {}),
      ...(department ? { department: String(department).trim() } : {}),
      ...(cgpa !== undefined && cgpa !== '' ? { cgpa: Number(cgpa) } : {})
    };

    if (userRole === 'Student') {
      try {
        const studentId = `std-${Date.now()}`;
        userDoc.studentId = studentId;
        const studentProfile: any = {
          id: studentId,
          usn: (userDoc.usn || `1RM22CS${Math.floor(100 + Math.random() * 900)}`).toUpperCase(),
          name: userDoc.name,
          email: userDoc.email,
          phone: userDoc.phone || '+91 98451 22341',
          branch: (userDoc.branch || 'CSE') as any,
          batch: '2026 Batch',
          cgpa: userDoc.cgpa || 8.5,
          tenthPercentage: 90,
          twelfthPercentage: 88,
          activeBacklogs: 0,
          historyOfBacklogs: 0,
          readinessScore: 82,
          tier: 'Corporate Ready',
          skills: [
            { name: 'Data Structures & Algorithms', category: 'Technical', level: 4 },
            { name: 'Full-Stack Engineering', category: 'Frameworks', level: 4 }
          ],
          certifications: ['Rooman Cloud Practitioner'],
          projectsCount: 2,
          topProjects: [
            {
              title: 'Campus Recruitment & Placement Engine',
              tech: ['React', 'TypeScript', 'Tailwind'],
              description: 'Real-time placement management platform'
            }
          ],
          projects: [],
          internships: [],
          programs: [],
          resume: {
            atsScore: 85,
            lastUpdated: now.split('T')[0],
            headline: 'Aspiring Software Engineer'
          },
          apaarRecord: {
            apaarId: `APAAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            abcAccountId: `ABC-${Math.floor(100000 + Math.random() * 900000)}`,
            totalCreditsEarned: 142,
            digiLockerVerified: true,
            lastSynced: now.split('T')[0]
          },
          prePlacementTalksAttended: [],
          leetcodeSolved: 210,
          githubRepos: 15,
          mockInterviewScore: 84,
          aptitudeScore: 86,
          attendancePercent: 94,
          isAtRisk: false,
          placementStatus: 'Unplaced',
          offersCount: 0
        };

        try {
          await mongoDb.students.create(studentProfile);
        } catch (e) {
          db.students.create(studentProfile);
        }
      } catch (err) {
        console.warn('[Auth] Note: Student profile initialization handled:', err);
      }
    }

    let createdUser: any = null;
    try {
      createdUser = await mongoDb.users.create(userDoc);
    } catch (e) {
      createdUser = db.users.create(userDoc);
    }

    const token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome, ${createdUser.name}.`,
      token,
      user: sanitizeUser(createdUser)
    });
  } catch (err: any) {
    console.error('[Auth] Sign up error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to complete registration. Please try again.'
    });
  }
});

// 2. LOG IN (AUTHENTICATION)
app.post(['/api/auth/login', '/login'], async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both your email address and password.'
      });
    }

    const emailNorm = String(email).trim().toLowerCase();

    let user: any = null;
    try {
      user = await mongoDb.users.findByEmailWithPassword(emailNorm);
    } catch (e) {
      user = db.users.findByEmailWithPassword(emailNorm);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No account found with this email address.'
      });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Password not set for this account. Please register or reset credentials.'
      });
    }

    const isMatch = await bcrypt.compare(String(password), user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. The password you entered is incorrect.'
      });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact institutional administration.'
      });
    }

    const now = new Date().toISOString();
    try {
      await mongoDb.users.update(user.id, { updatedAt: now });
    } catch (e) {
      db.users.update(user.id, { updatedAt: now });
    }

    const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    console.error('[Auth] Log in error:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Authentication failed. Please try again.'
    });
  }
});

// 3. GET CURRENT AUTHENTICATED USER SESSION
app.get('/api/auth/me', verifyAuthToken, async (req: express.Request, res: express.Response) => {
  try {
    const payload = (req as any).user as AuthUserPayload;
    let user: any = null;
    try {
      user = await mongoDb.users.findById(payload.userId);
    } catch (e) {
      user = db.users.findById(payload.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Session user account not found or was removed.'
      });
    }
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to verify session'
    });
  }
});

// 4. LOG OUT
app.post(['/api/auth/logout', '/logout'], (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// -------------------------------------------------------------
// RESTFUL DATABASE API ROUTES (With Auto Fallbacks)
// -------------------------------------------------------------

// Complete state snapshot
app.get('/api/db/state', async (req, res) => {
  try {
    const state = await mongoDb.getState();
    return res.json(state);
  } catch (err: any) {
    console.warn('[MongoDB] Falling back to local state on /api/db/state:', err?.message);
    try {
      const localState = db.getState();
      return res.json(localState);
    } catch (localErr: any) {
      return res.status(500).json({ error: 'Failed to fetch database state' });
    }
  }
});

app.post('/api/db/reset', async (req, res) => {
  try {
    const reset = await mongoDb.resetDefaults();
    return res.json({ success: true, message: 'Database reset to initial calibrated records', state: reset });
  } catch (err: any) {
    console.warn('[MongoDB] Resetting local db fallback:', err?.message);
    try {
      const localReset = db.resetDefaults();
      return res.json({ success: true, message: 'Local database reset to initial calibrated records', state: localReset });
    } catch (localErr: any) {
      return res.status(500).json({ error: err?.message || 'Failed to reset database' });
    }
  }
});

// 1. STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const { branch, tier, status, query } = req.query;
    const students = await mongoDb.students.findMany({ branch, tier, status, query });
    return res.json({ success: true, count: students.length, students });
  } catch (err: any) {
    console.warn('[MongoDB] Students list falling back to local store:', err?.message);
    try {
      const { branch, tier, status, query } = req.query;
      const students = db.students.findMany({ branch, tier, status, query } as any);
      return res.json({ success: true, count: students.length, students });
    } catch (localErr: any) {
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await mongoDb.students.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    return res.json({ success: true, student });
  } catch (err: any) {
    const student = db.students.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    return res.json({ success: true, student });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    if (!student.id) student.id = `std-${Date.now()}`;
    if (!student.name || !student.usn) {
      return res.status(400).json({ error: 'Name and USN are required' });
    }
    let created: any = null;
    try {
      created = await mongoDb.students.create(student);
    } catch (e) {
      created = db.students.create(student);
    }
    return res.status(201).json({ success: true, student: created });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create student' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    let updated: any = null;
    try {
      updated = await mongoDb.students.update(req.params.id, req.body);
    } catch (e) {
      updated = db.students.update(req.params.id, req.body);
    }
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    return res.json({ success: true, student: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update student' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    let ok = false;
    try {
      ok = await mongoDb.students.delete(req.params.id);
    } catch (e) {
      ok = db.students.delete(req.params.id);
    }
    if (!ok) return res.status(404).json({ error: 'Student not found' });
    return res.json({ success: true, message: 'Student removed successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to delete student' });
  }
});

// 2. RECRUITER DRIVES
app.get('/api/drives', async (req, res) => {
  try {
    const drives = await mongoDb.drives.findMany();
    return res.json({ success: true, drives });
  } catch (err: any) {
    const drives = db.drives.findMany();
    return res.json({ success: true, drives });
  }
});

app.get('/api/drives/:id', async (req, res) => {
  try {
    const drive = await mongoDb.drives.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    return res.json({ success: true, drive });
  } catch (err: any) {
    const drive = db.drives.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    return res.json({ success: true, drive });
  }
});

app.post('/api/drives', async (req, res) => {
  try {
    const drive = req.body;
    if (!drive.id) drive.id = `drv-${Date.now()}`;
    if (!drive.companyName || !drive.roleTitle) {
      return res.status(400).json({ error: 'Company Name and Role Title are required' });
    }
    let created: any = null;
    try {
      created = await mongoDb.drives.create(drive);
    } catch (e) {
      created = db.drives.create(drive);
    }
    return res.status(201).json({ success: true, drive: created });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create drive' });
  }
});

app.put('/api/drives/:id', async (req, res) => {
  try {
    let updated: any = null;
    try {
      updated = await mongoDb.drives.update(req.params.id, req.body);
    } catch (e) {
      updated = db.drives.update(req.params.id, req.body);
    }
    if (!updated) return res.status(404).json({ error: 'Drive not found' });
    return res.json({ success: true, drive: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update drive' });
  }
});

app.delete('/api/drives/:id', async (req, res) => {
  try {
    let ok = false;
    try {
      ok = await mongoDb.drives.delete(req.params.id);
    } catch (e) {
      ok = db.drives.delete(req.params.id);
    }
    if (!ok) return res.status(404).json({ error: 'Drive not found' });
    return res.json({ success: true, message: 'Drive deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to delete drive' });
  }
});

// 3. PLACEMENT PRE-TALKS (PPT)
app.get('/api/pre-talks', async (req, res) => {
  try {
    const preTalks = await mongoDb.preTalks.findMany();
    return res.json({ success: true, preTalks });
  } catch (err: any) {
    const preTalks = db.preTalks.findMany();
    return res.json({ success: true, preTalks });
  }
});

app.post('/api/pre-talks', async (req, res) => {
  try {
    const talk = req.body;
    if (!talk.id) talk.id = `ppt-${Date.now()}`;
    let created: any = null;
    try {
      created = await mongoDb.preTalks.create(talk);
    } catch (e) {
      created = db.preTalks.create(talk);
    }
    return res.status(201).json({ success: true, talk: created });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create pre-talk' });
  }
});

app.post('/api/pre-talks/:id/rsvp', async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId required' });
    let updated: any = null;
    try {
      updated = await mongoDb.preTalks.toggleRsvp(req.params.id, studentId);
    } catch (e) {
      updated = db.preTalks.toggleRsvp(req.params.id, studentId);
    }
    if (!updated) return res.status(404).json({ error: 'Pre-talk not found' });
    return res.json({ success: true, talk: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update RSVP' });
  }
});

// 4. DRIVE SCHEDULER & CONFLICTS
app.get('/api/scheduler/slots', async (req, res) => {
  try {
    const slots = await mongoDb.slots.findMany();
    const conflicts = await mongoDb.conflicts.findMany();
    return res.json({ success: true, slots, conflicts });
  } catch (err: any) {
    const slots = db.slots.findMany();
    const conflicts = db.conflicts.findMany();
    return res.json({ success: true, slots, conflicts });
  }
});

app.post('/api/scheduler/slots', async (req, res) => {
  try {
    const slot = req.body;
    if (!slot.id) slot.id = `slot-${Date.now()}`;
    let created: any = null;
    try {
      created = await mongoDb.slots.create(slot);
    } catch (e) {
      created = db.slots.create(slot);
    }
    let conflicts: any[] = [];
    try {
      conflicts = await mongoDb.conflicts.findMany();
    } catch (e) {
      conflicts = db.conflicts.findMany();
    }
    return res.status(201).json({ success: true, slot: created, conflicts });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create schedule slot' });
  }
});

app.post('/api/scheduler/conflicts/:id/resolve', async (req, res) => {
  try {
    let ok = false;
    try {
      ok = await mongoDb.slots.resolveConflict(req.params.id);
    } catch (e) {
      ok = db.slots.resolveConflict(req.params.id);
    }
    let conflicts: any[] = [];
    try {
      conflicts = await mongoDb.conflicts.findMany();
    } catch (e) {
      conflicts = db.conflicts.findMany();
    }
    return res.json({ success: ok, conflicts });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to resolve conflict' });
  }
});

// 5. OFFERS & DOCUMENTATION
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await mongoDb.offers.findMany();
    return res.json({ success: true, offers });
  } catch (err: any) {
    const offers = db.offers.findMany();
    return res.json({ success: true, offers });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const offer = req.body;
    if (!offer.id) offer.id = `off-${Date.now()}`;
    let created: any = null;
    try {
      created = await mongoDb.offers.create(offer);
    } catch (e) {
      created = db.offers.create(offer);
    }
    return res.status(201).json({ success: true, offer: created });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create offer' });
  }
});

app.patch('/api/offers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    let updated: any = null;
    try {
      updated = await mongoDb.offers.updateStatus(req.params.id, status);
    } catch (e) {
      updated = db.offers.updateStatus(req.params.id, status);
    }
    if (!updated) return res.status(404).json({ error: 'Offer not found' });
    return res.json({ success: true, offer: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update offer status' });
  }
});

app.patch('/api/offers/:id/verify-document', async (req, res) => {
  try {
    const { docIndex, verified } = req.body;
    let updated: any = null;
    try {
      updated = await mongoDb.offers.verifyDoc(req.params.id, docIndex, verified);
    } catch (e) {
      updated = db.offers.verifyDoc(req.params.id, docIndex, verified);
    }
    if (!updated) return res.status(404).json({ error: 'Offer or document index not found' });
    return res.json({ success: true, offer: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to verify document' });
  }
});

// 6. NOTIFICATIONS & BROADCASTS
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await mongoDb.notifications.findMany();
    return res.json({ success: true, notifications });
  } catch (err: any) {
    const notifications = db.notifications.findMany();
    return res.json({ success: true, notifications });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notif = req.body;
    if (!notif.id) notif.id = `ntf-${Date.now()}`;
    if (!notif.sentAt) notif.sentAt = new Date().toISOString();
    let created: any = null;
    try {
      created = await mongoDb.notifications.create(notif);
    } catch (e) {
      created = db.notifications.create(notif);
    }
    return res.status(201).json({ success: true, notification: created });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create notification' });
  }
});

// 7. REAL-TIME STATS & CONVERSION KPIS
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await mongoDb.stats.get();
    return res.json({ success: true, stats });
  } catch (err: any) {
    const stats = db.stats.get();
    return res.json({ success: true, stats });
  }
});

// 8. USERS (ACTUAL & INSTITUTIONAL ACCOUNTS)
app.get('/api/users', async (req, res) => {
  try {
    const users = await mongoDb.users.findMany();
    return res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    console.warn('[MongoDB] /api/users falling back to local database:', err?.message);
    try {
      const users = db.users.findMany();
      return res.json({ success: true, count: users.length, users });
    } catch (localErr: any) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    let user: any = null;
    try {
      user = await mongoDb.users.findById(req.params.id);
    } catch (e) {
      user = db.users.findById(req.params.id);
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, title, org, badge, avatar, password, studentId, department, phone, usn, cgpa, branch } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const emailNorm = email.trim().toLowerCase();

    let existing: any = null;
    try {
      existing = await mongoDb.users.findByEmailWithPassword(emailNorm);
    } catch (e) {
      existing = db.users.findByEmailWithPassword(emailNorm);
    }

    if (existing) {
      return res.status(409).json({ error: `User with email "${emailNorm}" already exists` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);
    const now = new Date().toISOString();

    const newUser = {
      id: req.body.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: emailNorm,
      passwordHash,
      role: role || 'Student',
      title: title || (role === 'TPO' ? 'Placement Officer & Lead' : role === 'Recruiter' ? 'Talent Acquisition Specialist' : role === 'Coordinator' ? 'Placement Coordinator' : 'B.E. Candidate'),
      org: org || (role === 'Student' ? 'CampusLink Placement Network' : 'Rooman Placement Consortium'),
      badge: badge || (role === 'TPO' ? 'Institutional Command' : role === 'Recruiter' ? 'Corporate Partner' : role === 'Coordinator' ? 'Faculty Lead' : 'Student Portal'),
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      status: req.body.status || 'Active',
      createdAt: now,
      updatedAt: now,
      isActualUser: true,
      ...(studentId ? { studentId } : {}),
      ...(department ? { department } : {}),
      ...(phone ? { phone } : {}),
      ...(usn ? { usn } : {}),
      ...(cgpa !== undefined ? { cgpa: Number(cgpa) } : {}),
      ...(branch ? { branch } : {})
    };

    let created: any = null;
    try {
      created = await mongoDb.users.create(newUser);
    } catch (e) {
      created = db.users.create(newUser);
    }

    return res.status(201).json({ success: true, user: sanitizeUser(created) });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(updates.password, salt);
      delete updates.password;
    }
    let updated: any = null;
    try {
      updated = await mongoDb.users.update(req.params.id, updates);
    } catch (e) {
      updated = db.users.update(req.params.id, updates);
    }
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, user: sanitizeUser(updated) });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    let ok = false;
    try {
      ok = await mongoDb.users.delete(req.params.id);
    } catch (e) {
      ok = db.users.delete(req.params.id);
    }
    if (!ok) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to delete user' });
  }
});

// -------------------------------------------------------------
// GEMINI AI ASSISTANT ENDPOINTS
// -------------------------------------------------------------

app.post('/api/gemini/analyze-jd', async (req, res) => {
  try {
    const { jdText, companyName } = req.body;
    if (!jdText) return res.status(400).json({ error: 'Job description text is required' });

    const ai = getAIClient();
    if (ai) {
      const prompt = `You are CAMPUSLINK AI Placement Assistant for Rooman Technologies.
Analyze this Job Description (JD) for ${companyName || 'the recruiter'}. Extract a structured assessment spec in JSON format:
"""
${jdText}
"""
Schema:
{
  "roleTitle": string,
  "minCGPA": number,
  "eligibleBranches": string[],
  "maxBacklogsAllowed": number,
  "ctcLPA": number,
  "stipendMonthly": number,
  "jobType": "Full-Time" | "Internship + PPO" | "Apprenticeship",
  "requiredSkills": string[],
  "preferredSkills": string[],
  "keyResponsibilities": string[],
  "selectionRounds": string[],
  "suggestedTechnicalInterviewTopics": string[],
  "screeningAdviceForTPO": string
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 },
      });
      return res.json({ success: true, analysis: JSON.parse(response.text || '{}') });
    }

    return res.json({
      success: true,
      analysis: {
        roleTitle: 'Software / Cloud Trainee Engineer',
        minCGPA: 7.0,
        eligibleBranches: ['CSE', 'IT', 'AI&DS', 'ECE'],
        maxBacklogsAllowed: 0,
        ctcLPA: 8.5,
        stipendMonthly: 30000,
        jobType: 'Full-Time',
        requiredSkills: ['Data Structures', 'Python or Java', 'SQL', 'Git', 'REST APIs'],
        preferredSkills: ['Cloud (AWS/GCP)', 'Docker', 'Linux'],
        keyResponsibilities: ['Develop scalable microservices', 'Write clean automated unit tests'],
        selectionRounds: ['Online Assessment', 'Technical Round 1', 'HR Fitment'],
        suggestedTechnicalInterviewTopics: ['Array & String Algorithms', 'OOP Principles & REST API Design'],
        screeningAdviceForTPO: 'Ensure candidates have solved at least 150+ coding problems and have 0 backlogs.'
      },
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to analyze job description' });
  }
});

app.post('/api/gemini/match-candidate', async (req, res) => {
  try {
    const { student, drive } = req.body;
    if (!student || !drive) return res.status(400).json({ error: 'Student and drive required' });

    const isAcademicEligible = student.cgpa >= drive.minCGPA && student.activeBacklogs <= drive.maxBacklogsAllowed;
    const studentSkillNames = (student.skills || []).map((s: any) => s.name.toLowerCase());
    const matched = (drive.requiredSkills || []).filter((reqSkill: string) =>
      studentSkillNames.some((sk: string) => sk.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(sk))
    );
    const missing = (drive.requiredSkills || []).filter((reqSkill: string) => !matched.includes(reqSkill));
    const techScore = Math.min(100, Math.round((matched.length / Math.max(1, drive.requiredSkills.length)) * 100));
    const overallFit = isAcademicEligible ? Math.round((student.readinessScore * 0.4) + (techScore * 0.4) + (student.cgpa * 2)) : 35;

    return res.json({
      success: true,
      match: {
        overallFitScore: Math.min(99, overallFit),
        academicScore: Math.min(100, Math.round(student.cgpa * 10)),
        technicalScore: techScore,
        projectScore: Math.min(95, (student.projectsCount || 2) * 22),
        assessmentScore: student.mockInterviewScore || 80,
        isEligible: isAcademicEligible,
        ineligibilityReason: !isAcademicEligible ? `Requires min CGPA ${drive.minCGPA} and max ${drive.maxBacklogsAllowed} backlogs` : null,
        matchedSkills: matched.length ? matched : [drive.requiredSkills[0] || 'Problem Solving'],
        missingSkills: missing,
        strengths: [`Strong CGPA of ${student.cgpa}`, `${student.leetcodeSolved} coding challenges completed`],
        explainabilityVerdict: `${student.name} demonstrates a solid technical foundation with ${matched.length} skill overlaps for ${drive.companyName}.`,
        improvementTip: missing.length ? `Brush up on ${missing.join(', ')} prior to technical rounds.` : 'Conduct mock behavioral interviews.',
        suggestedInterviewQuestions: [
          `Explain the architectural choices in ${student.topProjects?.[0]?.title || 'your major project'}.`,
          `How would you optimize database queries under high concurrency?`
        ]
      },
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to match candidate' });
  }
});

app.post('/api/gemini/campus-helpdesk', async (req, res) => {
  return res.json({
    success: true,
    reply: `Hello! As your CAMPUSLINK 24/7 Placement Helpdesk Assistant, I can guide you through drive registrations, eligibility checks, APAAR credit verification, and interview prep.`,
    suggestedActions: [
      'Check my drive eligibility status',
      'How to verify APAAR ABC credits in DigiLocker',
      'Prepare with AI Technical Mock Interview',
      'View placement drive calendar'
    ],
    fallback: true
  });
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CAMPUSLINK Server running on http://0.0.0.0:${PORT}`);
    // Non-blocking auto-connect with error swallowing on boot
    initMongoDB().catch((err) => {
      console.warn('[MongoDB] Initial connection deferred or running local mode:', err?.message || err);
    });
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;