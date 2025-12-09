/** Context panel with vehicle details, session highlights, error codes, suggestions */

import React from "react";
import { useTranslation } from "react-i18next";
import { CarIcon, SpeedometerIcon, AlertIcon, WrenchIcon } from "../icons/AutomotiveIcons";
import { DiagnosticCode } from "../common/DiagnosticCode";
import { VehicleDetailsPanel } from "../vehicle/VehicleDetailsPanel";

interface ContextPanelProps {
  vehicleId?: string;
  vehicleData?: {
    license_plate: string;
    make?: string;
    model?: string;
    year?: number;
    current_km?: number;
    engine_type?: string;
    fuel_type?: string;
  };
  errorCodes?: string[];
  sessionHighlights?: string[];
  suggestedQuestions?: string[];
  onSuggestedQuestionClick?: (question: string) => void;
}

export function ContextPanel({
  vehicleId,
  vehicleData,
  errorCodes = [],
  sessionHighlights = [],
  suggestedQuestions = [],
  onSuggestedQuestionClick,
}: ContextPanelProps) {
  const { t } = useTranslation();
  
  const getErrorCodeExplanation = (code: string): string => {
    const key = `chat.errorCodes.${code}`;
    const translation = t(key);
    return translation !== key ? translation : "";
  };
  
  return (
    <div className="space-y-4">
      {/* Vehicle Details Summary */}
      {vehicleData && (
        <div className="card-industrial">
          <div className="flex items-center gap-2 mb-3">
            <CarIcon size={18} className="text-primary-400" />
            <h3 className="font-semibold text-industrial-200 text-sm">
              {t("chat.contextPanel.vehicleSummary")}
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-industrial-400">{t("chat.contextPanel.license")}</span>
              <span className="text-industrial-200 font-semibold">
                {vehicleData.license_plate}
              </span>
            </div>
            {vehicleData.make && vehicleData.model && (
              <div className="flex justify-between">
                <span className="text-industrial-400">{t("chat.contextPanel.makeModel")}</span>
                <span className="text-industrial-200">
                  {vehicleData.make} {vehicleData.model}
                </span>
              </div>
            )}
            {vehicleData.current_km && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <SpeedometerIcon size={14} className="text-industrial-500" />
                  <span className="text-industrial-400">{t("chat.contextPanel.currentKm")}</span>
                </div>
                <span className="text-industrial-200 font-semibold">
                  {vehicleData.current_km.toLocaleString()} km
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Code Explanations */}
      {errorCodes.length > 0 && (
        <div className="card-industrial">
          <div className="flex items-center gap-2 mb-3">
            <AlertIcon size={18} className="text-warning-400" />
            <h3 className="font-semibold text-industrial-200 text-sm">
              {t("chat.contextPanel.errorCodes")}
            </h3>
          </div>
          <div className="space-y-2">
            {errorCodes.map((code) => {
              const explanation = getErrorCodeExplanation(code);
              return (
                <div key={code} className="space-y-1">
                  <DiagnosticCode code={code} variant="error" />
                  {explanation && (
                    <p className="text-xs text-industrial-400 pl-2">
                      {explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Previous Session Highlights */}
      {sessionHighlights.length > 0 && (
        <div className="card-industrial">
          <div className="flex items-center gap-2 mb-3">
            <WrenchIcon size={18} className="text-primary-400" />
            <h3 className="font-semibold text-industrial-200 text-sm">
              {t("chat.contextPanel.sessionHighlights")}
            </h3>
          </div>
          <ul className="space-y-2 text-sm">
            {sessionHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">•</span>
                <span className="text-industrial-300">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Next Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="card-industrial">
          <h3 className="font-semibold text-industrial-200 text-sm mb-3">
            {t("chat.contextPanel.suggestedQuestions")}
          </h3>
          <div className="space-y-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestedQuestionClick?.(question)}
                className="w-full text-left px-3 py-2 glass-light rounded-lg hover:bg-industrial-800 transition-colors text-sm text-industrial-300 hover:text-industrial-100"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full Vehicle Details (if vehicleId provided) */}
      {vehicleId && (
        <div>
          <VehicleDetailsPanel vehicleId={vehicleId} />
        </div>
      )}
    </div>
  );
}

