import type { Source } from "./types";

/** Suggested starter questions (empty = none on home) */
export const SUGGESTED_CHIPS: string[] = [];

/** The five demo questions (exact match required) */
export const DEMO_QUESTIONS = [
  "What does current literature say about corticosteroid use in feline asthma vs. chronic bronchitis?",
  "What are evidence-based first-line diagnostics for a dog presenting with acute vestibular syndrome?",
  "What does the literature support for pain management protocols in cats post-orthopedic surgery?",
  "What is the current consensus on empirical antibiotic selection for canine UTI before culture results?",
  "What are the recommended monitoring parameters for a dog on long-term phenobarbital?",
] as const;

export const NO_RESULTS_MESSAGE =
  "No results found for this query in the current demo environment. Please select one of the suggested questions above.";

export type DemoPayload = {
  content: string;
  sources: Source[];
  sections?: Array<{ title: string; body: string }>;
  followUp?: string;
};

/**
 * Normalize for demo lookup: case, whitespace, NBSP, hyphens (post-operative → post operative),
 * and trailing ?/. ! so typed questions match record keys.
 */
function normKey(q: string) {
  let s = q.trim().replace(/\u00a0/g, " ");
  s = s.toLowerCase();
  s = s.replace(/-/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/[?.!]+$/g, "").trim();
  return s;
}

/** Plain text for summaries / history when `sections` are used */
export function demoPlainBody(r: Pick<DemoPayload, "content" | "sections">): string {
  if (r.sections?.length) {
    return r.sections.map((s) => s.body).join("\n\n");
  }
  return r.content;
}

const DEMO_RESPONSES: Record<string, DemoPayload> = {
  "What does current literature say about post operative pain management in dogs after orthopedic surgery": {
    content:
      "Structured demo response for canine post-operative orthopedic pain (multimodal analgesia, opioids, NSAIDs, regional techniques).",
    sections: [
      {
        title: "Multimodal analgesia",
        body:
          "Published literature consistently supports a multimodal approach to post-operative pain management in dogs following orthopedic procedures. [1] Combining drug classes with different mechanisms of action reduces overall opioid requirements and improves analgesia quality. [2]",
      },
      {
        title: "Opioid protocols",
        body:
          "Opioids such as fentanyl or hydromorphone are recommended for initial post-operative pain control due to their rapid onset and titratability. [2] Full mu-agonists are preferred in the immediate post-operative period, with dosing guided by pain scoring. [1]",
      },
      {
        title: "NSAIDs and transition",
        body:
          "Transition to NSAIDs such as carprofen or meloxicam is recommended once hemostasis is confirmed and the patient is hemodynamically stable. [1] NSAIDs provide sustained analgesia for the inflammatory component of orthopedic pain and are appropriate for multi-day outpatient use. [2]",
      },
      {
        title: "Regional and local techniques",
        body:
          "Local and regional blocks including epidurals and peripheral nerve blocks reduce systemic opioid requirements when applicable. [3] Evidence supports individual assessment of pain using validated scoring tools with titration of therapy to effect. [2]",
      },
    ],
    followUp:
      "Would you like to go deeper on opioid-sparing strategies for a specific orthopedic procedure (e.g. TPLO or fracture repair), or walk through a practical inpatient pain-scoring and reassessment cadence for dogs in the first 48 hours after surgery?",
    sources: [
      {
        journal: "Veterinary Surgery",
        title: "Multimodal analgesia in small animal orthopedic surgery",
        year: 2022,
        url: "#",
        logoSrc: "/wiley-logo.png",
        chipLabel: "Vet Surgery",
      },
      {
        journal: "JAVMA",
        title: "AAHA/AAFP Pain Management Guidelines",
        year: 2020,
        url: "#",
        logoSrc: "/avma-logo.png",
        chipLabel: "JAVMA",
      },
      {
        journal: "Vet Clin North Am",
        title: "Postoperative pain management in dogs",
        year: 2019,
        url: "#",
        logoSrc: "/elsevier-logo.png",
        chipLabel: "Vet Clin…",
      },
    ],
  },
  "What pain scoring tools are validated for post-orthopedic dogs?": {
    content:
      "Published reviews describe Glasgow Composite Measure Pain Scale (CMPS-SF), Colorado State University Canine Acute Pain Scale, and numeric rating scales as commonly used in research and practice for acute post-operative pain in dogs [1]. Validation studies vary by context; composite scales that combine observation with manipulation are often favored for orthopedic recovery.\n\nWould you like a side-by-side comparison of inter-rater reliability across these tools, or guidance on how often to score in the first 24 hours post-op?",
    sources: [
      {
        journal: "JAVMA",
        title: "Assessment of acute pain in dogs: scoring instruments in clinical use",
        year: 2019,
        url: "#",
        logoSrc: "/avma-logo.png",
        chipLabel: "JAVMA",
      },
    ],
  },
  "Are there contraindications to NSAIDs in the immediate post-op period?": {
    content:
      "Literature emphasizes delaying NSAIDs until adequate perfusion and hemostasis are documented; hypotension, uncontrolled hemorrhage, and marked renal or GI risk are commonly cited relative contraindications in the immediate perioperative window [1]. Individual risk–benefit assessment is recommended when inflammatory pain control must be balanced with perfusion and coagulation status.\n\nWould you like to review evidence on timing of first NSAID dose after orthopedic surgery, or drug-specific considerations for meloxicam versus carprofen in the early post-op phase?",
    sources: [
      {
        journal: "Vet Clin North Am",
        title: "NSAID use in the perioperative small animal patient",
        year: 2018,
        url: "#",
        logoSrc: "/elsevier-logo.png",
        chipLabel: "Vet Clin…",
      },
    ],
  },
  "What does current literature say about corticosteroid use in feline asthma vs. chronic bronchitis?": {
    content:
      "Published literature supports corticosteroids as the cornerstone of long-term management in both feline asthma and chronic bronchitis, though the underlying inflammatory mechanisms differ [1]. Asthma is characterized by eosinophilic airway inflammation and bronchospasm, while chronic bronchitis involves neutrophilic inflammation and irreversible airway remodeling [1]. Prednisolone (1-2 mg/kg PO q24h, tapered to lowest effective dose) is recommended for both conditions [1]. Inhaled fluticasone is supported as a maintenance alternative to reduce systemic adverse effects in long-term cases [2,3].\n\nWould you like to explore inhaled versus systemic corticosteroid protocols in more detail, or review monitoring recommendations for long-term steroid use in cats?",
    sources: [
      {
        journal: "Veterinary Clinics of North America: Small Animal Practice",
        title: "Padrid, P. Feline asthma: diagnosis and treatment",
        year: 2000,
        url: "#",
      },
      {
        journal: "Journal of Small Animal Practice",
        title: "Bexfield, N.H. et al. Management of 13 cases of canine respiratory disease using inhaled corticosteroids",
        year: 2006,
        url: "#",
      },
      {
        journal: "The Veterinary Journal",
        title: "Reinero, C.R. Advances in the understanding of pathogenesis, and diagnostics and therapeutics for feline allergic asthma",
        year: 2011,
        url: "#",
      },
    ],
  },
  "What are evidence-based first-line diagnostics for a dog presenting with acute vestibular syndrome?": {
    content:
      "Current literature recommends a structured diagnostic approach to differentiate peripheral from central vestibular disease [1]. Peripheral causes including otitis media/interna and idiopathic vestibular syndrome are more common and generally carry a better prognosis [1,2]. Initial workup should include otoscopic examination, complete neurological assessment, CBC/chemistry panel, and thoracic radiographs [1]. MRI of the brain and inner ear is indicated when central disease is suspected based on presence of vertical nystagmus, ipsilateral postural reaction deficits, or cranial nerve abnormalities beyond CN VIII [1,3].\n\nWould you like to review the clinical criteria for distinguishing central from peripheral vestibular disease, or explore MRI findings commonly associated with central lesions?",
    sources: [
      {
        journal: "Veterinary Clinics of North America: Small Animal Practice",
        title: "Rossmeisl, J.H. Vestibular disease in dogs and cats",
        year: 2010,
        url: "#",
      },
      {
        journal: "In Practice",
        title: "Garosi, L.S. Vestibular disease in the dog and cat",
        year: 2004,
        url: "#",
      },
      {
        journal: "Veterinary Medicine",
        title: "Kent, M. The neurological examination of the recumbent patient",
        year: 2004,
        url: "#",
      },
    ],
  },
  "What does the literature support for pain management protocols in cats post-orthopedic surgery?": {
    content:
      "Published literature emphasizes multimodal analgesia as the standard of care for post-operative pain in cats following orthopedic procedures [1]. Opioids (buprenorphine 0.01-0.02 mg/kg IV/IM q6-8h) are recommended as the primary perioperative analgesic given feline-specific pharmacokinetics [2,3]. NSAIDs (meloxicam 0.05 mg/kg PO q24h after an initial dose) are supported for short-term post-operative use in cats without renal compromise [1]. Locoregional anesthesia including nerve blocks and incisional blocks is increasingly supported as an adjunct to reduce systemic analgesic requirements [2].\n\nWould you like to review species-specific opioid dosing considerations in cats, or explore locoregional anesthesia techniques for orthopedic procedures?",
    sources: [
      {
        journal: "Veterinary Clinics of North America: Small Animal Practice",
        title: "Lamont, L.A. Feline perioperative pain management",
        year: 2002,
        url: "#",
      },
      {
        journal: "Journal of Feline Medicine and Surgery",
        title: "Bortolami, E., Love, E.J. Practical use of opioids in cats: a state-of-the-art",
        year: 2015,
        url: "#",
      },
      {
        journal: "Journal of Veterinary Internal Medicine",
        title: "Steagall, P.V. et al. A review of the studies using buprenorphine in cats",
        year: 2017,
        url: "#",
      },
    ],
  },
  "What is the current consensus on empirical antibiotic selection for canine UTI before culture results?": {
    content:
      "Current guidelines recommend that uncomplicated lower urinary tract infections in dogs may be treated empirically, though culture and sensitivity remain the gold standard [1]. Amoxicillin (11-15 mg/kg PO q8h for 3-5 days) is supported as a first-line empirical choice for uncomplicated cases given its narrow spectrum and efficacy against common uropathogens including E. coli and Staphylococcus spp [1]. Fluoroquinolones and third-generation cephalosporins should be reserved for culture-confirmed resistant cases to preserve antimicrobial stewardship [1,2].\n\nWould you like to review ISCAID criteria for distinguishing uncomplicated from complicated UTIs, or explore culture-guided antibiotic selection for resistant uropathogens?",
    sources: [
      {
        journal: "The Veterinary Journal",
        title: "Weese, J.S. et al. ISCAID guidelines for the diagnosis and management of bacterial urinary tract infections in dogs and cats",
        year: 2019,
        url: "#",
      },
      {
        journal: "Journal of Feline Medicine and Surgery",
        title: "Litster, A. et al. Prevalence of bacterial species in cats with clinical signs of lower urinary tract disease",
        year: 2007,
        url: "#",
      },
      {
        journal: "Infectious Disease of the Dog and Cat",
        title: "Barsanti, J.A. Genitourinary infections",
        year: 2006,
        url: "#",
      },
    ],
  },
  "What are the recommended monitoring parameters for a dog on long-term phenobarbital?": {
    content:
      "Published literature supports monitoring serum phenobarbital concentrations, CBC, and hepatic function panels at regular intervals in dogs receiving long-term phenobarbital therapy [1]. Therapeutic serum concentrations are generally cited as 20-40 mcg/mL [1]. Baseline bloodwork should be obtained prior to initiating therapy, with repeat panels at 6 months and every 6-12 months thereafter [1,2]. Elevations in ALT, ALP, and bile acids are common and expected but should be trended [2,3]. Phenobarbital-induced hepatotoxicity is a recognized complication with chronic use [2,3].\n\nWould you like to review alternative antiepileptic options for dogs with phenobarbital-induced hepatotoxicity, or explore monitoring protocols for potassium bromide as an adjunct therapy?",
    sources: [
      {
        journal: "Journal of Veterinary Internal Medicine",
        title: "Podell, M. et al. 2015 ACVIM Small Animal Consensus Statement on Seizure Management in Dogs",
        year: 2016,
        url: "#",
      },
      {
        journal: "Journal of the American Veterinary Medical Association",
        title: "Dayrell-Hart, B. et al. Hepatotoxicity of phenobarbital in dogs: 18 cases",
        year: 1991,
        url: "#",
      },
      {
        journal: "Journal of Veterinary Internal Medicine",
        title: "Müller, P.B. et al. Effects of long-term phenobarbital treatment on the liver in dogs",
        year: 2000,
        url: "#",
      },
    ],
  },
};

const DEMO_BY_NORM = (() => {
  const m = new Map<string, DemoPayload>();
  for (const [k, v] of Object.entries(DEMO_RESPONSES)) {
    m.set(normKey(k), v);
  }
  return m;
})();

export function getDemoResponse(question: string): DemoPayload {
  const match = DEMO_BY_NORM.get(normKey(question));
  if (match) return match;
  return {
    content: NO_RESULTS_MESSAGE,
    sources: [],
  };
}
