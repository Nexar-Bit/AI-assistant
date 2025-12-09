import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { createConsultation } from "../../../api/consultations";
import { useConsultationStore } from "../../../stores/consultation.store";
import { Button } from "../../common/Button";
import { Input } from "../../common/Input";
import { useVehicles } from "../../../hooks/useVehicles";

const DRAFT_KEY = "consultation_draft";

function estimateTokens(text: string): number {
  if (!text.trim()) return 0;
  // rough heuristic: 1 token ≈ 4 chars
  return Math.ceil(text.length / 4);
}

export function ConsultationForm() {
  const [licensePlate, setLicensePlate] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const addConsultation = useConsultationStore((s) => s.addConsultation);
  const { vehicles } = useVehicles();

  // restore draft on mount
  useEffect(() => {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        licensePlate?: string;
        query?: string;
      };
      if (parsed.licensePlate) setLicensePlate(parsed.licensePlate);
      if (parsed.query) setQuery(parsed.query);
    } catch {
      // ignore parse errors
    }
  }, []);

  // auto-save draft
  useEffect(() => {
    const payload = { licensePlate, query };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  }, [licensePlate, query]);

  const suggestions = useMemo(
    () =>
      vehicles.filter((v) =>
        v.license_plate.toUpperCase().includes(licensePlate.toUpperCase()),
      ),
    [vehicles, licensePlate],
  );

  const tokenEstimate = useMemo(() => estimateTokens(query), [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await createConsultation({
        license_plate: licensePlate,
        query,
      });
      addConsultation(result);
      setResponse(result.ai_response);
    } catch (err) {
      console.error(err);
      setError("Failed to create consultation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Input
            label="License plate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            autoComplete="off"
          />
          {licensePlate && suggestions.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-slate-700 bg-slate-900 text-xs">
              {suggestions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setLicensePlate(v.license_plate)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-slate-100 hover:bg-slate-800"
                >
                  <span>{v.license_plate}</span>
                  <span className="text-[10px] text-slate-400">
                    {[v.make, v.model, v.year].filter(Boolean).join(" ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <label className="flex flex-col gap-1 text-sm text-slate-200">
          <span>Describe el problema</span>
          <textarea
            className="min-h-[160px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Soporta formato Markdown.</span>
          <span>Tokens estimados: {tokenEstimate}</span>
        </div>
        {error && (
          <div className="text-xs font-medium text-red-400">{error}</div>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Analizando..." : "Ejecutar diagnóstico"}
        </Button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">
          Resultado del diagnóstico IA
        </h3>
        <div className="min-h-[200px] rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
          {response ? (
            <ReactMarkdown className="prose prose-invert max-w-none text-sm">
              {response}
            </ReactMarkdown>
          ) : (
            <span className="text-slate-500">
              Results will appear here after running diagnostics.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


