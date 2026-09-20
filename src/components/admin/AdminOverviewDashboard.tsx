import React, { useState } from 'react';
import {
  Users, BookOpen, Layers, Award,
  CheckCircle2, CheckSquare,
  ChevronDown, ArrowRight, Shield, Briefcase,
  Database, FileSpreadsheet, PlusCircle
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface AdminOverviewDashboardProps {
  onNavigateSubTab?: (subTab: any) => void;
  onOpenDataCenter?: () => void;
  onExportExcel?: () => void;
  onOpenFileSplitter?: () => void;
}

export const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({
  onNavigateSubTab,
  onOpenDataCenter,
  onExportExcel,
  onOpenFileSplitter
}) => {
  const [approvalTab, setApprovalTab] = useState<'courses' | 'teachers' | 'content' | 'certs'>('courses');
  const [approvedIds, setApprovedIds] = useState<Record<string, 'approved' | 'rejected'>>({});

  const handleApprove = (id: string) => {
    soundFx.playClick();
    setApprovedIds(prev => ({ ...prev, [id]: 'approved' }));
  };

  const handleReject = (id: string) => {
    soundFx.playClick();
    setApprovedIds(prev => ({ ...prev, [id]: 'rejected' }));
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      width: '100%',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* ── 1. WELCOME HEADER (Design Source of Truth) ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '22px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#EFF6FF',
            color: '#0057B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} color="#0057B8" />
          </div>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0B2545',
              margin: '0 0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Xin chào, Nguyễn Đình Huy!</span>
              <span role="img" aria-label="wave">👋</span>
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Chào mừng bạn trở lại hệ thống quản trị Tin Học Gen Z. Hôm nay là Thứ Hai, 24 tháng 6, 2025.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onOpenDataCenter && (
            <button
              onClick={() => { soundFx.playClick(); onOpenDataCenter(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                background: '#EFF6FF',
                color: '#0057B8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Database size={14} />
              <span>CSDL & Sao Lưu</span>
            </button>
          )}

          {onExportExcel && (
            <button
              onClick={() => { soundFx.playClick(); onExportExcel(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #BBF7D0',
                background: '#F0FDF4',
                color: '#166534',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={14} />
              <span>Xuất Bảng Điểm</span>
            </button>
          )}

          {onOpenFileSplitter && (
            <button
              onClick={() => { soundFx.playClick(); onOpenFileSplitter(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: 'none',
                background: '#0057B8',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} />
              <span>Tách Đề 3 Môn</span>
            </button>
          )}

          <div style={{
            fontSize: '12px',
            fontStyle: 'italic',
            color: '#64748B',
            background: '#F8FAFC',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            textAlign: 'right'
          }}>
            "Công nghệ đúng cách giúp giáo dục đi xa hơn" <span style={{ color: '#0057B8', fontWeight: 600 }}>— Tin Học Gen Z</span>
          </div>
        </div>
      </div>

      {/* ── 2. 8 KPI CARDS GRID (Design Source of Truth) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '14px'
      }}>
        {/* KPI 1: Tổng người dùng */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Tổng người dùng</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>2,847</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 12% <span style={{ color: '#94A3B8', fontWeight: 400 }}>so với tháng trước</span></div>
        </div>

        {/* KPI 2: Học viên */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Học viên</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>2,163</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 15%</div>
        </div>

        {/* KPI 3: Giảng viên */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Giảng viên</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>124</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 8%</div>
        </div>

        {/* KPI 4: Khóa học */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Khóa học</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>86</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 6%</div>
        </div>

        {/* KPI 5: Lớp học */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDFA', color: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Lớp học</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>52</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 18%</div>
        </div>

        {/* KPI 6: Doanh thu */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px' }}>
              $
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Doanh thu</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>1.24 Tỷ</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 22%</div>
        </div>

        {/* KPI 7: Chứng chỉ */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF1F2', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Chứng chỉ</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>1,893</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 35%</div>
        </div>

        {/* KPI 8: Tỷ lệ hoàn thành */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Tỷ lệ hoàn thành</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0B2545', marginBottom: '4px' }}>78%</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>↑ 11%</div>
        </div>
      </div>

      {/* ── 3. CHARTS ROW (Row of 3 Charts) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Chart 1: Tăng trưởng người dùng */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0B2545' }}>
              Tăng trưởng người dùng
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span>6 tháng qua</span>
              <ChevronDown size={13} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11.5px', color: '#64748B', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0057B8' }} />
              <span>Học viên</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <span>Giảng viên</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
              <span>Người dùng khác</span>
            </span>
          </div>

          {/* SVG Multi-Line Chart */}
          <div style={{ width: '100%', height: '180px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 180" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="390" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="60" x2="390" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="100" x2="390" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="140" x2="390" y2="140" stroke="#F1F5F9" strokeWidth="1" />

              {/* Shaded Area for Blue Line */}
              <path
                d="M 50 120 L 110 95 L 170 90 L 230 70 L 290 65 L 350 35 L 350 140 L 50 140 Z"
                fill="rgba(0, 87, 184, 0.08)"
              />

              {/* Line 1: Học viên (Blue) */}
              <path
                d="M 50 120 L 110 95 L 170 90 L 230 70 L 290 65 L 350 35"
                fill="none"
                stroke="#0057B8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="50" cy="120" r="3.5" fill="#0057B8" />
              <circle cx="110" cy="95" r="3.5" fill="#0057B8" />
              <circle cx="170" cy="90" r="3.5" fill="#0057B8" />
              <circle cx="230" cy="70" r="3.5" fill="#0057B8" />
              <circle cx="290" cy="65" r="3.5" fill="#0057B8" />
              <circle cx="350" cy="35" r="4.5" fill="#0057B8" />

              {/* Line 2: Giảng viên (Green) */}
              <path
                d="M 50 135 L 110 130 L 170 125 L 230 125 L 290 125 L 350 120"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              />
              <circle cx="350" cy="120" r="3.5" fill="#10B981" />

              {/* Line 3: Người dùng khác (Purple) */}
              <path
                d="M 50 138 L 110 136 L 170 135 L 230 134 L 290 132 L 350 130"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Axis Labels */}
              <text x="45" y="165" fontSize="10" fill="#94A3B8">Tháng 1</text>
              <text x="105" y="165" fontSize="10" fill="#94A3B8">Tháng 2</text>
              <text x="165" y="165" fontSize="10" fill="#94A3B8">Tháng 3</text>
              <text x="225" y="165" fontSize="10" fill="#94A3B8">Tháng 4</text>
              <text x="285" y="165" fontSize="10" fill="#94A3B8">Tháng 5</text>
              <text x="345" y="165" fontSize="10" fill="#94A3B8">Tháng 6</text>

              <text x="5" y="25" fontSize="9" fill="#94A3B8">2,000</text>
              <text x="5" y="65" fontSize="9" fill="#94A3B8">1,500</text>
              <text x="5" y="105" fontSize="9" fill="#94A3B8">1,000</text>
              <text x="12" y="145" fontSize="9" fill="#94A3B8">500</text>
            </svg>
          </div>
        </div>

        {/* Chart 2: Doanh thu theo tháng */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0B2545' }}>
              Doanh thu theo tháng
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span>Năm nay</span>
              <ChevronDown size={13} />
            </div>
          </div>

          {/* Highlight Tooltip for Month 6 */}
          <div style={{
            position: 'absolute',
            top: '56px',
            right: '28px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '6px 12px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            fontSize: '11px',
            lineHeight: 1.3,
            zIndex: 10
          }}>
            <div style={{ color: '#64748B' }}>Tháng 6</div>
            <div style={{ fontWeight: 800, color: '#0057B8' }}>320,000,000 VND</div>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ width: '100%', height: '180px' }}>
            <svg width="100%" height="100%" viewBox="0 0 360 180" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="45" y1="30" x2="350" y2="30" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="45" y1="70" x2="350" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="45" y1="110" x2="350" y2="110" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="45" y1="150" x2="350" y2="150" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y Axis */}
              <text x="5" y="34" fontSize="9" fill="#94A3B8">400M</text>
              <text x="5" y="74" fontSize="9" fill="#94A3B8">300M</text>
              <text x="5" y="114" fontSize="9" fill="#94A3B8">200M</text>
              <text x="5" y="154" fontSize="9" fill="#94A3B8">100M</text>

              {/* Bars */}
              <rect x="65" y="115" width="28" height="35" rx="4" fill="#3B82F6" />
              <text x="73" y="166" fontSize="10" fill="#94A3B8">T1</text>

              <rect x="115" y="100" width="28" height="50" rx="4" fill="#3B82F6" />
              <text x="123" y="166" fontSize="10" fill="#94A3B8">T2</text>

              <rect x="165" y="85" width="28" height="65" rx="4" fill="#3B82F6" />
              <text x="173" y="166" fontSize="10" fill="#94A3B8">T3</text>

              <rect x="215" y="70" width="28" height="80" rx="4" fill="#3B82F6" />
              <text x="223" y="166" fontSize="10" fill="#94A3B8">T4</text>

              <rect x="265" y="55" width="28" height="95" rx="4" fill="#3B82F6" />
              <text x="273" y="166" fontSize="10" fill="#94A3B8">T5</text>

              {/* Month 6 Highlighted Bar */}
              <rect x="315" y="40" width="28" height="110" rx="4" fill="#0057B8" />
              <text x="323" y="166" fontSize="10" fill="#0057B8" fontWeight="700">T6</text>
            </svg>
          </div>
        </div>

        {/* Chart 3: Phân bổ khóa học */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0B2545' }}>
              Phân bổ khóa học
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <span>Tất cả</span>
              <ChevronDown size={13} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
            {/* Donut Chart SVG */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="48" fill="none" stroke="#0057B8" strokeWidth="18" strokeDasharray="112 190" strokeDashoffset="0" />
                <circle cx="65" cy="65" r="48" fill="none" stroke="#10B981" strokeWidth="18" strokeDasharray="63 239" strokeDashoffset="-112" />
                <circle cx="65" cy="65" r="48" fill="none" stroke="#F59E0B" strokeWidth="18" strokeDasharray="42 260" strokeDashoffset="-175" />
                <circle cx="65" cy="65" r="48" fill="none" stroke="#EF4444" strokeWidth="18" strokeDasharray="36 266" strokeDashoffset="-217" />
                <circle cx="65" cy="65" r="48" fill="none" stroke="#8B5CF6" strokeWidth="18" strokeDasharray="27 275" strokeDashoffset="-253" />
                <circle cx="65" cy="65" r="48" fill="none" stroke="#CBD5E1" strokeWidth="18" strokeDasharray="21 281" strokeDashoffset="-280" />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0B2545' }}>86</span>
                <span style={{ fontSize: '9.5px', color: '#64748B' }}>Khóa học</span>
              </div>
            </div>

            {/* Legend List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0057B8' }} />
                  <span>Tin học văn phòng</span>
                </span>
                <strong style={{ color: '#0B2545' }}>32 (37%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
                  <span>MOS</span>
                </span>
                <strong style={{ color: '#0B2545' }}>18 (21%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span>IC3</span>
                </span>
                <strong style={{ color: '#0B2545' }}>12 (14%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444' }} />
                  <span>AI & Ứng dụng</span>
                </span>
                <strong style={{ color: '#0B2545' }}>10 (12%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#8B5CF6' }} />
                  <span>Lập trình</span>
                </span>
                <strong style={{ color: '#0B2545' }}>8 (9%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#CBD5E1' }} />
                  <span>Khác</span>
                </span>
                <strong style={{ color: '#64748B' }}>6 (7%)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MIDDLE SECTION (Row of 4 Widgets) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {/* Widget 1: Điểm danh hôm nay */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545' }}>Điểm danh hôm nay</div>
            <button
              onClick={() => onNavigateSubTab && onNavigateSubTab('schedules')}
              style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray="185 201"
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: '#0B2545' }}>
                92%
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
              Học viên đã điểm danh thành công
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div style={{ background: '#F0FDF4', padding: '8px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#10B981' }}>215</div>
              <div style={{ fontSize: '10px', color: '#166534' }}>Có mặt</div>
            </div>
            <div style={{ background: '#FFFBEB', padding: '8px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#D97706' }}>8</div>
              <div style={{ fontSize: '10px', color: '#92400E' }}>Đi muộn</div>
            </div>
            <div style={{ background: '#FEF2F2', padding: '8px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#EF4444' }}>6</div>
              <div style={{ fontSize: '10px', color: '#991B1B' }}>Vắng mặt</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '8px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#64748B' }}>3</div>
              <div style={{ fontSize: '10px', color: '#475569' }}>Chờ xác minh</div>
            </div>
          </div>
        </div>

        {/* Widget 2: Bài tập & Kiểm tra */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545' }}>Bài tập & Kiểm tra</div>
            <button
              onClick={() => onNavigateSubTab && onNavigateSubTab('grading_assignments')}
              style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={22} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B2545' }}>24</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Bài tập đang chờ chấm</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#EF4444', fontWeight: 700 }}>12</span>
              <span style={{ color: '#64748B' }}>Bài tập quá hạn</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>18</span>
              <span style={{ color: '#64748B' }}>Bài kiểm tra sắp diễn ra</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0057B8', fontWeight: 700 }}>5</span>
              <span style={{ color: '#64748B' }}>Cần phê duyệt đề thi</span>
            </div>
          </div>
        </div>

        {/* Widget 3: Hoạt động gần đây */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545' }}>Hoạt động gần đây</div>
            <button
              onClick={() => onNavigateSubTab && onNavigateSubTab('student_directory')}
              style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                L
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Nguyễn Thị Lan hoàn thành khóa Excel</div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>10 phút trước</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                M
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Trần Văn Minh đăng ký khóa MOS Word</div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>25 phút trước</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                T
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Lớp THGZ01 đã kết thúc buổi học</div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>1 giờ trước</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                C
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Hệ thống đã cấp 15 chứng chỉ</div>
                <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>2 giờ trước</div>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 4: Sức khỏe hệ thống */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0B2545' }}>Sức khỏe hệ thống</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: '#ECFDF5',
              color: '#10B981',
              fontSize: '11px',
              fontWeight: 700
            }}>
              <CheckCircle2 size={12} />
              <span>Hoạt động ổn định</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>Website LMS</span>
              </span>
              <strong style={{ color: '#0B2545' }}>99.9%</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>Cơ sở dữ liệu Supabase</span>
              </span>
              <strong style={{ color: '#0B2545' }}>99.9%</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>AI Service Copilot</span>
              </span>
              <strong style={{ color: '#0B2545' }}>99.8%</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>Cloud Storage</span>
              </span>
              <strong style={{ color: '#0B2545' }}>99.9%</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>Email Service</span>
              </span>
              <strong style={{ color: '#0B2545' }}>99.7%</strong>
            </div>
          </div>

          <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '12px', textAlign: 'right' }}>
            Cập nhật: 24/06/2025 10:30
          </div>
        </div>
      </div>

      {/* ── 5. BOTTOM SECTION (2 Tables) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Table 1: Danh sách lớp học sắp diễn ra */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0B2545' }}>
              Danh sách lớp học sắp diễn ra
            </div>
            <button
              onClick={() => onNavigateSubTab && onNavigateSubTab('schedules')}
              style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '8px 6px' }}>Thời gian</th>
                  <th style={{ padding: '8px 6px' }}>Lớp học</th>
                  <th style={{ padding: '8px 6px' }}>Khóa học</th>
                  <th style={{ padding: '8px 6px' }}>Giảng viên</th>
                  <th style={{ padding: '8px 6px' }}>Phòng</th>
                  <th style={{ padding: '8px 6px' }}>Sĩ số</th>
                  <th style={{ padding: '8px 6px' }}>Trạng thái</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600, color: '#0B2545' }}>08:00 - 10:00</td>
                  <td style={{ padding: '10px 6px', color: '#0057B8', fontWeight: 700 }}>THGZ01</td>
                  <td style={{ padding: '10px 6px' }}>Excel Cơ Bản</td>
                  <td style={{ padding: '10px 6px' }}>Nguyễn Văn A</td>
                  <td style={{ padding: '10px 6px' }}>P.101</td>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>24/25</td>
                  <td style={{ padding: '10px 6px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706', fontWeight: 600 }}>
                      ● Sắp diễn ra
                    </span>
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                    <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
                      Vào lớp
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600, color: '#0B2545' }}>10:30 - 12:30</td>
                  <td style={{ padding: '10px 6px', color: '#0057B8', fontWeight: 700 }}>THGZ02</td>
                  <td style={{ padding: '10px 6px' }}>MOS Word 2019</td>
                  <td style={{ padding: '10px 6px' }}>Trần Thị B</td>
                  <td style={{ padding: '10px 6px' }}>P.102</td>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>20/20</td>
                  <td style={{ padding: '10px 6px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706', fontWeight: 600 }}>
                      ● Sắp diễn ra
                    </span>
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                    <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
                      Vào lớp
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600, color: '#0B2545' }}>14:00 - 16:00</td>
                  <td style={{ padding: '10px 6px', color: '#0057B8', fontWeight: 700 }}>THGZ03</td>
                  <td style={{ padding: '10px 6px' }}>IC3 GS5</td>
                  <td style={{ padding: '10px 6px' }}>Lê Văn C</td>
                  <td style={{ padding: '10px 6px' }}>P.201</td>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>18/25</td>
                  <td style={{ padding: '10px 6px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#EFF6FF', color: '#0057B8', fontWeight: 600 }}>
                      ● Chuẩn bị
                    </span>
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                    <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
                      Chi tiết
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr>
                  <td style={{ padding: '10px 6px', fontWeight: 600, color: '#0B2545' }}>19:00 - 21:00</td>
                  <td style={{ padding: '10px 6px', color: '#0057B8', fontWeight: 700 }}>THGZ04</td>
                  <td style={{ padding: '10px 6px' }}>PowerPoint Nâng Cao</td>
                  <td style={{ padding: '10px 6px' }}>Phạm Thị D</td>
                  <td style={{ padding: '10px 6px' }}>Online</td>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>32/35</td>
                  <td style={{ padding: '10px 6px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#D97706', fontWeight: 600 }}>
                      ● Sắp diễn ra
                    </span>
                  </td>
                  <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                    <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
                      Vào lớp
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Yêu cầu chờ phê duyệt */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0B2545' }}>
              Yêu cầu chờ phê duyệt
            </div>
            <button
              onClick={() => onNavigateSubTab && onNavigateSubTab('grading_assignments')}
              style={{ background: 'none', border: 'none', color: '#0057B8', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Filter Sub-Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setApprovalTab('courses')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: approvalTab === 'courses' ? '#0057B8' : '#F1F5F9',
                color: approvalTab === 'courses' ? '#FFFFFF' : '#64748B',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Đăng ký khóa học <span style={{ opacity: 0.8 }}>(12)</span>
            </button>

            <button
              onClick={() => setApprovalTab('teachers')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: approvalTab === 'teachers' ? '#0057B8' : '#F1F5F9',
                color: approvalTab === 'teachers' ? '#FFFFFF' : '#64748B',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Giảng viên <span style={{ opacity: 0.8 }}>(3)</span>
            </button>

            <button
              onClick={() => setApprovalTab('content')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: approvalTab === 'content' ? '#0057B8' : '#F1F5F9',
                color: approvalTab === 'content' ? '#FFFFFF' : '#64748B',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Nội dung <span style={{ opacity: 0.8 }}>(5)</span>
            </button>

            <button
              onClick={() => setApprovalTab('certs')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                background: approvalTab === 'certs' ? '#0057B8' : '#F1F5F9',
                color: approvalTab === 'certs' ? '#FFFFFF' : '#64748B',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Chứng chỉ <span style={{ opacity: 0.8 }}>(8)</span>
            </button>
          </div>

          {/* List of Requests */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Item 1 */}
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  L
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Nguyễn Hoàng Long <span style={{ fontWeight: 400, color: '#64748B' }}>đăng ký khóa MOS Excel 2019</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>2 giờ trước</div>
                </div>
              </div>

              {approvedIds['req1'] ? (
                <span style={{ fontSize: '12px', fontWeight: 700, color: approvedIds['req1'] === 'approved' ? '#10B981' : '#EF4444' }}>
                  {approvedIds['req1'] === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleApprove('req1')}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject('req1')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #EF4444', background: '#FFFFFF', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>

            {/* Item 2 */}
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  H
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Trần Thu Hà <span style={{ fontWeight: 400, color: '#64748B' }}>đăng ký khóa IC3 GS6</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>3 giờ trước</div>
                </div>
              </div>

              {approvedIds['req2'] ? (
                <span style={{ fontSize: '12px', fontWeight: 700, color: approvedIds['req2'] === 'approved' ? '#10B981' : '#EF4444' }}>
                  {approvedIds['req2'] === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleApprove('req2')}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject('req2')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #EF4444', background: '#FFFFFF', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>

            {/* Item 3 */}
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  Q
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Lê Minh Quân <span style={{ fontWeight: 400, color: '#64748B' }}>đăng ký khóa Excel Nâng Cao</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>5 giờ trước</div>
                </div>
              </div>

              {approvedIds['req3'] ? (
                <span style={{ fontSize: '12px', fontWeight: 700, color: approvedIds['req3'] === 'approved' ? '#10B981' : '#EF4444' }}>
                  {approvedIds['req3'] === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleApprove('req3')}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReject('req3')}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #EF4444', background: '#FFFFFF', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. ADMIN DASHBOARD FOOTER ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 8px',
        borderTop: '1px solid #E2E8F0',
        fontSize: '12px',
        color: '#64748B',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          © 2025 Tin Học Gen Z. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="#privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Chính sách bảo mật</a>
          <a href="#terms" style={{ color: '#64748B', textDecoration: 'none' }}>Điều khoản</a>
          <a href="#support" style={{ color: '#64748B', textDecoration: 'none' }}>Hỗ trợ</a>
          <span style={{ color: '#94A3B8' }}>v2.1.0</span>
        </div>
      </div>
    </div>
  );
};
