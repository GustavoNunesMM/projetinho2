import { useRef } from "react";
import { Image, X } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";
import Textarea from "../common/Textarea";
import { Select, SelectItem, Selection } from "@heroui/react";
import ImageUpload from "../common/ImageUpload";
import { QuestionFormData } from "../../types/question";

interface QuestionFormProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
}

const QuestionForm = ({ formData, setFormData }: QuestionFormProps) => {
  const optionImageRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateField = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    updateField("options", newOptions);
  };

  const handleOptionImage = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          const newImages = [...formData.optionImages];
          newImages[index] = e.target.result;
          updateField("optionImages", newImages);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeOptionImage = (index: number) => {
    const newImages = [...formData.optionImages];
    newImages[index] = null;
    updateField("optionImages", newImages);
  };

  const typeOptions = [
    { value: "multipla", label: "Múltipla Escolha" },
    { value: "aberta", label: "Aberta" },
  ];

  const difficultyOptions = [
    { value: "facil", label: "Fácil" },
    { value: "media", label: "Média" },
    { value: "dificil", label: "Difícil" },
  ];

  const answerOptions = [
    { value: "", label: "Selecione a alternativa correta" },
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
  ];

  return (
    <div className="space-y-4">
      <Input
        label="Título da Questão"
        value={formData.title}
        onChange={(e) => updateField("title", e.target.value)}
        placeholder="Ex: Questão 1 - Equação do 2º Grau"
        required
      />

      {formData.importedFrom && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Importado de:</strong> {formData.importedFrom}
          </p>
        </div>
      )}

      <Textarea
        label="Enunciado"
        value={formData.content}
        onChange={(e) => updateField("content", e.target.value)}
        placeholder="Descreva o enunciado da questão..."
        rows={6}
        required
      />

      <ImageUpload
        label="Imagem do Enunciado (opcional)"
        image={formData.contentImage}
        onImageChange={(image) => updateField("contentImage", image)}
        onImageRemove={() => updateField("contentImage", null)}
      />

      <div className="grid grid-cols-4 gap-4">
        <Select
          label="Tipo"
          aria-label="tipo"
          selectedKeys={new Set([formData.type])}
          onSelectionChange={(keys: Selection) => {
            const selected = Array.from(keys)[0] as string;
            updateField("type", selected as "multipla" | "aberta");
          }}
        >
          {typeOptions.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>

        <Select
          label="Dificuldade"
          aria-label="dificuldade"
          selectedKeys={new Set([formData.difficulty])}
          onSelectionChange={(keys: Selection) => {
            const selected = Array.from(keys)[0] as string;
            updateField(
              "difficulty",
              selected as "facil" | "media" | "dificil"
            );
          }}
        >
          {difficultyOptions.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
        <Input
          label="Conteúdo"
          value={formData.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          placeholder="Ex: Matemática"
        />
        <Input
          label="Categoria"
          value={formData.category}
          onChange={(e) => updateField("category", e.target.value)}
          placeholder="Ex: Álgebra"
        />
      </div>

      {formData.type === "multipla" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternativas
          </label>
          <div className="space-y-3">
            {formData.options.map((option, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2">
                  <span className="font-medium w-8">
                    {String.fromCharCode(65 + idx)})
                  </span>
                  <Input
                    label={null}
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="flex-1"
                    placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                  />
                  <input
                    type="file"
                    ref={(el) => (optionImageRefs.current[idx] = el)}
                    onChange={(e) => handleOptionImage(idx, e)}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="primary"
                    onClick={() => optionImageRefs.current[idx]?.click()}
                    aria-label="Adicionar imagem"
                  >
                    <Image size={18} />
                  </Button>
                </div>
                {formData.optionImages[idx] && (
                  <div className="ml-10 mt-2 relative inline-block">
                    <img
                      src={formData.optionImages[idx]!}
                      alt={`Preview ${String.fromCharCode(65 + idx)}`}
                      className="max-w-xs rounded border"
                    />
                    <Button
                      variant="danger"
                      onClick={() => removeOptionImage(idx)}
                      className="absolute top-2 right-2"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.type === "multipla"
            ? "Resposta Correta"
            : "Resposta Esperada (opcional)"}
        </label>
        {formData.type === "multipla" ? (
          <Select
            aria-label="escolha correta"
            selectedKeys={
              formData.correctAnswer
                ? new Set([formData.correctAnswer])
                : new Set()
            }
            onSelectionChange={(keys: Selection) => {
              const selected = (Array.from(keys)[0] as string) ?? "";
              updateField("correctAnswer", selected);
            }}
          >
            {answerOptions.map((opt) => (
              <SelectItem key={opt.value}>{opt.label}</SelectItem>
            ))}
          </Select>
        ) : (
          <Textarea
            value={formData.correctAnswer}
            onChange={(e) => updateField("correctAnswer", e.target.value)}
            placeholder="Descreva a resposta esperada ou critérios de correção..."
            rows={4}
          />
        )}
      </div>

      <Textarea
        label="Explicação/Gabarito (opcional)"
        value={formData.explanation}
        onChange={(e) => updateField("explanation", e.target.value)}
        placeholder="Explique a resolução da questão..."
        rows={4}
      />
    </div>
  );
};

export default QuestionForm;
