import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentCategory } from "@/types/document";
import { useToast } from "@/components/ui/use-toast";

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const uploadDocument = async (file: File, category: DocumentCategory) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: file.name,
          category,
          file_path: filePath,
        });

      if (dbError) throw dbError;

      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      const document = documents.find(d => d.id === id);
      if (!document) return;

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  };

  return {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    fetchDocuments,
  };
};