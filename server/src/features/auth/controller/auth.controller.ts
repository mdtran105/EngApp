import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { HTTP_STATUS } from '~/constants/http'
import prisma from '~/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

class AuthController {
  // Register new user
  public async register(req: Request, res: Response) {
    const { name, email, password, level } = req.body

    try {
      // Validate input
      if (!email || !password || !name) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Name, email and password are required' })
        return
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        res.status(HTTP_STATUS.CONFLICT).json({ error: 'Email already registered' })
        return
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          level: level || 'beginner',
          isAnonymous: false
        }
      })

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      })

      res.status(HTTP_STATUS.OK).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          level: user.level
        },
        token
      })
    } catch (error) {
      console.error('Register error:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to register user' })
    }
  }

  // Login
  public async login(req: Request, res: Response) {
    const { email, password } = req.body

    try {
      // Validate input
      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Email and password are required' })
        return
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.password) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid email or password' })
        return
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid email or password' })
        return
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      })

      res.status(HTTP_STATUS.OK).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          level: user.level
        },
        token
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to login' })
    }
  }

  // Convert anonymous user to registered user
  public async claimAnonymousUser(req: Request, res: Response) {
    const { userId, email, password, name } = req.body

    try {
      // Validate input
      if (!userId || !email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'UserId, email and password are required' })
        return
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        res.status(HTTP_STATUS.CONFLICT).json({ error: 'Email already registered' })
        return
      }

      // Get anonymous user
      const anonymousUser = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!anonymousUser) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'User not found' })
        return
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Update user to registered
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || anonymousUser.name,
          email,
          password: hashedPassword,
          isAnonymous: false
        }
      })

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      })

      res.status(HTTP_STATUS.OK).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          level: user.level
        },
        token
      })
    } catch (error) {
      console.error('Claim user error:', error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to claim user' })
    }
  }

  // Verify token
  public async verifyToken(req: Request, res: Response) {
    const { token } = req.body

    try {
      if (!token) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Token is required' })
        return
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid token' })
        return
      }

      res.status(HTTP_STATUS.OK).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          level: user.level
        }
      })
    } catch (error) {
      console.error('Verify token error:', error)
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid or expired token' })
    }
  }
}

export const authController: AuthController = new AuthController()
