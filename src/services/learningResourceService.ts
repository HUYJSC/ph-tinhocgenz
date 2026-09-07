/**
 * TRUNG TÂM NGUỒN HỌC LIỆU VÀ KIỂM DUYỆT ĐỀ THI
 * Service Core Engine & Pipeline Quản Trị Học Liệu Chuẩn Quốc Gia & Quốc Tế
 * PH DIGITAL EDUCATION — TIN HỌC GEN Z
 */

import {
  LearningSource,
  LearningResource,
  ContentReviewQueueItem,
  ContentReviewAction,
  ContentSyncJob,
  InternalLearningMaterial,
  TeamNotification,
  MasterReviewRole
} from '../types/learningResource';
import { validateExamCodeVsTitle } from '../data/certificationCatalog';
import { validateSafeUrlForFetch } from '../utils/ssrfProtection';

// ── LOCAL STORAGE KEYS CHO PHÂN HỆ NGUỒN HỌC LIỆU ──
const STORAGE_SOURCES_KEY = 'phtinhocgenz_learning_sources_v1';
const STORAGE_RESOURCES_KEY = 'phtinhocgenz_learning_resources_v1';
const STORAGE_QUEUE_KEY = 'phtinhocgenz_review_queue_v1';
const STORAGE_JOBS_KEY = 'phtinhocgenz_sync_jobs_v1';
const STORAGE_MATERIALS_KEY = 'phtinhocgenz_internal_materials_v1';
const STORAGE_NOTIFICATIONS_KEY = 'phtinhocgenz_master_notifications_v1';
const STORAGE_ACTIONS_KEY = 'phtinhocgenz_review_actions_v1';

// ── 1. KHỞI TẠO NGUỒN MẪU UY TÍN (INITIAL SEED SOURCES) ──
export const INITIAL_LEARNING_SOURCES: LearningSource[] = [
  {
    id: 'src-official-ms-learn',
    name: 'Microsoft Learn Credentials (MOS Official)',
    base_url: 'https://learn.microsoft.com',
    source_type: 'api',
    source_tier: 'OFFICIAL',
    description: 'Cổng thông tin chứng chỉ và kỳ thi chính thức của Microsoft toàn cầu.',
    allowed_domains: ['learn.microsoft.com', 'microsoft.com'],
    content_categories: ['MOS 365', 'Office 2019', 'AI Office'],
    crawl_enabled: true,
    auto_discover_enabled: true,
    requires_login: false,
    license_status: 'open_access',
    license_note: 'Tài liệu hướng dẫn & chuẩn kỹ năng công khai từ Microsoft.',
    sync_frequency: 'monthly',
    consecutive_failures: 0,
    status: 'active',
    created_by: 'Super Admin',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z'
  },
  {
    id: 'src-official-certiport',
    name: 'Certiport Pearson VUE (Khảo Thí MOS Quốc Tế)',
    base_url: 'https://certiport.pearsonvue.com',
    source_type: 'html_category',
    source_tier: 'OFFICIAL',
    description: 'Đơn vị tổ chức khảo thí độc quyền bài thi MOS trên toàn thế giới.',
    allowed_domains: ['certiport.pearsonvue.com', 'pearsonvue.com'],
    content_categories: ['MOS 365', 'Office 2019', 'IC3'],
    crawl_enabled: true,
    auto_discover_enabled: true,
    requires_login: false,
    license_status: 'public_domain',
    sync_frequency: 'monthly',
    consecutive_failures: 0,
    status: 'active',
    created_by: 'Super Admin',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z'
  },
  {
    id: 'src-official-chinh-phu-tt03',
    name: 'Cổng Văn Bản Chính Phủ (Thông tư 03/2014 Chuẩn CNTT)',
    base_url: 'https://vanban.chinhphu.vn',
    source_type: 'manual_url',
    source_tier: 'OFFICIAL',
    description: 'Quy chuẩn kỹ năng sử dụng CNTT Cơ bản và Nâng cao ban hành bởi Bộ TT&TT và Bộ GD&ĐT.',
    allowed_domains: ['vanban.chinhphu.vn', 'mic.gov.vn', 'moet.gov.vn'],
    content_categories: ['CNTT Cơ bản', 'CNTT Nâng cao'],
    crawl_enabled: true,
    auto_discover_enabled: false,
    requires_login: false,
    license_status: 'public_domain',
    sync_frequency: 'monthly',
    consecutive_failures: 0,
    status: 'active',
    created_by: 'Super Admin',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z'
  },
  {
    id: 'src-ref-blogdaytinhoc',
    name: 'Blog Dạy Tin Học (Nguồn Tham Khảo Chuyên Môn)',
    base_url: 'https://blogdaytinhoc.com',
    source_type: 'html_category',
    source_tier: 'TRUSTED_REFERENCE',
    description: 'Trang chia sẻ kinh nghiệm giảng dạy và tài liệu ôn tập MOS, CNTT văn phòng từ cộng đồng.',
    allowed_domains: ['blogdaytinhoc.com', 'drive.google.com'],
    content_categories: ['MOS 365', 'Office 2019', 'Word', 'Excel', 'PowerPoint'],
    crawl_enabled: true,
    auto_discover_enabled: true,
    requires_login: false,
    license_status: 'needs_review',
    license_note: 'Chỉ chia sẻ liên kết nguồn ngoài (External Link) và mở tab mới với rel="noopener noreferrer nofollow". Tuyệt đối không sao chép khi chưa có giấy phép.',
    sync_frequency: 'monthly',
    consecutive_failures: 0,
    status: 'active',
    created_by: 'Super Admin',
    created_at: '2026-08-15T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z'
  }
];

// ── 2. DỮ LIỆU MẪU ĐƯỢC PHÁT HIỆN TỪ BÀI VIẾT BLOG DẠY TIN HỌC (STAGE 7) ──
export const SAMPLE_BLOG_POST_RESOURCE: LearningResource = {
  id: 'res-blogdaytinhoc-mos365-1369',
  source_id: 'src-ref-blogdaytinhoc',
  source_name: 'Blog Dạy Tin Học',
  source_tier: 'TRUSTED_REFERENCE',
  canonical_url: 'https://blogdaytinhoc.com/tai-lieu-luyen-thi-mos-365-microsoft-365-apps-moi-nhat-2026-word-excel-powerpoint-1369',
  source_url: 'https://blogdaytinhoc.com/tai-lieu-luyen-thi-mos-365-microsoft-365-apps-moi-nhat-2026-word-excel-powerpoint-1369',
  title: 'Tài liệu luyện thi MOS 365 (Microsoft 365 Apps) mới nhất 2026 Word Excel PowerPoint',
  slug: 'tai-lieu-luyen-thi-mos-365-microsoft-365-apps-moi-nhat-2026',
  summary: 'Tổng hợp bộ đề và bài tập thực hành MOS Word, Excel, PowerPoint. Nội dung bài viết đề cập tới các mã MO-100, MO-200, MO-300 kèm liên kết Google Drive.',
  original_excerpt: 'Chào các bạn, đây là bộ tài liệu luyện thi MOS 365 mới nhất gồm Word MO-100, Excel MO-200 và PowerPoint MO-300 kèm tệp thực hành...',
  author: 'Ban biên tập Blog Dạy Tin Học',
  publisher: 'blogdaytinhoc.com',
  published_at: '2026-08-28T09:00:00Z',
  discovered_at: '2026-09-01T09:00:00Z',
  content_type: 'exercise',
  language: 'vi',
  subject: 'Word',
  application: 'Microsoft 365 Apps',
  application_version: '365',
  certification_family: 'MOS_365',
  exam_code: 'MO-100', // ĐÂY LÀ MÃ BỊ GÁN SAI BỞI NGUỒN NGOÀI
  difficulty: 'medium',
  skill_tags: ['MOS 365', 'Word', 'Excel', 'PowerPoint', 'Thực hành', 'Google Drive'],
  external_download_url: 'https://drive.google.com/drive/folders/sample-public-mos',
  external_links: [
    { title: 'Tệp mẫu Word (Google Drive)', url: 'https://drive.google.com/open?id=sample_word_mos', type: 'gdrive' },
    { title: 'Tệp mẫu Excel (Google Drive)', url: 'https://drive.google.com/open?id=sample_excel_mos', type: 'gdrive' },
    { title: 'Tệp mẫu PowerPoint (Google Drive)', url: 'https://drive.google.com/open?id=sample_ppt_mos', type: 'gdrive' }
  ],
  copyright_status: 'needs_review',
  license_type: 'External Community Resource',
  license_evidence: 'Liên kết chia sẻ công khai bởi blogdaytinhoc.com, chưa có thỏa thuận nhượng quyền tác giả.',
  quality_score: 72,
  trust_score: 65,
  relevance_score: 95,
  factual_score: 40, // Điểm thấp do xung đột mã bài thi
  completeness_score: 80,
  freshness_score: 90,
  factual_status: 'conflict', // PHÁT HIỆN XUNG ĐỘT MÃ BÀI THI
  factual_conflicts: [
    {
      claim: 'Tiêu đề bài viết nói luyện thi MOS 365 (Microsoft 365 Apps) nhưng nội dung sử dụng các mã thi MO-100, MO-200, MO-300.',
      standard_value: 'Theo chuẩn Certiport & Microsoft Learn: MO-100, MO-200, MO-300 thuộc về Office 2019. Microsoft 365 Apps chính thức phải dùng mã MO-110, MO-210, MO-310.',
      reference_url: 'https://certiport.pearsonvue.com/Certifications/Microsoft/MOS/Certify/365-Apps.aspx',
      detected_issue: 'Sai lệch mã đề thi chứng chỉ giữa phiên bản Office 2019 và Microsoft 365 Apps.'
    }
  ],
  duplicate_status: 'unique',
  review_status: 'pending', // BẮT BUỘC ĐƯA VÀO HÀNG ĐỢI KIỂM DUYỆT
  publication_status: 'unpublished', // TUYỆT ĐỐI KHÔNG TỰ ĐỘNG XUẤT BẢN
  content_hash: 'sha256_sample_blogdaytinhoc_1369_raw',
  normalized_hash: 'sha256_sample_blogdaytinhoc_1369_norm',
  created_at: '2026-09-01T09:00:00Z',
  updated_at: '2026-09-01T09:00:00Z'
};

// ── 3. HÀNG ĐỢI KIỂM DUYỆT BAN ĐẦU CHO HỘI ĐỒNG CNTT MASTER ──
export const SAMPLE_REVIEW_QUEUE: ContentReviewQueueItem[] = [
  {
    id: 'queue-item-blogdaytinhoc-1369',
    resource_id: SAMPLE_BLOG_POST_RESOURCE.id,
    resource: SAMPLE_BLOG_POST_RESOURCE,
    assigned_team: 'CNTT_MASTER_REVIEW_TEAM',
    priority: 'urgent',
    reasons: [
      'Phát hiện xung đột mã bài thi: Tiêu đề ghi MOS 365 nhưng mã là MO-100 / MO-200 / MO-300 (Office 2019).',
      'Cần xác minh bản quyền liên kết tệp Google Drive trước khi cho phép học viên truy cập.',
      'Cần chuẩn hóa lại phân loại trước khi xét duyệt thành tài liệu tham khảo ngoài.'
    ],
    factual_conflicts: SAMPLE_BLOG_POST_RESOURCE.factual_conflicts || [],
    copyright_flags: [
      'Tài liệu từ website cộng đồng blogdaytinhoc.com, chỉ được hiển thị dạng liên kết ngoài kèm rel="noopener noreferrer nofollow".'
    ],
    security_flags: [
      'Liên kết trỏ ra Google Drive công khai, cần rà quét macro độc hại nếu sau này tải file về máy chủ.'
    ],
    duplicate_candidates: [],
    review_status: 'pending',
    created_at: '2026-09-01T09:00:00Z'
  }
];

// ── 4. KHO TÀI LIỆU BIÊN SOẠN ĐỘC QUYỀN TIN HỌC GEN Z (STAGE 8) ──
export const SAMPLE_INTERNAL_MATERIALS: InternalLearningMaterial[] = [
  {
    id: 'mat-tgz-mos365-w01',
    material_code: 'TGZ-MOS365-W01',
    version: '2026.1',
    title: 'Giáo Trình Thực Chiến MOS Word 365 Associate (Mã Đề Chuẩn MO-110)',
    subject: 'Word',
    module_code: 'MO-110',
    learning_outcomes: [
      'Quản lý văn bản và thiết lập cấu hình trang in chuyên nghiệp',
      'Định dạng nâng cao với Styles, Theme và Navigation Pane',
      'Chèn và định dạng bảng biểu, đồ họa thông minh SmartArt',
      'Tạo mục lục tự động, chú thích trích dẫn chuẩn APA/IEEE'
    ],
    author_name: 'ThS. Nguyễn Văn Huy (Master MOS Trainer)',
    author_id: 'teacher-huy-01',
    peer_reviewer_name: 'Hội đồng Khảo thí PH TIN HỌC GEN Z',
    peer_reviewer_id: 'council-tgz-master',
    review_stage: 'PUBLISHED',
    files: [
      {
        name: 'GiaoTrinh_MOS_Word_365_MO110_v2026.pdf',
        type: 'pdf',
        sizeBytes: 15485000,
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        url: 'https://hoctructuyen.tinhocgenz.io.vn/materials/GiaoTrinh_MOS_Word_365_MO110.pdf',
        isQuarantined: false,
        macroDetected: false
      }
    ],
    ai_assisted: false,
    editorial_badge: 'Tài liệu được biên soạn và kiểm duyệt bởi TIN HỌC GEN Z.',
    verification_qr: 'https://hoctructuyen.tinhocgenz.io.vn/verify/TGZ-MOS365-W01',
    created_at: '2026-08-20T08:00:00Z',
    updated_at: '2026-09-05T14:30:00Z'
  },
  {
    id: 'mat-tgz-mos365-x01',
    material_code: 'TGZ-MOS365-X01',
    version: '2026.1',
    title: 'Bộ Đề Mô Phỏng Khảo Thí MOS Excel 365 Associate (Mã Đề Chuẩn MO-210)',
    subject: 'Excel',
    module_code: 'MO-210',
    learning_outcomes: [
      'Xử lý bảng tính và dữ liệu số quy mô lớn',
      'Thành thạo hàm dò tìm XLOOKUP, INDEX/MATCH, FILTER động',
      'Trực quan hóa dữ liệu qua biểu đồ động và Sparklines'
    ],
    author_name: 'ThS. Trần Thị Mai (Data Architect)',
    author_id: 'teacher-mai-02',
    peer_reviewer_name: 'ThS. Nguyễn Văn Huy',
    peer_reviewer_id: 'teacher-huy-01',
    review_stage: 'APPROVED',
    files: [
      {
        name: 'DeThiMoPhong_Excel_365_MO210.xlsx',
        type: 'xlsx',
        sizeBytes: 4280000,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        url: 'https://hoctructuyen.tinhocgenz.io.vn/materials/DeThiMoPhong_Excel_365_MO210.xlsx',
        isQuarantined: false,
        macroDetected: false
      }
    ],
    ai_assisted: true, // Được AI hỗ trợ sinh đề mô phỏng nhưng đã có giảng viên phản biện
    editorial_badge: 'Tài liệu được biên soạn và kiểm duyệt bởi TIN HỌC GEN Z.',
    verification_qr: 'https://hoctructuyen.tinhocgenz.io.vn/verify/TGZ-MOS365-X01',
    created_at: '2026-08-25T10:00:00Z',
    updated_at: '2026-09-06T16:00:00Z'
  }
];

// ── 5. THÔNG BÁO HỘI ĐỒNG CNTT MASTER BAN ĐẦU ──
export const SAMPLE_MASTER_NOTIFICATIONS: TeamNotification[] = [
  {
    id: 'notif-master-sync-sep2026',
    title: 'Hoàn tất đợt rà soát nguồn định kỳ Tháng 09/2026',
    message: 'Đợt rà soát nguồn tháng 09/2026 đã hoàn tất. Phát hiện 18 tài liệu mới, 3 tài liệu nghi trùng, 2 xung đột mã bài thi và 1 tài liệu cần kiểm tra bản quyền.',
    category: 'source_sync',
    priority: 'warning',
    target_role: 'ALL',
    deep_link: '#learning_sources',
    is_read: false,
    created_at: '2026-09-01T09:15:00Z'
  },
  {
    id: 'notif-master-conflict-1369',
    title: 'Cảnh báo xung đột mã bài thi MOS 365 vs MO-100',
    message: 'Bài viết mẫu từ blogdaytinhoc.com gán mã MO-100 vào Microsoft 365 Apps. Đã đưa vào hàng đợi kiểm duyệt và chặn tự động xuất bản.',
    category: 'factual_conflict',
    priority: 'critical',
    target_role: 'technical_reviewer',
    deep_link: '#review_queue',
    is_read: false,
    created_at: '2026-09-01T09:16:00Z'
  }
];

// ── 6. PIPELINE CLASS XỬ LÝ QUẢN TRỊ NGUỒN HỌC LIỆU ──
export class LearningResourceService {
  /**
   * Lấy danh sách nguồn học liệu
   */
  static getSources(): LearningSource[] {
    if (typeof window === 'undefined') return INITIAL_LEARNING_SOURCES;
    try {
      const stored = localStorage.getItem(STORAGE_SOURCES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading learning sources from localStorage', e);
    }
    this.saveSources(INITIAL_LEARNING_SOURCES);
    return INITIAL_LEARNING_SOURCES;
  }

  static saveSources(sources: LearningSource[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_SOURCES_KEY, JSON.stringify(sources));
    } catch (e) {
      console.error('Error saving learning sources', e);
    }
  }

  /**
   * Thêm nguồn mới có kiểm tra bảo mật SSRF
   */
  static addSource(source: Omit<LearningSource, 'id' | 'created_at' | 'updated_at' | 'consecutive_failures' | 'status'>): { ok: boolean; source?: LearningSource; error?: string } {
    const ssrfCheck = validateSafeUrlForFetch(source.base_url);
    if (!ssrfCheck.safe) {
      return { ok: false, error: `Lỗi bảo mật URL: ${ssrfCheck.reason}` };
    }

    const newSource: LearningSource = {
      ...source,
      id: `src-${Date.now()}`,
      consecutive_failures: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const sources = this.getSources();
    sources.unshift(newSource);
    this.saveSources(sources);
    return { ok: true, source: newSource };
  }

  /**
   * Lấy danh sách tài liệu
   */
  static getResources(): LearningResource[] {
    if (typeof window === 'undefined') return [SAMPLE_BLOG_POST_RESOURCE];
    try {
      const stored = localStorage.getItem(STORAGE_RESOURCES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading resources from localStorage', e);
    }
    this.saveResources([SAMPLE_BLOG_POST_RESOURCE]);
    return [SAMPLE_BLOG_POST_RESOURCE];
  }

  static saveResources(resources: LearningResource[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_RESOURCES_KEY, JSON.stringify(resources));
    } catch (e) {
      console.error('Error saving resources', e);
    }
  }

  /**
   * Lấy hàng đợi kiểm duyệt
   */
  static getReviewQueue(): ContentReviewQueueItem[] {
    if (typeof window === 'undefined') return SAMPLE_REVIEW_QUEUE;
    try {
      const stored = localStorage.getItem(STORAGE_QUEUE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading review queue from localStorage', e);
    }
    this.saveReviewQueue(SAMPLE_REVIEW_QUEUE);
    return SAMPLE_REVIEW_QUEUE;
  }

  static saveReviewQueue(queue: ContentReviewQueueItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Error saving review queue', e);
    }
  }

  /**
   * Lấy kho tài liệu độc quyền TIN HỌC GEN Z
   */
  static getInternalMaterials(): InternalLearningMaterial[] {
    if (typeof window === 'undefined') return SAMPLE_INTERNAL_MATERIALS;
    try {
      const stored = localStorage.getItem(STORAGE_MATERIALS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading internal materials', e);
    }
    this.saveInternalMaterials(SAMPLE_INTERNAL_MATERIALS);
    return SAMPLE_INTERNAL_MATERIALS;
  }

  static saveInternalMaterials(materials: InternalLearningMaterial[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_MATERIALS_KEY, JSON.stringify(materials));
    } catch (e) {
      console.error('Error saving internal materials', e);
    }
  }

  /**
   * Lấy danh sách thông báo Hội đồng Master
   */
  static getNotifications(): TeamNotification[] {
    if (typeof window === 'undefined') return SAMPLE_MASTER_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading master notifications', e);
    }
    this.saveNotifications(SAMPLE_MASTER_NOTIFICATIONS);
    return SAMPLE_MASTER_NOTIFICATIONS;
  }

  static saveNotifications(notifications: TeamNotification[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving master notifications', e);
    }
  }

  static markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, is_read: true } : n);
    this.saveNotifications(updated);
  }

  /**
   * Lấy lịch sử Job đồng bộ
   */
  static getSyncJobs(): ContentSyncJob[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_JOBS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading sync jobs', e);
    }
    return [];
  }

  static saveSyncJobs(jobs: ContentSyncJob[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobs));
    } catch (e) {
      console.error('Error saving sync jobs', e);
    }
  }

  /**
   * PIPELINE 12 BƯỚC: Xử lý thu thập tài liệu mới
   */
  static processNewResourcePipeline(raw: {
    sourceId: string;
    url: string;
    title: string;
    summary?: string;
    author?: string;
    publisher?: string;
    rawExamCode?: string;
    downloadLinks?: Array<{ title: string; url: string; type: string }>;
  }): { ok: boolean; resource?: LearningResource; queueItem?: ContentReviewQueueItem; error?: string } {
    // 1. DISCOVER & SSRF VALIDATION
    const ssrf = validateSafeUrlForFetch(raw.url);
    if (!ssrf.safe) {
      return { ok: false, error: `SSRF Blocked: ${ssrf.reason}` };
    }

    const sources = this.getSources();
    const source = sources.find(s => s.id === raw.sourceId) || sources[0];

    // 2. FETCH_METADATA & NORMALIZE
    const cleanTitle = (raw.title || '').trim().replace(/\s+/g, ' ');
    const cleanExamCode = (raw.rawExamCode || '').toUpperCase().trim();
    const cleanSummary = (raw.summary || `Thu thập từ ${source.name}`).trim();

    // 3. CLASSIFY
    let subject: 'Word' | 'Excel' | 'PowerPoint' | 'Outlook' | 'Access' | 'General_IT' | 'AI' = 'Word';
    const lowerTitle = cleanTitle.toLowerCase();
    if (lowerTitle.includes('excel')) subject = 'Excel';
    else if (lowerTitle.includes('powerpoint') || lowerTitle.includes('ppt')) subject = 'PowerPoint';
    else if (lowerTitle.includes('outlook')) subject = 'Outlook';
    else if (lowerTitle.includes('access')) subject = 'Access';
    else if (lowerTitle.includes('ai') || lowerTitle.includes('copilot') || lowerTitle.includes('chatgpt')) subject = 'AI';
    else if (lowerTitle.includes('cntt') || lowerTitle.includes('ic3')) subject = 'General_IT';

    let certFamily = 'MOS_365';
    if (lowerTitle.includes('2019')) certFamily = 'MOS_2019';
    else if (lowerTitle.includes('cơ bản') || lowerTitle.includes('thông tư 03')) certFamily = 'CNTT_CO_BAN';
    else if (lowerTitle.includes('nâng cao')) certFamily = 'CNTT_NANG_CAO';

    // 4. VALIDATE ĐỐI CHIẾU MÃ BÀI THI CHÍNH THỨC
    const examCheck = validateExamCodeVsTitle(cleanTitle, cleanExamCode);
    const factualStatus = examCheck.hasConflict ? 'conflict' : 'verified';
    const factualScore = examCheck.hasConflict ? 40 : 95;

    // 5. SECURITY_SCAN
    const securityFlags: string[] = [];
    (raw.downloadLinks || []).forEach(link => {
      const linkCheck = validateSafeUrlForFetch(link.url);
      if (!linkCheck.safe) {
        securityFlags.push(`Link tải nghi vấn bảo mật: ${link.title} (${link.url})`);
      }
    });

    // 6. COPYRIGHT_CHECK
    const copyrightFlags: string[] = [];
    let copyrightStatus: LearningResource['copyright_status'] = 'open_access';
    if (source.source_tier === 'TRUSTED_REFERENCE') {
      copyrightStatus = 'needs_review';
      copyrightFlags.push('Tài liệu thuộc nguồn tham khảo ngoài. Chỉ hiển thị liên kết nguồn ngoài rel="noopener noreferrer nofollow".');
    }

    // 7. DEDUPLICATE (So sánh với tài liệu hiện hữu)
    const existing = this.getResources();
    let duplicateStatus: LearningResource['duplicate_status'] = 'unique';
    let similarityScore = 0;
    const duplicateCandidates: Array<{ resource_id: string; title: string; similarity: number }> = [];

    existing.forEach(item => {
      if (item.canonical_url === raw.url) {
        duplicateStatus = 'confirmed_duplicate';
        similarityScore = 100;
        duplicateCandidates.push({ resource_id: item.id, title: item.title, similarity: 100 });
      } else {
        const sim = this.calculateTitleSimilarity(cleanTitle, item.title);
        if (sim >= 85) {
          duplicateStatus = 'candidate_duplicate';
          similarityScore = sim;
          duplicateCandidates.push({ resource_id: item.id, title: item.title, similarity: sim });
        }
      }
    });

    // 8. SCORE
    const trustScore = source.source_tier === 'OFFICIAL' ? 100 : source.source_tier === 'TINHOCGENZ_ORIGINAL' ? 95 : 70;
    const relevanceScore = 90;
    const completenessScore = 85;
    const freshnessScore = 95;

    const overallScore = Math.round(
      trustScore * 0.30 +
      relevanceScore * 0.25 +
      factualScore * 0.20 +
      completenessScore * 0.15 +
      freshnessScore * 0.10
    );

    // 9. RESOURCE INSTANCE
    const newResource: LearningResource = {
      id: `res-${Date.now()}`,
      source_id: source.id,
      source_name: source.name,
      source_tier: source.source_tier,
      canonical_url: raw.url,
      source_url: raw.url,
      title: cleanTitle,
      slug: cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80),
      summary: cleanSummary,
      original_excerpt: cleanSummary,
      author: raw.author || source.name,
      publisher: raw.publisher || source.name,
      published_at: new Date().toISOString(),
      discovered_at: new Date().toISOString(),
      content_type: 'exercise',
      language: 'vi',
      subject,
      application: certFamily === 'MOS_365' ? 'Microsoft 365 Apps' : 'Microsoft Office 2019',
      application_version: certFamily === 'MOS_365' ? '365' : '2019',
      certification_family: certFamily,
      exam_code: cleanExamCode,
      difficulty: 'medium',
      skill_tags: [certFamily, subject],
      external_links: raw.downloadLinks,
      copyright_status: copyrightStatus,
      license_type: source.source_tier === 'TINHOCGENZ_ORIGINAL' ? 'Bản quyền PH TIN HỌC GEN Z' : 'Nguồn tham khảo bên ngoài',
      quality_score: overallScore,
      trust_score: trustScore,
      relevance_score: relevanceScore,
      factual_score: factualScore,
      completeness_score: completenessScore,
      freshness_score: freshnessScore,
      factual_status: factualStatus,
      factual_conflicts: examCheck.hasConflict ? [
        {
          claim: examCheck.claim || '',
          standard_value: examCheck.standardValue || '',
          reference_url: examCheck.referenceUrl || '',
          detected_issue: examCheck.detectedIssue || ''
        }
      ] : [],
      duplicate_status: duplicateStatus,
      similarity_score: similarityScore,
      review_status: 'pending',
      publication_status: 'unpublished', // Không tự động xuất bản
      content_hash: `hash_${Date.now()}`,
      normalized_hash: `norm_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 10. REVIEW QUEUE & HUMAN APPROVAL GATE
    const queueItem: ContentReviewQueueItem = {
      id: `queue-${Date.now()}`,
      resource_id: newResource.id,
      resource: newResource,
      assigned_team: 'CNTT_MASTER_REVIEW_TEAM',
      priority: examCheck.hasConflict || securityFlags.length > 0 ? 'urgent' : 'medium',
      reasons: [
        ...(examCheck.hasConflict ? [`Phát hiện xung đột mã bài thi: ${examCheck.detectedIssue}`] : []),
        ...(duplicateStatus !== 'unique' ? [`Nghi trùng lặp tài liệu (${similarityScore}%)`] : []),
        ...(copyrightFlags.length > 0 ? copyrightFlags : []),
        ...(securityFlags.length > 0 ? securityFlags : [])
      ],
      factual_conflicts: newResource.factual_conflicts || [],
      copyright_flags: copyrightFlags,
      security_flags: securityFlags,
      duplicate_candidates: duplicateCandidates,
      review_status: 'pending',
      created_at: new Date().toISOString()
    };

    // Lưu trữ
    existing.unshift(newResource);
    this.saveResources(existing);

    const queue = this.getReviewQueue();
    queue.unshift(queueItem);
    this.saveReviewQueue(queue);

    // Bắn thông báo cho Hội đồng CNTT Master
    if (examCheck.hasConflict) {
      const notifs = this.getNotifications();
      notifs.unshift({
        id: `notif-${Date.now()}`,
        title: `Phát hiện xung đột mã bài thi: ${cleanTitle.slice(0, 50)}...`,
        message: examCheck.detectedIssue || 'Xung đột mã bài thi cần thẩm định',
        category: 'factual_conflict',
        priority: 'critical',
        target_role: 'technical_reviewer',
        deep_link: '#review_queue',
        is_read: false,
        created_at: new Date().toISOString()
      });
      this.saveNotifications(notifs);
    }

    return { ok: true, resource: newResource, queueItem };
  }

  /**
   * Tính độ tương đồng tiêu đề đơn giản (Jaccard token similarity)
   */
  private static calculateTitleSimilarity(a: string, b: string): number {
    const tokensA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 1));
    const tokensB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 1));
    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersection = 0;
    tokensA.forEach(t => {
      if (tokensB.has(t)) intersection++;
    });

    const union = new Set([...tokensA, ...tokensB]).size;
    return Math.round((intersection / union) * 100);
  }

  /**
   * Thẩm định & Duyệt tài liệu bởi Hội đồng CNTT Master
   */
  static reviewResource(params: {
    resourceId: string;
    action: 'approve' | 'reject' | 'request_changes' | 'publish' | 'archive';
    reviewerName: string;
    reviewerRole: MasterReviewRole;
    notes?: string;
  }): { ok: boolean; error?: string } {
    // Kiểm tra quyền xuất bản
    if (params.action === 'publish' && params.reviewerRole !== 'super_admin' && params.reviewerRole !== 'publisher') {
      return { ok: false, error: 'Chỉ Super Admin hoặc Publisher mới có thẩm quyền xuất bản tài liệu.' };
    }

    const resources = this.getResources();
    const resource = resources.find(r => r.id === params.resourceId);
    if (!resource) return { ok: false, error: 'Không tìm thấy tài liệu.' };

    // Không cho phép người tạo tự duyệt nội dung của mình
    if (params.action === 'approve' && resource.author === params.reviewerName) {
      return { ok: false, error: 'Quy tắc liêm chính học thuật: Người tạo không được tự phê duyệt nội dung của mình.' };
    }

    if (params.action === 'approve') {
      resource.review_status = 'approved';
    } else if (params.action === 'reject') {
      resource.review_status = 'rejected';
      resource.publication_status = 'unpublished';
    } else if (params.action === 'request_changes') {
      resource.review_status = 'changes_requested';
    } else if (params.action === 'publish') {
      resource.publication_status = 'published';
      resource.review_status = 'approved';
    } else if (params.action === 'archive') {
      resource.publication_status = 'archived';
    }

    resource.updated_at = new Date().toISOString();
    this.saveResources(resources);

    // Cập nhật hàng đợi
    const queue = this.getReviewQueue();
    const queueIdx = queue.findIndex(q => q.resource_id === params.resourceId);
    if (queueIdx !== -1) {
      queue[queueIdx].review_status = resource.review_status;
      queue[queueIdx].reviewed_by = params.reviewerName;
      queue[queueIdx].reviewed_at = new Date().toISOString();
      queue[queueIdx].reviewer_note = params.notes;
      this.saveReviewQueue(queue);
    }

    // Ghi audit log
    this.recordAuditAction({
      id: `act-${Date.now()}`,
      resource_id: params.resourceId,
      action: params.action,
      actor_name: params.reviewerName,
      actor_role: params.reviewerRole,
      notes: params.notes,
      timestamp: new Date().toISOString()
    });

    return { ok: true };
  }

  /**
   * Ghi Audit Log bất biến
   */
  static recordAuditAction(action: ContentReviewAction): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_ACTIONS_KEY);
      const list: ContentReviewAction[] = stored ? JSON.parse(stored) : [];
      list.unshift(action);
      localStorage.setItem(STORAGE_ACTIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error recording audit action', e);
    }
  }

  static getAuditActions(resourceId?: string): ContentReviewAction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_ACTIONS_KEY);
      const list: ContentReviewAction[] = stored ? JSON.parse(stored) : [];
      if (resourceId) return list.filter(a => a.resource_id === resourceId);
      return list;
    } catch {
      return [];
    }
  }

  /**
   * Kích hoạt Job đồng bộ thủ công hoặc định kỳ
   */
  static triggerSyncJob(triggerType: ContentSyncJob['trigger_type'], triggeredBy: string, sourceId?: string): ContentSyncJob {
    const job: ContentSyncJob = {
      id: `job-${Date.now()}`,
      job_type: sourceId ? 'manual_single_source' : 'monthly_batch',
      trigger_type: triggerType,
      source_id: sourceId,
      source_name: sourceId ? this.getSources().find(s => s.id === sourceId)?.name : 'Tất cả các nguồn được duyệt',
      status: 'completed',
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      scanned_count: 4,
      discovered_count: 1,
      created_count: 1,
      updated_count: 0,
      duplicate_count: 0,
      conflict_count: 1,
      rejected_count: 0,
      error_count: 0,
      triggered_by: triggeredBy
    };

    const jobs = this.getSyncJobs();
    jobs.unshift(job);
    this.saveSyncJobs(jobs);

    return job;
  }
}
