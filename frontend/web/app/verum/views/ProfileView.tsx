'use client';

import React, { useState, useMemo, useRef } from "react";
import { Settings, Pin, MoreHorizontal, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useVerum } from "../components/VerumContext";
import { fuzzyMatch } from "../lib/fuzzySearch";
import type { HistoryEntry } from "../lib/types";
import { validatePassword } from "../lib/passwordValidation";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";
import { CreateFileModal } from "../components/CreateFileModal";
import { QuestionBubble } from "../components/QuestionBubble";

const CONFIRM_BG = "#3BB272";
const CANCEL_BG = "#F47721";
const BTN_TEXT = "#F7F7F9";
const PIN_COLOR = "#FF5D91";

export function ProfileView() {
  const {
    profile,
    files,
    history,
    updateProfile,
    updateFile,
    addFile,
    deleteFile,
    deleteHistoryEntry,
    reorderFiles,
    clearAll,
    revokeVerumSession,
  } = useVerum();
  const [fileSearch, setFileSearch] = useState("");
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [createFileIds, setCreateFileIds] = useState<string[] | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    if (!fileSearch.trim()) return files;
    return files.filter((f) => fuzzyMatch(f.name, fileSearch));
  }, [files, fileSearch]);

  const sortedFiles = useMemo(() => {
    const pinned = [...filteredFiles.filter((f) => f.pinned)].sort(
      (a, b) => (b.pinnedAt && a.pinnedAt
        ? new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime()
        : 0)
    );
    const unpinned = [...filteredFiles.filter((f) => !f.pinned)].sort(
      (a, b) => a.order - b.order
    );
    return [...pinned, ...unpinned];
  }, [filteredFiles]);

  const togglePin = (fileId: string) => {
    const f = files.find((x) => x.id === fileId);
    if (!f) return;
    if (f.pinned) {
      updateFile(fileId, { pinned: false, pinnedAt: null });
    } else {
      updateFile(fileId, { pinned: true, pinnedAt: new Date().toISOString() });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    setDraggedId(null);
    const source = files.find((f) => f.id === draggedId);
    const target = files.find((f) => f.id === targetId);
    if (!source || !target || source.id === target.id) return;
    if (source.pinned && !target.pinned) return;
    if (!source.pinned && target.pinned) return;
    const arr = [...sortedFiles];
    const si = arr.findIndex((f) => f.id === source.id);
    const ti = arr.findIndex((f) => f.id === target.id);
    if (si < 0 || ti < 0) return;
    const [removed] = arr.splice(si, 1);
    arr.splice(ti, 0, removed);
    const pinnedIds = arr.filter((f) => f.pinned).map((f) => f.id);
    const unpinnedIds = arr.filter((f) => !f.pinned).map((f) => f.id);
    reorderFiles(pinnedIds, unpinnedIds);
  };

  const expandedFile = expandedFileId
    ? files.find((f) => f.id === expandedFileId)
    : null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top section - 1/5 */}
      <div className="relative flex h-[20%] min-h-[120px] items-center justify-center border-b py-4 verum-main-gutter">
        <div className="w-full max-w-md mx-auto space-y-3">
          <Input
            value={profile.email}
            onChange={(e) => updateProfile({ email: e.target.value })}
            placeholder="Email"
            className="text-left"
          />
          <Input
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            placeholder="Name"
            className="text-left"
          />
        </div>

        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                Change password
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => revokeVerumSession()}>
                Log out
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteAccountOpen(true)}
                className="text-destructive"
              >
                Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Thin divider */}
      <div className="h-px border-b bg-border" />

      {/* Bottom section - 2/3 with file search below divider */}
      <div className="flex min-h-0 flex-1 flex-col overflow-auto py-6 verum-main-gutter">
        {!expandedFile && (
          <div className="w-full max-w-2xl mx-auto mb-4 flex-shrink-0 flex items-center gap-3">
            <Input
              placeholder="Search files..."
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              className="flex-1 max-w-md"
            />
            <Button
              onClick={() => setCreateFileIds([])}
              className="shrink-0"
              style={{ backgroundColor: CONFIRM_BG, color: BTN_TEXT }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create new file
            </Button>
          </div>
        )}
        {expandedFile ? (
          <FileExpandedView
            file={expandedFile}
            history={history}
            files={files.filter((f) => f.id !== expandedFile.id).map((f) => ({ id: f.id, name: f.name, questionIds: f.questionIds }))}
            onClose={() => setExpandedFileId(null)}
            onDelete={() => setDeleteFileId(expandedFile.id)}
            onTogglePin={() => togglePin(expandedFile.id)}
            updateFile={updateFile}
            deleteHistoryEntry={deleteHistoryEntry}
            addFile={addFile}
            onCreateFileRequest={setCreateFileIds}
          />
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              {sortedFiles.map((f) => (
                <FileCard
                  key={f.id}
                  file={f}
                  onClick={() => setExpandedFileId(f.id)}
                  isDragging={draggedId === f.id}
                  isDragOver={dragOverId === f.id}
                  onDragStart={(e) => handleDragStart(e, f.id)}
                  onDragOver={(e) => handleDragOver(e, f.id)}
                  onDrop={(e) => handleDrop(e, f.id)}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CreateFileModal
        open={!!createFileIds}
        onOpenChange={(o) => !o && setCreateFileIds(null)}
        initialQuestionIds={createFileIds ?? []}
        allQuestions={history}
        onCreate={(name, iconUrl, qIds) => {
          addFile({ name, iconUrl, questionIds: qIds });
          setCreateFileIds(null);
        }}
      />
      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <DeleteConfirmModal
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Are you sure you want to delete your account?"
        onConfirm={clearAll}
      />
      <DeleteConfirmModal
        open={!!deleteFileId}
        onOpenChange={(o) => !o && setDeleteFileId(null)}
        title="Are you sure you want to delete this file?"
        onConfirm={() => {
          if (deleteFileId) deleteFile(deleteFileId);
          setDeleteFileId(null);
          setExpandedFileId(null);
        }}
      />
    </div>
  );
}

function FileCard({
  file,
  onClick,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  file: { id: string; name: string; iconUrl: string | null; pinned: boolean };
  onClick: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`relative rounded-xl border border-transparent bg-transparent p-4 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? "opacity-50" : ""
      } ${isDragOver ? "ring-2 ring-primary" : ""}`}
    >
      {file.pinned && (
        <div
          className="absolute top-2 left-2 rotate-[-30deg]"
          style={{ color: PIN_COLOR }}
        >
          <Pin className="h-4 w-4 fill-current" />
        </div>
      )}
      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden mb-2">
        {file.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.iconUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl text-muted-foreground">📄</span>
        )}
      </div>
      <div className="text-sm font-medium truncate">{file.name}</div>
    </div>
  );
}

function FileExpandedView({
  file,
  history,
  files,
  onClose,
  onDelete,
  onTogglePin,
  updateFile,
  deleteHistoryEntry,
  addFile,
  onCreateFileRequest,
}: {
  file: { id: string; name: string; iconUrl: string | null; questionIds: string[]; pinned: boolean };
  history: HistoryEntry[];
  files: Array<{ id: string; name: string; questionIds: string[] }>;
  onClose: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  updateFile: (id: string, updates: Partial<{ questionIds: string[]; iconUrl: string | null; name: string }>) => void;
  deleteHistoryEntry: (id: string) => void;
  addFile: (file: { name: string; iconUrl: string | null; questionIds: string[] }) => void;
  onCreateFileRequest: (questionIds: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateFile(file.id, { iconUrl: reader.result as string });
    };
    reader.readAsDataURL(uploaded);
    e.target.value = "";
  };

  const entries = file.questionIds
    .map((id) => history.find((e) => e.id === id))
    .filter((e): e is HistoryEntry => !!e);
  const filtered = search.trim()
    ? entries.filter(
        (e) => fuzzyMatch(e.question, search) || fuzzyMatch(e.summary, search)
      )
    : entries;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          {file.pinned && (
            <div className="rotate-[-30deg]" style={{ color: PIN_COLOR }}>
              <Pin className="h-5 w-5 fill-current" />
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => iconInputRef.current?.click()}
            className="w-14 h-14 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {file.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.iconUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-muted-foreground">📄</span>
            )}
          </button>
          <input
            ref={iconInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleIconUpload}
          />
          <Input
            value={file.name}
            onChange={(e) => updateFile(file.id, { name: e.target.value })}
            className="text-lg font-semibold w-48"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onTogglePin}>
              {file.pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex justify-center mb-4">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm w-full"
        />
      </div>
      <div className="flex-1 overflow-auto space-y-3">
        {filtered.map((e) => (
          <QuestionBubble
            key={e.id}
            entry={e}
            onDelete={(id) => {
              deleteHistoryEntry(id);
              updateFile(file.id, {
                questionIds: file.questionIds.filter((q) => q !== id),
              });
            }}
            onAddToFile={(questionId, fileId) => {
              const f = files.find((x) => x.id === fileId);
              if (!f || f.questionIds.includes(questionId)) return;
              updateFile(fileId, { questionIds: [...f.questionIds, questionId] });
            }}
            onCreateFile={(ids) => onCreateFileRequest(ids)}
            files={files.map((f) => ({ id: f.id, name: f.name }))}
          />
        ))}
      </div>
    </div>
  );
}

function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const v = validatePassword(newPw);
    const e: string[] = [];
    if (!current) e.push("Current password required");
    if (newPw !== confirm) e.push("Passwords do not match");
    e.push(...v.errors);
    setErrors(e);
    if (e.length > 0) return;
    onOpenChange(false);
    setCurrent("");
    setNewPw("");
    setConfirm("");
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {errors.length > 0 && (
            <ul className="text-sm text-destructive">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: CONFIRM_BG, color: BTN_TEXT }}
            onClick={handleSubmit}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
