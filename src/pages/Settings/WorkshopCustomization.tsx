/** Workshop customization settings component */

import React, { useState, useEffect } from "react";
import { useWorkshopStore } from "../../stores/workshop.store";
import { updateWorkshopCustomization } from "../../api/workshops";
import type {
  VehicleTemplate,
  QuickReply,
  DiagnosticCodeEntry,
} from "../../types/workshop.types";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useNotification } from "../../components/layout/NotificationProvider";

interface WorkshopCustomizationProps {
  onUpdate?: () => void;
}

export function WorkshopCustomization({ onUpdate }: WorkshopCustomizationProps) {
  const { currentWorkshop, setCurrentWorkshop } = useWorkshopStore();
  const { showSuccess, showCritical } = useNotification();
  const [loading, setLoading] = useState(false);

  // Form state
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [vehicleTemplates, setVehicleTemplates] = useState<
    Record<string, VehicleTemplate>
  >({});
  const [quickReplies, setQuickReplies] = useState<Record<string, QuickReply>>(
    {},
  );
  const [diagnosticCodes, setDiagnosticCodes] = useState<
    Record<string, DiagnosticCodeEntry>
  >({});

  // Load current customization
  useEffect(() => {
    if (currentWorkshop) {
      setLogoUrl(currentWorkshop.logo_url || "");
      setPrimaryColor(currentWorkshop.primary_color || "");
      setVehicleTemplates(currentWorkshop.vehicle_templates || {});
      setQuickReplies(currentWorkshop.quick_replies || {});
      setDiagnosticCodes(currentWorkshop.diagnostic_code_library || {});
    }
  }, [currentWorkshop]);

  const handleSave = async () => {
    if (!currentWorkshop) return;

    setLoading(true);
    try {
      const updated = await updateWorkshopCustomization(currentWorkshop.id, {
        logo_url: logoUrl || null,
        primary_color: primaryColor || null,
        vehicle_templates: Object.keys(vehicleTemplates).length > 0 ? vehicleTemplates : null,
        quick_replies: Object.keys(quickReplies).length > 0 ? quickReplies : null,
        diagnostic_code_library:
          Object.keys(diagnosticCodes).length > 0 ? diagnosticCodes : null,
      });

      setCurrentWorkshop(updated);
      showSuccess("Workshop customization updated successfully", "Success");
      onUpdate?.();
    } catch (err: any) {
      console.error("Failed to update customization:", err);
      showCritical(err.response?.data?.detail || "Failed to update customization", "Error");
    } finally {
      setLoading(false);
    }
  };

  // Color validation
  const isValidColor = (color: string): boolean => {
    if (!color) return true; // Empty is valid (will use default)
    return /^#[0-9A-Fa-f]{6}$/.test(color);
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
          Workshop Customization
        </h2>
        <p className="text-industrial-400 text-sm">
          Customize your workshop branding and default settings
        </p>
      </div>

      {/* Logo */}
      <div className="card-industrial p-6 space-y-4">
        <h3 className="text-lg font-semibold text-industrial-200">Logo</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-industrial-300">
            Logo URL
          </label>
          <Input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full"
          />
          {logoUrl && (
            <div className="mt-2">
              <p className="text-xs text-industrial-400 mb-2">Preview:</p>
              <img
                src={logoUrl}
                alt="Logo preview"
                className="w-20 h-20 object-contain rounded-lg border border-industrial-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Primary Color */}
      <div className="card-industrial p-6 space-y-4">
        <h3 className="text-lg font-semibold text-industrial-200">
          Primary Accent Color
        </h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-industrial-300">
            Color (Hex)
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#0073e6"
              className="w-32"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            <input
              type="color"
              value={primaryColor || "#0073e6"}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-10 rounded border border-industrial-700 cursor-pointer"
            />
            {primaryColor && (
              <div
                className="w-16 h-10 rounded border border-industrial-700"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </div>
          {primaryColor && !isValidColor(primaryColor) && (
            <p className="text-xs text-error-400">
              Invalid color format. Use hex format (e.g., #0073e6)
            </p>
          )}
          <p className="text-xs text-industrial-500">
            Color must meet accessibility standards (WCAG AA contrast)
          </p>
        </div>
      </div>

      {/* Vehicle Templates */}
      <div className="card-industrial p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-industrial-200">
            Vehicle Templates
          </h3>
          <Button
            variant="secondary"
            onClick={() => {
              const id = `template-${Date.now()}`;
              setVehicleTemplates({
                ...vehicleTemplates,
                [id]: {
                  name: "New Template",
                  make: "",
                  model: "",
                  year: undefined,
                  engine_type: "",
                  fuel_type: "",
                },
              });
            }}
          >
            Add Template
          </Button>
        </div>
        <div className="space-y-3">
          {Object.entries(vehicleTemplates).map(([id, template]) => (
            <div
              key={id}
              className="p-4 bg-industrial-900 rounded-lg border border-industrial-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Input
                  value={template.name}
                  onChange={(e) =>
                    setVehicleTemplates({
                      ...vehicleTemplates,
                      [id]: { ...template, name: e.target.value },
                    })
                  }
                  placeholder="Template name"
                  className="flex-1 mr-2"
                />
                <Button
                  variant="danger"
                  onClick={() => {
                    const { [id]: _, ...rest } = vehicleTemplates;
                    setVehicleTemplates(rest);
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={template.make || ""}
                  onChange={(e) =>
                    setVehicleTemplates({
                      ...vehicleTemplates,
                      [id]: { ...template, make: e.target.value },
                    })
                  }
                  placeholder="Make"
                />
                <Input
                  value={template.model || ""}
                  onChange={(e) =>
                    setVehicleTemplates({
                      ...vehicleTemplates,
                      [id]: { ...template, model: e.target.value },
                    })
                  }
                  placeholder="Model"
                />
                <Input
                  type="number"
                  value={template.year || ""}
                  onChange={(e) =>
                    setVehicleTemplates({
                      ...vehicleTemplates,
                      [id]: {
                        ...template,
                        year: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  placeholder="Year"
                />
                <Input
                  value={template.engine_type || ""}
                  onChange={(e) =>
                    setVehicleTemplates({
                      ...vehicleTemplates,
                      [id]: { ...template, engine_type: e.target.value },
                    })
                  }
                  placeholder="Engine Type"
                />
              </div>
            </div>
          ))}
          {Object.keys(vehicleTemplates).length === 0 && (
            <p className="text-sm text-industrial-500 text-center py-4">
              No vehicle templates. Add one to get started.
            </p>
          )}
        </div>
      </div>

      {/* Quick Replies */}
      <div className="card-industrial p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-industrial-200">
            Quick Replies
          </h3>
          <Button
            variant="secondary"
            onClick={() => {
              const id = `reply-${Date.now()}`;
              setQuickReplies({
                ...quickReplies,
                [id]: {
                  label: "New Reply",
                  message: "",
                  category: "general",
                },
              });
            }}
          >
            Add Reply
          </Button>
        </div>
        <div className="space-y-3">
          {Object.entries(quickReplies).map(([id, reply]) => (
            <div
              key={id}
              className="p-4 bg-industrial-900 rounded-lg border border-industrial-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Input
                  value={reply.label}
                  onChange={(e) =>
                    setQuickReplies({
                      ...quickReplies,
                      [id]: { ...reply, label: e.target.value },
                    })
                  }
                  placeholder="Reply label"
                  className="flex-1 mr-2"
                />
                <Button
                  variant="danger"
                  onClick={() => {
                    const { [id]: _, ...rest } = quickReplies;
                    setQuickReplies(rest);
                  }}
                >
                  Remove
                </Button>
              </div>
              <textarea
                value={reply.message}
                onChange={(e) =>
                  setQuickReplies({
                    ...quickReplies,
                    [id]: { ...reply, message: e.target.value },
                  })
                }
                placeholder="Message text"
                className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                rows={3}
              />
              <Input
                value={reply.category || ""}
                onChange={(e) =>
                  setQuickReplies({
                    ...quickReplies,
                    [id]: { ...reply, category: e.target.value },
                  })
                }
                placeholder="Category (optional)"
              />
            </div>
          ))}
          {Object.keys(quickReplies).length === 0 && (
            <p className="text-sm text-industrial-500 text-center py-4">
              No quick replies. Add one to get started.
            </p>
          )}
        </div>
      </div>

      {/* Diagnostic Code Library */}
      <div className="card-industrial p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-industrial-200">
            Diagnostic Code Library
          </h3>
          <Button
            variant="secondary"
            onClick={() => {
              const id = `code-${Date.now()}`;
              setDiagnosticCodes({
                ...diagnosticCodes,
                [id]: {
                  code: "",
                  description: "",
                  severity: "warning",
                },
              });
            }}
          >
            Add Code
          </Button>
        </div>
        <div className="space-y-3">
          {Object.entries(diagnosticCodes).map(([id, code]) => (
            <div
              key={id}
              className="p-4 bg-industrial-900 rounded-lg border border-industrial-700 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={code.code}
                  onChange={(e) =>
                    setDiagnosticCodes({
                      ...diagnosticCodes,
                      [id]: { ...code, code: e.target.value.toUpperCase() },
                    })
                  }
                  placeholder="P0301"
                  className="w-24 font-mono"
                  pattern="^[PBCU]\\d{4}$"
                />
                <select
                  value={code.severity}
                  onChange={(e) =>
                    setDiagnosticCodes({
                      ...diagnosticCodes,
                      [id]: {
                        ...code,
                        severity: e.target.value as "critical" | "warning" | "info",
                      },
                    })
                  }
                  className="px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <Button
                  variant="danger"
                  onClick={() => {
                    const { [id]: _, ...rest } = diagnosticCodes;
                    setDiagnosticCodes(rest);
                  }}
                >
                  Remove
                </Button>
              </div>
              <Input
                value={code.description}
                onChange={(e) =>
                  setDiagnosticCodes({
                    ...diagnosticCodes,
                    [id]: { ...code, description: e.target.value },
                  })
                }
                placeholder="Code description"
              />
              <textarea
                value={code.notes || ""}
                onChange={(e) =>
                  setDiagnosticCodes({
                    ...diagnosticCodes,
                    [id]: { ...code, notes: e.target.value },
                  })
                }
                placeholder="Additional notes (optional)"
                className="w-full px-4 py-2 bg-industrial-800 border border-industrial-700 rounded-lg text-industrial-100 placeholder:text-industrial-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                rows={2}
              />
            </div>
          ))}
          {Object.keys(diagnosticCodes).length === 0 && (
            <p className="text-sm text-industrial-500 text-center py-4">
              No diagnostic codes. Add one to get started.
            </p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Customization"}
        </Button>
      </div>
    </div>
  );
}

