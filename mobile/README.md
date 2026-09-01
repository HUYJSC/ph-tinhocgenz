# PH DIGITAL EDUCATION — ỨNG DỤNG MOBILE (FLUTTER)

Mã nguồn ứng dụng di động chính thức của hệ sinh thái **PH Digital Education** (Học viện Tin học & Khảo thí Quốc tế), xây dựng trên nền tảng **Flutter / Dart** chuẩn Clean Architecture.

---

## 1. Kiến Trúc Hệ Thống (Clean Architecture)

```
mobile/
├── pubspec.yaml                 # Khai báo thư viện & cấu hình SDK
├── lib/
│   ├── main.dart                # Điểm khởi động ứng dụng
│   ├── core/                    # Thành phần lõi dùng chung
│   │   ├── network/             # Dio HTTP client, JWT Interceptor, Auto-refresh token
│   │   ├── theme/               # Design system: Plus Jakarta Sans, Dark/Light mode, WCAG touch target
│   │   ├── storage/             # Hive offline storage cho đề thi và sync queue
│   │   ├── biometrics/          # Xác thực sinh trắc học FaceID / Vân tay
│   │   └── deep_link/           # Deep linking Universal Links & App Links
│   └── features/                # Các tính năng nghiệp vụ theo module
│       ├── auth/                # Đăng nhập JWT, xác thực sinh trắc học
│       ├── dashboard/           # Giao diện 5 tabs cho học viên và giảng viên
│       ├── attendance/          # Quét mã QR camera native & nhập PIN
│       └── quiz/                # Làm bài thi offline, autosave Hive, anti-cheat
└── README.md
```

---

## 2. Tính Năng Cốt Lõi

1. **Đồng Bộ Dữ Liệu Hai Chiều với Django Backend:**
   - Base URL: `https://hoctructuyen.tinhocgenz.io.vn/api/v1`
   - Quản lý JWT Token qua `FlutterSecureStorage` (Mã hóa phần cứng Keychain trên iOS / KeyStore trên Android).
   - Tự động làm mới Access Token qua Refresh Token khi gặp lỗi HTTP 401.
2. **Quét Mã QR Native Camera Siêu Tốc:**
   - Tích hợp `mobile_scanner` bắt mã QR động trong vòng $< 100\text{ms}$.
   - Hỗ trợ nhập mã PIN dự phòng khi camera bị mờ hoặc thiếu sáng.
3. **Luyện Thi Offline & Tự Động Đồng Bộ (Offline-First):**
   - Lưu trữ ngân hàng đề thi và trạng thái làm bài tạm thời vào `Hive`.
   - Cơ chế phát hiện học viên rời ứng dụng (Anti-cheat tab switch counter) cảnh báo gian lận thời gian thực.
4. **Xác Thực Sinh Trắc Học (Biometrics):**
   - Đăng nhập 1 chạm an toàn bằng FaceID hoặc Vân tay.
5. **Hỗ Trợ Deep Linking:**
   - Định tuyến tự động khi người dùng nhấp vào liên kết web:
     - `https://hoctructuyen.tinhocgenz.io.vn/verify/<id>` $\rightarrow$ Màn hình tra cứu chứng chỉ số.
     - `https://hoctructuyen.tinhocgenz.io.vn/app/?track=<id>` $\rightarrow$ Mở thẳng khóa học tương ứng.
     - `eduquest://checkin?pin=<pin>` $\rightarrow$ Tự động mở ca điểm danh.

---

## 3. Hướng Dẫn Biên Dịch Ứng Dụng

### Yêu cầu môi trường
* Flutter SDK $\ge 3.0.0$
* Android Studio / Xcode

### Lệnh cài đặt và chạy thử
```bash
cd mobile
flutter pub get
flutter run
```

### Biên dịch bản phát hành (Production Release)
* **Android APK / App Bundle:**
  ```bash
  flutter build apk --release
  flutter build appbundle --release
  ```
* **iOS IPA:**
  ```bash
  flutter build ipa --release
  ```
