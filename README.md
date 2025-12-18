# English101: Nền tảng Học Tiếng Anh với AI

English101 là ứng dụng web hiện đại giúp người học Việt Nam cải thiện kỹ năng tiếng Anh thông qua các tính năng tương tác được hỗ trợ bởi AI. Nền tảng cung cấp từ điển thông minh, trò chuyện với AI tutor, luyện phát âm, và quản lý từ vựng cá nhân hóa theo trình độ người học.

## ✨ Tính năng chính

- **Từ điển thông minh (Smart Dictionary)**: Tra cứu từ vựng, thành ngữ với giải thích có ngữ cảnh, phiên âm IPA và phát âm bằng giọng nói tự nhiên
- **AI Chat Tutor**: Luyện đối thoại tiếng Anh với AI tutor (Google Gemini), luôn phản hồi bằng tiếng Anh để cải thiện phản xạ ngôn ngữ
- **Quản lý từ vựng**: Lưu lịch sử từ đã tra, xem từ tra nhiều nhất, theo dõi tiến trình học tập
- **Lịch sử hội thoại**: Lưu trữ và xem lại các cuộc hội thoại với AI theo session
- **Xác thực người dùng**: Đăng ký, đăng nhập với mã hóa mật khẩu (bcrypt) và JWT
- **Giao diện hiện đại**: Responsive, hỗ trợ dark mode, thiết kế đẹp với Tailwind CSS và ShadCN UI

## 🛠️ Công nghệ sử dụng

### Frontend

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **UI Components**: ShadCN UI, Radix UI, Lucide Icons
- **Styling**: Tailwind CSS, Framer Motion
- **Form Management**: React Hook Form, Zod validation
- **Speech**: React Speech Recognition, Browser TTS API
- **Markdown**: React Markdown với GitHub Flavored Markdown

### Backend

- **Runtime**: Node.js với TypeScript
- **Framework**: Express.js
- **Database**: SQLite với Prisma ORM
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **AI Integration**:
  - Google Gemini AI (@google/genai) - Chat tutor & Dictionary
  - ElevenLabs (elevenlabs-js) - Text-to-Speech chất lượng cao
- **File Upload**: Multer
- **CORS & Cookie**: cors, cookie-parser

### DevOps & Tools

- **Package Manager**: pnpm
- **Linting**: ESLint, Prettier
- **Dev Tools**: Nodemon, ts-node

## 📋 Yêu cầu hệ thống

- **Node.js**: v18 trở lên
- **pnpm**: v8 trở lên (hoặc npm v9+)
- **Database**: SQLite (tự động tạo)

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd english-chatbot-main
```

### 2. Cài đặt Backend

```bash
cd server
pnpm install

# Tạo file .env và cấu hình
cp .env.example .env
# Cập nhật các biến môi trường:
# - DATABASE_URL="file:./dev.db"
# - GEMINI_API_KEY=your_gemini_api_key
# - ELEVENLABS_API_KEY=your_elevenlabs_api_key (optional)
# - JWT_SECRET=your_jwt_secret
# - PORT=3001

# Chạy migrations để tạo database
npx prisma migrate dev

# Khởi động server
pnpm dev
```

Server sẽ chạy tại `http://localhost:3001`

### 3. Cài đặt Frontend

```bash
cd client
pnpm install

# Tạo file .env.local và cấu hình
cp .env.example .env.local
# Cập nhật:
# NEXT_PUBLIC_API_DOMAIN=http://localhost:3001

# Khởi động ứng dụng
pnpm dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc dự án

```
english-chatbot-main/
├── client/                 # Frontend (Next.js)
│   ├── app/               # App Router pages
│   │   ├── auth/          # Trang đăng nhập/đăng ký
│   │   ├── chat/          # Chat với AI tutor
│   │   ├── dashboard/     # Dashboard người dùng
│   │   └── dictionary/    # Tra từ điển
│   ├── components/        # Shared components
│   ├── contexts/          # React contexts (Theme, TTS)
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities, services
│
├── server/                # Backend (Express.js)
│   ├── prisma/            # Database schema & migrations
│   │   └── schema.prisma  # Prisma schema
│   └── src/
│       ├── features/      # Feature modules
│       │   ├── auth/      # Authentication APIs
│       │   ├── chat/      # Chat APIs
│       │   ├── dictionary/# Dictionary APIs
│       │   ├── tts/       # Text-to-Speech APIs
│       │   └── user/      # User management APIs
│       ├── lib/           # Prisma client
│       └── middlewares/   # Express middlewares
│
├── DATABASE_SETUP.md      # Hướng dẫn database
└── README.md             # File này
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất

### Chat

- `POST /api/chat` - Chat với AI tutor
- `GET /api/chat/history/:userId` - Lấy lịch sử chat
- `DELETE /api/chat/history/:userId` - Xóa lịch sử chat

### Dictionary

- `POST /api/dictionary/lookup` - Tra từ
- `GET /api/dictionary/history/:userId` - Lấy từ đã tra
- `GET /api/dictionary/history/:userId/most-searched` - Từ tra nhiều nhất
- `DELETE /api/dictionary/history/:userId/:word` - Xóa từ đã tra

### Text-to-Speech

- `POST /api/tts` - Chuyển text thành giọng nói

### User

- `POST /api/user` - Tạo user mới
- `GET /api/user/:userId` - Lấy thông tin user
- `PATCH /api/user/:userId` - Cập nhật thông tin user

## 🗄️ Database Schema

### User

- `id`: UUID (Primary Key)
- `name`: Tên người dùng
- `email`: Email (unique)
- `password`: Mật khẩu đã hash
- `level`: Trình độ (beginner/intermediate/advanced)
- `isAnonymous`: User ẩn danh hay đã đăng ký
- `createdAt`, `updatedAt`: Timestamps

### ChatMessage

- `id`: UUID (Primary Key)
- `content`: Nội dung tin nhắn
- `role`: user/assistant
- `userId`: Foreign Key → User
- `sessionId`: ID phiên chat (optional)
- `createdAt`: Timestamp

### SearchedWord

- `id`: UUID (Primary Key)
- `word`: Từ đã tra
- `definition`: Định nghĩa (optional)
- `userId`: Foreign Key → User
- `searchCount`: Số lần tra
- `lastSearched`: Lần tra gần nhất
- `createdAt`: Timestamp

## 🤖 Tích hợp AI

### Google Gemini AI

- **Chat Tutor**: Sử dụng Gemini để tạo AI tutor thông minh, luôn phản hồi bằng tiếng Anh, điều chỉnh độ khó theo level người học
- **Dictionary**: Cung cấp giải thích từ vựng có ngữ cảnh, ví dụ, phiên âm IPA, và dịch sang tiếng Việt

### ElevenLabs TTS

- Chuyển đổi text thành giọng nói tự nhiên với chất lượng cao
- Hỗ trợ nhiều giọng đọc khác nhau

## 📝 Scripts

### Backend (server/)

```bash
pnpm dev          # Chạy development server với nodemon
pnpm build        # Build TypeScript
pnpm start        # Chạy production server
pnpm lint         # Kiểm tra code
pnpm lint:fix     # Fix linting issues
```

### Frontend (client/)

```bash
pnpm dev          # Chạy development server
pnpm build        # Build production
pnpm start        # Chạy production server
pnpm lint         # Kiểm tra code
```

## 🔐 Bảo mật

- Mật khẩu được hash bằng bcrypt (salt rounds: 10)
- Xác thực bằng JWT với HTTP-only cookies
- CORS được cấu hình cho các domain được phép
- Input validation với Zod schema
- SQL injection được ngăn chặn bởi Prisma ORM

## 📚 Tài liệu bổ sung

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Chi tiết về database setup và migrations

---

**Lưu ý**: Đảm bảo bạn đã cấu hình đúng các API keys (Gemini, ElevenLabs) trong file `.env` trước khi chạy ứng dụng.
