// Turns an uploaded image file into a square JPEG data URL that fits a byte budget,
// so it can be stored with the (localStorage) demo profile.

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('That file could not be read as an image.'))
    img.src = src
  })
}

export async function fileToAvatarDataUrl(file, { maxSide = 256, maxBytes = 200 * 1024 } = {}) {
  if (!file) throw new Error('No file selected.')
  if (!file.type || !file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG, PNG, GIF or WebP).')
  if (file.size > 15 * 1024 * 1024) throw new Error('That image is too large. Please pick one under 15 MB.')

  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const w = img.naturalWidth
    const h = img.naturalHeight
    if (!w || !h) throw new Error('That file could not be read as an image.')
    // Center crop to a square.
    const side = Math.min(w, h)
    const sx = (w - side) / 2
    const sy = (h - side) / 2

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    let size = Math.min(maxSide, side)
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = size
      canvas.height = size
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
      for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
        const data = canvas.toDataURL('image/jpeg', quality)
        // A data URL string is what gets stored, so measure its length.
        if (data.length <= maxBytes) return data
      }
      size = Math.max(32, Math.round(size * 0.7))
    }
    throw new Error('Could not shrink that image enough. Please try a smaller one.')
  } finally {
    URL.revokeObjectURL(url)
  }
}
