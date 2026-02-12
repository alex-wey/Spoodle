export interface Source {
  journal: string;
  title: string;
  year: number;
  url: string;
}

export interface HistoryEntry {
  id: string;
  question: string;
  summary: string;
  date: string; // ISO
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    sources?: Source[];
  }>;
}

export interface VerumFile {
  id: string;
  name: string;
  iconUrl: string | null;
  questionIds: string[];
  pinned: boolean;
  pinnedAt: string | null; // ISO, for ordering
  order: number; // for unpinned ordering
}

export interface Profile {
  email: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
}

export interface VerumState {
  history: HistoryEntry[];
  files: VerumFile[];
  profile: Profile;
}
