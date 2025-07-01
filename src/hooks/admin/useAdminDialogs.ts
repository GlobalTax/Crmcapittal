
import { useState } from "react";
import { Operation } from "@/types/Operation";

export const useAdminDialogs = () => {
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    operation: Operation | null;
  }>({ open: false, operation: null });
  
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    operation: Operation | null;
  }>({ open: false, operation: null });
  
  const [uploadDialog, setUploadDialog] = useState<{
    open: boolean;
    operation: Operation | null;
  }>({ open: false, operation: null });

  const openDetailsDialog = (operation: Operation) => {
    setDetailsDialog({ open: true, operation });
  };

  const closeDetailsDialog = () => {
    setDetailsDialog({ open: false, operation: null });
  };

  const openEditDialog = (operation: Operation) => {
    setEditDialog({ open: true, operation });
  };

  const closeEditDialog = () => {
    setEditDialog({ open: false, operation: null });
  };

  const openUploadDialog = (operation: Operation) => {
    setUploadDialog({ open: true, operation });
  };

  const closeUploadDialog = () => {
    setUploadDialog({ open: false, operation: null });
  };

  return {
    detailsDialog,
    editDialog,
    uploadDialog,
    openDetailsDialog,
    closeDetailsDialog,
    openEditDialog,
    closeEditDialog,
    openUploadDialog,
    closeUploadDialog
  };
};
