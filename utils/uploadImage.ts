import { BlobRef } from '@atproto/api'

import agent from '@/lib/agent'

export async function uploadImage(blob: Blob): Promise<{ blobRef: BlobRef }> {
  const resp = await (
    await agent()
  ).uploadBlob(new Uint8Array(await blob.arrayBuffer()), {
    encoding: blob.type,
  })

  if (!resp.success) throw new Error('Failed to upload image')

  return {
    blobRef: resp.data.blob,
  }
}
