import express from 'express'
import { upload } from '~/middlewares/upload.middleware'
import { chatController } from '../controller/chat.controller'

const chatRoute = express.Router()

// // global middlewares
// chatRoute.use(verifyUser)
// chatRoute.use(preventInActiveUser)

// Chat endpoints
chatRoute.post('/', chatController.chatGemini)
chatRoute.post('/whisper', upload.single('file'), chatController.whisper)

// Chat history
chatRoute.get('/history/:userId', chatController.getChatHistory)
chatRoute.delete('/history/:userId', chatController.deleteChatHistory)

// User stats
chatRoute.get('/stats/:userId', chatController.getUserStats)

export default chatRoute
