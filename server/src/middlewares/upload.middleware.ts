import fs from 'fs'
import multer from 'multer'
import path from 'path'

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer - Thư viện xử lý multipart/form-data
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir) // Lưu vào folder uploads/
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname) // Lấy .webm
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  }
})

export const upload = multer({ storage })
