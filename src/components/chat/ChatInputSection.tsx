/** Chat input component with markdown support, quick actions, and real-time token counter */

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DiagnosticCode } from "../common/DiagnosticCode";

interface ChatInputSectionProps {
  onSend: (content: string, attachments?: any) => void;
  disabled?: boolean;
  placeholder?: string;
  estimatedTokens?: number;
  remainingTokens?: number;
  tokenLimit?: number;
  errorCodes?: string[];
  onErrorCodesChange?: (codes: string[]) => void;
  vehicleData?: {
    license_plate?: string;
    make?: string;
    model?: string;
    year?: number;
    current_km?: number;
  };
}

// Simple token estimation: ~4 characters per token (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function ChatInputSection({
  onSend,
  disabled = false,
  placeholder: placeholderProp,
  estimatedTokens: externalEstimatedTokens,
  remainingTokens,
  tokenLimit = 10000,
  errorCodes = [],
  onErrorCodesChange,
  vehicleData,
}: ChatInputSectionProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [showErrorCodeInput, setShowErrorCodeInput] = useState(false);
  const [errorCodeInput, setErrorCodeInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const placeholder = placeholderProp || t("chat.input.placeholder");
  
  const VEHICLE_TEMPLATE = `${t("chat.vehicleTemplate.vehicleInformation")}
- ${t("chat.vehicleTemplate.licensePlate")} {license_plate}
- ${t("chat.vehicleTemplate.makeModel")} {make} {model}
- ${t("chat.vehicleTemplate.year")} {year}
- ${t("chat.vehicleTemplate.currentKm")} {current_km}

${t("chat.vehicleTemplate.issueDescription")}`;

  // Calculate tokens from content (for display)
  const calculatedTokens = estimateTokens(content);
  const displayTokens = externalEstimatedTokens || calculatedTokens;
  
  // Use actual remaining tokens from context if available, otherwise calculate from limit
  const tokensRemaining = remainingTokens !== undefined 
    ? remainingTokens 
    : tokenLimit - displayTokens;
  
  // Display used tokens (from workshop/user usage, not just input)
  const tokensUsed = remainingTokens !== undefined 
    ? tokenLimit - remainingTokens 
    : displayTokens;

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    const attachmentData: any = {
      files: attachments.map((f) => ({
        filename: f.name,
        content_type: f.type,
        is_image: f.type.startsWith("image/"),
      })),
    };

    if (errorCodes.length > 0) {
      attachmentData.error_codes = errorCodes.join(", ");
    }

    onSend(content.trim(), attachmentData);
    setContent("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter allows new line (default behavior)
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleInsertVehicleTemplate = () => {
    if (!vehicleData) return;

    let template = VEHICLE_TEMPLATE;
    template = template.replace("{license_plate}", vehicleData.license_plate || "N/A");
    template = template.replace(
      "{make} {model}",
      vehicleData.make && vehicleData.model
        ? `${vehicleData.make} ${vehicleData.model}`
        : "N/A"
    );
    template = template.replace("{year}", vehicleData.year?.toString() || "N/A");
    template = template.replace(
      "{current_km}",
      vehicleData.current_km?.toLocaleString() || "N/A"
    );

    setContent((prev) => (prev ? `${prev}\n\n${template}` : template));
    textareaRef.current?.focus();
  };

  const handleInsertErrorCode = () => {
    setShowErrorCodeInput(true);
  };

  const handleAddErrorCode = () => {
    const codes = errorCodeInput
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.match(/^[PBCU]\d{4}$/));

    if (codes.length > 0 && onErrorCodesChange) {
      onErrorCodesChange([...errorCodes, ...codes.filter((c) => !errorCodes.includes(c))]);
      setErrorCodeInput("");
      setShowErrorCodeInput(false);
    }
  };

  const handleRemoveErrorCode = (code: string) => {
    if (onErrorCodesChange) {
      onErrorCodesChange(errorCodes.filter((c) => c !== code));
    }
  };

  const handleSaveAsTemplate = () => {
    // TODO: Implement template saving functionality
    console.log("Save as template:", content);
    // This would typically open a modal to save the current message as a template
  };

  return (
    <div className="bg-[#111827] border-t border-industrial-800">
      {/* Main Input Area */}
      <div className="px-4 py-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full px-4 py-3 bg-industrial-800/50 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors resize-none overflow-y-auto min-h-[60px] max-h-[200px] font-sans"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-industrial-800" />

      {/* Toolbar */}
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Left: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Attach Files */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="touch-target p-2 hover:bg-industrial-800/50 rounded-lg transition-colors flex items-center justify-center"
            title={t("common.attachFiles")}
            disabled={disabled}
          >
            <span className="text-lg">📎</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Vehicle Template */}
          <button
            onClick={handleInsertVehicleTemplate}
            className="touch-target p-2 hover:bg-industrial-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title={t("common.insertVehicleTemplate")}
            disabled={disabled || !vehicleData}
          >
            <span className="text-lg">🚗</span>
          </button>

          {/* Error Code */}
          <button
            onClick={handleInsertErrorCode}
            className="touch-target p-2 hover:bg-industrial-800/50 rounded-lg transition-colors flex items-center justify-center"
            title={t("common.insertErrorCode")}
            disabled={disabled}
          >
            <span className="text-lg">⚙️</span>
          </button>

          {/* Save Template */}
          <button
            onClick={handleSaveAsTemplate}
            className="touch-target p-2 hover:bg-industrial-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title={t("common.saveAsTemplate")}
            disabled={disabled || !content.trim()}
          >
            <span className="text-lg">💾</span>
          </button>
        </div>

        {/* Right: Token Counter & Send Button */}
        <div className="flex items-center gap-4">
          {/* Token Counter - Solo si se proporcionan los datos */}
          {remainingTokens !== undefined && tokenLimit !== undefined && (
          <div className="text-sm font-mono text-industrial-400">
              {t("common.tokens")}{" "}
            <span
              className={
                tokensRemaining < 1000
                  ? "text-error-400"
                  : tokensRemaining < 5000
                  ? "text-warning-400"
                  : "text-success-400"
              }
            >
              {tokensUsed.toLocaleString()}
            </span>
            /{tokenLimit.toLocaleString()}
          </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || !content.trim()}
            className="touch-target px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-industrial-700 disabled:text-industrial-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {t("chat.input.send")}
          </button>
        </div>
      </div>

      {/* Error Code Input */}
      {showErrorCodeInput && (
        <div className="px-4 pb-3 border-t border-industrial-800">
          <div className="mt-3 bg-industrial-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={errorCodeInput}
                onChange={(e) => setErrorCodeInput(e.target.value)}
                placeholder={t("chat.input.errorCodePlaceholder")}
                className="flex-1 px-3 py-2 bg-industrial-900 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddErrorCode();
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleAddErrorCode}
                className="touch-target px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
{t("chat.input.add")}
              </button>
              <button
                onClick={() => {
                  setShowErrorCodeInput(false);
                  setErrorCodeInput("");
                }}
                className="touch-target px-4 py-2 bg-industrial-700 hover:bg-industrial-600 text-industrial-200 rounded-lg transition-colors text-sm"
              >
                 {t("chat.input.cancel")}
              </button>
            </div>
            <p className="text-xs text-industrial-500">
               {t("chat.input.enterDiagnosticCodes")}
            </p>
          </div>
        </div>
      )}

      {/* Error Codes Display */}
      {errorCodes.length > 0 && (
        <div className="px-4 pb-3 border-t border-industrial-800">
          <div className="mt-3 flex items-center gap-2 flex-wrap">
             <span className="text-xs text-industrial-400">{t("chat.input.errorCodesLabel")}</span>
            {errorCodes.map((code) => (
              <div key={code} className="flex items-center gap-1">
                <DiagnosticCode code={code} variant="error" />
                <button
                  onClick={() => handleRemoveErrorCode(code)}
                  className="text-industrial-500 hover:text-industrial-300 text-xs ml-1"
                   title={t("chat.input.removeErrorCode")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments Display */}
      {attachments.length > 0 && (
        <div className="px-4 pb-3 border-t border-industrial-800">
          <div className="mt-3 flex items-center gap-2 flex-wrap">
             <span className="text-xs text-industrial-400">{t("chat.input.attachmentsLabel")}</span>
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 bg-industrial-800/50 rounded text-xs"
              >
                {file.type.startsWith("image/") ? (
                  <span className="text-base">🖼️</span>
                ) : (
                  <span className="text-base">📎</span>
                )}
                <span className="text-industrial-300 max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveAttachment(index)}
                  className="text-industrial-500 hover:text-industrial-300"
                   title={t("chat.input.removeAttachment")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
