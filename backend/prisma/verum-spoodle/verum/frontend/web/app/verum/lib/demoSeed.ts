import type { HistoryEntry, VerumFile } from "./types";
import { FILE_ICONS } from "./fileIcons";
import { getDemoResponse } from "./demoContent";

export function getDemoSeed(): { history: HistoryEntry[]; files: VerumFile[] } {
  const q1: HistoryEntry = {
    id: "demo-q-1",
    question:
      "What does current literature say about post operative pain management in dogs after orthopedic surgery",
    summary:
      "Published literature consistently supports a multimodal approach to post-operative pain management in dogs following orthopedic procedures [1]...",
    date: "2026-03-17T14:30:00Z",
    messages: (() => {
      const r = getDemoResponse(
        "What does current literature say about post operative pain management in dogs after orthopedic surgery"
      );
      return [
        {
          role: "user" as const,
          content:
            "What does current literature say about post operative pain management in dogs after orthopedic surgery",
        },
        {
          role: "assistant" as const,
          content: r.content,
          sources: r.sources,
          ...(r.sections ? { sections: r.sections } : {}),
          ...(r.followUp ? { followUp: r.followUp } : {}),
        },
      ];
    })(),
  };
  const q2: HistoryEntry = {
    id: "demo-q-2",
    question: "What is the current consensus on empirical antibiotic selection for canine UTI before culture results?",
    summary:
      "Current guidelines recommend that uncomplicated lower urinary tract infections in dogs may be treated empirically, though culture and sensitivity remain the gold standard [1]...",
    date: "2026-03-16T10:15:00Z",
    messages: (() => {
      const r = getDemoResponse(
        "What is the current consensus on empirical antibiotic selection for canine UTI before culture results?"
      );
      return [
        {
          role: "user" as const,
          content:
            "What is the current consensus on empirical antibiotic selection for canine UTI before culture results?",
        },
        { role: "assistant" as const, content: r.content, sources: r.sources },
      ];
    })(),
  };
  const q3: HistoryEntry = {
    id: "demo-q-3",
    question: "What are the recommended monitoring parameters for a dog on long-term phenobarbital?",
    summary:
      "Published literature supports monitoring serum phenobarbital concentrations, CBC, and hepatic function panels at regular intervals in dogs receiving long-term phenobarbital therapy [1]...",
    date: "2026-03-15T16:45:00Z",
    messages: (() => {
      const r = getDemoResponse(
        "What are the recommended monitoring parameters for a dog on long-term phenobarbital?"
      );
      return [
        {
          role: "user" as const,
          content: "What are the recommended monitoring parameters for a dog on long-term phenobarbital?",
        },
        { role: "assistant" as const, content: r.content, sources: r.sources },
      ];
    })(),
  };
  const q4: HistoryEntry = {
    id: "demo-q-4",
    question: "What does current literature say about corticosteroid use in feline asthma vs. chronic bronchitis?",
    summary:
      "Published literature supports corticosteroids as the cornerstone of long-term management in both feline asthma and chronic bronchitis, though the underlying inflammatory mechanisms differ [1]...",
    date: "2026-03-01T09:00:00Z",
    messages: (() => {
      const r = getDemoResponse(
        "What does current literature say about corticosteroid use in feline asthma vs. chronic bronchitis?"
      );
      return [
        {
          role: "user" as const,
          content:
            "What does current literature say about corticosteroid use in feline asthma vs. chronic bronchitis?",
        },
        { role: "assistant" as const, content: r.content, sources: r.sources },
      ];
    })(),
  };
  const q5: HistoryEntry = {
    id: "demo-q-5",
    question: "What are evidence-based first-line diagnostics for a dog presenting with acute vestibular syndrome?",
    summary:
      "Current literature recommends a structured diagnostic approach to differentiate peripheral from central vestibular disease [1]...",
    date: "2026-02-09T11:30:00Z",
    messages: (() => {
      const r = getDemoResponse(
        "What are evidence-based first-line diagnostics for a dog presenting with acute vestibular syndrome?"
      );
      return [
        {
          role: "user" as const,
          content:
            "What are evidence-based first-line diagnostics for a dog presenting with acute vestibular syndrome?",
        },
        { role: "assistant" as const, content: r.content, sources: r.sources },
      ];
    })(),
  };

  const history = [q1, q2, q3, q4, q5];

  const f1: VerumFile = {
    id: "demo-f-1",
    name: "Pain Management",
    iconUrl: FILE_ICONS.painManagement,
    questionIds: [q1.id],
    pinned: true,
    pinnedAt: "2026-03-17T15:00:00Z",
    order: 0,
  };
  const f2: VerumFile = {
    id: "demo-f-2",
    name: "Feline Endocrine",
    iconUrl: FILE_ICONS.felineEndocrine,
    questionIds: [q4.id],
    pinned: true,
    pinnedAt: "2026-03-01T11:00:00Z",
    order: 1,
  };
  const f3: VerumFile = {
    id: "demo-f-3",
    name: "NSAID Safety",
    iconUrl: FILE_ICONS.nsaidSafety,
    questionIds: [q2.id],
    pinned: false,
    pinnedAt: null,
    order: 2,
  };
  const f4: VerumFile = {
    id: "demo-f-4",
    name: "Renal Guidelines",
    iconUrl: FILE_ICONS.renalGuidelines,
    questionIds: [q3.id],
    pinned: false,
    pinnedAt: null,
    order: 3,
  };
  const f5: VerumFile = {
    id: "demo-f-5",
    name: "Critical Care",
    iconUrl: FILE_ICONS.criticalCare,
    questionIds: [q5.id, q1.id],
    pinned: false,
    pinnedAt: null,
    order: 4,
  };

  const files = [f1, f2, f3, f4, f5];

  return { history, files };
}
