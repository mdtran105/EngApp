import express from 'express'
import { ttsController } from '../controller/tts.controller'

const ttsRoute = express.Router()

ttsRoute.post('/elevenlabs', (req, res, next) => {
  const maybePromise = (ttsController.elevenLabsSynthesize as any)(req, res, next)
  if (maybePromise && typeof maybePromise.then === 'function') {
    maybePromise.catch(next)
  }
})

export default ttsRoute
