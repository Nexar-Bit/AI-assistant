/** Workshop general settings component */

import React, { useState, useEffect } from "react";
import { useWorkshopStore } from "../../stores/workshop.store";
import { updateWorkshop } from "../../api/workshops";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useNotification } from "../../components/layout/NotificationProvider";

interface WorkshopSettingsProps {
  onUpdate?: () => void;
}

export function WorkshopSettings({ onUpdate }: WorkshopSettingsProps) {
  const { currentWorkshop, setCurrentWorkshop } = useWorkshopStore();
  const { showSuccess, showCritical } = useNotification();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyTokenLimit, setMonthlyTokenLimit] = useState<number>(100000);

  // Load current settings
  useEffect(() => {
    if (currentWorkshop) {
      setName(currentWorkshop.name || "");
      setDescription(currentWorkshop.description || "");
      setMonthlyTokenLimit(currentWorkshop.monthly_token_limit || 100000);
    }
  }, [currentWorkshop]);

  const handleSave = async () => {
    if (!currentWorkshop) return;

    if (!name.trim()) {
      showCritical("Workshop name is required", "Validation Error");
      return;
    }

    if (monthlyTokenLimit < 0) {
      showCritical("Monthly token limit must be a positive number", "Validation Error");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateWorkshop(currentWorkshop.id, {
        name: name.trim(),
        description: description.trim() || null,
        monthly_token_limit: monthlyTokenLimit,
      });

      setCurrentWorkshop(updated);
      showSuccess("Workshop settings updated successfully", "Success");
      onUpdate?.();
    } catch (err: any) {
      console.error("Failed to update workshop settings:", err);
      showCritical(err.response?.data?.detail || "Failed to update workshop settings", "Error");
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkshop) {
    return (
      <div className="card-industrial p-6 text-center">
        <p className="text-industrial-400">No workshop selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-industrial-200 mb-2">
          Workshop Settings
        </h2>
        <p className="text-industrial-400 text-sm">
          Manage your workshop's general information and limits
        </p>
      </div>

      {/* Workshop Name */}
      <div className="card-industrial p-6 space-y-4">
        <h3 className="text-lg font-semibold text-industrial-200">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-2">
              Workshop Name *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workshop"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Workshop description..."
              className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Token Limits */}
      <div className="card-industrial p-6 space-y-4">
        <h3 className="text-lg font-semibold text-industrial-200">Token Limits</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-2">
              Monthly Token Limit
            </label>
            <Input
              type="number"
              value={monthlyTokenLimit}
              onChange={(e) => setMonthlyTokenLimit(parseInt(e.target.value) || 0)}
              placeholder="100000"
              className="w-full"
              min="0"
            />
            <p className="text-xs text-industrial-500 mt-1">
              Maximum number of tokens that can be used per month for this workshop
            </p>
          </div>
        </div>
      </div>

      {/* Workshop Info (Read-only) */}
      <div className="card-industrial p-6 space-y-4">
        <h3 className="text-lg font-semibold text-industrial-200">Workshop Information</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-1">
              Workshop ID
            </label>
            <p className="text-sm text-industrial-400 font-mono">{currentWorkshop.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-1">
              Slug
            </label>
            <p className="text-sm text-industrial-400">{currentWorkshop.slug || "-"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-industrial-300 mb-1">
              Status
            </label>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                currentWorkshop.is_active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${currentWorkshop.is_active ? "bg-emerald-400" : "bg-red-400"}`}
              ></span>
              {currentWorkshop.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          {currentWorkshop.created_at && (
            <div>
              <label className="block text-sm font-medium text-industrial-300 mb-1">
                Created At
              </label>
              <p className="text-sm text-industrial-400">
                {new Date(currentWorkshop.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

