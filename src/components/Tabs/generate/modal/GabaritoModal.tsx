// components/modal/GabaritoModal.tsx
import React, {  useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/common/Button";
import { GabaritoData } from "@/types";

interface GabaritoModalProps {
  isOpen: boolean;
  onClose: () => void;
  gabarito: GabaritoData | null;
  onConfirm: (cols: number) => void;
}

export const GabaritoModal: React.FC<GabaritoModalProps> = ({
  isOpen,
  onClose,
  gabarito,
  onConfirm,
}) => {
  if (!gabarito) return;
  if (!gabarito.questoes) return;
  const length = gabarito.questoes[0].alternativas.length;
  const [cols] = useState(gabarito.questoes[0].alternativas.length);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-bold">Visualizar Gabarito</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-3 py-2">Nº</th>
                {Array.from({ length: length }).map((_, i) => (
                  <th key={i} className="border border-gray-300 px-3 py-2">
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gabarito.questoes.map((q) => (
                <tr key={q.numero}>
                  <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                    {q.numero}
                  </td>
                  {q.alternativas.slice(0, cols).map((letra) => (
                    <td
                      key={letra}
                      className="border border-gray-300 px-3 py-2 text-center"
                    >
                      {letra}
                    </td>
                  ))}
                  {q.alternativas.length < cols &&
                    Array.from({ length: cols - q.alternativas.length }).map(
                      (_, i) => (
                        <td
                          key={`empty-${i}`}
                          className="border border-gray-300 px-3 py-2"
                        />
                      )
                    )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm(gabarito.questoes[0].alternativas.length);
              onClose();
            }}
          >
            Incluir no documento
          </Button>
        </div>
      </div>
    </div>
  );
};
