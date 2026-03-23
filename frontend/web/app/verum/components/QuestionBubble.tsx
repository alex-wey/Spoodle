'use client';

import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { HistoryEntry } from "../lib/types";

interface QuestionBubbleProps {
  entry: HistoryEntry;
  onDelete?: (id: string) => void;
  onAddToFile?: (id: string, fileId: string) => void;
  onCreateFile?: (questionIds: string[]) => void;
  files?: Array<{ id: string; name: string }>;
  compact?: boolean;
  onNavigate?: (id: string) => void;
  /** When provided, clicking opens full chat (Home) with this conversation instead of scrolling in History */
  onOpenChat?: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function QuestionBubble({
  entry,
  onDelete,
  onAddToFile,
  onCreateFile,
  files = [],
  compact = false,
  onNavigate,
  onOpenChat,
}: QuestionBubbleProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onOpenChat) {
      onOpenChat(entry.id);
    } else if (onNavigate) {
      onNavigate(entry.id);
    }
  };
  const isClickable = !!onOpenChat || !!onNavigate;
  return (
    <div
      className={`rounded-lg border bg-white/90 dark:bg-gray-900/90 shadow-sm overflow-hidden ${
        isClickable ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="relative px-3 py-3">
        <div className="absolute top-2.5 right-2.5 text-xs text-muted-foreground">
          {formatDate(entry.date)}
        </div>
        <div className="pr-11 text-sm font-bold">{entry.question}</div>
        <div className="mt-0.5 pr-11 line-clamp-3 text-sm text-muted-foreground">
          ~ {entry.summary}
        </div>
        {(onDelete || onAddToFile || onCreateFile) && (
          <div className="absolute bottom-2.5 right-2.5" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
                {onAddToFile && (onCreateFile || files.length > 0) && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      onPointerDown={(e) => e.stopPropagation()}
                      onPointerMove={(e) => e.stopPropagation()}
                    >
                      Add to file
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {onCreateFile && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateFile([entry.id]);
                          }}
                          className="font-bold"
                        >
                          Create new file
                        </DropdownMenuItem>
                      )}
                      {files.map((f) => (
                        <DropdownMenuItem
                          key={f.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToFile(entry.id, f.id);
                          }}
                        >
                          {f.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
