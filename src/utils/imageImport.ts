export const getImageDimensions = (
  base64: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(
      () => reject(new Error("Timeout ao carregar imagem")),
      5000
    );

    img.onload = () => {
      clearTimeout(timeout);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Imagem inválida"));
    };
    img.src = base64;
  });
};
