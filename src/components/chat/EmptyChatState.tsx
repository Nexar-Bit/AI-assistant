/** Empty chat state component - shown when no active consultations */

import React from "react";
import { Button } from "../common/Button";
import { CarIcon } from "../icons/AutomotiveIcons";

interface EmptyChatStateProps {
  onCreateSession?: () => void;
}

export function EmptyChatState({ onCreateSession }: EmptyChatStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="card-industrial max-w-md w-full text-center space-y-6 py-12 px-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center">
            <CarIcon size={40} className="text-primary-400" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-semibold text-industrial-200 mb-2">
            No hay consultas activas
          </h3>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-left">
          <p className="text-sm text-industrial-400">
            Inicia una nueva sesión de diagnóstico:
          </p>
          <ol className="space-y-2 text-sm text-industrial-300 list-decimal list-inside">
            <li className="pl-2">
              Seleccionando un vehículo de tu taller
            </li>
            <li className="pl-2">
              Ingresando códigos de error o síntomas
            </li>
            <li className="pl-2">
              Preguntando a nuestro asistente de IA para obtener orientación
            </li>
          </ol>
        </div>

        {/* CTA Button */}
        {onCreateSession && (
          <div className="pt-4">
            <Button
              onClick={onCreateSession}
              className="w-full flex items-center justify-center gap-2"
            >
              <CarIcon size={20} />
              <span>Iniciar nuevo diagnóstico</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

