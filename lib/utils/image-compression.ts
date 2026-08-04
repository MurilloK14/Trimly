/**
 * Utilitário de validação e compressão de imagens no cliente.
 * Reduz a resolução máxima para 500px e comprime em JPEG 80%,
 * garantindo que imagens ocupem menos de ~100KB e não sobrecarreguem o banco/storage.
 */

export interface CompressImageOptions {
  maxSizeMB?: number
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function compressAndValidateImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<{ success: true; dataUrl: string } | { success: false; error: string }> {
  const {
    maxSizeMB = 2, // Limite máximo do arquivo original (2MB)
    maxWidth = 500,
    maxHeight = 500,
    quality = 0.8,
  } = options

  return new Promise((resolve) => {
    // 1. Valida tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return resolve({ success: false, error: "Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP)." })
    }

    // 2. Valida tamanho do arquivo original
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return resolve({
        success: false,
        error: `A imagem selecionada é muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). O limite é de ${maxSizeMB}MB.`,
      })
    }

    // 3. Comprime e redimensiona a imagem usando Canvas
    const reader = new FileReader()
    reader.onerror = () => resolve({ success: false, error: "Erro ao ler o arquivo de imagem." })
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => resolve({ success: false, error: "Erro ao carregar a imagem." })
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calcula novas dimensões mantendo aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          // Fallback se canvas falhar
          return resolve({ success: true, dataUrl: e.target?.result as string })
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)

        resolve({ success: true, dataUrl: compressedDataUrl })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}
