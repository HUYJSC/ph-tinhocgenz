/**
 * TRUNG TÂM NGUỒN HỌC LIỆU VÀ KIỂM DUYỆT ĐỀ THI
 * TypeScript Domain Interfaces & Types
 * PH DIGITAL EDUCATION — TIN HỌC GEN Z
 */

export type SourceType = 'rss' | 'sitemap' | 'html_category' | 'manual_url' | 'api' | 'webhook';

export type SourceTier = 'OFFICIAL' | 'TRUSTED_REFERENCE' | 'LICENSED_PARTNER' | 'TINHOCGENZ_ORIGINAL';

export type LicenseStatus = 'public_domain' | 'licensed' | 'open_access' | 'fair_use' | 'needs_review' | 'restricted' | 'copyrighted';

export type FactualStatus = 'verified' | 'conflict' | 'unverified' | 'deprecated';

export type DuplicateStatus = 'unique' | 'candidate_duplicate' | 'confirmed_duplicate';

export type ReviewStatus = 'pending' | 'in_review' | 'changes_requested' | 'approved' | 'rejected';

export type PublicationStatus = 'draft' | 'unpublished' | 'published' | 'archived';

export type MasterReviewRole =
  | 'super_admin'
  | 'content_admin'
  | 'source_manager'
  | 'technical_reviewer'
  | 'academic_reviewer'
  | 'copyright_reviewer'
  | 'publisher'
  | 'auditor';

export interface CertificationExam {
  family: 'MOS_2019' | 'MOS_365' | 'IC3' | 'CNTT_CO_BAN' | 'CNTT_NANG_CAO' | 'AI_OFFICE';
  code: string;
  name: string;
  officialLevel: 'Associate' | 'Expert' | 'Standard';
  subject: 'Word' | 'Excel' | 'PowerPoint' | 'Outlook' | 'Access' | 'General_IT' | 'AI';
  officialUrl: string;
  isCurrent: boolean;
  notes?: string;
}

export interface LearningSource {
  id: string;
  name: string;
  base_url: string;
  source_type: SourceType;
  source_tier: SourceTier;
  description: string;
  logo_url?: string;
  allowed_domains: string[];
  content_categories: string[];
  crawl_enabled: boolean;
  auto_discover_enabled: boolean;
  requires_login: boolean;
  robots_checked_at?: string;
  terms_checked_at?: string;
  license_status: LicenseStatus;
  license_note?: string;
  sync_frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  last_checked_at?: string;
  next_check_at?: string;
  last_success_at?: string;
  consecutive_failures: number;
  status: 'active' | 'paused' | 'error' | 'failing';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LearningResource {
  id: string;
  source_id: string;
  source_name: string;
  source_tier: SourceTier;
  canonical_url: string;
  source_url: string;
  title: string;
  slug: string;
  summary: string;
  original_excerpt: string;
  author: string;
  publisher: string;
  published_at: string;
  discovered_at: string;
  content_type: 'theory' | 'exercise' | 'mock_exam' | 'video' | 'practice_file' | 'answer_key' | 'curriculum';
  language: 'vi' | 'en';
  subject: 'Word' | 'Excel' | 'PowerPoint' | 'Outlook' | 'Access' | 'General_IT' | 'AI';
  application: string;
  application_version: string;
  certification_family: string;
  exam_code: string;
  module_code?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  objective_domain?: string;
  skill_tags: string[];
  thumbnail_url?: string;
  external_download_url?: string;
  external_links?: Array<{ title: string; url: string; type: string }>;
  internal_file_id?: string;
  copyright_status: LicenseStatus;
  license_type: string;
  license_evidence?: string;
  quality_score: number; // 0 - 100
  trust_score: number; // 0 - 100
  relevance_score: number; // 0 - 100
  factual_score: number; // 0 - 100
  completeness_score: number; // 0 - 100
  freshness_score: number; // 0 - 100
  factual_status: FactualStatus;
  factual_conflicts?: Array<{
    claim: string;
    standard_value: string;
    reference_url: string;
    detected_issue: string;
  }>;
  duplicate_status: DuplicateStatus;
  duplicate_candidate_id?: string;
  similarity_score?: number;
  review_status: ReviewStatus;
  publication_status: PublicationStatus;
  content_hash: string;
  normalized_hash: string;
  current_reviewer?: string;
  is_locked_by?: string;
  created_at: string;
  updated_at: string;
  ai_assisted?: boolean;
}

export interface ContentReviewQueueItem {
  id: string;
  resource_id: string;
  resource: LearningResource;
  assigned_team: string;
  assigned_reviewer?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasons: string[];
  factual_conflicts: Array<{
    claim: string;
    standard_value: string;
    reference_url: string;
    detected_issue: string;
  }>;
  copyright_flags: string[];
  security_flags: string[];
  duplicate_candidates: Array<{
    resource_id: string;
    title: string;
    similarity: number;
  }>;
  review_status: ReviewStatus;
  reviewer_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface ContentReviewAction {
  id: string;
  resource_id: string;
  action: 'assign' | 'approve' | 'reject' | 'request_changes' | 'publish' | 'unpublish' | 'archive' | 'restore';
  actor_name: string;
  actor_role: MasterReviewRole;
  notes?: string;
  timestamp: string;
}

export interface ContentSyncJob {
  id: string;
  job_type: 'monthly_batch' | 'manual_single_source' | 'manual_single_url' | 'retry_failed';
  trigger_type: 'scheduled_cron' | 'admin_manual' | 'api_webhook';
  source_id?: string;
  source_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  started_at: string;
  finished_at?: string;
  scanned_count: number;
  discovered_count: number;
  created_count: number;
  updated_count: number;
  duplicate_count: number;
  conflict_count: number;
  rejected_count: number;
  error_count: number;
  triggered_by: string;
  error_summary?: string;
}

export interface InternalLearningMaterial {
  id: string;
  material_code: string; // VD: TGZ-MAT-MOS365-W01
  version: string; // VD: "2026.1"
  title: string;
  subject: 'Word' | 'Excel' | 'PowerPoint' | 'Outlook' | 'Access' | 'General_IT' | 'AI';
  module_code: string;
  learning_outcomes: string[];
  author_name: string;
  author_id: string;
  peer_reviewer_name?: string;
  peer_reviewer_id?: string;
  review_stage: 'DRAFT' | 'TECHNICAL_REVIEW' | 'ACADEMIC_REVIEW' | 'COPYRIGHT_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  files: Array<{
    name: string;
    type: 'docx' | 'xlsx' | 'pptx' | 'pdf' | 'mp4' | 'zip';
    sizeBytes: number;
    sha256: string;
    url: string;
    isQuarantined: boolean;
    macroDetected: boolean;
  }>;
  ai_assisted: boolean;
  editorial_badge: string; // "Tài liệu được biên soạn và kiểm duyệt bởi TIN HỌC GEN Z."
  verification_qr?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamNotification {
  id: string;
  title: string;
  message: string;
  category: 'source_sync' | 'factual_conflict' | 'copyright_flag' | 'review_assigned' | 'system_alert';
  priority: 'info' | 'warning' | 'critical';
  target_role: MasterReviewRole | 'ALL';
  deep_link?: string;
  is_read: boolean;
  created_at: string;
}
