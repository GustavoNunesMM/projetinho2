import React, { useRef } from "react";
import { Image, X } from "lucide-react";
import Button from "../common/Button";

interface ImageUploadProps {
  label?: string;
  image: string | null;
  onImageChange: (imageData: string) => void;
  onImageRemove: () => void;
}

const ImageUpload = ({
  label,
  image,
  onImageChange,
  onImageRemove,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === "string") {
          onImageChange(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <div className="flex flex-col justify-items-center place-self-center place-items-center place-content-center">
        {!image && (
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            className="border-dashed h-auto py-4 w-full"
          >
            <div className="flex items-center justify-center w-full">
              <Image className="mr-2" size={20} />
              Adicionar Imagem
            </div>
          </Button>
        )}
        {image && (
          <div className="mt-3 relative gap-2 flex flex-col place-content-center">
            <img
              src={image}
              alt="Preview"
              className="max-w-md rounded border"
            />
            <Button
              variant="danger"
              className="absolute top-2 right-2 rounded-full w-[14px] min-w-[18px] h-[18px] px-0"
              onClick={onImageRemove}
              aria-label="Remover imagem"
            >
              <X size={14} />
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-dashed h-auto py-4 max-w-[150px] m-auto"
            >
              <div className="flex items-center justify-center w-full">
                <Image className="mr-2" size={20} />
                Alterar imagem
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
