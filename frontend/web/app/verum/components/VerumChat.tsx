'use client';

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SUGGESTED_QUESTIONS,
  getMockedResponse,
  type Message,
  type Source,
} from "../lib/mockData";
import { useVerum } from "./VerumContext";
import { QuestionBubble } from "./QuestionBubble";

const LOREM_DISCLAIMER =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

interface VerumChatProps {
  onNavigateToQuestion?: (id: string) => void;
  loadedEntryId?: string | null;
  onLoadedEntryCleared?: () => void;
}

function SourcesBlock({ sources }: { sources: Source[] }) {
  return (
    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sources</div>
      <div className="space-y-1.5">
        {sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            className="block text-xs text-primary hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            <span className="font-medium">{s.journal}</span>
            {" — "}
            <span>{s.title}</span>
            {" ("}
            <span>{s.year}</span>
            {")"}
          </a>
        ))}
      </div>
    </div>
  );
}

export function VerumChat({ onNavigateToQuestion, loadedEntryId, onLoadedEntryCleared }: VerumChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { history, addHistoryEntry, getHistoryEntry } = useVerum();

  const isEmpty = messages.length === 0;
  const mostRecent = history[0];

  useEffect(() => {
    if (loadedEntryId) {
      const entry = getHistoryEntry(loadedEntryId);
      if (entry) {
        setMessages(entry.messages);
      }
      onLoadedEntryCleared?.();
    }
  }, [loadedEntryId, getHistoryEntry, onLoadedEntryCleared]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    const { content, sources } = getMockedResponse(text);
    setTimeout(() => {
      const assistantMsg: Message = { role: "assistant", content, sources };
      setMessages((prev) => [...prev, assistantMsg]);
      const summary = content.length > 120 ? content.slice(0, 120) + "…" : content;
      addHistoryEntry({
        question: text,
        summary,
        date: new Date().toISOString(),
        messages: [userMsg, assistantMsg],
      });
      setIsLoading(false);
    }, 600);
  };

  const handleSuggestClick = (q: string) => {
    if (isLoading) return;
    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    const { content, sources } = getMockedResponse(q);
    setTimeout(() => {
      const assistantMsg: Message = { role: "assistant", content, sources };
      setMessages((prev) => [...prev, assistantMsg]);
      const summary = content.length > 120 ? content.slice(0, 120) + "…" : content;
      addHistoryEntry({
        question: q,
        summary,
        date: new Date().toISOString(),
        messages: [userMsg, assistantMsg],
      });
      setIsLoading(false);
    }, 600);
  };

  const suggestedQuestions = SUGGESTED_QUESTIONS.slice(0, 2);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/50 dark:bg-blue-600/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500/50 dark:bg-indigo-600/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600/50 dark:bg-blue-700/40 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
            <div className="w-full max-w-xl flex flex-col items-center">
              <div className="w-full flex justify-center mb-[50px]">
                <div className="w-[80%] relative flex justify-center">
                  <Image
                    src="/spoodle-logo.png"
                    alt="Spoodle"
                    width={400}
                    height={137}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
              <div className="w-full flex gap-2">
                <Input
                  placeholder="Ask a research-oriented question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 bg-white/90 dark:bg-gray-900/90 border shadow-sm"
                />
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-full flex flex-col gap-2 mt-6">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestClick(q)}
                    className="w-full text-left px-4 py-3 rounded-lg border bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 text-sm transition-colors shadow-sm flex gap-3 items-start"
                  >
                    <span className="text-primary shrink-0 mt-0.5">•</span>
                    <span className="whitespace-normal">{q}</span>
                  </button>
                ))}
              </div>

              {mostRecent && (
                <>
                  <div className="w-full border-t-2 border-[#4559A7] my-6" />
                  <div className="w-full">
                    <QuestionBubble
                      entry={mostRecent}
                      onNavigate={onNavigateToQuestion}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 pb-2">
              <div className="max-w-2xl mx-auto py-6 pb-24 space-y-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] ${m.role === "user" ? "order-1" : "order-2"}`}>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                        {m.sources && m.sources.length > 0 && (
                          <SourcesBlock sources={m.sources} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-3 py-2 bg-muted text-sm text-muted-foreground">
                      Searching sources…
                    </div>
                  </div>
                )}
              </div>
              <div ref={scrollRef} />
            </ScrollArea>
            <div className="flex justify-center px-6 py-4 pb-24">
              <div className="w-full max-w-xl flex gap-2">
                <Input
                  placeholder="Ask a research-oriented question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 bg-white/90 dark:bg-gray-900/90 border shadow-sm"
                />
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-muted-foreground bg-black/5 dark:bg-black/20 backdrop-blur-sm border-t border-black/5">
        {LOREM_DISCLAIMER}
      </div>
    </div>
  );
}
