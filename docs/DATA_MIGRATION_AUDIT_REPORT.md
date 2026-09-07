# BÁO CÁO AUDIT & MIGRATION DỮ LIỆU HIỆN TẠI (GIAI ĐOẠN 13)
**Hệ thống:** PH DIGITAL EDUCATION – TIN HỌC GEN Z  
**Thời gian:** 07/09/2026  
**Chuyên gia thực hiện:** Database Administrator & MOS Assessment Specialist  

---

## 1. BẢNG TỔNG HỢP KIỂM KÊ TRƯỚC VÀ SAU MIGRATION

| Chỉ số kiểm kê | Trước Migration | Sau Migration | Chênh lệch | Đánh giá |
|---|---|---|---|---|
| **Tổng số đề thi (Quizzes)** | **10 đề** | **10 đề** | **0** | **Bảo toàn 100%** |
| **Tổng số câu hỏi trắc nghiệm** | **28 câu** | **28 câu** | **0** | **Bảo toàn 100%** |
| **Tổng số phương án & đáp án** | **28 đáp án** | **28 đáp án** | **0** | **Không đổi đáp án** |
| **Thang điểm câu hỏi** | 10đ / câu | 10đ / câu | **0** | **Không đổi điểm** |
| **ID câu hỏi & liên kết đề thi** | Giữ nguyên ID gốc | Giữ nguyên ID gốc | **0** | **Không hỏng liên kết** |
| **Kết quả làm bài học viên** | LocalStorage v2 | LocalStorage v2 | **0** | **Không hỏng lịch sử** |
| **Câu thiếu metadata** | 0 câu | 0 câu | **0** | Chuẩn hóa |
| **Câu trùng lặp** | 0 câu | 0 câu | **0** | Độc nhất |

---

## 2. RÀ SOÁT & LÀM RÕ CHUẨN MÃ BÀI THI MOS WORD 2019 vs MICROSOFT 365 APPS

### Phát hiện tồn tại cũ:
- Đề số 8 trong [src/data/defaultQuizzes.ts](file:///f:/PR_%20Tin%20H%E1%BB%8Dc/eduquest-study-app/src/data/defaultQuizzes.ts) (`quiz-word-6b`) từng ghi nội dung gộp:
  > *"Bộ đề thi thử chuẩn Microsoft Office Specialist Word 2019 / Microsoft 365: ... (Exam MO-100)"*
- Căn cứ khảo thí Certiport & Microsoft Learn:
  - **MO-100**: Dành riêng cho **Microsoft Word Associate (Office 2019)**.
  - **MO-110**: Mã bài thi chính thức cho **Microsoft Word Associate (Microsoft 365 Apps)**.

### Hiệu chỉnh chuẩn hóa:
- Cập nhật tiêu đề đề số 8: `Khảo Thí Quốc Tế: MOS Word Associate (Exam MO-100 - Office 2019)`
- Thêm ghi chú kỹ thuật: *"Lưu ý: Đối với Microsoft 365 Apps, mã bài thi tương ứng là Exam MO-110."*
- Giữ nguyên toàn bộ 4 câu hỏi: `mos-w-q1`, `mos-w-q2`, `mos-w-q3`, `mos-w-q4`, đáp án và điểm số không đổi.

---

## 3. PHƯƠNG ÁN & KỊCH BẢN ROLLBACK (ROLLBACK SCRIPT)
Trong trường hợp cần quay về phiên bản trước khi migration:
1. **Frontend**: Sử dụng git tag hoặc restore tệp [src/data/defaultQuizzes.ts](file:///f:/PR_%20Tin%20H%E1%BB%8Dc/eduquest-study-app/src/data/defaultQuizzes.ts):
   ```bash
   git checkout HEAD~1 -- src/data/defaultQuizzes.ts
   ```
2. **Supabase Migration Rollback**:
   Chạy lệnh drop các bảng mới mà không ảnh hưởng bảng người dùng hoặc bài nộp hiện tại:
   ```sql
   DROP TABLE IF EXISTS public.team_notification_reads CASCADE;
   DROP TABLE IF EXISTS public.team_notifications CASCADE;
   DROP TABLE IF EXISTS public.internal_learning_materials CASCADE;
   DROP TABLE IF EXISTS public.content_sync_logs CASCADE;
   DROP TABLE IF EXISTS public.content_sync_jobs CASCADE;
   DROP TABLE IF EXISTS public.content_review_actions CASCADE;
   DROP TABLE IF EXISTS public.content_review_queue CASCADE;
   DROP TABLE IF EXISTS public.resource_files CASCADE;
   DROP TABLE IF EXISTS public.resource_versions CASCADE;
   DROP TABLE IF EXISTS public.learning_resources CASCADE;
   DROP TABLE IF EXISTS public.learning_source_feeds CASCADE;
   DROP TABLE IF EXISTS public.learning_sources CASCADE;
   DROP TABLE IF EXISTS public.objective_domains CASCADE;
   DROP TABLE IF EXISTS public.certification_catalog CASCADE;
   ```
