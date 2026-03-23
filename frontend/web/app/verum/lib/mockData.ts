import type { Source, VerumMessage } from "./types";

export type { Source };
export type Message = VerumMessage;

export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
  messages: Message[];
}

export const SUGGESTED_QUESTIONS = [
  "What does current literature say about post operative pain management in dogs after orthopedic surgery",
  "What are typical monitoring recommendations for feline hyperthyroidism after starting methimazole",
  "What does the evidence suggest about fluid therapy approaches in canine pancreatitis",
  "What are common adverse effects reported for carprofen and how frequently do they occur",
  "What guidelines exist for staging and monitoring chronic kidney disease in cats",
  "How do consensus statements define sepsis in small animals",
  "What does the literature report on antibiotic selection for canine pyoderma",
  "What are recommended protocols for vaccination in adult cats with unknown history",
];

const MOCK_RESPONSES: Array<{
  keywords: string[];
  content: string;
  sources: Source[];
}> = [
  {
    keywords: ["pain", "orthopedic", "surgery", "dog"],
    content:
      "Published literature emphasizes multimodal analgesia for post-operative pain in dogs following orthopedic procedures [1]. Opioids such as fentanyl or hydromorphone are commonly used initially [2], with transition to NSAIDs like carprofen or meloxicam once hemostasis is achieved [1]. Local/regional blocks (e.g., epidural, peripheral nerve blocks) when applicable may reduce systemic opioid requirements [3]. Evidence suggests individual assessment of pain and titration of therapy is important [2].",
    sources: [
      { journal: "Veterinary Surgery", title: "Multimodal analgesia in small animal orthopedic surgery", year: 2022, url: "#" },
      { journal: "JAVMA", title: "AAHA/AAFP Pain Management Guidelines", year: 2020, url: "#" },
      { journal: "Vet Clin North Am", title: "Postoperative pain management in dogs", year: 2019, url: "#" },
    ],
  },
  {
    keywords: ["hyperthyroid", "methimazole", "monitoring", "feline", "cat"],
    content:
      "Guidelines generally recommend monitoring serum T4 at 2–4 weeks after initiating methimazole, then at 4–6 week intervals until stable [1]. CBC and chemistry panels are suggested before treatment and at regular intervals to screen for hematologic or hepatic adverse effects [2]. Blood pressure assessment is often recommended given the cardiovascular effects of hyperthyroidism [1].",
    sources: [
      { journal: "J Feline Med Surg", title: "ACVIM consensus statement on feline hyperthyroidism", year: 2023, url: "#" },
      { journal: "JAVMA", title: "Methimazole use and monitoring in cats", year: 2021, url: "#" },
    ],
  },
  {
    keywords: ["fluid", "pancreatitis", "canine"],
    content:
      "Evidence suggests balanced crystalloids (e.g., lactated Ringer's, Plasmalyte) are commonly used [1]. Aggressive fluid resuscitation to restore perfusion, followed by maintenance with ongoing assessment of electrolytes and hydration, is a standard approach [2]. Colloid use remains debated; crystalloid-first strategies are widely described [1,3]. Close monitoring of volume status and response is emphasized [2].",
    sources: [
      { journal: "J Vet Emerg Crit Care", title: "Fluid therapy in acute pancreatitis", year: 2022, url: "#" },
      { journal: "Vet Clin North Am", title: "Canine acute pancreatitis: current concepts", year: 2021, url: "#" },
      { journal: "ACVECC", title: "Fluid resuscitation guidelines for small animals", year: 2020, url: "#" },
    ],
  },
  {
    keywords: ["carprofen", "adverse", "effects", "side"],
    content:
      "Carprofen is an NSAID; reported adverse effects include gastrointestinal signs (vomiting, anorexia, melena), hepatopathy, and renal effects [1]. Published studies suggest GI adverse events in a minority of patients; frequency varies by study design and population [2]. Hepatotoxicity is uncommon but well-documented [1]. Renal effects may be of concern in hypovolemic or compromised patients [3]. Product labeling and published reviews provide further detail on incidence.",
    sources: [
      { journal: "JAVMA", title: "NSAID safety in dogs: a systematic review", year: 2021, url: "#" },
      { journal: "Vet J", title: "Adverse effects of carprofen in clinical use", year: 2019, url: "#" },
      { journal: "Front Vet Sci", title: "NSAID adverse drug events in companion animals", year: 2023, url: "#" },
    ],
  },
  {
    keywords: ["kidney", "CKD", "staging", "monitoring", "cat"],
    content:
      "IRIS staging uses creatinine and SDMA to classify CKD into stages 1–4 [1]. Sub-staging by blood pressure and proteinuria is recommended [1,2]. Monitoring typically includes serial creatinine/SDMA, electrolytes, blood pressure, urinalysis, and UPC [2]. Frequency depends on stage and stability. Consensus guidelines recommend individualized plans based on patient factors [1].",
    sources: [
      { journal: "IRIS", title: "IRIS staging of CKD guidelines", year: 2023, url: "#" },
      { journal: "J Feline Med Surg", title: "Chronic kidney disease in cats: guidelines", year: 2022, url: "#" },
    ],
  },
  {
    keywords: ["sepsis", "consensus", "small animal"],
    content:
      "Consensus definitions for sepsis in small animals typically describe a dysregulated host response to infection associated with organ dysfunction [1]. Criteria may include suspected infection plus changes in vital signs, lactate, or other markers [2]. Definitions continue to evolve; multiple working groups have proposed criteria. Refer to current consensus statements for the most up-to-date diagnostic criteria [1,2].",
    sources: [
      { journal: "J Vet Emerg Crit Care", title: "RECOVER sepsis consensus in small animals", year: 2023, url: "#" },
      { journal: "ACVECC", title: "Sepsis definition and recognition in veterinary medicine", year: 2022, url: "#" },
    ],
  },
  {
    keywords: ["antibiotic", "pyoderma", "canine", "selection"],
    content:
      "Literature emphasizes culture and susceptibility when possible, especially for recurrent or deep pyoderma [1]. First-line empirical choices often include beta-lactams or cephalosporins with narrow spectra [2]. Avoidance of fluoroquinolones as first-line for routine superficial pyoderma is commonly recommended [1]. Duration and topical therapy may vary by case. Guidelines stress antimicrobial stewardship [2].",
    sources: [
      { journal: "Vet Dermatol", title: "Antimicrobial use in canine pyoderma", year: 2022, url: "#" },
      { journal: "JAVMA", title: "Guidelines for antimicrobial use in companion animals", year: 2021, url: "#" },
    ],
  },
  {
    keywords: ["vaccination", "protocol", "adult", "cat", "unknown"],
    content:
      "For adult cats with unknown vaccination history, guidelines generally recommend a full primary series as for an unvaccinated adult [1]. Core vaccines (e.g., panleukopenia, herpesvirus, calicivirus, rabies) are typically administered according to label; a booster may be given 3–4 weeks after the first dose [2]. Lifestyle and exposure risk guide non-core vaccine decisions [1].",
    sources: [
      { journal: "AAFP", title: "Feline vaccination guidelines", year: 2023, url: "#" },
      { journal: "J Feline Med Surg", title: "Adult cat vaccination recommendations", year: 2022, url: "#" },
    ],
  },
];

function findBestResponse(question: string): { content: string; sources: Source[] } {
  const lower = question.toLowerCase();
  let best = MOCK_RESPONSES[0];
  let maxScore = 0;
  for (const r of MOCK_RESPONSES) {
    let score = 0;
    for (const kw of r.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      best = r;
    }
  }
  return { content: best.content, sources: best.sources };
}

export function getMockedResponse(question: string): { content: string; sources: Source[] } {
  return findBestResponse(question);
}

export const CONVERSATION_HISTORY: Conversation[] = [
  {
    id: "conv-1",
    title: "Post-op pain management",
    timestamp: "2024-01-10T14:30:00Z",
    preview: "What does current literature say about post operative pain...",
    messages: [
      {
        role: "user",
        content: "What does current literature say about post operative pain management in dogs after orthopedic surgery",
      },
      {
        role: "assistant",
        content:
          "Published literature emphasizes multimodal analgesia for post-operative pain in dogs following orthopedic procedures. Opioids such as fentanyl or hydromorphone are commonly used initially, with transition to NSAIDs like carprofen or meloxicam once hemostasis is achieved.",
        sources: [
          { journal: "Veterinary Surgery", title: "Multimodal analgesia in small animal orthopedic surgery", year: 2022, url: "#" },
          { journal: "JAVMA", title: "AAHA/AAFP Pain Management Guidelines", year: 2020, url: "#" },
        ],
      },
    ],
  },
  {
    id: "conv-2",
    title: "Feline hyperthyroidism monitoring",
    timestamp: "2024-01-09T10:15:00Z",
    preview: "What are typical monitoring recommendations for feline...",
    messages: [
      {
        role: "user",
        content: "What are typical monitoring recommendations for feline hyperthyroidism after starting methimazole",
      },
      {
        role: "assistant",
        content:
          "Guidelines generally recommend monitoring serum T4 at 2–4 weeks after initiating methimazole, then at 4–6 week intervals until stable. CBC and chemistry panels are suggested before treatment and at regular intervals.",
        sources: [
          { journal: "J Feline Med Surg", title: "ACVIM consensus statement on feline hyperthyroidism", year: 2023, url: "#" },
          { journal: "JAVMA", title: "Methimazole use and monitoring in cats", year: 2021, url: "#" },
        ],
      },
    ],
  },
  {
    id: "conv-3",
    title: "Carprofen adverse effects",
    timestamp: "2024-01-08T16:45:00Z",
    preview: "What are common adverse effects reported for carprofen...",
    messages: [
      {
        role: "user",
        content: "What are common adverse effects reported for carprofen and how frequently do they occur",
      },
      {
        role: "assistant",
        content:
          "Carprofen is an NSAID; reported adverse effects include gastrointestinal signs (vomiting, anorexia, melena), hepatopathy, and renal effects. Published studies suggest GI adverse events in a minority of patients; frequency varies by study design and population.",
        sources: [
          { journal: "JAVMA", title: "NSAID safety in dogs: a systematic review", year: 2021, url: "#" },
          { journal: "Vet J", title: "Adverse effects of carprofen in clinical use", year: 2019, url: "#" },
          { journal: "Front Vet Sci", title: "NSAID adverse drug events in companion animals", year: 2023, url: "#" },
        ],
      },
    ],
  },
  {
    id: "conv-4",
    title: "CKD staging in cats",
    timestamp: "2024-01-07T09:00:00Z",
    preview: "What guidelines exist for staging and monitoring chronic...",
    messages: [
      {
        role: "user",
        content: "What guidelines exist for staging and monitoring chronic kidney disease in cats",
      },
      {
        role: "assistant",
        content:
          "IRIS staging uses creatinine and SDMA to classify CKD into stages 1–4. Sub-staging by blood pressure and proteinuria is recommended. Monitoring typically includes serial creatinine/SDMA, electrolytes, blood pressure, urinalysis, and UPC.",
        sources: [
          { journal: "IRIS", title: "IRIS staging of CKD guidelines", year: 2023, url: "#" },
          { journal: "J Feline Med Surg", title: "Chronic kidney disease in cats: guidelines", year: 2022, url: "#" },
        ],
      },
    ],
  },
  {
    id: "conv-5",
    title: "Sepsis definition in small animals",
    timestamp: "2024-01-06T11:30:00Z",
    preview: "How do consensus statements define sepsis in small animals",
    messages: [
      {
        role: "user",
        content: "How do consensus statements define sepsis in small animals",
      },
      {
        role: "assistant",
        content:
          "Consensus definitions for sepsis in small animals typically describe a dysregulated host response to infection associated with organ dysfunction. Criteria may include suspected infection plus changes in vital signs, lactate, or other markers.",
        sources: [
          { journal: "J Vet Emerg Crit Care", title: "RECOVER sepsis consensus in small animals", year: 2023, url: "#" },
          { journal: "ACVECC", title: "Sepsis definition and recognition in veterinary medicine", year: 2022, url: "#" },
        ],
      },
    ],
  },
];
