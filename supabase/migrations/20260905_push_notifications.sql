-- ============================================================================
-- PH DIGITAL EDUCATION — Web Push & In-App Notifications
-- Migration: 20260905_push_notifications.sql
-- ============================================================================

-- 1. Bảng lưu Push Subscription endpoints (Web Push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_active ON push_subscriptions(is_active) WHERE is_active = TRUE;

-- 2. Bảng lưu In-App Notifications
CREATE TABLE IF NOT EXISTS app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_notif_user_id ON app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_notif_unread ON app_notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_app_notif_created ON app_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_notif_type ON app_notifications(type);

-- 3. RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

-- Service Role full access (cho Vercel serverless functions)
CREATE POLICY push_subs_service_all ON push_subscriptions
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY app_notif_service_all ON app_notifications
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Anon users có thể đọc thông báo của mình
CREATE POLICY app_notif_anon_select ON app_notifications
  FOR SELECT USING (TRUE);

-- Anon users có thể update is_read
CREATE POLICY app_notif_anon_update ON app_notifications
  FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- 4. Function auto-update updated_at
CREATE OR REPLACE FUNCTION update_push_subs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_push_subs_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subs_updated_at();

-- 5. Comment documentation
COMMENT ON TABLE push_subscriptions IS 'Lưu Web Push subscription endpoints cho từng user (phụ huynh/học viên)';
COMMENT ON TABLE app_notifications IS 'Lưu thông báo in-app: tiến độ học tập, chuyên cần, bài tập, hệ thống';
COMMENT ON COLUMN app_notifications.type IS 'progress_daily | progress_weekly | progress_monthly | attendance | assignment | system';
COMMENT ON COLUMN app_notifications.metadata IS 'JSON chứa thông tin bổ sung: studentName, riskLevel, cycle, attendanceRate';
