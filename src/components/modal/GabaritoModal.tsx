import React, { useState } from "react";
import { X, ClipboardList, Check } from "lucide-react";
import Button from "@/components/common/Button";
import Portal from "@/components/common/Portal";
import { GabaritoData } from "@/types/question";

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
  if (!gabarito) return null;
  if (!gabarito.questoes) return null;
  const length = gabarito.questoes[0].alternativas.length;
  const [cols] = useState(gabarito.questoes[0].alternativas.length);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-2 mx-4 border border-gray-100 animate-scaleIn">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 ">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                  Visualizar Gabarito
                </h3>
                <p className="text-xs text-gray-500">
                  {gabarito.questoes.length} questões de múltipla escolha
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-white to-gray-50/50">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-md">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <th className="px-4 py-3 text-sm font-semibold">Nº</th>
                    {Array.from({ length: length }).map((_, i) => (
                      <th key={i} className="px-4 py-3 text-sm font-semibold">
                        {String.fromCharCode(65 + i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gabarito.questoes.map((q, idx) => (
                    <tr
                      key={q.numero}
                      className={`transition-colors duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-primary-50/50"
                      } hover:bg-primary-100/50`}
                    >
                      <td className="border-t border-gray-100 px-4 py-3 text-center font-bold text-primary-700">
                        {q.numero}
                      </td>
                      {q.alternativas.slice(0, cols).map((letra) => (
                        <td
                          key={letra}
                          className="border-t border-gray-100 px-4 py-3 text-center text-gray-700"
                        >
                          {letra}
                        </td>
                      ))}
                      {q.alternativas.length < cols &&
                        Array.from({
                          length: cols - q.alternativas.length,
                        }).map((_, i) => (
                          <td
                            key={`empty-${i}`}
                            className="border-t border-gray-100 px-4 py-3"
                          />
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              variant="custom"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
            >
              Cancelar
            </Button>
            <Button
              variant="custom"
              icon={Check}
              onClick={() => {
                onConfirm(gabarito.questoes[0].alternativas.length);
                onClose();
              }}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-[1.02]"
            >
              Incluir no documento
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
