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

  // Get user statistics
  public async getUserStats(req: Request, res: Response) {
    const { userId } = req.params

    try {
      // Count unique searched words
      const searchedWordsCount = await prisma.searchedWord.count({
        where: { userId }
      })

      // Count unique conversation sessions
      const conversationsCount = await prisma.chatMessage.groupBy({
        by: ['sessionId'],
        where: { userId, sessionId: { not: null } }
      })

      // Count messages by date to calculate streak
      const messages = await prisma.chatMessage.findMany({
        where: { userId },
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' }
      })

      // Calculate consecutive days streak
      let streak = 0
      if (messages.length > 0) {
        const dates = messages.map((m) => new Date(m.createdAt).toISOString().split('T')[0])
        const uniqueDates = [...new Set(dates)].sort().reverse()

        // Start from today
        const today = new Date().toISOString().split('T')[0]
        let currentDate = new Date()

        for (const dateStr of uniqueDates) {
          const checkDate = new Date(currentDate).toISOString().split('T')[0]
          if (dateStr === checkDate) {
            streak++
            // Move to previous day
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }
      }

      res.status(HTTP_STATUS.OK).json({
        wordsLearned: searchedWordsCount,
        conversations: conversationsCount.length,
        streak
      })
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get user stats' })
    }
  }
}

export const userController: UserController = new UserController()
