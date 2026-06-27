export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15);
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + "...";
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

const MAX_IMAGE_DIM = 1600;
const COMPRESS_QUALITY = 0.8;

/**
 * Comprime una imagen del celular antes de subirla.
 * Redimensiona a max 1600px, convierte a JPEG calidad 0.8,
 * y remueve metadatos EXIF que pueden romper APIs de IA.
 * Ideal para fotos sacadas con el teléfono (5-15MB → ~200-500KB).
 */
export function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Solo comprimimos imágenes
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Si ya es chica, no la tocamos
      if (img.width <= MAX_IMAGE_DIM && img.height <= MAX_IMAGE_DIM && file.size < 1024 * 1024) {
        resolve(file);
        return;
      }

      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      if (width > MAX_IMAGE_DIM || height > MAX_IMAGE_DIM) {
        const ratio = Math.min(MAX_IMAGE_DIM / width, MAX_IMAGE_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // Fondo blanco para evitar bordes transparentes en JPEG
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          // Mantenemos el mismo nombre pero con extensión .jpg
          const name = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          const compressed = new File([blob], name, { type: "image/jpeg" });
          resolve(compressed);
        },
        "image/jpeg",
        COMPRESS_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Si falla la carga, mandamos el original
    };

    img.src = url;
  });
}
