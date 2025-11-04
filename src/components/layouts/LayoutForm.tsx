import { Lock } from "lucide-react";
import { Switch } from "@heroui/react";
import Select from "../common/Select.tsx";
import Input from "../common/Input.tsx";
import { LayoutFormData } from "../../types/layout.ts";

interface LayoutFormProps {
  formData: LayoutFormData;
  setFormData: React.Dispatch<React.SetStateAction<LayoutFormData>>;
}

const LayoutForm = ({ formData, setFormData }: LayoutFormProps) => {
  const updateField = <K extends keyof LayoutFormData>(
    field: K,
    value: LayoutFormData[K]
  ) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const fontOptions = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Calibri", label: "Calibri" },
    { value: "Verdana", label: "Verdana" },
  ];

  const spacingOptions = [
    { value: "1", label: "Simples (1.0)" },
    { value: "1.15", label: "1.15" },
    { value: "1.5", label: "1.5" },
    { value: "2", label: "Duplo (2.0)" },
  ];

  return (
    <div className="space-y-4">
      <Input
        label="Nome do Layout"
        value={formData.name}
        onChange={(e: any) => updateField("name", e.target.value)}
        placeholder="Ex: Prova Padrão"
        required
      />

      {formData.importedFrom && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Importado de:</strong> {formData.importedFrom}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Fonte"
          value={formData.fontFamily}
          onChange={(e: any) => updateField("fontFamily", e.target.value)}
          options={fontOptions}
        />
        <Input
          label="Tamanho da Fonte (pt)"
          type="number"
          value={formData.fontSize}
          onChange={(e: any) => updateField("fontSize", e.target.value)}
        />
      </div>

      <Select
        label="Espaçamento entre Linhas"
        value={formData.lineSpacing}
        onChange={(e: any) => updateField("lineSpacing", e.target.value)}
        options={spacingOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Margem Superior (cm)"
          type="number"
          step="0.5"
          value={formData.marginTop}
          onChange={(e: any) => updateField("marginTop", e.target.value)}
        />
        <Input
          label="Margem Inferior (cm)"
          type="number"
          step="0.5"
          value={formData.marginBottom}
          onChange={(e: any) => updateField("marginBottom", e.target.value)}
        />
        <Input
          label="Margem Esquerda (cm)"
          type="number"
          step="0.5"
          value={formData.marginLeft}
          onChange={(e: any) => updateField("marginLeft", e.target.value)}
        />
        <Input
          label="Margem Direita (cm)"
          type="number"
          step="0.5"
          value={formData.marginRight}
          onChange={(e: any) => updateField("marginRight", e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Texto do Cabeçalho
          </label>
          {formData.headerLocked && (
            <span className="text-xs text-gray-500 flex items-center">
              <Lock size={14} className="mr-1" />
              Bloqueado
            </span>
          )}
        </div>
        <Input
          label={null}
          type="text"
          value={formData.headerText}
          onChange={(e: any) => updateField("headerText", e.target.value)}
          disabled={formData.headerLocked}
          className="w-full"
          placeholder="Ex: Escola XYZ - Prova de Matemática"
        />
        {formData.headerLocked && (
          <p className="text-xs text-gray-500 mt-1">
            Este cabeçalho foi importado do Word e está bloqueado para preservar
            a formatação institucional.
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Bloquear Cabeçalho
          </label>
          <Switch
            isSelected={formData.headerLocked}
            onValueChange={(val) => updateField("headerLocked", val)}
          />
        </div>
        <p className="text-xs text-gray-500">
          Bloquear o cabeçalho impede alterações futuras, preservando o padrão
          institucional.
        </p>
      </div>

      <Input
        label="Texto do Rodapé"
        value={formData.footerText}
        onChange={(e: any) => updateField("footerText", e.target.value)}
        placeholder="Ex: Página {page}"
      />
    </div>
  );
};

export default LayoutForm;
