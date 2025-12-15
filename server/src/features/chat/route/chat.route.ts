import express from 'express'
import { upload } from '~/middlewares/upload.middleware'
import { chatController } from '../controller/chat.controller'

const chatRoute = express.Router()

// // global middlewares
// chatRoute.use(verifyUser)
// chatRoute.use(preventInActiveUser)

chatRoute.post('/', chatController.chatGemini)
chatRoute.post('/whisper', upload.single('file'), chatController.whisper)
export default chatRoute
