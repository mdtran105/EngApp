import express from 'express'
import { userController } from '../controller/user.controller'

const userRoute = express.Router()

// User endpoints
userRoute.post('/', userController.createUser)
userRoute.get('/:userId', userController.getUserById)

// User statistics
userRoute.get('/stats/:userId', userController.getUserStats)

export default userRoute
