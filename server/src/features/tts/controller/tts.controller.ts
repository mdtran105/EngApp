import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { Request, Response } from 'express'

const getElevenLabsKey = () => process.env.ELEVENLABS_API_KEY || ''

export const ttsController = {
  async elevenLabsSynthesize(req: Request, res: Response) {
    const { text, voice } = req.body
    if (!text) return res.status(400).json({ error: 'Missing text' })

    const apiKey = getElevenLabsKey()
    if (!apiKey) return res.status(500).json({ error: 'ElevenLabs API key not configured' })

    try {
      const client = new ElevenLabsClient({ apiKey })

      // Default voice IDs - you can change these to your preferred voices
      // Popular voices: Rachel, Domi, Bella, Antoni, Elli, Josh, Arnold, Adam, Sam
      const voiceId = voice || 'Xb7hH8MSUJpSbSDYk0k2'

      // Get raw response with headers
      const { data: audioStream } = await client.textToSpeech
        .convert(voiceId, {
          text: text,
          modelId: 'eleven_multilingual_v2'
        })
        .withRawResponse()

      // Đọc stream audio thành buffer (mảng bytes)
      const chunks: Buffer[] = []
      for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk))
      }
      const audioBuffer = Buffer.concat(chunks)

      // Chuyển buffer thành base64 (chuỗi text để gửi qua HTTP)
      const base64Audio = audioBuffer.toString('base64')
      return res.json({
        audioData: base64Audio,
        contentType: 'audio/mpeg'
      })
    } catch (err: any) {
      console.error('ElevenLabs TTS error', err)
      return res.status(500).json({ error: err?.message || 'ElevenLabs TTS error' })
    }
  }
}

export default ttsController
