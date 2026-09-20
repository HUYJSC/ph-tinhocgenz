import React, { useState } from 'react';
import {
  CheckSquare, Search, ChevronRight, X,
  UserCheck, AlertCircle
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { soundFx } from '../../utils/audio';

export interface EnrollmentOrder {
  id: string;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
  courseTitle: string;
  trackId: string;
  assignedClassCode?: string;
  amountVnd: number;
  paymentMethod: 'vnpay' | 'banking' | 'cash';
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
}

export interface GiaoVuEnrollmentManagerProps {
  currentUser?: UserProfile;
  onBackToDashboard?: () => void;
}

export const GiaoVuEnrollmentManager: React.FC<GiaoVuEnrollmentManagerProps> = ({
  currentUser: _currentUser,
  onBackToDashboard
}) => {
  const [enrollments, setEnrollments] = useState<EnrollmentOrder[]>([
    {
      id: 'enr-1',
      studentName: 'Nguyễn Hoàng Nam',
      studentPhone: '0912 345 678',
      studentEmail: 'nam.nh@gmail.com',
      courseTitle: 'Word, Excel, PowerPoint (3 Buổi 1 môn)',
      trackId: 'office-fast-3in1',
      amountVnd: 1500000,
      paymentMethod: 'banking',
      paymentStatus: 'paid',
      status: 'pending',
      registeredAt: '20/09/2026 09:15'
    },
    {
      id: 'enr-2',
      studentName: 'Trần Thị Bảo Ngọc',
      studentPhone: '0988 765 432',
      studentEmail: 'ngoc.bao@gmail.com',
      courseTitle: 'CC CNTT Cơ bản (6 buổi)',
      trackId: 'cc-cntt-basic',
      amountVnd: 1800000,
      paymentMethod: 'vnpay',
      paymentStatus: 'paid',
      status: 'pending',
      registeredAt: '20/09/2026 08:30'
    },
    {
      id: 'enr-3',
      studentName: 'Lê Minh Khoa',
      studentPhone: '0903 112 233',
      studentEmail: 'khoa.lm@gmail.com',
      courseTitle: 'Ứng dụng AI vào công việc Văn phòng',
      trackId: 'ai-office',
      amountVnd: 2200000,
      paymentMethod: 'banking',
      paymentStatus: 'paid',
      status: 'approved',
      assignedClassCode: 'K26-AI01',
      registeredAt: '19/09/2026 15:40'
    },
    {
      id: 'enr-4',
      studentName: 'Phạm Ngọc Anh',
      studentPhone: '0977 889 900',
      studentEmail: 'anh.pn@gmail.com',
      courseTitle: 'Word, Excel, PowerPoint (3 Buổi 1 môn)',
      trackId: 'office-fast-3in1',
      amountVnd: 1500000,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      status: 'rejected',
      registeredAt: '18/09/2026 11:20'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingOrder, setApprovingOrder] = useState<EnrollmentOrder | null>(null);
  const [selectedClassCode, setSelectedClassCode] = useState('K26-WE01');

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const approvedCount = enrollments.filter(e => e.status === 'approved').length;
  const rejectedCount = enrollments.filter(e => e.status === 'rejected').length;

  const filteredOrders = enrollments.filter(e => {
    if (activeTab !== 'all' && e.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.studentName.toLowerCase().includes(q);
      const matchPhone = e.studentPhone.includes(q);
      const matchCourse = e.courseTitle.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCourse) return false;
    }
    return true;
  });

  const handleOpenApproveModal = (order: EnrollmentOrder) => {
    setApprovingOrder(order);
    setSelectedClassCode(order.trackId === 'office-fast-3in1' ? 'K26-WE01' : order.trackId === 'ai-office' ? 'K26-AI01' : 'K26-CC01');
    soundFx.playClick();
  };

  const handleConfirmApprove = () => {
    if (!approvingOrder) return;
    soundFx.playCorrect();
    setEnrollments(prev =>
      prev.map(e => e.id === approvingOrder.id ? { ...e, status: 'approved', assignedClassCode: selectedClassCode } : e)
    );
    setApprovingOrder(null);
  };

  const handleReject = (id: string) => {
    soundFx.playClick();
    if (window.confirm('Xác nhận từ chối đơn đăng ký này?')) {
      setEnrollments(prev =>
        prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e)
      );
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Giáo Vụ</span>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ fontSize: '13px', color: '#0057B8', fontWeight: 600 }}>Duyệt Đăng Ký Khóa Học</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={26} color="#0057B8" />
            Quản Lý & Duyệt Đơn Đăng Ký Tuyển Sinh
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748B' }}>
            Xác nhận học phí, phân lớp chính thức và cấp tài khoản học viên mới vào hệ thống.
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

      {/* Filter Tabs & Search */}
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'pending', label: `Chờ duyệt (${pendingCount})` },
            { id: 'approved', label: `Đã duyệt (${approvedCount})` },
            { id: 'rejected', label: `Từ chối (${rejectedCount})` },
            { id: 'all', label: `Tất cả (${enrollments.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); soundFx.playClick(); }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeTab === tab.id ? '1px solid #0057B8' : '1px solid #CBD5E1',
                background: activeTab === tab.id ? '#EFF6FF' : '#FFFFFF',
                color: activeTab === tab.id ? '#0057B8' : '#64748B'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo học viên, SĐT, khóa học..."
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

      {/* Orders Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
              <th style={{ padding: '12px 16px' }}>Học Viên</th>
              <th style={{ padding: '12px 16px' }}>Khóa Học Đăng Ký</th>
              <th style={{ padding: '12px 16px' }}>Học Phí</th>
              <th style={{ padding: '12px 16px' }}>Thanh Toán</th>
              <th style={{ padding: '12px 16px' }}>Lớp Xếp Chỗ</th>
              <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#94A3B8' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                  Không có đơn đăng ký nào trong mục này.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, idx) => (
                <tr key={order.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{order.studentName}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{order.studentPhone} • {order.studentEmail}</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{order.courseTitle}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Đăng ký: {order.registeredAt}</div>
                  </td>

                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0057B8' }}>
                    {order.amountVnd.toLocaleString('vi-VN')} đ
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: order.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF3C7',
                      color: order.paymentStatus === 'paid' ? '#15803D' : '#D97706'
                    }}>
                      {order.paymentStatus === 'paid' ? 'Đã thu' : 'Chờ đối soát'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {order.assignedClassCode ? (
                      <span style={{ fontWeight: 700, color: '#0F172A', background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px' }}>
                        {order.assignedClassCode}
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>Chưa xếp lớp</span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: order.status === 'approved' ? '#DCFCE7' : order.status === 'pending' ? '#EFF6FF' : '#FEE2E2',
                      color: order.status === 'approved' ? '#15803D' : order.status === 'pending' ? '#0057B8' : '#DC2626'
                    }}>
                      {order.status === 'approved' ? 'Đã duyệt' : order.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    {order.status === 'pending' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenApproveModal(order)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#0057B8',
                            border: 'none',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <UserCheck size={13} />
                          Duyệt & Xếp lớp
                        </button>

                        <button
                          onClick={() => handleReject(order.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#DC2626',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>Hoàn tất</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approve & Assign Class Modal */}
      {approvingOrder && (
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
          <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Duyệt Học Viên: {approvingOrder.studentName}
              </h3>
              <button onClick={() => setApprovingOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '18px', fontSize: '13px' }}>
              <div style={{ color: '#475569' }}>Khóa học: <strong>{approvingOrder.courseTitle}</strong></div>
              <div style={{ color: '#475569', marginTop: '4px' }}>Học phí: <strong style={{ color: '#0057B8' }}>{approvingOrder.amountVnd.toLocaleString('vi-VN')} đ</strong> ({approvingOrder.paymentMethod.toUpperCase()})</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Chọn Lớp Học Xếp Chỗ:
              </label>
              <select
                value={selectedClassCode}
                onChange={e => setSelectedClassCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="K26-WE01">K26-WE01 (Sáng T7 - CN, Sĩ số 12/15)</option>
                <option value="K26-CC01">K26-CC01 (Tối 2-4-6, Sĩ số 14/15)</option>
                <option value="K26-AI01">K26-AI01 (Tối 3-5-7, Sĩ số 8/20)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setApprovingOrder(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontSize: '13px', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmApprove}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#0057B8', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Xác nhận Duyệt & Cấp quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
