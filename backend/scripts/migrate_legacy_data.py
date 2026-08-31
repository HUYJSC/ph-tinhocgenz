"""
Script migration dữ liệu từ client-side Typescript (defaultQuizzes.ts, useAuth.ts)
sang cơ sở dữ liệu PostgreSQL / SQLite của Django Backend.
"""
import os
import sys
import json
import re
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Setup Django Environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "apps"))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

import django
django.setup()

from django.contrib.auth import get_user_model
from apps.courses.models import Course
from apps.assessments.models import Exam, Question

User = get_user_model()

# 10 Chương trình đào tạo chuẩn
INITIAL_COURSES = [
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

def seed_courses():
    print("--- 1. Đồng bộ 10 Chương trình đào tạo ---")
    for data in INITIAL_COURSES:
        course, created = Course.objects.update_or_create(
            id=data["id"],
            defaults=data
        )
        status = "Tạo mới" if created else "Cập nhật"
        print(f"  [{status}] {course.title} ({course.code})")

def seed_initial_accounts():
    print("\n--- 2. Tạo tài khoản mẫu ban đầu (Có băm mật khẩu Argon2/PBKDF2 an toàn) ---")
    # Admin
    admin_user, created = User.objects.get_or_create(
        username="ADMIN",
        defaults={
            "full_name": "Thầy Huy (Giảng Viên Trưởng)",
            "email": "admin@tinhocgenz.io.vn",
            "phone": "0988999888",
            "role": User.Role.ADMIN,
            "is_staff": True,
            "is_superuser": True,
        }
    )
    if created:
        admin_user.set_password("Admin@PH2026!Secure")
        admin_user.save()
        print("  [Tạo mới Admin] ADMIN (Mật khẩu an toàn đã được băm)")
    else:
        print("  [Đã tồn tại Admin] ADMIN")

    # Giảng viên mẫu
    teachers = [
        {"username": "GV01", "name": "Cô Hoàng Mai", "email": "hoangmai@tinhocgenz.io.vn", "phone": "0912345601"},
        {"username": "GV02", "name": "Thầy Đức Nam", "email": "ducnam@tinhocgenz.io.vn", "phone": "0912345602"},
        {"username": "GV03", "name": "Thầy Quang Huy", "email": "quanghuy@tinhocgenz.io.vn", "phone": "0912345603"},
        {"username": "GV04", "name": "Cô Thu Minh", "email": "thuminh@tinhocgenz.io.vn", "phone": "0988776655"},
    ]
    for t in teachers:
        tch, created = User.objects.get_or_create(
            username=t["username"],
            defaults={
                "full_name": t["name"],
                "email": t["email"],
                "phone": t["phone"],
                "teacher_code": t["username"],
                "role": User.Role.TEACHER,
                "is_staff": True,
                "must_change_password": True
            }
        )
        if created:
            tch.set_password("Teacher@2026")
            tch.save()
            print(f"  [Tạo mới Giảng viên] {t['username']} - {t['name']}")

    # Học viên mẫu
    students = [
        {"username": "THGZ01", "name": "Nguyễn Văn An", "class": "K26-WE01", "track": "office-fast-3in1"},
        {"username": "THGZ02", "name": "Trần Thị Mai", "class": "K26-WE01", "track": "office-fast-3in1"},
        {"username": "THGZ03", "name": "Phạm Minh Tuấn", "class": "K26-WE01", "track": "office-fast-3in1"},
        {"username": "THGZ04", "name": "Đỗ Thu Hà", "class": "K26-CC01", "track": "cc-cntt-basic"},
        {"username": "THGZ05", "name": "Lê Hoàng Long", "class": "K26-CC01", "track": "cc-cntt-basic"},
    ]
    for s in students:
        std, created = User.objects.get_or_create(
            username=s["username"],
            defaults={
                "full_name": s["name"],
                "student_code": s["username"],
                "class_code": s["class"],
                "program_track": s["track"],
                "role": User.Role.STUDENT,
                "must_change_password": True
            }
        )
        if created:
            std.set_password("Student@2026")
            std.save()
            print(f"  [Tạo mới Học viên] {s['username']} - {s['name']}")

def main():
    print("==================================================")
    print("🚀 BẮT ĐẦU NẠP DỮ LIỆU MẪU VÀO PYTHON BACKEND")
    print("==================================================")
    seed_courses()
    seed_initial_accounts()
    print("\n✅ HOÀN TẤT NẠP DỮ LIỆU CHUẨN!")

if __name__ == "__main__":
    main()
