import { BlobRef } from '@atproto/api'

import { compressImage } from './compressImage'
import { uploadImage } from './uploadImage'

export async function uploadImageBulk(images: File[]): Promise<{ blobRef: BlobRef }[]> {
  const results: { blobRef: BlobRef }[] = []

  for (const img of images) {
    if (!img) continue

    const res = await uploadImage(await compressImage(img))
    results.push(res)
  }

  return results
}
