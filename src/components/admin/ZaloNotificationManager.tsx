import React, { useState, useEffect } from 'react';
import { StudentAccount } from '../../types/auth';
import {
  AiZaloNotificationService
} from '../../services/aiZaloNotificationService';
import {
  ZaloNotificationLog,
  ReminderCycle,
  ZaloDispatchConfig
} from '../../types/zaloNotification';
import {
  Send, Bot, Users, UserCheck, ShieldAlert,
  Clock, CheckCircle2, Search,
  Settings, RefreshCw, Copy, Sparkles
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface ZaloNotificationManagerProps {
  studentAccounts: StudentAccount[];
  onUpdateStudent?: (updated: StudentAccount) => void;
}

export const ZaloNotificationManager: React.FC<ZaloNotificationManagerProps> = ({
  studentAccounts,
  onUpdateStudent
}) => {
  const [config] = useState<ZaloDispatchConfig>(AiZaloNotificationService.getConfig());
  const [activeCycle, setActiveCycle] = useState<ReminderCycle>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRecipient, setFilterRecipient] = useState<'all' | 'parent' | 'student'>('all');
  const [logs, setLogs] = useState<ZaloNotificationLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load existing logs or generate initial preview
  useEffect(() => {
    const existing = AiZaloNotificationService.getLogs();
    if (existing.length > 0) {
      setLogs(existing);
    } else {
      // Auto initial scan for demonstration
      const initialLogs = AiZaloNotificationService.scanAndGenerateNotifications(studentAccounts, 'weekly');
      setLogs(initialLogs);
    }
  }, [studentAccounts]);

  const handleRunAiScan = () => {
    soundFx.playClick();
    setIsScanning(true);
    setScanSuccessMessage('');

    setTimeout(() => {
      const generated = AiZaloNotificationService.scanAndGenerateNotifications(studentAccounts, activeCycle);
      setLogs(generated);
      setIsScanning(false);
      setScanSuccessMessage(`Đã quét thành công ${studentAccounts.length} học viên và tạo ${generated.length} thông báo Zalo theo chu kỳ ${activeCycle === 'daily' ? 'Hằng ngày' : activeCycle === 'weekly' ? 'Hằng tuần' : 'Hằng tháng'}!`);
      soundFx.playVictory();
    }, 600);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFx.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTestZalo = async (log: ZaloNotificationLog) => {
    soundFx.playClick();
    const res = await AiZaloNotificationService.dispatchSingleMessage(log);
    if (res.success) {
      soundFx.playCorrect();
      alert(`[MÔ PHỎNG ZALO ZNS] Đã gửi thành công tin nhắn đến: ${log.recipientName} (${log.recipientPhone})\nMã ZNS Ticket: ${res.messageId}`);
    }
  };

  const handleSaveStudentParentInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (onUpdateStudent) {
      onUpdateStudent(editingStudent);
    }
    soundFx.playCorrect();
    setEditingStudent(null);
    // Re-run scan with updated data
    const updatedLogs = AiZaloNotificationService.scanAndGenerateNotifications(studentAccounts, activeCycle);
    setLogs(updatedLogs);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filterRecipient !== 'all' && log.recipientType !== filterRecipient) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.studentName.toLowerCase().includes(q) ||
        log.studentCode.toLowerCase().includes(q) ||
        log.recipientName.toLowerCase().includes(q) ||
        log.recipientPhone.includes(q)
      );
    }
    return true;
  });

  const parentCount = logs.filter(l => l.recipientType === 'parent').length;
  const adultCount = logs.filter(l => l.recipientType === 'student').length;
  const criticalCount = logs.filter(l => l.riskLevel === 'CRITICAL').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── 1. HEADER BANNER THƯƠNG HIỆU ZALO AI ── */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%)',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '3px 10px',
              borderRadius: '6px',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={12} /> ZALO CLOUD ZNS & AI COPILOT
            </span>
            <span style={{ fontSize: '11px', color: '#bae6fd', fontWeight: 600 }}>
              Phân luồng theo độ tuổi (&lt; {config.ageThreshold}t: Phụ huynh | &ge; {config.ageThreshold}t: Học viên tự chủ)
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 8px', color: '#ffffff' }}>
            Tổng Đài Nhắc Nhở Định Kỳ & Cảnh Báo Tự Động Qua Zalo Bằng AI
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#e0f2fe', margin: 0, lineHeight: 1.5 }}>
            Hệ thống tự động phát hiện học viên yếu: <strong>Dưới 25 tuổi</strong> gửi thông báo kèm cặp cho <strong>Phụ huynh</strong>; <strong>Từ 25 tuổi trở lên</strong> gửi tin nhắn đồng hành công việc trực tiếp cho <strong>Người học</strong> (tôn trọng quyền tự chủ, không giám sát kiểu học sinh).
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <button
            onClick={handleRunAiScan}
            disabled={isScanning}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#0369a1',
              fontSize: '14px',
              fontWeight: 800,
              border: 'none',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <Bot size={18} color="#0284c7" />}
            <span>{isScanning ? 'AI Đang Quét Dữ Liệu...' : '🤖 AI Quét & Soạn Tin Nhắn Zalo'}</span>
          </button>
          <div style={{ fontSize: '12px', color: '#bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} />
            <span>Chu kỳ: <strong>{activeCycle === 'daily' ? 'Hằng ngày (19h)' : activeCycle === 'weekly' ? 'Hằng tuần (Chủ nhật)' : 'Hằng tháng (Ngày 01)'}</strong></span>
          </div>
        </div>
      </div>

      {scanSuccessMessage && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10b981',
          borderRadius: '12px',
          color: '#065f46',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{scanSuccessMessage}</span>
        </div>
      )}

      {/* ── 2. KPI METRICS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Phụ huynh (< 25 tuổi) */}
        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              PHỤ HUYNH (&lt; 25 TUỔI)
            </span>
            <Users size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e40af' }}>{parentCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Nhận tin báo tình hình & phối hợp kèm cặp
          </div>
        </div>

        {/* Metric 2: Người đi làm (>= 25 tuổi) */}
        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              NGƯỜI LỚN (&ge; 25 TUỔI)
            </span>
            <UserCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#065f46' }}>{adultCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gửi trực tiếp cá nhân, tôn trọng tự chủ
          </div>
        </div>

        {/* Metric 3: Mức Nguy Cơ Rất Cao */}
        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              CẢNH BÁO NGUY CƠ CAO
            </span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b91c1c' }}>{criticalCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Vắng học, điểm thấp, cần can thiệp gấp
          </div>
        </div>

        {/* Metric 4: Trạng thái ZNS */}
        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              KÊNH PHÁT TIN
            </span>
            <Send size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e', marginTop: '4px' }}>
            Zalo ZNS / Official Account
          </div>
          <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            <span>Sẵn sàng kết nối Webhook</span>
          </div>
        </div>
      </div>

      {/* ── 3. TOOLBAR CONTROLS & BỘ LỌC ── */}
      <div className="card" style={{ padding: '16px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Cycle Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-base)', padding: '4px', borderRadius: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', padding: '0 8px' }}>
            Chu kỳ:
          </span>
          {(['daily', 'weekly', 'monthly'] as ReminderCycle[]).map(cycle => (
            <button
              key={cycle}
              onClick={() => {
                soundFx.playClick();
                setActiveCycle(cycle);
                const generated = AiZaloNotificationService.scanAndGenerateNotifications(studentAccounts, cycle);
                setLogs(generated);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeCycle === cycle ? '#0284c7' : 'transparent',
                color: activeCycle === cycle ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: activeCycle === cycle ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cycle === 'daily' ? 'Hằng Ngày (19:00)' : cycle === 'weekly' ? 'Hằng Tuần (Chủ Nhật)' : 'Hằng Tháng (Ngày 01)'}
            </button>
          ))}
        </div>

        {/* Filter Recipient & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setFilterRecipient('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: filterRecipient === 'all' ? 'var(--brand)' : 'var(--bg-card)',
                color: filterRecipient === 'all' ? '#fff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Tất cả ({logs.length})
            </button>
            <button
              onClick={() => setFilterRecipient('parent')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: filterRecipient === 'parent' ? '#1e40af' : 'var(--bg-card)',
                color: filterRecipient === 'parent' ? '#fff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Phụ huynh (&lt; 25t) ({parentCount})
            </button>
            <button
              onClick={() => setFilterRecipient('student')}
              style={{
                padding: '6px 12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: filterRecipient === 'student' ? '#065f46' : 'var(--bg-card)',
                color: filterRecipient === 'student' ? '#fff' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Người lớn (&ge; 25t) ({adultCount})
            </button>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Tìm học viên, SĐT..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', minHeight: '34px', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* ── 4. DANH SÁCH TIN NHẮN ZALO ĐÃ TỔNG HỢP BẰNG AI ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredLogs.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
            <Bot size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>Chưa có tin nhắn Zalo nào cần gửi</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Bấm nút "🤖 AI Quét & Soạn Tin Nhắn Zalo" ở trên để quét toàn bộ học viên và tự động tạo thông báo.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isParent = log.recipientType === 'parent';
            const isCritical = log.riskLevel === 'CRITICAL';
            const isHigh = log.riskLevel === 'HIGH';

            return (
              <div
                key={log.id}
                className="card"
                style={{
                  padding: '20px 24px',
                  borderRadius: '16px',
                  borderLeft: `5px solid ${isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#3b82f6'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Row 1: Student / Recipient Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: isParent ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      color: isParent ? '#2563eb' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '15px'
                    }}>
                      {isParent ? 'PH' : 'HV'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {log.studentName}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ({log.studentCode})
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isParent ? '#dbeafe' : '#dcfce7',
                          color: isParent ? '#1e40af' : '#166534',
                          border: `1px solid ${isParent ? '#bfdbfe' : '#bbf7d0'}`
                        }}>
                          {isParent ? `Độ tuổi: ${log.age}t (Gửi Phụ Huynh)` : `Độ tuổi: ${log.age}t (Gửi Trực Tiếp)`}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Người nhận Zalo: <strong style={{ color: 'var(--text-primary)' }}>{log.recipientName}</strong> • SĐT: <span style={{ fontFamily: 'var(--font-mono)' }}>{log.recipientPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: isCritical ? 'rgba(239, 68, 68, 0.15)' : isHigh ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: isCritical ? '#dc2626' : isHigh ? '#d97706' : '#2563eb'
                    }}>
                      {isCritical ? '🚨 NGUY CƠ RẤT CAO' : isHigh ? '⚠️ CẦN NHẮC NHỞ' : '✅ ĐẠT CHUẨN'}
                    </span>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#ecfdf5',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0'
                    }}>
                      ZNS Sẵn sàng
                    </span>
                  </div>
                </div>

                {/* Row 2: AI Message Bubble */}
                <div style={{
                  background: 'var(--bg-base)',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-muted)',
                  fontSize: '13.5px',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-line',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>
                    <Bot size={13} />
                    <span>NỘI DUNG TIN NHẮN ZALO DO AI TỔNG HỢP ({log.cycle.toUpperCase()} DIGEST)</span>
                  </div>
                  {log.aiGeneratedMessage}
                </div>

                {/* Row 3: Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Thời gian tạo: {log.sentAt} • Kênh: <strong>Zalo Official Account</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleCopyMessage(log.id, log.aiGeneratedMessage)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: copiedId === log.id ? '#10b981' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {copiedId === log.id ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                      <span>{copiedId === log.id ? 'Đã sao chép!' : 'Sao chép tin nhắn'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const targetStudent = studentAccounts.find(s => s.id === log.studentId);
                        if (targetStudent) setEditingStudent(targetStudent);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Settings size={13} />
                      <span>Sửa SĐT Phụ Huynh</span>
                    </button>

                    <button
                      onClick={() => handleSendTestZalo(log)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '8px',
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                      }}
                    >
                      <Send size={13} />
                      <span>Gửi Thử Nghiệm Zalo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 5. MODAL SỬA THÔNG TIN PHỤ HUYNH & ĐỘ TUỔI HỌC VIÊN ── */}
      {editingStudent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 16px' }}>
              Cấu Hình Liên Hệ Phụ Huynh: {editingStudent.name}
            </h3>

            <form onSubmit={handleSaveStudentParentInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Năm sinh học viên (Tính tuổi phân luồng &lt; 25t):
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 2004 (22 tuổi)"
                  value={editingStudent.birthYear || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, birthYear: parseInt(e.target.value) || undefined })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Họ & Tên Phụ Huynh:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bác Nguyễn Văn Long"
                  value={editingStudent.parentName || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Số điện thoại Zalo Phụ Huynh (Nhận thông báo ZNS):
                </label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0988123456"
                  value={editingStudent.parentPhone || editingStudent.parentZalo || ''}
                  onChange={e => setEditingStudent({ ...editingStudent, parentPhone: e.target.value, parentZalo: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 800
                  }}
                >
                  Lưu & Cập Nhật Zalo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
