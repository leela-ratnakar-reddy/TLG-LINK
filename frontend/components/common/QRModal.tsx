"use client";

import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string | null;
  originalUrl?: string | null;
  shortCode?: string | null;
}

export function QRModal({
  isOpen,
  onClose,
  shortUrl,
  originalUrl,
  shortCode,
}: QRModalProps) {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  if (!shortUrl) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Short link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleDownload = () => {
    try {
      const canvas = canvasRef.current?.querySelector("canvas");
      if (!canvas) {
        toast.error("Could not find QR canvas to download.");
        return;
      }
      const dataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `tlg-link-${shortCode || "qr"}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("QR code downloaded as PNG!");
    } catch {
      toast.error("Failed to download QR image.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code"
      description="Scan or download this QR code to access the shortened link."
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            leftIcon={
              copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )
            }
          >
            {copied ? "Copied" : "Copy Link"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download QR
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center justify-center py-4">
        <div
          ref={canvasRef}
          className="p-4 bg-white rounded-2xl shadow-card border border-subtle-border flex items-center justify-center"
        >
          <QRCodeCanvas
            value={shortUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mt-5 text-center w-full">
          <p className="font-mono text-sm font-semibold text-primary truncate max-w-full px-2">
            {shortUrl}
          </p>
          {originalUrl && (
            <p className="text-xs text-muted mt-1 truncate max-w-xs mx-auto">
              Resolves to: {originalUrl}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
