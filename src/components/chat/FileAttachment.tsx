/** File attachment component for chat messages */

import React, { useState } from "react";
import { AlertIcon, XIcon } from "../icons/AutomotiveIcons";
import { uploadChatAttachment } from "../../api/upload";

interface FileAttachmentProps {
  onFileUploaded: (fileInfo: FileInfo) => void;
  onCancel?: () => void;
}

export interface FileInfo {
  file_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  content_type: string;
  is_image: boolean;
}

export function FileAttachment({ onFileUploaded, onCancel }: FileAttachmentProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("El tamaño del archivo debe ser menor a 10MB");
      return;
    }

    // Preview image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const fileInfo = await uploadChatAttachment(formData);
      onFileUploaded(fileInfo);
      setPreview(null);
    } catch (err: any) {
      console.error("File upload failed:", err);
      setError(err.response?.data?.detail || "No se pudo subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-industrial-200">Adjuntar archivo</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-industrial-500 hover:text-industrial-300"
          >
            <XIcon size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-error-400">
          <AlertIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-industrial-700"
          />
        </div>
      )}

      <div>
        <label className="block">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            accept="image/*,application/pdf,text/plain"
            className="hidden"
          />
          <div className="btn-industrial w-full text-center cursor-pointer disabled:opacity-50">
            {uploading ? "Subiendo..." : "Elegir archivo"}
          </div>
        </label>
        <p className="text-xs text-industrial-500 mt-2">
          Imágenes, PDFs o archivos de texto (máx. 10MB)
        </p>
      </div>
    </div>
  );
}

