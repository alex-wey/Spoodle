'use client';

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionBubble } from "../components/QuestionBubble";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { CreateFileModal } from "../components/CreateFileModal";
import { useVerum } from "../components/VerumContext";
import { fuzzyMatch } from "../lib/fuzzySearch";

interface HistoryViewProps {
  scrollToId: string | null;
  onScrollToHandled: () => void;
  onOpenChat?: (id: string) => void;
}

export function HistoryView({ scrollToId, onScrollToHandled, onOpenChat }: HistoryViewProps) {
  const { history, files, deleteHistoryEntry, updateFile, addFile } = useVerum();
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createFileIds, setCreateFileIds] = useState<string[] | null>(null);

  const filtered = useMemo(() => {
    return history.filter((e) => {
      if (search.trim()) {
        const matchTitle = fuzzyMatch(e.question, search);
        const matchSummary = fuzzyMatch(e.summary, search);
        if (!matchTitle && !matchSummary) return false;
      }
      if (startDate) {
        if (e.date < startDate + "T00:00:00.000Z") return false;
      }
      if (endDate) {
        if (e.date > endDate + "T23:59:59.999Z") return false;
      }
      return true;
    });
  }, [history, search, startDate, endDate]);

  React.useEffect(() => {
    if (scrollToId) {
      const el = document.getElementById(`history-q-${scrollToId}`);
      el?.scrollIntoView({ behavior: "smooth" });
      onScrollToHandled();
    }
  }, [scrollToId, onScrollToHandled]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleAddToFile = (questionId: string, fileId: string) => {
    const f = files.find((x) => x.id === fileId);
    if (!f || f.questionIds.includes(questionId)) return;
    updateFile(fileId, { questionIds: [...f.questionIds, questionId] });
  };

  const handleCreateFile = (questionIds: string[]) => {
    setCreateFileIds(questionIds);
  };

  const handleCreateFileConfirm = (fileName: string, iconUrl: string | null, questionIds: string[]) => {
    addFile({ name: fileName, iconUrl, questionIds });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b space-y-3 flex-shrink-0">
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Input
            type="date"
            placeholder="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="max-w-[140px]"
          />
          <Input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="max-w-[140px]"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filtered.map((entry) => (
            <div key={entry.id} id={`history-q-${entry.id}`}>
              <QuestionBubble
                entry={entry}
                onDelete={handleDelete}
                onAddToFile={handleAddToFile}
                onCreateFile={handleCreateFile}
                files={files.map((f) => ({ id: f.id, name: f.name }))}
                onOpenChat={onOpenChat}
              />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No questions yet. Ask something from Home.
            </div>
          )}
        </div>
      </ScrollArea>

      <DeleteConfirmModal
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteHistoryEntry(deleteId);
          setDeleteId(null);
        }}
      />

      <CreateFileModal
        open={!!createFileIds}
        onOpenChange={(o) => !o && setCreateFileIds(null)}
        initialQuestionIds={createFileIds ?? []}
        allQuestions={history}
        onCreate={handleCreateFileConfirm}
      />
    </div>
  );
}
