import { NextApiRequest, NextApiResponse } from 'next'
import ogs from 'open-graph-scraper'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const url = req.body.url
  try {
    const { result } = await ogs({ url })

    return res.status(200).json(result)
  } catch {
    return res.status(200).json({ message: 'Page not found' })
  }
}
