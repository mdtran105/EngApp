import express, { Application } from 'express'
import 'express-async-errors'
import Server from './server'
import 'dotenv/config'

class EngChatApplication {
  public run(): void {
    const app: Application = express()
    const server: Server = new Server(app)

    server.start()
  }
}

const engChatApplication: EngChatApplication = new EngChatApplication()

engChatApplication.run()
