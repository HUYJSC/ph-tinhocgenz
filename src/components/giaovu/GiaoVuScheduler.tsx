import React, { useState } from 'react';
import {
  Calendar as CalendarIcon, Clock, MapPin, AlertTriangle,
  Plus, X, Video, User
} from 'lucide-react';
import { ClassScheduleItem } from '../../types/schedule';
import { UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

export interface GiaoVuSchedulerProps {
  currentUser?: UserProfile;
  schedules?: ClassScheduleItem[];
  onCreateSchedule?: (item: Partial<ClassScheduleItem>) => void;
  onUpdateSchedule?: (item: ClassScheduleItem) => void;
  onDeleteSchedule?: (id: string) => void;
  onBackToDashboard?: () => void;
}

interface ConflictInfo {
  type: 'ROOM_CONFLICT' | 'TEACHER_CONFLICT';
  message: string;
  itemA: ClassScheduleItem;
  itemB: ClassScheduleItem;
}

export const GiaoVuScheduler: React.FC<GiaoVuSchedulerProps> = ({
  currentUser: _currentUser,
  schedules: initialSchedules = [],
  onCreateSchedule,
  onDeleteSchedule,
  onBackToDashboard
}) => {
  const [schedules, setSchedules] = useState<ClassScheduleItem[]>(() => {
    if (initialSchedules.length > 0) return initialSchedules;
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'sch-1',
        title: 'Word, Excel, PowerPoint 3-in-1 - Buổi 8',
        date: today,
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '11:00',
        shift: 'morning',
        track: 'office-fast-3in1',
        classCode: 'K26-WE01',
        room: 'Phòng LAB 01',
        teacherName: 'Thầy Nguyễn Đình Huy',
        teacherId: 't1',
        lessonNumber: 8,
        totalLessons: 12,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sch-2',
        title: 'CC CNTT Cơ bản (6 buổi) - Buổi 5',
        date: today,
        dayOfWeek: 6,
        startTime: '14:00',
        endTime: '17:00',
        shift: 'afternoon',
        track: 'cc-cntt-basic',
        classCode: 'K26-CC01',
        room: 'Phòng LAB 02',
        teacherName: 'Cô Hoàng Thị Mai',
        teacherId: 't2',
        lessonNumber: 5,
        totalLessons: 6,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sch-3',
        title: 'Ứng dụng AI vào công việc Văn phòng - Buổi 2',
        date: today,
        dayOfWeek: 6,
        startTime: '18:30',
        endTime: '20:30',
        shift: 'evening',
        track: 'ai-office',
        classCode: 'K26-AI01',
        room: 'Phòng Hội Thảo Online',
        onlineMeetingUrl: 'https://meet.google.com/ph-tinhocgenz-ai',
        teacherName: 'Thầy Nguyễn Đình Huy',
        teacherId: 't1',
        lessonNumber: 2,
        totalLessons: 5,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSchedule, setNewSchedule] = useState<Partial<ClassScheduleItem>>({
    date: selectedDate,
    startTime: '08:00',
    endTime: '11:00',
    classCode: 'K26-WE01',
    room: 'Phòng LAB 01',
    teacherName: 'Thầy Nguyễn Đình Huy',
    title: 'Word, Excel, PowerPoint 3-in-1',
    track: 'office-fast-3in1',
    shift: 'morning',
    dayOfWeek: 6,
    lessonNumber: 1,
    totalLessons: 12,
    status: 'upcoming'
  });

  // Conflict Detection Algorithm
  const detectConflicts = (items: ClassScheduleItem[]): ConflictInfo[] => {
    const conflicts: ConflictInfo[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];

        // Same date and time overlap check
        if (a.date === b.date) {
          const timeOverlap = !(a.endTime <= b.startTime || a.startTime >= b.endTime);
          if (timeOverlap) {
            // Check Room conflict
            if (a.room && b.room && a.room === b.room && !a.room.toLowerCase().includes('online')) {
              conflicts.push({
                type: 'ROOM_CONFLICT',
                message: `Xung đột trùng phòng: "${a.room}" được xếp cùng lúc cho lớp [${a.classCode}] và [${b.classCode}] (${a.startTime} - ${a.endTime}).`,
                itemA: a,
                itemB: b
              });
            }

            // Check Teacher conflict
            if (a.teacherName && b.teacherName && a.teacherName === b.teacherName) {
              conflicts.push({
                type: 'TEACHER_CONFLICT',
                message: `Xung đột giảng viên: ${a.teacherName} bị trùng lịch dạy cùng lúc ở lớp [${a.classCode}] và [${b.classCode}] (${a.startTime} - ${a.endTime}).`,
                itemA: a,
                itemB: b
              });
            }
          }
        }
      }
    }
    return conflicts;
  };

  const conflicts = detectConflicts(schedules);

  const handleSaveNewSchedule = () => {
    // Check if new item creates conflict
    const prospectiveItem: ClassScheduleItem = {
      id: 'sch-' + Date.now(),
      title: newSchedule.title || 'Ca học mới',
      date: newSchedule.date || selectedDate,
      startTime: newSchedule.startTime || '08:00',
      endTime: newSchedule.endTime || '11:00',
      classCode: newSchedule.classCode || 'K26-WE01',
      room: newSchedule.room || 'Phòng LAB 01',
      teacherName: newSchedule.teacherName || 'Thầy Nguyễn Đình Huy',
      teacherId: 't1',
      track: (newSchedule.track || 'office-fast-3in1') as any,
      shift: (newSchedule.shift || 'morning') as any,
      dayOfWeek: 6,
      lessonNumber: newSchedule.lessonNumber || 1,
      totalLessons: newSchedule.totalLessons || 12,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };

    const prospective = [...schedules, prospectiveItem];
    const prospectiveConflicts = detectConflicts(prospective);

    if (prospectiveConflicts.length > conflicts.length) {
      soundFx.playIncorrect();
      alert(`⚠️ Phát hiện xung đột lịch đào tạo:\n\n${prospectiveConflicts[prospectiveConflicts.length - 1].message}\n\nVui lòng chọn phòng học hoặc ca học khác!`);
      return;
    }

    soundFx.playCorrect();
    setSchedules(prospective);
    if (onCreateSchedule) onCreateSchedule(prospectiveItem);
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    soundFx.playClick();
    if (window.confirm('Bạn có chắc chắn muốn xóa buổi học này khỏi lịch đào tạo?')) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      if (onDeleteSchedule) onDeleteSchedule(id);
    }
  };

  const filteredSchedules = viewMode === 'day'
    ? schedules.filter(s => s.date === selectedDate)
    : schedules;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Giáo Vụ</span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>›</span>
            <span style={{ fontSize: '13px', color: '#0057B8', fontWeight: 600 }}>Lịch & Phân Công Giảng Dạy</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={26} color="#0057B8" />
            Lịch Đào Tạo & Điều Độ Giảng Dạy
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>
            Sắp xếp thời khóa biểu, phân bổ phòng máy LAB và tự động phát hiện xung đột giảng viên.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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

          <button
            onClick={() => { setShowAddModal(true); soundFx.playClick(); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#0057B8',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            Thêm ca học mới
          </button>
        </div>
      </div>

      {/* Conflicts Alert Banner */}
      {conflicts.length > 0 && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #F87171',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 700, fontSize: '14px' }}>
            <AlertTriangle size={18} color="#DC2626" />
            CẢNH BÁO: Phát hiện {conflicts.length} xung đột lịch đào tạo cần xử lý ngay!
          </div>
          {conflicts.map((c, idx) => (
            <div key={idx} style={{ fontSize: '13px', color: '#B91C1C', paddingLeft: '26px' }}>
              • {c.message}
            </div>
          ))}
        </div>
      )}

      {/* Controls Bar: View mode + Date selector */}
      <div style={{
        background: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* View Mode Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['day', 'week', 'month'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); soundFx.playClick(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: viewMode === mode ? '1px solid #0057B8' : '1px solid #CBD5E1',
                background: viewMode === mode ? '#EFF6FF' : '#FFFFFF',
                color: viewMode === mode ? '#0057B8' : '#64748B'
              }}
            >
              {mode === 'day' ? 'Hôm nay' : mode === 'week' ? 'Tuần này' : 'Toàn bộ'}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Chọn ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              color: '#0F172A'
            }}
          />
        </div>
      </div>

      {/* Schedule Grid / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredSchedules.map((sch, idx) => {
          const isConflict = conflicts.some(c => c.itemA.id === sch.id || c.itemB.id === sch.id);
          return (
            <div
              key={sch.id || idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: isConflict ? '2px solid #EF4444' : '1px solid #E2E8F0',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: isConflict ? '0 0 12px rgba(239, 68, 68, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Time Box */}
                <div style={{
                  width: '80px',
                  padding: '10px 0',
                  borderRadius: '10px',
                  background: isConflict ? '#FEF2F2' : '#EFF6FF',
                  color: isConflict ? '#DC2626' : '#0057B8',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
                    {sch.startTime}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{sch.endTime}</span>
                </div>

                {/* Class Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0057B8', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                      {sch.classCode}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                      {sch.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User size={14} color="#0057B8" />
                      <strong>{sch.teacherName || 'Chưa phân công'}</strong>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={14} color="#16A34A" />
                      {sch.room || 'Phòng LAB 01'}
                    </span>
                    <span>•</span>
                    <span>Ngày: <strong>{sch.date}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {sch.onlineMeetingUrl && (
                  <a
                    href={sch.onlineMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#0057B8',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Video size={13} />
                    Link Meet
                  </a>
                )}

                <button
                  onClick={() => handleDelete(sch.id)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy ca
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Schedule Modal */}
      {showAddModal && (
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
                Thêm Ca Học Mới & Kiểm Tra Xung Đột
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Mã & Tên Lớp:</label>
                <input
                  type="text"
                  value={newSchedule.classCode}
                  onChange={e => setNewSchedule({ ...newSchedule, classCode: e.target.value })}
                  placeholder="e.g. K26-WE01"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Ngày học:</label>
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Phòng học:</label>
                  <select
                    value={newSchedule.room}
                    onChange={e => setNewSchedule({ ...newSchedule, room: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Phòng LAB 01">Phòng LAB 01</option>
                    <option value="Phòng LAB 02">Phòng LAB 02</option>
                    <option value="Phòng LAB 03">Phòng LAB 03</option>
                    <option value="Phòng Hội Thảo Online">Phòng Hội Thảo Online</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={e => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Giảng viên:</label>
                <select
                  value={newSchedule.teacherName}
                  onChange={e => setNewSchedule({ ...newSchedule, teacherName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  <option value="Thầy Nguyễn Đình Huy">Thầy Nguyễn Đình Huy</option>
                  <option value="Cô Hoàng Thị Mai">Cô Hoàng Thị Mai</option>
                  <option value="Thầy Trần Quốc Toàn">Thầy Trần Quốc Toàn</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNewSchedule}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Lưu ca học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

