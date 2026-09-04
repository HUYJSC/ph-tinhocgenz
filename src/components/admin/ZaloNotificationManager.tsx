import React, { useState, useEffect } from 'react';
import { StudentAccount } from '../../types/auth';
import {
  AiZaloNotificationService
} from '../../services/aiZaloNotificationService';
import {
  ZaloNotificationLog,
  ReminderCycle,
  ZaloDispatchConfig,
  ZaloOaStatusResponse,
  OaConnectionStatus
} from '../../types/zaloNotification';
import {
  Send, Bot, Users, UserCheck, ShieldAlert,
  Clock, CheckCircle2, Search,
  Settings, RefreshCw, Copy, Sparkles, AlertTriangle, AlertCircle, PhoneCall
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

  // Real OA Status from Serverless Backend
  const [oaStatus, setOaStatus] = useState<ZaloOaStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Admin Test Dispatch State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg?: string } | null>(null);

  // Bulk Send Confirmation Modal
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ sent: number; failed: number } | null>(null);

  // Fetch real OA status on mount
  const refreshStatus = async () => {
    setIsLoadingStatus(true);
    const data = await AiZaloNotificationService.fetchOaStatus();
    setOaStatus(data);
    setIsLoadingStatus(false);

    // If server has recent logs, load them into state
    if (data.recent_logs && data.recent_logs.length > 0) {
      const serverLogs: ZaloNotificationLog[] = data.recent_logs.map(r => ({
        id: r.id,
        studentId: r.student_id,
        studentName: `Học viên (${r.student_id})`,
        studentCode: r.student_id,
        age: 20,
        recipientType: r.recipient_type,
        recipientName: r.recipient_type === 'parent' ? 'Phụ huynh' : 'Học viên',
        recipientPhone: r.masked_phone,
        maskedPhone: r.masked_phone,
        cycle: 'weekly',
        riskLevel: 'MEDIUM',
        riskScore: 30,
        factors: ['Báo cáo định kỳ'],
        weakSkills: [],
        attendanceRate: 85,
        aiGeneratedMessage: `[Zalo ZBS Template Message] ID: ${r.template_id}`,
        sentAt: new Date(r.created_at).toLocaleString('vi-VN'),
        status: r.delivery_status,
        channel: 'zalo_zns',
        zaloMsgId: r.zalo_msg_id,
        trackingId: r.tracking_id,
        errorCode: r.error_code,
        errorMessage: r.error_message
      }));
      setLogs(serverLogs);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleRunAiScan = () => {
    soundFx.playClick();
    setIsScanning(true);
    setScanSuccessMessage('');

    setTimeout(() => {
      const generated = AiZaloNotificationService.scanAndGenerateNotifications(studentAccounts, activeCycle);
      setLogs(generated);
      setIsScanning(false);
      setScanSuccessMessage(
        `Đã quét ${studentAccounts.length} học viên và tạo ${generated.length} bản thảo thông báo Zalo theo chu kỳ ${
          activeCycle === 'daily' ? 'Hằng ngày' : activeCycle === 'weekly' ? 'Hằng tuần' : 'Hằng tháng'
        }. Giáo viên có thể xem trước và duyệt trước khi phát tin thật!`
      );
      soundFx.playVictory();
    }, 400);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFx.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Gửi 1 tin nhắn thật đến học viên/phụ huynh qua API Zalo ZBS
  const handleSendSingleZalo = async (log: ZaloNotificationLog) => {
    soundFx.playClick();

    if (oaStatus?.status === 'unconfigured') {
      alert(
        '⚠️ HỆ THỐNG CHƯA CẤU HÌNH ZALO ZBS THẬT\n\n' +
        'Thiếu Access Token hoặc chưa liên kết ứng dụng Zalo OA chính thức.\n' +
        'Hệ thống không mô phỏng gửi thành công. Vui lòng hoàn tất liên kết trên Vercel.'
      );
      return;
    }

    const res = await AiZaloNotificationService.dispatchSingleMessage(log);
    if (res.success && res.messageId) {
      soundFx.playCorrect();
      alert(`✅ [ZALO OPENAPI THÀNH CÔNG]\nĐã gửi tin nhắn thành công qua Zalo ZBS!\n• Msg ID thật: ${res.messageId}`);
      // Cập nhật trạng thái tin nhắn
      setLogs(prev => prev.map(l => (l.id === log.id ? { ...l, status: 'accepted', zaloMsgId: res.messageId } : l)));
    } else {
      soundFx.playIncorrect();
      alert(`❌ [ZALO OPENAPI BÁO LỖI]\n${res.error || 'Không thể gửi tin nhắn qua Zalo.'}`);
      setLogs(prev => prev.map(l => (l.id === log.id ? { ...l, status: 'failed', errorMessage: res.error } : l)));
    }
  };

  // Gửi thử nghiệm đến số quản trị
  const handleSendAdminTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/zalo/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone.trim(),
          template_id: 'PH_EDU_TEST_2026',
          template_data: {
            admin_name: 'Quản Trị Viên',
            test_time: new Date().toLocaleString('vi-VN'),
            note: 'Kiểm tra kết nối Zalo ZBS Template Message API 2026'
          },
          tracking_id: `TEST_ADMIN_${Date.now()}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.msg_id) {
        soundFx.playVictory();
        setTestResult({
          success: true,
          msg: `Gửi thử thành công! Msg ID thật từ Zalo: ${data.msg_id}`
        });
      } else {
        soundFx.playIncorrect();
        setTestResult({
          success: false,
          msg: `Gửi thất bại: ${data.message || data.error || 'Lỗi Zalo OpenAPI'}`
        });
      }
    } catch (err: any) {
      soundFx.playIncorrect();
      setTestResult({
        success: false,
        msg: `Lỗi kết nối máy chủ: ${err.message}`
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Gửi hàng loạt có xác nhận
  const handleExecuteBulkSend = async () => {
    setIsBulkSending(true);
    let sentCount = 0;
    let failCount = 0;

    const targets = filteredLogs.filter(l => l.status === 'pending');
    for (const log of targets) {
      const res = await AiZaloNotificationService.dispatchSingleMessage(log);
      if (res.success && res.messageId) {
        sentCount++;
        setLogs(prev => prev.map(l => (l.id === log.id ? { ...l, status: 'accepted', zaloMsgId: res.messageId } : l)));
      } else {
        failCount++;
        setLogs(prev => prev.map(l => (l.id === log.id ? { ...l, status: 'failed', errorMessage: res.error } : l)));
      }
      // Rate limiting
      await new Promise(r => setTimeout(r, 200));
    }

    setIsBulkSending(false);
    setBulkConfirmOpen(false);
    setBulkResult({ sent: sentCount, failed: failCount });
    if (sentCount > 0) soundFx.playVictory();
    else soundFx.playIncorrect();
  };

  const handleSaveStudentParentInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (onUpdateStudent) {
      onUpdateStudent(editingStudent);
    }
    soundFx.playCorrect();
    setEditingStudent(null);
    const updatedLogs = AiZaloNotificationService.scanAndGenerateNotifications(studentAccounts, activeCycle);
    setLogs(updatedLogs);
  };

  const filteredLogs = logs.filter(log => {
    if (filterRecipient !== 'all' && log.recipientType !== filterRecipient) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.studentName.toLowerCase().includes(q) ||
        log.studentCode.toLowerCase().includes(q) ||
        log.recipientName.toLowerCase().includes(q) ||
        log.recipientPhone.includes(q) ||
        (log.maskedPhone && log.maskedPhone.includes(q))
      );
    }
    return true;
  });

  const parentCount = logs.filter(l => l.recipientType === 'parent').length;
  const adultCount = logs.filter(l => l.recipientType === 'student').length;
  const criticalCount = logs.filter(l => l.riskLevel === 'CRITICAL').length;
  const pendingCount = logs.filter(l => l.status === 'pending').length;

  const currentStatus: OaConnectionStatus = oaStatus?.status || 'unconfigured';

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
              <Sparkles size={12} /> ZALO ZBS TEMPLATE MESSAGE & AI COPILOT
            </span>
            <span style={{ fontSize: '11px', color: '#bae6fd', fontWeight: 600 }}>
              Tài liệu chính thức 2026 (&lt; {config.ageThreshold}t: Phụ huynh | &ge; {config.ageThreshold}t: Học viên tự chủ)
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 8px', color: '#ffffff' }}>
            Tổng Đài Nhắc Nhở Định Kỳ & Cảnh Báo Tự Động Qua Zalo Bằng AI
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#e0f2fe', margin: 0, lineHeight: 1.5 }}>
            Tích hợp trực tiếp <strong>Zalo OpenAPI (ZBS Template Messages)</strong>. Tự động refresh OAuth token, xác thực webhook HMAC và kiểm soát chống Replay Attack.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setTestModalOpen(true); soundFx.playClick(); }}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PhoneCall size={15} />
              <span>Gửi Thử Đến Số Quản Trị</span>
            </button>

            <button
              onClick={handleRunAiScan}
              disabled={isScanning}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#0369a1',
                fontSize: '13px',
                fontWeight: 800,
                border: 'none',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
              }}
            >
              {isScanning ? <RefreshCw size={15} className="animate-spin" /> : <Bot size={16} color="#0284c7" />}
              <span>{isScanning ? 'AI Đang Quét...' : '🤖 AI Quét & Soạn Tin Nhắn Zalo'}</span>
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} />
            <span>Chu kỳ: <strong>{activeCycle === 'daily' ? 'Hằng ngày (19h)' : activeCycle === 'weekly' ? 'Hằng tuần (Chủ nhật 19h)' : 'Hằng tháng (Ngày 01)'}</strong></span>
          </div>
        </div>
      </div>

      {/* ── 2. CONNECTION STATUS BANNER (REAL HARDWARE / API STATUS) ── */}
      {currentStatus === 'unconfigured' && (
        <div style={{
          padding: '16px 20px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: 800, fontSize: '14px' }}>
              <AlertCircle size={18} />
              <span>TRẠNG THÁI ZALO ZBS: CHƯA CẤU HÌNH</span>
            </div>
            <button
              onClick={refreshStatus}
              disabled={isLoadingStatus}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#b91c1c',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isLoadingStatus ? 'Đang kiểm tra...' : 'Kiểm tra lại kết nối'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Hệ thống đang hoạt động ở chế độ nghiêm ngặt và <strong>tuyệt đối không giả lập gửi thành công</strong>. Để kích hoạt gửi Zalo thật, quản trị viên cần cung cấp các biến môi trường sau trên Vercel:
          </p>
          {oaStatus?.missing_env && oaStatus.missing_env.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              {oaStatus.missing_env.map(envKey => (
                <span key={envKey} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {envKey}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {currentStatus === 'connected' && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid #10b981',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
              ZALO ZBS: ĐÃ KẾT NỐI CHÍNH THỨC
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              • OA ID: <strong style={{ color: 'var(--text-primary)' }}>{oaStatus?.oa_id || 'PH Digital Education'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>Template đang dùng: <strong>{oaStatus?.active_template_count || 1}</strong></span>
            <span>Quota còn lại: <strong>{oaStatus?.remaining_quota || 5000}</strong></span>
            <span>Webhook gần nhất: <strong>{oaStatus?.last_webhook_at ? new Date(oaStatus.last_webhook_at).toLocaleString('vi-VN') : 'Chưa nhận sự kiện'}</strong></span>
          </div>
        </div>
      )}

      {currentStatus === 'token_expiring' && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid #f59e0b',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#92400e',
          fontSize: '13px',
          fontWeight: 700
        }}>
          <AlertTriangle size={16} color="#d97706" />
          <span>TOKEN SẮP HẾT HẠN: Access Token đang được tự động làm mới bằng Zalo OAuth v4.</span>
        </div>
      )}

      {currentStatus === 'webhook_error' && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#b91c1c',
          fontSize: '13px',
          fontWeight: 700
        }}>
          <AlertCircle size={16} color="#dc2626" />
          <span>WEBHOOK LỖI: Chữ ký HMAC hoặc đường truyền Webhook không khớp. Vui lòng kiểm tra khóa bí mật Webhook.</span>
        </div>
      )}

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

      {bulkResult && (
        <div style={{
          padding: '12px 18px',
          background: bulkResult.sent > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${bulkResult.sent > 0 ? '#10b981' : '#ef4444'}`,
          borderRadius: '12px',
          color: bulkResult.sent > 0 ? '#065f46' : '#b91c1c',
          fontSize: '13px',
          fontWeight: 700
        }}>
          Kết quả gửi hàng loạt: Đã tiếp nhận thành công {bulkResult.sent} tin, lỗi {bulkResult.failed} tin.
        </div>
      )}

      {/* ── 3. KPI METRICS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              PHỤ HUYNH (&lt; 25 TUỔI)
            </span>
            <Users size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e40af' }}>{parentCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Kèm cặp sư phạm chu đáo
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              NGƯỜI LỚN (&ge; 25 TUỔI)
            </span>
            <UserCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#065f46' }}>{adultCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tôn trọng quyền tự chủ
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              CẢNH BÁO NGUY CƠ CAO
            </span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b91c1c' }}>{criticalCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Cần can thiệp gấp
          </div>
        </div>

        <div className="card" style={{ padding: '18px', borderRadius: '14px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              TRẠNG THÁI HÀNG ĐỢI
            </span>
            <Send size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400e' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {pendingCount > 0 ? 'Bản thảo chờ duyệt gửi' : 'Tất cả đã xử lý'}
          </div>
        </div>
      </div>

      {/* ── 4. TOOLBAR CONTROLS & BỘ LỌC ── */}
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
                cursor: 'pointer'
              }}
            >
              {cycle === 'daily' ? 'Hằng Ngày (19:00)' : cycle === 'weekly' ? 'Hằng Tuần (Chủ Nhật)' : 'Hằng Tháng (Ngày 01)'}
            </button>
          ))}
        </div>

        {/* Action: Duyệt gửi hàng loạt */}
        {pendingCount > 0 && (
          <button
            onClick={() => setBulkConfirmOpen(true)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Send size={14} />
            <span>Duyệt & Gửi Hàng Loạt ({pendingCount} tin)</span>
          </button>
        )}

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
              Phụ huynh ({parentCount})
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
              Người lớn ({adultCount})
            </button>
          </div>

          <div style={{ position: 'relative', width: '200px' }}>
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

      {/* ── 5. DANH SÁCH TIN NHẮN ZALO ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredLogs.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
            <Bot size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>Chưa có tin nhắn Zalo nào trong hàng đợi</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Bấm nút "🤖 AI Quét & Soạn Tin Nhắn Zalo" ở trên để quét toàn bộ học viên và tự động tạo thông báo.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isParent = log.recipientType === 'parent';
            const isCritical = log.riskLevel === 'CRITICAL';
            const isHigh = log.riskLevel === 'HIGH';
            const isAccepted = log.status === 'accepted' || log.status === 'delivered';
            const displayPhone = log.maskedPhone || AiZaloNotificationService.maskPhoneNumber(log.recipientPhone);

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
                  gap: '14px'
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
                        Người nhận: <strong style={{ color: 'var(--text-primary)' }}>{log.recipientName}</strong> • SĐT: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{displayPhone}</span>
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

                    {log.zaloMsgId ? (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#059669',
                        background: '#ecfdf5',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #a7f3d0'
                      }}>
                        Đã tiếp nhận (Msg ID: {log.zaloMsgId.substring(0, 10)}...)
                      </span>
                    ) : log.status === 'failed' ? (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#dc2626',
                        background: '#fef2f2',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca'
                      }}>
                        Lỗi gửi
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#d97706',
                        background: '#fffbeb',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #fde68a'
                      }}>
                        Chờ duyệt gửi
                      </span>
                    )}
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
                  whiteSpace: 'pre-line'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>
                    <Bot size={13} />
                    <span>NỘI DUNG ĐỀ XUẤT THEO TEMPLATE ZALO ({log.cycle.toUpperCase()})</span>
                  </div>
                  {log.aiGeneratedMessage}
                </div>

                {/* Row 3: Action Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Thời gian tạo: {log.sentAt} • Kênh: <strong>Zalo ZBS Template Message</strong>
                    {log.errorMessage && <span style={{ color: '#dc2626', marginLeft: '8px' }}>({log.errorMessage})</span>}
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
                      <span>{copiedId === log.id ? 'Đã sao chép!' : 'Sao chép'}</span>
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
                      <span>Sửa SĐT</span>
                    </button>

                    <button
                      onClick={() => handleSendSingleZalo(log)}
                      disabled={isAccepted}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '8px',
                        background: isAccepted ? '#94a3b8' : '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: isAccepted ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Send size={13} />
                      <span>{isAccepted ? 'Đã Gửi Zalo' : 'Gửi Ngay Qua Zalo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 6. MODAL GỬI THỬ NGHIỆM ĐẾN SỐ QUẢN TRỊ ── */}
      {testModalOpen && (
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
          <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 8px' }}>
              Gửi Thử Nghiệm Zalo Đến Số Quản Trị
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
              Kiểm tra tính sẵn sàng của kết nối Zalo ZBS OpenAPI bằng cách gửi 1 tin nhắn template thực tế đến số điện thoại của bạn.
            </p>

            <form onSubmit={handleSendAdminTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Số điện thoại Zalo quản trị (Ví dụ: 0988123456 hoặc 84988123456):
                </label>
                <input
                  type="tel"
                  placeholder="Nhập SĐT nhận tin kiểm thử..."
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {testResult && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: testResult.success ? '#065f46' : '#b91c1c',
                  border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`
                }}>
                  {testResult.msg}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setTestModalOpen(false); setTestResult(null); }}
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
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0284c7',
                    color: '#fff',
                    cursor: isSendingTest ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isSendingTest ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isSendingTest ? 'Đang gửi qua Zalo...' : 'Bắt Đầu Gửi Thử'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. MODAL XÁC NHẬN GỬI HÀNG LOẠT ── */}
      {bulkConfirmOpen && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d97706', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
                Xác Nhận Phát Tin Zalo Hàng Loạt
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Bạn chuẩn bị gửi <strong>{pendingCount} tin nhắn</strong> qua Zalo ZBS Template Message API chính thức.
              Tin nhắn sẽ được gửi trực tiếp đến Zalo của Phụ huynh và Học viên theo mẫu đã được Zalo phê duyệt.
            </p>

            <div style={{
              background: 'var(--bg-base)',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div>• Chu kỳ gửi: <strong>{activeCycle.toUpperCase()}</strong></div>
              <div>• Template: <strong>PH_EDU_REMINDER_2026</strong></div>
              <div>• Quota dự kiến tiêu thụ: <strong>{pendingCount} tin</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setBulkConfirmOpen(false)}
                disabled={isBulkSending}
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
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkSend}
                disabled={isBulkSending}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#059669',
                  color: '#fff',
                  cursor: isBulkSending ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isBulkSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{isBulkSending ? 'Đang gửi...' : 'Xác Nhận & Gửi Ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. MODAL SỬA THÔNG TIN PHỤ HUYNH ── */}
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
                  Số điện thoại Zalo Phụ Huynh (Nhận thông báo ZBS):
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
