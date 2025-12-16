import express from 'express'
import { authController } from '../controller/auth.controller'

const authRoute = express.Router()

authRoute.post('/register', authController.register)
authRoute.post('/login', authController.login)
authRoute.post('/claim', authController.claimAnonymousUser)
authRoute.post('/verify', authController.verifyToken)

export default authRoute
