"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortCode?: string;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  shortCode,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete this link?"
      maxWidth="sm"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Link
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-foreground font-medium">
            This action cannot be undone.
          </p>
          <p className="text-xs text-muted leading-relaxed">
            The short link{" "}
            {shortCode && (
              <span className="font-mono text-primary font-bold">
                {shortCode}
              </span>
            )}{" "}
            will stop redirecting immediately and all associated analytics data
            will be permanently erased.
          </p>
        </div>
      </div>
    </Modal>
  );
}
