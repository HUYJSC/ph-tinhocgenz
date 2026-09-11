import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  ShieldCheck,
  HardDrive,
  X,
  History,
  Radio
} from 'lucide-react';
import { SystemBackupService, SystemStorageMetrics, SystemAuditLog } from '../../services/systemBackupService';
import { soundFx } from '../../utils/audio';

interface SystemDataCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onDataRestored?: () => void;
}

export const SystemDataCenterModal: React.FC<SystemDataCenterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDataRestored
}) => {
  const [metrics, setMetrics] = useState<SystemStorageMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [activeSubView, setActiveSubView] = useState<'metrics' | 'backup_restore' | 'audit_logs'>('metrics');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = () => {
    const m = SystemBackupService.getStorageMetrics();
    setMetrics(m);
    setAuditLogs(SystemBackupService.getAuditLogs(50));
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  // Listen to sync events from other tabs
  useEffect(() => {
    const unsub = SystemBackupService.onSync(() => {
      refreshData();
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      SystemBackupService.downloadBackupFile(currentUser?.name || 'Super Admin');
      refreshData();
      soundFx.playVictory();
    } catch (e: any) {
      alert(`Lỗi xuất sao lưu: ${e.message}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (window.confirm('⚠️ CẢNH BÁO: Thao tác khôi phục sẽ nạp đè dữ liệu từ bản sao lưu vào CSDL hiện tại. Bạn có chắc chắn muốn tiến hành?')) {
        setIsRestoring(true);
        setTimeout(() => {
          const result = SystemBackupService.restoreFromBackup(content, currentUser?.name || 'Super Admin');
          setIsRestoring(false);
          setRestoreStatus(result);
          if (result.success) {
            soundFx.playVictory();
            refreshData();
            if (onDataRestored) onDataRestored();
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            soundFx.playIncorrect();
          }
        }, 600);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleForceSync = () => {
    SystemBackupService.broadcastEvent('FORCE_SYNC_ALL', { triggeredAt: Date.now() });
    refreshData();
    soundFx.playClick();
    alert('✓ Đã phát tín hiệu đồng bộ tức thì đến toàn bộ các tab và cửa sổ đang mở!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          background: 'var(--bg-card, #ffffff)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Trung Tâm Dữ Liệu & Vận Hành Bền Vững (Data Engine SSOT)
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Quản trị lưu trữ thực tế, sao lưu 1-click, khôi phục CSDL & đồng bộ đa tab tức thì.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveSubView('metrics')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubView === 'metrics' ? 'var(--accent-primary, #2563eb)' : 'transparent',
              color: activeSubView === 'metrics' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HardDrive size={14} />
            <span>Sức Khỏe Lưu Trữ & Chỉ Số</span>
          </button>

          <button
            onClick={() => setActiveSubView('backup_restore')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubView === 'backup_restore' ? 'var(--accent-primary, #2563eb)' : 'transparent',
              color: activeSubView === 'backup_restore' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            <span>Sao Lưu & Khôi Phục CSDL</span>
          </button>

          <button
            onClick={() => setActiveSubView('audit_logs')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubView === 'audit_logs' ? 'var(--accent-primary, #2563eb)' : 'transparent',
              color: activeSubView === 'audit_logs' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={14} />
            <span>Nhật Ký Thay Đổi ({auditLogs.length})</span>
          </button>
        </div>

        {/* VIEW 1: METRICS & SYSTEM HEALTH */}
        {activeSubView === 'metrics' && metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Status Banner */}
            <div style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: metrics.persistenceHealth === 'HEALTHY' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1.5px solid ${metrics.persistenceHealth === 'HEALTHY' ? '#10b981' : '#ef4444'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color={metrics.persistenceHealth === 'HEALTHY' ? '#10b981' : '#ef4444'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: metrics.persistenceHealth === 'HEALTHY' ? '#065f46' : '#991b1b' }}>
                    Trạng Thái Lưu Trữ: {metrics.persistenceHealth === 'HEALTHY' ? '🟢 BỀN VỮNG (DUAL PERSISTENCE ACTIVE)' : '⚠️ CẦN SAO LƯU'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Toàn bộ thay đổi đề thi, câu hỏi, tài khoản và học liệu được tự động ghi nhận ngay lập tức vào bộ nhớ an toàn.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleForceSync}
                className="btn btn-secondary"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Radio size={12} color="#2563eb" />
                <span>Đồng Bộ Đa Tab</span>
              </button>
            </div>

            {/* Quota Progress Bar */}
            <div style={{
              background: 'var(--bg-primary, #f8fafc)',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Dung lượng bộ nhớ đã sử dụng</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  {metrics.formattedSize} / 5.0 MB ({metrics.percentageUsed}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${metrics.percentageUsed}%`,
                  height: '100%',
                  background: metrics.percentageUsed > 80 ? '#ef4444' : metrics.percentageUsed > 50 ? '#f59e0b' : '#10b981',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Entity Counts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb' }}>{metrics.totalQuizzes}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Đề Thi Trong Kho</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{metrics.totalQuestions}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Câu Hỏi Khảo Thí</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#8b5cf6' }}>{metrics.totalStudents}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Học Viên Hệ Thống</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f59e0b' }}>{metrics.totalTeachers}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Giảng Viên THGZ</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#06b6d4' }}>{metrics.totalSchedules}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Lịch Học & Phòng LAB</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ec4899' }}>{metrics.totalResources}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Học Liệu Kiểm Duyệt</div>
              </div>
            </div>

            {/* Last Backup & Sync Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>Lần sao lưu gần nhất: <strong>{metrics.lastBackupAt ? new Date(metrics.lastBackupAt).toLocaleString('vi-VN') : 'Chưa có bản sao lưu nào'}</strong></span>
              <span>Đồng bộ hệ thống: <strong>{metrics.lastSyncAt}</strong></span>
            </div>
          </div>
        )}

        {/* VIEW 2: BACKUP & RESTORE ACTIONS */}
        {activeSubView === 'backup_restore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {restoreStatus && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: restoreStatus.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1.5px solid ${restoreStatus.success ? '#10b981' : '#ef4444'}`,
                color: restoreStatus.success ? '#065f46' : '#991b1b',
                fontSize: '0.82rem',
                fontWeight: 700
              }}>
                {restoreStatus.success ? '✓ ' : '✕ '}
                {restoreStatus.message}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Export Card */}
              <div style={{
                background: 'var(--bg-primary, #f8fafc)',
                padding: '18px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Download size={18} color="#2563eb" />
                    <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800 }}>
                      1. Xuất Bản Sao Lưu Toàn Bộ CSDL (.json)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Tải về toàn bộ snapshot dữ liệu: Đề thi, câu hỏi sửa, danh sách học viên, giảng viên, lịch học và học liệu. Lưu trữ trên máy tính hoặc Google Drive để không bao giờ mất dữ liệu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '8px'
                  }}
                >
                  <Download size={14} />
                  <span>Tải File Sao Lưu Ngay (1-Click)</span>
                </button>
              </div>

              {/* Import Card */}
              <div style={{
                background: 'var(--bg-primary, #f8fafc)',
                padding: '18px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Upload size={18} color="#10b981" />
                    <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800 }}>
                      2. Khôi Phục CSDL Từ File Sao Lưu (.json)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Nạp tệp `.json` đã sao lưu trước đó để phục hồi ngay toàn bộ dữ liệu trên thiết bị mới hoặc khi trình duyệt bị xóa cache. Hệ thống tự động kiểm tra checksum & schema an toàn.
                  </p>
                </div>

                <input
                  type="file"
                  accept=".json,application/json"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1.5px solid #10b981',
                    color: '#059669'
                  }}
                >
                  <Upload size={14} />
                  <span>{isRestoring ? 'Đang Khôi Phục Dữ Liệu...' : 'Chọn File Sao Lưu Để Khôi Phục'}</span>
                </button>
              </div>
            </div>

            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.08)',
              borderLeft: '4px solid #f59e0b',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              💡 <strong>Khuyến nghị từ Team Quản Lý Dự Án:</strong> Hãy tải bản sao lưu định kỳ vào cuối mỗi tuần hoặc trước khi thêm mới số lượng lớn học viên/đề thi để bảo toàn SSOT tuyệt đối.
            </div>
          </div>
        )}

        {/* VIEW 3: AUDIT LOGS */}
        {activeSubView === 'audit_logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Nhật ký ghi nhận bất biến mọi thay đổi dữ liệu trên hệ thống bởi Quản trị viên (50 thao tác gần nhất):
            </div>

            <div style={{
              maxHeight: '340px',
              overflowY: 'auto',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary, #f8fafc)'
            }}>
              {auditLogs.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Chưa có nhật ký thay đổi nào được ghi nhận.
                </div>
              ) : (
                auditLogs.map(log => {
                  const actionColor =
                    log.action === 'CREATE' ? '#10b981' :
                    log.action === 'UPDATE' ? '#2563eb' :
                    log.action === 'DELETE' ? '#ef4444' :
                    log.action === 'BACKUP_EXPORT' ? '#8b5cf6' :
                    log.action === 'BACKUP_RESTORE' ? '#f59e0b' : '#64748b';

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: `${actionColor}18`,
                          color: actionColor
                        }}>
                          {log.action}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(0,0,0,0.05)',
                          color: 'var(--text-secondary)'
                        }}>
                          {log.targetEntity}
                        </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {log.description}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        <span>{log.actor}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 22px', fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px' }}
          >
            Đóng Trung Tâm Dữ Liệu
          </button>
        </div>
      </div>
    </div>
  );
};
