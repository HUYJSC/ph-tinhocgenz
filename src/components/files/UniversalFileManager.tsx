import React, { useState, useMemo } from 'react';
import {
  Folder, Search, Download, Eye, UploadCloud,
  Clock, User, Trash2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UniversalFileViewer, LMSFileItem, detectFileCategory, formatFileSize } from '../ui/UniversalFileViewer';
import { soundFx } from '../../utils/audio';

export interface UniversalFileManagerProps {
  files?: LMSFileItem[];
  userRole?: string;
  onUpload?: (file: File) => void;
  onDelete?: (fileId: string) => void;
  title?: string;
  readOnly?: boolean;
}

export const DEFAULT_LMS_FILES: LMSFileItem[] = [
  {
    id: 'f-01',
    name: 'GiaoTrinh_Excel_NangCao_2026.pdf',
    type: 'pdf',
    size: 4520000,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    uploader: 'Thầy Quang Huy (GV03)',
    createdAt: '2026-09-28',
    permission: 'student',
    description: 'Giáo trình chiêm nghiệm toàn diện Hàm mảng động & Pivot Table'
  },
  {
    id: 'f-02',
    name: 'BangTinh_QuanLy_KhoHang_Mau.xlsx',
    type: 'xlsx',
    size: 1250000,
    url: '#',
    uploader: 'Cô Mai Anh (GV02)',
    createdAt: '2026-09-29',
    permission: 'student',
    description: 'Biểu mẫu thực hành nhập xuất tồn Excel chuẩn doanh nghiệp'
  },
  {
    id: 'f-03',
    name: 'SoTay_PhimTat_TinHocVanPhong.docx',
    type: 'docx',
    size: 840000,
    url: '#',
    uploader: 'Ban Đào tạo PH EDU',
    createdAt: '2026-09-30',
    permission: 'public',
    description: 'Tổng hợp 120 phím tắt thần tốc trong Word và PowerPoint'
  },
  {
    id: 'f-04',
    name: 'Slide_BaiGiang_Python_Data_Module1.pptx',
    type: 'pptx',
    size: 8900000,
    url: '#',
    uploader: 'Thầy Hoàng Nam (GV01)',
    createdAt: '2026-10-01',
    permission: 'student',
    description: 'Bài thuyết trình cấu trúc điều khiển và giải thuật cơ bản'
  },
  {
    id: 'f-05',
    name: 'SoDo_KienTruc_HeThong_LMS.png',
    type: 'png',
    size: 620000,
    url: '/chatbot.ai.png',
    uploader: 'Admin Kỹ thuật',
    createdAt: '2026-10-01',
    permission: 'public',
    description: 'Sơ đồ luồng phân quyền RBAC và điều phối trợ lý AI Gemini'
  },
  {
    id: 'f-06',
    name: 'Video_HuongDan_LapTrinh_Web_01.mp4',
    type: 'mp4',
    size: 42000000,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    uploader: 'Thầy Quang Huy (GV03)',
    createdAt: '2026-10-01',
    permission: 'student',
    description: 'Video quay màn hình thao tác cấu hình môi trường lập trình'
  },
  {
    id: 'f-07',
    name: 'GiaiThuat_LocDuLieu_NangCao.py',
    type: 'py',
    size: 14200,
    url: '#',
    uploader: 'Thầy Hoàng Nam (GV01)',
    createdAt: '2026-10-02',
    permission: 'student',
    textContent: `# Thuật toán lọc và tổng hợp dữ liệu học viên Tin Học Gen Z\ndef aggregate_student_scores(records):\n    summary = {}\n    for r in records:\n        sid = r.get("student_code")\n        score = r.get("final_score", 0)\n        summary[sid] = summary.get(sid, []) + [score]\n    return {k: round(sum(v)/len(v), 2) for k, v in summary.items()}\n\nprint("Script sẵn sàng tích hợp hệ thống chấm bài thi!")`,
    description: 'Mã nguồn mẫu Python hỗ trợ giải bài tập thực hành'
  }
];

export const UniversalFileManager: React.FC<UniversalFileManagerProps> = ({
  files = DEFAULT_LMS_FILES,
  userRole = 'student',
  onUpload,
  onDelete,
  title = 'Kho Tài liệu & Học liệu Số',
  readOnly = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFileToView, setActiveFileToView] = useState<LMSFileItem | null>(null);

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.uploader && f.uploader.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
      if (selectedCategory === 'all') return true;
      const cat = detectFileCategory(f.name || f.type);
      return cat === selectedCategory;
    });
  }, [files, searchQuery, selectedCategory]);

  const handleOpenFile = (f: LMSFileItem) => {
    soundFx.playClick();
    setActiveFileToView(f);
  };

  const getCategoryBadge = (f: LMSFileItem) => {
    const cat = detectFileCategory(f.name || f.type);
    switch (cat) {
      case 'document':
        return <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Tài liệu</span>;
      case 'spreadsheet':
        return <span style={{ background: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Bảng tính</span>;
      case 'presentation':
        return <span style={{ background: '#FFF7ED', color: '#C2410C', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Thuyết trình</span>;
      case 'image':
        return <span style={{ background: '#F5F3FF', color: '#6D28D9', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Hình ảnh</span>;
      case 'video':
        return <span style={{ background: '#FEF2F2', color: '#B91C1C', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Video</span>;
      case 'code':
        return <span style={{ background: '#F1F5F9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Mã nguồn</span>;
      default:
        return <span style={{ background: '#F8FAFC', color: '#64748B', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Tệp tin</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Actions */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #D9E2F0',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(11, 37, 69, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Folder size={22} color="#0057B8" />
            {title}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Hệ thống quản lý tệp đa định dạng, xem trước trực tiếp không để lộ dữ liệu JSON thô.
          </p>
        </div>

        {!readOnly && (userRole === 'teacher' || userRole === 'admin') && (
          <Button
            variant="primary"
            leftIcon={<UploadCloud size={16} />}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (e: any) => {
                if (e.target.files && e.target.files[0] && onUpload) {
                  onUpload(e.target.files[0]);
                }
              };
              input.click();
            }}
          >
            Tải lên tài liệu mới
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ minWidth: '260px', flex: 1, maxWidth: '420px' }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên file, bài học, giảng viên..."
            leftIcon={<Search size={16} color="#64748B" />}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'document', label: 'Tài liệu (PDF/DOC)' },
            { id: 'spreadsheet', label: 'Bảng tính (XLS/CSV)' },
            { id: 'presentation', label: 'Thuyết trình (PPT)' },
            { id: 'video', label: 'Video bài giảng' },
            { id: 'code', label: 'Mã nguồn (PY/JS)' }
          ].map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedCategory === c.id ? '#0057B8' : '#E2E8F0',
                background: selectedCategory === c.id ? '#EFF6FF' : '#FFFFFF',
                color: selectedCategory === c.id ? '#0057B8' : '#475569',
                fontSize: '12px',
                fontWeight: selectedCategory === c.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* File Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        {filteredFiles.map(file => {
          return (
            <div
              key={file.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  {getCategoryBadge(file)}
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{formatFileSize(file.size)}</span>
                </div>

                <div
                  onClick={() => handleOpenFile(file)}
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0B2545',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '6px'
                  }}
                  title={file.name}
                >
                  {file.name}
                </div>

                {file.description && (
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                    {file.description}
                  </p>
                )}

                <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    <span>{file.uploader || 'Ban Đào tạo'}</span>
                  </div>
                  {file.createdAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>{file.createdAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  style={{ flex: 1 }}
                  leftIcon={<Eye size={14} />}
                  onClick={() => handleOpenFile(file)}
                >
                  Xem ngay
                </Button>

                {file.url && file.url !== '#' && (
                  <button
                    type="button"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.url;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    title="Tải về máy"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Download size={14} />
                  </button>
                )}

                {!readOnly && onDelete && (userRole === 'teacher' || userRole === 'admin') && (
                  <button
                    type="button"
                    onClick={() => onDelete(file.id)}
                    title="Xóa tài liệu"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', background: '#FFFFFF', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
          <Folder size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ margin: '0 0 4px 0', color: '#0B2545' }}>Không tìm thấy tài liệu phù hợp</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Thử thay đổi từ khóa tìm kiếm hoặc lọc theo danh mục khác</p>
        </div>
      )}

      {/* Universal File Viewer Modal */}
      <UniversalFileViewer
        file={activeFileToView}
        isOpen={Boolean(activeFileToView)}
        onClose={() => setActiveFileToView(null)}
      />
    </div>
  );
};
