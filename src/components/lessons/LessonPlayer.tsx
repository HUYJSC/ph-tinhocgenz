/**
 * LessonPlayer — Trình phát bài học đa dạng nội dung
 * Hỗ trợ: Video (YouTube/iframe), PDF (Google Docs Viewer), Slide, Text
 * LMS EduQuest — PH Digital Education
 */
import { useState, useEffect, useRef } from 'react';
import {
  Play, ChevronLeft, ChevronRight, BookOpen,
  FileText, Monitor, CheckCircle,
  Clock
} from 'lucide-react';
import type { Lesson, LessonProgress } from '../../types/course';

interface LessonPlayerProps {
  lesson: Lesson;
  progress?: LessonProgress;
  onComplete: (lessonId: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  courseName?: string;
}

function YoutubeEmbed({ url }: { url: string }) {
  // Extract YouTube video ID
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match ? match[1] : '';

  if (!videoId) {
    return (
      <div style={{
        width: '100%', paddingTop: '56.25%', background: '#0F172A',
        borderRadius: '12px', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#64748B'
        }}>
          URL video không hợp lệ
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      <iframe
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Lesson video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function PdfViewer({ url }: { url: string }) {
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  return (
    <div style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <iframe
        src={viewerUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="PDF Viewer"
      />
    </div>
  );
}

function TextContent({ content }: { content: string }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px',
      padding: '32px', lineHeight: '1.8', color: '#334155',
      fontSize: '15px', maxWidth: '760px'
    }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

const CONTENT_TYPE_ICON: Record<string, JSX.Element> = {
  video: <Play size={16} />,
  pdf: <FileText size={16} />,
  slide: <Monitor size={16} />,
  text: <BookOpen size={16} />,
  quiz: <CheckCircle size={16} />,
  interactive: <Monitor size={16} />
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  video: 'Video bài giảng',
  pdf: 'Tài liệu PDF',
  slide: 'Slide trình chiếu',
  text: 'Bài học dạng văn bản',
  quiz: 'Bài kiểm tra',
  interactive: 'Bài học tương tác'
};

export function LessonPlayer({
  lesson,
  progress,
  onComplete,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  courseName = ''
}: LessonPlayerProps) {
  const [isCompleted, setIsCompleted] = useState(progress?.is_completed || false);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer when lesson opens
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lesson.id]);

  // Auto-mark complete for text/pdf after 30 seconds of reading
  useEffect(() => {
    if ((lesson.content_type === 'text' || lesson.content_type === 'pdf') && timeSpent >= 30 && !isCompleted) {
      handleMarkComplete();
    }
  }, [timeSpent, lesson.content_type, isCompleted]);

  const handleMarkComplete = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    onComplete(lesson.id);
    // Report to server
    fetch('/api/progress/lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lesson_id: lesson.id,
        is_completed: true,
        position_seconds: timeSpent
      }),
      credentials: 'include'
    }).catch(() => { /* silent fail */ });
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (!lesson.content_url) {
      return (
        <div style={{
          background: '#F8FAFC', border: '2px dashed #E2E8F0', borderRadius: '12px',
          padding: '60px', textAlign: 'center', color: '#94A3B8'
        }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p>Nội dung bài học đang được cập nhật</p>
        </div>
      );
    }

    switch (lesson.content_type) {
      case 'video':
        return <YoutubeEmbed url={lesson.content_url} />;
      case 'pdf':
        return <PdfViewer url={lesson.content_url} />;
      case 'slide':
        return (
          <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <iframe
              src={lesson.content_url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Slide viewer"
              allowFullScreen
            />
          </div>
        );
      case 'text':
        return <TextContent content={lesson.content_url} />;
      default:
        return (
          <div style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px',
            padding: '40px', textAlign: 'center', color: '#64748B'
          }}>
            Loại nội dung "{lesson.content_type}" đang được phát triển
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Top navigation bar */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px', display: 'flex', alignItems: 'center',
        gap: '12px', position: 'sticky', top: 0, zIndex: 10
      }}>
        {courseName && (
          <span style={{ fontSize: '13px', color: '#64748B' }}>{courseName}</span>
        )}
        {courseName && <ChevronRight size={14} color="#CBD5E1" />}
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
          {lesson.title}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', color: '#94A3B8'
          }}>
            <Clock size={13} /> {formatTime(timeSpent)}
          </span>
          {isCompleted ? (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: '#ECFDF5', color: '#16A34A', padding: '4px 10px',
              borderRadius: '9999px', fontSize: '12px', fontWeight: '600'
            }}>
              <CheckCircle size={13} /> Đã hoàn thành
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Lesson Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#EFF6FF', color: '#0057B8',
            fontSize: '12px', fontWeight: '600', padding: '4px 12px',
            borderRadius: '9999px', marginBottom: '12px'
          }}>
            {CONTENT_TYPE_ICON[lesson.content_type]}
            {CONTENT_TYPE_LABEL[lesson.content_type] || lesson.content_type}
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>
            {lesson.title}
          </h1>
          <div style={{ display: 'flex', gap: '16px', color: '#64748B', fontSize: '13px' }}>
            {lesson.duration_minutes > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {lesson.duration_minutes} phút
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ marginBottom: '32px' }}>
          {renderContent()}
        </div>

        {/* Action Bar */}
        <div style={{
          background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px',
          padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px'
        }}>
          {/* Prev/Next Navigation */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px',
                border: '1px solid #E2E8F0', background: '#ffffff',
                color: hasPrev ? '#0F172A' : '#CBD5E1',
                fontSize: '13px', fontWeight: '600',
                cursor: hasPrev ? 'pointer' : 'not-allowed'
              }}
            >
              <ChevronLeft size={16} /> Bài trước
            </button>
          </div>

          {/* Mark Complete */}
          {!isCompleted ? (
            <button
              onClick={handleMarkComplete}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 24px', background: '#0057B8', color: '#ffffff',
                border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1D4ED8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0057B8')}
            >
              <CheckCircle size={16} /> Đánh dấu hoàn thành
            </button>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#16A34A', fontWeight: '700', fontSize: '14px'
            }}>
              <CheckCircle size={16} fill="#16A34A" color="#ffffff" /> Đã hoàn thành!
            </div>
          )}

          {/* Next */}
          <div>
            <button
              onClick={onNext}
              disabled={!hasNext}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px',
                border: 'none',
                background: hasNext ? '#0057B8' : '#E2E8F0',
                color: hasNext ? '#ffffff' : '#CBD5E1',
                fontSize: '13px', fontWeight: '600',
                cursor: hasNext ? 'pointer' : 'not-allowed'
              }}
            >
              Bài tiếp <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
