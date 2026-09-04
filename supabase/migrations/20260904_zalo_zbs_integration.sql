-- ==============================================================================
-- PH DIGITAL EDUCATION — DATABASE MIGRATION: ZALO ZBS 2026 ARCHITECTURE
-- File: supabase/migrations/20260904_zalo_zbs_integration.sql
-- ==============================================================================

-- 1. Enable UUID Extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Bảng lưu trữ OAuth Access Token & Refresh Token của Zalo OA
-- Chú ý: Refresh Token của Zalo OA có tính chất single-use (chỉ dùng 1 lần)
CREATE TABLE IF NOT EXISTS zalo_oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oa_id VARCHAR(100) NOT NULL UNIQUE,
    app_id VARCHAR(100) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zalo_tokens_oa_id ON zalo_oauth_tokens(oa_id);
CREATE INDEX IF NOT EXISTS idx_zalo_tokens_active ON zalo_oauth_tokens(is_active);

-- 3. Bảng danh mục Zalo ZBS Template Messages đã được Zalo kiểm duyệt
CREATE TABLE IF NOT EXISTS zalo_templates (
    id VARCHAR(100) PRIMARY KEY, -- Template ID cấp bởi Zalo ZBS
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL DEFAULT 'reminder', -- reminder, warning, digest, transaction
    status VARCHAR(50) NOT NULL DEFAULT 'approved', -- approved, pending, rejected
    sample_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    params JSONB NOT NULL DEFAULT '[]'::jsonb, -- Danh sách tham số bắt buộc trong template
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE, -- Admin bật/tắt quyền tự động phát tin
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zalo_templates_enabled ON zalo_templates(is_enabled, status);

-- 4. Bảng quản lý sự đồng ý nhận thông báo (Recipient Consents)
CREATE TABLE IF NOT EXISTS zalo_recipient_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('parent', 'student')),
    consent_status VARCHAR(20) NOT NULL DEFAULT 'opt_in' CHECK (consent_status IN ('opt_in', 'opt_out')),
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(50) NOT NULL DEFAULT 'enrollment_form', -- enrollment_form, sms_optin, web_portal
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_recipient_student_type UNIQUE (student_id, recipient_type, recipient_phone)
);

CREATE INDEX IF NOT EXISTS idx_zalo_consents_lookup ON zalo_recipient_consents(student_id, consent_status);
CREATE INDEX IF NOT EXISTS idx_zalo_consents_phone ON zalo_recipient_consents(recipient_phone);

-- 5. Bảng hàng đợi phát tin (Dispatch Queue) với Idempotency Key
CREATE TABLE IF NOT EXISTS zalo_dispatch_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    student_id VARCHAR(100) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('parent', 'student')),
    recipient_phone VARCHAR(20) NOT NULL,
    template_id VARCHAR(100) NOT NULL REFERENCES zalo_templates(id),
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    tracking_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'accepted', 'delivered', 'failed', 'cancelled')),
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    last_error TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zalo_queue_status_sched ON zalo_dispatch_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_zalo_queue_idempotency ON zalo_dispatch_queue(idempotency_key);

-- 6. Bảng nhật ký thông báo Zalo chính thức (Message Logs)
CREATE TABLE IF NOT EXISTS zalo_message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(100) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('parent', 'student')),
    masked_phone VARCHAR(20) NOT NULL, -- Ví dụ: 090***1234
    template_id VARCHAR(100) NOT NULL,
    tracking_id VARCHAR(100) NOT NULL UNIQUE,
    zalo_msg_id VARCHAR(100), -- msg_id trả về từ Zalo OpenAPI khi error === 0
    request_status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (request_status IN ('queued', 'processing', 'accepted', 'failed', 'cancelled')),
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
    error_code INT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_zalo_logs_student ON zalo_message_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_zalo_logs_tracking ON zalo_message_logs(tracking_id);
CREATE INDEX IF NOT EXISTS idx_zalo_logs_msg_id ON zalo_message_logs(zalo_msg_id);
CREATE INDEX IF NOT EXISTS idx_zalo_logs_delivery ON zalo_message_logs(delivery_status, created_at DESC);

-- 7. Bảng sự kiện Webhook từ Zalo (Chống Replay Attack & Lưu vết)
CREATE TABLE IF NOT EXISTS zalo_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) NOT NULL UNIQUE, -- ID duy nhất của sự kiện Zalo để chống replay
    event_type VARCHAR(50) NOT NULL,
    zalo_msg_id VARCHAR(100),
    payload JSONB NOT NULL,
    signature VARCHAR(255),
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zalo_webhook_msg_id ON zalo_webhook_events(zalo_msg_id);
CREATE INDEX IF NOT EXISTS idx_zalo_webhook_created ON zalo_webhook_events(created_at DESC);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE zalo_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_recipient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_dispatch_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zalo_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service Role có toàn quyền trên toàn bộ các bảng
DROP POLICY IF EXISTS "service_role_all_tokens" ON zalo_oauth_tokens;
CREATE POLICY "service_role_all_tokens" ON zalo_oauth_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_templates" ON zalo_templates;
CREATE POLICY "service_role_all_templates" ON zalo_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_consents" ON zalo_recipient_consents;
CREATE POLICY "service_role_all_consents" ON zalo_recipient_consents FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_queue" ON zalo_dispatch_queue;
CREATE POLICY "service_role_all_queue" ON zalo_dispatch_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_logs" ON zalo_message_logs;
CREATE POLICY "service_role_all_logs" ON zalo_message_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_webhooks" ON zalo_webhook_events;
CREATE POLICY "service_role_all_webhooks" ON zalo_webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated Admin / Teacher: Được xem danh mục template và cấu hình
DROP POLICY IF EXISTS "staff_view_templates" ON zalo_templates;
CREATE POLICY "staff_view_templates" ON zalo_templates FOR SELECT TO authenticated
USING (
    (auth.jwt() ->> 'role') IN ('admin', 'teacher') OR
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'teacher')
);

-- Admin: Toàn quyền trên bảng template và logs
DROP POLICY IF EXISTS "admin_manage_templates" ON zalo_templates;
CREATE POLICY "admin_manage_templates" ON zalo_templates FOR ALL TO authenticated
USING (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- Staff (Admin & Teacher): Được xem Message Logs (đã được mask phone)
DROP POLICY IF EXISTS "staff_view_message_logs" ON zalo_message_logs;
CREATE POLICY "staff_view_message_logs" ON zalo_message_logs FOR SELECT TO authenticated
USING (
    (auth.jwt() ->> 'role') IN ('admin', 'teacher') OR
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'teacher')
);

-- Student: Chỉ xem được các log thuộc về mã học viên của mình
DROP POLICY IF EXISTS "student_view_own_logs" ON zalo_message_logs;
CREATE POLICY "student_view_own_logs" ON zalo_message_logs FOR SELECT TO authenticated
USING (
    student_id = auth.uid()::text OR
    student_id = (auth.jwt() ->> 'student_code')
);
