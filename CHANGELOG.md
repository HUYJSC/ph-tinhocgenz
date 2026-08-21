# CHANGELOG: TINHOCGENZ AI LEARNING & ASSESSMENT PLATFORM 2026

## 🚀 Phiên bản 2.0.0 — Nâng Cấp Kiến Trúc AI EdTech Toàn Diện

### 1. 📂 Các Tài Liệu Kiến Trúc Đã Thiết Lập
* [`TECHNICAL_AUDIT.md`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/TECHNICAL_AUDIT.md): Báo cáo đánh giá kỹ thuật chuyên sâu về hệ thống hiện tại, các rủi ro và giải pháp tối ưu.
* [`ARCHITECTURE_PLAN.md`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/ARCHITECTURE_PLAN.md): Bản vẽ thiết kế vòng lặp học tập 5 trụ cột (LEARN, PRACTICE, ASSESS, ANALYZE, AI PERSONALIZE).
* [`DATABASE_PLAN.md`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/DATABASE_PLAN.md): Thiết kế Schema dữ liệu chuẩn hóa, các thực thể nguyên tử và quy tắc lập chỉ mục (Indexes).
* [`ROADMAP.md`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/ROADMAP.md): Lộ trình 6 giai đoạn chi tiết từ Foundation đến Growth.

---

### 2. ⚡ Các Service Độc Lập Mới (Service Layer Pattern)
* **`MasteryService` ([`src/services/masteryService.ts`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/services/masteryService.ts)):** Thuật toán tính điểm thành thạo kỹ năng nguyên tử (0–100) theo độ chính xác, chuỗi làm đúng (streak) và khối lượng câu hỏi.
* **`SmartReviewService` ([`src/services/smartReviewService.ts`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/services/smartReviewService.ts)):** Quản lý ngân hàng câu làm sai và thuật toán lặp lại ngắt quãng (Spaced Repetition: 1 ngày $\rightarrow$ 3 ngày $\rightarrow$ 7 ngày $\rightarrow$ Thành thạo).
* **`AnalyticsService` ([`src/services/analyticsService.ts`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/services/analyticsService.ts)):** Thu thập sự kiện học tập chuẩn EdTech (`lesson_started`, `quiz_completed`, `exam_completed`, `certificate_earned`).
* **`EarlyWarningService` ([`src/services/earlyWarningService.ts`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/services/earlyWarningService.ts)):** Đánh giá nguy cơ bỏ học (Risk Score: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) cho giảng viên can thiệp 1-1 kịp thời.
* **`CertificateService` ([`src/services/certificateService.ts`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/services/certificateService.ts)):** Cấp phát chứng chỉ số có mã định danh duy nhất và liên kết xác thực công khai.
* **`AITutorService` ([`src/services/aiTutorService.ts`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/services/aiTutorService.ts)):** Xử lý ngữ cảnh 3 chế độ (*1. Giải thích kiến thức, 2. Gợi ý từng bước không lộ đáp án, 3. Kiểm tra độ hiểu*).

---

### 3. 🎯 Giao Diện & Trải Nghiệm Học Viên 2026 (UI/UX)
* **`StudentDashboard2026` ([`src/components/dashboard/StudentDashboard2026.tsx`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/components/dashboard/StudentDashboard2026.tsx)):** Dashboard tập trung vào hành động với nút **`[ TIẾP TỤC HỌC NGAY ]`**, vòng tròn Mastery Score và 3 nhiệm vụ hôm nay (*Bài học trọng tâm, 5 câu cần ôn, Mini Test*).
* **`DiagnosticOnboardingModal` ([`src/components/onboarding/DiagnosticOnboardingModal.tsx`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/components/onboarding/DiagnosticOnboardingModal.tsx)):** Khảo sát mục tiêu và làm bài kiểm tra đầu vào 5 câu để phân loại điểm mạnh/yếu.
* **`LearningPathRoadmap` ([`src/components/learning-path/LearningPathRoadmap.tsx`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/components/learning-path/LearningPathRoadmap.tsx)):** Cây lộ trình học kỹ năng với trạng thái *Chưa học, Đang học, Cần ôn luyện, Đã thành thạo*.
* **`SmartReviewModal` ([`src/components/smart-review/SmartReviewModal.tsx`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/components/smart-review/SmartReviewModal.tsx)):** Trình giải đề ôn lỗi sai kèm giải thích và nút hỏi AI Tutor tức thì.
* **`AITutorDrawer` ([`src/components/ai-tutor/AITutorDrawer.tsx`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/components/ai-tutor/AITutorDrawer.tsx)):** Trợ lý AI đồng hành thông minh.
* **`EarlyWarningDashboard` ([`src/components/teacher/EarlyWarningDashboard.tsx`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/components/teacher/EarlyWarningDashboard.tsx)):** Bảng điều khiển cảnh báo sớm học viên cho giảng viên.
* **`CertificateVerificationModal` ([`src/components/certificates/CertificateVerificationModal.tsx`](file:///f:/Projectsqa/XULYNNTN/eduquest-study-app/src/components/certificates/CertificateVerificationModal.tsx)):** Giấy chứng nhận hoàn thành khóa học chuẩn hóa.
