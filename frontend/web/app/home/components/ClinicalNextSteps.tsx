"use client";

import React from "react";
import {
  CLINICAL_FRAMEWORK_DISCLAIMER,
  CLINICAL_FRAMEWORK_STEPS,
  EXPLORE_FURTHER_CHIPS,
  VERUM_SUGGESTION_CHIP_INNER,
} from "../lib/clinicalNextStepsDemo";

interface ClinicalNextStepsProps {
  onExploreChip: (question: string) => void;
  disabled?: boolean;
}

export function ClinicalNextSteps({ onExploreChip, disabled }: ClinicalNextStepsProps) {
  return (
    <div className="w-full min-w-0">
      <div className="mb-6 w-full border-t border-border/40" aria-hidden />

      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Clinical framework
      </div>
      <div className="rounded-[6px] border border-border/35 border-l-[3px] border-l-[#4DB8A4] bg-white/90 p-4 dark:border-border/40 dark:bg-gray-950/50">
        <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-4 max-sm:grid-cols-1 max-sm:gap-y-3">
          {CLINICAL_FRAMEWORK_STEPS.map((row) => (
            <React.Fragment key={row.label}>
              <div className="text-xs font-normal text-muted-foreground max-sm:font-medium">{row.label}</div>
              <div className="min-w-0 text-sm leading-relaxed text-foreground/90">{row.text}</div>
            </React.Fragment>
          ))}
        </div>
        <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">{CLINICAL_FRAMEWORK_DISCLAIMER}</p>
      </div>

      <div className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Explore further
      </div>
      <div className="flex flex-wrap gap-2">
        {EXPLORE_FURTHER_CHIPS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onExploreChip(q)}
            className={`min-w-0 flex-1 basis-[min(100%,18rem)] text-left ${VERUM_SUGGESTION_CHIP_INNER} disabled:pointer-events-none disabled:opacity-50`}
          >
            <span className="whitespace-normal">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
