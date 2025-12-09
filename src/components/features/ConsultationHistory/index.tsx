import { useMemo, useState } from "react";
import { useConsultations } from "../../../hooks/useConsultations";
import { Table } from "../../common/Table";
import { formatDateTime } from "../../../utils/formatters";
import { Button } from "../../common/Button";
import { updateConsultation } from "../../../api/consultations";
import { downloadPDF } from "../../../api/reports";
import { useNotification } from "../../../components/layout/NotificationProvider";
import type { Consultation } from "../../../types/consultation.types";

export function ConsultationHistory() {
  const { consultations, loading, error, hasMore, loadMore, filters, setFilters } =
    useConsultations();
  const { showSuccess, showCritical } = useNotification();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);

  const allSelected = useMemo(
    () => consultations.length > 0 && selected.size === consultations.length,
    [consultations, selected],
  );

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(consultations.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportCsv = () => {
    if (consultations.length === 0) return;
    const headers = [
      "id",
      "created_at",
      "license_plate",
      "total_tokens",
      "is_resolved",
    ];
    const rows = consultations.map((c) => [
      c.id,
      c.created_at,
      c.license_plate,
      String(c.total_tokens),
      String(c.is_resolved),
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consultations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkResolve = async () => {
    const ids = Array.from(selected);
    const toUpdate: Consultation[] = consultations.filter((c) =>
      ids.includes(c.id),
    );
    await Promise.all(
      toUpdate.map((c) =>
        updateConsultation(c.id, { is_resolved: true, version: (c as any).version ?? 1 }),
      ),
    );
    window.location.reload(); // simple refresh to reflect changes
  };

  const handleDownloadPDF = async (consultationId: string, licensePlate: string) => {
    setDownloading(consultationId);
    try {
      const filename = `consultation-${licensePlate}-${new Date().toISOString().split('T')[0]}.pdf`;
      await downloadPDF(consultationId, filename);
      showSuccess("PDF descargado exitosamente", "Descarga completa");
    } catch (error: any) {
      console.error("Failed to download PDF:", error);
      showCritical(error.message || "No se pudo descargar el PDF. Por favor revisa los logs del servidor para más detalles.", "Error");
    } finally {
      setDownloading(null);
    }
  };

  if (loading && consultations.length === 0) {
    return (
      <div className="card flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-industrial-400">Cargando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-industrial-300">Placa</label>
          <input
            className="input-industrial"
            value={filters.license_plate || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                license_plate: e.target.value || undefined,
              })
            }
            placeholder="ABC-123"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-industrial-300">Estado</label>
          <select
            className="input-industrial"
            value={
              filters.is_resolved === undefined
                ? ""
                : filters.is_resolved
                  ? "resolved"
                  : "pending"
            }
            onChange={(e) => {
              const val = e.target.value;
              setFilters({
                ...filters,
                is_resolved:
                  val === ""
                    ? undefined
                    : val === "resolved"
                      ? true
                      : false,
              });
            }}
          >
            <option value="">Todos</option>
            <option value="resolved">Resueltas</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-industrial-300">From</label>
          <input
            type="date"
            className="input-industrial"
            value={filters.start_date || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                start_date: e.target.value || undefined,
              })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-industrial-300">To</label>
          <input
            type="date"
            className="input-industrial"
            value={filters.end_date || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                end_date: e.target.value || undefined,
              })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-industrial-300">Buscar</label>
          <input
            className="input-industrial"
            placeholder="Texto de consulta / respuesta"
            value={filters.q || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                q: e.target.value || undefined,
              })
            }
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            type="button"
            className="text-xs"
            onClick={handleExportCsv}
            disabled={consultations.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            type="button"
            className="text-xs"
            onClick={handleBulkResolve}
            disabled={selected.size === 0}
          >
            Mark resolved ({selected.size})
          </Button>
        </div>
      </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 animate-slide-up">
          {error}
        </div>
      )}

      {consultations.length === 0 && !loading ? (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-industrial-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-industrial-400 font-medium">No hay consultas que coincidan con los filtros actuales.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <Table>
            <thead className="bg-industrial-800/50 border-b border-industrial-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-industrial-600 bg-industrial-800 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  License plate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Tokens
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-industrial-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-800/50">
              {consultations.map((c) => (
                <tr key={c.id} className="hover:bg-industrial-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      className="rounded border-industrial-600 bg-industrial-800 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    {formatDateTime(c.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-industrial-100">
                    {c.license_plate}
                  </td>
                  <td className="px-4 py-3 text-sm text-industrial-300">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-industrial-800/50">
                      {c.total_tokens}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.is_resolved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${c.is_resolved ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                      {c.is_resolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDownloadPDF(c.id, c.license_plate)}
                      disabled={downloading === c.id}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Download PDF report"
                    >
                      {downloading === c.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Descargando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar PDF
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {hasMore && (
        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            className="text-xs"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}
    </div>
  );
}


