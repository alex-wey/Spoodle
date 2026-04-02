/** Static demo copy for the response-only “Clinical next steps” block */

export const CLINICAL_FRAMEWORK_STEPS: Array<{ label: string; text: string }> = [
  {
    label: "Perioperative",
    text: "Regional block where applicable combined with full mu-agonist opioid titrated to validated pain score.",
  },
  {
    label: "Post-op transition",
    text: "Once hemostasis confirmed and patient stable, introduce NSAID (carprofen or meloxicam) and taper opioid based on pain scoring.",
  },
  {
    label: "Ongoing",
    text: "Reassess with validated pain scoring tool at each monitoring interval. Adjust therapy to effect.",
  },
];

export const CLINICAL_FRAMEWORK_DISCLAIMER =
  "This framework is derived from the literature above. Clinical application should account for patient-specific factors.";

export const EXPLORE_FURTHER_CHIPS = [
  "What pain scoring tools are validated for post-orthopedic dogs?",
  "Are there contraindications to NSAIDs in the immediate post-op period?",
] as const;

/** Matches home suggested chips: border, background, hover, font size, shadow */
export const VERUM_SUGGESTION_CHIP_INNER =
  "rounded-lg border bg-white/80 px-3 py-2.5 text-sm shadow-sm transition-colors hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-800";
