"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { HistoryEntry, VerumFile, Profile } from "../lib/types";
import { getDemoSeed } from "../lib/demoSeed";

const STORAGE_KEY = "verum-mockup-state";

const defaultProfile: Profile = {
  email: "vet@example.com",
  name: "Dr. Smith",
  phone: "(555) 123-4567",
  avatarUrl: null,
};

function loadState(): { history: HistoryEntry[]; files: VerumFile[]; profile: Profile } {
  if (typeof window === "undefined") {
    return { history: [], files: [], profile: defaultProfile };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const { history, files } = getDemoSeed();
      return { history, files, profile: defaultProfile };
    }
    const parsed = JSON.parse(raw);
    return {
      history: parsed.history ?? [],
      files: parsed.files ?? [],
      profile: { ...defaultProfile, ...parsed.profile },
    };
  } catch {
    return { history: [], files: [], profile: defaultProfile };
  }
}

function saveState(history: HistoryEntry[], files: VerumFile[], profile: Profile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ history, files, profile }));
  } catch {}
}

interface VerumContextValue {
  history: HistoryEntry[];
  files: VerumFile[];
  profile: Profile;
  addHistoryEntry: (entry: Omit<HistoryEntry, "id">) => HistoryEntry;
  deleteHistoryEntry: (id: string) => void;
  getHistoryEntry: (id: string) => HistoryEntry | undefined;
  addFile: (file: Omit<VerumFile, "id" | "order" | "pinned" | "pinnedAt">) => VerumFile;
  updateFile: (id: string, updates: Partial<VerumFile>) => void;
  deleteFile: (id: string) => void;
  reorderFiles: (pinnedIds: string[], unpinnedIds: string[]) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  clearAll: () => void;
  resetToDemo: () => void;
}

const VerumContext = createContext<VerumContextValue | null>(null);

export function VerumProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [files, setFiles] = useState<VerumFile[]>([]);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const { history: h, files: f, profile: p } = loadState();
    setHistory(h);
    setFiles(f);
    setProfile(p);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(history, files, profile);
  }, [hydrated, history, files, profile]);

  const addHistoryEntry = useCallback((entry: Omit<HistoryEntry, "id">) => {
    const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newEntry: HistoryEntry = { ...entry, id };
    setHistory((prev) => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const deleteHistoryEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
    setFiles((prev) =>
      prev.map((f) => ({ ...f, questionIds: f.questionIds.filter((q) => q !== id) }))
    );
  }, []);

  const getHistoryEntry = useCallback(
    (id: string) => history.find((e) => e.id === id),
    [history]
  );

  const addFile = useCallback(
    (file: Omit<VerumFile, "id" | "order" | "pinned" | "pinnedAt">) => {
      const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const maxOrder = files.reduce((m, f) => Math.max(m, f.order), -1);
      const newFile: VerumFile = {
        ...file,
        id,
        order: maxOrder + 1,
        pinned: false,
        pinnedAt: null,
      };
      setFiles((prev) => [...prev, newFile]);
      return newFile;
    },
    [files]
  );

  const updateFile = useCallback((id: string, updates: Partial<VerumFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const reorderFiles = useCallback(
    (pinnedIds: string[], unpinnedIds: string[]) => {
      setFiles((prev) => {
        const byId = new Map(prev.map((f) => [f.id, f]));
        const pinned: VerumFile[] = pinnedIds
          .map((id, i) => {
            const f = byId.get(id);
            if (!f) return null;
            return {
              ...f,
              pinned: true,
              pinnedAt: f.pinnedAt ?? new Date().toISOString(),
              order: i,
            };
          })
          .filter(Boolean) as VerumFile[];
        const unpinned: VerumFile[] = unpinnedIds
          .map((id, i) => {
            const f = byId.get(id);
            if (!f) return null;
            return { ...f, pinned: false, pinnedAt: null, order: pinned.length + i };
          })
          .filter(Boolean) as VerumFile[];
        return [...pinned, ...unpinned];
      });
    },
    []
  );

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearAll = useCallback(() => {
    setHistory([]);
    setFiles([]);
    setProfile(defaultProfile);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const resetToDemo = useCallback(() => {
    const { history: h, files: f } = getDemoSeed();
    setHistory(h);
    setFiles(f);
    saveState(h, f, defaultProfile);
  }, []);

  const value: VerumContextValue = {
    history,
    files,
    profile,
    addHistoryEntry,
    deleteHistoryEntry,
    getHistoryEntry,
    addFile,
    updateFile,
    deleteFile,
    reorderFiles,
    updateProfile,
    clearAll,
    resetToDemo,
  };

  return (
    <VerumContext.Provider value={value}>{children}</VerumContext.Provider>
  );
}

export function useVerum() {
  const ctx = useContext(VerumContext);
  if (!ctx) throw new Error("useVerum must be used within VerumProvider");
  return ctx;
}
