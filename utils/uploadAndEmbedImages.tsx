import { Main } from '@atproto/api/dist/client/types/app/bsky/embed/images'

import { embedImages } from './embedImages'
import { uploadImageBulk } from './uploadImageBulk'

export async function uploadAndEmbedImages(images: File[]): Promise<Main | undefined> {
  const res = await uploadImageBulk(images)

  return res.length ? embedImages(res) : undefined
}
