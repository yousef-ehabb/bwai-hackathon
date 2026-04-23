'use client';

import { useId } from 'react';
import { ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';

export function TechProofUpload({
  value,
  onUpload,
}: {
  value: string | null;
  onUpload: (base64: string) => void;
}) {
  const inputId = useId();

  const handleUpload = (event: ChangeEvent<HTMLInputElement> | DragEvent) => {
    let file: File | undefined;

    if ('dataTransfer' in event) {
      event.preventDefault();
      event.stopPropagation();
      file = event.dataTransfer.files?.[0];
    } else {
      file = event.target.files?.[0];
    }

    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-primary">Proof of Work</p>

      {value ? (
        <div className="relative rounded-xl border border-border overflow-hidden">
          <img src={value} alt="Proof of completed work" className="w-full max-h-72 object-cover" />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute right-3 top-3 h-8 w-8"
            onClick={() => onUpload('')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <div
            className="rounded-xl border-2 border-dashed border-border bg-surface/40 p-8 text-center cursor-pointer hover:border-brand-blue/60 transition-colors"
            onClick={() => document.getElementById(inputId)?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onDrop={handleUpload}
          >
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-primary font-semibold">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP. Max 5MB.</p>
          </div>
          <input id={inputId} hidden type="file" accept="image/*" capture="environment" onChange={handleUpload} />
        </>
      )}
    </div>
  );
}
