import type { HistoryEntry, VerumFile } from "./types";

export function getDemoSeed(): { history: HistoryEntry[]; files: VerumFile[] } {
  const q1: HistoryEntry = {
    id: "demo-q-1",
    question: "What does current literature say about post operative pain management in dogs after orthopedic surgery",
    summary: "Published literature emphasizes multimodal analgesia for post-operative pain in dogs following orthopedic procedures. Opioids such as fentanyl or hydromorphone are commonly used initially...",
    date: "2024-02-10T14:30:00Z",
    messages: [
      { role: "user", content: "What does current literature say about post operative pain management in dogs after orthopedic surgery" },
      { role: "assistant", content: "Published literature emphasizes multimodal analgesia...", sources: [] },
    ],
  };
  const q2: HistoryEntry = {
    id: "demo-q-2",
    question: "What are typical monitoring recommendations for feline hyperthyroidism after starting methimazole",
    summary: "Guidelines generally recommend monitoring serum T4 at 2–4 weeks after initiating methimazole, then at 4–6 week intervals until stable. CBC and chemistry panels are suggested...",
    date: "2024-02-09T10:15:00Z",
    messages: [
      { role: "user", content: "What are typical monitoring recommendations for feline hyperthyroidism after starting methimazole" },
      { role: "assistant", content: "Guidelines generally recommend monitoring serum T4...", sources: [] },
    ],
  };
  const q3: HistoryEntry = {
    id: "demo-q-3",
    question: "What are common adverse effects reported for carprofen and how frequently do they occur",
    summary: "Carprofen is an NSAID; reported adverse effects include gastrointestinal signs (vomiting, anorexia, melena), hepatopathy, and renal effects. Published studies suggest GI adverse events in a minority of patients...",
    date: "2024-02-08T16:45:00Z",
    messages: [
      { role: "user", content: "What are common adverse effects reported for carprofen and how frequently do they occur" },
      { role: "assistant", content: "Carprofen is an NSAID; reported adverse effects include...", sources: [] },
    ],
  };
  const q4: HistoryEntry = {
    id: "demo-q-4",
    question: "What guidelines exist for staging and monitoring chronic kidney disease in cats",
    summary: "IRIS staging uses creatinine and SDMA to classify CKD into stages 1–4. Sub-staging by blood pressure and proteinuria is recommended. Monitoring typically includes serial creatinine/SDMA...",
    date: "2024-02-07T09:00:00Z",
    messages: [
      { role: "user", content: "What guidelines exist for staging and monitoring chronic kidney disease in cats" },
      { role: "assistant", content: "IRIS staging uses creatinine and SDMA to classify CKD...", sources: [] },
    ],
  };
  const q5: HistoryEntry = {
    id: "demo-q-5",
    question: "How do consensus statements define sepsis in small animals",
    summary: "Consensus definitions for sepsis in small animals typically describe a dysregulated host response to infection associated with organ dysfunction. Criteria may include suspected infection plus changes in vital signs...",
    date: "2024-02-06T11:30:00Z",
    messages: [
      { role: "user", content: "How do consensus statements define sepsis in small animals" },
      { role: "assistant", content: "Consensus definitions for sepsis in small animals typically describe...", sources: [] },
    ],
  };

  const history = [q1, q2, q3, q4, q5];

  const f1: VerumFile = {
    id: "demo-f-1",
    name: "Pain Management",
    iconUrl: null,
    questionIds: [q1.id],
    pinned: true,
    pinnedAt: "2024-02-10T15:00:00Z",
    order: 0,
  };
  const f2: VerumFile = {
    id: "demo-f-2",
    name: "Feline Endocrine",
    iconUrl: null,
    questionIds: [q2.id],
    pinned: true,
    pinnedAt: "2024-02-09T11:00:00Z",
    order: 1,
  };
  const f3: VerumFile = {
    id: "demo-f-3",
    name: "NSAID Safety",
    iconUrl: null,
    questionIds: [q3.id],
    pinned: false,
    pinnedAt: null,
    order: 2,
  };
  const f4: VerumFile = {
    id: "demo-f-4",
    name: "Renal Guidelines",
    iconUrl: null,
    questionIds: [q4.id],
    pinned: false,
    pinnedAt: null,
    order: 3,
  };
  const f5: VerumFile = {
    id: "demo-f-5",
    name: "Critical Care",
    iconUrl: null,
    questionIds: [q5.id, q1.id],
    pinned: false,
    pinnedAt: null,
    order: 4,
  };

  const files = [f1, f2, f3, f4, f5];

  return { history, files };
}
