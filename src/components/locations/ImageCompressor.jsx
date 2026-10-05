import { useEffect, useState } from 'react'
import { compressImage } from '../../utils/imageCompressor'

// File input that compresses the chosen image before handing it to onChange.
export default function ImageCompressor({ onChange }) {
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const compressed = await compressImage(file)
      setPreview(URL.createObjectURL(compressed))
      onChange(compressed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="image-compressor">
      <input type="file" accept="image/*" capture="environment" onChange={handleFile} disabled={busy} />
      {busy && <small>Compressing…</small>}
      {preview && <img src={preview} alt="Preview" className="image-preview" />}
    </div>
  )
}
