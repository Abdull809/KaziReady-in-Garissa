import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { dataService, RegisterPayload } from '@/src/services/dataService';
import { Profile } from '@/src/types';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Profile>;
  loginDemoQuick: (userId: string) => Promise<Profile>;
  register: (payload: RegisterPayload) => Promise<Profile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<Profile>) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await dataService.getCurrentUserProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await dataService.login(email, password);
    setUser(profile);
    return profile;
  }, []);

  const loginDemoQuick = useCallback(async (userId: string) => {
    const profile = await dataService.loginDemoQuick(userId);
    setUser(profile);
    return profile;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const profile = await dataService.register(payload);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await dataService.logout();
    setUser(null);
  }, []);

  const updateUserProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) throw new Error('You must be signed in to update your profile.');
      const updated = await dataService.updateProfile(user.id, updates);
      setUser(updated);
      return updated;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginDemoQuick,
        register,
        logout,
        refreshUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return ctx;
}
