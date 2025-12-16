# Database Setup Completed! 🎉

## ✅ Đã setup thành công:

### 1. **Database Schema** ([prisma/schema.prisma](server/prisma/schema.prisma))

- **User**: Lưu thông tin người dùng (name, email, level, createdAt)
- **ChatMessage**: Lưu lịch sử chat (content, role, userId, sessionId)
- **SearchedWord**: Lưu từ đã tra (word, definition, searchCount, lastSearched)

### 2. **Database đã được tạo**

- SQLite database tại: `server/prisma/dev.db`
- Migration đã chạy thành công

### 3. **API Endpoints mới**

#### 👤 User Management

- `POST /api/chat/users` - Tạo user mới
  ```json
  { "name": "Nguyen Van A", "email": "a@example.com", "level": "beginner" }
  ```
- `GET /api/chat/users/:userId` - Lấy thông tin user

#### 💬 Chat History

- `GET /api/chat/history/:userId?sessionId=xxx&limit=50` - Lấy lịch sử chat
- `DELETE /api/chat/history/:userId` - Xóa lịch sử chat
  ```json
  { "sessionId": "optional-session-id" }
  ```

#### 📚 Dictionary History

- `GET /api/dictionary/history/:userId?limit=50` - Lấy từ đã tra
- `GET /api/dictionary/history/:userId/most-searched?limit=20` - Từ tra nhiều nhất
- `DELETE /api/dictionary/history/:userId/:word` - Xóa từ đã tra

### 4. **Sử dụng trong API calls**

Để lưu vào database, thêm `userId` vào request body:

```javascript
// Chat - sẽ tự động lưu messages
POST /api/chat
{
  "messages": [...],
  "userId": "user-id-here",
  "sessionId": "optional-session-id"
}

// Dictionary - sẽ tự động lưu searched words
POST /api/dictionary
{
  "keyword": "hello",
  "userId": "user-id-here"
}
```

---

## 🚀 Các lệnh Prisma hữu ích:

```bash
cd server

# Xem database trong UI
npx prisma studio

# Tạo migration mới sau khi sửa schema
npx prisma migrate dev --name description

# Generate Prisma Client sau khi sửa schema
npx prisma generate

# Reset database (cẩn thận: xóa tất cả data!)
npx prisma migrate reset
```

---

## 📝 Ví dụ sử dụng:

### 1. Tạo user mới

```bash
curl -X POST http://localhost:5050/api/chat/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","level":"beginner"}'
```

### 2. Chat với userId

```bash
curl -X POST http://localhost:5050/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role":"user","content":"Hello"}],
    "userId":"user-id-from-step-1"
  }'
```

### 3. Xem lịch sử chat

```bash
curl http://localhost:5050/api/chat/history/user-id-from-step-1
```

---

## ⚙️ Cấu hình

Database URL đã được thêm vào [.env](server/.env):

```
DATABASE_URL="file:./prisma/dev.db"
```

Bạn có thể chuyển sang PostgreSQL/MySQL sau này bằng cách:

1. Đổi `provider` trong schema.prisma
2. Update DATABASE_URL
3. Chạy `npx prisma migrate dev`
