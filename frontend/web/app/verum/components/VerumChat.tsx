'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Message } from "../lib/mockData";
import { SUGGESTED_CHIPS, getDemoResponse, demoPlainBody } from "../lib/demoContent";
import { useVerum } from "./VerumContext";
import { QuestionBubble } from "./QuestionBubble";
import { AssistantTurn } from "./AssistantTurn";
import { ResponseExportFab } from "./ResponseExportFab";
import { VERUM_SUGGESTION_CHIP_INNER } from "../lib/clinicalNextStepsDemo";

const DISCLAIMER =
  "Verum is designed to surface and organize licensed veterinary information. It does not diagnose conditions, recommend treatments, or replace clinical judgment. All medical decisions remain the responsibility of the treating veterinarian.";

function QuestionComposerBubble({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div className="relative w-full rounded-2xl border border-sky-200/80 bg-white/90 shadow-sm ring-1 ring-primary/10 dark:border-sky-800/45 dark:bg-gray-900/90 dark:ring-primary/20">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) onSend();
          }
        }}
        placeholder={placeholder}
        rows={2}
        aria-label="Your question"
        className="min-h-[5.5rem] max-h-[min(40vh,16rem)] w-full resize-none border-0 bg-transparent px-4 pb-14 pt-4 pr-14 text-[15px] leading-relaxed text-pretty text-foreground [overflow-wrap:anywhere] placeholder:text-muted-foreground selection:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0 dark:bg-transparent dark:selection:bg-primary/25"
      />
      <Button
        type="button"
        variant="default"
        size="icon"
        disabled={disabled}
        onClick={onSend}
        className="absolute bottom-3 right-3 h-10 w-10 shrink-0 rounded-full shadow-sm"
        aria-label="Send question"
        title="Send"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface VerumChatProps {
  /** Opens this history entry in the main chat (Home), not History */
  onOpenChat?: (id: string) => void;
  loadedEntryId?: string | null;
  onLoadedEntryCleared?: () => void;
}

export function VerumChat({ onOpenChat, loadedEntryId, onLoadedEntryCleared }: VerumChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { history, addHistoryEntry, getHistoryEntry } = useVerum();

  const turns = useMemo(() => {
    const out: { q: string; a: Message }[] = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "user" && messages[i + 1]?.role === "assistant") {
        out.push({ q: m.content, a: messages[i + 1] });
        i++;
      }
    }
    return out;
  }, [messages]);

  const isEmpty = messages.length === 0;
  const mostRecent = history.length > 0
    ? [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : undefined;

  useEffect(() => {
    if (loadedEntryId) {
      const entry = getHistoryEntry(loadedEntryId);
      if (entry) {
        setMessages(entry.messages);
      }
      onLoadedEntryCleared?.();
    }
  }, [loadedEntryId, getHistoryEntry, onLoadedEntryCleared]);

  /** Only scroll to the latest answer after the user submits — not when hydrating from History (avoids pinning / jumpy scroll). */
  const scrollToConversationBottom = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    });
  }, []);

  const submitDemoQuestion = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isLoading) return;
      flushSync(() => setInput(text));
      const userMsg: Message = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      
      try {
        // Call the RAG API
        const response = await fetch("/api/verum/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text, petType: "all" }),
        });
        
        const data = await response.json();
        console.log("📦 Frontend received data:", data);
        console.log("📦 Content:", data.data?.content);
        
        if (data.success && data.data) {
          const assistantMsg: Message = {
            role: "assistant",
            content: data.data.content,
            sources: data.data.sources || [],
          };
          console.log("✅ Created assistant message:", assistantMsg);
          setMessages((prev) => [...prev, assistantMsg]);
          
          const summary = data.data.content.length > 120 
            ? data.data.content.slice(0, 120) + "…" 
            : data.data.content;
          
          addHistoryEntry({
            question: text,
            summary,
            date: new Date().toISOString(),
            messages: [userMsg, assistantMsg],
          });
        } else {
          // Fallback to demo response if API fails
          const r = getDemoResponse(text);
          const assistantMsg: Message = {
            role: "assistant",
            content: r.content,
            sources: r.sources,
            ...(r.sections ? { sections: r.sections } : {}),
            ...(r.followUp ? { followUp: r.followUp } : {}),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          const plain = demoPlainBody(r);
          const summary = plain.length > 120 ? plain.slice(0, 120) + "…" : plain;
          addHistoryEntry({
            question: text,
            summary,
            date: new Date().toISOString(),
            messages: [userMsg, assistantMsg],
          });
        }
      } catch (error) {
        console.error("Error calling RAG API:", error);
        // Fallback to demo response
        const r = getDemoResponse(text);
        const assistantMsg: Message = {
          role: "assistant",
          content: r.content,
          sources: r.sources,
          ...(r.sections ? { sections: r.sections } : {}),
          ...(r.followUp ? { followUp: r.followUp } : {}),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        const plain = demoPlainBody(r);
        const summary = plain.length > 120 ? plain.slice(0, 120) + "…" : plain;
        addHistoryEntry({
          question: text,
          summary,
          date: new Date().toISOString(),
          messages: [userMsg, assistantMsg],
        });
      }
      
      setIsLoading(false);
      setInput("");
      scrollToConversationBottom();
    },
    [isLoading, addHistoryEntry, scrollToConversationBottom]
  );

  const handleSend = () => {
    submitDemoQuestion(input);
  };

  const handleSuggestClick = (q: string) => {
    submitDemoQuestion(q);
  };

  const suggestedQuestions = SUGGESTED_CHIPS;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/50 dark:bg-blue-600/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500/50 dark:bg-indigo-600/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600/50 dark:bg-blue-700/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center pb-32">
            <div className="verum-main-gutter flex w-full max-w-6xl flex-col items-center">
              <div className="mb-[50px] flex shrink-0 justify-center">
                <Image
                  src="/logo.png"
                  alt="Verum"
                  width={400}
                  height={137}
                  className="h-auto w-[400px] max-w-full object-contain"
                  priority
                />
              </div>
              <div className="w-full min-w-0">
                <QuestionComposerBubble
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  disabled={!input.trim() || isLoading}
                  placeholder="Ask a veterinary medicine question..."
                />
              </div>
              <div className="mt-5 flex w-full flex-col gap-1.5">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestClick(q)}
                    className={`flex w-full min-w-0 items-start gap-2.5 text-left ${VERUM_SUGGESTION_CHIP_INNER}`}
                  >
                    <span className="text-primary shrink-0 mt-0.5">•</span>
                    <span className="min-w-0 flex-1 whitespace-normal break-words text-pretty">
                      {q}
                    </span>
                  </button>
                ))}
              </div>

              {mostRecent && (
                <>
                  <div className="w-full border-t-2 border-[#4559A7] my-6" />
                  <div className="w-full">
                    <QuestionBubble
                      entry={mostRecent}
                      onOpenChat={onOpenChat}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pb-2">
              <div className="verum-main-gutter mx-auto w-full min-w-0 max-w-6xl space-y-8 py-6 pb-24">
                {turns.map((t, idx) => (
                  <AssistantTurn
                    key={idx}
                    question={t.q}
                    message={t.a}
                    onExploreChip={submitDemoQuestion}
                    exploreDisabled={isLoading}
                  />
                ))}
                {isLoading && (
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Searching sources…
                  </div>
                )}
                <ResponseExportFab turns={turns.map((t) => ({ question: t.q, message: t.a }))} />
              </div>
              <div ref={scrollRef} />
            </ScrollArea>
            <div className="py-4 pb-24">
              <div className="verum-main-gutter mx-auto w-full min-w-0 max-w-6xl">
                <QuestionComposerBubble
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  disabled={!input.trim() || isLoading}
                  placeholder="Ask a veterinary medicine question..."
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-muted-foreground bg-black/5 dark:bg-black/20 backdrop-blur-sm border-t border-black/5">
        {DISCLAIMER}
      </div>
    </div>
  );
}
