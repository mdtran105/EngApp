import axios from 'axios'
import 'dotenv/config'
import { Request, Response } from 'express'
import fs from 'fs'
import { File as NodeFile } from 'node:buffer'
import OpenAI from 'openai'
import { HTTP_STATUS } from '~/constants/http'
import genAI from '../../utils'
;(globalThis as any).File = NodeFile

const ApiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || ''

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: ApiKey,
  defaultHeaders: {}
})

const prePrompt = `You are an English teacher, you will communicate with learners in English to improve their speaking and reflexes in English. Always reply **only in English**, no matter what language the user uses. Do not translate, explain in other languages, or switch context. Answer concisely and clearly. Correct the user's grammar mistakes in your reply. Encourage the user to speak more. Do not use markdown format in your replies. Max reply length is 8 sentences. Do not answer any question outside the context of learning English (e.g., personal questions, write code, poem...). If user don't know how to answer, give simple suggestions to help them.`

class ChatController {
  public async chatOpenAi(req: Request, res: Response) {
    const { message, messages } = req.body

    try {
      // Support both old format (single message) and new format (messages array)
      let conversationMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>

      if (messages && Array.isArray(messages)) {
        // New format: use conversation history
        conversationMessages = messages
      } else if (message) {
        // Old format: single message (backward compatibility)
        conversationMessages = [{ role: 'user', content: message }]
      } else {
        res.status(400).json({ error: 'No message or messages provided' })
        return
      }

      const completion = await openai.chat.completions.create({
        model: 'amazon/nova-2-lite-v1:free',
        messages: [
          {
            role: 'system',
            content: prePrompt
          },
          ...(conversationMessages as any)
        ]
      })

      res.status(HTTP_STATUS.OK).json({ reply: completion.choices[0].message.content })
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'OpenAI Error' })
    }
  }

  public async chatGemini(req: Request, res: Response) {
    const { message, messages } = req.body
    try {
      // Support both old format (single message) and new format (messages array)
      let history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
      let currentMessage: string

      if (messages && Array.isArray(messages)) {
        // New format: convert conversation history to Gemini format
        // Separate the last message from history
        if (messages.length > 1) {
          // Convert all messages except the last one to history
          history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
          }))
          currentMessage = messages[messages.length - 1].content
        } else {
          // Only one message, no history
          currentMessage = messages[0].content
        }
      } else if (message) {
        // Old format: single message (backward compatibility)
        currentMessage = message
      } else {
        res.status(400).json({ error: 'No message or messages provided' })
        return
      }

      // Create chat session with history
      const chat = genAI.chats.create({
        model: 'gemini-2.0-flash',
        history: history,
        config: {
          systemInstruction: prePrompt
        }
      })

      // Send the current message
      const result = await chat.sendMessage({
        message: currentMessage
      })

      const reply = result.text

      res.status(HTTP_STATUS.OK).json({ reply })
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Gemini error' })
    }
  }

  public async whisper(req: Request, res: Response) {
    try {
      const filePath = req.file?.path
      const fileName = req.file?.originalname

      if (!filePath || !fileName) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }

      const assemblyKey = process.env.ASSEMBLYAI_API_KEY || ''
      if (!assemblyKey) {
        fs.unlink(filePath, () => {})
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Missing ASSEMBLYAI_API_KEY' })
        return
      }

      // Upload audio file to AssemblyAI
      const uploadResp = await axios.post('https://api.assemblyai.com/v2/upload', fs.createReadStream(filePath), {
        headers: {
          authorization: assemblyKey,
          'content-type': 'application/octet-stream'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      })

      const audioUrl: string = uploadResp.data?.upload_url || uploadResp.data

      // Create transcription request
      const createResp = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl,
          language_detection: true,
          language_detection_options: {
            expected_languages: ['en', 'vi'],
            fallback_language: 'auto'
          }
        },
        {
          headers: {
            authorization: assemblyKey,
            'content-type': 'application/json'
          }
        }
      )

      const transcriptId = createResp.data.id

      // Poll for completion
      let transcriptText = ''
      const maxAttempts = 120
      let attempts = 0

      while (attempts < maxAttempts) {
        // eslint-disable-next-line no-await-in-loop
        const poll = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { authorization: assemblyKey }
        })

        const status = poll.data.status
        if (status === 'completed') {
          transcriptText = poll.data.text
          break
        }

        if (status === 'error') {
          throw new Error(poll.data.error || 'Transcription error')
        }

        // wait 1s before next poll
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 1000))
        attempts += 1
      }

      fs.unlink(filePath, () => {})

      if (!transcriptText) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Transcription timed out' })
        return
      }

      res.status(200).json({ transcript: transcriptText })
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'OpenAI Error' })
    }
  }
}

export const chatController: ChatController = new ChatController()
