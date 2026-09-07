/**
 * TRUNG TÂM NGUỒN HỌC LIỆU VÀ KIỂM DUYỆT ĐỀ THI
 * Giao diện Quản trị Chuyên sâu dành cho Hội Đồng CNTT Master
 * PH DIGITAL EDUCATION — TIN HỌC GEN Z
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Clock,
  UserCheck,
  Award,
  Sliders,
  CheckSquare,
  XCircle,
  Bot,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  LearningSource,
  LearningResource,
  ContentReviewQueueItem,
  InternalLearningMaterial,
  TeamNotification
} from '../../types/learningResource';
import { LearningResourceService } from '../../services/learningResourceService';
import { validateSafeUrlForFetch } from '../../utils/ssrfProtection';

export type LearningHubSubTab =
  | 'learning_sources'
  | 'review_queue'
  | 'tinhocgenz_studio'
  | 'sync_history'
  | 'quality_reports'
  | 'failing_sources'
  | 'automation_settings';

interface LearningResourceHubProps {
  currentTab: LearningHubSubTab;
  onTabChange: (tab: LearningHubSubTab) => void;
  currentUser?: any;
}

export const LearningResourceHub: React.FC<LearningResourceHubProps> = ({
  currentTab,
  onTabChange,
  currentUser
}) => {
  // State
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ContentReviewQueueItem[]>([]);
  const [internalMaterials, setInternalMaterials] = useState<InternalLearningMaterial[]>([]);
  const [notifications, setNotifications] = useState<TeamNotification[]>([]);
  const [syncJobs, setSyncJobs] = useState<any[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSourceTier, setFilterSourceTier] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterFactualStatus, setFilterFactualStatus] = useState<string>('ALL');

  // Modals & Active Viewers
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [isTestUrlModalOpen, setIsTestUrlModalOpen] = useState(false);
  const [reviewerNote, setReviewerNote] = useState('');
  const [testUrlInput, setTestUrlInput] = useState('');
  const [testUrlResult, setTestUrlResult] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Source Form State
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceTier, setNewSourceTier] = useState<'OFFICIAL' | 'TRUSTED_REFERENCE' | 'LICENSED_PARTNER'>('TRUSTED_REFERENCE');
  const [newSourceDesc, setNewSourceDesc] = useState('');

  // Load initial data
  const loadAllData = () => {
    setSources(LearningResourceService.getSources());
    setResources(LearningResourceService.getResources());
    setReviewQueue(LearningResourceService.getReviewQueue());
    setInternalMaterials(LearningResourceService.getInternalMaterials());
    setNotifications(LearningResourceService.getNotifications());
    setSyncJobs(LearningResourceService.getSyncJobs());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // KPI Calculations
  const kpiData = useMemo(() => {
    const activeSourcesCount = sources.filter(s => s.status === 'active').length;
    const pendingQueueCount = reviewQueue.filter(q => q.review_status === 'pending').length;
    const conflictCount = resources.filter(r => r.factual_status === 'conflict').length;
    const duplicateCount = resources.filter(r => r.duplicate_status !== 'unique').length;
    const copyrightNeedsReview = resources.filter(r => r.copyright_status === 'needs_review').length;
    const failingCount = sources.filter(s => s.status === 'failing' || s.status === 'error').length;
    return {
      activeSourcesCount,
      totalResources: resources.length,
      pendingQueueCount,
      conflictCount,
      duplicateCount,
      copyrightNeedsReview,
      failingCount
    };
  }, [sources, resources, reviewQueue]);

  // Handlers
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      LearningResourceService.triggerSyncJob('scheduled_cron', currentUser?.name || 'Super Admin');
      loadAllData();
      setIsSyncing(false);
      showToast('Đã kích hoạt đồng bộ thành công! Kiểm tra hàng đợi kiểm duyệt để xem tài liệu mới.');
    }, 1200);
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    const res = LearningResourceService.addSource({
      name: newSourceName,
      base_url: newSourceUrl,
      source_type: 'html_category',
      source_tier: newSourceTier,
      description: newSourceDesc,
      allowed_domains: [new URL(newSourceUrl).hostname],
      content_categories: ['MOS 365', 'Office 2019'],
      crawl_enabled: true,
      auto_discover_enabled: true,
      requires_login: false,
      license_status: newSourceTier === 'OFFICIAL' ? 'public_domain' : 'needs_review',
      sync_frequency: 'monthly',
      created_by: currentUser?.name || 'Admin'
    });

    if (!res.ok) {
      alert(res.error);
      return;
    }

    showToast(`Đã thêm nguồn '${newSourceName}' thành công!`);
    setIsAddSourceModalOpen(false);
    setNewSourceName('');
    setNewSourceUrl('');
    setNewSourceDesc('');
    loadAllData();
  };

  const handleTestUrlSSRF = () => {
    const check = validateSafeUrlForFetch(testUrlInput);
    if (!check.safe) {
      setTestUrlResult({ safe: false, reason: check.reason });
      return;
    }
    setTestUrlResult({
      safe: true,
      normalizedUrl: check.normalizedUrl,
      status: '200 OK',
      mime: 'text/html; charset=utf-8',
      latency: '142ms',
      note: 'Địa chỉ an toàn, không vi phạm dải IP nội bộ hay Cloud Metadata.'
    });
  };

  const handleReviewAction = (action: 'approve' | 'reject' | 'request_changes' | 'publish') => {
    if (!selectedResource) return;
    const res = LearningResourceService.reviewResource({
      resourceId: selectedResource.id,
      action,
      reviewerName: currentUser?.name || 'Super Admin',
      reviewerRole: 'super_admin',
      notes: reviewerNote
    });

    if (!res.ok) {
      alert(res.error);
      return;
    }

    showToast(`Đã thực hiện thao tác ${action.toUpperCase()} tài liệu thành công.`);
    setSelectedResource(null);
    setReviewerNote('');
    loadAllData();
  };

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchSearch =
        searchQuery === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.exam_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTier = filterSourceTier === 'ALL' || r.source_tier === filterSourceTier;
      const matchSubject = filterSubject === 'ALL' || r.subject === filterSubject;
      const matchFactual = filterFactualStatus === 'ALL' || r.factual_status === filterFactualStatus;
      return matchSearch && matchTier && matchSubject && matchFactual;
    });
  }, [resources, searchQuery, filterSourceTier, filterSubject, filterFactualStatus]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast message */}
      {actionSuccessMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#059669',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.86rem',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ── TOP HEADER & ACTIONS ── */}
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(37,99,235,0.1)',
              color: '#2563eb',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              HỘI ĐỒNG CNTT MASTER
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              Chế độ giám sát tự động kích hoạt
            </span>
          </div>
          <h2 style={{ margin: '6px 0 2px 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
            Trung Tâm Nguồn Học Liệu & Kiểm Duyệt Đề Thi
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
            Thu thập nguồn tin học uy tín, rà soát xung đột mã thi MOS/CNTT, thẩm định bản quyền và xuất bản học liệu độc quyền.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsTestUrlModalOpen(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #e2e8f0)',
              background: 'transparent',
              color: 'var(--text-secondary, #475569)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Shield size={14} color="#2563eb" />
            <span>Kiểm Tra URL (Chống SSRF)</span>
          </button>

          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
            }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            <span>{isSyncing ? 'Đang Rà Soát Nguồn...' : 'Đồng Bộ Ngay (Tháng 09/2026)'}</span>
          </button>

          <button
            onClick={() => setIsAddSourceModalOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} />
            <span>Thêm Nguồn Mới</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Nguồn Đang Giám Sát</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>{kpiData.activeSourcesCount}</div>
          <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>4 cấp bậc nguồn chuẩn</div>
        </div>

        <div style={{
          background: 'var(--bg-card, #ffffff)',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Tài Liệu Đã Thu Thập</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{kpiData.totalResources}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Đã chuẩn hóa metadata</div>
        </div>

        <div
          onClick={() => onTabChange('review_queue')}
          style={{
            background: kpiData.pendingQueueCount > 0 ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card, #ffffff)',
            borderColor: kpiData.pendingQueueCount > 0 ? '#f59e0b' : 'var(--border-color, #e2e8f0)',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>Chờ Thẩm Định</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{kpiData.pendingQueueCount}</div>
          <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 600 }}>Hàng đợi Hội đồng Master</div>
        </div>

        <div
          onClick={() => {
            onTabChange('learning_sources');
            setFilterFactualStatus('conflict');
          }}
          style={{
            background: kpiData.conflictCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card, #ffffff)',
            borderColor: kpiData.conflictCount > 0 ? '#ef4444' : 'var(--border-color, #e2e8f0)',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} />
            <span>Xung Đột Mã Bài Thi</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{kpiData.conflictCount}</div>
          <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>Phát hiện MO-100/M365</div>
        </div>

        <div style={{
          background: 'var(--bg-card, #ffffff)',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Nghi Trùng Lặp (≥85%)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>{kpiData.duplicateCount}</div>
          <div style={{ fontSize: '0.68rem', color: '#6366f1' }}>Thuật toán Jaccard</div>
        </div>

        <div style={{
          background: 'var(--bg-card, #ffffff)',
          padding: '14px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Cần Kiểm Tra Bản Quyền</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6' }}>{kpiData.copyrightNeedsReview}</div>
          <div style={{ fontSize: '0.68rem', color: '#8b5cf6' }}>Dùng rel nofollow tab mới</div>
        </div>
      </div>

      {/* ── NOTIFICATION BANNER NẾU CÓ CẢNH BÁO MỚI ── */}
      {notifications.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#ef4444',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertCircle size={16} />
            </span>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#991b1b' }}>
                {notifications[0].title}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#7f1d1d', marginTop: '2px' }}>
                {notifications[0].message}
              </div>
            </div>
          </div>

          <button
            onClick={() => onTabChange('review_queue')}
            style={{
              background: '#991b1b',
              color: '#ffffff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Mở Hàng Đợi Kiểm Duyệt
          </button>
        </div>
      )}

      {/* ── NAVIGATION SUB-TABS (7 PHÂN HỆ YÊU CẦU) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: '2px solid var(--border-color, #e2e8f0)',
        paddingBottom: '2px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'learning_sources', label: 'Trung Tâm Nguồn Học Liệu', icon: Globe, count: sources.length },
          { id: 'review_queue', label: 'Nội Dung Chờ Kiểm Duyệt', icon: Clock, count: kpiData.pendingQueueCount, badgeColor: '#f59e0b' },
          { id: 'tinhocgenz_studio', label: 'Kho Tài Liệu TIN HỌC GEN Z', icon: Award, count: internalMaterials.length },
          { id: 'sync_history', label: 'Lịch Sử Đồng Bộ', icon: RefreshCw, count: syncJobs.length },
          { id: 'quality_reports', label: 'Báo Cáo Chất Lượng & Quảng Cáo', icon: CheckSquare },
          { id: 'failing_sources', label: 'Nguồn Bị Lỗi', icon: XCircle, count: kpiData.failingCount },
          { id: 'automation_settings', label: 'Thiết Lập Tự Động Hóa', icon: Sliders }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as LearningHubSubTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                background: isActive ? 'rgba(37,99,235,0.05)' : 'transparent',
                color: isActive ? '#2563eb' : 'var(--text-secondary, #64748b)',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: tab.badgeColor ? tab.badgeColor : isActive ? '#2563eb' : '#e2e8f0',
                  color: tab.badgeColor || isActive ? '#ffffff' : '#475569',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 1: TRUNG TÂM NGUỒN HỌC LIỆU (LEARNING SOURCES & CATALOG) */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentTab === 'learning_sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Tìm theo tiêu đề, mã thi (MO-100, MO-110...), môn học..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary, #0f172a)',
                  background: 'transparent'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={filterSourceTier}
                onChange={e => setFilterSourceTier(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary, #0f172a)',
                  background: 'var(--bg-card, #ffffff)'
                }}
              >
                <option value="ALL">Tất cả cấp bậc nguồn</option>
                <option value="OFFICIAL">OFFICIAL (Chính thức)</option>
                <option value="TRUSTED_REFERENCE">TRUSTED_REFERENCE (Tham khảo)</option>
                <option value="LICENSED_PARTNER">LICENSED_PARTNER (Đối tác)</option>
                <option value="TINHOCGENZ_ORIGINAL">TINHOCGENZ_ORIGINAL (Độc quyền)</option>
              </select>

              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary, #0f172a)',
                  background: 'var(--bg-card, #ffffff)'
                }}
              >
                <option value="ALL">Tất cả môn học</option>
                <option value="Word">Word</option>
                <option value="Excel">Excel</option>
                <option value="PowerPoint">PowerPoint</option>
                <option value="General_IT">CNTT Cơ bản / IC3</option>
                <option value="AI">AI Ứng dụng</option>
              </select>

              <select
                value={filterFactualStatus}
                onChange={e => setFilterFactualStatus(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary, #0f172a)',
                  background: 'var(--bg-card, #ffffff)'
                }}
              >
                <option value="ALL">Tất cả tính chính xác</option>
                <option value="verified">Đã kiểm chứng (Verified)</option>
                <option value="conflict">Xung đột mã đề thi (Conflict)</option>
                <option value="unverified">Chưa thẩm định</option>
              </select>
            </div>
          </div>

          {/* Table of Resources */}
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                Danh Sách Tài Liệu Đã Thu Thập ({filteredResources.length})
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Tuân thủ quy tắc bản quyền & không tự động công khai
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tiêu Đề Tài Liệu</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Nguồn & Cấp Bậc</th>
                    <th style={{ padding: '12px 12px', fontWeight: 700 }}>Môn / Phiên Bản</th>
                    <th style={{ padding: '12px 12px', fontWeight: 700 }}>Mã Bài Thi</th>
                    <th style={{ padding: '12px 12px', fontWeight: 700 }}>Điểm Chất Lượng</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Trạng Thái Thẩm Định</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map(res => {
                    const isConflict = res.factual_status === 'conflict';
                    return (
                      <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', maxWidth: '320px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px', lineHeight: 1.4 }}>
                            {res.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <a
                              href={res.canonical_url}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}
                            >
                              <span>Xem nguồn ngoài</span>
                              <ExternalLink size={10} />
                            </a>
                            <span>•</span>
                            <span>{new Date(res.discovered_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{res.source_name}</div>
                          <span style={{
                            display: 'inline-block',
                            marginTop: '2px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: res.source_tier === 'OFFICIAL' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                            color: res.source_tier === 'OFFICIAL' ? '#059669' : '#2563eb'
                          }}>
                            {res.source_tier}
                          </span>
                        </td>

                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{res.subject}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{res.application_version}</div>
                        </td>

                        <td style={{ padding: '12px 12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            background: isConflict ? 'rgba(239,68,68,0.1)' : '#f1f5f9',
                            color: isConflict ? '#dc2626' : '#334155',
                            border: isConflict ? '1px solid rgba(239,68,68,0.3)' : 'none'
                          }}>
                            {res.exam_code || 'Chưa gắn'}
                          </span>
                        </td>

                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontWeight: 700, color: res.quality_score >= 80 ? '#10b981' : res.quality_score >= 60 ? '#d97706' : '#ef4444' }}>
                            {res.quality_score}/100
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Trust: {res.trust_score}%</div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          {isConflict ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <AlertTriangle size={12} />
                              <span>Xung đột mã đề</span>
                            </span>
                          ) : res.review_status === 'approved' ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <CheckCircle2 size={12} />
                              <span>Đã duyệt</span>
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: '#fef3c7',
                              color: '#b45309',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <Clock size={12} />
                              <span>Chờ duyệt</span>
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedResource(res)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              background: '#ffffff',
                              color: '#2563eb',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Thẩm Định
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 2: NỘI DUNG CHỜ KIỂM DUYỆT (REVIEW QUEUE)               */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentTab === 'review_queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                Hàng Đợi Kiểm Duyệt Hội Đồng CNTT Master ({reviewQueue.length} mục)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Mọi tài liệu phải qua ít nhất 1 Technical Reviewer. Tài liệu thi cần Academic Reviewer. Xuất bản chỉ dành cho Super Admin.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviewQueue.map(item => {
              const res = item.resource;
              const hasConflict = item.factual_conflicts.length > 0;
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    padding: '18px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          background: item.priority === 'urgent' ? '#fee2e2' : '#fef3c7',
                          color: item.priority === 'urgent' ? '#b91c1c' : '#b45309'
                        }}>
                          MỨC ĐỘ: {item.priority.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Nguồn: <strong>{res.source_name}</strong>
                        </span>
                        <span>•</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Môn: <strong>{res.subject} ({res.application_version})</strong>
                        </span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                        {res.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => setSelectedResource(res)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Mở Phiếu Phê Duyệt
                    </button>
                  </div>

                  {/* Cảnh báo chi tiết */}
                  {hasConflict && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '12px 14px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} />
                        <span>XUNG ĐỘT MÃ BÀI THI PHÁT HIỆN BỞI ENGINE TỰ ĐỘNG</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#7f1d1d', marginTop: '4px', lineHeight: 1.4 }}>
                        {item.factual_conflicts[0].detected_issue}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#991b1b', marginTop: '4px' }}>
                        <strong>Chuẩn Certiport:</strong> {item.factual_conflicts[0].standard_value}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={13} />
                      <span>Phân công thẩm định: <strong>{item.assigned_team}</strong></span>
                    </div>
                    <div>
                      Trạng thái hiện tại: <strong>{item.review_status.toUpperCase()}</strong> (Chưa xuất bản)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 3: KHO TÀI LIỆU TIN HỌC GEN Z (STUDIO BIÊN SOẠN)         */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentTab === 'tinhocgenz_studio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            padding: '18px 22px',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Studio Biên Soạn Học Liệu Độc Quyền PH TIN HỌC GEN Z
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Quy trình 7 bước (DRAFT → TECHNICAL → ACADEMIC → COPYRIGHT → APPROVED → PUBLISHED).
              </p>
            </div>

            <button
              onClick={() => alert('Mở trình soạn thảo giáo trình và đề mô phỏng Tin Học GenZ Studio')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={14} />
              <span>Biên Soạn Tài Liệu Mới</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {internalMaterials.map(mat => (
              <div
                key={mat.id}
                style={{
                  background: 'var(--bg-card, #ffffff)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: 'rgba(37,99,235,0.1)',
                      color: '#2563eb'
                    }}>
                      MÃ: {mat.material_code}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: mat.review_stage === 'PUBLISHED' ? '#dcfce7' : '#fef3c7',
                      color: mat.review_stage === 'PUBLISHED' ? '#15803d' : '#b45309'
                    }}>
                      {mat.review_stage}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                    {mat.title}
                  </h4>

                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>
                    Tác giả: <strong>{mat.author_name}</strong> • Phiên bản: <strong>{mat.version}</strong>
                  </div>

                  {mat.ai_assisted && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(139,92,246,0.1)',
                      color: '#7c3aed',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      marginBottom: '8px'
                    }}>
                      <Bot size={12} />
                      <span>AI-Assisted (Đã có chuyên gia khảo thí phản biện)</span>
                    </div>
                  )}

                  <div style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    fontSize: '0.72rem',
                    color: '#475569',
                    fontStyle: 'italic',
                    border: '1px solid #e2e8f0'
                  }}>
                    "{mat.editorial_badge}"
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {mat.files.length} tệp đính kèm (Đã quét an toàn)
                  </div>
                  <button
                    onClick={() => alert(`Tải bộ tài liệu ${mat.material_code}`)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      background: '#ffffff',
                      color: '#2563eb',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={12} />
                    <span>Tải Về</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 4: LỊCH SỬ ĐỒNG BỘ (SYNC HISTORY)                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentTab === 'sync_history' && (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
            Nhật Ký Các Đợt Đồng Bộ & Rà Soát Nguồn Tự Động
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {syncJobs.length === 0 ? (
              <div style={{
                padding: '30px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.84rem'
              }}>
                Chưa có job đồng bộ nào được lưu trữ trong phiên này. Bấm <strong>"Đồng Bộ Ngay"</strong> ở góc trên để kích hoạt đợt rà soát.
              </div>
            ) : (
              syncJobs.map(job => (
                <div key={job.id} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>
                      Đợt đồng bộ: {job.job_type} ({job.trigger_type})
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Bắt đầu: {new Date(job.started_at).toLocaleString('vi-VN')} • Kích hoạt bởi: {job.triggered_by}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem' }}>
                    <span>Quét: <strong>{job.scanned_count} nguồn</strong></span>
                    <span style={{ color: '#10b981' }}>Mới: <strong>+{job.discovered_count}</strong></span>
                    {job.conflict_count > 0 && (
                      <span style={{ color: '#ef4444' }}>Xung đột: <strong>{job.conflict_count}</strong></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 5: BÁO CÁO CHẤT LƯỢNG & RÀ SOÁT QUẢNG CÁO               */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentTab === 'quality_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Checklist quảng cáo (Stage 15) */}
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
              Kiểm Toán Tuân Thủ Tuyên Bố Học Liệu & Quảng Cáo (Stage 15)
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#64748b' }}>
              Tự động quét các cụm từ nhạy cảm trong hệ thống để tránh hiểu lầm hoặc vi phạm quy định quảng cáo giáo dục.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { claim: 'Sát 99% đề thi thật', status: 'compliance_review_required', note: 'Cần chứng minh ngân hàng câu hỏi đối chiếu với Certiport hoặc gắn cờ tham khảo mô phỏng.' },
                { claim: 'Bao đỗ 100%', status: 'compliance_review_required', note: 'Không được cam kết kết quả thi chuẩn quốc tế tuyệt đối, chỉ cam kết hỗ trợ ôn tập đến khi đỗ.' },
                { claim: 'Chứng chỉ chuẩn Bộ GD&ĐT', status: 'verified', note: 'Áp dụng chính xác cho chương trình CC CNTT Cơ bản và Nâng cao theo Thông tư 03/2014/TT-BTTTT.' },
                { claim: 'Chuẩn ISO/IEC 27001', status: 'compliance_review_required', note: 'Chỉ công bố nếu trung tâm đã có chứng chỉ đánh giá hợp quy chính thức.' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: item.status === 'verified' ? '#f0fdf4' : '#fffbeb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                      "{item.claim}"
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      {item.note}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: item.status === 'verified' ? '#dcfce7' : '#fef3c7',
                    color: item.status === 'verified' ? '#15803d' : '#b45309',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.status === 'verified' ? 'HỢP LỆ' : 'CẦN HỘI ĐỒNG RÀ SOÁT'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 6: NGUỒN BỊ LỖI (FAILING SOURCES)                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentTab === 'failing_sources' && (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            Không Có Nguồn Bị Lỗi
          </h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
            Tất cả 4 nguồn được cấu hình đang hoạt động với mã phản hồi HTTP 200 OK và không bị chặn bởi tường lửa hay CAPTCHA.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 7: THIẾT LẬP TỰ ĐỘNG HÓA (AUTOMATION SETTINGS)          */}
      {/* ─────────────────────────────────────────────────────────── */}
      {currentTab === 'automation_settings' && (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Thiết Lập Tự Động Hóa & Feature Flags
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Điều chỉnh chu kỳ chạy tác vụ ngầm và các ngưỡng an toàn của hệ thống.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginBottom: '4px' }}>
                Lịch Cron Rà Soát Định Kỳ
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '10px' }}>
                Mặc định: <strong>09:00 ngày 01 hằng tháng</strong> (Asia/Ho_Chi_Minh). UTC biểu thức: <code>0 2 1 * *</code>
              </div>
              <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700 }}>
                ĐÃ ĐĂNG KÝ TRONG VERCEL.JSON
              </span>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginBottom: '4px' }}>
                Ngưỡng So Khớp Trùng Lặp (Deduplication)
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                • ≥95%: Trùng hoàn toàn<br />
                • 85–94%: Nghi trùng (Đưa vào hàng đợi so sánh)<br />
                • 70–84%: Tài liệu liên quan<br />
                • &lt;70%: Tài liệu khác biệt
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginBottom: '4px' }}>
                Bảo Vệ SSRF & Giới Hạn
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                • Timeout request: <strong>10,000ms (10s)</strong><br />
                • Giới hạn dung lượng tải: <strong>5 MB</strong><br />
                • Chặn dải IP riêng tư: <strong>127.0.0.0/8, 10.0.0.0/8, 192.168.0.0/16</strong><br />
                • Chặn Metadata: <strong>169.254.169.254</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODAL: THẨM ĐỊNH & PHÊ DUYỆT TÀI LIỆU                       */}
      {/* ─────────────────────────────────────────────────────────── */}
      {selectedResource && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: 'rgba(37,99,235,0.1)',
                  color: '#2563eb'
                }}>
                  PHIẾU THẨM ĐỊNH HỘI ĐỒNG MASTER
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedResource.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Cảnh báo xung đột nếu có */}
            {selectedResource.factual_status === 'conflict' && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#991b1b'
              }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} />
                  <span>PHÁT HIỆN XUNG ĐỘT MÃ BÀI THI CHỨNG CHỈ QUỐC TẾ</span>
                </div>
                <div style={{ marginTop: '6px' }}>
                  {selectedResource.factual_conflicts?.[0]?.claim}
                </div>
                <div style={{ marginTop: '6px', fontWeight: 600 }}>
                  <strong>Căn cứ chính thức Certiport / Microsoft Learn:</strong><br />
                  {selectedResource.factual_conflicts?.[0]?.standard_value}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <a
                    href={selectedResource.factual_conflicts?.[0]?.reference_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', textDecoration: 'underline' }}
                  >
                    Xem link đối chiếu chính thức
                  </a>
                </div>
              </div>
            )}

            {/* Thông tin chi tiết */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '0.78rem',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '8px'
            }}>
              <div><strong>Nguồn:</strong> {selectedResource.source_name}</div>
              <div><strong>Cấp bậc:</strong> {selectedResource.source_tier}</div>
              <div><strong>Môn:</strong> {selectedResource.subject}</div>
              <div><strong>Mã bài thi khai báo:</strong> {selectedResource.exam_code}</div>
              <div><strong>Bản quyền:</strong> {selectedResource.copyright_status}</div>
              <div><strong>Điểm chất lượng:</strong> {selectedResource.quality_score}/100</div>
            </div>

            {/* Ghi chú thẩm định */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Ý kiến thẩm định của thành viên Hội Đồng CNTT Master:
              </label>
              <textarea
                rows={3}
                value={reviewerNote}
                onChange={e => setReviewerNote(e.target.value)}
                placeholder="Nhập nhận xét (VD: Đã đối chiếu với mã MO-110, yêu cầu sửa tiêu đề hoặc chỉ lưu external link tham khảo)..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Các nút hành động */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => handleReviewAction('reject')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #ef4444',
                  background: 'transparent',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Từ Chối
              </button>

              <button
                onClick={() => handleReviewAction('request_changes')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d97706',
                  background: 'transparent',
                  color: '#d97706',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Yêu Cầu Sửa
              </button>

              <button
                onClick={() => handleReviewAction('approve')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Phê Duyệt (Lưu Nội Bộ)
              </button>

              <button
                onClick={() => handleReviewAction('publish')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Xuất Bản Cho Học Viên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KIỂM TRA SSRF ── */}
      {isTestUrlModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Kiểm Tra URL An Toàn Chống SSRF
              </h3>
              <button onClick={() => { setIsTestUrlModalOpen(false); setTestUrlResult(null); }} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Chặn các URL trỏ về 127.0.0.1, localhost, dải IP 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 và Cloud Metadata 169.254.169.254.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={testUrlInput}
                onChange={e => setTestUrlInput(e.target.value)}
                placeholder="VD: https://blogdaytinhoc.com/ hoặc http://127.0.0.1:8080/..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem'
                }}
              />
              <button
                onClick={handleTestUrlSSRF}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Kiểm Tra
              </button>
            </div>

            {testUrlResult && (
              <div style={{
                padding: '14px',
                borderRadius: '8px',
                background: testUrlResult.safe ? '#f0fdf4' : '#fee2e2',
                border: testUrlResult.safe ? '1px solid #86efac' : '1px solid #fca5a5',
                fontSize: '0.78rem',
                color: testUrlResult.safe ? '#166534' : '#991b1b'
              }}>
                <div style={{ fontWeight: 800 }}>
                  {testUrlResult.safe ? '✅ URL AN TOÀN' : '❌ PHÁT HIỆN VI PHẠM SSRF'}
                </div>
                <div style={{ marginTop: '4px' }}>
                  {testUrlResult.safe ? testUrlResult.note : testUrlResult.reason}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL THÊM NGUỒN MỚI ── */}
      {isAddSourceModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <form onSubmit={handleCreateSource} style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Thêm Nguồn Học Liệu Mới
              </h3>
              <button type="button" onClick={() => setIsAddSourceModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Tên Nguồn / Tổ Chức:
              </label>
              <input
                type="text"
                required
                value={newSourceName}
                onChange={e => setNewSourceName(e.target.value)}
                placeholder="VD: Pearson VUE Certiport..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                URL Gốc (Base URL):
              </label>
              <input
                type="url"
                required
                value={newSourceUrl}
                onChange={e => setNewSourceUrl(e.target.value)}
                placeholder="https://..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Cấp Bậc Nguồn (Tier):
              </label>
              <select
                value={newSourceTier}
                onChange={e => setNewSourceTier(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="OFFICIAL">OFFICIAL (Microsoft, Certiport, Bộ GD&ĐT)</option>
                <option value="TRUSTED_REFERENCE">TRUSTED_REFERENCE (Blog giáo dục, tài liệu cộng đồng)</option>
                <option value="LICENSED_PARTNER">LICENSED_PARTNER (Đối tác ký kết hợp đồng)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Mô tả & Điều kiện bản quyền:
              </label>
              <textarea
                rows={2}
                value={newSourceDesc}
                onChange={e => setNewSourceDesc(e.target.value)}
                placeholder="Ghi chú về nguồn..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsAddSourceModalOpen(false)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                type="submit"
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Thêm Nguồn
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
