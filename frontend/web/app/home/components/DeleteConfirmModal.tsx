'use client';

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onConfirm: () => void;
}

const CONFIRM_BG = "#3BB272";
const CANCEL_BG = "#F47721";
const BTN_TEXT = "#F7F7F9";

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title = "Are you sure that you want to delete that question?",
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            style={{ backgroundColor: CONFIRM_BG, color: BTN_TEXT }}
            className="flex-1"
          >
            Yes
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{ backgroundColor: CANCEL_BG, color: BTN_TEXT, borderColor: CANCEL_BG }}
            className="flex-1"
          >
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
