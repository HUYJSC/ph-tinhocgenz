import React, { useState } from 'react';
import { StudentAccount } from '../../types/auth';
import { EarlyWarningService } from '../../services/earlyWarningService';
import { ShieldAlert, MessageSquare, Search } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface EarlyWarningDashboardProps {
  studentAccounts: StudentAccount[];
}

export const EarlyWarningDashboard: React.FC<EarlyWarningDashboardProps> = ({
  studentAccounts
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const evaluatedStudents = EarlyWarningService.evaluateAllStudents(studentAccounts);

  const filtered = evaluatedStudents.filter(s => {
    if (filterLevel !== 'all' && s.riskLevel !== filterLevel) return false;
    if (searchQuery) {
      const match = s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const criticalCount = evaluatedStudents.filter(s => s.riskLevel === 'CRITICAL').length;
  const highCount = evaluatedStudents.filter(s => s.riskLevel === 'HIGH').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }} className="animate-slide-up">
      
      {/* Top Banner Alert */}
      <div
        className="card"
        style={{
          padding: '20px',
          borderRadius: '18px',
          background: criticalCount > 0
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(79, 110, 247, 0.04) 100%)',
          border: criticalCount > 0 ? '1.5px solid #ef4444' : '1px solid #10b981',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: criticalCount > 0 ? '#ef4444' : '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Hệ Thống Cảnh Báo Sớm Học Viên (Early Warning System)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Tự động tính toán chỉ số nguy cơ bỏ học (Risk Score) dựa trên thời gian vắng mặt, điểm số thành thạo và lỗi sai tồn đọng.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', fontWeight: 800, fontSize: '0.82rem' }}>
            🚨 {criticalCount} Nguy Cơ Rất Cao
          </div>
          <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', fontWeight: 800, fontSize: '0.82rem' }}>
            ⚠️ {highCount} Cần Nhắc Nhở
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '12px 16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div className="horizontal-scroll" style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: `Tất Cả (${evaluatedStudents.length})` },
            { id: 'CRITICAL', label: `🚨 Nguy Cấp (${criticalCount})` },
            { id: 'HIGH', label: `⚠️ Nguy Cơ Cao (${highCount})` },
            { id: 'MEDIUM', label: `⚡ Trung Bình` },
            { id: 'LOW', label: `✓ An Toàn` }
          ].map(f => {
            const isSelected = filterLevel === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFilterLevel(f.id as any);
                  soundFx.playClick();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1.5px solid var(--brand)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--brand-light)' : 'transparent',
                  color: isSelected ? 'var(--brand)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 800 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên học viên..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '0.78rem',
              borderRadius: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)'
            }}
          />
        </div>
      </div>

      {/* Student Risk List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
        {filtered.map(st => {
          const isCritical = st.riskLevel === 'CRITICAL';
          const isHigh = st.riskLevel === 'HIGH';
          const isMed = st.riskLevel === 'MEDIUM';

          const badgeColor = isCritical ? '#dc2626' : isHigh ? '#d97706' : isMed ? '#3b82f6' : '#10b981';
          const badgeBg = isCritical ? 'rgba(239, 68, 68, 0.12)' : isHigh ? 'rgba(245, 158, 11, 0.12)' : isMed ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)';

          return (
            <div
              key={st.studentId}
              className="card"
              style={{
                padding: '18px',
                borderRadius: '16px',
                borderLeft: `5px solid ${badgeColor}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {st.studentName}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Mã HV: <strong>{st.studentCode}</strong>
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: badgeColor,
                    background: badgeBg,
                    padding: '3px 10px',
                    borderRadius: '999px'
                  }}>
                    {st.riskLevel} (Risk: {st.riskScore}/100)
                  </span>
                </div>

                {/* Factors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {st.factors.map((f, fidx) => (
                    <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: badgeColor }}>•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Suggested Action Box */}
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.76rem', color: 'var(--text-primary)', borderLeft: `3px solid ${badgeColor}` }}>
                  <strong>💡 Khuyến nghị giáo viên:</strong> {st.suggestedAction}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <button
                  onClick={() => alert(`Đã gửi thông báo nhắc lịch học & phụ đạo tới học viên ${st.studentName}!`)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700, gap: '4px' }}
                >
                  <MessageSquare size={13} />
                  <span>Gửi Nhắc Nhở</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
