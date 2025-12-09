/** Session search component with filters */

import React, { useState } from "react";
import { SearchIcon, FilterIcon, XIcon } from "../icons/AutomotiveIcons";

interface SessionSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange?: (filters: SessionFilters) => void;
  filters?: SessionFilters;
}

export interface SessionFilters {
  status?: "active" | "completed" | "archived" | "all";
  is_resolved?: boolean | null;
  license_plate?: string;
}

export function SessionSearch({
  searchQuery,
  onSearchChange,
  onFilterChange,
  filters = {},
}: SessionSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-industrial-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar sesiones por placa, título..."
          className="input-industrial w-full pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-industrial-500 hover:text-industrial-300"
          >
            <XIcon size={18} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-xs text-industrial-400 hover:text-industrial-300 transition-colors"
      >
        <FilterIcon size={16} />
        <span>Filtros</span>
        {showFilters && <span className="text-primary-400">●</span>}
      </button>

      {/* Filter Panel */}
      {showFilters && onFilterChange && (
        <div className="glass rounded-lg p-3 space-y-3 animate-slide-up">
          <div>
            <label className="text-xs text-industrial-400 mb-1 block">Estado</label>
            <select
              value={filters.status || "all"}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  status: e.target.value === "all" ? undefined : (e.target.value as any),
                })
              }
              className="input-industrial text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-industrial-400 mb-1 block">Resuelto</label>
            <select
              value={
                filters.is_resolved === true
                  ? "resolved"
                  : filters.is_resolved === false
                  ? "unresolved"
                  : "all"
              }
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  is_resolved:
                    e.target.value === "all"
                      ? null
                      : e.target.value === "resolved"
                      ? true
                      : false,
                })
              }
              className="input-industrial text-sm"
            >
              <option value="all">Todos</option>
              <option value="resolved">Resuelto</option>
              <option value="unresolved">Sin resolver</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-industrial-400 mb-1 block">Placa</label>
            <input
              type="text"
              value={filters.license_plate || ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  license_plate: e.target.value || undefined,
                })
              }
              placeholder="Filtrar por placa..."
              className="input-industrial text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

