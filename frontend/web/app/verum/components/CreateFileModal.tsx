'use client';

import React, { useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fuzzyMatch } from "../lib/fuzzySearch";
import type { HistoryEntry } from "../lib/types";

const CONFIRM_BG = "#3BB272";
const CANCEL_BG = "#F47721";
const BTN_TEXT = "#F7F7F9";

interface CreateFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuestionIds: string[];
  allQuestions: HistoryEntry[];
  onCreate: (name: string, iconUrl: string | null, questionIds: string[]) => void;
}

export function CreateFileModal({
  open,
  onOpenChange,
  initialQuestionIds,
  allQuestions,
  onCreate,
}: CreateFileModalProps) {
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialQuestionIds));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return allQuestions;
    return allQuestions.filter(
      (q) => fuzzyMatch(q.question, search) || fuzzyMatch(q.summary, search)
    );
  }, [allQuestions, search]);

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    onCreate(name || "Untitled", iconUrl, Array.from(selectedIds));
    onOpenChange(false);
    setName("");
    setIconUrl(null);
    setSelectedIds(new Set());
    setSearch("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setIconUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new file</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">File name</label>
            <Input
              placeholder="Enter file name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">File icon</label>
            <div className="flex gap-3 items-center">
              <div
                className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Upload</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Add questions</label>
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
            <ScrollArea className="h-48 rounded border p-2">
              <div className="space-y-2">
                {filtered.map((q) => (
                  <label
                    key={q.id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(q.id)}
                      onChange={() => toggleQuestion(q.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{q.question}</div>
                      <div className="text-xs text-muted-foreground truncate">~ {q.summary}</div>
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{ backgroundColor: CANCEL_BG, color: BTN_TEXT, borderColor: CANCEL_BG }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            style={{ backgroundColor: CONFIRM_BG, color: BTN_TEXT }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
