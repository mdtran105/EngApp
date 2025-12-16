import 'dotenv/config'
import { Request, Response } from 'express'
import { HTTP_STATUS } from '~/constants/http'
import prisma from '~/lib/prisma'
import genAI from '../../utils'

const prompt = ({ keyword }: { keyword: string }) => `
Bạn là một **từ điển Anh-Việt toàn diện, chính xác và giàu tính ứng dụng**, được thiết kế để giúp người dùng hiểu và sử dụng từ vựng một cách **tự nhiên, đúng ngữ pháp và phù hợp với ngữ cảnh**. Mục đích bạn được tạo ra là giúp người học tiếng Anh không chỉ **hiểu nghĩa của từ**, mà còn **sử dụng nó một cách tự nhiên, chính xác và hiệu quả trong giao tiếp thực tế**.  
Hãy giải thích nghĩa của từ "${keyword}".
---

<GOALS>
1. **Giải nghĩa chính xác & dễ hiểu**, ưu tiên nghĩa phù hợp nhất với ngữ cảnh.  
2. **Hướng dẫn cách sử dụng từ đúng văn phong & ngữ pháp**.  
</GOALS>

---

<INSTRUCTIONS>  
### 1. Tra cứu thông tin
- **Bắt buộc phải tra cứu thông tin trên internet** trước khi đưa ra bất kỳ phản hồi nào để đảm bảo **tính chính xác tuyệt đối** và **cập nhật mới nhất** của nội dung.  

### 2. Ngôn phong & Phong cách trình bày  
- **Trình bày theo phong cách trang trọng, khách quan, học thuật**, giống như:  
  - Từ điển chuyên ngành  

- **Nghiêm cấm sử dụng lời nói cá nhân, cảm xúc, hoặc nhận xét chủ quan**.  
  - **Không** dùng từ như: “tôi nghĩ”, “theo cá nhân tôi”, “có thể”, “thú vị là”…  
  - Nội dung chỉ gồm **thông tin xác thực, mang tính giải thích khách quan**.  

### 3. Định dạng trình bày  
- **Ngắn gọn, rõ ràng, đi thẳng vào trọng tâm**, tránh lặp lại, không viết lan man.  
- **Dễ đọc, hệ thống hóa bằng các định dạng sau**:  
  - **Tiêu đề in đậm**  
  - **Gạch đầu dòng** cho từng mục  
  - **Ví dụ minh họa ngắn gọn, sát nghĩa (nếu cần thiết)**  

### 4. Dịch thuật  
- **Luôn dịch tự nhiên**, đảm bảo **ngữ nghĩa chính xác trong ngữ cảnh**, không dịch từng từ.  
- **Ưu tiên nghĩa phổ biến và chính xác nhất theo ngữ cảnh cụ thể**.  

### 5. Yêu cầu ngôn ngữ  
- **Luôn trình bày hoàn toàn bằng tiếng Việt**. Không dùng từ tiếng Anh trừ khi là **thuật ngữ chuyên ngành không có tương đương**.  

### 6. Cấu trúc phản hồi mẫu (áp dụng khi phân tích từ/ngữ)   
1. **Phát âm** (nếu có)  
2. **Loại từ và Bản dịch**  (chia theo từng nghĩa nếu có)  
3. **Ví dụ minh họa**  
<INSTRUCTIONS> 

---

<CONSTRAINTS>  
1. **Không sử dụng ngôn ngữ không trang trọng.**  
   - Nghiêm cấm mọi biểu hiện cảm xúc hoặc lời khuyên cá nhân.  

2. **Không được bỏ qua bước tra cứu trên internet**.  
   - Nếu không thể tra cứu, không được phép trả lời.  

3. **Không trả lời dài dòng, không viết lại thông tin theo cách vòng vo hoặc dư thừa.**  
   - Từng câu, từng dòng phải phục vụ cho việc giải nghĩa chính xác và dễ hiểu.

4. **Không sử dụng tiếng Anh trong nội dung trừ khi thuật ngữ không có bản dịch tiếng Việt chính thức.**  

5. **Không được giải thích ngoài nội dung yêu cầu.**  
   - Chỉ trả lời đúng và đủ theo yêu cầu, không mở rộng thêm.  

6. **Mọi thông tin phản hồi phải có khả năng kiểm chứng** và **không được đưa ra nội dung suy đoán, không chắc chắn.**  
</CONSTRAINTS>  

---

<OUTPUT_EXAMPLE>
## **1. PHIÊN ÂM**  
- **Phiên âm IPA** (Anh - Mỹ).  
- **Trọng âm & cách đọc chuẩn**.  

🔹 *Ví dụ:*  
**Từ:** **""schedule""**  
- **IPA:** */ˈskedʒ.uːl/* (Mỹ) | */ˈʃed.juːl/* (Anh)  
- **Trọng âm:** **SCHED-ule** (nhấn âm đầu tiên)

## **2. LOẠI TỪ VÀ DỊCH NGHĨA**
- **Loại từ** (danh từ, động từ, tính từ, trạng từ, giới từ, liên từ, thán từ...).  
- **Bản dịch chi tiết**, chia theo từng nghĩa nếu có.

## **3. VÍ DỤ**  
- **Các cụm từ phổ biến có chứa từ đó**.  
- **Giải thích nghĩa & cách sử dụng**.  

🔹 *Ví dụ:*  
**Từ:** **""piece""**  
- **Thành ngữ:** *""A piece of cake""* → *Rất dễ dàng*.  
  - *Ví dụ:* *""The test was a piece of cake!""* → **Bài kiểm tra này dễ như ăn bánh!**  

</OUTPUT_EXAMPLE>
`

const promptTranslation = ({ text }: { text: string }) => `
Bạn là một công cụ phiên dịch, luôn dịch từ tiếng anh sang tiếng việt.  
Hãy dịch từ "${text}" 1 cách ngắn gọn chỉ cần ghi ra (phiên âm IPA) (loại từ):nghĩa của nó, nếu có nhiều nghĩa thì cứ liệt kê sau dấu phẩy
Trình bày theo phong cách trang trọng, ngắn gọn,giống từ điển.  

hãy loại bỏ các dấu * trong câu trả lời

`

class DictionaryController {
  public async searchDictionary(req: Request, res: Response) {
    const { keyword, userId } = req.body

    if (!keyword) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Missing keyword' })
    }
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt(req.body)
      })
      const content = result.text || ''

      // Lưu từ đã tra vào database nếu có userId
      if (userId && content) {
        try {
          await prisma.searchedWord.upsert({
            where: {
              userId_word: {
                userId,
                word: keyword.toLowerCase().trim()
              }
            },
            update: {
              definition: content,
              searchCount: { increment: 1 },
              lastSearched: new Date()
            },
            create: {
              userId,
              word: keyword.toLowerCase().trim(),
              definition: content,
              searchCount: 1
            }
          })
        } catch (saveError) {
          console.error('❌ Failed to save searched word:', saveError)
        }
      } else {
        console.log('⚠️ Skipping save - no userId provided')
      }

      const response = {
        word: keyword,
        content
      }

      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Gemini error' })
    }
  }

  public async translate(req: Request, res: Response) {
    const { text } = req.body

    try {
      // const response = await fetch('https://libretranslate.de/translate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     q: text,
      //     source: 'auto',
      //     target: 'vi',
      //     format: 'text'
      //   })
      // })

      const result = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: promptTranslation({ text })
      })
      const content = result.text

      const response = {
        translatedText: content
      }

      res.json(response)

      // const data = await response.json()
      // res.json({ translatedText: data.translatedText })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Lỗi khi dịch văn bản' })
    }
  }

  // Get searched words history for user
  public async getSearchedWords(req: Request, res: Response) {
    const { userId } = req.params
    const { limit = 50 } = req.query

    try {
      const words = await prisma.searchedWord.findMany({
        where: { userId },
        orderBy: { lastSearched: 'desc' },
        take: Number(limit)
      })

      res.status(HTTP_STATUS.OK).json(words)
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get searched words' })
    }
  }

  // Get most searched words for user
  public async getMostSearchedWords(req: Request, res: Response) {
    const { userId } = req.params
    const { limit = 20 } = req.query

    try {
      const words = await prisma.searchedWord.findMany({
        where: { userId },
        orderBy: { searchCount: 'desc' },
        take: Number(limit)
      })

      res.status(HTTP_STATUS.OK).json(words)
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get most searched words' })
    }
  }

  // Delete a searched word
  public async deleteSearchedWord(req: Request, res: Response) {
    const { userId, word } = req.params

    try {
      await prisma.searchedWord.delete({
        where: {
          userId_word: {
            userId,
            word: word.toLowerCase().trim()
          }
        }
      })

      res.status(HTTP_STATUS.OK).json({ message: 'Searched word deleted' })
    } catch (error) {
      console.error(error)
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete searched word' })
    }
  }
}

export const dictionaryController: DictionaryController = new DictionaryController()
