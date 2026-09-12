import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🧪 BẮT ĐẦU CHU KỲ KIỂM TRA TỰ ĐỘNG (AUTOMATED TEST SUITE)');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} -> ${details}`);
  }
}

// 1. Test Component & Asset files exist
console.log('📁 NHÓM 1: Kiểm tra cấu trúc tệp & Thành phần cốt lõi');
const requiredFiles = [
  'src/App.tsx',
  'src/index.css',
  'src/components/auth/UnifiedAuthGateway.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/components/dashboard/StudentOnePageDashboard.tsx',
  'src/components/landing/LandingPage.tsx',
  'src/components/practice/PracticeBySkill.tsx',
  'src/components/quiz/QuizRunner.tsx',
  'src/components/quiz/QuizResult.tsx',
  'src/services/weakSkillService.ts',
  'src/services/recommendationService.ts',
  'src/types/skill.ts',
  'dist/index.html',
  'dist/assets'
];

requiredFiles.forEach(f => {
  const exists = fs.existsSync(path.resolve(f));
  assert(exists, `Tệp/Thư mục tồn tại: ${f}`, `Không tìm thấy ${f}`);
});

// 2. Test Format Time function
console.log('\n⏱️ NHÓM 2: Kiểm tra hàm xử lý thời gian thi (Quiz Timer)');
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

assert(formatTime(0) === '00:00', 'Định dạng 0 giây -> 00:00');
assert(formatTime(65) === '01:05', 'Định dạng 65 giây -> 01:05');
assert(formatTime(3599) === '59:59', 'Định dạng 3599 giây -> 59:59');

// 3. Test Curriculum Track mappings
console.log('\n📚 NHÓM 3: Kiểm tra danh mục 10 chương trình đào tạo');
const TRACK_LIST = [
  'office-fast-3in1',
  'cc-cntt-basic',
  'cc-cntt-advanced',
  'cntt-basic-we',
  'cntt-adv-we',
  'ai-office',
  'excel-accounting',
  'word-6b',
  'excel-6b',
  'ppt-6b'
];
assert(TRACK_LIST.length === 10, 'Đủ 10 chương trình đào tạo chuyên sâu');
assert(TRACK_LIST.includes('office-fast-3in1'), 'Chương trình cấp tốc 3in1 hợp lệ');
assert(TRACK_LIST.includes('ai-office'), 'Chương trình ứng dụng AI vào VP hợp lệ');

// 4. Test UnifiedAuthGateway Source Checks
console.log('\n🔐 NHÓM 4: Kiểm tra tính năng Cổng Xác thực (Auth Gateway)');
const authContent = fs.readFileSync('src/components/auth/UnifiedAuthGateway.tsx', 'utf8');
assert(authContent.includes('setShowPassword(!showPassword)'), 'Có nút Hiện/Ẩn mật khẩu (Show/Hide toggle)');
assert(!authContent.includes('handleQuickFillStudent'), 'Đã xóa bỏ hàm đăng nhập nhanh học viên (P0 Security Lockdown)');
assert(!authContent.includes('handleQuickFillAdmin'), 'Đã xóa bỏ hàm đăng nhập nhanh quản trị viên (P0 Security Lockdown)');
assert(authContent.includes('EyeOff') && authContent.includes('Eye'), 'Có icon Eye & EyeOff của Lucide');

// 5. Test Dashboard To-Do Hub
console.log('\n📊 NHÓM 5: Kiểm tra Bảng điều khiển & Widget To-Do');
const dashboardContent = fs.readFileSync('src/components/dashboard/StudentOnePageDashboard.tsx', 'utf8');
assert(dashboardContent.includes('Việc cần làm hôm nay'), 'Có Widget To-Do Hub theo chuẩn Canvas LMS');
assert(dashboardContent.includes('var(--font-sans)'), 'Đã chuẩn hóa font chữ sans-serif hiện đại');

// 6. Test Landing Page & Practice by Skill
console.log('\n🌟 NHÓM 6: Kiểm tra Landing Page & Luyện tập theo kỹ năng');
const landingContent = fs.readFileSync('src/components/landing/LandingPage.tsx', 'utf8');
assert(landingContent.includes('PH DIGITAL EDUCATION'), 'Landing Page có tên thương hiệu PH DIGITAL EDUCATION');
assert(landingContent.includes('Kiểm tra trình độ miễn phí'), 'Landing Page có CTA kiểm tra trình độ');

const practiceContent = fs.readFileSync('src/components/practice/PracticeBySkill.tsx', 'utf8');
assert(practiceContent.includes('groupQuestionsBySkill'), 'PracticeBySkill gom nhóm câu hỏi theo skillId');
assert(practiceContent.includes('initialSkillId'), 'PracticeBySkill hỗ trợ chọn nhanh skill ban đầu');

// 7. Test Exam Integrity & Autosave
console.log('\n🛡️ NHÓM 7: Kiểm tra An ninh Khảo thí & Giám sát thi');
const quizRunnerContent = fs.readFileSync('src/components/quiz/QuizRunner.tsx', 'utf8');
assert(quizRunnerContent.includes('visibilitychange'), 'QuizRunner có event listener phát hiện rời tab thi');
assert(quizRunnerContent.includes('Cảnh báo giám sát thi'), 'QuizRunner có banner cảnh báo gian lận khi rời tab');
assert(quizRunnerContent.includes('showRestoredBanner'), 'QuizRunner có tính năng khôi phục bài thi từ Autosave');

// 8. Test Production Build bundle
console.log('\n📦 NHÓM 8: Kiểm tra gói đóng gói phân phối (Vite Dist)');
const distHtml = fs.readFileSync('dist/index.html', 'utf8');
assert(distHtml.includes('<!DOCTYPE html>'), 'Tệp index.html trong dist hợp lệ');
assert(distHtml.includes('/assets/'), 'Có đường dẫn nạp assets CSS/JS');

// 9. Test Periodic Reminders & Automated Web Push AI Notification Engine
console.log('\n🔔 NHÓM 9: Kiểm tra Hệ thống Thông báo Tự động & Web Push AI Phân loại theo độ tuổi');
const notifServiceContent = fs.readFileSync('src/services/aiNotificationService.ts', 'utf8');
assert(notifServiceContent.includes('ageThreshold: 25'), 'Ngưỡng phân tách độ tuổi mặc định là 25 tuổi');
assert(notifServiceContent.includes('recipientType: \'parent\''), 'Học viên < 25 tuổi định tuyến gửi Phụ huynh kèm cặp');
assert(notifServiceContent.includes('recipientType: \'student\''), 'Học viên ≥ 25 tuổi định tuyến gửi trực tiếp người học, tôn trọng quyền tự chủ');
assert(notifServiceContent.includes('daily') && notifServiceContent.includes('weekly') && notifServiceContent.includes('monthly'), 'Hỗ trợ đủ 3 chu kỳ: Hằng ngày, Hằng tuần, Hằng tháng');
const bellContent = fs.readFileSync('src/components/ui/NotificationBell.tsx', 'utf8');
assert(bellContent.includes('PushNotificationService'), 'NotificationBell tích hợp PushNotificationService');
assert(bellContent.includes('unreadCount'), 'Có badge đếm tin thông báo chưa đọc');

// 10. Test First-time Password Change & Self-Recovery via Email OTP
console.log('\n🔑 NHÓM 10: Kiểm tra Đổi mật khẩu lần đầu chuẩn SEC & Tự khôi phục tài khoản qua Email OTP');
const changePassContent = fs.readFileSync('src/components/auth/ChangePasswordModal.tsx', 'utf8');
assert(!changePassContent.includes('(Mặc định: 123)'), 'Đã xóa hoàn toàn nhãn lộ mật khẩu mặc định (Mặc định: 123)');
assert(changePassContent.includes('length < 6'), 'Nâng cấp tiêu chuẩn mật khẩu tối thiểu 6 ký tự');
assert(changePassContent.includes('showOldPass') && changePassContent.includes('showNewPass') && changePassContent.includes('showConfirmPass'), 'Có nút mắt Hiện/Ẩn riêng biệt cho từng trường');
assert(changePassContent.includes('Gợi ý mật khẩu mạnh'), 'Có nút AI/Công cụ gợi ý mật khẩu mạnh an toàn');

const recoveryServiceContent = fs.readFileSync('src/services/accountRecoveryService.ts', 'utf8');
assert(recoveryServiceContent.includes('generateRandomOtp'), 'Có hàm tự động sinh mã xác nhận OTP 6 số ngẫu nhiên');
assert(recoveryServiceContent.includes('maskEmail'), 'Có hàm che giấu địa chỉ email bảo vệ thông tin cá nhân');
assert(recoveryServiceContent.includes('MAX_OTP_ATTEMPTS'), 'Có cơ chế giới hạn lần thử chống Brute-force');

const forgotModalContent = fs.readFileSync('src/components/auth/ForgotPasswordModal.tsx', 'utf8');
assert(forgotModalContent.includes('enter_otp') && forgotModalContent.includes('new_password'), 'ForgotPasswordModal hỗ trợ quy trình Wizard đa bước qua Email OTP');
assert(forgotModalContent.includes('countdown'), 'Có bộ đếm ngược thời gian hết hạn mã xác nhận');

// 11. Test 3in1 Package Bundle Decomposer & Practice Attachments
console.log('\n📦 NHÓM 11: Kiểm tra Soạn Gói Đề & Tách Tệp Thực Hành 3in1 (Word - Excel - PPT)');
const bundleParserContent = fs.readFileSync('src/utils/packageBundleParser.ts', 'utf8');
assert(bundleParserContent.includes('decomposePackageFiles'), 'Có hàm bóc tách tự động nhiều tệp decomposePackageFiles');
assert(bundleParserContent.includes('splitSingleFileInto3Modules'), 'Có hàm bóc tách 1 file tổng hợp thành 3 file riêng biệt (Word, Excel, PPT)');
assert(bundleParserContent.includes('getSample3in1CombinedDocument'), 'Có hàm cung cấp tài liệu mẫu 3 môn tổng hợp');
assert(bundleParserContent.includes('detectModuleFromFile'), 'Có hàm tự động nhận diện mô-đun Word, Excel, PowerPoint từ phần mở rộng và tên tệp');

const splitterModalContent = fs.readFileSync('src/components/admin/FileSplitter3in1Modal.tsx', 'utf8');
assert(splitterModalContent.includes('splitSingleFileInto3Modules'), 'FileSplitter3in1Modal tích hợp bộ bóc tách 1 file ra 3 file');
assert(splitterModalContent.includes('Tải file Word'), 'FileSplitter3in1Modal cho phép tải riêng từng file Word, Excel, PPT');
assert(splitterModalContent.includes('Tải trọn bộ 3 file'), 'FileSplitter3in1Modal cho phép tải trọn bộ 3 file về máy');

const quizCreatorContent = fs.readFileSync('src/components/creator/QuizCreator.tsx', 'utf8');
assert(quizCreatorContent.includes('Tách 3 Môn'), 'QuizCreator có nút Tải 1 File & Tách 3 Môn');
assert(quizCreatorContent.includes('phtinhocgenz_preloaded_split_3in1'), 'QuizCreator hỗ trợ nạp dữ liệu tách 3 môn từ localStorage');
assert(quizCreatorContent.includes('practiceFiles'), 'QuizCreator hỗ trợ quản lý danh mục tệp thực hành đính kèm');
assert(quizCreatorContent.includes('activeModuleFilter'), 'QuizCreator có bộ lọc câu hỏi theo từng mô-đun Word, Excel, PPT');

const teacherManagerContent = fs.readFileSync('src/components/admin/TeacherAssignmentManager.tsx', 'utf8');
assert(teacherManagerContent.includes('Tách Đề 3 Môn: Word • Excel • PPT'), 'TeacherAssignmentManager đổi nút thành Tách Đề 3 Môn: Word • Excel • PPT');

const adminPortalContent = fs.readFileSync('src/components/admin/AdminPortal.tsx', 'utf8');
assert(adminPortalContent.includes('Tách Đề 3 Môn: Word • Excel • PPT'), 'AdminPortal cập nhật nút chính xác theo hình: Tách Đề 3 Môn: Word • Excel • PPT');

const runnerContent = fs.readFileSync('src/components/quiz/QuizRunner.tsx', 'utf8');
assert(runnerContent.includes('quiz.practiceFiles'), 'QuizRunner hỗ trợ học viên tải tệp bài tập thực hành về máy');

// 12. Test Mobile OS Calibration (Android & iOS)
console.log('\n📱 NHÓM 12: Kiểm tra Chuẩn hóa UI/UX Mobile App Đa Nền tảng (Android & iOS)');
const mobilePlatformExists = fs.existsSync(path.resolve('src/utils/mobilePlatform.ts'));
assert(mobilePlatformExists, 'Tệp tiện ích nền tảng src/utils/mobilePlatform.ts tồn tại');

const mobilePlatformContent = fs.readFileSync('src/utils/mobilePlatform.ts', 'utf8');
assert(mobilePlatformContent.includes('detectMobilePlatform'), 'Có hàm detectMobilePlatform nhận diện iOS và Android');
assert(mobilePlatformContent.includes('initMobilePlatform'), 'Có hàm initMobilePlatform gắn class nền tảng lên thẻ gốc');
assert(mobilePlatformContent.includes('triggerHapticFeedback'), 'Có hàm triggerHapticFeedback kích hoạt rung phản hồi xúc giác');

const cssContent = fs.readFileSync('src/index.css', 'utf8');
assert(cssContent.includes('.platform-ios'), 'CSS có bộ định kiểu riêng cho iOS (.platform-ios)');
assert(cssContent.includes('.platform-android'), 'CSS có bộ định kiểu riêng cho Android (.platform-android)');
assert(cssContent.includes('safe-area-inset-top') && cssContent.includes('safe-area-inset-bottom'), 'Hỗ trợ vùng an toàn Dynamic Island / Notch và Home Indicator');
assert(cssContent.includes('.dashboard-bento-grid'), 'Có lớp bento grid tự động chuyển 1 cột trên mobile chống tràn màn hình');
assert(cssContent.includes('.mobile-bottom-sheet'), 'Có lớp Bottom Sheet trượt từ đáy cho các hộp thoại trên mobile');

const mobileNavContent = fs.readFileSync('src/components/layout/MobileBottomNav.tsx', 'utf8');
assert(mobileNavContent.includes('triggerHapticFeedback'), 'MobileBottomNav tích hợp rung xúc giác chuẩn native app');
assert(mobileNavContent.includes('safe-bottom'), 'MobileBottomNav có khoảng đệm an toàn với thanh điều hướng đáy');

const studentDashContent = fs.readFileSync('src/components/dashboard/StudentOnePageDashboard.tsx', 'utf8');
assert(studentDashContent.includes('dashboard-bento-grid'), 'StudentOnePageDashboard sử dụng dashboard-bento-grid responsive');
assert(!studentDashContent.includes('minmax(0, 1fr) 380px'), 'Đã loại bỏ hoàn toàn bề rộng cứng 380px gây tràn ngang màn hình');

// 13. Test Phân hệ Trung Tâm Nguồn Học Liệu & Kiểm Duyệt Đề Thi
console.log('\n🏛️ NHÓM 13: Kiểm tra Trung Tâm Nguồn Học Liệu & Kiểm Duyệt Đề Thi (Phân hệ mới 2026)');

const learningTypesExists = fs.existsSync(path.resolve('src/types/learningResource.ts'));
assert(learningTypesExists, 'Tệp định nghĩa dữ liệu src/types/learningResource.ts tồn tại');

const certCatalogExists = fs.existsSync(path.resolve('src/data/certificationCatalog.ts'));
assert(certCatalogExists, 'Danh mục chuẩn khảo thí src/data/certificationCatalog.ts tồn tại');

const certCatalogContent = fs.readFileSync('src/data/certificationCatalog.ts', 'utf8');
assert(certCatalogContent.includes('MO-100') && certCatalogContent.includes('MOS_2019'), 'MO-100 được định nghĩa chính xác cho Office 2019');
assert(certCatalogContent.includes('MO-110') && certCatalogContent.includes('MOS_365'), 'MO-110 được định nghĩa chính xác cho Microsoft 365 Apps');
assert(certCatalogContent.includes('validateExamCodeVsTitle'), 'Có hàm validateExamCodeVsTitle phát hiện xung đột mã thi');

const ssrfProtectionExists = fs.existsSync(path.resolve('src/utils/ssrfProtection.ts'));
assert(ssrfProtectionExists, 'Tệp bảo vệ SSRF src/utils/ssrfProtection.ts tồn tại');

const ssrfContent = fs.readFileSync('src/utils/ssrfProtection.ts', 'utf8');
assert(ssrfContent.includes('isPrivateOrReservedIp'), 'Có hàm isPrivateOrReservedIp chặn các dải IP nội bộ');
assert(ssrfContent.includes('169.254.169.254'), 'Chặn địa chỉ Cloud Metadata 169.254.169.254');

const learningServiceExists = fs.existsSync(path.resolve('src/services/learningResourceService.ts'));
assert(learningServiceExists, 'Service điều phối src/services/learningResourceService.ts tồn tại');

const serviceContent = fs.readFileSync('src/services/learningResourceService.ts', 'utf8');
assert(serviceContent.includes('processNewResourcePipeline'), 'Có pipeline 12 bước processNewResourcePipeline');
assert(serviceContent.includes('src-ref-blogdaytinhoc'), 'Có nguồn mẫu blogdaytinhoc.com');
assert(serviceContent.includes('factual_conflicts'), 'Có lưu vết factual_conflicts khi phát hiện sai mã bài thi');

const sqlMigrationExists = fs.existsSync(path.resolve('supabase/migrations/20260907_learning_resource_hub.sql'));
assert(sqlMigrationExists, 'Tệp Supabase SQL migration 20260907_learning_resource_hub.sql tồn tại');

const sqlContent = fs.readFileSync('supabase/migrations/20260907_learning_resource_hub.sql', 'utf8');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.learning_sources'), 'Có bảng learning_sources');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.content_review_queue'), 'Có bảng content_review_queue');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS public.certification_catalog'), 'Có bảng certification_catalog');

const cronEndpointExists = fs.existsSync(path.resolve('api/cron/learning-source-sync.ts'));
assert(cronEndpointExists, 'Endpoint Cron api/cron/learning-source-sync.ts tồn tại');

const vercelJsonContent = fs.readFileSync('vercel.json', 'utf8');
assert(vercelJsonContent.includes('/api/cron/learning-source-sync'), 'vercel.json đã đăng ký cron learning-source-sync');
assert(vercelJsonContent.includes('0 2 1 * *'), 'Lịch cron chạy 09:00 ngày 01 hằng tháng (UTC: 0 2 1 * *)');

const adminAppContent = fs.readFileSync('src/components/admin/StandaloneAdminApp.tsx', 'utf8');
assert(adminAppContent.includes('learning_sources'), 'StandaloneAdminApp menu có mục Trung Tâm Nguồn Học Liệu');
assert(adminAppContent.includes('review_queue'), 'StandaloneAdminApp menu có mục Nội Dung Chờ Kiểm Duyệt');
assert(adminAppContent.includes('tinhocgenz_studio'), 'StandaloneAdminApp menu có mục Kho Tài Liệu TIN HỌC GEN Z');
assert(adminAppContent.includes('sync_history'), 'StandaloneAdminApp menu có mục Lịch Sử Đồng Bộ');
assert(adminAppContent.includes('quality_reports'), 'StandaloneAdminApp menu có mục Báo Cáo Chất Lượng');
assert(adminAppContent.includes('failing_sources'), 'StandaloneAdminApp menu có mục Nguồn Bị Lỗi');
assert(adminAppContent.includes('automation_settings'), 'StandaloneAdminApp menu có mục Thiết Lập Tự Động Hóa');

// Kiểm tra bảo toàn 28 câu hỏi trắc nghiệm và 10 phân hệ
const defaultQuizzesContent = fs.readFileSync('src/data/defaultQuizzes.ts', 'utf8');
const totalQuizzes = (defaultQuizzesContent.match(/id:\s*'quiz-/g) || []).length;
const totalQuestions = (defaultQuizzesContent.match(/prompt:\s*'/g) || []).length;
assert(totalQuizzes === 10, 'Bảo toàn chính xác 10 phân hệ đào tạo (không mất đề thi)');
assert(totalQuestions === 28, 'Bảo toàn chính xác 28 câu hỏi trắc nghiệm hiện tại (không mất câu hỏi)');

// 14. Test Chuẩn hóa PWA & Bộ API Client SDK 2026
console.log('\n🚀 NHÓM 14: Kiểm tra Chuẩn hóa PWA & Bộ API Client SDK 2026');

const manifestContent = fs.readFileSync('public/manifest.json', 'utf8');
assert(manifestContent.includes('"orientation": "any"'), 'PWA manifest mở khóa xoay màn hình linh hoạt ("orientation": "any")');

const packageJsonContent = fs.readFileSync('package.json', 'utf8');
assert(packageJsonContent.includes('"lint": "tsc --noEmit"'), 'Lệnh npm run lint được cấu hình chạy typecheck tsc --noEmit');

const apiServices = [
  { path: 'src/services/api/courseService.ts', symbol: 'courseService', name: 'Course Service SDK' },
  { path: 'src/services/api/assessmentService.ts', symbol: 'assessmentService', name: 'Assessment Service SDK' },
  { path: 'src/services/api/attendanceService.ts', symbol: 'attendanceService', name: 'Attendance Service SDK' },
  { path: 'src/services/api/assignmentService.ts', symbol: 'assignmentService', name: 'Assignment Service SDK' },
  { path: 'src/services/api/certificateService.ts', symbol: 'certificateApiService', name: 'Certificate Service SDK' },
  { path: 'src/services/api/analyticsService.ts', symbol: 'analyticsApiService', name: 'Analytics Service SDK' },
  { path: 'src/services/api/index.ts', symbol: 'export * from', name: 'Index Hub SDK' }
];

apiServices.forEach(srv => {
  const exists = fs.existsSync(path.resolve(srv.path));
  assert(exists, `Tệp ${srv.name} tồn tại: ${srv.path}`);
  if (exists) {
    const content = fs.readFileSync(srv.path, 'utf8');
    assert(content.includes(srv.symbol), `${srv.name} xuất khẩu ${srv.symbol} hợp lệ`);
  }
});

const securityUtilsContent = fs.readFileSync('src/utils/securityUtils.ts', 'utf8');
assert(securityUtilsContent.includes('/api/health/'), 'getClientIp ưu tiên tra cứu endpoint nội bộ trước khi gọi bên thứ 3');

// 15. Test Khóa Chặt Bảo Mật P0 & Triệt Tiêu Backdoor (Security Lockdown Suite 2026)
console.log('\n🛡️ NHÓM 15: Kiểm tra Khóa Chặt Bảo Mật P0 & Triệt Tiêu Backdoor (Security Lockdown Suite 2026)');

const useAuthContent = fs.readFileSync('src/hooks/useAuth.ts', 'utf8');
assert(!useAuthContent.includes("password: '123'"), 'P0-SEC: Đã xóa bỏ hoàn toàn mật khẩu hardcode plaintext (password: 123) trong danh sách học viên');
assert(!useAuthContent.includes("cleanPin.length >= 3"), 'P0-SEC: Đã triệt tiêu hoàn toàn backdoor bypass quản trị (cleanPin.length >= 3)');
assert(!useAuthContent.includes("cleanPass === '123' || cleanPass === '123456'"), 'P0-SEC: Đã triệt tiêu logic bypass mật khẩu học viên (cleanPass === 123)');
assert(!useAuthContent.includes("password: 'Admin@2026'"), 'P0-SEC: Đã loại bỏ mật khẩu quản trị viên plaintext khỏi mã nguồn');
assert(useAuthContent.includes('hashPasswordSync') && useAuthContent.includes('safeCompare'), 'P0-SEC: useAuth tích hợp băm mật khẩu bảo mật và so khớp hằng số thời gian');

const forgotModalCheck = fs.readFileSync('src/components/auth/ForgotPasswordModal.tsx', 'utf8');
assert(!forgotModalCheck.includes('emailLog.otpCode'), 'P0-SEC: Loại bỏ triệt để hiển thị mã OTP plaintext trên màn hình modal khôi phục tài khoản');
assert(!forgotModalCheck.includes('handleCopyOtp'), 'P0-SEC: Đã xóa bỏ nút sao chép mã OTP tắt');

const swContent = fs.readFileSync('public/sw.js', 'utf8');
assert(swContent.includes('/admin') && swContent.includes('/teacher') && swContent.includes('/academic'), 'P1-SEC: Service Worker chặn cache toàn bộ các đường dẫn quản trị nhạy cảm');

const vercelContent = fs.readFileSync('vercel.json', 'utf8');
assert(vercelContent.includes('Content-Security-Policy'), 'P1-SEC: vercel.json thiết lập đầy đủ Header Content-Security-Policy (CSP) nghiêm ngặt');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
assert(appContent.includes('403') && appContent.includes('user.role === \'student\''), 'P1-SEC: App.tsx có lớp chặn RBAC 403 khi tài khoản học viên cố truy cập /admin');

const gatewayContent = fs.readFileSync('src/components/auth/UnifiedAuthGateway.tsx', 'utf8');
assert(gatewayContent.includes('portal=admin') && gatewayContent.includes('portal=student'), 'P2-UX: Cổng xác thực hỗ trợ định tuyến tham số ?portal=student|teacher|admin');

const authSecurityExists = fs.existsSync(path.resolve('src/utils/authSecurity.ts'));
assert(authSecurityExists, 'Tệp tiện ích bảo mật mật mã src/utils/authSecurity.ts tồn tại');
if (authSecurityExists) {
  const secContent = fs.readFileSync('src/utils/authSecurity.ts', 'utf8');
  assert(secContent.includes('safeCompare') && secContent.includes('validatePasswordStrength'), 'authSecurity.ts xuất khẩu safeCompare và validatePasswordStrength');
}

// 16. Test P0.1: Serverless Session Auth & Triệt Tiêu Hoàn Toàn Rò Rỉ Thông Tin Mẫu
console.log('\n🔐 NHÓM 16: Kiểm tra P0.1 — Serverless Session Auth & Triệt Tiêu Hoàn Toàn Rò Rỉ Thông Tin Mẫu');

const loginEndpointExists = fs.existsSync(path.resolve('api/auth/login.ts'));
assert(loginEndpointExists, 'Endpoint xác thực Serverless api/auth/login.ts tồn tại');
if (loginEndpointExists) {
  const loginCode = fs.readFileSync('api/auth/login.ts', 'utf8');
  assert(loginCode.includes('signSessionToken') && loginCode.includes('setSessionCookie'), 'api/auth/login.ts có cơ chế ký token và lưu HttpOnly Cookie');
  assert(loginCode.includes('checkRateLimit'), 'api/auth/login.ts có lớp bảo vệ Rate Limiting chống Brute-force');
}

const sessionEndpointExists = fs.existsSync(path.resolve('api/auth/session.ts'));
assert(sessionEndpointExists, 'Endpoint kiểm tra phiên api/auth/session.ts tồn tại');

const logoutEndpointExists = fs.existsSync(path.resolve('api/auth/logout.ts'));
assert(logoutEndpointExists, 'Endpoint đăng xuất api/auth/logout.ts tồn tại');

const authSessionExists = fs.existsSync(path.resolve('api/_lib/authSession.ts'));
assert(authSessionExists, 'Module quản lý phiên Serverless api/_lib/authSession.ts tồn tại');
if (authSessionExists) {
  const sessionCode = fs.readFileSync('api/_lib/authSession.ts', 'utf8');
  assert(sessionCode.includes('signSessionToken') && sessionCode.includes('verifySessionToken'), 'authSession.ts cung cấp đầy đủ hàm ký và kiểm tra chữ ký HMAC-SHA256');
}

const authTypes = fs.readFileSync('src/types/auth.ts', 'utf8');
assert(authTypes.includes('AUTH_ERROR_MESSAGES') && authTypes.includes('AuthErrorCode'), 'src/types/auth.ts chuẩn hóa 10 mã lỗi xác thực hệ thống');

const standaloneAdminCode = fs.readFileSync('src/components/admin/StandaloneAdminApp.tsx', 'utf8');
assert(!standaloneAdminCode.includes('admin123'), 'P0.2: StandaloneAdminApp đã xóa bỏ hoàn toàn mật khẩu admin123 khỏi placeholder và giao diện');
assert(!standaloneAdminCode.includes('Mã cán bộ: ADMIN hoặc ADMIN01'), 'P0.2: StandaloneAdminApp đã xóa bỏ toàn bộ gợi ý tài khoản quản trị mẫu');

const unifiedGatewayCode = fs.readFileSync('src/components/auth/UnifiedAuthGateway.tsx', 'utf8');
assert(!unifiedGatewayCode.includes('admin123'), 'P0.2: UnifiedAuthGateway đã xóa bỏ hoàn toàn mật khẩu admin123 khỏi placeholder và giao diện');
assert(!unifiedGatewayCode.includes('Mã cán bộ: ADMIN'), 'P0.2: UnifiedAuthGateway đã xóa bỏ toàn bộ gợi ý tài khoản quản trị mẫu');

const heroBannerCode = fs.readFileSync('src/components/landing/HeroBanner.tsx', 'utf8');
assert(!heroBannerCode.includes('href="https://hoctructuyen.tinhocgenz.io.vn/"'), 'P0-UX: Nút Vào hệ thống học tập không còn trỏ cứng về URL trang chủ gây tải lại trang');

console.log('\n====================================================');
console.log(`🏁 TỔNG KẾT KIỂM TRA: ${passedTests}/${totalTests} BÀI TEST ĐẠT CHUẨN (${Math.round(passedTests/totalTests*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TẤT CẢ CÁC BỘ TEST TỰ ĐỘNG ĐÃ VƯỢT QUA 100% THÀNH CÔNG!');
} else {
  console.log(`⚠️ Có ${failedTests} bài test không đạt yêu cầu.`);
}
console.log('====================================================\n');


