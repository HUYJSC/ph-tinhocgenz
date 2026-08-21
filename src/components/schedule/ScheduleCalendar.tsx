import React, { useState } from 'react';
import { ClassScheduleItem, ShiftTimeSlot } from '../../types/schedule';
import { UserProfile, TRACK_LABELS, CurriculumTrack } from '../../types/auth';
import {
  Calendar, MapPin, Video, User, PlusCircle, Trash2,
  CheckCircle2, X
} from 'lucide-react';

interface ScheduleCalendarProps {
  currentUser: UserProfile;
  schedules: ClassScheduleItem[];
  onCreateSchedule: (data: Omit<ClassScheduleItem, 'id' | 'createdAt'>) => void;
  onUpdateSchedule: (item: ClassScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onNavigateToAttendance?: () => void;
}

const DAY_NAMES: { [key: number]: string } = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  0: 'Chủ Nhật'
};

const SHIFT_LABELS: { [key in ShiftTimeSlot]: { label: string; time: string; color: string; bg: string } } = {
  morning: { label: 'Ca Sáng', time: '08:00 - 10:00', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  afternoon: { label: 'Ca Chiều', time: '14:00 - 16:00', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  evening: { label: 'Ca Tối', time: '18:30 - 20:30', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
};

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  currentUser,
  schedules,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onNavigateToAttendance
}) => {
  const isStaff = currentUser.role === 'admin' || currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';

  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassScheduleItem | null>(null);

  // Form states for creating/editing
  const [formTitle, setFormTitle] = useState('');
  const [formTrack, setFormTrack] = useState<CurriculumTrack>(currentUser.programTrack || 'office-fast-3in1');
  const [formClassCode, setFormClassCode] = useState('K26-WE01');
  const [formTeacherName, setFormTeacherName] = useState(currentUser.name || 'Thầy Quang Huy');
  const [formDayOfWeek, setFormDayOfWeek] = useState<number>(1);
  const [formDate, setFormDate] = useState('2026-08-24');
  const [formStartTime, setFormStartTime] = useState('18:30');
  const [formEndTime, setFormEndTime] = useState('20:30');
  const [formShift, setFormShift] = useState<ShiftTimeSlot>('evening');
  const [formRoom, setFormRoom] = useState('Phòng LAB 01 (Tầng 2)');
  const [formMeetingUrl, setFormMeetingUrl] = useState('https://meet.google.com/ph-tinhocgenz-lab01');
  const [formLessonNumber, setFormLessonNumber] = useState<number>(1);
  const [formTotalLessons, setFormTotalLessons] = useState<number>(3);
  const [formNotes, setFormNotes] = useState('');

  // Filter schedules based on user role and selected filters
  const userEnrolledTracks = currentUser.enrolledTracks || (currentUser.programTrack ? [currentUser.programTrack] : []);

  const filteredSchedules = schedules.filter(sch => {
    // If student, filter only to their enrolled tracks
    if (isStudent && userEnrolledTracks.length > 0) {
      if (!userEnrolledTracks.includes(sch.track)) return false;
    }
    // If teacher (and not admin), filter by their name / teacherId
    if (currentUser.role === 'teacher') {
      const matchName = sch.teacherName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
        currentUser.name.toLowerCase().includes(sch.teacherName.toLowerCase());
      if (!matchName && !userEnrolledTracks.includes(sch.track)) return false;
    }
    // User filters
    if (selectedTrack !== 'all' && sch.track !== selectedTrack) return false;
    if (selectedDay !== 'all' && sch.dayOfWeek !== selectedDay) return false;
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormTitle('Buổi Học Mới: Kỹ Năng Thực Hành');
    setFormTrack(currentUser.programTrack || 'office-fast-3in1');
    setFormClassCode('K26-WE01');
    setFormTeacherName(currentUser.name || 'Thầy Quang Huy');
    setFormDayOfWeek(1);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('18:30');
    setFormEndTime('20:30');
    setFormShift('evening');
    setFormRoom('Phòng LAB 01 (Tầng 2)');
    setFormMeetingUrl('');
    setFormLessonNumber(1);
    setFormTotalLessons(6);
    setFormNotes('');
    setIsCreateModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      onUpdateSchedule({
        ...editingItem,
        title: formTitle.trim(),
        track: formTrack,
        classCode: formClassCode.trim(),
        teacherName: formTeacherName.trim(),
        dayOfWeek: formDayOfWeek,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        shift: formShift,
        room: formRoom.trim(),
        onlineMeetingUrl: formMeetingUrl.trim() || undefined,
        lessonNumber: formLessonNumber,
        totalLessons: formTotalLessons,
        notes: formNotes.trim() || undefined
      });
    } else {
      onCreateSchedule({
        title: formTitle.trim(),
        track: formTrack,
        classCode: formClassCode.trim(),
        teacherId: currentUser.id,
        teacherName: formTeacherName.trim(),
        dayOfWeek: formDayOfWeek,
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        shift: formShift,
        room: formRoom.trim(),
        onlineMeetingUrl: formMeetingUrl.trim() || undefined,
        lessonNumber: formLessonNumber,
        totalLessons: formTotalLessons,
        notes: formNotes.trim() || undefined,
        status: 'upcoming'
      });
    }
    setIsCreateModalOpen(false);
  };

  // Group schedules by day of week for Week View
  const daysOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      
      {/* ── HEADER BANNER ── */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          background: isStudent
            ? 'linear-gradient(135deg, rgba(79, 110, 247, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
          borderRadius: '16px',
          marginBottom: '16px',
          border: isStudent ? '1px solid rgba(79, 110, 247, 0.18)' : '1px solid rgba(217, 119, 6, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: isStudent ? 'var(--brand)' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Calendar size={18} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {isStudent ? `Thời Khóa Biểu: ${currentUser.name}` : 'Quản Lý Thời Khóa Biểu & Lịch Giảng Dạy'}
            </h2>
            <span style={{
              fontSize: '0.7rem',
              background: isStudent ? 'rgba(79, 110, 247, 0.1)' : 'rgba(217, 119, 6, 0.1)',
              color: isStudent ? 'var(--brand)' : '#d97706',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 800
            }}>
              {filteredSchedules.length} ca học
            </span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {isStudent
              ? 'Lịch học phòng máy LAB và đường dẫn Google Meet trực tuyến theo tuần'
              : 'Theo dõi ca đứng lớp, phân công phòng máy và thiết lập thời khóa biểu'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'week' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'week' ? 'var(--brand)' : 'var(--text-secondary)',
                fontWeight: viewMode === 'week' ? 800 : 500,
                fontSize: '0.76rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'week' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Lưới Tuần
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                border: 'none',
                background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
                color: viewMode === 'list' ? 'var(--brand)' : 'var(--text-secondary)',
                fontWeight: viewMode === 'list' ? 800 : 500,
                fontSize: '0.76rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Danh Sách
            </button>
          </div>

          {/* Teacher/Admin Add Schedule Button */}
          {isStaff && (
            <button
              onClick={handleOpenCreateModal}
              className="btn btn-primary"
              style={{
                padding: '6px 14px',
                height: '34px',
                minHeight: '34px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
              }}
            >
              <PlusCircle size={15} />
              <span>Thêm Ca Học</span>
            </button>
          )}
        </div>
      </div>

      {/* ── DAY & TRACK FILTER BAR ── */}
      <div className="horizontal-scroll" style={{ marginBottom: '16px', paddingBottom: '4px' }}>
        <select
          value={selectedTrack}
          onChange={e => setSelectedTrack(e.target.value)}
          style={{
            minHeight: '34px',
            fontSize: '0.78rem',
            padding: '4px 24px 4px 10px',
            borderRadius: '10px',
            background: selectedTrack !== 'all' ? 'var(--brand-light)' : 'var(--bg-card)',
            color: selectedTrack !== 'all' ? 'var(--brand)' : 'var(--text-secondary)',
            fontWeight: selectedTrack !== 'all' ? 800 : 500,
            border: selectedTrack !== 'all' ? '1.5px solid var(--brand)' : '1px solid var(--border-color)',
            flexShrink: 0
          }}
        >
          <option value="all">Tất cả môn học</option>
          {Object.entries(TRACK_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <button
          onClick={() => setSelectedDay('all')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '10px',
            border: selectedDay === 'all' ? '1.5px solid var(--brand)' : '1px solid var(--border-color)',
            background: selectedDay === 'all' ? 'var(--bg-card)' : 'transparent',
            color: selectedDay === 'all' ? 'var(--brand)' : 'var(--text-secondary)',
            fontWeight: selectedDay === 'all' ? 800 : 500,
            fontSize: '0.78rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <span>Tất cả các ngày</span>
        </button>

        {daysOrder.map(dayNum => (
          <button
            key={dayNum}
            onClick={() => setSelectedDay(dayNum)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
              border: selectedDay === dayNum ? '1.5px solid var(--brand)' : '1px solid var(--border-color)',
              background: selectedDay === dayNum ? 'var(--bg-card)' : 'transparent',
              color: selectedDay === dayNum ? 'var(--brand)' : 'var(--text-secondary)',
              fontWeight: selectedDay === dayNum ? 800 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{DAY_NAMES[dayNum]}</span>
          </button>
        ))}
      </div>

      {/* ── 1. WEEKLY GRID VIEW ── */}
      {viewMode === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {daysOrder
            .filter(d => selectedDay === 'all' || selectedDay === d)
            .map(dayNum => {
              const daySchedules = filteredSchedules.filter(s => s.dayOfWeek === dayNum);
              return (
                <div
                  key={dayNum}
                  className="card"
                  style={{
                    borderRadius: '14px',
                    padding: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '200px'
                  }}
                >
                  {/* Day Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '8px',
                    marginBottom: '10px'
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {DAY_NAMES[dayNum]}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: daySchedules.length > 0 ? 'var(--brand)' : 'var(--text-muted)',
                      background: daySchedules.length > 0 ? 'var(--brand-light)' : 'var(--bg-secondary)',
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}>
                      {daySchedules.length} ca
                    </span>
                  </div>

                  {/* Day Schedule Items */}
                  {daySchedules.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Không có lịch học
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {daySchedules.map(sch => {
                        const shiftInfo = SHIFT_LABELS[sch.shift] || SHIFT_LABELS.evening;
                        return (
                          <div
                            key={sch.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '12px',
                              background: 'var(--bg-secondary)',
                              borderLeft: `4px solid ${shiftInfo.color}`,
                              borderTop: '1px solid var(--border-color)',
                              borderRight: '1px solid var(--border-color)',
                              borderBottom: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            {/* Time & Shift */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                color: shiftInfo.color,
                                background: shiftInfo.bg,
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}>
                                {shiftInfo.label} • {sch.startTime} - {sch.endTime}
                              </span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {sch.classCode}
                              </span>
                            </div>

                            {/* Title & Lesson number */}
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {sch.title}
                            </div>

                            {/* Info Rows */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <MapPin size={12} color="var(--brand)" />
                                <span>{sch.room}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <User size={12} color="#10b981" />
                                <span>{sch.teacherName} • Buổi {sch.lessonNumber}/{sch.totalLessons}</span>
                              </div>
                            </div>

                            {/* Actions (Join Meet / Check In) */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
                              {sch.onlineMeetingUrl && (
                                <a
                                  href={sch.onlineMeetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--brand)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    textDecoration: 'none'
                                  }}
                                >
                                  <Video size={12} />
                                  <span>Vào Meet</span>
                                </a>
                              )}

                              {isStudent && onNavigateToAttendance && (
                                <button
                                  onClick={onNavigateToAttendance}
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: 'var(--brand)',
                                    color: '#fff',
                                    border: 'none',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  <span>Điểm Danh</span>
                                </button>
                              )}

                              {isStaff && (
                                <button
                                  onClick={() => onDeleteSchedule(sch.id)}
                                  title="Xóa ca học này"
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ── 2. PROGRESSION LIST VIEW ── */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredSchedules.length === 0 ? (
            <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Không có ca học nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredSchedules.map(sch => {
              const shiftInfo = SHIFT_LABELS[sch.shift] || SHIFT_LABELS.evening;
              return (
                <div
                  key={sch.id}
                  className="card"
                  style={{
                    padding: '16px 18px',
                    borderRadius: '14px',
                    borderLeft: `5px solid ${shiftInfo.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* Lesson Number Circle */}
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: shiftInfo.bg,
                      color: shiftInfo.color,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      lineHeight: 1.1,
                      flexShrink: 0
                    }}>
                      <span>Buổi</span>
                      <span style={{ fontSize: '0.95rem' }}>{sch.lessonNumber}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: shiftInfo.color, background: shiftInfo.bg, padding: '2px 8px', borderRadius: '6px' }}>
                          {DAY_NAMES[sch.dayOfWeek]} • {sch.startTime} - {sch.endTime}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-light)', padding: '2px 8px', borderRadius: '6px' }}>
                          {TRACK_LABELS[sch.track] || sch.track}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {sch.classCode}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                        {sch.title}
                      </h4>

                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.76rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="var(--brand)" />
                          <span>{sch.room}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={13} color="#10b981" />
                          <span>{sch.teacherName}</span>
                        </span>
                        {sch.notes && (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            📝 {sch.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sch.onlineMeetingUrl && (
                      <a
                        href={sch.onlineMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, borderRadius: '8px', textDecoration: 'none' }}
                      >
                        <Video size={14} />
                        <span>Học Trực Tuyến</span>
                      </a>
                    )}

                    {isStudent && onNavigateToAttendance && (
                      <button
                        onClick={onNavigateToAttendance}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '8px' }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Điểm Danh</span>
                      </button>
                    )}

                    {isStaff && (
                      <button
                        onClick={() => onDeleteSchedule(sch.id)}
                        className="btn btn-icon"
                        title="Xóa ca học"
                        style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── MODAL: TẠO / SỬA CA HỌC (CHO GIẢNG VIÊN / ADMIN) ── */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="card animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '24px',
              background: 'var(--bg-card)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="#d97706" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Thêm Ca Học Mới Vào Thời Khóa Biểu
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-icon"
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Tiêu Đề Ca Học / Nội Dung Giảng Dạy:
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="VD: Buổi 1: Kỹ năng định dạng Word & Styles"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.84rem', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Phân Hệ Đào Tạo:
                  </label>
                  <select
                    value={formTrack}
                    onChange={e => setFormTrack(e.target.value as CurriculumTrack)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    {Object.entries(TRACK_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Mã Lớp Học:
                  </label>
                  <input
                    type="text"
                    required
                    value={formClassCode}
                    onChange={e => setFormClassCode(e.target.value)}
                    placeholder="VD: K26-WE01"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Thứ Trong Tuần:
                  </label>
                  <select
                    value={formDayOfWeek}
                    onChange={e => setFormDayOfWeek(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    <option value={1}>Thứ Hai</option>
                    <option value={2}>Thứ Ba</option>
                    <option value={3}>Thứ Tư</option>
                    <option value={4}>Thứ Năm</option>
                    <option value={5}>Thứ Sáu</option>
                    <option value={6}>Thứ Bảy</option>
                    <option value={0}>Chủ Nhật</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Khung Giờ (Ca):
                  </label>
                  <select
                    value={formShift}
                    onChange={e => {
                      const sh = e.target.value as ShiftTimeSlot;
                      setFormShift(sh);
                      if (sh === 'morning') { setFormStartTime('08:00'); setFormEndTime('10:00'); }
                      else if (sh === 'afternoon') { setFormStartTime('14:00'); setFormEndTime('16:00'); }
                      else { setFormStartTime('18:30'); setFormEndTime('20:30'); }
                    }}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', borderRadius: '10px' }}
                  >
                    <option value="morning">Ca Sáng (08:00 - 10:00)</option>
                    <option value="afternoon">Ca Chiều (14:00 - 16:00)</option>
                    <option value="evening">Ca Tối (18:30 - 20:30)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Số Buổi Học:
                  </label>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formLessonNumber}
                      onChange={e => setFormLessonNumber(Number(e.target.value))}
                      style={{ width: '50px', padding: '8px 6px', fontSize: '0.82rem', borderRadius: '8px', textAlign: 'center' }}
                    />
                    <span>/</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={formTotalLessons}
                      onChange={e => setFormTotalLessons(Number(e.target.value))}
                      style={{ width: '50px', padding: '8px 6px', fontSize: '0.82rem', borderRadius: '8px', textAlign: 'center' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Phòng Học / Địa Điểm:
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoom}
                    onChange={e => setFormRoom(e.target.value)}
                    placeholder="VD: Phòng LAB 01 (Tầng 2)"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Giảng Viên Đứng Lớp:
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeacherName}
                    onChange={e => setFormTeacherName(e.target.value)}
                    placeholder="VD: Cô Thu Minh"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Đường Dẫn Học Online (Google Meet / Zoom - Tùy chọn):
                </label>
                <input
                  type="url"
                  value={formMeetingUrl}
                  onChange={e => setFormMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Ghi Chú Cho Học Viên:
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="VD: Chuẩn bị file bài tập trước khi vào lớp"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                  }}
                >
                  Lưu Ca Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
