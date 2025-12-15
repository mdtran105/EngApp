import { Application, Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/http'
import chatRoute from '~/features/chat/route/chat.route'
import dictionaryRoute from '~/features/dictionary/route/dictionary.route'
import ttsRoute from '~/features/tts/route/tts.route'

const appRoutes = (app: Application) => {
  // app.use('/api/v1/users', userRoute)
  app.use('/api/Healthcheck', (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json('connected successfully')
  })
  app.use('/api/chat', chatRoute)
  app.use('/api/dictionary', dictionaryRoute)
  app.use('/api/tts', ttsRoute)
}

export default appRoutes
