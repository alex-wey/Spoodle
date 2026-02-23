'use client';

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { uploadDocument } from "@/lib/api";

interface PetRecordUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  onSuccess?: () => void;
}

const categories = [
  { id: 'veterinary_notes', title: 'Veterinary Notes' },
  { id: 'diagnostic_reports', title: 'Diagnostic Reports' },
  { id: 'lab_results', title: 'Lab Results' },
  { id: 'vaccination_records', title: 'Vaccination Records' },
  { id: 'discharge_reports', title: 'Discharge Reports' },
];

export function PetRecordUploadDialog({ open, onOpenChange, petId, onSuccess }: PetRecordUploadDialogProps) {
  const { getToken } = useAuth();
  const [category, setCategory] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setCategory('');
    setFileName('');
    setCustomFileName('');
    setFile(null);
    setNotes('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      if (!customFileName) {
        setCustomFileName(selectedFile.name);
      }
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      setError('Please select a pet record category');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Unable to authenticate. Please try signing in again.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('petId', petId);
      formData.append('category', category);
      if (customFileName.trim()) {
        formData.append('fileName', customFileName.trim());
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const result = await uploadDocument(formData, token);

      if (result.success) {
        resetForm();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.message || result.error || 'Failed to upload pet record');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred while uploading the pet record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Pet Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Pet Record Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Choose a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Picker */}
          <div className="space-y-2">
            <Label htmlFor="file">Pet Record File *</Label>
            {file ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="file">
                  <div className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Choose file</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Custom File Name */}
          <div className="space-y-2">
            <Label htmlFor="customFileName">Custom File Name (optional)</Label>
            <Input
              id="customFileName"
              placeholder="Enter custom name for the file"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="justify-center sm:justify-center">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !category || !file}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Pet Record
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

