"""
Script Migration Toàn Diện Dữ Liệu Từ Client-Side Typescript Sang Cơ Sở Dữ Liệu Django/PostgreSQL
Hệ thống: PH Digital Education (PH-TINHOCGENZ)
Bao gồm:
1. 10 Chương trình đào tạo (Courses)
2. 10 Lớp học thực tế (ClassGroup)
3. 5 Tài khoản cán bộ & giảng viên (1 Admin, 4 Teachers)
4. 15 Học viên chuẩn hóa (Students) kèm phân loại độ tuổi & phụ huynh
5. Phân bổ học viên vào lớp (ClassEnrollment)
6. Cài đặt nhắc nhở học tập (StudentReminder)
7. Ca điểm danh và bản ghi điểm danh (AttendanceSession, AttendanceRecord)
8. Bài tập thực hành & bài nộp (Assignment, Submission)
9. Đề thi & Ngân hàng câu hỏi trắc nghiệm (Exam, Question)
10. Nhật ký thông báo Zalo AI (ZaloNotificationLog)
"""
import os
import sys
from pathlib import Path
from datetime import date, timedelta
from django.utils import timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Thiết lập môi trường Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "apps"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

import django
django.setup()

from django.contrib.auth import get_user_model
from apps.courses.models import Course, ClassGroup, ClassEnrollment
from apps.attendance.models import AttendanceSession, AttendanceRecord
from apps.assignments.models import Assignment, Submission
from apps.assessments.models import Exam, Question
from apps.analytics.models import StudentReminder, ZaloNotificationLog, AcademicWarning
from apps.audit.models import AuditLog

User = get_user_model()

COURSES_DATA = [
    {
        "id": "office-fast-3in1",
        "code": "OFFICE-3IN1",
        "title": "Tin Học Văn Phòng Cấp Tốc 3in1 (Word + Excel + PPT)",
        "short_desc": "Thành thạo trọn bộ kỹ năng soạn thảo, tính toán bảng tính và thuyết trình chuyên nghiệp trong 6 buổi.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Chuẩn Kỹ Năng Văn Phòng PH EDU",
        "order_index": 1
    },
    {
        "id": "cc-cntt-basic",
        "code": "CC-CNTT-CB",
        "title": "Luyện Thi Chứng Chỉ Ứng Dụng CNTT Cơ Bản",
        "short_desc": "Ôn luyện 6 module chuẩn theo Thông tư 03/2014/TT-BTTTT của Bộ GD&ĐT và Bộ TT&TT.",
        "total_sessions": 6,
        "target_badge": "Chứng chỉ Quốc gia Ứng dụng CNTT Cơ bản",
        "order_index": 2
    },
    {
        "id": "cc-cntt-advanced",
        "code": "CC-CNTT-NC",
        "title": "Luyện Thi Chứng Chỉ Ứng Dụng CNTT Nâng Cao",
        "short_desc": "Chuyên sâu kỹ năng xử lý dữ liệu phức hợp, tự động hóa văn phòng và bảo mật an toàn thông tin.",
        "total_sessions": 6,
        "target_badge": "Chứng chỉ Quốc gia Ứng dụng CNTT Nâng cao",
        "order_index": 3
    },
    {
        "id": "cntt-basic-we",
        "code": "CNTT-CB-WE",
        "title": "Ứng Dụng CNTT Cơ Bản (Word + Excel)",
        "short_desc": "Khóa học tập trung chuyên sâu 2 kỹ năng cốt lõi được sử dụng nhiều nhất tại doanh nghiệp.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Kỹ Năng Word & Excel Thực Chiến",
        "order_index": 4
    },
    {
        "id": "cntt-adv-we",
        "code": "CNTT-NC-WE",
        "title": "Ứng Dụng CNTT Nâng Cao (Word + Excel Nâng Cao)",
        "short_desc": "Thiết kế văn bản mẫu doanh nghiệp, biểu đồ động, PivotTable chuyên sâu và hàm phân tích dữ liệu mảng.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Chuyên Viên Xử Lý Dữ Liệu Văn Phòng",
        "order_index": 5
    },
    {
        "id": "ai-office",
        "code": "AI-OFFICE",
        "title": "Ứng Dụng Trí Tuệ Nhân Tạo (AI) Vào Công Việc Văn Phòng",
        "short_desc": "Làm chủ ChatGPT, Microsoft Copilot, Claude và Canva AI để tự động hóa 80% tác vụ văn phòng.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Ứng Dụng AI Thực Chiến Doanh Nghiệp",
        "order_index": 6
    },
    {
        "id": "excel-accounting",
        "code": "EXCEL-KT",
        "title": "Kỹ Năng Excel Dành Cho Kế Toán & Quản Trị Tài Chính",
        "short_desc": "Xây dựng sổ sách kế toán tự động, lập báo cáo tài chính và đối soát công nợ với Excel thực chiến.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Kỹ Năng Excel Tài Chính Kế Toán",
        "order_index": 7
    },
    {
        "id": "word-6b",
        "code": "WORD-6B",
        "title": "Kỹ Năng Soạn Thảo & Định Dạng Văn Bản Word Chuẩn Doanh Nghiệp",
        "short_desc": "Thiết lập văn bản hành chính theo Nghị định 30, trộn thư tự động Mail Merge và mục lục đa cấp.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Kỹ Năng Soạn Thảo Văn Bản Chuẩn",
        "order_index": 8
    },
    {
        "id": "excel-6b",
        "code": "EXCEL-6B",
        "title": "Kỹ Năng Xử Lý & Phân Tích Dữ Liệu Excel Thực Chiến",
        "short_desc": "Làm chủ 30+ hàm Excel thông dụng, định dạng có điều kiện, biểu đồ báo cáo và lọc dữ liệu nâng cao.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Kỹ Năng Excel Thực Chiến",
        "order_index": 9
    },
    {
        "id": "ppt-6b",
        "code": "PPT-6B",
        "title": "Kỹ Năng Thiết Kế Slide Thuyết Trình PowerPoint Chuyên Nghiệp",
        "short_desc": "Tư duy bố cục thị giác, phối màu hiện đại, Morph transition và thuyết trình dự án thu hút.",
        "total_sessions": 6,
        "target_badge": "Chứng nhận Thiết Kế Thuyết Trình Chuyên Nghiệp",
        "order_index": 10
    }
]

TEACHERS_DATA = [
    {
        "username": "GV01",
        "full_name": "Cô Hoàng Mai",
        "email": "hoangmai@tinhocgenz.io.vn",
        "phone": "0912345601",
        "role": User.Role.TEACHER,
        "teacher_code": "GV01",
        "school_or_class": "Giảng Viên Trực Thuộc PH EDU",
        "program_track": "cntt-basic-we"
    },
    {
        "username": "GV02",
        "full_name": "Thầy Đức Nam",
        "email": "ducnam@tinhocgenz.io.vn",
        "phone": "0912345602",
        "role": User.Role.TEACHER,
        "teacher_code": "GV02",
        "school_or_class": "Giảng Viên Trực Thuộc PH EDU",
        "program_track": "cc-cntt-advanced"
    },
    {
        "username": "GV03",
        "full_name": "Thầy Quang Huy",
        "email": "quanghuy@tinhocgenz.io.vn",
        "phone": "0912345603",
        "role": User.Role.TEACHER,
        "teacher_code": "GV03",
        "school_or_class": "Giảng Viên Trực Thuộc PH EDU",
        "program_track": "office-fast-3in1"
    },
    {
        "username": "GV04",
        "full_name": "Cô Thu Minh",
        "email": "thuminh@tinhocgenz.io.vn",
        "phone": "0988776655",
        "role": User.Role.TEACHER,
        "teacher_code": "GV04",
        "school_or_class": "Giảng Viên Trực Thuộc PH EDU",
        "program_track": "word-6b"
    }
]

CLASSES_DATA = [
    {"id": "K26-WE01", "name": "Lớp 3in1 Cấp Tốc K26-WE01", "course": "office-fast-3in1", "teacher": "GV03", "room": "Phòng LAB 01 (Tầng 2)", "schedule": "Thứ 2-4-6 (18:30 - 20:30)"},
    {"id": "K26-CC01", "name": "Lớp CC Cơ Bản K26-CC01", "course": "cc-cntt-basic", "teacher": "GV03", "room": "Phòng LAB 01 (Tầng 2)", "schedule": "Thứ 2-4-6 (19:00 - 21:00)"},
    {"id": "K26-CCN01", "name": "Lớp CC Nâng Cao K26-CCN01", "course": "cc-cntt-advanced", "teacher": "GV02", "room": "Phòng LAB 03 (Tầng 4)", "schedule": "Thứ 3-5-7 (08:00 - 10:00)"},
    {"id": "K26-WE-CB", "name": "Lớp CNTT Cơ Bản Word+Excel K26-WE-CB", "course": "cntt-basic-we", "teacher": "GV01", "room": "Phòng LAB 02 (Tầng 3)", "schedule": "Thứ 2-4-6 (14:00 - 16:00)"},
    {"id": "K26-WENC01", "name": "Lớp CNTT Nâng Cao K26-WENC01", "course": "cntt-adv-we", "teacher": "GV02", "room": "Phòng LAB 03 (Tầng 4)", "schedule": "Thứ 3-5-7 (14:00 - 16:00)"},
    {"id": "K26-AI01", "name": "Lớp Ứng Dụng AI K26-AI01", "course": "ai-office", "teacher": "GV03", "room": "Trực Tuyến Toàn Khóa", "schedule": "Thứ 7 (08:00 - 10:00)"},
    {"id": "K26-KT01", "name": "Lớp Excel Kế Toán K26-KT01", "course": "excel-accounting", "teacher": "GV02", "room": "Phòng LAB 03 (Tầng 4)", "schedule": "Thứ 5 (08:00 - 10:00)"},
    {"id": "K26-W01", "name": "Lớp MOS Word Chuyên Sâu K26-W01", "course": "word-6b", "teacher": "GV04", "room": "Phòng LAB 02 (Tầng 3)", "schedule": "Thứ 3-5-7 (14:00 - 16:00)"},
    {"id": "K26-EX01", "name": "Lớp MOS Excel Chuyên Sâu K26-EX01", "course": "excel-6b", "teacher": "GV01", "room": "Phòng LAB 02 (Tầng 3)", "schedule": "Thứ 2-4-6 (08:00 - 10:00)"},
    {"id": "K26-PPT01", "name": "Lớp MOS PPT Chuyên Sâu K26-PPT01", "course": "ppt-6b", "teacher": "GV01", "room": "Phòng LAB 01 (Tầng 2)", "schedule": "Thứ 3-5-7 (18:30 - 20:30)"}
]

STUDENTS_DATA = [
    {"username": "THGZ01", "full_name": "Nguyễn Văn An", "class": "K26-WE01", "track": "office-fast-3in1", "birth_year": 2003, "parent_name": "Bác Nguyễn Văn Bình", "parent_phone": "0912111222", "parent_zalo": "0912111222"},
    {"username": "THGZ02", "full_name": "Trần Thị Mai", "class": "K26-WE01", "track": "office-fast-3in1", "birth_year": 2004, "parent_name": "Cô Trần Thị Lan", "parent_phone": "0912333444", "parent_zalo": "0912333444"},
    {"username": "THGZ03", "full_name": "Lê Hoàng Long", "class": "K26-WE01", "track": "office-fast-3in1", "birth_year": 1998, "parent_name": "", "parent_phone": "", "parent_zalo": ""},
    {"username": "THGZ04", "full_name": "Phạm Thu Hà", "class": "K26-CC01", "track": "cc-cntt-basic", "birth_year": 2002, "parent_name": "Bác Phạm Văn Tuấn", "parent_phone": "0912555666", "parent_zalo": "0912555666"},
    {"username": "THGZ05", "full_name": "Hoàng Minh Trí", "class": "K26-CC01", "track": "cc-cntt-basic", "birth_year": 1995, "parent_name": "", "parent_phone": "", "parent_zalo": ""},
    {"username": "THGZ06", "full_name": "Vũ Hải Đăng", "class": "K26-CCN01", "track": "cc-cntt-advanced", "birth_year": 2005, "parent_name": "Bác Vũ Hải Nam", "parent_phone": "0912777888", "parent_zalo": "0912777888"},
    {"username": "THGZ07", "full_name": "Đặng Bích Ngọc", "class": "K26-CCN01", "track": "cc-cntt-advanced", "birth_year": 1997, "parent_name": "", "parent_phone": "", "parent_zalo": ""},
    {"username": "THGZ08", "full_name": "Bùi Quốc Cường", "class": "K26-WE-CB", "track": "cntt-basic-we", "birth_year": 2004, "parent_name": "Bác Bùi Văn Thắng", "parent_phone": "0912999000", "parent_zalo": "0912999000"},
    {"username": "THGZ09", "full_name": "Ngô Gia Bảo", "class": "K26-WENC01", "track": "cntt-adv-we", "birth_year": 2003, "parent_name": "Bác Ngô Văn Dũng", "parent_phone": "0912123456", "parent_zalo": "0912123456"},
    {"username": "THGZ10", "full_name": "Đỗ Khánh Linh", "class": "K26-AI01", "track": "ai-office", "birth_year": 1996, "parent_name": "", "parent_phone": "", "parent_zalo": ""},
    {"username": "THGZ11", "full_name": "Dương Tấn Phát", "class": "K26-KT01", "track": "excel-accounting", "birth_year": 2002, "parent_name": "Bác Dương Văn Hoàng", "parent_phone": "0912234567", "parent_zalo": "0912234567"},
    {"username": "THGZ12", "full_name": "Phan Thanh Thảo", "class": "K26-W01", "track": "word-6b", "birth_year": 1999, "parent_name": "", "parent_phone": "", "parent_zalo": ""},
    {"username": "THGZ13", "full_name": "Trịnh Minh Khôi", "class": "K26-EX01", "track": "excel-6b", "birth_year": 2005, "parent_name": "Bác Trịnh Văn Hùng", "parent_phone": "0912345678", "parent_zalo": "0912345678"},
    {"username": "THGZ14", "full_name": "Lý Kim Ngân", "class": "K26-PPT01", "track": "ppt-6b", "birth_year": 2000, "parent_name": "", "parent_phone": "", "parent_zalo": ""},
    {"username": "THGZ15", "full_name": "Mai Đức Trọng", "class": "K26-WE01", "track": "office-fast-3in1", "birth_year": 2004, "parent_name": "Bác Mai Văn Lâm", "parent_phone": "0912456789", "parent_zalo": "0912456789"}
]

def run_migration():
    print("==================================================================")
    print("🚀 BẮT ĐẦU MIGRATION DỮ LIỆU ĐẦY ĐỦ CHO DJANGO POSTGRESQL BACKEND")
    print("==================================================================")

    # 1. Courses
    print("\n--- [1/8] Đồng bộ 10 Chương trình đào tạo (Courses) ---")
    courses_map = {}
    for c_data in COURSES_DATA:
        c, created = Course.objects.update_or_create(id=c_data["id"], defaults=c_data)
        courses_map[c.id] = c
        status = "Tạo mới" if created else "Đã đồng bộ"
        print(f"  [{status}] {c.code}: {c.title}")

    # 2. Staff Accounts
    print("\n--- [2/8] Đồng bộ Tài khoản Quản trị & Giảng viên (Staff) ---")
    admin_user, created = User.objects.get_or_create(
        username="ADMIN",
        defaults={
            "full_name": "Thầy Huy (Giảng Viên Trưởng)",
            "email": "admin@tinhocgenz.io.vn",
            "phone": "0988999888",
            "role": User.Role.ADMIN,
            "is_staff": True,
            "is_superuser": True
        }
    )
    if created:
        admin_user.set_password("Admin@PH2026!Secure")
        admin_user.save()
        print("  [Tạo mới Admin] ADMIN (Mật khẩu băm an toàn)")
    else:
        print("  [Đã có Admin] ADMIN")

    teachers_map = {}
    for t_data in TEACHERS_DATA:
        t_user, created = User.objects.get_or_create(
            username=t_data["username"],
            defaults={
                "full_name": t_data["full_name"],
                "email": t_data["email"],
                "phone": t_data["phone"],
                "role": t_data["role"],
                "teacher_code": t_data["teacher_code"],
                "school_or_class": t_data["school_or_class"],
                "program_track": t_data["program_track"],
                "is_staff": True,
                "must_change_password": True
            }
        )
        if created:
            t_user.set_password("Teacher@2026")
            t_user.save()
            print(f"  [Tạo mới Giảng viên] {t_user.username}: {t_user.full_name}")
        else:
            print(f"  [Đã có Giảng viên] {t_user.username}: {t_user.full_name}")
        teachers_map[t_user.username] = t_user

    # 3. Classes
    print("\n--- [3/8] Đồng bộ 10 Lớp học thực tế (ClassGroup) ---")
    classes_map = {}
    for cls in CLASSES_DATA:
        teacher_obj = teachers_map.get(cls["teacher"], admin_user)
        course_obj = courses_map[cls["course"]]
        cg, created = ClassGroup.objects.update_or_create(
            id=cls["id"],
            defaults={
                "name": cls["name"],
                "course": course_obj,
                "teacher": teacher_obj,
                "room": cls["room"],
                "schedule_desc": cls["schedule"],
                "max_students": 25,
                "is_active": True
            }
        )
        classes_map[cg.id] = cg
        status = "Tạo mới" if created else "Đã đồng bộ"
        print(f"  [{status}] Lớp {cg.id} ({cg.name}) — GV: {teacher_obj.full_name}")

    # 4. Students & Enrollments & Reminders
    print("\n--- [4/8] Đồng bộ 15 Học viên, Đăng ký lớp & Cài đặt Zalo/Nhắc nhở ---")
    students_map = {}
    for s_data in STUDENTS_DATA:
        std_user, created = User.objects.get_or_create(
            username=s_data["username"],
            defaults={
                "full_name": s_data["full_name"],
                "student_code": s_data["username"],
                "email": f"{s_data['username'].lower()}@student.tinhocgenz.edu.vn",
                "phone": f"0912{s_data['username'][-2:]}999",
                "class_code": s_data["class"],
                "program_track": s_data["track"],
                "birth_year": s_data["birth_year"],
                "parent_name": s_data["parent_name"],
                "parent_phone": s_data["parent_phone"],
                "parent_zalo": s_data["parent_zalo"],
                "role": User.Role.STUDENT,
                "must_change_password": True
            }
        )
        if created:
            std_user.set_password("Student@2026")
            std_user.save()
            status = "Tạo mới"
        else:
            status = "Đã có"
        students_map[std_user.username] = std_user

        # Ghi nhận vào lớp học (Enrollment)
        class_obj = classes_map.get(s_data["class"])
        if class_obj:
            ClassEnrollment.objects.get_or_create(
                class_group=class_obj,
                student=std_user
            )

        # Cài đặt nhắc nhở học tập (StudentReminder)
        StudentReminder.objects.update_or_create(
            student=std_user,
            defaults={
                "daily": True,
                "weekly": True,
                "monthly": True,
                "preferred_time": "19:00",
                "parent_name": s_data["parent_name"],
                "parent_phone": s_data["parent_phone"],
                "parent_zalo": s_data["parent_zalo"],
                "birth_year": s_data["birth_year"]
            }
        )

        age = 2026 - s_data["birth_year"]
        target = f"Phụ huynh ({s_data['parent_name']})" if age < 25 else "Học viên tự chủ"
        print(f"  [{status}] {std_user.username}: {std_user.full_name} ({age} tuổi -> Định tuyến Zalo: {target})")

    # 5. Attendance Sessions & Records
    print("\n--- [5/8] Khởi tạo ca điểm danh mẫu và lịch sử điểm danh ---")
    today = date.today()
    for class_id, class_obj in classes_map.items():
        session, _ = AttendanceSession.objects.get_or_create(
            class_code=class_id,
            session_number=1,
            defaults={
                "course": class_obj.course,
                "teacher": class_obj.teacher,
                "class_group": class_obj,
                "session_title": f"Buổi 1: Tổng quan chương trình & Khảo sát đầu vào",
                "session_date": today,
                "is_open": True,
                "pin_code": "6868"
            }
        )
        # Điểm danh cho học viên trong lớp
        enrollments = ClassEnrollment.objects.filter(class_group=class_obj)
        for enr in enrollments:
            AttendanceRecord.objects.get_or_create(
                session=session,
                student=enr.student,
                defaults={
                    "status": AttendanceRecord.Status.PRESENT,
                    "verified_location": "LAB PH EDU",
                    "note": "Tham gia đúng giờ"
                }
            )
    print(f"  [OK] Đã tạo 10 ca điểm danh chuẩn và ghi nhận check-in đầy đủ.")

    # 6. Homework Assignments & Submissions
    print("\n--- [6/8] Khởi tạo Bài tập thực hành & Bài nộp mẫu ---")
    sample_class = classes_map["K26-WE01"]
    sample_assign, _ = Assignment.objects.get_or_create(
        course=sample_class.course,
        class_group=sample_class,
        title="Bài thực hành số 1: Soạn thảo Hợp đồng kinh tế chuẩn Nghị định 30",
        defaults={
            "teacher": sample_class.teacher,
            "description": "Thực hiện định dạng Tab Stop, Border & Shading và xuất file PDF.",
            "due_date": timezone.now() + timedelta(days=5),
            "is_open": True
        }
    )
    # Bài nộp mẫu của THGZ01
    student_01 = students_map["THGZ01"]
    Submission.objects.get_or_create(
        assignment=sample_assign,
        student=student_01,
        defaults={
            "file_url": "https://storage.tinhocgenz.io.vn/submissions/THGZ01_BaiTap1.docx",
            "score": 9.5,
            "feedback": "Bố cục chuẩn mực, định dạng Tab Stop chính xác.",
            "graded_by": sample_class.teacher,
            "graded_at": timezone.now()
        }
    )
    print("  [OK] Đã tạo bài tập thực hành mẫu và bản ghi chấm điểm.")

    # 7. Exams & Question Bank
    print("\n--- [7/8] Khởi tạo Đề thi Certiport & Ngân hàng câu hỏi trắc nghiệm ---")
    sample_exam, _ = Exam.objects.get_or_create(
        id="exam-mos-excel-k1",
        defaults={
            "course": courses_map["office-fast-3in1"],
            "title": "Đề Khảo Sát Năng Lực MOS Excel Khóa 1 (Chuẩn Certiport)",
            "description": "Đề thi gồm 10 câu hỏi bao quát hàm tính toán, định dạng và biểu đồ.",
            "duration_minutes": 30,
            "passing_percentage": 70,
            "is_published": True
        }
    )
    sample_questions = [
        {
            "id": "q-ex-01",
            "course": courses_map["office-fast-3in1"],
            "skill_id": "excel-formula-lookup",
            "content": "Trong Microsoft Excel, cú pháp đúng của hàm VLOOKUP là gì?",
            "options": [
                {"id": "A", "text": "VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])"},
                {"id": "B", "text": "VLOOKUP(table_array, lookup_value, col_index_num)"},
                {"id": "C", "text": "VLOOKUP(col_index_num, lookup_value, table_array)"},
                {"id": "D", "text": "VLOOKUP(lookup_value, col_index_num, table_array)"}
            ],
            "correct_answer_id": "A",
            "explanation": "Hàm VLOOKUP nhận 4 đối số: Giá trị tìm kiếm, Bảng tra cứu, Thứ tự cột lấy kết quả, và Kiểu tìm kiếm (Exact/Approximate).",
            "difficulty": Question.Difficulty.MEDIUM
        },
        {
            "id": "q-ex-02",
            "course": courses_map["office-fast-3in1"],
            "skill_id": "excel-absolute-reference",
            "content": "Phím tắt nào được sử dụng để cố định tọa độ ô tuyệt đối ($) trong công thức Excel?",
            "options": [
                {"id": "A", "text": "F2"},
                {"id": "B", "text": "F4"},
                {"id": "C", "text": "F8"},
                {"id": "D", "text": "Ctrl + F"}
            ],
            "correct_answer_id": "B",
            "explanation": "Nhấn phím F4 (hoặc Fn + F4) giúp luân chuyển qua lại giữa các dạng địa chỉ: Tương đối -> Tuyệt đối -> Hỗn hợp.",
            "difficulty": Question.Difficulty.EASY
        }
    ]
    for q_data in sample_questions:
        Question.objects.update_or_create(id=q_data["id"], defaults=q_data)
    print("  [OK] Đã nạp đề thi và câu hỏi trắc nghiệm Certiport mẫu.")

    # 8. Zalo Notification AI Logs
    print("\n--- [8/8] Khởi tạo Nhật ký phát tin Zalo ZNS sinh bởi AI ---")
    zalo_samples = [
        {
            "student": students_map["THGZ01"],
            "recipient_type": ZaloNotificationLog.RecipientType.PARENT,
            "recipient_name": "Bác Nguyễn Văn Bình",
            "recipient_phone": "0912111222",
            "cycle": ZaloNotificationLog.Cycle.WEEKLY,
            "ai_generated_message": "PH EDU Kính gửi Quý Phụ huynh: Tuần qua em Nguyễn Văn An đã hoàn thành 100% ca học lớp K26-WE01 và đạt 9.5 điểm bài thực hành.",
            "status": "sent"
        },
        {
            "student": students_map["THGZ03"],
            "recipient_type": ZaloNotificationLog.RecipientType.STUDENT,
            "recipient_name": "Lê Hoàng Long",
            "recipient_phone": "0912039999",
            "cycle": ZaloNotificationLog.Cycle.DAILY,
            "ai_generated_message": "Chào bạn Hoàng Long, tối nay lúc 18:30 lớp K26-WE01 sẽ bắt đầu buổi 2 chuyên sâu về 20 hàm Excel thực chiến tại LAB 01.",
            "status": "sent"
        }
    ]
    for z in zalo_samples:
        ZaloNotificationLog.objects.create(**z)
    print("  [OK] Đã tạo các bản ghi nhật ký phát tin Zalo AI mẫu.")

    # Ghi nhận Audit Log
    AuditLog.objects.create(
        actor=admin_user,
        action="DATA_MIGRATION_PHASE_2",
        resource="FULL_DATABASE",
        payload={
            "courses_count": len(COURSES_DATA),
            "classes_count": len(CLASSES_DATA),
            "students_count": len(STUDENTS_DATA),
            "teachers_count": len(TEACHERS_DATA) + 1,
            "status": "SUCCESS"
        },
        ip_address="127.0.0.1"
    )

    print("\n==================================================================")
    print("🎉 CHUYỂN ĐỔI DỮ LIỆU THÀNH CÔNG RỰC RỠ 100%!")
    print(f"   • Khóa học: {Course.objects.count()}")
    print(f"   • Lớp học: {ClassGroup.objects.count()}")
    print(f"   • Tài khoản người dùng: {User.objects.count()}")
    print(f"   • Đăng ký lớp: {ClassEnrollment.objects.count()}")
    print(f"   • Cài đặt nhắc nhở: {StudentReminder.objects.count()}")
    print(f"   • Ca điểm danh: {AttendanceSession.objects.count()}")
    print(f"   • Bản ghi điểm danh: {AttendanceRecord.objects.count()}")
    print(f"   • Bài tập thực hành: {Assignment.objects.count()}")
    print(f"   • Đề thi: {Exam.objects.count()}")
    print(f"   • Câu hỏi: {Question.objects.count()}")
    print(f"   • Nhật ký Zalo AI: {ZaloNotificationLog.objects.count()}")
    print(f"   • Nhật ký Audit: {AuditLog.objects.count()}")
    print("==================================================================")

if __name__ == "__main__":
    run_migration()
