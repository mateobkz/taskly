import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document, DocumentCategory } from "@/types/document";
import { FileText, Download, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentSectionProps {
  category: DocumentCategory;
  documents: Document[];
  onUpload: (file: File, category: DocumentCategory) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onDownload: (document: Document) => Promise<void>;
}

const DocumentSection = ({ 
  category, 
  documents, 
  onUpload, 
  onDelete, 
  onDownload 
}: DocumentSectionProps) => {
  const { toast } = useToast();
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      await onUpload(file, category);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  }, [category, onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category}s</span>
          <div 
            {...getRootProps()} 
            className={`cursor-pointer transition-all duration-300 ${
              isDragActive ? 'scale-105' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload {category}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents
            .filter(doc => doc.category === category)
            .map(document => (
              <div
                key={document.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-white/80 hover:bg-white/90 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{document.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(document)}
                    className="hover:text-blue-600"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(document.id)}
                    className="hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentSection;