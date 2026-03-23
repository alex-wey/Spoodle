export interface Source {
  journal: string;
  title: string;
  year: number;
  url: string;
  /** Public asset under `/public`, e.g. `/wiley-logo.png` */
  logoSrc?: string;
  /** Short label for citation chips; otherwise journal is truncated */
  chipLabel?: string;
}

/** Single turn in chat / history */
export interface VerumMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  /** Structured response (demo); when set, overrides flat `content` for assistant body */
  sections?: Array<{ title: string; body: string }>;
  /** Closing prompt to explore deeper or apply evidence clinically */
  followUp?: string;
}

export interface HistoryEntry {
  id: string;
  question: string;
  summary: string;
  date: string; // ISO
  messages: VerumMessage[];
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
