-- ==============================================================================
-- PH DIGITAL EDUCATION — TRUNG TÂM NGUỒN HỌC LIỆU & KIỂM DUYỆT ĐỀ THI
-- Migration: 20260907_learning_resource_hub.sql
-- Target: Supabase PostgreSQL
-- ==============================================================================

-- 1. DANH MỤC CHỨNG CHỈ & MÃ BÀI THI CHÍNH THỨC (CERTIFICATION CATALOG)
CREATE TABLE IF NOT EXISTS public.certification_catalog (
    id VARCHAR(100) PRIMARY KEY,
    family VARCHAR(50) NOT NULL CHECK (family IN ('MOS_2019', 'MOS_365', 'IC3', 'CNTT_CO_BAN', 'CNTT_NANG_CAO', 'AI_OFFICE')),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    official_level VARCHAR(50) NOT NULL DEFAULT 'Associate',
    subject VARCHAR(50) NOT NULL,
    official_url TEXT NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cert_family_code UNIQUE(family, code)
);

CREATE INDEX IF NOT EXISTS idx_cert_catalog_code ON public.certification_catalog(code);
CREATE INDEX IF NOT EXISTS idx_cert_catalog_family ON public.certification_catalog(family);

-- 2. OBJECTIVE DOMAINS (MIỀN MỤC TIÊU BÀI THI CHUẨN)
CREATE TABLE IF NOT EXISTS public.objective_domains (
    id VARCHAR(100) PRIMARY KEY,
    certification_id VARCHAR(100) REFERENCES public.certification_catalog(id) ON DELETE CASCADE,
    domain_code VARCHAR(50) NOT NULL,
    domain_title VARCHAR(255) NOT NULL,
    weight_percentage INT DEFAULT 20,
    skill_definitions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NGUỒN TÀI LIỆU TIN HỌC (LEARNING SOURCES)
CREATE TABLE IF NOT EXISTS public.learning_sources (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('rss', 'sitemap', 'html_category', 'manual_url', 'api', 'webhook')),
    source_tier VARCHAR(50) NOT NULL CHECK (source_tier IN ('OFFICIAL', 'TRUSTED_REFERENCE', 'LICENSED_PARTNER', 'TINHOCGENZ_ORIGINAL')),
    description TEXT NOT NULL,
    logo_url TEXT,
    allowed_domains JSONB DEFAULT '[]'::jsonb,
    content_categories JSONB DEFAULT '[]'::jsonb,
    crawl_enabled BOOLEAN NOT NULL DEFAULT true,
    auto_discover_enabled BOOLEAN NOT NULL DEFAULT true,
    requires_login BOOLEAN NOT NULL DEFAULT false,
    robots_checked_at TIMESTAMPTZ,
    terms_checked_at TIMESTAMPTZ,
    license_status VARCHAR(50) NOT NULL DEFAULT 'needs_review',
    license_note TEXT,
    sync_frequency VARCHAR(50) NOT NULL DEFAULT 'monthly' CHECK (sync_frequency IN ('daily', 'weekly', 'monthly', 'manual')),
    last_checked_at TIMESTAMPTZ,
    next_check_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    consecutive_failures INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'failing')),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_sources_tier ON public.learning_sources(source_tier);
CREATE INDEX IF NOT EXISTS idx_learning_sources_status ON public.learning_sources(status);

-- 4. CẤU HÌNH FEED & SITEMAP NGUỒN (LEARNING SOURCE FEEDS)
CREATE TABLE IF NOT EXISTS public.learning_source_feeds (
    id VARCHAR(100) PRIMARY KEY,
    source_id VARCHAR(100) NOT NULL REFERENCES public.learning_sources(id) ON DELETE CASCADE,
    feed_type VARCHAR(50) NOT NULL CHECK (feed_type IN ('rss', 'atom', 'sitemap', 'category_page', 'api')),
    feed_url TEXT NOT NULL,
    sitemap_url TEXT,
    category_url TEXT,
    selector_config JSONB DEFAULT '{}'::jsonb,
    pagination_config JSONB DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT true,
    last_cursor TEXT,
    last_etag TEXT,
    last_modified TIMESTAMPTZ,
    last_checksum VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TÀI LIỆU & HỌC LIỆU THU THẬP (LEARNING RESOURCES)
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id VARCHAR(100) PRIMARY KEY,
    source_id VARCHAR(100) REFERENCES public.learning_sources(id) ON DELETE SET NULL,
    canonical_url TEXT NOT NULL UNIQUE,
    source_url TEXT NOT NULL,
    title TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    summary TEXT,
    original_excerpt TEXT,
    author VARCHAR(255),
    publisher VARCHAR(255),
    published_at TIMESTAMPTZ,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content_type VARCHAR(50) NOT NULL DEFAULT 'exercise',
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    subject VARCHAR(50) NOT NULL DEFAULT 'Word',
    application VARCHAR(100) NOT NULL,
    application_version VARCHAR(50),
    certification_family VARCHAR(50),
    exam_code VARCHAR(50),
    module_code VARCHAR(50),
    difficulty VARCHAR(20) DEFAULT 'medium',
    objective_domain VARCHAR(100),
    skill_tags JSONB DEFAULT '[]'::jsonb,
    thumbnail_url TEXT,
    external_download_url TEXT,
    external_links JSONB DEFAULT '[]'::jsonb,
    internal_file_id VARCHAR(100),
    copyright_status VARCHAR(50) NOT NULL DEFAULT 'needs_review',
    license_type VARCHAR(100),
    license_evidence TEXT,
    quality_score INT NOT NULL DEFAULT 0,
    trust_score INT NOT NULL DEFAULT 0,
    relevance_score INT NOT NULL DEFAULT 0,
    factual_score INT NOT NULL DEFAULT 0,
    completeness_score INT NOT NULL DEFAULT 0,
    freshness_score INT NOT NULL DEFAULT 0,
    factual_status VARCHAR(50) NOT NULL DEFAULT 'unverified' CHECK (factual_status IN ('verified', 'conflict', 'unverified', 'deprecated')),
    factual_conflicts JSONB DEFAULT '[]'::jsonb,
    duplicate_status VARCHAR(50) NOT NULL DEFAULT 'unique' CHECK (duplicate_status IN ('unique', 'candidate_duplicate', 'confirmed_duplicate')),
    duplicate_candidate_id VARCHAR(100),
    similarity_score INT DEFAULT 0,
    review_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'in_review', 'changes_requested', 'approved', 'rejected')),
    publication_status VARCHAR(50) NOT NULL DEFAULT 'unpublished' CHECK (publication_status IN ('draft', 'unpublished', 'published', 'archived')),
    content_hash VARCHAR(64) NOT NULL,
    normalized_hash VARCHAR(64) NOT NULL,
    is_locked_by VARCHAR(100),
    ai_assisted BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_exam ON public.learning_resources(exam_code);
CREATE INDEX IF NOT EXISTS idx_learning_resources_factual ON public.learning_resources(factual_status);
CREATE INDEX IF NOT EXISTS idx_learning_resources_review ON public.learning_resources(review_status);
CREATE INDEX IF NOT EXISTS idx_learning_resources_publication ON public.learning_resources(publication_status);

-- 6. LỊCH SỬ PHIÊN BẢN TÀI LIỆU (RESOURCE VERSIONS)
CREATE TABLE IF NOT EXISTS public.resource_versions (
    id VARCHAR(100) PRIMARY KEY,
    resource_id VARCHAR(100) NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    version_num INT NOT NULL,
    metadata_snapshot JSONB NOT NULL,
    change_summary TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TỆP ĐÍNH KÈM & KIỂM TRA BẢO MẬT (RESOURCE FILES)
CREATE TABLE IF NOT EXISTS public.resource_files (
    id VARCHAR(100) PRIMARY KEY,
    resource_id VARCHAR(100) REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    download_source_url TEXT,
    storage_key TEXT,
    scan_status VARCHAR(50) NOT NULL DEFAULT 'quarantined' CHECK (scan_status IN ('quarantined', 'scanned_clean', 'macro_detected', 'malware_infected', 'rejected')),
    macro_check_result JSONB DEFAULT '{}'::jsonb,
    antivirus_result JSONB DEFAULT '{}'::jsonb,
    license_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. HÀNG ĐỢI KIỂM DUYỆT (CONTENT REVIEW QUEUE)
CREATE TABLE IF NOT EXISTS public.content_review_queue (
    id VARCHAR(100) PRIMARY KEY,
    resource_id VARCHAR(100) NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    assigned_team VARCHAR(100) NOT NULL DEFAULT 'CNTT_MASTER_REVIEW_TEAM',
    assigned_reviewer VARCHAR(100),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    reasons JSONB DEFAULT '[]'::jsonb,
    factual_conflicts JSONB DEFAULT '[]'::jsonb,
    copyright_flags JSONB DEFAULT '[]'::jsonb,
    security_flags JSONB DEFAULT '[]'::jsonb,
    duplicate_candidates JSONB DEFAULT '[]'::jsonb,
    review_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'in_review', 'changes_requested', 'approved', 'rejected')),
    reviewer_note TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON public.content_review_queue(review_status);
CREATE INDEX IF NOT EXISTS idx_review_queue_priority ON public.content_review_queue(priority);

-- 9. NHẬT KÝ THẨM ĐỊNH (CONTENT REVIEW ACTIONS) - AUDIT LOG BẤT BIẾN
CREATE TABLE IF NOT EXISTS public.content_review_actions (
    id VARCHAR(100) PRIMARY KEY,
    resource_id VARCHAR(100) NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('assign', 'approve', 'reject', 'request_changes', 'publish', 'unpublish', 'archive', 'restore')),
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TIẾN TRÌNH ĐỒNG BỘ NGUỒN (CONTENT SYNC JOBS & LOGS)
CREATE TABLE IF NOT EXISTS public.content_sync_jobs (
    id VARCHAR(100) PRIMARY KEY,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('monthly_batch', 'manual_single_source', 'manual_single_url', 'retry_failed')),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('scheduled_cron', 'admin_manual', 'api_webhook')),
    source_id VARCHAR(100) REFERENCES public.learning_sources(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    scanned_count INT NOT NULL DEFAULT 0,
    discovered_count INT NOT NULL DEFAULT 0,
    created_count INT NOT NULL DEFAULT 0,
    updated_count INT NOT NULL DEFAULT 0,
    duplicate_count INT NOT NULL DEFAULT 0,
    conflict_count INT NOT NULL DEFAULT 0,
    rejected_count INT NOT NULL DEFAULT 0,
    error_count INT NOT NULL DEFAULT 0,
    triggered_by VARCHAR(100) NOT NULL,
    error_summary TEXT
);

CREATE TABLE IF NOT EXISTS public.content_sync_logs (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(100) NOT NULL REFERENCES public.content_sync_jobs(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'conflict')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. KHO HỌC LIỆU ĐỘC QUYỀN BIÊN SOẠN TIN HỌC GEN Z (INTERNAL LEARNING MATERIALS)
CREATE TABLE IF NOT EXISTS public.internal_learning_materials (
    id VARCHAR(100) PRIMARY KEY,
    material_code VARCHAR(100) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL DEFAULT '2026.1',
    title TEXT NOT NULL,
    subject VARCHAR(50) NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    learning_outcomes JSONB DEFAULT '[]'::jsonb,
    author_name VARCHAR(100) NOT NULL,
    author_id VARCHAR(100) NOT NULL,
    peer_reviewer_name VARCHAR(100),
    peer_reviewer_id VARCHAR(100),
    review_stage VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (review_stage IN ('DRAFT', 'TECHNICAL_REVIEW', 'ACADEMIC_REVIEW', 'COPYRIGHT_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    files JSONB DEFAULT '[]'::jsonb,
    ai_assisted BOOLEAN NOT NULL DEFAULT false,
    editorial_badge TEXT NOT NULL DEFAULT 'Tài liệu được biên soạn và kiểm duyệt bởi TIN HỌC GEN Z.',
    verification_qr TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. THÔNG BÁO HỘI ĐỒNG CNTT MASTER (TEAM NOTIFICATIONS)
CREATE TABLE IF NOT EXISTS public.team_notifications (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'source_sync',
    priority VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'warning', 'critical')),
    target_role VARCHAR(50) NOT NULL DEFAULT 'ALL',
    deep_link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_notification_reads (
    id BIGSERIAL PRIMARY KEY,
    notification_id VARCHAR(100) NOT NULL REFERENCES public.team_notifications(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_notif_user_read UNIQUE(notification_id, user_id)
);

-- 13. RLS (ROW LEVEL SECURITY) POLICIES
ALTER TABLE public.learning_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_notifications ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc tài liệu đã được phê duyệt và xuất bản công khai
CREATE POLICY "Public Read Published Resources"
    ON public.learning_resources FOR SELECT
    USING (publication_status = 'published' AND is_deleted = false);

-- Service Role hoặc Admin quản trị toàn quyền
CREATE POLICY "Admin All Permissions on Learning Sources"
    ON public.learning_sources FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin All Permissions on Review Queue"
    ON public.content_review_queue FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
