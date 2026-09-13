import React, { useState, useEffect, useRef } from 'react';
import { DigitalCertificate } from '../../types/edtech';
import { StudentAccount, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { CertificateTemplate, TemplateFieldConfig } from '../../types/certificateTemplate';
import { CertificateService, DEFAULT_SYSTEM_TEMPLATES } from '../../services/certificateService';
import { CertificateViewerModal } from '../certificates/CertificateViewerModal';
import { CertificateCanvasRenderer } from '../certificates/CertificateCanvasRenderer';
import { ALL_TRACK_OPTIONS } from './AdminPortal';
import {
  Award, Plus, Search, Edit3, Trash2, ShieldCheck, ShieldAlert,
  Eye, Copy, Check, Upload, Sliders, RotateCcw,
  Sparkles, Layers, ArrowLeft
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface CertificateManagerProps {
  studentAccounts?: StudentAccount[];
  currentUserRole?: string;
}

export const CertificateManager: React.FC<CertificateManagerProps> = ({
  studentAccounts = [],
  currentUserRole: _currentUserRole = 'admin'
}) => {
  // ── STATE CHÍNH ──
  const [activeMainTab, setActiveMainTab] = useState<'ledger' | 'templates' | 'analytics'>('ledger');
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'revoked'>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  // Modals State
  const [viewingCert, setViewingCert] = useState<DigitalCertificate | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<DigitalCertificate | null>(null);
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  // Template Designer State
  const [activeDesignerTemplateId, setActiveDesignerTemplateId] = useState<string>('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [designerTemplate, setDesignerTemplate] = useState<CertificateTemplate | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<keyof CertificateTemplate['fields']>('studentName');

  // Form Issue Certificate State
  const [issueForm, setIssueForm] = useState<{
    selectedStudentId: string;
    studentName: string;
    studentCode: string;
    track: string;
    courseTitle: string;
    finalScore: number;
    honorsTitle: string;
    templateId: string;
    issueDate: string;
    signatoryName: string;
    signatoryTitle: string;
  }>({
    selectedStudentId: '',
    studentName: '',
    studentCode: '',
    track: 'office-fast-3in1',
    courseTitle: 'Kỹ Năng Tin Học Văn Phòng (Word • Excel • PowerPoint)',
    finalScore: 90,
    honorsTitle: 'Hạng Giỏi - Khảo Thí Chuẩn',
    templateId: '',
    issueDate: new Date().toISOString().split('T')[0],
    signatoryName: 'ThS. Đinh Huy',
    signatoryTitle: 'Giám Đốc Khảo Thí'
  });

  // Tải dữ liệu ban đầu
  const refreshData = () => {
    const certList = CertificateService.getAllCertificates();
    const tplList = CertificateService.getAllTemplates();
    setCertificates(certList);
    setTemplates(tplList);
    if (tplList.length > 0 && !activeDesignerTemplateId) {
      setActiveDesignerTemplateId(tplList[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Tự động gán template mặc định khi mở modal cấp
  useEffect(() => {
    if (templates.length > 0 && !issueForm.templateId) {
      const def = templates.find(t => t.isDefault) || templates[0];
      setIssueForm(prev => ({ ...prev, templateId: def.id }));
    }
  }, [templates]);

  // Xử lý chọn học viên trong form cấp chứng chỉ
  const handleSelectStudentForIssue = (studentId: string) => {
    const st = studentAccounts.find(s => s.id === studentId);
    if (st) {
      const tr = st.programTrack || 'office-fast-3in1';
      setIssueForm(prev => ({
        ...prev,
        selectedStudentId: studentId,
        studentName: st.name,
        studentCode: st.studentCode,
        track: tr,
        courseTitle: TRACK_LABELS[tr] || tr
      }));
    } else {
      setIssueForm(prev => ({
        ...prev,
        selectedStudentId: ''
      }));
    }
  };

  // Tự động tính xếp loại theo điểm
  const handleScoreChange = (score: number) => {
    let honors = 'Hoàn Thành Khóa Học';
    if (score >= 95) honors = 'Thủ Khoa Xuất Sắc';
    else if (score >= 85) honors = 'Hạng Giỏi - Khảo Thí Chuẩn';
    else if (score >= 75) honors = 'Hạng Khá - Đạt Chuẩn';
    setIssueForm(prev => ({ ...prev, finalScore: score, honorsTitle: honors }));
  };

  // Gửi Cấp Chứng Chỉ Mới
  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.studentName.trim() || !issueForm.studentCode.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và mã số học viên!');
      return;
    }

    CertificateService.issueCertificate({
      studentName: issueForm.studentName.trim(),
      studentCode: issueForm.studentCode.trim(),
      track: issueForm.track,
      courseTitle: issueForm.courseTitle.trim(),
      finalScore: issueForm.finalScore,
      honorsTitle: issueForm.honorsTitle.trim(),
      templateId: issueForm.templateId,
      issueDate: issueForm.issueDate,
      signatoryName: issueForm.signatoryName.trim(),
      signatoryTitle: issueForm.signatoryTitle.trim()
    });

    soundFx.playCorrect();
    setIsIssueModalOpen(false);
    refreshData();
  };

  // Gửi Cập Nhật Chỉnh Sửa Chứng Chỉ
  const handleSaveEditCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    CertificateService.updateCertificate(editingCert.certificateId, {
      studentName: editingCert.studentName,
      studentCode: editingCert.studentCode,
      courseTitle: editingCert.courseTitle,
      track: editingCert.track,
      finalScore: editingCert.finalScore,
      honorsTitle: editingCert.honorsTitle,
      templateId: editingCert.templateId,
      issueDate: editingCert.issueDate,
      signatoryName: editingCert.signatoryName,
      signatoryTitle: editingCert.signatoryTitle
    });

    soundFx.playCorrect();
    setEditingCert(null);
    refreshData();
  };

  // Chuyển đổi trạng thái Thu hồi / Kích hoạt lại
  const handleToggleRevoke = (cert: DigitalCertificate) => {
    if (cert.status === 'valid') {
      const reason = window.prompt('Nhập lý do thu hồi chứng chỉ (nếu có):', 'Thu hồi theo quyết định khảo thí');
      if (reason !== null) {
        CertificateService.revokeCertificate(cert.certificateId, reason);
        soundFx.playIncorrect();
        refreshData();
      }
    } else {
      if (window.confirm(`Bạn có chắc chắn muốn khôi phục chứng chỉ ${cert.certificateId} sang trạng thái Hợp lệ?`)) {
        CertificateService.reactivateCertificate(cert.certificateId);
        soundFx.playCorrect();
        refreshData();
      }
    }
  };

  // Xóa chứng chỉ
  const handleDeleteCert = (certId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN chứng chỉ ${certId}? Thao tác này không thể hoàn tác.`)) {
      CertificateService.deleteCertificate(certId);
      soundFx.playClick();
      refreshData();
    }
  };

  // Sao chép link tra cứu
  const handleCopyLink = (certId: string) => {
    const url = `https://hoctructuyen.tinhocgenz.io.vn/verify/${certId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedCertId(certId);
    soundFx.playClick();
    setTimeout(() => setCopiedCertId(null), 2000);
  };

  // ── TEMPLATE DESIGNER & UPLOAD ──
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi người dùng tải ảnh khung mẫu cá nhân lên
  const handleUploadBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP, SVG)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const newTemplateId = `custom-tpl-${Date.now()}`;
      const defaultFields = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_TEMPLATES[0].fields));

      const newTpl: CertificateTemplate = {
        id: newTemplateId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        description: 'Khung mẫu tải lên từ máy tính của Quản trị viên',
        backgroundImageUrl: base64Data,
        aspectRatio: 'landscape_a4',
        isDefault: false,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: defaultFields
      };

      CertificateService.saveTemplate(newTpl);
      soundFx.playCorrect();
      refreshData();
      setActiveDesignerTemplateId(newTemplateId);
      setDesignerTemplate(newTpl);
      setIsEditingTemplate(true);
    };
    reader.readAsDataURL(file);
  };

  // Mở trình thiết kế vị trí chữ cho 1 khung mẫu
  const handleOpenDesigner = (tpl: CertificateTemplate) => {
    setDesignerTemplate(JSON.parse(JSON.stringify(tpl)));
    setActiveDesignerTemplateId(tpl.id);
    setIsEditingTemplate(true);
    soundFx.playClick();
  };

  // Lưu cấu hình tọa độ trường chữ của template
  const handleSaveDesigner = () => {
    if (!designerTemplate) return;
    CertificateService.saveTemplate(designerTemplate);
    soundFx.playCorrect();
    setIsEditingTemplate(false);
    refreshData();
  };

  // Cập nhật cấu hình của 1 trường chữ đang chọn
  const handleUpdateFieldConfig = (updates: Partial<TemplateFieldConfig>) => {
    if (!designerTemplate) return;
    setDesignerTemplate(prev => {
      if (!prev) return prev;
      const curFields = { ...prev.fields };
      (curFields as any)[selectedFieldKey] = {
        ...(curFields as any)[selectedFieldKey],
        ...updates
      };
      return { ...prev, fields: curFields };
    });
  };

  // Lọc danh sách chứng chỉ
  const filteredCerts = certificates.filter(c => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesTrack = trackFilter === 'all' || c.track === trackFilter;
    return matchesSearch && matchesStatus && matchesTrack;
  });

  // Mẫu xem thử cho Designer
  const mockCertForDesigner: DigitalCertificate = {
    certificateId: 'TGZ-MOS-2026-88888',
    studentName: 'NGUYỄN VĂN AN',
    studentCode: 'TGZ-2026-001',
    courseTitle: 'KỸ NĂNG TIN HỌC VĂN PHÒNG CHUẨN QUỐC TẾ MOS',
    track: 'office-fast-3in1',
    issueDate: new Date().toISOString().split('T')[0],
    finalScore: 98,
    honorsTitle: 'Thủ Khoa Xuất Sắc',
    verificationUrl: 'https://hoctructuyen.tinhocgenz.io.vn/verify/TGZ-MOS-2026-88888',
    status: 'valid',
    signatoryName: 'ThS. Đinh Huy',
    signatoryTitle: 'Giám Đốc Khảo Thí'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      {/* ── HEADER TIÊU ĐỀ CHÍNH ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)'
          }}>
            <Award size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Trung Tâm Quản Lý Khung Mẫu & Cấp Phát Chứng Chỉ
            </h1>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0' }}>
              Tải khung phôi mẫu cá nhân • Căn chỉnh tọa độ trực quan • Cấp phát & Chỉnh sửa chứng chỉ số kèm Bằng chứng Blockchain
            </p>
          </div>
        </div>

        {/* Nút hành động đầu trang */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadBackground}
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            <Upload size={16} color="#2563eb" />
            <span>Tải Khung Mẫu Lên (Ảnh Phôi)</span>
          </button>

          <button
            onClick={() => { setIsIssueModalOpen(true); soundFx.playClick(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
            }}
          >
            <Plus size={16} />
            <span>Cấp Chứng Chỉ Mới</span>
          </button>
        </div>
      </div>

      {/* ── THANH ĐIỀU HƯỚNG SUB-TABS ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => { setActiveMainTab('ledger'); setIsEditingTemplate(false); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeMainTab === 'ledger' ? '#ffffff' : 'transparent',
            color: activeMainTab === 'ledger' ? '#d97706' : '#64748b',
            fontWeight: activeMainTab === 'ledger' ? 800 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            borderBottom: activeMainTab === 'ledger' ? '3px solid #d97706' : '3px solid transparent',
            marginBottom: '-4px'
          }}
        >
          <Award size={16} />
          <span>Sổ Cái Chứng Chỉ Đã Cấp ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('templates')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeMainTab === 'templates' ? '#ffffff' : 'transparent',
            color: activeMainTab === 'templates' ? '#2563eb' : '#64748b',
            fontWeight: activeMainTab === 'templates' ? 800 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            borderBottom: activeMainTab === 'templates' ? '3px solid #2563eb' : '3px solid transparent',
            marginBottom: '-4px'
          }}
        >
          <Layers size={16} />
          <span>Quản Lý Khung Mẫu & Thiết Kế ({templates.length})</span>
        </button>

        <button
          onClick={() => { setActiveMainTab('analytics'); setIsEditingTemplate(false); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeMainTab === 'analytics' ? '#ffffff' : 'transparent',
            color: activeMainTab === 'analytics' ? '#059669' : '#64748b',
            fontWeight: activeMainTab === 'analytics' ? 800 : 600,
            fontSize: '14px',
            cursor: 'pointer',
            borderBottom: activeMainTab === 'analytics' ? '3px solid #059669' : '3px solid transparent',
            marginBottom: '-4px'
          }}
        >
          <Sparkles size={16} />
          <span>Báo Cáo Khảo Thí & Blockchain</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: SỔ CÁI CHỨNG CHỈ (CERTIFICATE LEDGER & ISSUANCE)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'ledger' && (
        <div>
          {/* Bộ lọc tìm kiếm */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Tìm học viên, mã SV, số hiệu chứng chỉ, môn thi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155'
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="valid">Chỉ chứng chỉ Hợp Lệ</option>
                <option value="revoked">Chứng chỉ Đã Thu Hồi</option>
              </select>

              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  maxWidth: '220px'
                }}
              >
                <option value="all">Tất cả chương trình</option>
                {ALL_TRACK_OPTIONS.map(tr => (
                  <option key={tr.id} value={tr.id}>{tr.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bảng dữ liệu chứng chỉ */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            {filteredCerts.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Award size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', margin: 0 }}>
                  Chưa có chứng chỉ nào phù hợp
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 18px' }}>
                  Bạn có thể bấm "Cấp Chứng Chỉ Mới" để bắt đầu cấp phát cho học viên.
                </p>
                <button
                  onClick={() => setIsIssueModalOpen(true)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cấp chứng chỉ đầu tiên
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 16px' }}>Số Hiệu & Khung Mẫu</th>
                    <th style={{ padding: '12px 16px' }}>Học Viên</th>
                    <th style={{ padding: '12px 16px' }}>Chương Trình Đào Tạo</th>
                    <th style={{ padding: '12px 16px' }}>Kết Quả / Danh Hiệu</th>
                    <th style={{ padding: '12px 16px' }}>Ngày Cấp</th>
                    <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.map((cert) => {
                    const tpl = templates.find(t => t.id === cert.templateId) || templates[0];
                    const isValid = cert.status === 'valid';

                    return (
                      <tr
                        key={cert.certificateId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isValid ? '#ffffff' : 'rgba(239, 68, 68, 0.03)',
                          transition: 'background 0.15s'
                        }}
                      >
                        {/* Số hiệu */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 800, color: '#1e40af', fontFamily: 'monospace' }}>
                            {cert.certificateId}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Khung: {tpl?.name || 'Mặc định'}
                          </div>
                        </td>

                        {/* Học viên */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{cert.studentName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Mã: {cert.studentCode}</div>
                        </td>

                        {/* Chương trình */}
                        <td style={{ padding: '12px 16px', maxWidth: '240px' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{cert.courseTitle}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Mã môn: {cert.track}</div>
                        </td>

                        {/* Điểm số */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: cert.finalScore >= 85 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                            color: cert.finalScore >= 85 ? '#059669' : '#2563eb',
                            fontWeight: 800,
                            fontSize: '12px'
                          }}>
                            {cert.finalScore}/100
                          </span>
                          {cert.honorsTitle && (
                            <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
                              {cert.honorsTitle}
                            </div>
                          )}
                        </td>

                        {/* Ngày cấp */}
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          {cert.issueDate}
                        </td>

                        {/* Trạng thái */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: isValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isValid ? '#059669' : '#dc2626'
                          }}>
                            {isValid ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                            <span>{isValid ? 'Hợp lệ' : 'Đã thu hồi'}</span>
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {/* Nút Xem & Xuất ảnh */}
                            <button
                              onClick={() => { setViewingCert(cert); soundFx.playClick(); }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#1e293b',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                              title="Xem trước và Tải ảnh PNG / In ấn A4"
                            >
                              <Eye size={13} />
                              <span>Xem</span>
                            </button>

                            {/* Nút Chỉnh sửa */}
                            <button
                              onClick={() => { setEditingCert(JSON.parse(JSON.stringify(cert))); soundFx.playClick(); }}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #bfdbfe',
                                background: '#eff6ff',
                                color: '#2563eb',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                              title="Chỉnh sửa thông tin chứng chỉ"
                            >
                              <Edit3 size={13} />
                              <span>Sửa</span>
                            </button>

                            {/* Nút Thu hồi / Phục hồi */}
                            <button
                              onClick={() => handleToggleRevoke(cert)}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                background: isValid ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                color: isValid ? '#dc2626' : '#059669',
                                cursor: 'pointer'
                              }}
                              title={isValid ? 'Thu hồi chứng chỉ' : 'Kích hoạt lại chứng chỉ'}
                            >
                              <RotateCcw size={13} />
                            </button>

                            {/* Nút Sao chép link tra cứu */}
                            <button
                              onClick={() => handleCopyLink(cert.certificateId)}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'rgba(100, 116, 139, 0.1)',
                                color: copiedCertId === cert.certificateId ? '#059669' : '#64748b',
                                cursor: 'pointer'
                              }}
                              title="Sao chép liên kết tra cứu"
                            >
                              {copiedCertId === cert.certificateId ? <Check size={13} /> : <Copy size={13} />}
                            </button>

                            {/* Nút Xóa */}
                            <button
                              onClick={() => handleDeleteCert(cert.certificateId)}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: '#ef4444',
                                cursor: 'pointer'
                              }}
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: QUẢN LÝ KHUNG MẪU & THIẾT KẾ (TEMPLATE STUDIO)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'templates' && (
        <div>
          {!isEditingTemplate ? (
            <div>
              {/* Danh sách Khung mẫu */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                {templates.map(tpl => (
                  <div
                    key={tpl.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: tpl.isDefault ? '2px solid #d97706' : '1px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Thumbnail Xem Trước Khung */}
                    <div style={{
                      aspectRatio: '1.414 / 1',
                      background: '#f8fafc',
                      position: 'relative',
                      overflow: 'hidden',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <div style={{ transform: 'scale(0.38)', transformOrigin: 'top left', width: '263%', pointerEvents: 'none' }}>
                        <CertificateCanvasRenderer
                          certificate={mockCertForDesigner}
                          template={tpl}
                          showActions={false}
                        />
                      </div>

                      {tpl.isDefault && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#d97706',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}>
                          Mặc định
                        </div>
                      )}
                    </div>

                    {/* Chi tiết Khung */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                            {tpl.name}
                          </h4>
                          {tpl.isSystem ? (
                            <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                              Hệ thống
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#2563eb' }}>
                              Đã tải lên
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '6px 0 12px', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                          {tpl.description || 'Khung phôi chứng chỉ tiêu chuẩn.'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => handleOpenDesigner(tpl)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#1e293b',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Sliders size={13} color="#2563eb" />
                          <span>Căn Chỉnh Chữ</span>
                        </button>

                        {!tpl.isDefault && (
                          <button
                            onClick={() => { CertificateService.setDefaultTemplate(tpl.id); refreshData(); soundFx.playCorrect(); }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #fde68a',
                              background: '#fffbeb',
                              color: '#b45309',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Đặt làm khung mẫu mặc định"
                          >
                            Đặt Mặc Định
                          </button>
                        )}

                        {!tpl.isSystem && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa khung mẫu "${tpl.name}"?`)) {
                                CertificateService.deleteTemplate(tpl.id);
                                refreshData();
                                soundFx.playClick();
                              }
                            }}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              cursor: 'pointer'
                            }}
                            title="Xóa mẫu này"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── VISUAL COORDINATES DESIGNER (WYSIWYG) ── */
            designerTemplate && (
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setIsEditingTemplate(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      <ArrowLeft size={14} /> Quay lại
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                      Căn Chỉnh Tọa Độ Văn Bản: {designerTemplate.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setIsEditingTemplate(false)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSaveDesigner}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      Lưu Cấu Hình Khung
                    </button>
                  </div>
                </div>

                {/* Bố cục 2 cột: Preview bên trái, Bảng điều khiển bên phải */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'start' }}>
                  {/* Cột Trực Quan Live Preview */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', alignSelf: 'flex-start' }}>
                      👁️ Xem trước kết quả tức thì (Live Interactive Preview):
                    </div>
                    <div style={{ width: '100%', maxWidth: '750px' }}>
                      <CertificateCanvasRenderer
                        certificate={mockCertForDesigner}
                        template={designerTemplate}
                        showActions={false}
                      />
                    </div>
                  </div>

                  {/* Cột Điều Khiển Thông Số (Controls) */}
                  <div style={{
                    background: '#ffffff',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        1. Chọn trường thông tin cần điều chỉnh:
                      </label>
                      <select
                        value={selectedFieldKey}
                        onChange={(e) => setSelectedFieldKey(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1e40af',
                          outline: 'none',
                          background: '#eff6ff'
                        }}
                      >
                        <option value="studentName">👤 Họ và Tên Học Viên (studentName)</option>
                        <option value="studentCode">🆔 Mã Định Danh Học Viên (studentCode)</option>
                        <option value="courseTitle">📚 Tên Khóa Học / Môn Thi (courseTitle)</option>
                        <option value="finalScore">🎯 Điểm Số Kết Quả (finalScore)</option>
                        <option value="honorsTitle">🎖️ Xếp Loại Danh Dự (honorsTitle)</option>
                        <option value="issueDate">📅 Ngày Cấp Chứng Chỉ (issueDate)</option>
                        <option value="certificateId">🔢 Số Hiệu Chứng Chỉ (certificateId)</option>
                        <option value="qrCode">🔳 Mã QR Xác Thực (qrCode)</option>
                        <option value="title">🏷️ Tiêu Đề Chứng Nhận (title)</option>
                        <option value="subtitle">📝 Lời Dẫn / Phụ Đề (subtitle)</option>
                        <option value="organization">🏛️ Đơn Vị Đào Tạo (organization)</option>
                        <option value="signatoryRightTitle">✒️ Chức Danh Người Ký (signatoryRightTitle)</option>
                        <option value="signatoryRightName">✍️ Họ Tên Người Ký (signatoryRightName)</option>
                      </select>
                    </div>

                    {/* Bảng thuộc tính của trường được chọn */}
                    {designerTemplate.fields[selectedFieldKey] && (() => {
                      const cur = designerTemplate.fields[selectedFieldKey];
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Bật / Tắt hiển thị */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>Trạng thái hiển thị:</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={cur.visible}
                                onChange={(e) => handleUpdateFieldConfig({ visible: e.target.checked })}
                              />
                              {cur.visible ? 'Đang bật' : 'Đang ẩn'}
                            </label>
                          </div>

                          {/* Tọa độ X và Y (%) */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                                <span>Vị trí X (Ngang):</span>
                                <span style={{ color: '#2563eb' }}>{cur.x}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={cur.x}
                                onChange={(e) => handleUpdateFieldConfig({ x: Number(e.target.value) })}
                                style={{ width: '100%' }}
                              />
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                                <span>Vị trí Y (Dọc):</span>
                                <span style={{ color: '#2563eb' }}>{cur.y}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={cur.y}
                                onChange={(e) => handleUpdateFieldConfig({ y: Number(e.target.value) })}
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>

                          {/* Cỡ chữ (Font Size) */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                              <span>Cỡ chữ:</span>
                              <span style={{ color: '#2563eb' }}>{cur.fontSize}px</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="60"
                              value={cur.fontSize}
                              onChange={(e) => handleUpdateFieldConfig({ fontSize: Number(e.target.value) })}
                              style={{ width: '100%' }}
                            />
                          </div>

                          {/* Màu chữ và Căn lề */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                                Màu chữ:
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="color"
                                  value={cur.color || '#0f172a'}
                                  onChange={(e) => handleUpdateFieldConfig({ color: e.target.value })}
                                  style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                />
                                <input
                                  type="text"
                                  value={cur.color || '#0f172a'}
                                  onChange={(e) => handleUpdateFieldConfig({ color: e.target.value })}
                                  style={{ width: '80px', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                />
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                                Căn lề chữ:
                              </label>
                              <select
                                value={cur.align || 'center'}
                                onChange={(e) => handleUpdateFieldConfig({ align: e.target.value as any })}
                                style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                              >
                                <option value="left">Căn Trái</option>
                                <option value="center">Căn Giữa</option>
                                <option value="right">Căn Phải</option>
                              </select>
                            </div>
                          </div>

                          {/* Tiền tố văn bản (prefix) */}
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                              Tiền tố / Nhãn cố định:
                            </label>
                            <input
                              type="text"
                              value={cur.prefix || ''}
                              onChange={(e) => handleUpdateFieldConfig({ prefix: e.target.value })}
                              placeholder="Ví dụ: Mã học viên: "
                              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}
                            />
                          </div>

                          {/* Tùy chọn In hoa */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={!!cur.uppercase}
                              onChange={(e) => handleUpdateFieldConfig({ uppercase: e.target.checked })}
                            />
                            Tự động viết IN HOA toàn bộ
                          </label>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: BÁO CÁO KHẢO THÍ & BẰNG CHỨNG SỐ (ANALYTICS & LEDGER)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeMainTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 4 Thẻ KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tổng Chứng Chỉ Đã Cấp</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d97706', marginTop: '6px' }}>{certificates.length}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Chứng Chỉ Hợp Lệ</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
                {certificates.filter(c => c.status === 'valid').length}
              </div>
            </div>
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Thủ Khoa & Xuất Sắc (≥ 85đ)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563eb', marginTop: '6px' }}>
                {certificates.filter(c => c.finalScore >= 85).length}
              </div>
            </div>
            <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Chứng Chỉ Đã Thu Hồi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#dc2626', marginTop: '6px' }}>
                {certificates.filter(c => c.status === 'revoked').length}
              </div>
            </div>
          </div>

          {/* Sổ cái Block immutability */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 800 }}>
              ⛓ Sổ Cái Bất Biến (Blockchain Ledger Log)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px' }}>Số Hiệu</th>
                    <th style={{ padding: '10px' }}>Học Viên</th>
                    <th style={{ padding: '10px' }}>SHA-256 Hash</th>
                    <th style={{ padding: '10px' }}>Transaction Hash</th>
                    <th style={{ padding: '10px' }}>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.slice(0, 10).map(c => (
                    <tr key={c.certificateId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 700 }}>{c.certificateId}</td>
                      <td style={{ padding: '10px' }}>{c.studentName}</td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                        {c.blockchainProof?.certHash ? `${c.blockchainProof.certHash.substring(0, 20)}...` : 'N/A'}
                      </td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#2563eb' }}>
                        {c.blockchainProof?.txHash ? `${c.blockchainProof.txHash.substring(0, 20)}...` : 'N/A'}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#059669' }}>
                        #{c.blockchainProof?.blockHeight.toLocaleString() || '45,102,900'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: CẤP CHỨNG CHỈ MỚI
      ══════════════════════════════════════════════════════════════════════ */}
      {isIssueModalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsIssueModalOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}
        >
          <div style={{
            background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Award size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Cấp Phát Chứng Chỉ Mới</h3>
              </div>
              <button onClick={() => setIsIssueModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Chọn học viên từ danh sách */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Chọn từ danh sách học viên hiện có (Tùy chọn):
                </label>
                <select
                  value={issueForm.selectedStudentId}
                  onChange={(e) => handleSelectStudentForIssue(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="">-- Nhập thông tin tự do bên dưới --</option>
                  {studentAccounts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode}) {s.schoolOrClass ? `- ${s.schoolOrClass}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Họ tên và Mã SV */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Họ và Tên Học Viên <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.studentName}
                    onChange={(e) => setIssueForm(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mã Học Viên <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.studentCode}
                    onChange={(e) => setIssueForm(prev => ({ ...prev, studentCode: e.target.value }))}
                    placeholder="TGZ-2026-001"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Khóa học & Tên môn */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Chương Trình Đào Tạo Chuẩn:
                </label>
                <select
                  value={issueForm.track}
                  onChange={(e) => {
                    const tr = e.target.value;
                    setIssueForm(prev => ({
                      ...prev,
                      track: tr,
                      courseTitle: TRACK_LABELS[tr as CurriculumTrack] || tr
                    }));
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '8px' }}
                >
                  {ALL_TRACK_OPTIONS.map(tr => (
                    <option key={tr.id} value={tr.id}>{tr.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={issueForm.courseTitle}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, courseTitle: e.target.value }))}
                  placeholder="Tên in trên chứng nhận..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Điểm số & Danh hiệu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Điểm Khảo Thí (0 - 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={issueForm.finalScore}
                    onChange={(e) => handleScoreChange(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Xếp Loại / Danh Hiệu:
                  </label>
                  <input
                    type="text"
                    value={issueForm.honorsTitle}
                    onChange={(e) => setIssueForm(prev => ({ ...prev, honorsTitle: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Chọn Khung Mẫu Áp Dụng */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Khung Mẫu Phôi Áp Dụng:
                </label>
                <select
                  value={issueForm.templateId}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, templateId: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {templates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} {tpl.isDefault ? '★ (Mặc định)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày cấp & Người ký */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Ngày Cấp:
                  </label>
                  <input
                    type="date"
                    value={issueForm.issueDate}
                    onChange={(e) => setIssueForm(prev => ({ ...prev, issueDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Người Ký (Giám Đốc):
                  </label>
                  <input
                    type="text"
                    value={issueForm.signatoryName}
                    onChange={(e) => setIssueForm(prev => ({ ...prev, signatoryName: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Nút submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#ffffff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)' }}
                >
                  Xác Nhận Cấp Chứng Chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: CHỈNH SỬA THÔNG TIN CHỨNG CHỈ
      ══════════════════════════════════════════════════════════════════════ */}
      {editingCert && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setEditingCert(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}
        >
          <div style={{
            background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Chỉnh Sửa Chứng Chỉ</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Số hiệu: {editingCert.certificateId}</div>
                </div>
              </div>
              <button onClick={() => setEditingCert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCert} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Họ và Tên Học Viên:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCert.studentName}
                    onChange={(e) => setEditingCert({ ...editingCert, studentName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mã Học Viên:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCert.studentCode}
                    onChange={(e) => setEditingCert({ ...editingCert, studentCode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Tên Khóa Học:
                </label>
                <input
                  type="text"
                  required
                  value={editingCert.courseTitle}
                  onChange={(e) => setEditingCert({ ...editingCert, courseTitle: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Điểm Số:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={editingCert.finalScore}
                    onChange={(e) => setEditingCert({ ...editingCert, finalScore: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Xếp Loại / Danh Hiệu:
                  </label>
                  <input
                    type="text"
                    value={editingCert.honorsTitle || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, honorsTitle: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Khung Mẫu Phôi Áp Dụng:
                </label>
                <select
                  value={editingCert.templateId || templates[0]?.id}
                  onChange={(e) => setEditingCert({ ...editingCert, templateId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {templates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Ngày Cấp:
                  </label>
                  <input
                    type="date"
                    value={editingCert.issueDate}
                    onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Người Ký:
                  </label>
                  <input
                    type="text"
                    value={editingCert.signatoryName || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, signatoryName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: XEM TRƯỚC CHỨNG CHỈ (VIEWER & EXPORT MODAL)
      ══════════════════════════════════════════════════════════════════════ */}
      {viewingCert && (
        <CertificateViewerModal
          certificate={viewingCert}
          onClose={() => setViewingCert(null)}
          onUpdateCertificateTemplate={(certId, templateId) => {
            CertificateService.updateCertificate(certId, { templateId });
            refreshData();
          }}
        />
      )}
    </div>
  );
};
