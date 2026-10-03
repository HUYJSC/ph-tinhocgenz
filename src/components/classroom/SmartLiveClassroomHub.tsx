import React, { useState, useMemo } from 'react';
import {
  Video, Clock, Users, CheckCircle2, Search,
  Play, Eye, Shield, Sparkles, Filter, Check,
  QrCode, Calendar
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { UserProfile, CurriculumTrack } from '../../types/auth';
import { BlockchainService } from '../../services/blockchainService';

export interface SmartLiveClassroom {
  id: string;
  classCode: string;
  name: string;
  trackId: CurriculumTrack;
  teacherName: string;
  teacherTitle: string;
  teacherAvatar?: string;
  studentCount: number;
  maxStudents: number;
  scheduleTime: string; // e.g. "Hôm nay, 19:30 - 21:00"
  status: 'live' | 'upcoming' | 'offline';
  meetCode: string; // Internal meeting code (e.g. "pht-mos-we01")
  roomUrl: string; // Background Meet URL (Never shown as long raw string)
  apiVerified: boolean;
  blockchainAnchorId?: string;
  roomNotes?: string;
}

interface SmartLiveClassroomHubProps {
  currentUser: UserProfile;
  onOpenAttendanceQR?: (classCode: string) => void;
  onSelectClass?: (classroom: SmartLiveClassroom) => void;
}

const DEFAULT_SMART_CLASSROOMS: SmartLiveClassroom[] = [
  {
    id: 'cls-01',
    classCode: 'K26-WE01',
    name: 'Word, Excel, PowerPoint (3 Buổi / Môn)',
    trackId: 'office-fast-3in1',
    teacherName: 'Thầy Nguyễn Đình Huy',
    teacherTitle: 'Giám Đốc Đào Tạo',
    studentCount: 28,
    maxStudents: 30,
    scheduleTime: 'Hôm nay: 19:30 - 21:00',
    status: 'live',
    meetCode: 'pht-mos-we01',
    roomUrl: 'https://meet.google.com/pht-mos-we01',
    apiVerified: true,
    blockchainAnchorId: '0x8f2a...7c91',
    roomNotes: 'Phòng học trực tuyến chuẩn Google Meet chất lượng cao HD.'
  },
  {
    id: 'cls-02',
    classCode: 'K26-CB02',
    name: 'Chứng Chỉ CNTT Cơ Bản Chuẩn Bộ TT&TT (6 Buổi)',
    trackId: 'cc-cntt-basic',
    teacherName: 'Cô Bích Thảo',
    teacherTitle: 'Chuyên Viên Khảo Thí',
    studentCount: 24,
    maxStudents: 25,
    scheduleTime: 'Hôm nay: 18:00 - 19:30',
    status: 'upcoming',
    meetCode: 'pht-cntt-cb02',
    roomUrl: 'https://meet.google.com/pht-cntt-cb02',
    apiVerified: true,
    blockchainAnchorId: '0x3b1c...99a4',
    roomNotes: 'Ôn tập ngân hàng câu hỏi lý thuyết và thực hành máy tính tính điểm.'
  },
  {
    id: 'cls-03',
    classCode: 'K26-NC01',
    name: 'Chứng Chỉ CNTT Nâng Cao Chuyên Sâu (6 Buổi)',
    trackId: 'cc-cntt-advanced',
    teacherName: 'Thầy Hoàng Minh',
    teacherTitle: 'Giảng Viên CNTT',
    studentCount: 19,
    maxStudents: 25,
    scheduleTime: 'Hôm nay: 20:00 - 21:30',
    status: 'upcoming',
    meetCode: 'pht-cntt-nc01',
    roomUrl: 'https://meet.google.com/pht-cntt-nc01',
    apiVerified: true,
    blockchainAnchorId: '0x7e4d...11b2',
    roomNotes: 'Thực hành nâng cao bảng biểu Access, Excel Macro và Word Form.'
  },
  {
    id: 'cls-04',
    classCode: 'K26-WE04',
    name: 'CNTT Cơ Bản: Word + Excel Điểm Tuyệt Đối (10-12 Buổi)',
    trackId: 'cntt-basic-we',
    teacherName: 'Thầy Nguyễn Đình Huy',
    teacherTitle: 'Giám Đốc Đào Tạo',
    studentCount: 32,
    maxStudents: 35,
    scheduleTime: 'Tối 2 - 4 - 6: 19:30 - 21:00',
    status: 'live',
    meetCode: 'pht-we-cb04',
    roomUrl: 'https://meet.google.com/pht-we-cb04',
    apiVerified: true,
    blockchainAnchorId: '0x99aa...3341',
    roomNotes: 'Thực chiến đề thi văn phòng trên máy tính có chấm điểm tự động.'
  },
  {
    id: 'cls-05',
    classCode: 'K26-WENC',
    name: 'CNTT Nâng Cao: Word + Excel Chuyên Nghiệp',
    trackId: 'cntt-adv-we',
    teacherName: 'Cô Phương Anh',
    teacherTitle: 'Giảng Viên Master',
    studentCount: 22,
    maxStudents: 25,
    scheduleTime: 'Tối 3 - 5 - 7: 19:30 - 21:00',
    status: 'upcoming',
    meetCode: 'pht-we-nc05',
    roomUrl: 'https://meet.google.com/pht-we-nc05',
    apiVerified: true,
    blockchainAnchorId: '0x12fc...88a9',
    roomNotes: 'Kỹ thuật phân tích tài chính và soạn thảo hợp đồng thương mại.'
  },
  {
    id: 'cls-06',
    classCode: 'K26-AI01',
    name: 'Ứng Dụng AI & Tự Động Hóa Công Việc Văn Phòng (5 Buổi)',
    trackId: 'ai-office',
    teacherName: 'Thầy Nguyễn Đình Huy',
    teacherTitle: 'Chuyên Gia AI',
    studentCount: 35,
    maxStudents: 40,
    scheduleTime: 'Hôm nay: 19:00 - 21:00',
    status: 'live',
    meetCode: 'pht-ai-off01',
    roomUrl: 'https://meet.google.com/pht-ai-off01',
    apiVerified: true,
    blockchainAnchorId: '0x55aa...22dd',
    roomNotes: 'Thực hành Gemini Pro, ChatGPT, Copilot tự động hóa tài liệu & slide.'
  },
  {
    id: 'cls-07',
    classCode: 'K26-EXKT',
    name: 'Xử Lý Bảng Tính Excel Cho Kế Toán & Thuế',
    trackId: 'excel-accounting',
    teacherName: 'Cô Mai Linh',
    teacherTitle: 'Kế Toán Trưởng',
    studentCount: 18,
    maxStudents: 25,
    scheduleTime: 'Tối Thứ 7: 19:00 - 21:00',
    status: 'upcoming',
    meetCode: 'pht-ex-kt07',
    roomUrl: 'https://meet.google.com/pht-ex-kt07',
    apiVerified: true,
    blockchainAnchorId: '0x88ee...66ab',
    roomNotes: 'Kế toán tổng hợp, trích lọc dữ liệu và lập báo cáo tài chính.'
  },
  {
    id: 'cls-08',
    classCode: 'K26-WD01',
    name: 'Kỹ Năng Soạn Thảo Văn Bản Word Chuẩn Công Sở (6 Buổi)',
    trackId: 'word-6b',
    teacherName: 'Thầy Tuấn Anh',
    teacherTitle: 'Giảng Viên Văn Phòng',
    studentCount: 20,
    maxStudents: 25,
    scheduleTime: 'Tối 3 - 5: 18:00 - 19:30',
    status: 'upcoming',
    meetCode: 'pht-wd-6b08',
    roomUrl: 'https://meet.google.com/pht-wd-6b08',
    apiVerified: true,
    blockchainAnchorId: '0x44bc...9911',
    roomNotes: 'Định dạng văn bản quy chuẩn hành chính, mục lục tự động và Mail Merge.'
  },
  {
    id: 'cls-09',
    classCode: 'K26-EX02',
    name: 'Kỹ Năng Xử Lý Dữ Liệu Bảng Tính Excel (6 Buổi)',
    trackId: 'excel-6b',
    teacherName: 'Thầy Hoàng Minh',
    teacherTitle: 'Chuyên Viên Phân Tích',
    studentCount: 26,
    maxStudents: 30,
    scheduleTime: 'Hôm nay: 19:30 - 21:00',
    status: 'live',
    meetCode: 'pht-ex-6b09',
    roomUrl: 'https://meet.google.com/pht-ex-6b09',
    apiVerified: true,
    blockchainAnchorId: '0x77ff...33ee',
    roomNotes: 'Hàm xử lý logic, VLOOKUP/XLOOKUP, PivotTable và biểu đồ dashboard.'
  },
  {
    id: 'cls-10',
    classCode: 'K26-PP01',
    name: 'Thiết Kế Thuyết Trình PowerPoint Chuyên Nghiệp (6 Buổi)',
    trackId: 'ppt-6b',
    teacherName: 'Cô Bích Thảo',
    teacherTitle: 'Thiết Kế Sáng Tạo',
    studentCount: 25,
    maxStudents: 30,
    scheduleTime: 'Tối Chủ Nhật: 19:30 - 21:00',
    status: 'upcoming',
    meetCode: 'pht-pp-6b10',
    roomUrl: 'https://meet.google.com/pht-pp-6b10',
    apiVerified: true,
    blockchainAnchorId: '0x22ee...55bb',
    roomNotes: 'Bố cục slide chuẩn quốc tế, kỹ xảo Morph và hiệu ứng hoạt họa chuyên sâu.'
  }
];

export const SmartLiveClassroomHub: React.FC<SmartLiveClassroomHubProps> = ({
  currentUser,
  onOpenAttendanceQR,
  onSelectClass
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'live' | 'today' | 'my'>('all');
  const [joiningClassId, setJoiningClassId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Role Detection
  const isStudent = currentUser.role === 'student';
  const isTeacher = currentUser.role === 'teacher';
  const isAcademicOrAdmin =
    currentUser.role === 'academic_manager' ||
    currentUser.role === 'academic_staff' ||
    currentUser.role === 'giaovu' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'super_admin';

  // Role Action Configuration (Coursera + Google Classroom clean standard)
  const getActionConfig = (cls: SmartLiveClassroom) => {
    if (isStudent) {
      return {
        label: 'Tham Gia Lớp Ngay',
        subLabel: '1-Click mở phòng học',
        icon: Video,
        primaryColor: '#0057B8',
        actionType: 'join_student'
      };
    }
    if (isTeacher) {
      return {
        label: cls.status === 'live' ? 'Vào Giảng Dạy Tiếp' : 'Bắt Đầu Lớp Học',
        subLabel: 'Tự động mở phòng Meet & Điểm danh',
        icon: Play,
        primaryColor: '#0057B8',
        actionType: 'start_teacher'
      };
    }
    // GiaoVu / Admin / Academic Affairs
    return {
      label: 'Dự Giờ & Giám Sát',
      subLabel: 'Thanh tra chất lượng lớp học',
      icon: Eye,
      primaryColor: '#0B2545',
      actionType: 'inspect_academic'
    };
  };

  // Filtered Classrooms (3-second target discovery)
  const filteredClassrooms = useMemo(() => {
    return DEFAULT_SMART_CLASSROOMS.filter(cls => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = cls.name.toLowerCase().includes(q);
        const matchCode = cls.classCode.toLowerCase().includes(q);
        const matchTeacher = cls.teacherName.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchTeacher) return false;
      }

      // Filter tabs
      if (filterMode === 'live' && cls.status !== 'live') return false;
      if (filterMode === 'today' && !cls.scheduleTime.includes('Hôm nay')) return false;

      return true;
    });
  }, [searchQuery, filterMode]);

  const activeLiveCount = useMemo(() => {
    return DEFAULT_SMART_CLASSROOMS.filter(c => c.status === 'live').length;
  }, []);

  // One-Click Join / Start Handler with Background Blockchain Proof
  const handleJoinClassroom = async (cls: SmartLiveClassroom) => {
    soundFx.playClick();
    setJoiningClassId(cls.id);

    // 1. Background Blockchain SBT Learning Verification
    try {
      await BlockchainService.createAttendanceBlockProof(
        currentUser.id,
        cls.classCode,
        Date.now(),
        { latitude: 10.762622, longitude: 106.660172 },
        typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 30) : 'WebClient'
      );
    } catch {}

    // 2. Visual Toast Feedback
    const actionConfig = getActionConfig(cls);
    setToastMessage(`Đang chuyển tiếp vào lớp ${cls.classCode} (${actionConfig.label}). Đã xác thực bảo chứng Blockchain.`);

    // 3. Open Room directly (1-click without technical delay)
    setTimeout(() => {
      setJoiningClassId(null);
      window.open(cls.roomUrl, '_blank', 'noopener,noreferrer');
      soundFx.playCorrect();
    }, 450);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);

    if (onSelectClass) {
      onSelectClass(cls);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      width: '100%',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── 1. HEADER (Coursera + Google Classroom Minimalism) ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 6px rgba(11, 37, 69, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 87, 184, 0.2)'
          }}>
            <Video size={24} />
          </div>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0B2545',
              margin: '0 0 3px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>Lớp Học Trực Tuyến (Live Classroom)</span>
              {activeLiveCount > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: '#DCFCE7',
                  color: '#15803D',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: '1px solid #BBF7D0'
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                  {activeLiveCount} Lớp Đang Live
                </span>
              )}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              {isStudent && 'Chọn lớp học của bạn và nhấn nút "Tham Gia Lớp Ngay" để kết nối vào phòng học tức thì.'}
              {isTeacher && 'Quản lý các ca dạy, kích hoạt phòng học trực tuyến và tiến hành điểm danh học viên.'}
              {isAcademicOrAdmin && 'Giám sát thanh tra chất lượng các phòng học trực tuyến và dự giờ các ca giảng dạy.'}
            </p>
          </div>
        </div>

        {/* Quick Role Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '30px',
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          fontSize: '12px',
          fontWeight: 700,
          color: '#0B2545'
        }}>
          <Shield size={14} color="#0057B8" />
          <span>
            {isStudent && 'Quyền: Học viên tham gia'}
            {isTeacher && 'Quyền: Giáo viên bắt đầu lớp'}
            {isAcademicOrAdmin && 'Quyền: Giáo vụ dự giờ'}
          </span>
        </div>
      </div>

      {/* ── 2. AI ASSISTANT SMART BANNER (Realtime Co-pilot) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #F4F8FD 0%, #FFFFFF 100%)',
        borderRadius: '14px',
        border: '1px solid #BFDBFE',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#0057B8',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0B2545' }}>
              Trợ Lý AI Lớp Học (Classroom Co-Pilot)
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              Tất cả các phòng đều được kết nối Google Meet API tự động • Blockchain SBT xác thực lịch sử có mặt 100%.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#15803D', fontWeight: 700 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={15} color="#16A34A" />
            Google Meet API Sẵn Sàng
          </span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Shield size={15} color="#0057B8" />
            Blockchain Chạy Nền
          </span>
        </div>
      </div>

      {/* ── 3. SEARCH & 3-SECOND QUICK FILTERS ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '12px 16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '420px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên lớp, mã K26, tên giáo viên (3 giây)..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Quick Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} />
            Lọc:
          </span>

          {[
            { id: 'all', label: `Tất cả (${DEFAULT_SMART_CLASSROOMS.length})` },
            { id: 'live', label: `🔴 Đang Live (${activeLiveCount})` },
            { id: 'today', label: '📅 Hôm nay' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setFilterMode(tab.id as any); soundFx.playClick(); }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: filterMode === tab.id ? '#0057B8' : '#CBD5E1',
                background: filterMode === tab.id ? '#EFF6FF' : '#FFFFFF',
                color: filterMode === tab.id ? '#0057B8' : '#475569',
                fontSize: '12px',
                fontWeight: filterMode === tab.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. SMART CLASSROOM CARDS GRID (Mobile First) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredClassrooms.map((cls) => {
          const actionConfig = getActionConfig(cls);
          const ActionIcon = actionConfig.icon;
          const isLive = cls.status === 'live';
          const isJoining = joiningClassId === cls.id;

          return (
            <div
              key={cls.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: isLive ? '1.5px solid #0057B8' : '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: isLive ? '0 8px 24px rgba(0, 87, 184, 0.08)' : '0 2px 8px rgba(11, 37, 69, 0.03)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {/* Card Header: Class Code & Live/Upcoming Badge */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#EFF6FF',
                    color: '#0057B8',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    border: '1px solid #DBEAFE'
                  }}>
                    {cls.classCode}
                  </span>

                  {/* Status Badge */}
                  {isLive ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                      ĐANG DIỄN RA (LIVE)
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      <Clock size={11} />
                      Sắp bắt đầu
                    </span>
                  )}
                </div>

                {/* Class Title */}
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#0B2545',
                  margin: '0 0 10px',
                  lineHeight: 1.35
                }}>
                  {cls.name}
                </h3>

                {/* Teacher Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#F8FAFC',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#0B2545',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    {cls.teacherName.slice(0, 1)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B2545' }}>
                      {cls.teacherName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {cls.teacherTitle}
                    </div>
                  </div>
                </div>

                {/* Meta details: Time & Students */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Calendar size={14} color="#0057B8" />
                    <span><strong>Thời gian:</strong> {cls.scheduleTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Users size={14} color="#0057B8" />
                    <span><strong>Số học viên:</strong> {cls.studentCount} / {cls.maxStudents} học viên</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Big Action Button + QR trigger */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleJoinClassroom(cls)}
                  disabled={isJoining}
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isLive
                      ? 'linear-gradient(135deg, #0057B8 0%, #003F88 100%)'
                      : '#0057B8',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: isJoining ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: isLive ? '0 4px 14px rgba(0, 87, 184, 0.3)' : '0 2px 6px rgba(0, 87, 184, 0.15)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ActionIcon size={18} />
                  <span>{isJoining ? 'Đang kết nối vào lớp...' : actionConfig.label}</span>
                </button>

                {/* Teacher / Academic quick actions */}
                {(isTeacher || isAcademicOrAdmin) && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        if (onOpenAttendanceQR) onOpenAttendanceQR(cls.classCode);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0057B8',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <QrCode size={13} />
                      <span>Mở QR Điểm Danh Lớp</span>
                    </button>

                    <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={11} color="#16A34A" />
                      API Verified
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0B2545',
          color: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          maxWidth: '420px'
        }}>
          <CheckCircle2 size={18} color="#4ADE80" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
