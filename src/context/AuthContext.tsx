import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, UserAccount, SignUpPayload, LogInPayload, AuthResponse } from '../types';
import { api } from '../api';

export type { UserAccount };

// Clean preset accounts export - zero mock users so user pool starts clean
export const PRESET_ACCOUNTS: Record<string, any> = {};

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  TPO: [
    'tpo-command',
    'overview',
    'students',
    'placement-ready',
    'drives',
    'pre-talks',
    'matching',
    'scheduler',
    'offers',
    'at-risk',
    'notifications',
    'landing'
  ],
  Recruiter: [
    'recruiter-workspace',
    'drives',
    'pre-talks',
    'matching',
    'offers',
    'landing'
  ],
  Student: [
    'student-hub',
    'placement-ready',
    'pre-talks',
    'offers',
    'landing'
  ],
  Coordinator: [
    'coordinator-ops',
    'overview',
    'students',
    'placement-ready',
    'pre-talks',
    'at-risk',
    'notifications',
    'landing'
  ]
};

// Default tab for each role upon authentication
export const ROLE_DEFAULT_TABS: Record<UserRole, string> = {
  TPO: 'tpo-command',
  Recruiter: 'recruiter-workspace',
  Student: 'student-hub',
  Coordinator: 'coordinator-ops'
};

export const getPermittedRolesForTab = (tabId: string): UserRole[] => {
  const roles: UserRole[] = ['TPO', 'Recruiter', 'Student', 'Coordinator'];
  return roles.filter((r) => ROLE_PERMISSIONS[r]?.includes(tabId));
};

export interface AuthContextType {
  user: UserAccount | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  logIn: (credentials: LogInPayload) => Promise<AuthResponse>;
  login: (credentialsOrRole: LogInPayload | UserRole) => Promise<AuthResponse | void>;
  signUp: (payload: SignUpPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  loginWithAccount: (account: UserAccount) => Promise<void>;
  addActualUser: (
    payload: Partial<UserAccount>,
    autoLogin?: boolean
  ) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  deleteActualUser: (id: string) => Promise<boolean>;
  hasPermission: (tabId: string) => boolean;
  getAllowedTabs: () => string[];
  getPermittedRoles: (tabId: string) => UserRole[];
  registeredUsers: UserAccount[];
  refreshUsers: () => Promise<void>;
  updateUserSession: (updates: Partial<UserAccount>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [activeRoleOverride, setActiveRoleOverride] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);

  // Refresh user directory from database
  const refreshUsers = useCallback(async () => {
    try {
      const res = await api.users.list();
      if (Array.isArray(res)) {
        setRegisteredUsers(res);
      }
    } catch (e) {
      console.warn('[AuthContext] Unable to load registered users directory:', e);
    }
  }, []);

  // Initialize session on mount: verify existing JWT token against /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const token = api.auth.getToken();
        if (token) {
          const verifiedUser = await api.auth.getMe();
          if (isMounted) {
            if (verifiedUser) {
              setUser(verifiedUser);
            } else {
              api.auth.setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('[AuthContext] Session verification failed:', err);
        if (isMounted) {
          api.auth.setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          refreshUsers();
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [refreshUsers]);

  // Production Log In Action with Real Database Verification
  const logIn = async (credentials: LogInPayload): Promise<AuthResponse> => {
    try {
      const res = await api.auth.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        setActiveRoleOverride(null);
        refreshUsers();
        return res;
      }
      throw new Error(res.error || 'Authentication failed');
    } catch (err: any) {
      throw new Error(err.message || 'Invalid email or password');
    }
  };

  // Versatile login handler supporting both credentials object and role switcher
  const login = async (credentialsOrRole: LogInPayload | UserRole): Promise<AuthResponse | void> => {
    if (typeof credentialsOrRole === 'string') {
      // Role switch mode
      setActiveRoleOverride(credentialsOrRole);
      return;
    }
    return logIn(credentialsOrRole);
  };

  // Production Sign Up Action with Real Database Persistence
  const signUp = async (payload: SignUpPayload): Promise<AuthResponse> => {
    try {
      const res = await api.auth.signup(payload);
      if (res.success && res.user) {
        setUser(res.user);
        setActiveRoleOverride(null);
        refreshUsers();
        return res;
      }
      throw new Error(res.error || 'Registration failed');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create account');
    }
  };

  // Log Out Action: clears token and session
  const logout = async (): Promise<void> => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      setActiveRoleOverride(null);
      api.auth.setToken(null);
    }
  };

  // Switch role perspective
  const switchRole = (newRole: UserRole) => {
    setActiveRoleOverride(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  // Log in as an existing registered account directly
  const loginWithAccount = async (account: UserAccount): Promise<void> => {
    setUser(account);
    setActiveRoleOverride(account.role);
  };

  // Add actual user directly via modal/admin interface and save to database
  const addActualUser = async (
    payload: Partial<UserAccount>,
    autoLogin: boolean = true
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    try {
      const created = await api.users.create({
        name: payload.name || 'New User',
        email: payload.email || '',
        role: payload.role || 'Student',
        title: payload.title,
        org: payload.org,
        badge: payload.badge,
        avatar: payload.avatar,
        password: payload.password || 'password123',
        department: payload.department,
        phone: payload.phone,
        usn: payload.usn,
        cgpa: payload.cgpa,
        branch: payload.branch
      });

      await refreshUsers();

      if (autoLogin && created) {
        setUser(created);
        setActiveRoleOverride(created.role);
      }

      return { success: true, user: created };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create user account' };
    }
  };

  // Delete actual user from database
  const deleteActualUser = async (id: string): Promise<boolean> => {
    try {
      const ok = await api.users.delete(id);
      if (ok) {
        if (user?.id === id) {
          await logout();
        }
        await refreshUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AuthContext] Failed to delete user:', err);
      return false;
    }
  };

  const updateUserSession = (updates: Partial<UserAccount>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const effectiveRole: UserRole = activeRoleOverride || (user ? user.role : 'Student');

  const hasPermission = (tabId: string): boolean => {
    if (!user) return tabId === 'landing';
    const allowed = ROLE_PERMISSIONS[effectiveRole] || [];
    return allowed.includes(tabId);
  };

  const getAllowedTabs = (): string[] => {
    if (!user) return ['landing'];
    return ROLE_PERMISSIONS[effectiveRole] || [];
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: effectiveRole,
        isAuthenticated,
        isLoading,
        logIn,
        login,
        signUp,
        logout,
        switchRole,
        loginWithAccount,
        addActualUser,
        deleteActualUser,
        hasPermission,
        getAllowedTabs,
        getPermittedRoles: getPermittedRolesForTab,
        registeredUsers,
        refreshUsers,
        updateUserSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
