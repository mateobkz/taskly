import React from 'react';
import { FileText, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@/types/document";

interface DocumentGridProps {
  documents: Document[];
  onDelete: (id: number) => Promise<void>;
  onDownload: (document: Document) => Promise<void>;
}

const DocumentGrid = ({ documents, onDelete, onDownload }: DocumentGridProps) => {
  return (
    <div className="space-y-2">
      {documents.map(document => (
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
  );
};

export default DocumentGrid;