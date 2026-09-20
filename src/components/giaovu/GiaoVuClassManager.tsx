import React, { useState } from 'react';
import {
  Layers, Search, Edit2, ChevronRight, UserCheck, X
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

export interface ClassItem {
  id: string;
  classCode: string;
  name: string;
  courseTitle: string;
  teacherName: string;
  teacherId?: string;
  room: string;
  schedulePattern: string; // e.g. "T7 - CN (08:00 - 11:00)"
  currentEnrolled: number;
  maxCapacity: number;
  status: 'enrolling' | 'active' | 'completed' | 'paused';
  startDate: string;
}

export interface GiaoVuClassManagerProps {
  currentUser?: UserProfile;
  onBackToDashboard?: () => void;
  onSelectClass?: (classCode: string) => void;
}

export const GiaoVuClassManager: React.FC<GiaoVuClassManagerProps> = ({
  currentUser: _currentUser,
  onBackToDashboard,
  onSelectClass: _onSelectClass
}) => {
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: 'c-1',
      classCode: 'K26-WE01',
      name: 'Word, Excel, PowerPoint 3-in-1 Khóa 26',
      courseTitle: 'Word, Excel, PowerPoint (3 Buổi 1 môn)',
      teacherName: 'Thầy Nguyễn Đình Huy',
      room: 'Phòng LAB 01',
      schedulePattern: 'Sáng T7, CN (08:00 - 11:00)',
      currentEnrolled: 12,
      maxCapacity: 15,
      status: 'active',
      startDate: '10/05/2026'
    },
    {
      id: 'c-2',
      classCode: 'K26-CC01',
      name: 'Chứng Chỉ CNTT Cơ Bản Khóa 26',
      courseTitle: 'CC CNTT Cơ bản (6 buổi)',
      teacherName: 'Cô Hoàng Thị Mai',
      room: 'Phòng LAB 02',
      schedulePattern: 'Tối 2-4-6 (18:30 - 20:30)',
      currentEnrolled: 15,
      maxCapacity: 15,
      status: 'active',
      startDate: '12/05/2026'
    },
    {
      id: 'c-3',
      classCode: 'K26-AI01',
      name: 'Ứng Dụng AI Vào Công Việc Văn Phòng',
      courseTitle: 'Ứng dụng AI vào công việc Văn phòng (5 buổi)',
      teacherName: 'Thầy Đình Huy',
      room: 'Phòng Hội Thảo Online',
      schedulePattern: 'Tối 3-5-7 (19:00 - 21:00)',
      currentEnrolled: 8,
      maxCapacity: 20,
      status: 'enrolling',
      startDate: '25/05/2026'
    },
    {
      id: 'c-4',
      classCode: 'K25-WE02',
      name: 'Word & Excel Thực Chiến Khóa 25',
      courseTitle: 'CNTT Cơ bản: Word + Excel',
      teacherName: 'Thầy Trần Quốc Toàn',
      room: 'Phòng LAB 01',
      schedulePattern: 'Chiều T7, CN (14:00 - 17:00)',
      currentEnrolled: 14,
      maxCapacity: 15,
      status: 'completed',
      startDate: '01/04/2026'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<ClassItem | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('Thầy Nguyễn Đình Huy');

  const filteredClasses = classes.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.classCode.toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchTeacher = c.teacherName.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchTeacher) return false;
    }
    return true;
  });

  const handleSaveEdit = () => {
    if (!editingClass) return;
    soundFx.playCorrect();
    setClasses(prev => prev.map(c => c.id === editingClass.id ? editingClass : c));
    setEditingClass(null);
  };

  const handleSaveAssignTeacher = () => {
    if (!showAssignModal) return;
    soundFx.playCorrect();
    setClasses(prev => prev.map(c => c.id === showAssignModal.id ? { ...c, teacherName: selectedTeacher } : c));
    setShowAssignModal(null);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Giáo Vụ</span>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ fontSize: '13px', color: '#0057B8', fontWeight: 600 }}>Quản Lý Lớp Học</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={26} color="#0057B8" />
            Điều Phối & Quản Lý Lớp Học Đào Tạo
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>
            Theo dõi sĩ số, phân công giảng viên giảng dạy, xếp phòng và kiểm soát tiến độ các lớp học.
          </p>
        </div>

        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Bảng điều khiển
          </button>
        )}
      </div>

      {/* Filter & Controls Bar */}
      <div style={{
        background: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Status filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'Tất cả lớp' },
            { id: 'active', label: 'Đang học' },
            { id: 'enrolling', label: 'Đang tuyển sinh' },
            { id: 'completed', label: 'Đã hoàn thành' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setFilterStatus(f.id); soundFx.playClick(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: filterStatus === f.id ? '1px solid #0057B8' : '1px solid #E2E8F0',
                background: filterStatus === f.id ? '#EFF6FF' : '#FFFFFF',
                color: filterStatus === f.id ? '#0057B8' : '#64748B'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã lớp, tên lớp, giảng viên..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Classes Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Mã Lớp</th>
              <th style={{ padding: '12px 16px' }}>Tên Lớp / Khóa Đào Tạo</th>
              <th style={{ padding: '12px 16px' }}>Giảng Viên Phụ Trách</th>
              <th style={{ padding: '12px 16px' }}>Phòng Học & Lịch</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Sĩ Số</th>
              <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((cls, idx) => (
              <tr key={cls.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0057B8' }}>
                  {cls.classCode}
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{cls.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{cls.courseTitle}</div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EFF6FF', color: '#0057B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '11px' }}>
                      GV
                    </div>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{cls.teacherName}</span>
                  </div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ color: '#0F172A', fontWeight: 500 }}>{cls.room}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{cls.schedulePattern}</div>
                </td>

                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, color: cls.currentEnrolled >= cls.maxCapacity ? '#DC2626' : '#15803D' }}>
                    {cls.currentEnrolled}
                  </span>
                  <span style={{ color: '#94A3B8' }}> / {cls.maxCapacity}</span>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: cls.status === 'active' ? '#DCFCE7' : cls.status === 'enrolling' ? '#EFF6FF' : '#F1F5F9',
                    color: cls.status === 'active' ? '#15803D' : cls.status === 'enrolling' ? '#0057B8' : '#64748B'
                  }}>
                    {cls.status === 'active' ? 'Đang học' : cls.status === 'enrolling' ? 'Đang tuyển sinh' : 'Đã hoàn thành'}
                  </span>
                </td>

                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      onClick={() => setShowAssignModal(cls)}
                      title="Phân công Giảng viên"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#0057B8',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <UserCheck size={13} />
                      Phân công
                    </button>

                    <button
                      onClick={() => setEditingClass(cls)}
                      title="Chỉnh sửa thông tin"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Teacher Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Phân Công Giảng Viên: {showAssignModal.classCode}
              </h3>
              <button onClick={() => setShowAssignModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Chọn Giảng Viên Phụ Trách Lớp:
              </label>
              <select
                value={selectedTeacher}
                onChange={e => setSelectedTeacher(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="Thầy Nguyễn Đình Huy">Thầy Nguyễn Đình Huy (Chuyên gia Office & AI)</option>
                <option value="Cô Hoàng Thị Mai">Cô Hoàng Thị Mai (Chứng chỉ CNTT)</option>
                <option value="Thầy Trần Quốc Toàn">Thầy Trần Quốc Toàn (Thực hành Kế toán Excel)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowAssignModal(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAssignTeacher}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Lưu phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Sửa Thông Tin Lớp: {editingClass.classCode}
              </h3>
              <button onClick={() => setEditingClass(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Tên lớp học:</label>
                <input
                  type="text"
                  value={editingClass.name}
                  onChange={e => setEditingClass({ ...editingClass, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Phòng học:</label>
                <input
                  type="text"
                  value={editingClass.room}
                  onChange={e => setEditingClass({ ...editingClass, room: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Khung giờ & Ca học:</label>
                <input
                  type="text"
                  value={editingClass.schedulePattern}
                  onChange={e => setEditingClass({ ...editingClass, schedulePattern: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setEditingClass(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
