import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload } from "lucide-react";
import type { Upload } from "@/types/quiz";

interface UploaderProps {
  onUploadSuccess: (upload: Upload) => void;
}

export function Uploader({ onUploadSuccess }: UploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onUploadSuccess(data);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Please ensure the file is a valid PDF under 20MB.",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    setIsDragOver(false);
  }, [uploadMutation]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: false,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`drag-zone border-2 border-dashed rounded-lg p-8 text-center transition-all hover:border-primary/50 ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-border'
      } ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
      data-testid="upload-zone"
    >
      <input {...getInputProps()} data-testid="input-file" />
      
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <CloudUpload className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div>
          <p className="text-lg font-medium text-foreground mb-1">
            {uploadMutation.isPending ? "Uploading..." : "Drop your PDF here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:underline"
              onClick={open}
              disabled={uploadMutation.isPending}
              data-testid="button-browse"
            >
              browse files
            </Button>
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Maximum file size: 20MB • PDF format only
        </p>
      </div>
      
      {uploadMutation.isPending && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      )}
    </div>
  );
}
