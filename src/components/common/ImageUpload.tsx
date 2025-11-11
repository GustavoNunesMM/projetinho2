import React, { useRef, useState, useEffect } from "react";
import { Image, X, Maximize2 } from "lucide-react";
import Button from "../common/Button";

interface ImageUploadProps {
  label?: string;
  image: string | null;
  onImageChange: (imageData: string) => void;
  onImageRemove: () => void;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

const ImageUpload = ({
  label,
  image,
  onImageChange,
  onImageRemove,
  minWidth = 100,
  maxWidth = 800,
  minHeight = 100,
  maxHeight = 800,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 400, height: 300 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setAspectRatio(ratio);

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / ratio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratio;
        }

        setImageSize({ width, height });
      };
      img.src = image;
    }
  }, [image, maxWidth, maxHeight]);

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

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: imageSize.width, height: imageSize.height });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    let newWidth = startSize.width;
    let newHeight = startSize.height;

    switch (resizeHandle) {
      case "se": 
        newWidth = startSize.width + deltaX;
        newHeight =
          lockAspectRatio && aspectRatio
            ? newWidth / aspectRatio
            : startSize.height + deltaY;
        break;
      case "sw": 
        newWidth = startSize.width - deltaX;
        newHeight =
          lockAspectRatio && aspectRatio
            ? newWidth / aspectRatio
            : startSize.height + deltaY;
        break;
      case "ne": 
        newWidth = startSize.width + deltaX;
        newHeight =
          lockAspectRatio && aspectRatio
            ? newWidth / aspectRatio
            : startSize.height - deltaY;
        break;
      case "nw":
        newWidth = startSize.width - deltaX;
        newHeight =
          lockAspectRatio && aspectRatio
            ? newWidth / aspectRatio
            : startSize.height - deltaY;
        break;
      case "e":
        newWidth = startSize.width + deltaX;
        if (lockAspectRatio && aspectRatio) {
          newHeight = newWidth / aspectRatio;
        }
        break;
      case "w": 
        newWidth = startSize.width - deltaX;
        if (lockAspectRatio && aspectRatio) {
          newHeight = newWidth / aspectRatio;
        }
        break;
      case "s": 
        newHeight = startSize.height + deltaY;
        if (lockAspectRatio && aspectRatio) {
          newWidth = newHeight * aspectRatio;
        }
        break;
      case "n": 
        newHeight = startSize.height - deltaY;
        if (lockAspectRatio && aspectRatio) {
          newWidth = newHeight * aspectRatio;
        }
        break;
    }

    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    setImageSize({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = getCursor(resizeHandle);
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
      };
    }
  }, [isResizing, resizeHandle, startPos, startSize]);

  const getCursor = (handle: string | null) => {
    switch (handle) {
      case "se":
      case "nw":
        return "nwse-resize";
      case "sw":
      case "ne":
        return "nesw-resize";
      case "e":
      case "w":
        return "ew-resize";
      case "s":
      case "n":
        return "ns-resize";
      default:
        return "default";
    }
  };

  const resizeHandleStyle =
    "absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg hover:scale-125 transition-transform z-10";

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
          <div className="mt-3 flex flex-col gap-10">
            <div
              ref={containerRef}
              className="relative inline-block"
              style={{
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
              }}
            >
              <img
                src={image}
                alt="Preview"
                className="w-full h-full rounded border-2 border-blue-300 object-fit"
                style={{ pointerEvents: "none" }}
              />

              <Button
                variant="danger"
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 min-w-[24px] p-0 shadow-lg z-20"
                onClick={onImageRemove}
                aria-label="Remover imagem"
              >
                <X size={14} />
              </Button>

              <div
                className={resizeHandleStyle}
                style={{ top: "-6px", left: "-6px", cursor: "nwse-resize" }}
                onMouseDown={(e) => handleMouseDown(e, "nw")}
              />
              <div
                className={resizeHandleStyle}
                style={{ top: "-6px", right: "-6px", cursor: "nesw-resize" }}
                onMouseDown={(e) => handleMouseDown(e, "ne")}
              />
              <div
                className={resizeHandleStyle}
                style={{ bottom: "-6px", left: "-6px", cursor: "nesw-resize" }}
                onMouseDown={(e) => handleMouseDown(e, "sw")}
              />
              <div
                className={resizeHandleStyle}
                style={{ bottom: "-6px", right: "-6px", cursor: "nwse-resize" }}
                onMouseDown={(e) => handleMouseDown(e, "se")}
              />

              <div
                className={resizeHandleStyle}
                style={{
                  top: "50%",
                  left: "-6px",
                  transform: "translateY(-50%)",
                  cursor: "ew-resize",
                }}
                onMouseDown={(e) => handleMouseDown(e, "w")}
              />
              <div
                className={resizeHandleStyle}
                style={{
                  top: "50%",
                  right: "-6px",
                  transform: "translateY(-50%)",
                  cursor: "ew-resize",
                }}
                onMouseDown={(e) => handleMouseDown(e, "e")}
              />
              <div
                className={resizeHandleStyle}
                style={{
                  top: "-6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  cursor: "ns-resize",
                }}
                onMouseDown={(e) => handleMouseDown(e, "n")}
              />
              <div
                className={resizeHandleStyle}
                style={{
                  bottom: "-6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  cursor: "ns-resize",
                }}
                onMouseDown={(e) => handleMouseDown(e, "s")}
              />

              <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
                {Math.round(imageSize.width)} × {Math.round(imageSize.height)}{" "}
                px
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lockAspectRatio}
                    onChange={(e) => setLockAspectRatio(e.target.checked)}
                    className="rounded"
                  />
                  <Maximize2 size={16} />
                  Manter proporção
                </label>
              </div>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-dashed h-auto py-2 px-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <Image size={16} />
                  Alterar imagem
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
