import React from 'react';
import { UserProfile, CurriculumTrack, TRACK_LABELS } from '../../types/auth';
import { LearningPathNode } from '../../types/edtech';
import { CheckCircle2, Play, Sparkles, Award } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface LearningPathRoadmapProps {
  currentUser: UserProfile;
  onStartNodePractice: (node: LearningPathNode) => void;
}

const SAMPLE_ROADMAP_NODES: LearningPathNode[] = [
  {
    id: 'node_1',
    title: '1. Giao Diện & Định Dạng Cơ Bản (Styles & Margins)',
    skillIds: ['word_formatting', 'office_basics'],
    estimatedMinutes: 20,
    isCompleted: true,
    masteryScore: 100,
    isCurrentTarget: false,
    order: 1
  },
  {
    id: 'node_2',
    title: '2. Công Thức & Hàm Tính Toán Cơ Bản (SUM, AVERAGE, MIN, MAX)',
    skillIds: ['excel_formula', 'excel_f4'],
    estimatedMinutes: 30,
    isCompleted: true,
    masteryScore: 88,
    isCurrentTarget: false,
    order: 2
  },
  {
    id: 'node_3',
    title: '3. Hàm Điều Kiện Logic (IF, IFS, COUNTIF, SUMIFS)',
    skillIds: ['excel_if_logic'],
    estimatedMinutes: 40,
    isCompleted: false,
    masteryScore: 62,
    isCurrentTarget: true,
    order: 3
  },
  {
    id: 'node_4',
    title: '4. Hàm Tìm Kiếm & Tra Cứu (VLOOKUP, XLOOKUP, INDEX/MATCH)',
    skillIds: ['excel_lookup', 'excel_xlookup'],
    estimatedMinutes: 45,
    isCompleted: false,
    masteryScore: 43,
    isCurrentTarget: false,
    order: 4
  },
  {
    id: 'node_5',
    title: '5. Phân Tích & Báo Cáo Động (PivotTable & Slicer)',
    skillIds: ['excel_pivottable'],
    estimatedMinutes: 35,
    isCompleted: false,
    masteryScore: 20,
    isCurrentTarget: false,
    order: 5
  },
  {
    id: 'node_6',
    title: '6. Tự Động Hóa & Ứng Dụng AI Văn Phòng Chuyên Nghiệp',
    skillIds: ['ai_prompting', 'macro_basics'],
    estimatedMinutes: 40,
    isCompleted: false,
    masteryScore: 0,
    isCurrentTarget: false,
    order: 6
  }
];

export const LearningPathRoadmap: React.FC<LearningPathRoadmapProps> = ({
  currentUser,
  onStartNodePractice
}) => {
  const track: CurriculumTrack = currentUser.programTrack || 'office-fast-3in1';
  const trackName = TRACK_LABELS[track] || 'Office Cấp Tốc (3b)';

  const overallMastery = Math.round(
    SAMPLE_ROADMAP_NODES.reduce((sum, n) => sum + n.masteryScore, 0) / SAMPLE_ROADMAP_NODES.length
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '14px 16px' }} className="animate-slide-up">
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: '22px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(79, 110, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: '1.5px solid var(--brand)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', background: 'var(--brand-light)', color: 'var(--brand)', fontSize: '0.74rem', fontWeight: 800, marginBottom: '6px' }}>
            <Sparkles size={13} />
            <span>LỘ TRÌNH HỌC CÁ NHÂN HÓA 2026</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            {trackName}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Học theo tiến trình kỹ năng nguyên tử để tối ưu hóa thời gian và làm chủ kiến thức vững chắc.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TIẾN ĐỘ TỔNG THỂ</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--brand)' }}>{overallMastery}% Mastery</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Roadmap Step Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {SAMPLE_ROADMAP_NODES.map((node) => {
          const isMastered = node.masteryScore >= 85;
          const isNeedReview = node.masteryScore > 0 && node.masteryScore < 60;
          const isCurrent = node.isCurrentTarget;

          return (
            <div
              key={node.id}
              className="card"
              style={{
                padding: '20px',
                borderRadius: '16px',
                borderLeft: `6px solid ${isMastered ? '#10b981' : isCurrent ? 'var(--brand)' : isNeedReview ? '#f59e0b' : 'var(--border-color)'}`,
                background: isCurrent ? 'rgba(79, 110, 247, 0.04)' : 'var(--bg-card)',
                boxShadow: isCurrent ? '0 6px 20px rgba(79, 110, 247, 0.12)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              {/* Left info */}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: isMastered ? 'rgba(16, 185, 129, 0.12)' : isCurrent ? 'var(--brand-light)' : 'var(--bg-secondary)',
                    color: isMastered ? '#059669' : isCurrent ? 'var(--brand)' : 'var(--text-muted)'
                  }}>
                    {isMastered ? '✓ Đã Thành Thạo' : isCurrent ? '⚡ Đang Học' : isNeedReview ? '⚠️ Cần Ôn Luyện' : 'Chưa Học'}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    ⏱️ ~{node.estimatedMinutes} phút
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  {node.title}
                </h3>

                {/* Mastery Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, maxWidth: '240px', height: '7px', borderRadius: '999px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${node.masteryScore}%`,
                      height: '100%',
                      background: isMastered ? '#10b981' : isNeedReview ? '#f59e0b' : 'var(--brand)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {node.masteryScore}% Mastery
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => {
                    onStartNodePractice(node);
                    soundFx.playClick();
                  }}
                  className={isCurrent ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 800, borderRadius: '10px', gap: '6px' }}
                >
                  {isMastered ? <CheckCircle2 size={15} /> : <Play size={15} />}
                  <span>{isMastered ? 'Luyện Lại' : isCurrent ? 'HỌC TIẾP' : 'Bắt Đầu'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
