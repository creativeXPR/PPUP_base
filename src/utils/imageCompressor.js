import { IMAGE_MAX_DIMENSION, IMAGE_QUALITY } from '../config/constants'

// Downscales an image File to fit maxDim and re-encodes it as JPEG.
export async function compressImage(file, maxDim = IMAGE_MAX_DIMENSION, quality = IMAGE_QUALITY) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
}
