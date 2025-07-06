import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  id: string;
  accept: string;
  maxSize: number;
  placeholder: string;
  description: string;
  className?: string;
}

export default function FileUpload({ 
  id, 
  accept, 
  maxSize, 
  placeholder, 
  description,
  className 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);
    
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    if (!file.type.match(accept.replace('/*', ''))) {
      setError('Invalid file type');
      return;
    }

    setSelectedFile(file);
    
    // Update the actual file input
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragging 
            ? "border-netflix-red bg-netflix-red/10" 
            : "border-netflix-border bg-netflix-black hover:border-netflix-red/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          {selectedFile ? (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Upload className="w-6 h-6 text-green-500" />
                <span className="text-white font-medium">{selectedFile.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveFile}
                  className="text-netflix-red hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-netflix-light-gray">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-netflix-light-gray mx-auto mb-4" />
              <p className="text-netflix-light-gray mb-2">{placeholder}</p>
              <p className="text-sm text-netflix-light-gray mb-4">or</p>
              <Button
                type="button"
                onClick={handleBrowseClick}
                className="bg-netflix-red hover:bg-red-700"
              >
                Choose File
              </Button>
              <p className="text-xs text-netflix-light-gray mt-2">{description}</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
