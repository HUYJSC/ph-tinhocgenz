# BÁO CÁO KIỂM TOÁN GIAO DIỆN HỌC VIÊN (UI & LAYOUT AUDIT)
**Dự án:** PH Digital Education LMS  
**Đối tượng kiểm toán:** Giao diện học viên (`src/components/dashboard/StudentOnePageDashboard.tsx`, `Header.tsx`, `App.tsx`, `index.css`)  
**Thẩm định viên:** Senior UX Researcher & Senior UI/Frontend Architect  
**Ngày thực hiện:** 31/08/2026

---

## I. HIỆN TRẠNG QUAN SÁT TỪ ẢNH & ĐỐI CHIẾU MÃ NGUỒN

### 1. Hiện tượng trên màn hình lớn (1366px – 1920px)
* **Khoảng trắng hai bên cực lớn:** Toàn bộ bảng điều khiển bị gom vào một dải hẹp ở chính giữa màn hình, hai bên lề trái/phải trống trải chiếm gần 40% diện tích màn hình ở độ phân giải 1920x1080.
* **Nội dung bị thu nhỏ quá mức:** Chữ, icon, nút bấm và các card nghiệp vụ bị nén nhỏ, tạo cảm giác như đang xem một giao diện mobile được phóng to trên màn hình máy tính.
* **Cột nội dung chính và Sidebar mất cân đối:**
  * Khối "Việc cần làm", "Ôn tập thông minh", "Kỹ năng chuyên môn", "Trợ lý AI" bị dồn ép vào cột phụ bên phải chật chội.
  * Các thanh tiến độ (Progress Bar) quá ngắn, chữ ghi phần trăm chỉ từ 11px - 12px rất khó đọc.
* **Header và Thanh điều hướng:** Kích thước icon và menu quá nhỏ so với viewport desktop.

---

## II. NGUYÊN NHÂN GỐC TỪ SOURCE CODE (ROOT CAUSE ANALYSIS)

Qua rà soát chuyên sâu từng dòng mã nguồn, đội ngũ phát hiện 5 nguyên nhân gốc sau:

### 1. Giới hạn `maxWidth: '1240px'` cứng nhắc trên Desktop
* **Vị trí:** `src/components/dashboard/StudentOnePageDashboard.tsx` (Dòng 98).
* **Phân tích:** Ở màn hình 1920px, kích thước hiển thị bị khóa cứng ở 1240px, dẫn đến `(1920 - 1240) / 2 = 340px` khoảng trống vô nghĩa ở mỗi bên lề.
* **Hậu quả phụ:** Trong `src/App.tsx` (Dòng 560), khi chuyển sang các tab khác trong phân hệ học viên, `maxWidth` còn bị bóp nghẹt xuống chỉ còn `860px`!

### 2. Định nghĩa Grid phụ thuộc giá trị pixel tuyệt đối (`minmax(0, 1fr) 380px`)
* **Vị trí:** `src/components/dashboard/StudentOnePageDashboard.tsx` (Dòng 330).
* **Phân tích:** Cột sidebar bên phải bị cố định ở `380px`. Khi nằm trong container 1240px, cột nội dung chính chỉ còn lại khoảng `796px` (sau khi trừ padding 40px và gap 24px).
* **Hệ quả:** Cột chính chỉ chiếm ~66% không gian thực, trong khi cột phụ 380px phải gánh cùng lúc 4 khối chức năng lớn, dẫn đến việc chữ và card bị nén ép nghiêm trọng.

### 3. Suy thoái thang Typography (Thang font-size quá nhỏ)
* **Kết quả phân tích từ script AST:**
  * `13px`: 10 vị trí
  * `12px`: 6 vị trí
  * `12.5px`: 4 vị trí
  * `11px` & `11.5px`: 4 vị trí
  * `0.72rem` (11.5px): 1 vị trí
* **Phân tích:** Đa số văn bản mô tả, nhãn nút bấm, tiến độ học tập và thông số đều đang sử dụng cỡ chữ từ 11px đến 13px (vi phạm nghiêm trọng tiêu chuẩn WCAG 2.2 AA và thiết kế EdTech hiện đại vốn yêu cầu Body text từ 15px - 16px).

### 4. Lạm dụng Inline Styles phân tán thay vì Design System tập trung
* Giao diện học viên đang sử dụng gần 100% inline CSS với các giá trị hardcode (`padding: '22px 24px'`, `fontSize: '11px'`, `gap: '16px'`), không kế thừa các CSS Variables đã khai báo trong `src/index.css`.
* Thiếu các hàm linh hoạt như `clamp()`, `min()` để thích ứng mượt mà theo độ rộng màn hình.

---

## III. BẢNG PHÂN LOẠI MỨC ĐỘ KHẮC PHỤC (P0 / P1 / P2)

| Mã lỗi | Phân loại | Mô tả lỗi | Giải pháp kỹ thuật chuẩn hóa |
| :--- | :---: | :--- | :--- |
| **UI-P0-01** | 🔴 P0 | Khoảng trắng hai bên khổng lồ trên Desktop 1366–1920px | Nâng cấp container linh hoạt: `width: min(100% - 48px, 1440px); margin-inline: auto;` kết hợp 12-column grid. |
| **UI-P0-02** | 🔴 P0 | Chữ bị thu nhỏ quá mức (11px – 13px cho body text) | Chuẩn hóa thang Typography: H1 28–32px, H2 22–26px, Card Title 17–20px, Body 15–16px, Caption ≥ 13px. |
| **UI-P0-03** | 🔴 P0 | Sidebar 380px bị nén ép 4 card nghiệp vụ quan trọng | Tái cấu trúc Bento Grid 8:4 (Desktop), tự động co giãn 68% : 32%, gap 24–32px, chuyển 1 cột trên Mobile/Tablet. |
| **UI-P1-01** | 🟡 P1 | Hero Banner chưa cân đối tỷ lệ và thông tin tiến độ | Thiết kế lại Hero Banner với padding 32px, H1 28px, progress bar chuẩn có nhãn và tooltip giải thích cách tính. |
| **UI-P1-02** | 🟡 P1 | Card "Việc cần làm" thiếu deadline và mức độ ưu tiên | Bổ sung deadline cụ thể, trạng thái quá hạn (Overdue state), mức ưu tiên (Cao/Trung bình/Thấp) và Empty state. |
| **UI-P1-03** | 🟡 P1 | Khối "Kỹ năng chuyên môn" dùng số phần trăm thiếu căn cứ | Bổ sung căn cứ tính điểm (số bài test đã làm, độ khó, trọng số, confidence score) theo chuẩn DA. |
| **UI-P2-01** | 🟢 P2 | Khung Trợ lý AI quá hẹp trong sidebar | Hỗ trợ nút mở rộng Drawer toàn màn hình (AI Tutor Drawer) hoặc chuyển sang tab chuyên biệt. |
| **UI-P2-02** | 🟢 P2 | Thiếu responsive breakpoints cho Tablet (768–1024px) | Bổ sung media queries chuyển đổi mượt mà giữa desktop grid và mobile single-column. |

---

## IV. KẾ HOẠCH TÁI THIẾT KẾ & QUALITY GATE UI

1. **Khắc phục container & layout:** Tạo class `.dashboard-container` và `.dashboard-grid` chuẩn trong `index.css`.
2. **Loại bỏ triệt để code inline style thu nhỏ:** Áp dụng hệ thống biến CSS `--text-h1`, `--text-body`, `--space-*`.
3. **Kiểm thử tự động:**
   * Không còn bất kỳ font chữ nào dưới 12px cho nội dung chính.
   * Viewport 1920px đạt chiều rộng nội dung từ 1280px - 1440px.
   * Viewport 1366px lấp đầy tối thiểu 88% chiều rộng màn hình.
   * Viewport 390px (Mobile) hiển thị 1 cột hoàn chỉnh, không có horizontal scroll.
