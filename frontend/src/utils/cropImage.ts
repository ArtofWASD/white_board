/**
 * Utility functions for cropping images using HTML5 Canvas
 */

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous") // needed to avoid CORS issues on some external URLs
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns a cropped image Blob based on pixel crop coordinates
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = {
    width:
      Math.abs(Math.cos(rotRad) * image.width) +
      Math.abs(Math.sin(rotRad) * image.height),
    height:
      Math.abs(Math.sin(rotRad) * image.width) +
      Math.abs(Math.cos(rotRad) * image.height),
  }

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // Translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // Draw rotated image
  ctx.drawImage(image, 0, 0)

  // Cropped canvas
  const croppedCanvas = document.createElement("canvas")
  const croppedCtx = croppedCanvas.getContext("2d")

  if (!croppedCtx) {
    return null
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  // As a blob
  return new Promise((resolve) => {
    croppedCanvas.toBlob(
      (blob) => {
        resolve(blob)
      },
      "image/jpeg",
      0.9, // high quality
    )
  })
}
