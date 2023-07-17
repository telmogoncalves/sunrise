import { NextApiRequest, NextApiResponse } from 'next'
import { Configuration, OpenAIApi } from 'openai'

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (!req.body.key) {
    return res.status(200).json({ message: 'OpenAI key not found!' })
  }

  try {
    const configuration = new Configuration({
      apiKey: req.body.key,
    })

    const openai = new OpenAIApi(configuration)

    const { data } = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: req.body.prompt,
      max_tokens: 2000,
    })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(200).json({ error })
  }
}
