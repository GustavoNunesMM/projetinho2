import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Select from "@/components/common/Select";
import Portal from "@/components/common/Portal";
import { TestFormData } from "@/types/test";
import { useQuestions } from "@/hooks/useQuestions";

interface SaveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testData: TestFormData) => Promise<void>;
  fileName: string;
  fileSize: number;
  filePath: string;
}

export const SaveTestModal: React.FC<SaveTestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fileName,
  fileSize,
  filePath,
}) => {
  const { questions } = useQuestions();
  const [formData, setFormData] = useState<TestFormData>({
    title: "",
    description: "",
    filePath: filePath,
    fileName: fileName,
    fileSize: fileSize,
    schoolYear: "",
    subject: "",
    quarter: "",
    schoolUnit: "",
    category: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const uniqueSubjects = Array.from(
    new Set(questions.map((q) => q.subject).filter(Boolean)),
  ).sort();
  const uniqueCategories = Array.from(
    new Set(questions.map((q) => q.category).filter(Boolean)),
  ).sort();

  const schoolYears = [
    "1º Ano",
    "2º Ano",
    "3º Ano",
    "4º Ano",
    "5º Ano",
    "6º Ano",
    "7º Ano",
    "8º Ano",
    "9º Ano",
    "1º Ano EM",
    "2º Ano EM",
    "3º Ano EM",
  ];
  const quarters = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];
  const schoolUnits = ["Unidade 1", "Unidade 2", "Unidade 3"];

  useEffect(() => {
    if (isOpen) {
      const baseTitle = fileName.replace(".docx", "").replace(".pdf", "");
      setFormData((prev) => ({
        ...prev,
        title: baseTitle,
        filePath: filePath,
        fileName: fileName,
        fileSize: fileSize,
      }));
    }
  }, [isOpen, fileName, filePath, fileSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
      setFormData({
        title: "",
        description: "",
        filePath: "",
        fileName: "",
        fileSize: 0,
        schoolYear: "",
        subject: "",
        quarter: "",
        schoolUnit: "",
        category: "",
        tags: "",
      });
    } catch (error) {
      console.error("Erro ao salvar teste:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-scaleIn">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Salvar como Prova
                </h2>
                <p className="text-sm text-gray-500">
                  Preencha os dados da prova
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Input
              label="Título"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              placeholder="Ex: Prova de Matemática - 1º Bimestre"
            />

            <Textarea
              label="Descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Descrição opcional da prova"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Ano/Série"
                value={formData.schoolYear}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    schoolYear: e.target.value,
                  }))
                }
                options={schoolYears.map((year) => ({
                  value: year,
                  label: year,
                }))}
                placeholder="Selecione o ano"
              />

              <Select
                label="Disciplina"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                options={uniqueSubjects.map((subject) => ({
                  value: subject,
                  label: subject,
                }))}
                placeholder="Selecione a disciplina"
              />

              <Select
                label="Bimestre"
                value={formData.quarter}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quarter: e.target.value }))
                }
                options={quarters.map((quarter) => ({
                  value: quarter,
                  label: quarter,
                }))}
                placeholder="Selecione o bimestre"
              />

              <Select
                label="Unidade Escolar"
                value={formData.schoolUnit}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    schoolUnit: e.target.value,
                  }))
                }
                options={schoolUnits.map((unit) => ({
                  value: unit,
                  label: unit,
                }))}
                placeholder="Selecione a unidade"
              />

              <Select
                label="Categoria"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                options={uniqueCategories.map((category) => ({
                  value: category,
                  label: category,
                }))}
                placeholder="Selecione a categoria"
              />

              <Input
                label="Tags (separadas por vírgula)"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="Ex: prova, matemática, avaliação"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="custom"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="custom"
                onClick={() => {}}
                disabled={saving || !formData.title.trim()}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-medium"
              >
                {saving ? "Salvando..." : "Salvar Prova"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};
