import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
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

// Authentication verification middleware
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
      status: mongoStatus.connected ? 'Connected' : (mongoStatus.uriConfigured ? 'Connecting / Error' : 'Ready (Pending MONGODB_URI)'),
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

// Helper validators
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

    // 1. Validate full name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your full legal or professional name (minimum 2 characters).'
      });
    }

    // 2. Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid institutional or personal email address.'
      });
    }
    const emailNorm = email.trim().toLowerCase();

    // 3. Validate password
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({
        success: false,
        error: passCheck.reason
      });
    }

    // 4. Validate confirm password match if provided
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password and Confirm Password do not match. Please verify and try again.'
      });
    }

    // 5. Prevent duplicate account registration
    const existingUser = await mongoDb.users.findByEmailWithPassword(emailNorm);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: `An account with email "${emailNorm}" is already registered. Please sign in instead.`
      });
    }

    // 6. Securely hash password with bcrypt (10 rounds salt)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 7. Prepare user document with timestamps
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

    // If Student role, ensure student record is created in student database
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
        await mongoDb.students.create(studentProfile);
      } catch (err) {
        console.warn('[Auth] Note: Student profile initialization handled:', err);
      }
    }

    // 8. Save user to database
    const createdUser = await mongoDb.users.create(userDoc);

    // 9. Generate secure JWT token
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

    // Query database for user with credentials
    const user = await mongoDb.users.findByEmailWithPassword(emailNorm);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No account found with this email address.'
      });
    }

    // Verify hashed password
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

    // Check account status
    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact institutional administration.'
      });
    }

    // Update lastLogin / updatedAt
    const now = new Date().toISOString();
    await mongoDb.users.update(user.id, { updatedAt: now });

    // Generate JWT token (longer expiration if rememberMe)
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
    const user = await mongoDb.users.findById(payload.userId);
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
// RESTFUL DATABASE API ROUTES (Full CRUD & Real-Time Sync)
// -------------------------------------------------------------

// Complete state snapshot
app.get('/api/db/state', async (req, res) => {
  try {
    const state = await mongoDb.getState();
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch database state' });
  }
});

app.post('/api/db/reset', async (req, res) => {
  try {
    const reset = await mongoDb.resetDefaults();
    res.json({ success: true, message: 'Database reset to initial calibrated records', state: reset });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to reset database' });
  }
});

// 1. STUDENTS
app.get('/api/students', async (req, res) => {
  try {
    const { branch, tier, status, query } = req.query;
    const students = await mongoDb.students.findMany({ branch, tier, status, query });
    res.json({ success: true, count: students.length, students });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch students' });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await mongoDb.students.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch student' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    if (!student.id) student.id = `std-${Date.now()}`;
    if (!student.name || !student.usn) {
      return res.status(400).json({ error: 'Name and USN are required' });
    }
    const created = await mongoDb.students.create(student);
    res.status(201).json({ success: true, student: created });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create student' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const updated = await mongoDb.students.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, student: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update student' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const ok = await mongoDb.students.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, message: 'Student removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete student' });
  }
});

// 2. RECRUITER DRIVES
app.get('/api/drives', async (req, res) => {
  try {
    const drives = await mongoDb.drives.findMany();
    res.json({ success: true, drives });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch drives' });
  }
});

app.get('/api/drives/:id', async (req, res) => {
  try {
    const drive = await mongoDb.drives.findById(req.params.id);
    if (!drive) return res.status(404).json({ error: 'Drive not found' });
    res.json({ success: true, drive });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch drive' });
  }
});

app.post('/api/drives', async (req, res) => {
  try {
    const drive = req.body;
    if (!drive.id) drive.id = `drv-${Date.now()}`;
    if (!drive.companyName || !drive.roleTitle) {
      return res.status(400).json({ error: 'Company Name and Role Title are required' });
    }
    const created = await mongoDb.drives.create(drive);
    res.status(201).json({ success: true, drive: created });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create drive' });
  }
});

app.put('/api/drives/:id', async (req, res) => {
  try {
    const updated = await mongoDb.drives.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Drive not found' });
    res.json({ success: true, drive: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update drive' });
  }
});

app.delete('/api/drives/:id', async (req, res) => {
  try {
    const ok = await mongoDb.drives.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Drive not found' });
    res.json({ success: true, message: 'Drive deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete drive' });
  }
});

// 3. PLACEMENT PRE-TALKS (PPT)
app.get('/api/pre-talks', async (req, res) => {
  try {
    const preTalks = await mongoDb.preTalks.findMany();
    res.json({ success: true, preTalks });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch pre-talks' });
  }
});

app.post('/api/pre-talks', async (req, res) => {
  try {
    const talk = req.body;
    if (!talk.id) talk.id = `ppt-${Date.now()}`;
    const created = await mongoDb.preTalks.create(talk);
    res.status(201).json({ success: true, talk: created });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create pre-talk' });
  }
});

app.post('/api/pre-talks/:id/rsvp', async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId required' });
    const updated = await mongoDb.preTalks.toggleRsvp(req.params.id, studentId);
    if (!updated) return res.status(404).json({ error: 'Pre-talk not found' });
    res.json({ success: true, talk: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update RSVP' });
  }
});

// 4. DRIVE SCHEDULER & CONFLICTS
app.get('/api/scheduler/slots', async (req, res) => {
  try {
    const slots = await mongoDb.slots.findMany();
    const conflicts = await mongoDb.conflicts.findMany();
    res.json({ success: true, slots, conflicts });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch schedule slots' });
  }
});

app.post('/api/scheduler/slots', async (req, res) => {
  try {
    const slot = req.body;
    if (!slot.id) slot.id = `slot-${Date.now()}`;
    const created = await mongoDb.slots.create(slot);
    const conflicts = await mongoDb.conflicts.findMany();
    res.status(201).json({ success: true, slot: created, conflicts });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create schedule slot' });
  }
});

app.post('/api/scheduler/conflicts/:id/resolve', async (req, res) => {
  try {
    const ok = await mongoDb.slots.resolveConflict(req.params.id);
    const conflicts = await mongoDb.conflicts.findMany();
    res.json({ success: ok, conflicts });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to resolve conflict' });
  }
});

// 5. OFFERS & DOCUMENTATION
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await mongoDb.offers.findMany();
    res.json({ success: true, offers });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch offers' });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const offer = req.body;
    if (!offer.id) offer.id = `off-${Date.now()}`;
    const created = await mongoDb.offers.create(offer);
    res.status(201).json({ success: true, offer: created });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create offer' });
  }
});

app.patch('/api/offers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await mongoDb.offers.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Offer not found' });
    res.json({ success: true, offer: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update offer status' });
  }
});

app.patch('/api/offers/:id/verify-document', async (req, res) => {
  try {
    const { docIndex, verified } = req.body;
    const updated = await mongoDb.offers.verifyDoc(req.params.id, docIndex, verified);
    if (!updated) return res.status(404).json({ error: 'Offer or document index not found' });
    res.json({ success: true, offer: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to verify document' });
  }
});

// 6. NOTIFICATIONS & BROADCASTS
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await mongoDb.notifications.findMany();
    res.json({ success: true, notifications });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notif = req.body;
    if (!notif.id) notif.id = `ntf-${Date.now()}`;
    if (!notif.sentAt) notif.sentAt = new Date().toISOString();
    const created = await mongoDb.notifications.create(notif);
    res.status(201).json({ success: true, notification: created });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create notification' });
  }
});

// 7. REAL-TIME STATS & CONVERSION KPIS
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await mongoDb.stats.get();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch stats' });
  }
});

// 8. USERS (ACTUAL & INSTITUTIONAL ACCOUNTS)
app.get('/api/users', async (req, res) => {
  try {
    const users = await mongoDb.users.findMany();
    res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await mongoDb.users.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, role, title, org, badge, avatar, password, studentId, department, phone, usn, cgpa, branch } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const emailNorm = email.trim().toLowerCase();
    const existing = await mongoDb.users.findByEmailWithPassword(emailNorm);
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
    const created = await mongoDb.users.create(newUser);
    res.status(201).json({ success: true, user: sanitizeUser(created) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create user' });
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
    const updated = await mongoDb.users.update(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: sanitizeUser(updated) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const ok = await mongoDb.users.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete user' });
  }
});


// Endpoint 1: Analyze Job Description & Extract Structured Hiring Spec
app.post('/api/gemini/analyze-jd', async (req, res) => {
  try {
    const { jdText, companyName } = req.body;
    if (!jdText) {
      return res.status(400).json({ error: 'Job description text is required' });
    }

    const ai = getAIClient();
    if (ai) {
      const prompt = `You are CAMPUSLINK AI Placement Assistant for Rooman Technologies.
Analyze the following corporate Job Description (JD) for ${companyName || 'the recruiter'}.
Extract a structured, rigorous assessment specification in JSON format.

Job Description:
"""
${jdText}
"""

Return ONLY a valid JSON object matching this schema:
{
  "roleTitle": string,
  "minCGPA": number,
  "eligibleBranches": string[] (e.g. ["CSE", "IT", "AI&DS", "ECE", "EEE", "Mechanical"]),
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
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, analysis: parsed });
    }

    // Heuristic fallback if API key is not yet set
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
        keyResponsibilities: ['Develop scalable microservices', 'Write clean automated unit tests', 'Collaborate in agile sprints'],
        selectionRounds: ['Online Assessment (Aptitude + Coding)', 'Technical Round 1', 'Technical Round 2', 'HR Fitment'],
        suggestedTechnicalInterviewTopics: ['Array & String Algorithms', 'Database Normalization & SQL Queries', 'OOP Principles & REST API Design'],
        screeningAdviceForTPO: 'Ensure candidates have solved at least 150+ coding problems and have no active semester backlogs.'
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-jd:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze job description' });
  }
});

// Endpoint 2: Explainable Candidate-Job Fit Matching
app.post('/api/gemini/match-candidate', async (req, res) => {
  try {
    const { student, drive } = req.body;
    if (!student || !drive) {
      return res.status(400).json({ error: 'Student profile and drive details are required' });
    }

    const ai = getAIClient();
    if (ai) {
      const prompt = `You are CAMPUSLINK AI Recommendation & Matching Engine for Rooman Technologies.
Evaluate the candidate match against the recruiter requirements with transparent explainability.

Candidate Profile:
Name: ${student.name} (${student.usn})
Branch: ${student.branch} | CGPA: ${student.cgpa}
Active Backlogs: ${student.activeBacklogs} | History of Backlogs: ${student.historyOfBacklogs}
Readiness Score: ${student.readinessScore}/100
LeetCode Solved: ${student.leetcodeSolved} | Projects: ${student.projectsCount}
Skills: ${JSON.stringify(student.skills.map((s: any) => `${s.name} (Lv ${s.level})`))}
Top Projects: ${JSON.stringify(student.topProjects || [])}
Mock Interview Score: ${student.mockInterviewScore} | Aptitude Score: ${student.aptitudeScore}

Recruiter Requirements (${drive.companyName} - ${drive.roleTitle}):
Min CGPA: ${drive.minCGPA} | Max Backlogs: ${drive.maxBacklogsAllowed}
Eligible Branches: ${JSON.stringify(drive.eligibleBranches)}
Required Skills: ${JSON.stringify(drive.requiredSkills)}
Preferred Skills: ${JSON.stringify(drive.preferredSkills || [])}

Calculate multi-dimensional fit scores (0-100), identify matched & missing skills, and provide an explainable decision verdict.

Return ONLY a JSON object matching this schema:
{
  "overallFitScore": number,
  "academicScore": number,
  "technicalScore": number,
  "projectScore": number,
  "assessmentScore": number,
  "isEligible": boolean,
  "ineligibilityReason": string or null,
  "matchedSkills": string[],
  "missingSkills": string[],
  "strengths": string[],
  "explainabilityVerdict": string,
  "improvementTip": string,
  "suggestedInterviewQuestions": string[]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, match: parsed });
    }

    // Heuristic fallback calculation
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
        explainabilityVerdict: `${student.name} demonstrates a solid foundation in core technical domains with ${matched.length} primary skill overlaps for ${drive.companyName}.`,
        improvementTip: missing.length ? `Brush up on ${missing.join(', ')} prior to technical rounds.` : 'Conduct mock behavioral interviews focusing on leadership principles.',
        suggestedInterviewQuestions: [
          `Explain the architectural choices in ${student.topProjects?.[0]?.title || 'your major project'}.`,
          `How would you optimize database queries under high concurrency?`,
          `Walk through your approach to solving an algorithmic problem on LeetCode.`
        ]
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/match-candidate:', error);
    return res.status(500).json({ error: error.message || 'Failed to compute candidate match' });
  }
});

// Endpoint 3: Personalized Skill Gap Advisor & 4-Week Intervention Plan
app.post('/api/gemini/skill-gap-advisor', async (req, res) => {
  try {
    const { student, targetDomain } = req.body;
    if (!student) {
      return res.status(400).json({ error: 'Student data is required' });
    }

    const ai = getAIClient();
    if (ai) {
      const prompt = `You are CAMPUSLINK AI Career Coach at Rooman Technologies.
Analyze this student's placement readiness gaps and generate an actionable 4-week remedial intervention roadmap.

Student Profile:
Name: ${student.name} | Branch: ${student.branch} | CGPA: ${student.cgpa}
Readiness Tier: ${student.tier} | Readiness Score: ${student.readinessScore}/100
Backlogs: ${student.activeBacklogs} active
Current Skills: ${JSON.stringify(student.skills)}
Target Corporate Domain: ${targetDomain || 'Tier-1 Product & Cloud Engineering Roles'}
Risk Factors: ${JSON.stringify(student.riskReasons || [])}

Generate a structured intervention plan in JSON format:
{
  "summaryVerdict": string,
  "criticalGaps": string[],
  "fourWeekActionPlan": [
    { "week": number, "focus": string, "tasks": string[], "deliverable": string }
  ],
  "recommendedCertifications": string[],
  "mentorInterventionPriority": "Urgent" | "Moderate" | "Monitoring"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, plan: parsed });
    }

    // Heuristic fallback
    return res.json({
      success: true,
      plan: {
        summaryVerdict: `${student.name} has foundational knowledge but requires targeted focus on algorithmic problem solving, active backlog clearance, and project storytelling.`,
        criticalGaps: [
          'DSA complexity analysis and medium-level tree/graph problems',
          'Mock technical interview communication under pressure',
          'Hands-on cloud deployment experience'
        ],
        fourWeekActionPlan: [
          { week: 1, focus: 'Core DSA & Aptitude Boost', tasks: ['Solve 25 LeetCode Easy/Medium problems on Arrays & HashMaps', 'Complete 3 Rooman quantitative aptitude mocks'], deliverable: 'Pass Aptitude Benchmark with >75%' },
          { week: 2, focus: 'System Architecture & Database', tasks: ['Design a scalable REST API with indexing & caching', 'Review database normalization and indexing'], deliverable: 'GitHub Repository with clean README & tests' },
          { week: 3, focus: 'Mock Interviews & Tech Round Prep', tasks: ['Attend 2 one-on-one mentor mock interviews with Rooman trainers', 'Prepare STAR method answers for 5 behavioral scenarios'], deliverable: 'Mock Interview score > 80%' },
          { week: 4, focus: 'Company Specific Screening', tasks: ['Review past interview questions of upcoming recruiters', 'Refine 1-page ATS-optimized resume'], deliverable: 'Final Placement Cell Approval' }
        ],
        recommendedCertifications: ['Rooman Full Stack Cloud Specialist', 'AWS Cloud Practitioner'],
        mentorInterventionPriority: student.isAtRisk ? 'Urgent' : 'Moderate'
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/skill-gap-advisor:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate skill gap plan' });
  }
});

// Endpoint 4: Conflict-Aware Drive Schedule Resolver
app.post('/api/gemini/resolve-schedule-conflict', async (req, res) => {
  try {
    const { conflict, availableSlots, venues } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `You are CAMPUSLINK AI Drive Scheduling Optimizer for Rooman Technologies.
Resolve this placement drive conflict:
Conflict Details: ${JSON.stringify(conflict)}
Venues & Labs: ${JSON.stringify(venues || ['Computer Lab 1 (120 seats)', 'Computer Lab 2 (100 seats)', 'Computer Lab 3 (80 seats)', 'Main Auditorium', 'Placement Suites'])}
Available Windows: ${JSON.stringify(availableSlots || ['Morning 09:00 - 12:00', 'Afternoon 13:30 - 16:30', 'Evening 17:00 - 19:30'])}

Provide a conflict-free resolution plan in JSON:
{
  "rootCauseAnalysis": string,
  "recommendedAction": string,
  "alternativeVenues": string[],
  "suggestedTimeSlot": string,
  "studentNotificationNote": string,
  "contingencyPlan": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, resolution: parsed });
    }

    return res.json({
      success: true,
      resolution: {
        rootCauseAnalysis: 'Simultaneous reservation of Computer Lab 1 between external recruiter online test and semester departmental practicals.',
        recommendedAction: 'Partition the cohort into two test batches across Computer Lab 2 and Virtual Proctored mode, shifting start time by 90 minutes.',
        alternativeVenues: ['Computer Lab 2 (100 seats)', 'Central Library CAD Lab (60 seats)'],
        suggestedTimeSlot: '14:00 - 16:00 (Post-lunch slot)',
        studentNotificationNote: 'Please note the revised timing and venue for the online assessment. All credentials remain identical.',
        contingencyPlan: 'In case of lab power/network latency, students can take the exam on secure personal laptops with Safe Exam Browser.'
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/resolve-schedule-conflict:', error);
    return res.status(500).json({ error: error.message || 'Failed to resolve conflict' });
  }
});

// Endpoint 5: Automated Placement Notification Drafter
app.post('/api/gemini/draft-notification', async (req, res) => {
  try {
    const { purpose, companyName, channel, targetAudience, extraDetails } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `You are CAMPUSLINK Official Placement Communications Officer for Rooman Technologies.
Draft an official placement notification for the college placement cell.

Details:
Purpose: ${purpose || 'Drive Shortlist Announcement'}
Company: ${companyName || 'Rooman Technologies'}
Channel: ${channel || 'WhatsApp'} (Format appropriately: concise with emojis for WhatsApp, professional and structured for Email, ultra-crisp for SMS)
Audience: ${targetAudience || 'Shortlisted Candidates'}
Additional Details: ${extraDetails || 'Carry updated resume, photo ID, dress in formal attire'}

Return ONLY a JSON object:
{
  "subjectOrHeadline": string,
  "messageBody": string,
  "keyChecklist": string[],
  "callToAction": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, draft: parsed });
    }

    return res.json({
      success: true,
      draft: {
        subjectOrHeadline: `📢 Shortlist Announcement: ${companyName} Campus Drive 2026`,
        messageBody: `Dear Candidates,\n\nHearty congratulations on clearing the initial screening for ${companyName}! The Technical Interview rounds are scheduled for tomorrow.\n\nPlease report at 09:00 AM sharp at the Placement Suites. Ensure you bring 2 physical copies of your resume, college ID card, and all semester grade sheets.\n\nBest regards,\nTraining & Placement Cell\nRooman Technologies`,
        keyChecklist: ['2 Copies of Resume', 'College ID Card', 'Formal Attire (Mandatory)', 'Laptop with full charge'],
        callToAction: 'Confirm your attendance by clicking the acknowledgment link on CAMPUSLINK portal by 8:00 PM today.'
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/draft-notification:', error);
    return res.status(500).json({ error: error.message || 'Failed to draft notification' });
  }
});

// Endpoint 6: AI ATS Resume Scorer & Enhancer
app.post('/api/gemini/ats-resume-analyzer', async (req, res) => {
  try {
    const { resumeSummary, skills, targetRole, experience } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `You are CAMPUSLINK AI ATS Resume Evaluator for Rooman Technologies.
Analyze this student's profile for the target role "${targetRole || 'Software / Cloud Engineer'}".
Resume Summary: ${resumeSummary || 'Not provided'}
Skills: ${JSON.stringify(skills || [])}
Projects/Internships: ${JSON.stringify(experience || [])}

Provide a comprehensive ATS evaluation in JSON format:
{
  "atsScore": number (0 to 100),
  "benchmarkTier": "High Match (85-100)" | "Moderate Match (70-84)" | "Needs Work (<70)",
  "keyMatchedKeywords": string[],
  "missingCriticalKeywords": string[],
  "bulletImprovements": [
    { "original": string, "improved": string, "impactRationale": string }
  ],
  "actionableTips": string[],
  "overallVerdict": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, analysis: parsed });
    }

    return res.json({
      success: true,
      analysis: {
        atsScore: 88,
        benchmarkTier: 'High Match (85-100)',
        keyMatchedKeywords: ['Python', 'FastAPI', 'Distributed Systems', 'PostgreSQL', 'Docker', 'RESTful APIs'],
        missingCriticalKeywords: ['CI/CD Pipeline', 'Kubernetes Deployment', 'Unit Testing (Jest/Pytest)', 'Agile/Scrum'],
        bulletImprovements: [
          {
            original: 'Built a web application for booking appointments using React and Node.js.',
            improved: 'Architected full-stack appointment platform in React & Node.js, reducing booking latency by 35% across 2,000+ daily sessions.',
            impactRationale: 'Introduces strong action verb (Architected) and quantifiable business performance metrics.'
          },
          {
            original: 'Worked on database queries and optimized performance.',
            improved: 'Engineered composite PostgreSQL indexes and implemented Redis caching, cutting P95 database query response times by 48%.',
            impactRationale: 'Highlights specialized architectural tools and explicit P95 latency improvement.'
          }
        ],
        actionableTips: [
          'Add a distinct "Cloud & DevOps" category to your skills section.',
          'Link GitHub repositories with active CI build badges to verify code quality.',
          'Ensure contact details include verified LinkedIn and LeetCode profile links.'
        ],
        overallVerdict: 'Strong technical baseline with high ATS keyword penetration for cloud engineering roles. Enhancing metric quantification will push this into top 5% candidate pool.'
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/ats-resume-analyzer:', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

// Endpoint 7: Mock Interview Simulator (STAR Evaluation)
app.post('/api/gemini/mock-interview-eval', async (req, res) => {
  try {
    const { question, candidateAnswer, targetCompany, role } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `You are a Senior Technical Hiring Lead evaluating a campus candidate for ${targetCompany || 'Tier-1 Tech Company'} (${role || 'Software Engineer'}).
Question: "${question}"
Candidate Answer: "${candidateAnswer}"

Evaluate using the STAR technique (Situation, Task, Action, Result) with rigorous corporate standards.
Return ONLY JSON:
{
  "overallScore": number (0 to 100),
  "starAnalysis": {
    "situation": string,
    "task": string,
    "action": string,
    "result": string
  },
  "strengths": string[],
  "areasForImprovement": string[],
  "improvedSampleAnswer": string,
  "followUpQuestion": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, evaluation: parsed });
    }

    return res.json({
      success: true,
      evaluation: {
        overallScore: 82,
        starAnalysis: {
          situation: 'Clearly defined the engineering context and project constraints.',
          task: 'Specified the exact problem regarding system scalability and throughput.',
          action: 'Good explanation of algorithmic approach and technical stack choice.',
          result: 'Could strengthen by stating precise percentage improvement or user impact.'
        },
        strengths: [
          'Demonstrated clear technical vocabulary regarding asynchronous processing',
          'Addressed potential edge cases during high concurrency'
        ],
        areasForImprovement: [
          'Quantify the outcome (e.g. reduced load time from X to Y ms)',
          'Mention trade-offs considered before selecting the final architecture'
        ],
        improvedSampleAnswer: `In my capstone project at Rooman Technologies, our notification queue choked during traffic spikes (Situation). My task was to decouple the ingestion pipeline to guarantee sub-second delivery (Task). I implemented Redis Streams with Python async workers and added circuit-breaker fallbacks (Action). Consequently, throughput tripled to 4,500 events/sec with zero dropped messages under stress testing (Result).`,
        followUpQuestion: 'How would your design handle backpressure if the downstream third-party SMS gateway throttles your API keys?'
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/mock-interview-eval:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate interview response' });
  }
});

// Endpoint 8: AI Placement Readiness Accelerator
app.post('/api/gemini/make-placement-ready', async (req, res) => {
  try {
    const { student, targetCompany, daysUntilDrive } = req.body;
    const ai = getAIClient();

    if (ai) {
      const prompt = `You are CAMPUSLINK Chief Placement Director at Rooman Technologies.
Create a hyper-accelerated "Placement Ready" sprint plan to elevate ${student?.name || 'this student'} to Corporate Ready status within ${daysUntilDrive || 14} days.
Target Company: ${targetCompany || 'Top Tech & Cloud Recruiters'}
Student Profile:
Branch: ${student?.branch} | CGPA: ${student?.cgpa} | Readiness: ${student?.readinessScore}%
LeetCode Solved: ${student?.leetcodeSolved || 0} | Backlogs: ${student?.activeBacklogs || 0}
Skills: ${JSON.stringify(student?.skills || [])}

Return JSON matching:
{
  "readinessSprintTitle": string,
  "projectedScoreIncrease": number,
  "dailySprintTasks": [
    { "day": number, "module": string, "task": string, "durationMinutes": number, "benchmark": string }
  ],
  "mustKnowCompanyTopics": string[],
  "mockInterviewFocusAreas": string[],
  "rooomRemedialClinicsRecommended": string[]
}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({ success: true, plan: parsed });
      } catch (genError: any) {
        console.warn('[Gemini] /api/gemini/make-placement-ready fallback triggered:', genError?.message || genError);
      }
    }

    return res.json({
      success: true,
      plan: {
        readinessSprintTitle: 'Corporate Readiness Fast-Track Sprint (Rooman Tech)',
        projectedScoreIncrease: 16,
        dailySprintTasks: [
          { day: 1, module: 'DSA Foundations', task: 'Master Two Pointers & Sliding Window with 8 medium problems', durationMinutes: 120, benchmark: '100% test case pass on HackerRank' },
          { day: 2, module: 'Core CS Essentials', task: 'Review OS Concurrency, Virtual Memory, and SQL Indexes', durationMinutes: 90, benchmark: 'Score >80% on Rooman Technical Diagnostic' },
          { day: 3, module: 'System Design & APIs', task: 'Design an URL Shortener and understand caching with Redis', durationMinutes: 90, benchmark: 'Draw complete architecture diagram in Excalidraw' },
          { day: 4, module: 'ATS Resume Polish', task: 'Incorporate 10 role-specific keywords and upload revised PDF', durationMinutes: 60, benchmark: 'ATS Score > 90/100' },
          { day: 5, module: 'Behavioral & STAR', task: 'Prepare answers for top 5 leadership & conflict questions', durationMinutes: 60, benchmark: 'Record 3-minute video pitch' },
          { day: 6, module: 'Mock Technical Round', task: 'Participate in live 1-on-1 Rooman Mentor technical mock drill', durationMinutes: 60, benchmark: 'Mentor Clearance Recommendation' },
          { day: 7, module: 'Final Company Mock', task: 'Simulate full company-specific online assessment with timer', durationMinutes: 90, benchmark: 'Pass cutoff threshold' }
        ],
        mustKnowCompanyTopics: ['Time & Space Complexity', 'REST API Architecture', 'Database Transactions & ACID', 'Git Branching Strategies'],
        mockInterviewFocusAreas: ['Explaining trade-offs in project design', 'Handling coding hints productively', 'Communication under timed pressure'],
        rooomRemedialClinicsRecommended: ['Rooman DSA Masterclass Clinic', 'Corporate Behavioral Pitch Lab', 'Cloud Architecture Bootcamp']
      },
      fallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/make-placement-ready:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate readiness accelerator' });
  }
});

// ==========================================
// 15 NEW GEMINI AI POWERED ENDPOINTS
// ==========================================

// 1. Multi-Turn Interactive Mock Interviewer
app.post('/api/gemini/interactive-interview', async (req, res) => {
  try {
    const { history = [], targetRole, targetCompany, candidateAnswer, currentQuestion } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a Senior Technical Interviewer evaluating a candidate for the role of ${targetRole || 'Software Engineer'} at ${targetCompany || 'a leading tech company'}.
Current Question: "${currentQuestion || 'Tell me about a technical project you built.'}"
Candidate Answer: "${candidateAnswer || ''}"
Previous Context: ${JSON.stringify(history.slice(-4))}

Analyze this turn with rigorous STAR method scrutiny (Situation, Task, Action, Metrics).
Return ONLY a valid JSON object matching this schema:
{
  "turnScore": number (1 to 100),
  "starAnalysis": {
    "situation": string,
    "task": string,
    "action": string,
    "metrics": string
  },
  "feedback": string,
  "followUpChallenge": string,
  "modelAnswerSample": string
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.3 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      turnScore: 84,
      starAnalysis: {
        situation: 'Well defined context describing production scaling bottleneck.',
        task: 'Clearly articulated ownership over backend latency and DB connection timeouts.',
        action: 'Employed Python cProfile and connection pooling with context managers.',
        metrics: 'Quantified drop in timeouts to zero, though latency numbers could be sharper.'
      },
      feedback: 'Strong technical explanation. For higher marks, state the exact latency reduction (e.g. from 450ms down to 80ms) and traffic scale.',
      followUpChallenge: 'How would your connection pooling architecture handle sudden traffic spikes that exhaust even the enlarged connection pool?',
      modelAnswerSample: 'When our API traffic spiked to 12k concurrent users, I profiled the bottleneck using cProfile, identified leaked DB connections in exception handlers, and redesigned the pool with bounded leases, dropping P99 latency by 62% and eliminating timeouts.',
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. 1-Click Resume Tailorer (Google X-Y-Z formula)
app.post('/api/gemini/tailor-resume', async (req, res) => {
  try {
    const { resumeSummary, skills, targetRole, targetCompany, experience } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a Tier-1 Tech Recruiter and ATS Optimization Expert.
Tailor the following student resume for the role: ${targetRole || 'Full Stack Engineer'} at ${targetCompany || 'Top Tech Firm'}.
Transform bullet points using the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
Candidate Skills: ${JSON.stringify(skills || [])}
Resume Summary: "${resumeSummary || ''}"

Return ONLY a valid JSON object matching this schema:
{
  "tailoredHeadline": string,
  "xyzBullets": [
    {
      "original": string,
      "xyzFormat": string,
      "impact": string
    }
  ],
  "atsMatchedKeywords": string[],
  "atsMissingKeywords": string[],
  "projectedAtsScore": number
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      tailoredHeadline: `Aspiring ${targetRole || 'Cloud & Full Stack Engineer'} | Scalable Microservices, Docker & React`,
      xyzBullets: [
        {
          original: 'Developed an online booking platform with React and Node.js.',
          xyzFormat: 'Accomplished a 35% reduction in reservation drop-offs as measured by Google Analytics funnels across 4,200 sessions, by architecting an async React & Node.js checkout pipeline with Redis optimistic locking.',
          impact: 'Highlights commercial impact, measurable funnel improvement, and concurrency control.'
        },
        {
          original: 'Optimized database queries and improved performance.',
          xyzFormat: 'Accomplished a 58% reduction in P95 database query latency as measured by pg_stat_statements, by designing composite PostgreSQL B-Tree indexes and implementing query caching.',
          impact: 'Demonstrates deep database internals, profiling methodology, and measurable speedup.'
        }
      ],
      atsMatchedKeywords: ['React', 'Node.js', 'PostgreSQL', 'Microservices', 'RESTful APIs', 'Git', 'Agile'],
      atsMissingKeywords: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'Distributed Tracing', 'AWS/GCP'],
      projectedAtsScore: 94,
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Statutory Report Generator
app.post('/api/gemini/generate-statutory-report', async (req, res) => {
  try {
    const { academicYear = '2025-2026', department = 'All Departments', stats } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a certified Institutional Placement Auditor for Rooman Technologies & University Accreditation Board (NBA / NAAC / NIRF).
Generate an official statutory placement compliance report for Academic Year ${academicYear}, Department: ${department}.
Context stats: ${JSON.stringify(stats || {})}

Return ONLY a valid JSON object matching this schema:
{
  "complianceGrade": string,
  "auditorStatement": string,
  "executiveNarrative": string,
  "formattedTable": [
    {
      "department": string,
      "eligible": number,
      "placed": number,
      "placementPercentage": number,
      "avgLpa": number,
      "highestLpa": number,
      "complianceStatus": "Compliant" | "Action Required" | "Exemplary"
    }
  ],
  "csvData": string
}`;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.2 }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
      } catch (genError: any) {
        console.warn('[Gemini] /api/gemini/generate-statutory-report fallback triggered:', genError?.message || genError);
      }
    }
    return res.json({
      success: true,
      complianceGrade: 'A+ (Exemplary NIRF Alignment)',
      auditorStatement: 'The placement records, APAAR National Academic Depository linkage, and dual-offer governance policies for AY 2025-2026 have been audited and verified for statutory compliance under AICTE and University Accreditation standards.',
      executiveNarrative: 'The institution registered an overall placement rate of 88.4% across eligible registered candidates. Tier-1 product hiring rose by 22% compared to previous cohorts, driven by early remedial clinics and APAAR ABC credit authentication.',
      formattedTable: [
        { department: 'CSE', eligible: 240, placed: 226, placementPercentage: 94.2, avgLpa: 9.8, highestLpa: 42.0, complianceStatus: 'Exemplary' },
        { department: 'IT', eligible: 180, placed: 165, placementPercentage: 91.7, avgLpa: 8.9, highestLpa: 36.0, complianceStatus: 'Exemplary' },
        { department: 'AI & Data Science', eligible: 120, placed: 110, placementPercentage: 91.7, avgLpa: 10.4, highestLpa: 38.0, complianceStatus: 'Exemplary' },
        { department: 'ECE', eligible: 160, placed: 138, placementPercentage: 86.3, avgLpa: 7.6, highestLpa: 24.0, complianceStatus: 'Compliant' },
        { department: 'Mechanical', eligible: 110, placed: 84, placementPercentage: 76.4, avgLpa: 6.2, highestLpa: 14.5, complianceStatus: 'Compliant' }
      ],
      csvData: `Department,Eligible,Placed,PlacementPercentage,AvgLPA,HighestLPA,Status\nCSE,240,226,94.2,9.8,42.0,Exemplary\nIT,180,165,91.7,8.9,36.0,Exemplary\nAI&DS,120,110,91.7,10.4,38.0,Exemplary\nECE,160,138,86.3,7.6,24.0,Compliant\nMechanical,110,84,76.4,6.2,14.5,Compliant`,
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Pre-Placement Talk Copilot
app.post('/api/gemini/ppt-qa', async (req, res) => {
  try {
    const { driveDetails, question } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are the Pre-Placement Talk (PPT) Copilot for Rooman Technologies CAMPUSLINK.
A student is asking a question about an upcoming corporate placement drive briefing.
Drive Details: ${JSON.stringify(driveDetails || { company: 'Cisco Systems', role: 'Software Engineer', ctc: '18 LPA' })}
Student Question: "${question || 'What is the cutoff and how many rounds are there?'}"

Return ONLY a valid JSON object matching this schema:
{
  "answer": string,
  "relevantRounds": string[],
  "eligibilityVerdict": string,
  "tips": string[]
}`;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.2 }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
      } catch (genError: any) {
        console.warn('[Gemini] /api/gemini/ppt-qa fallback triggered:', genError?.message || genError);
      }
    }
    return res.json({
      success: true,
      answer: `For ${driveDetails?.company || 'this recruitment drive'}, the selection process spans 4 stages: Online Coding Assessment (HackerRank), Technical Round 1 (DSA & OS), Technical Round 2 (System Design & Project Viva), followed by the HR/Behavioral round. Minimum CGPA threshold is 7.5 with 0 active backlogs.`,
      relevantRounds: ['Round 1: Online Coding (DSA & Aptitude)', 'Round 2: Technical Deep Dive (Core CS & Architecture)', 'Round 3: System Design & Project Viva', 'Round 4: Culture & Leadership Fit'],
      eligibilityVerdict: 'Eligible for CSE, IT, AI&DS, and ECE candidates with CGPA >= 7.5.',
      tips: ['Review Two-Pointers, Graph Traversals, and Dynamic Programming', 'Be prepared to explain project architecture trade-offs on a whiteboard', 'Ensure your DigiLocker verified APAAR transcript is uploaded before Round 1'],
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Predictive At-Risk Radar
app.post('/api/gemini/predict-at-risk', async (req, res) => {
  try {
    const { student } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are the Predictive At-Risk Radar AI for Rooman Technologies placement cell.
Analyze this student's profile to predict unplacement risk and construct a proactive 4-week remedial sprint.
Student Profile: ${JSON.stringify(student || { name: 'Kavya S', cgpa: 6.8, backlogs: 1, leetcode: 45, mockInterview: 55 })}

Return ONLY a valid JSON object matching this schema:
{
  "unplacedProbabilityPercent": number,
  "riskSeverity": "High" | "Medium" | "Low",
  "coreRiskDrivers": string[],
  "remedialRoadmap": [
    {
      "week": number,
      "title": string,
      "actions": string[],
      "milestone": string
    }
  ],
  "expectedImpact": string
}`;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.2 }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
      } catch (genError: any) {
        console.warn('[Gemini] /api/gemini/predict-at-risk fallback triggered:', genError?.message || genError);
      }
    }
    return res.json({
      success: true,
      unplacedProbabilityPercent: 68,
      riskSeverity: 'High',
      coreRiskDrivers: [
        'Aptitude test pass rate currently below 60% campus benchmark',
        'Low LeetCode volume (< 60 problems solved)',
        'Active backlog in Semester 5 (Operating Systems)',
        'Passive resume bullets with missing quantifiable metric verbs'
      ],
      remedialRoadmap: [
        { week: 1, title: 'Speed-Math & Logical Reasoning Sprint', actions: ['Attend Rooman remedial quantitative clinic daily', 'Solve 50 time-bound probability & syllogism sets'], milestone: 'Score >=75% in Aptitude Diagnostic #2' },
        { week: 2, title: 'DSA Two-Pointers & Data Structures', actions: ['Complete 25 curated LeetCode Medium problems', 'Attend peer code review in CAD Lab'], milestone: 'Verified 85+ total LeetCode problems solved' },
        { week: 3, title: 'Backlog Subject Clearance & Viva', actions: ['Weekend faculty remedial sessions for Operating Systems', 'Review virtual memory, deadlock algorithms, and threading'], milestone: 'Clear mock semester exam paper with >70%' },
        { week: 4, title: 'ATS Resume Overhaul & Mock Technicals', actions: ['Rewrite project bullets using Google X-Y-Z formula', 'Complete 1-on-1 Rooman Mentor technical mock interview'], milestone: 'ATS Score >88% and Mentor Clearance issued' }
      ],
      expectedImpact: 'Reduces unplaced probability from 68% down to 18%, unlocking immediate eligibility for 14 Tier-2 and Tier-3 recruitment drives.',
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Offer & Bond Risk Analyzer
app.post('/api/gemini/analyze-offer', async (req, res) => {
  try {
    const { offer } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are an Offer Letter & Legal Bond Risk Analyst for university graduates.
Analyze this corporate employment offer letter for hidden traps, bond penalties, and actual fixed base versus variable components.
Offer Details: ${JSON.stringify(offer || { company: 'Tech Corp', ctcLPA: 12, role: 'Associate SDE' })}

Return ONLY a valid JSON object matching this schema:
{
  "fixedBaseLpa": number,
  "variableBonusLpa": number,
  "bondPeriodMonths": number,
  "bondPenaltyAmount": string,
  "hiddenCaveats": string[],
  "legalVerdict": string,
  "riskRating": "Safe" | "Moderate Concern" | "High Risk Warning"
}`;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.2 }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
      } catch (genError: any) {
        console.warn('[Gemini] /api/gemini/analyze-offer fallback triggered:', genError?.message || genError);
      }
    }
    const ctc = Number(offer?.ctcLPA || 10);
    return res.json({
      success: true,
      fixedBaseLpa: +(ctc * 0.72).toFixed(2),
      variableBonusLpa: +(ctc * 0.28).toFixed(2),
      bondPeriodMonths: 24,
      bondPenaltyAmount: '₹2,00,000 INR (Liquidated Damages)',
      hiddenCaveats: [
        'Variable bonus (28% of CTC) is contingent on both business unit performance and individual rating',
        'Service agreement stipulates 24-month lock-in period with certificate withholding caveat',
        'Shift allowance and health insurance premium deductions are pre-bundled into Gross CTC',
        'Probation period extends to 6 months with standard stipend prior to full salary activation'
      ],
      legalVerdict: 'Fair compensation package with manageable service conditions. Recommend requesting written confirmation on training cost recovery clauses and probation confirmation criteria.',
      riskRating: 'Moderate Concern',
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. 24/7 Campus Placement Helpdesk Chatbot
app.post('/api/gemini/campus-helpdesk', async (req, res) => {
  try {
    const { message, history = [], userRole = 'Student' } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are CAMPUSLINK AI Assistant, the 24/7 Campus Placement & Career Helpdesk for Rooman Technologies.
You serve Students, TPOs, Recruiters, and Coordinators with instant, verified guidance on:
- Placement policies, dual-offer eligibility rules, dream company thresholds
- APAAR ID (12-digit Indian National Academic ID) & DigiLocker credit synchronization
- Drive schedules, venue conflicts, assessment cutoffs, and mock interviews
- Resume formatting with Google X-Y-Z formula and ATS scores

User Role: ${userRole}
Chat History: ${JSON.stringify(history.slice(-6))}
User Query: "${message || 'How do I check my eligibility for upcoming drives?'}"

Respond helpfully, authoritatively, and concisely.
Return ONLY a valid JSON object matching this schema:
{
  "reply": string,
  "suggestedActions": string[]
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.3 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      reply: `Hello! As your CAMPUSLINK 24/7 Placement Helpdesk Assistant, I can guide you through drive registrations, eligibility checks, APAAR credit verification, and interview prep. For upcoming corporate drives, you can view real-time eligibility under 'Corporate Drives' or run a 1-Click Readiness Sprint under 'Placement Readiness Accelerator'. What would you like to explore today?`,
      suggestedActions: [
        'Check my drive eligibility status',
        'How to verify APAAR ABC credits in DigiLocker',
        'Prepare with AI Technical Mock Interview',
        'View placement drive calendar'
      ],
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. GitHub Portfolio & Engineering Rigor Auditor
app.post('/api/gemini/audit-portfolio', async (req, res) => {
  try {
    const { githubUsername = 'developer', repos = [], studentName } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are an Engineering Hiring Manager & Tech Lead.
Audit the following GitHub engineering profile and project repositories for student: ${studentName || 'Candidate'}.
GitHub Handle: ${githubUsername}
Repos Summary: ${JSON.stringify(repos.slice(0, 5))}

Evaluate engineering rigor, architecture, documentation, test suites, and production readiness.
Return ONLY a valid JSON object matching this schema:
{
  "engineeringRigorScore": number,
  "commitConsistency": string,
  "architectureRating": "Enterprise Ready" | "Solid Full-Stack" | "Tutorial Grade" | "Needs Structure",
  "strengths": string[],
  "redFlags": string[],
  "recommendedProjects": string[]
}`;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.2 }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
      } catch (genError: any) {
        console.warn('[Gemini] /api/gemini/audit-portfolio fallback triggered:', genError?.message || genError);
      }
    }
    return res.json({
      success: true,
      engineeringRigorScore: 82,
      commitConsistency: 'Consistent 4-month streak with atomic commit messages and feature branches.',
      architectureRating: 'Solid Full-Stack',
      strengths: [
        'Well-architected microservices codebase with modular Express routers and Drizzle ORM schema separation',
        'Clear root README files with architectural diagrams, environment setup, and demo GIF recordings',
        'Demonstrates understanding of async state handling and debounced search'
      ],
      redFlags: [
        'Missing automated unit/integration test suites (e.g. Jest, Vitest, Playwright)',
        'Environment variables occasionally hardcoded in fallback configuration blocks',
        'No automated Dockerfile or CI/CD GitHub Actions workflow configuration'
      ],
      recommendedProjects: [
        'Build a Distributed Task Queue using Redis Streams & Node.js worker pools with graceful shutdown',
        'Deploy an OpenTelemetry tracing demo across two microservices with Jaeger visualization',
        'Add end-to-end Playwright tests and GitHub Actions CI pipeline to the capstone repository'
      ],
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 9. Cohort & Department Skill Gap Heatmap
app.post('/api/gemini/cohort-skill-heatmap', async (req, res) => {
  try {
    const { department = 'All Departments', cohortYear = '2026' } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a Higher-Ed Placement Strategist & Industry Skills Analyst.
Generate a Cohort & Department Skill Gap Heatmap for Year ${cohortYear}, Department ${department}.
Identify critical technology gaps between curriculum outcomes and active tech recruiter hiring demand.

Return ONLY a valid JSON object matching this schema:
{
  "heatmap": [
    {
      "skill": string,
      "category": string,
      "currentProficiency": number,
      "industryDemand": number,
      "gapLevel": "Critical" | "Moderate" | "Satisfactory",
      "recommendedIntervention": string
    }
  ],
  "executiveSummary": string
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      heatmap: [
        { skill: 'Data Structures & Algorithms', category: 'Problem Solving', currentProficiency: 72, industryDemand: 95, gapLevel: 'Critical', recommendedIntervention: 'Mandatory 4-week LeetCode Medium problem sprint' },
        { skill: 'Cloud & Containerization (Docker/K8s)', category: 'DevOps & Infra', currentProficiency: 45, industryDemand: 88, gapLevel: 'Critical', recommendedIntervention: 'Rooman AWS/GCP Hands-on Container Bootcamp' },
        { skill: 'Full-Stack React & Node.js', category: 'Web Architecture', currentProficiency: 82, industryDemand: 90, gapLevel: 'Satisfactory', recommendedIntervention: 'Advanced concurrency & performance profiling lab' },
        { skill: 'Relational Database Optimization', category: 'Databases', currentProficiency: 64, industryDemand: 86, gapLevel: 'Moderate', recommendedIntervention: 'PostgreSQL indexing, transaction isolation & P95 tuning' },
        { skill: 'System Design & Distributed Caching', category: 'Architecture', currentProficiency: 48, industryDemand: 84, gapLevel: 'Critical', recommendedIntervention: 'Microservices & Redis cache design studio' },
        { skill: 'Technical Behavioral STAR Delivery', category: 'Soft Skills', currentProficiency: 68, industryDemand: 85, gapLevel: 'Moderate', recommendedIntervention: 'AI Mock Interview STAR pitch coaching sessions' }
      ],
      executiveSummary: 'While core web development proficiencies are robust (82%), urgent remedial intervention is required in Cloud/Containers (-43% gap) and System Design (-36% gap) to meet Tier-1 corporate cutoffs for Cisco, Google Cloud, and Deloitte.',
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 10. Corporate Outreach & MoU Intelligence
app.post('/api/gemini/outreach-intelligence', async (req, res) => {
  try {
    const { targetIndustry = 'Cloud, AI & IT Services', averageBatchCgpa = 8.1 } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a Senior Corporate Relations & MoU Placement Officer for university-corporate partnerships.
Analyze campus demographics (Average CGPA: ${averageBatchCgpa}, Target: ${targetIndustry}) and generate targeted corporate outreach intelligence.

Return ONLY a valid JSON object matching this schema:
{
  "targetCompanies": [
    {
      "name": string,
      "hiringProbability": string,
      "matchScore": number,
      "recommendedCtc": string,
      "valueProposition": string
    }
  ],
  "draftedMoUEmail": string,
  "suggestedDiscussionPoints": string[]
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      targetCompanies: [
        { name: 'Cisco Systems India', hiringProbability: 'High (88%)', matchScore: 94, recommendedCtc: '14 - 18 LPA', valueProposition: 'Over 120 students certified in Networking, Linux kernel internals, and Cloud Foundations via Rooman Labs.' },
        { name: 'Deloitte USI (Consulting & Advisory)', hiringProbability: 'Very High (92%)', matchScore: 91, recommendedCtc: '8.5 - 11.5 LPA', valueProposition: 'High aptitude pass rates (84%+) and DigiLocker-authenticated academic credentials.' },
        { name: 'Google Cloud Platform Partners', hiringProbability: 'Moderate-High (78%)', matchScore: 89, recommendedCtc: '12 - 16 LPA', valueProposition: 'Hands-on Kubernetes, GenAI SDK, and distributed backend projects deployed in production.' },
        { name: 'Siemens Technology Services', hiringProbability: 'High (85%)', matchScore: 86, recommendedCtc: '9 - 13 LPA', valueProposition: 'Strong foundational C++, Embedded Linux, and ECE/CSE cross-disciplinary talent.' }
      ],
      draftedMoUEmail: `Subject: Strategic Campus Hiring Partnership & MoU Collaboration - Rooman CAMPUSLINK Talent Pool\n\nDear University Hiring Team,\n\nOn behalf of Rooman Technologies and our affiliated Engineering institutions, we are pleased to invite your organization for our upcoming Campus Hiring Drives for the 2025-2026 cohort.\n\nOur pre-assessed candidate pool features:\n• 100% verified Academic Bank of Credits (ABC / APAAR National ID) credentials\n• Rigorous pre-placement screening with >80% aptitude and LeetCode algorithmic benchmarks\n• Zero-conflict interview scheduling via our automated campus orchestration OS\n\nWe would welcome a 15-minute briefing to share our detailed branch-wise demographic dossier and finalize preferred drive dates.\n\nSincerely,\nDirector of Corporate Relations & Training\nRooman CAMPUSLINK Placement Cell`,
      suggestedDiscussionPoints: [
        'Propose an early-access Day 0 slotted drive window with zero venue clashes',
        'Offer pre-drive custom assessments mapped exactly to your internal competency rubrics',
        'Provide dedicated 120-seat high-speed testing CAD labs with biometric attendance'
      ],
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 11. Multi-Factor Weighted Candidate Shortlisting
app.post('/api/gemini/bulk-rank-candidates', async (req, res) => {
  try {
    const { candidates = [], weights = { cgpaWeight: 25, codingWeight: 35, interviewWeight: 25, attendanceWeight: 15 } } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are an AI Talent Acquisition Ranking Engine.
Rank the following candidates according to weighted criteria:
Weights: CGPA (${weights.cgpaWeight}%), LeetCode/Coding (${weights.codingWeight}%), Mock Interview (${weights.interviewWeight}%), Attendance (${weights.attendanceWeight}%).
Candidates: ${JSON.stringify(candidates.slice(0, 10))}

Return ONLY a valid JSON object matching this schema:
{
  "rankedCandidates": [
    {
      "id": string,
      "name": string,
      "rank": number,
      "compositeScore": number,
      "justification": string,
      "recommendation": "Instant Shortlist" | "Review" | "Waitlist"
    }
  ]
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    const ranked = (candidates.length ? candidates : [
      { id: 'std-101', name: 'Aarav Patel', cgpa: 9.2, leetcodeSolved: 280, mockInterviewScore: 92, attendancePercent: 96 },
      { id: 'std-103', name: 'Vikram Mehta', cgpa: 8.8, leetcodeSolved: 240, mockInterviewScore: 88, attendancePercent: 92 },
      { id: 'std-105', name: 'Rohan Sharma', cgpa: 8.4, leetcodeSolved: 190, mockInterviewScore: 85, attendancePercent: 88 },
      { id: 'std-102', name: 'Priya Sundaram', cgpa: 8.6, leetcodeSolved: 175, mockInterviewScore: 80, attendancePercent: 90 },
      { id: 'std-104', name: 'Ananya Deshmukh', cgpa: 7.9, leetcodeSolved: 140, mockInterviewScore: 78, attendancePercent: 85 }
    ]).map((c: any) => {
      const score = Math.round(
        ((c.cgpa || 8) / 10) * weights.cgpaWeight +
        (Math.min(c.leetcodeSolved || 150, 300) / 300) * weights.codingWeight +
        ((c.mockInterviewScore || 75) / 100) * weights.interviewWeight +
        ((c.attendancePercent || 85) / 100) * weights.attendanceWeight
      );
      return {
        id: c.id,
        name: c.name,
        rank: 1,
        compositeScore: score,
        justification: `High algorithmic defense (${c.leetcodeSolved || 150}+ solved), verified CGPA ${c.cgpa || 8.0}, and solid mock interview rigor (${c.mockInterviewScore || 80}%).`,
        recommendation: score >= 85 ? 'Instant Shortlist' : score >= 75 ? 'Review' : 'Waitlist'
      };
    }).sort((a: any, b: any) => b.compositeScore - a.compositeScore).map((item: any, idx: number) => ({ ...item, rank: idx + 1 }));

    return res.json({ success: true, rankedCandidates: ranked, fallback: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 12. Technical Assessment & MCQ Generator
app.post('/api/gemini/generate-assessment', async (req, res) => {
  try {
    const { role = 'Associate Software Engineer', topic = 'Data Structures, APIs & Cloud', difficulty = 'Intermediate', numQuestions = 4 } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a Senior Technical Examiner creating an online campus recruitment assessment.
Role: ${role}
Topic: ${topic}
Difficulty: ${difficulty}
Generate ${numQuestions} screening MCQs and 1 algorithmic challenge.

Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "id": number,
      "question": string,
      "options": string[],
      "correctOptionIndex": number,
      "explanation": string,
      "difficulty": string
    }
  ],
  "codingChallenge": {
    "title": string,
    "description": string,
    "testCases": [
      {
        "input": string,
        "expectedOutput": string
      }
    ]
  }
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      questions: [
        {
          id: 1,
          question: 'In a high-throughput microservices architecture, what is the primary benefit of deploying a Circuit Breaker pattern?',
          options: [
            'Increases database query throughput by 50%',
            'Prevents cascading service failures when a downstream dependency experiences latency or outages',
            'Enforces HTTPS SSL handshake encryption across client sessions',
            'Automatically recompiles TypeScript code in memory'
          ],
          correctOptionIndex: 1,
          explanation: 'The Circuit Breaker pattern trips when downstream latency or errors exceed thresholds, failing fast to prevent thread exhaustion across upstream callers.',
          difficulty: 'Intermediate'
        },
        {
          id: 2,
          question: 'What is the time complexity of searching for a key in a balanced AVL Tree with N elements?',
          options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
          correctOptionIndex: 1,
          explanation: 'Because AVL trees strictly maintain a height balance factor difference of at most 1, tree height is strictly bounded to 1.44 log N, yielding O(log N) lookup time.',
          difficulty: 'Entry'
        },
        {
          id: 3,
          question: 'Which HTTP status code is most appropriate when a client sends a syntactically valid JSON body that fails domain validation rules?',
          options: ['400 Bad Request', '422 Unprocessable Entity', '500 Internal Server Error', '403 Forbidden'],
          correctOptionIndex: 1,
          explanation: 'HTTP 422 Unprocessable Entity signifies that the payload syntax is correct (valid JSON) but contains semantic validation errors.',
          difficulty: 'Intermediate'
        },
        {
          id: 4,
          question: 'In PostgreSQL, which index type is best suited for accelerating equality and range queries on numeric and timestamp fields?',
          options: ['GIN (Generalized Inverted Index)', 'B-Tree Index', 'BRIN (Block Range Index)', 'Hash Index'],
          correctOptionIndex: 1,
          explanation: 'Standard B-Tree indexes provide optimal logarithmic lookup, range slicing, and sorting operations for scalar and timestamp data.',
          difficulty: 'Intermediate'
        }
      ],
      codingChallenge: {
        title: 'Longest Subarray with Contiguous Sum <= K',
        description: 'Given an array of positive integers nums and an integer k, return the length of the longest contiguous subarray whose sum is less than or equal to k using an optimal O(N) sliding window approach.',
        testCases: [
          { input: 'nums = [3, 1, 2, 1, 4, 5], k = 7', expectedOutput: '4 (Subarray [1, 2, 1, 3] or [3, 1, 2, 1])' },
          { input: 'nums = [8, 2, 4, 6], k = 5', expectedOutput: '2 (Subarray [2, 4] is sum 6 > 5; longest is [2])' }
        ]
      },
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 13. DigiLocker & APAAR Credential Fraud Auditor
app.post('/api/gemini/audit-apaar-credentials', async (req, res) => {
  try {
    const { candidate } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a Government Academic Depository Forensic Auditor (APAAR / ABC / DigiLocker National Depository).
Conduct an authenticity audit on this student's academic credentials:
Candidate Profile: ${JSON.stringify(candidate || { name: 'Aarav Patel', apaarId: '9842-1049-3821', abcId: 'ABC-849-204-192' })}

Return ONLY a valid JSON object matching this schema:
{
  "verificationStatus": "Legitimate & Verified" | "Flagged For Discrepancy" | "Tamper Alert",
  "integrityScore": number,
  "digiLockerStatus": string,
  "auditNotes": string[],
  "timestamp": string
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.1 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      verificationStatus: 'Legitimate & Verified',
      integrityScore: 98,
      digiLockerStatus: 'SHA-256 Digitally Signed by University Registrar via National Academic Depository',
      auditNotes: [
        `APAAR ID ${candidate?.apaarRecord?.apaarId || '9842-1049-3821'} successfully mapped to Academic Bank of Credits ID ${candidate?.apaarRecord?.abcId || 'ABC-849-204-192'}`,
        'All semester marks cards (Sem 1 to Sem 7) cross-verified against official University Examination Portal',
        'Cumulative Grade Point Average (CGPA) verified without grade inflation anomalies',
        'Zero duplicate enrollment records detected across AICTE National Registry'
      ],
      timestamp: new Date().toISOString(),
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 14. Interviewer Live In-Round Copilot
app.post('/api/gemini/interviewer-copilot', async (req, res) => {
  try {
    const { candidate, currentRound = 'Round 1: Technical', liveNotes = '' } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are an Interviewer Live In-Round Copilot for a corporate tech recruiter.
Help the interviewer conduct a rigorous evaluation of the candidate:
Candidate: ${JSON.stringify(candidate || { name: 'Rohan Sharma', branch: 'CSE', skills: ['React', 'Node.js', 'SQL'] })}
Interview Round: ${currentRound}
Live Interviewer Notes so far: "${liveNotes}"

Return ONLY a valid JSON object matching this schema:
{
  "suggestedQuestions": [
    {
      "topic": string,
      "question": string,
      "lookFor": string
    }
  ],
  "candidateStrengthsFlagged": string[],
  "probingDeepDives": string[],
  "recommendedHireScore": number
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      suggestedQuestions: [
        {
          topic: 'Concurrency & Race Conditions',
          question: 'In your capstone appointment booking project, what would happen if two users book the same time slot at the exact millisecond? Walk me through how your DB locks prevent double booking.',
          lookFor: 'Understands SELECT FOR UPDATE, Redis distributed locks, or database unique composite constraints.'
        },
        {
          topic: 'Database Query Optimization',
          question: 'Can you explain the difference between a clustered and non-clustered index, and when an index might degrade query performance?',
          lookFor: 'Knows physical order of data on disk, B-Tree index traversal overhead, and write/insert penalty.'
        },
        {
          topic: 'System Failure Recovery',
          question: 'Suppose your downstream payment gateway service begins returning 504 Gateway Timeouts. How do you prevent thread starvation in your client-facing API?',
          lookFor: 'Mentions timeout thresholds, exponential backoff with jitter, and circuit breaker patterns.'
        }
      ],
      candidateStrengthsFlagged: [
        'Solid communication with clear problem decomposition',
        'Practical debugging experience using logs and profilers',
        'Proactive ownership over system performance and latency'
      ],
      probingDeepDives: [
        'Probe their depth in distributed consensus vs basic standalone services',
        'Ask how they write automated tests for edge-case failure modes'
      ],
      recommendedHireScore: 86,
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 15. Drive Day Turnout & Queue Optimization AI
app.post('/api/gemini/optimize-drive-queues', async (req, res) => {
  try {
    const { registeredCount = 350, driveVenue = 'Main Seminar Hall & CAD Labs', slots = [] } = req.body;
    const ai = getAIClient();
    if (ai) {
      const prompt = `You are a Logistics Operations & Queue Optimization AI for massive campus recruitment drives.
Registered Candidates: ${registeredCount}
Drive Venue: ${driveVenue}
Slots: ${JSON.stringify(slots)}

Optimize turnout predictions, bottleneck mitigation, and staggered batch scheduling.
Return ONLY a valid JSON object matching this schema:
{
  "predictedTurnoutPercent": number,
  "bottleneckRisk": "High" | "Moderate" | "Low",
  "batchOptimizations": [
    {
      "batchTime": string,
      "allocatedLab": string,
      "studentCapacity": number,
      "estimatedWaitMinutes": number
    }
  ],
  "recommendations": string[]
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.2 }
      });
      return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    }
    return res.json({
      success: true,
      predictedTurnoutPercent: 86,
      bottleneckRisk: 'Moderate (Peak between 10:30 AM - 12:00 PM during transition from PPT to Online Assessment)',
      batchOptimizations: [
        { batchTime: '09:00 AM - 10:15 AM', allocatedLab: 'CAD Lab 1 (60 seats) + CS Lab 2 (60 seats)', studentCapacity: 120, estimatedWaitMinutes: 5 },
        { batchTime: '10:30 AM - 11:45 AM', allocatedLab: 'CAD Lab 1 (60 seats) + CS Lab 2 (60 seats)', studentCapacity: 120, estimatedWaitMinutes: 12 },
        { batchTime: '12:00 PM - 01:15 PM', allocatedLab: 'CAD Lab 1 (60 seats) + Electronics Lab (40 seats)', studentCapacity: 100, estimatedWaitMinutes: 8 }
      ],
      recommendations: [
        'Stagger batch check-in by issuing digital QR tokens during the Pre-Placement Talk',
        'Reserve 15 buffer terminals in CS Lab 2 for quick machine swap in case of hardware failures',
        'Direct Batch 2 students to the cafeteria lounge with live display queue monitors to keep corridors clear'
      ],
      fallback: true
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
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
    // Connect to MongoDB Atlas asynchronously
    initMongoDB().catch((err) => {
      console.warn('[MongoDB] Initial connection attempt deferred:', err?.message || err);
    });
  });
}


startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
