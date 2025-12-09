/** Detailed token usage report modal */

import React from "react";
import { Modal } from "../common/Modal";
import { TokenMeter } from "./TokenMeter";

interface TokenUsageReportModalProps {
  open: boolean;
  onClose: () => void;
  tokenData: {
    used: number;
    limit: number;
    inputTokens?: number;
    outputTokens?: number;
    label: string;
    period?: string;
    resetDate?: string;
    breakdown?: {
      date: string;
      input: number;
      output: number;
      total: number;
    }[];
  };
}

export function TokenUsageReportModal({
  open,
  onClose,
  tokenData,
}: TokenUsageReportModalProps) {
  return (
    <Modal title={`Reporte de uso de tokens - ${tokenData.label}`} open={open} onClose={onClose}>
      <div className="space-y-6">
        {/* Summary */}
        <div className="card-industrial">
          <h3 className="text-sm font-semibold text-industrial-200 mb-3">Resumen</h3>
          <TokenMeter
            used={tokenData.used}
            limit={tokenData.limit}
            inputTokens={tokenData.inputTokens}
            outputTokens={tokenData.outputTokens}
            showPercentage={true}
          />
          {tokenData.period && (
            <div className="mt-3 text-xs text-industrial-500">
              Período: {tokenData.period}
            </div>
          )}
          {tokenData.resetDate && (
            <div className="mt-1 text-xs text-industrial-500">
              Reinicia: {new Date(tokenData.resetDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Breakdown Table */}
        {tokenData.breakdown && tokenData.breakdown.length > 0 && (
          <div className="card-industrial">
            <h3 className="text-sm font-semibold text-industrial-200 mb-3">Desglose diario</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-industrial-700">
                    <th className="text-left py-2 px-3 text-industrial-400 font-semibold">Fecha</th>
                    <th className="text-right py-2 px-3 text-industrial-400 font-semibold">Entrada</th>
                    <th className="text-right py-2 px-3 text-industrial-400 font-semibold">Salida</th>
                    <th className="text-right py-2 px-3 text-industrial-400 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenData.breakdown.map((day, idx) => (
                    <tr key={idx} className="border-b border-industrial-800/50">
                      <td className="py-2 px-3 text-industrial-300">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-right text-industrial-200 font-mono">
                        {day.input.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-industrial-200 font-mono">
                        {day.output.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-industrial-100 font-mono font-semibold">
                        {day.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-industrial-700 hover:bg-industrial-600 text-industrial-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

