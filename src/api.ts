import {
  StudentProfile,
  RecruiterDrive,
  DriveScheduleSlot,
  ScheduleConflict,
  OfferRecord,
  BroadcastNotification,
  PlacementStats,
  PlacementPreTalk,
  UserAccount,
  SignUpPayload,
  LogInPayload,
  AuthResponse
} from './types';

async function parseJsonResponse<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 60)}`);
  }
  return res.json();
}

// API Service connecting frontend seamlessly to backend & database
export const api = {
  // Fetch full state snapshot on load
  getState: async (): Promise<{
    students: StudentProfile[];
    drives: RecruiterDrive[];
    slots: DriveScheduleSlot[];
    conflicts: ScheduleConflict[];
    offers: OfferRecord[];
    notifications: BroadcastNotification[];
    preTalks: PlacementPreTalk[];
    stats: PlacementStats;
  }> => {
    const res = await fetch('/api/db/state');
    if (!res.ok) throw new Error('Failed to load database state');
    return parseJsonResponse(res);
  },

  resetDatabase: async () => {
    const res = await fetch('/api/db/reset', { method: 'POST' });
    return parseJsonResponse(res);
  },

  // Students
  students: {
    list: async (filters?: { branch?: string; tier?: string; status?: string; query?: string }) => {
      const params = new URLSearchParams(filters as any);
      const res = await fetch(`/api/students?${params.toString()}`);
      return res.json();
    },
    get: async (id: string): Promise<StudentProfile> => {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      return data.student;
    },
    create: async (student: StudentProfile): Promise<StudentProfile> => {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      const data = await res.json();
      return data.student;
    },
    update: async (id: string, updates: Partial<StudentProfile>): Promise<StudentProfile> => {
      const res = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return data.student;
    },
    delete: async (id: string) => {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      return res.json();
    }
  },

  // Drives
  drives: {
    list: async (): Promise<RecruiterDrive[]> => {
      const res = await fetch('/api/drives');
      const data = await res.json();
      return data.drives;
    },
    create: async (drive: RecruiterDrive): Promise<RecruiterDrive> => {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drive)
      });
      const data = await res.json();
      return data.drive;
    },
    update: async (id: string, updates: Partial<RecruiterDrive>): Promise<RecruiterDrive> => {
      const res = await fetch(`/api/drives/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return data.drive;
    }
  },

  // Pre-Talks (PPT)
  preTalks: {
    list: async (): Promise<PlacementPreTalk[]> => {
      const res = await fetch('/api/pre-talks');
      const data = await res.json();
      return data.preTalks;
    },
    create: async (talk: PlacementPreTalk): Promise<PlacementPreTalk> => {
      const res = await fetch('/api/pre-talks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(talk)
      });
      const data = await res.json();
      return data.talk;
    },
    toggleRsvp: async (talkId: string, studentId: string): Promise<PlacementPreTalk> => {
      const res = await fetch(`/api/pre-talks/${talkId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      const data = await res.json();
      return data.talk;
    }
  },

  // Scheduler & Conflicts
  scheduler: {
    getSlots: async (): Promise<{ slots: DriveScheduleSlot[]; conflicts: ScheduleConflict[] }> => {
      const res = await fetch('/api/scheduler/slots');
      return res.json();
    },
    addSlot: async (slot: DriveScheduleSlot): Promise<{ slot: DriveScheduleSlot; conflicts: ScheduleConflict[] }> => {
      const res = await fetch('/api/scheduler/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot)
      });
      return res.json();
    },
    resolveConflict: async (conflictId: string): Promise<{ success: boolean; conflicts: ScheduleConflict[] }> => {
      const res = await fetch(`/api/scheduler/conflicts/${conflictId}/resolve`, {
        method: 'POST'
      });
      return res.json();
    }
  },

  // Offers & Documentation
  offers: {
    list: async (): Promise<OfferRecord[]> => {
      const res = await fetch('/api/offers');
      const data = await res.json();
      return data.offers;
    },
    create: async (offer: OfferRecord): Promise<OfferRecord> => {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer)
      });
      const data = await res.json();
      return data.offer;
    },
    updateStatus: async (id: string, status: OfferRecord['status']): Promise<OfferRecord> => {
      const res = await fetch(`/api/offers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      return data.offer;
    },
    verifyDoc: async (offerId: string, docIndex: number, verified: boolean): Promise<OfferRecord> => {
      const res = await fetch(`/api/offers/${offerId}/verify-document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docIndex, verified })
      });
      const data = await res.json();
      return data.offer;
    }
  },

  // Notifications
  notifications: {
    list: async (): Promise<BroadcastNotification[]> => {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      return data.notifications;
    },
    send: async (notif: BroadcastNotification): Promise<BroadcastNotification> => {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif)
      });
      const data = await res.json();
      return data.notification;
    }
  },

  // Stats
  stats: {
    get: async (): Promise<PlacementStats> => {
      const res = await fetch('/api/stats');
      const data = await res.json();
      return data.stats;
    }
  },

  // MongoDB Atlas Integration
  mongodb: {
    getStatus: async (): Promise<{
      success: boolean;
      connected: boolean;
      uriConfigured: boolean;
      clusterHost?: string;
      databaseName?: string;
      modelsLoaded: string[];
      lastError?: string;
      mode: string;
    }> => {
      const res = await fetch('/api/mongodb/status');
      return res.json();
    },
    connect: async (uri: string) => {
      const res = await fetch('/api/mongodb/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri })
      });
      return res.json();
    }
  },

  // Users (Actual & Institutional User Accounts)
  users: {
    list: async (): Promise<UserAccount[]> => {
      const res = await fetch('/api/users');
      const data = await parseJsonResponse(res);
      return data.users || [];
    },
    get: async (id: string): Promise<UserAccount> => {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      return data.user;
    },
    create: async (user: Partial<UserAccount>): Promise<UserAccount> => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      return data.user;
    },
    update: async (id: string, updates: Partial<UserAccount>): Promise<UserAccount> => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      return data.user;
    },
    delete: async (id: string): Promise<boolean> => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    }
  },

  // Authentication (Production-Ready Sign Up & Log In)
  auth: {
    getToken: (): string | null => {
      try {
        return localStorage.getItem('campuslink_auth_token');
      } catch {
        return null;
      }
    },
    setToken: (token: string | null) => {
      try {
        if (token) {
          localStorage.setItem('campuslink_auth_token', token);
        } else {
          localStorage.removeItem('campuslink_auth_token');
        }
      } catch {
        // ignore
      }
    },
    signup: async (payload: SignUpPayload): Promise<AuthResponse> => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration');
      }
      if (data.token) {
        api.auth.setToken(data.token);
      }
      return data;
    },
    login: async (payload: LogInPayload): Promise<AuthResponse> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }
      if (data.token) {
        api.auth.setToken(data.token);
      }
      return data;
    },
    getMe: async (): Promise<UserAccount | null> => {
      const token = api.auth.getToken();
      if (!token) return null;
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          api.auth.setToken(null);
          return null;
        }
        const data = await res.json();
        return data.user || null;
      } catch {
        return null;
      }
    },
    logout: async (): Promise<void> => {
      const token = api.auth.getToken();
      try {
        if (token) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch {
        // ignore
      }
      api.auth.setToken(null);
    }
  }
};

