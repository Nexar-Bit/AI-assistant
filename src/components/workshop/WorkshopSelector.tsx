import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchWorkshops, createWorkshop } from "../../api/workshops";
import { useWorkshopStore } from "../../stores/workshop.store";
import { useNotification } from "../../components/layout/NotificationProvider";
import type { Workshop } from "../../types/workshop.types";
import { Button } from "../common/Button";
import { Input } from "../common/Input";

export function WorkshopSelector() {
  const { currentWorkshop, workshops, setCurrentWorkshop, setWorkshops } =
    useWorkshopStore();
  const { showSuccess, showCritical } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    name: "",
    description: "",
    monthly_token_limit: 100000,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWorkshops();
      setWorkshops(response.workshops);
      
      // Auto-select first workshop if none selected
      if (!currentWorkshop && response.workshops.length > 0) {
        setCurrentWorkshop(response.workshops[0]);
      }
    } catch (err: any) {
      console.error("Failed to load workshops:", err);
      setError(err.response?.data?.detail || "Failed to load workshops");
    } finally {
      setLoading(false);
    }
  };

  if (loading && workshops.length === 0) {
    return (
      <div className="glass rounded-lg p-4 animate-fade-in">
        <div className="text-sm text-slate-400">Loading workshops...</div>
      </div>
    );
  }

  if (error && workshops.length === 0) {
    return (
      <div className="glass rounded-lg p-4 border border-red-500/20 animate-fade-in">
        <div className="text-sm text-red-400">{error}</div>
        <Button
          variant="secondary"
          className="mt-2 text-xs"
          onClick={loadWorkshops}
        >
          Retry
        </Button>
      </div>
    );
  }

  const handleCreateWorkshop = async () => {
    if (!createData.name.trim()) {
      showCritical("Workshop name is required", "Validation Error");
      return;
    }

    setCreating(true);
    try {
      const newWorkshop = await createWorkshop({
        name: createData.name.trim(),
        description: createData.description.trim() || undefined,
        monthly_token_limit: createData.monthly_token_limit,
      });
      
      // Refresh workshops list
      await loadWorkshops();
      
      // Auto-select the newly created workshop
      setCurrentWorkshop(newWorkshop);
      
      setShowCreateModal(false);
      setCreateData({ name: "", description: "", monthly_token_limit: 100000 });
      showSuccess("Workshop created successfully!", "Success");
    } catch (err: any) {
      console.error("Failed to create workshop:", err);
      showCritical(err.response?.data?.detail || "Failed to create workshop", "Error");
    } finally {
      setCreating(false);
    }
  };

  if (workshops.length === 0) {
    return (
      <>
        <div className="glass rounded-lg p-4 animate-fade-in">
          <div className="text-sm text-slate-400 mb-3">No workshops available</div>
          <p className="text-xs text-slate-500 mb-4">
            Create your first workshop to get started. You'll become the owner.
          </p>
          <Button 
            variant="primary" 
            className="text-xs w-full"
            onClick={() => setShowCreateModal(true)}
          >
            Create Workshop
          </Button>
        </div>

        {/* Create Workshop Modal - Rendered via Portal */}
        {showCreateModal && createPortal(
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              margin: 0,
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="card max-w-md w-full max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-6 flex-shrink-0 pb-4 border-b border-slate-700/50">
                <h2 className="text-xl font-bold text-industrial-100">
                  Create New Workshop
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateData({ name: "", description: "", monthly_token_limit: 100000 });
                  }}
                  className="text-industrial-400 hover:text-industrial-200 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
                <div>
                  <Input
                    label="Workshop Name *"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    placeholder="My Workshop"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-industrial-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={createData.description}
                    onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                    placeholder="Workshop description..."
                    className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    rows={3}
                  />
                </div>

                <div>
                  <Input
                    label="Monthly Token Limit"
                    type="number"
                    value={createData.monthly_token_limit}
                    onChange={(e) => setCreateData({ ...createData, monthly_token_limit: parseInt(e.target.value) || 100000 })}
                    min="0"
                  />
                  <p className="text-xs text-industrial-500 mt-1">
                    Maximum tokens that can be used per month for this workshop
                  </p>
                </div>

              <div className="flex gap-3 pt-4 flex-shrink-0 border-t border-slate-700/50 mt-4">
                <button
                  onClick={handleCreateWorkshop}
                  disabled={creating || !createData.name.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Workshop"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateData({ name: "", description: "", monthly_token_limit: 100000 });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      </>
    );
  }

  return (
    <div className="glass rounded-lg p-3 animate-fade-in">
      <label className="block text-xs font-medium text-slate-300 mb-2">
        Current Workshop
      </label>
      <select
        value={currentWorkshop?.id || ""}
        onChange={(e) => {
          const workshop = workshops.find((w) => w.id === e.target.value);
          if (workshop) setCurrentWorkshop(workshop);
        }}
        className="w-full glass rounded-lg border border-slate-700/50 px-3 py-2 text-sm text-slate-100 focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all bg-slate-900/50"
      >
        {workshops.map((workshop) => (
          <option key={workshop.id} value={workshop.id}>
            {workshop.name}
            {workshop.tokens_used_this_month > 0 && (
              <span className="text-slate-500">
                {" "}
                ({workshop.tokens_used_this_month.toLocaleString()} tokens used)
              </span>
            )}
          </option>
        ))}
      </select>
      {currentWorkshop && (
        <div className="mt-2 text-xs text-slate-400">
          <div>
            Monthly limit: {currentWorkshop.monthly_token_limit.toLocaleString()} tokens
          </div>
          <div>
            Used: {currentWorkshop.tokens_used_this_month.toLocaleString()} tokens
          </div>
        </div>
      )}
    </div>
  );
}

