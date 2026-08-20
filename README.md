# 🎓 PH- TINHOCGENZ - Nền Tảng Làm Bài Tập & Luyện Thi Thông Minh (Web & Mobile PWA)

> Ứng dụng ôn luyện kiến thức, thi trắc nghiệm tính giờ, thẻ ghi nhớ Flashcard và quản lý học tập đa nền tảng tối ưu cho cả **Máy tính (Web Desktop)** và **Điện thoại di động (Mobile App / PWA)**.

---

## 🌟 Điểm Nổi Bật Của Ứng Dụng

- 📱 **Tương thích toàn diện Mobile & Web**:
  - Giao diện di động với thanh điều hướng đáy (Bottom Navigation Bar), tối ưu chạm vuốt.
  - Hỗ trợ **PWA (Progressive Web App)**: Học viên có thể bấm *"Thêm vào màn hình chính"* trên iOS/Android để sử dụng như một App thực thụ mà không cần thông qua App Store / Google Play.
- ⏱️ **Đa dạng chế độ học tập**:
  - **Kiểm tra tính giờ (Exam Mode)**: Đồng hồ đếm ngược, thanh tiến độ, ghim câu hỏi cần xem lại, tự động nộp bài khi hết giờ.
  - **Luyện tập tự do (Practice Mode)**: Xem ngay đáp án, gợi ý và lời giải thích cặn kẽ sau mỗi câu hỏi.
  - **Thẻ ghi nhớ 3D (Flashcards)**: Lật thẻ ghi nhớ thuật ngữ, công thức theo phương pháp Lặp lại ngắt quãng (Spaced Repetition).
- 📝 **Hỗ trợ 5 dạng câu hỏi phong phú**:
  1. Trắc nghiệm 1 lựa chọn (Single Choice)
  2. Trắc nghiệm nhiều lựa chọn (Multiple Choice)
  3. Đúng / Sai (True / False)
  4. Điền từ vào chỗ trống (Fill in the blank)
  5. Ghép cặp tương ứng (Matching Pairs)
- 🏆 **Gamification & Giấy chứng nhận**:
  - Theo dõi chuỗi ngày học liên tục (🔥 Streaks).
  - Tích lũy điểm kinh nghiệm (XP) & Thăng cấp học viên (Level 1 -> Level 5).
  - Bộ sưu tập huy hiệu thành tích độc đáo.
  - **Tự động xuất Giấy Chứng Nhận (Certificate of Completion)** có tên học viên để in ấn hoặc lưu file PDF.
- ✍️ **Công cụ Soạn & Quản lý Đề thi (Quiz Creator)**:
  - Cho phép học viên hoặc giảng viên tự tạo đề thi mới qua biểu mẫu trực quan.
  - Hỗ trợ Nhập / Xuất đề thi bằng định dạng JSON.
- 💾 **Hoạt động Offline & Đồng bộ**: Dữ liệu lưu trữ tự động trên thiết bị (LocalStorage), không lo mất tiến độ khi tải lại trang.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

### 1. Yêu cầu hệ thống
- Node.js version 18 trở lên.

### 2. Các bước cài đặt
```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy môi trường phát triển (Dev Server)
npm run dev

# 3. Mở trình duyệt và truy cập:
# http://localhost:3000
```

### 3. Build đóng gói ứng dụng
```bash
npm run build
```

---

## 📤 Hướng Dẫn Đẩy Mã Nguồn Lên GitHub

### Cách 1: Sử dụng Terminal / Git CLI

1. **Khởi tạo Git và Commit mã nguồn**:
   ```bash
   git init
   git add .
   git commit -m "feat: Khoi tao du an PH- TINHOCGENZ Web and Mobile Study App"
   ```

2. **Tạo Repository mới trên GitHub**:
   - Truy cập [github.com/new](https://github.com/new).
   - Đặt tên repository (ví dụ: `ph-tinhocgenz`), chọn **Public** hoặc **Private**, sau đó bấm **Create repository**.

3. **Liên kết và Đẩy (Push) lên GitHub**:
   ```bash
   # Đổi nhánh chính thành main
   git branch -M main

   # Thêm remote origin (thay URL bằng link GitHub của bạn)
   git remote add origin https://github.com/<USERNAME-CUA-BAN>/ph-tinhocgenz.git

   # Đẩy code lên GitHub
   git push -u origin main
   ```

---

## 🌐 Hướng Dẫn Triển Khai (Deploy) Lên Vercel Miễn Phí

Dự án đã được cấu hình sẵn tệp `vercel.json` chuẩn hóa để hỗ trợ định tuyến Single Page Application mượt mà và tự động cấp chứng chỉ bảo mật HTTPS.

### Cách 1: Deploy trực tiếp qua giao diện Vercel (Khuyên Dùng)

1. Truy cập [vercel.com](https://vercel.com/) và đăng nhập bằng tài khoản **GitHub**.
2. Bấm vào nút **"Add New..."** ➔ chọn **"Project"**.
3. Tìm và chọn repository `ph-tinhocgenz` bạn vừa đẩy lên GitHub ➔ bấm **"Import"**.
4. Vercel sẽ tự động nhận diện cấu hình **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Bấm **"Deploy"**. Quá trình build sẽ hoàn tất sau khoảng 30 giây!
6. Bạn sẽ nhận được đường link trực tiếp (ví dụ: `https://ph-tinhocgenz.vercel.app`) để gửi cho học viên trải nghiệm trên cả điện thoại và máy tính.

### Cách 2: Deploy bằng Vercel CLI

```bash
# Cài đặt Vercel CLI (nếu chưa có)
npm i -g vercel

# Đăng nhập và deploy
vercel --prod
```

---

## 📲 Hướng Dẫn Học Viên Cài Đặt Lên Màn Hình Điện Thoại (PWA)

### Trên iPhone / iPad (iOS Safari):
1. Truy cập đường link Vercel bằng trình duyệt **Safari**.
2. Nhấn vào nút **Chia sẻ (Share icon 📤)** ở thanh công cụ dưới đáy màn hình.
3. Chọn mục **"Thêm vào Màn hình chính" (Add to Home Screen)**.
4. Nhấn **Thêm (Add)**. Biểu tượng PH- TINHOCGENZ sẽ xuất hiện trên màn hình điện thoại như ứng dụng tải từ App Store.

### Trên Điện thoại Android (Google Chrome):
1. Mở đường link Vercel trên trình duyệt **Chrome**.
2. Nhấn vào dấu **3 chấm (⋮)** ở góc trên bên phải màn hình.
3. Chọn **"Cài đặt ứng dụng" (Install app)** hoặc **"Thêm vào màn hình chính"**.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
XULYNNTN/
├── public/
│   ├── favicon.svg             # Biểu tượng ứng dụng SVG
│   └── manifest.json           # Cấu hình PWA Web App Manifest
├── src/
│   ├── components/
│   │   ├── analytics/          # Bảng thống kê tiến độ, XP & Huy hiệu
│   │   ├── bookmarks/          # Quản lý câu hỏi đã ghim
│   │   ├── creator/            # Soạn thảo đề thi & nhập xuất JSON
│   │   ├── flashcards/         # Thẻ ghi nhớ 3D lật mặt
│   │   ├── layout/             # Header, Sidebar (Desktop), Mobile Bottom Nav
│   │   ├── quiz/               # QuizRunner, QuestionCard, QuizResult, QuizCatalog
│   │   └── ui/                 # Modal cài đặt PWA, Modal sửa tên học viên
│   ├── data/
│   │   ├── badges.ts           # Danh sách huy hiệu Gamification
│   │   └── defaultQuizzes.ts   # Ngân hàng câu hỏi mẫu phong phú
│   ├── hooks/
│   │   ├── useLocalStorage.ts  # Quản lý lưu trữ Offline & Streaks
│   │   └── useQuizEngine.ts    # Logic tính giờ, chấm điểm & điều phối bài thi
│   ├── types/
│   │   └── quiz.ts             # Type definitions TypeScript
│   ├── utils/
│   │   └── audio.ts            # Sound Engine Web Audio API không phụ thuộc file ngoài
│   ├── App.tsx                 # Điều phối ứng dụng chính
│   ├── index.css               # Design System CSS giao diện Dark/Light & Responsive
│   └── main.tsx
├── vercel.json                 # Cấu hình Deploy Vercel chống lỗi 404
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

*Chúc bạn có những trải nghiệm học tập và giảng dạy tuyệt vời cùng **PH- TINHOCGENZ**!*
