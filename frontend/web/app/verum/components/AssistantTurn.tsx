"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Source, VerumMessage } from "../lib/types";
import { ClinicalNextSteps } from "./ClinicalNextSteps";

const VERUM_TEAL = "#4DB8A4";

function DocFallbackIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" className="shrink-0 rounded-[3px]" aria-hidden>
      <rect width="16" height="16" rx="3" fill={VERUM_TEAL} fillOpacity={0.2} />
      <path
        d="M4.5 2.5h4.5L12 5.5v8H4.5v-11z"
        stroke={VERUM_TEAL}
        strokeWidth="1.1"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M9 2.5v3h2.5" stroke={VERUM_TEAL} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function SourceLogo({ src }: { src?: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return <DocFallbackIcon />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny inline logos + onError fallback
    <img
      src={src}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 rounded-[3px] object-cover"
      onError={() => setBroken(true)}
    />
  );
}

function chipJournalLabel(s: Source): string {
  const raw = s.chipLabel ?? s.journal;
  const max = 14;
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1)}…`;
}

type CitePart = { type: "text"; value: string } | { type: "cite"; indices: number[] };

function parseCitationParts(content: string, sourceCount: number): CitePart[] {
  const parts: CitePart[] = [];
  const regex = /\[([\d,\s]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    const indices = match[1]
      .split(",")
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n >= 1 && n <= sourceCount);
    if (indices.length > 0) {
      parts.push({ type: "cite", indices });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }
  return parts;
}

function CitationChip({
  sourceIndex,
  source,
  highlightedSource,
  setHighlightedSource,
}: {
  sourceIndex: number;
  source?: Source;
  highlightedSource: number | null;
  setHighlightedSource: (n: number | null) => void;
}) {
  if (!source) return null;
  const isRowLit = highlightedSource === sourceIndex;
  return (
    <button
      type="button"
      data-source={String(sourceIndex)}
      onPointerEnter={() => setHighlightedSource(sourceIndex)}
      className={[
        "mx-0.5 inline-flex max-w-[min(100%,12rem)] items-center gap-1 rounded-md border align-middle",
        "border-border/55 bg-muted/45 px-1 py-0.5 text-xs transition-all duration-150",
        "hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4DB8A4]/40",
        isRowLit ? "brightness-110 ring-1 ring-[#4DB8A4]/50" : "",
      ].join(" ")}
      style={{ verticalAlign: "middle" }}
    >
      <SourceLogo src={source.logoSrc} />
      <span className="min-w-0 truncate font-medium text-foreground/95">{chipJournalLabel(source)}</span>
      <span className="shrink-0 tabular-nums text-muted-foreground/85">{source.year}</span>
    </button>
  );
}

function BodyWithCitationChips({
  body,
  sources,
  highlightedSource,
  setHighlightedSource,
}: {
  body: string;
  sources: Source[];
  highlightedSource: number | null;
  setHighlightedSource: (n: number | null) => void;
}) {
  const parts = useMemo(() => parseCitationParts(body, sources.length), [body, sources.length]);

  return (
    <span className="text-sm leading-relaxed text-foreground/90">
      {parts.map((p, i) =>
        p.type === "text" ? (
          <span key={i}>{p.value}</span>
        ) : (
          <span key={i} className="inline align-middle">
            {p.indices.map((idx) => (
              <CitationChip
                key={`${i}-${idx}`}
                sourceIndex={idx}
                source={sources[idx - 1]}
                highlightedSource={highlightedSource}
                setHighlightedSource={setHighlightedSource}
              />
            ))}
          </span>
        )
      )}
    </span>
  );
}

function SourcesFooter({
  sources,
  highlightedSource,
  setHighlightedSource,
}: {
  sources: Source[];
  highlightedSource: number | null;
  setHighlightedSource: (n: number | null) => void;
}) {
  return (
    <div className="mt-6 border-t border-border/40 pt-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sources</div>
      <ul className="space-y-2">
        {sources.map((s, i) => {
          const n = i + 1;
          const lit = highlightedSource === n;
          return (
            <li key={i}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                data-source={String(n)}
                onPointerEnter={() => setHighlightedSource(n)}
                className={[
                  "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition-all duration-150",
                  lit
                    ? "z-[1] border-[#4DB8A4] bg-[#4DB8A4]/14 shadow-[inset_0_0_0_1px_rgba(77,184,164,0.35)]"
                    : "border-border/50 bg-background/40 hover:bg-muted/30",
                ].join(" ")}
              >
                <span className="mt-0.5 shrink-0 font-semibold tabular-nums text-muted-foreground">[{n}]</span>
                <SourceLogo src={s.logoSrc} />
                <span className="min-w-0 flex-1">
                  <span className="font-semibold text-foreground">{s.journal}</span>
                  <span className="text-muted-foreground"> — </span>
                  <span className="text-foreground/90">{s.title}</span>
                  <span className="text-muted-foreground"> ({s.year})</span>
                </span>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AssistantTurn({
  question,
  message,
  onExploreChip,
  exploreDisabled,
}: {
  question: string;
  message: VerumMessage;
  onExploreChip: (q: string) => void;
  exploreDisabled?: boolean;
}) {
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const setHl = useCallback((n: number | null) => setHighlightedSource(n), []);

  const sources = message.sources ?? [];
  const sections = message.sections;
  
  console.log("📚 AssistantTurn - sources:", sources);
  console.log("📚 AssistantTurn - sources.length:", sources.length);

  return (
    <div className="w-full space-y-4">
      <div
        className="w-full rounded-xl border border-sky-200/80 bg-sky-50/95 px-4 py-3 text-left shadow-sm dark:border-sky-800/45 dark:bg-sky-950/40"
        role="heading"
        aria-level={2}
      >
        <p className="text-[15px] font-medium leading-snug text-sky-950 dark:text-sky-100 break-words text-pretty">
          {question}
        </p>
      </div>

      {/* Response + sources: same tinted panel as History filter header */}
      <div
        className="w-full min-w-0 rounded-xl border border-border/60 bg-muted/45 px-4 py-5 sm:px-5 sm:py-6 dark:bg-muted/25"
        onPointerLeave={(e) => {
          const next = e.relatedTarget;
          if (next && next instanceof Node && e.currentTarget.contains(next)) return;
          setHighlightedSource(null);
        }}
      >
        {sections && sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map((sec, idx) => (
              <section key={idx} className="space-y-2">
                <h3 className="text-base font-bold tracking-tight text-foreground">{sec.title}</h3>
                <div>
                  <BodyWithCitationChips
                    body={sec.body}
                    sources={sources}
                    highlightedSource={highlightedSource}
                    setHighlightedSource={setHl}
                  />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-h3:text-[17px] prose-h3:font-bold prose-h3:mt-5 prose-h3:mb-3 prose-h3:text-foreground prose-p:text-[15px] prose-p:leading-relaxed prose-li:text-[15px] prose-strong:font-bold prose-strong:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {message.followUp ? (
          <div className="mt-8 border-t border-dashed border-border/50 pt-5">
            <p className="text-sm font-medium leading-relaxed text-foreground/90">{message.followUp}</p>
          </div>
        ) : null}

        {/* Demo component removed - using real RAG responses now */}
        {/* <ClinicalNextSteps onExploreChip={onExploreChip} disabled={exploreDisabled} /> */}

        {sources.length > 0 && (
          <SourcesFooter
            sources={sources}
            highlightedSource={highlightedSource}
            setHighlightedSource={setHl}
          />
        )}
      </div>
    </div>
  );
}
