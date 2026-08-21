# LỘ TRÌNH PHÁT TRIỂN TOÀN DIỆN (6-PHASE ROADMAP)
**Dự án:** TinHocGenZ AI Learning & Assessment Platform 2026

---

## 🚀 PHASE 1: NỀN TẢNG KIẾN TRÚC & SERVICE LAYER (FOUNDATION)
* ✅ Tạo các interface TypeScript chuẩn hóa: `MasteryRecord`, `SkillNode`, `SmartReviewItem`, `LearningPath`, `LearningEvent`, `Certificate`, `StudentRiskProfile`.
* ✅ Xây dựng các Service độc lập: `masteryService.ts`, `smartReviewService.ts`, `analyticsService.ts`, `certificateService.ts`, `earlyWarningService.ts`.
* ✅ Chuẩn hóa RBAC và hệ thống Event Tracking (`analyticsService.trackEvent`).

---

## 🎯 PHASE 2: TRẢI NGHIỆM HỌC VIÊN CÁ NHÂN HÓA (STUDENT EXPERIENCE)
* ✅ **Onboarding Kiểm Tra Đầu Vào (Diagnostic Test 5-15p):** Đánh giá năng lực và phân loại trình độ.
* ✅ **Action-First Student Dashboard:**
  - Lời chào cá nhân, Mastery Score tổng quan, Streak học tập.
  - Nút hành động duy nhất nổi bật: **`[ TIẾP TỤC HỌC NGAY ]`**.
  - Danh mục nhiệm vụ hôm nay: *Bài học trọng tâm, 5 câu cần ôn, Mini Test*.
* ✅ **Lộ Trình Học Cá Nhân (Learning Path Roadmap):** Tiến trình theo từng cụm kỹ năng với thanh % Mastery.
* ✅ **Ngân Hàng Câu Sai & Ôn Tập Thông Minh (Smart Review / Spaced Repetition):** Tự động gom lỗi sai và lập lịch ôn.

---

## 📝 PHASE 3: HỆ THỐNG KHẢO THÍ CHUYÊN SÂU (ASSESSMENT & EXAM ENGINE)
* ✅ Nâng cấp **Exam Engine**: Đếm ngược thời gian thực, Autosave liên tục tránh mất mạng, Random câu hỏi & đáp án.
* ✅ **Báo Cáo Phân Tích Năng Lực Sau Thi (Skill Breakdown):** Tỷ lệ % theo từng kỹ năng và đề xuất học lại 3 nội dung yếu nhất.
* ✅ **Feedback Chi Tiết Sau Câu Sai:** Giải thích ngữ cảnh, phím tắt thực hành và nút hỏi AI Tutor.

---

## 🤖 PHASE 4: TRÍ TUỆ NHÂN TẠO CÁ NHÂN HÓA (AI TUTOR & COPILOT)
* ✅ **TinHocGenZ AI Tutor:**
  1. *Chế độ 1: Giải thích kiến thức chi tiết*
  2. *Chế độ 2: Gợi ý từng bước (không làm hộ đáp án)*
  3. *Chế độ 3: Đặt câu hỏi kiểm tra độ hiểu*
* ✅ **AI Phân Tích Điểm Yếu Định Kỳ:** Dự đoán các bẫy đề thi học viên hay mắc phải.
* ✅ **AI Copilot Cho Giảng Viên:** Soạn thảo bộ câu hỏi trắc nghiệm và bài tập thực hành chuẩn MOS trong tích tắc.

---

## 👨‍🏫 PHASE 5: QUẢN TRỊ & HỆ THỐNG CẢNH BÁO SỚM (TEACHER & RISK SYSTEM)
* ✅ **Teacher Early Warning Dashboard:** Tự động tính toán Risk Score (`LOW` / `MEDIUM` / `HIGH` / `CRITICAL`) để phát hiện học viên có nguy cơ bỏ học hoặc sa sút.
* ✅ Thống kê kỹ năng học viên làm sai nhiều nhất để giảng viên ôn tập trọng tâm trên lớp.

---

## 🏆 PHASE 6: CHỨNG NHẬN, GAMIFICATION & TỐI ƯU HÓA (GROWTH & EXPANSION)
* ✅ **Hệ Thống Chứng Nhận Số (QR Verifiable Certificate):** Mã tra cứu duy nhất và trang xác thực công khai `/certificate/verify/:id`.
* ✅ Gamification lành mạnh (XP, Streak, Huy hiệu theo mốc hoàn thành thực tế).
* ✅ PWA & Mobile-First Optimization.
