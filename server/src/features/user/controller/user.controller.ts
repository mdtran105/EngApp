import { Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/http'
import prisma from '~/lib/prisma'

class UserController {
  public async createUser(req: Request, res: Response) {
    const { name, email, level } = req.body

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email: email || undefined,
          level: level || 'beginner'
        }
      })

      res.status(HTTP_STATUS.OK).json(user)
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create user' })
    }
  }

  public async getUserById(req: Request, res: Response) {
    const { userId } = req.params

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' })
        return
      }

      res.status(HTTP_STATUS.OK).json(user)
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get user' })
    }
  }
}

export const userController: UserController = new UserController()
