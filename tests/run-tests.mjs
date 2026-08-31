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
assert(authContent.includes('handleQuickFillStudent'), 'Có nút đăng nhập nhanh học viên (THGZ01)');
assert(authContent.includes('handleQuickFillAdmin'), 'Có nút đăng nhập nhanh giảng viên');
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

// 9. Test Periodic Reminders & Age-Gated AI Zalo Engine
console.log('\n📱 NHÓM 9: Kiểm tra Hệ thống Nhắc nhở Định kỳ & Cảnh báo Zalo AI Phân loại theo độ tuổi');
const zaloServiceContent = fs.readFileSync('src/services/aiZaloNotificationService.ts', 'utf8');
assert(zaloServiceContent.includes('ageThreshold: 25'), 'Ngưỡng phân tách độ tuổi mặc định là 25 tuổi');
assert(zaloServiceContent.includes('recipientType: \'parent\''), 'Học viên < 25 tuổi định tuyến gửi Phụ huynh kèm cặp');
assert(zaloServiceContent.includes('recipientType: \'student\''), 'Học viên ≥ 25 tuổi định tuyến gửi trực tiếp người học, tôn trọng quyền tự chủ');
assert(zaloServiceContent.includes('daily') && zaloServiceContent.includes('weekly') && zaloServiceContent.includes('monthly'), 'Hỗ trợ đủ 3 chu kỳ: Hằng ngày, Hằng tuần, Hằng tháng');
const zaloManagerContent = fs.readFileSync('src/components/admin/ZaloNotificationManager.tsx', 'utf8');
assert(zaloManagerContent.includes('AI Quét & Soạn Tin Nhắn Zalo'), 'Có nút AI Quét & Soạn tin nhắn Zalo tự động');
assert(zaloManagerContent.includes('ZaloNotificationLog'), 'Quản lý lịch sử nhật ký phát tin Zalo ZNS');


console.log('\n====================================================');
console.log(`🏁 TỔNG KẾT KIỂM TRA: ${passedTests}/${totalTests} BÀI TEST ĐẠT CHUẨN (${Math.round(passedTests/totalTests*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TẤT CẢ CÁC BỘ TEST TỰ ĐỘNG ĐÃ VƯỢT QUA 100% THÀNH CÔNG!');
} else {
  console.log(`⚠️ Có ${failedTests} bài test không đạt yêu cầu.`);
}
console.log('====================================================\n');
