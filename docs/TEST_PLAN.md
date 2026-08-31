# KẾ HOẠCH KIỂM THỬ TỰ ĐỘNG & BẢO ĐẢM CHẤT LƯỢNG (TEST PLAN)
**Dự án:** PH Digital Education  
**Tiêu chuẩn:** QA Automation (Pytest + Node Test Runner + Type Checking)  
**Mục tiêu Coverage:** Backend ≥ 85% (Core Auth/Exam/Grading ≥ 90%)

---

## I. MA TRẬN PHÂN TẦNG KIỂM THỬ (TEST PYRAMID)

1. **Unit & API Testing (Backend):**
   * Sử dụng framework: `pytest`, `pytest-django`.
   * Tập trung: Băm mật khẩu, phân quyền endpoint, chống IDOR, logic chấm điểm, tính toán tỷ lệ đạt chuẩn, sinh mã băm chứng chỉ.
   * Lệnh chạy: `backend\venv\Scripts\pytest backend\tests`
2. **Component & Business Testing (Frontend):**
   * Sử dụng framework: Node.js Test Runner (`node tests/run-tests.mjs`).
   * Tập trung: 10 chương trình đào tạo, định dạng Quiz Timer, giám sát gian lận rời tab thi, kiểm tra tệp cấu trúc.
   * Lệnh chạy: `npm test`
3. **Type Checking & Static Analysis:**
   * Frontend: `npx tsc --noEmit` (bảo đảm 0 compile error).
   * Backend: `ruff check backend`, `ruff format --check backend`.
4. **Production Build Testing:**
   * Frontend: `npm run build` (Vite production bundle verification).
   * Backend: `python backend/manage.py check --deploy`.
