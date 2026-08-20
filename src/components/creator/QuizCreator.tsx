import React, { useState } from 'react';
import { Quiz, Question, QuestionType, SubjectCategory, Difficulty } from '../../types/quiz';
import { Plus, Trash2, Save, Upload } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface QuizCreatorProps {
  onAddQuiz: (quiz: Quiz) => void;
  onSuccessNavigate: () => void;
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({ onAddQuiz, onSuccessNavigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SubjectCategory>('programming');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [jsonError, setJsonError] = useState('');

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'custom-q1',
      type: 'single',
      prompt: 'Câu hỏi mẫu 1: Thủ đô của Việt Nam là gì?',
      options: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng'],
      correctAnswer: 0,
      explanation: 'Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.',
      hint: 'Thành phố nghìn năm văn hiến.',
      points: 10
    }
  ]);

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `custom-q-${Date.now()}`,
      type: 'single',
      prompt: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      hint: '',
      points: 10
    };
    setQuestions([...questions, newQ]);
    soundFx.playClick();
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('Đề thi cần có ít nhất 1 câu hỏi!');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
    soundFx.playClick();
  };

  const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const q = updated[qIdx];
    if (q.options) {
      const opts = [...q.options];
      opts[optIdx] = val;
      updated[qIdx] = { ...q, options: opts };
      setQuestions(updated);
    }
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài thi!');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].prompt.trim()) {
        alert(`Vui lòng nhập nội dung câu hỏi số ${i + 1}!`);
        return;
      }
    }

    const newQuiz: Quiz = {
      id: `quiz-custom-${Date.now()}`,
      title,
      description: description || 'Bộ câu hỏi tùy chỉnh tạo bởi người dùng',
      category,
      difficulty,
      timeLimitMinutes: Number(timeLimitMinutes) || 0,
      icon: 'BookOpen',
      badgeColor: '#8b5cf6',
      questions,
      isCustom: true
    };

    onAddQuiz(newQuiz);
    soundFx.playFanfare();
    alert('🎉 Tạo đề thi thành công! Đề thi đã được thêm vào kho bài tập của bạn.');
    onSuccessNavigate();
  };

  const handleImportJson = () => {
    setJsonError('');
    try {
      const parsed = JSON.parse(jsonInputText);
      if (!parsed.title || !Array.isArray(parsed.questions)) {
        throw new Error('Dữ liệu JSON không đúng định dạng đề thi (thiếu title hoặc questions)');
      }
      onAddQuiz(parsed);
      setShowJsonModal(false);
      soundFx.playFanfare();
      alert('🎉 Đã nhập đề thi từ JSON thành công!');
      onSuccessNavigate();
    } catch (err: any) {
      setJsonError(err.message || 'Lỗi cú pháp JSON');
    }
  };

  const sampleJsonTemplate = JSON.stringify(
    {
      title: 'Tên bộ đề kiểm tra mới',
      description: 'Mô tả ngắn gọn về đề thi',
      category: 'programming',
      difficulty: 'medium',
      timeLimitMinutes: 10,
      questions: [
        {
          id: 'q1',
          type: 'single',
          prompt: 'Nội dung câu hỏi?',
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correctAnswer: 0,
          explanation: 'Giải thích tại sao A đúng',
          hint: 'Gợi ý làm bài',
          points: 10
        }
      ]
    },
    null,
    2
  );

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', padding: '16px' }} className="animate-slide-up">
      {/* Top Header */}
      <div className="card" style={{ padding: '24px', marginBottom: '20px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Tạo Đề Thi & Bài Tập Mới</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tự thiết kế câu hỏi kiểm tra, chia sẻ hoặc nhập đề thi từ file JSON
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowJsonModal(true)} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              <Upload size={15} />
              <span>Nhập JSON</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveQuiz}>
        {/* Basic Info */}
        <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>1. Thông tin chung</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                TIÊU ĐỀ ĐỀ THI / BÀI TẬP *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Kiểm tra 15 phút - Lập trình C++ cơ bản..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                MÔ TẢ CHI TIẾT
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả phạm vi kiến thức, đối tượng học viên..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  CHỦ ĐỀ
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as SubjectCategory)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="cntt-basic">1. CNTT & Tin Học Cơ Bản</option>
                  <option value="mos-office">2. Tin Học Văn Phòng MOS</option>
                  <option value="ic3-gs">3. Chuẩn Quốc Tế IC3 GS6</option>
                  <option value="cntt-advanced">4. CNTT Nâng Cao & Xử Lý Dữ Liệu</option>
                  <option value="programming">5. Lập Trình Python & Thuật Toán</option>
                  <option value="cyber-security">6. Mạng Máy Tính & Bảo Mật IT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  ĐỘ KHÓ
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as Difficulty)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="easy">Dễ (Cơ bản)</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó (Nâng cao)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  THỜI GIAN LÀM BÀI (PHÚT)
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={timeLimitMinutes}
                  onChange={e => setTimeLimitMinutes(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Editor */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Danh sách câu hỏi ({questions.length} câu)</h3>
            <button type="button" onClick={handleAddQuestion} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              <Plus size={15} />
              <span>Thêm câu hỏi mới</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, qIdx) => (
              <div key={q.id} className="card" style={{ padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                      Câu #{qIdx + 1}
                    </span>
                    <select
                      value={q.type}
                      onChange={e => handleQuestionChange(qIdx, 'type', e.target.value as QuestionType)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem'
                      }}
                    >
                      <option value="single">Trắc nghiệm 1 đáp án</option>
                      <option value="true-false">Đúng / Sai</option>
                      <option value="fill-blank">Điền vào chỗ trống</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Question Prompt */}
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Nhập nội dung câu hỏi..."
                    value={q.prompt}
                    onChange={e => handleQuestionChange(qIdx, 'prompt', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Options if single choice */}
                {q.type === 'single' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Tích chọn tròn vào đáp án đúng:
                    </div>
                    {q.options?.map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={Number(q.correctAnswer) === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctAnswer', optIdx)}
                        />
                        <input
                          type="text"
                          required
                          placeholder={`Lựa chọn ${optIdx + 1}...`}
                          value={opt}
                          onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '0.88rem'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Options if True/False */}
                {q.type === 'true-false' && (
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Đáp án chính xác:</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                      <input
                        type="radio"
                        name={`tf-${q.id}`}
                        checked={q.correctAnswer === true}
                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', true)}
                      />
                      ĐÚNG (True)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                      <input
                        type="radio"
                        name={`tf-${q.id}`}
                        checked={q.correctAnswer === false}
                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', false)}
                      />
                      SAI (False)
                    </label>
                  </div>
                )}

                {/* Options if Fill-in-the-blank */}
                {q.type === 'fill-blank' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Từ/cụm từ chính xác cần điền:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Đáp án đúng chính xác..."
                      value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''}
                      onChange={e => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>
                )}

                {/* Explanation and Points */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Lời giải thích chi tiết cho đáp án..."
                    value={q.explanation}
                    onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem'
                    }}
                  />

                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Điểm số"
                    value={q.points}
                    onChange={e => handleQuestionChange(qIdx, 'points', Number(e.target.value))}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            <Save size={18} />
            <span>Lưu & Xuất Bản Đề Thi</span>
          </button>
        </div>
      </form>

      {/* JSON Import Modal */}
      {showJsonModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowJsonModal(false)}
        >
          <div
            className="card animate-slide-up"
            style={{ width: '100%', maxWidth: '600px', padding: '24px', background: 'var(--bg-secondary)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
              Nhập đề thi từ mã JSON
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Dán cấu trúc JSON chứa đề thi vào khung bên dưới để nhập nhanh:
            </p>

            <textarea
              rows={10}
              placeholder={sampleJsonTemplate}
              value={jsonInputText}
              onChange={e => setJsonInputText(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                background: '#030712',
                color: '#38bdf8',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                marginBottom: '12px'
              }}
            />

            {jsonError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '12px' }}>
                ⚠️ {jsonError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowJsonModal(false)} className="btn btn-secondary">
                Hủy
              </button>
              <button onClick={handleImportJson} className="btn btn-primary">
                Nhập đề thi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
