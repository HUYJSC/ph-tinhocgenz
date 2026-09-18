-- supabase/migrations/20260918_lms_core.sql

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_auth_uid UUID UNIQUE,
    student_code TEXT UNIQUE,
    teacher_code TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('student','teacher','admin')),
    class_code TEXT,
    program_track TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own profile" ON users FOR SELECT USING (supabase_auth_uid = auth.uid() OR id::text = auth.uid()::text);
CREATE POLICY "Admins can do everything on users" ON users TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    track TEXT,
    thumbnail_url TEXT,
    price_vnd INT DEFAULT 0,
    status TEXT DEFAULT 'draft',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active courses" ON courses FOR SELECT USING (status = 'published');

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('video','pdf','slide','quiz','interactive','text')),
    content_url TEXT,
    sort_order INT DEFAULT 0,
    duration_minutes INT DEFAULT 0,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active lessons" ON lessons FOR SELECT USING (true); -- simplify for now

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    payment_id UUID,
    status TEXT DEFAULT 'active',
    UNIQUE(student_id, course_id)
);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student read own enrollments" ON enrollments FOR SELECT USING (student_id::text = auth.uid()::text);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id),
    lesson_id UUID REFERENCES lessons(id),
    is_completed BOOLEAN DEFAULT FALSE,
    last_position_seconds INT DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student read own lesson_progress" ON lesson_progress FOR SELECT USING (student_id::text = auth.uid()::text);
CREATE POLICY "Student update own lesson_progress" ON lesson_progress FOR UPDATE USING (student_id::text = auth.uid()::text);
CREATE POLICY "Student insert own lesson_progress" ON lesson_progress FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);
