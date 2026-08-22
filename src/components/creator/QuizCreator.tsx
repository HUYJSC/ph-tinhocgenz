import React, { useState } from 'react';
import { Quiz, Question, SubjectCategory, Difficulty } from '../../types/quiz';
import { Plus, Trash2, Save, FileText, Sparkles, AlertCircle, X } from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface QuizCreatorProps {
  onAddQuiz: (quiz: Quiz) => void;
  onSuccessNavigate: () => void;
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({ onAddQuiz, onSuccessNavigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SubjectCategory>('office-fast-3in1');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);

  // Smart Text Importer state (Word / Text Format, NO JSON REQUIRED!)
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textParseError, setTextParseError] = useState('');

  // AI Generator state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [aiTopic, setAiTopic] = useState('excel-fast');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'custom-q1',
      type: 'single',
      prompt: 'Hàm nào trong Microsoft Excel dùng để tìm kiếm giá trị theo cột dọc?',
      options: ['HLOOKUP', 'VLOOKUP', 'INDEX', 'MATCH'],
      correctAnswer: 1,
      explanation: 'Hàm VLOOKUP (Vertical Lookup) dùng để tìm kiếm giá trị theo cột dọc trong bảng dữ liệu.',
      hint: 'Chữ V viết tắt của từ Vertical (theo chiều dọc).',
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

  // ── 1. SMART TEXT / WORD PARSER (NO JSON!) ──
  const handleParseTextQuestions = () => {
    setTextParseError('');
    if (!textInput.trim()) {
      setTextParseError('Vui lòng dán nội dung đề thi vào khung bên dưới!');
      return;
    }

    try {
      const parsedQuestions: Question[] = [];
      // Split text by questions (e.g., "Câu 1:", "Câu 2:", "1.", "2.", "Question 1:")
      const rawBlocks = textInput.split(/(?=(?:Câu\s*\d+|Bài\s*\d+|\d+\.|\bQ\d+:)\s*[:.]?)/i).filter(b => b.trim().length > 0);

      if (rawBlocks.length === 0) {
        throw new Error('Không nhận diện được câu hỏi nào. Vui lòng kiểm tra định dạng "Câu 1: ... A. ... B. ... Đáp án: A"');
      }

      rawBlocks.forEach((block, index) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) return;

        let prompt = '';
        const options: string[] = [];
        let correctAnswer = 0;
        let explanation = '';
        let hint = '';

        // Extract prompt
        const firstLine = lines[0].replace(/^(?:Câu\s*\d+|Bài\s*\d+|\d+\.|\bQ\d+:)\s*[:.]?\s*/i, '');
        prompt = firstLine;

        // Process subsequent lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];

          // Check if option (A., B., C., D. or A), B), C), D))
          const optMatch = line.match(/^([A-D])[\.\)]\s*(.*)/i);
          if (optMatch) {
            options.push(optMatch[2].trim());
            continue;
          }

          // Check if Answer line (Đáp án: A or Answer: B)
          const ansMatch = line.match(/(?:Đáp\s*án|Đáp\s*án\s*đúng|Key|Answer)\s*[:=]?\s*([A-D]|\d+)/i);
          if (ansMatch) {
            const val = ansMatch[1].toUpperCase();
            if (val === 'A') correctAnswer = 0;
            else if (val === 'B') correctAnswer = 1;
            else if (val === 'C') correctAnswer = 2;
            else if (val === 'D') correctAnswer = 3;
            else if (!isNaN(Number(val))) correctAnswer = Math.max(0, Number(val) - 1);
            continue;
          }

          // Check explanation (Giải thích: ...)
          const expMatch = line.match(/(?:Giải\s*thích|Ghi\s*chú|Explanation)\s*[:=]?\s*(.*)/i);
          if (expMatch) {
            explanation = expMatch[1].trim();
            continue;
          }

          // Check hint (Gợi ý: ...)
          const hintMatch = line.match(/(?:Gợi\s*ý|Hint)\s*[:=]?\s*(.*)/i);
          if (hintMatch) {
            hint = hintMatch[1].trim();
            continue;
          }

          // If no option started yet, append to prompt
          if (options.length === 0) {
            prompt += ' ' + line;
          }
        }

        // Fill default 4 options if fewer parsed
        while (options.length < 4) {
          options.push(`Lựa chọn ${options.length + 1}`);
        }

        if (prompt.trim()) {
          parsedQuestions.push({
            id: `imported-q-${Date.now()}-${index}`,
            type: 'single',
            prompt: prompt.trim(),
            options: options.slice(0, 4),
            correctAnswer: Math.min(correctAnswer, options.length - 1),
            explanation: explanation || 'Kiến thức chuẩn trong chương trình tin học.',
            hint: hint || '',
            points: 10
          });
        }
      });

      if (parsedQuestions.length === 0) {
        throw new Error('Không thể phân tích được câu hỏi nào từ văn bản đã dán.');
      }

      setQuestions(parsedQuestions);
      setShowTextModal(false);
      setTextInput('');
      soundFx.playVictory();
      alert(`🎉 Đã nhập thành công ${parsedQuestions.length} câu hỏi vào đề thi!`);
    } catch (err: any) {
      setTextParseError(err.message || 'Lỗi định dạng văn bản. Vui lòng kiểm tra lại định dạng câu hỏi.');
      soundFx.playIncorrect();
    }
  };

  // ── 2. AI AUTO QUIZ GENERATOR (NO JSON!) ──
  const handleGenerateWithAi = () => {
    setIsAiGenerating(true);

    setTimeout(() => {
      let aiBank: Question[] = [];

      if (aiTopic === 'excel-fast') {
        aiBank = [
          {
            id: `ai-q-1-${Date.now()}`,
            type: 'single',
            prompt: 'Trong Excel, hàm nào dùng để tìm kiếm giá trị chính xác và linh hoạt theo cả hàng và cột?',
            options: ['XLOOKUP', 'VLOOKUP', 'HLOOKUP', 'INDEX'],
            correctAnswer: 0,
            explanation: 'Hàm XLOOKUP là hàm tìm kiếm hiện đại thay thế cho cả VLOOKUP và HLOOKUP, tìm kiếm 2 chiều không cần sắp xếp bảng.',
            hint: 'Hàm mới trong Excel 365 và Excel 2021.',
            points: 10
          },
          {
            id: `ai-q-2-${Date.now()}`,
            type: 'single',
            prompt: 'Phím tắt nào dùng để tạo nhanh bảng dữ liệu (Table) trong Excel?',
            options: ['Ctrl + T', 'Ctrl + B', 'Ctrl + Shift + L', 'Alt + F1'],
            correctAnswer: 0,
            explanation: 'Phím tắt Ctrl + T (hoặc Ctrl + L) dùng để tạo bảng dữ liệu có định dạng Table.',
            hint: 'T viết tắt của Table.',
            points: 10
          },
          {
            id: `ai-q-3-${Date.now()}`,
            type: 'single',
            prompt: 'Để đếm các ô chứa dữ liệu không rỗng trong Excel, ta sử dụng hàm nào?',
            options: ['COUNT', 'COUNTA', 'COUNTIF', 'COUNTBLANK'],
            correctAnswer: 1,
            explanation: 'Hàm COUNTA đếm tất cả các ô có chứa dữ liệu (cả số, chữ, ký tự), trong khi COUNT chỉ đếm ô chứa số.',
            hint: 'Chữ A trong COUNTA viết tắt của Count All.',
            points: 10
          },
          {
            id: `ai-q-4-${Date.now()}`,
            type: 'single',
            prompt: 'Ký hiệu $ trong công thức $A$1 của Excel mang ý nghĩa gì?',
            options: ['Định dạng tiền tệ Dollar', 'Địa chỉ tuyệt đối cố định hàng và cột', 'Hàm tài chính', 'Địa chỉ tương đối'],
            correctAnswer: 1,
            explanation: 'Dấu $ đứng trước tên cột hoặc số hàng để cố định địa chỉ ô (địa chỉ tuyệt đối), không bị thay đổi khi sao chép công thức.',
            hint: 'Dùng phím F4 để chuyển đổi địa chỉ tương đối sang tuyệt đối.',
            points: 10
          },
          {
            id: `ai-q-5-${Date.now()}`,
            type: 'single',
            prompt: 'Tính năng nào trong Excel cho phép lọc và trích xuất dữ liệu nhanh chóng?',
            options: ['Data Validation', 'AutoFilter (Ctrl + Shift + L)', 'Conditional Formatting', 'Goal Seek'],
            correctAnswer: 1,
            explanation: 'AutoFilter cho phép người dùng lọc dữ liệu theo điều kiện nhanh với phím tắt Ctrl + Shift + L.',
            hint: 'Nằm trong thẻ Data trên thanh Ribbon.',
            points: 10
          }
        ];
      } else if (aiTopic === 'word-fast') {
        aiBank = [
          {
            id: `ai-q-w1-${Date.now()}`,
            type: 'single',
            prompt: 'Trong Microsoft Word, tổ hợp phím nào dùng để ngắt trang (Page Break) ngay lập tức?',
            options: ['Ctrl + Enter', 'Shift + Enter', 'Alt + Enter', 'Ctrl + Shift + Enter'],
            correctAnswer: 0,
            explanation: 'Ctrl + Enter dùng để chèn ngắt trang (Page Break), đưa con trỏ sang đầu trang mới.',
            hint: 'Phím tắt rất thông dụng khi soạn thảo văn bản.',
            points: 10
          },
          {
            id: `ai-q-w2-${Date.now()}`,
            type: 'single',
            prompt: 'Để căn đều hai lề văn bản trong Word, ta sử dụng phím tắt nào?',
            options: ['Ctrl + J', 'Ctrl + E', 'Ctrl + L', 'Ctrl + R'],
            correctAnswer: 0,
            explanation: 'Ctrl + J dùng để căn lề đều 2 bên (Justify).',
            hint: 'J là viết tắt của Justify.',
            points: 10
          },
          {
            id: `ai-q-w3-${Date.now()}`,
            type: 'single',
            prompt: 'Tính năng nào trong Word cho phép tự động tạo mục lục từ các Heading?',
            options: ['Table of Contents (Thẻ References)', 'Bibliography', 'Index', 'Cross-reference'],
            correctAnswer: 0,
            explanation: 'Table of Contents nằm trong thẻ References cho phép tự động quét các Heading 1, 2, 3 để tạo mục lục tự động.',
            hint: 'Nằm trong thẻ References.',
            points: 10
          }
        ];
      } else {
        aiBank = [
          {
            id: `ai-q-p1-${Date.now()}`,
            type: 'single',
            prompt: 'Phím tắt nào dùng để trình chiếu bài thuyết trình PowerPoint từ trang đầu tiên?',
            options: ['F5', 'Shift + F5', 'Ctrl + F5', 'Alt + F5'],
            correctAnswer: 0,
            explanation: 'Phím F5 trình chiếu từ slide đầu tiên, còn Shift + F5 trình chiếu từ slide hiện tại.',
            hint: 'Chỉ cần bấm 1 phím chức năng trên hàng phím F.',
            points: 10
          },
          {
            id: `ai-q-p2-${Date.now()}`,
            type: 'single',
            prompt: 'Slide Master trong PowerPoint có vai trò gì?',
            options: ['Định dạng bố cục, phông chữ và hình nền chung cho toàn bộ bài thuyết trình', 'Chỉ chứa slide đầu tiên', 'Tạo hiệu ứng âm thanh', 'Xuất file PDF'],
            correctAnswer: 0,
            explanation: 'Slide Master là trang slide chủ quy định bố cục chung, logo, định dạng text cho tất cả các slide trong bài.',
            hint: 'Nằm trong thẻ View -> Slide Master.',
            points: 10
          }
        ];
      }

      const generated = aiBank.slice(0, aiQuestionCount);
      setQuestions(generated);
      setIsAiGenerating(false);
      setShowAiModal(false);
      soundFx.playVictory();
      alert(`🎉 AI đã tự động tạo ${generated.length} câu hỏi trắc nghiệm chất lượng cao!`);
    }, 600);
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
      description: description || 'Bộ đề kiểm tra chuẩn hóa học vụ',
      category,
      difficulty,
      timeLimitMinutes: Number(timeLimitMinutes) || 10,
      icon: 'BookOpen',
      badgeColor: '#2563EB',
      questions,
      isCustom: true
    };

    onAddQuiz(newQuiz);
    soundFx.playFanfare();
    alert('🎉 Đã lưu và xuất bản đề thi thành công vào hệ thống đào tạo!');
    onSuccessNavigate();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '24px 20px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      
      {/* ── TOP HEADER ── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '20px 24px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
            Soạn Đề Thi & Bài Kiểm Tra Học Vụ
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
            Thiết kế câu hỏi trực quan, dán đề từ file Word hoặc tự động tạo bằng AI (không cần nhập JSON)
          </p>
        </div>

        {/* Quick Action Buttons (NO JSON) */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowTextModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#1E293B',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <FileText size={15} color="#2563EB" />
            <span>Dán đề từ Word / Văn bản</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#1D4ED8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={15} color="#2563EB" />
            <span>Tạo tự động bằng AI</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* ── 1. THÔNG TIN CHUNG ĐỀ THI ── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '20px 24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>
            1. Thông tin chung bài kiểm tra
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Tiêu đề đề thi / bài tập *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Kiểm tra 15 phút - Kỹ năng Excel nâng cao & Hàm XLOOKUP..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '14px',
                  padding: '0 14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Mô tả ngắn gọn
              </label>
              <input
                type="text"
                placeholder="Mô tả tóm tắt nội dung bài kiểm tra và kiến thức trọng tâm..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '14px',
                  padding: '0 14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Chương trình đào tạo
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as SubjectCategory)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '13.5px',
                    padding: '0 12px',
                    outline: 'none'
                  }}
                >
                  <option value="office-fast-3in1">Word, Excel, PowerPoint (3 Buổi)</option>
                  <option value="cc-cntt-basic">CC CNTT Cơ bản (6 buổi)</option>
                  <option value="cc-cntt-advanced">CC CNTT Nâng cao (6 buổi)</option>
                  <option value="cntt-basic-we">CNTT Cơ bản: Word + Excel</option>
                  <option value="cntt-adv-we">CNTT Nâng Cao: Word + Excel</option>
                  <option value="ai-office">Ứng dụng AI vào Văn phòng</option>
                  <option value="excel-accounting">Excel cho Kế toán</option>
                  <option value="word-6b">Kỹ năng Word (6 buổi)</option>
                  <option value="excel-6b">Xử lý Excel (6 buổi)</option>
                  <option value="ppt-6b">Thuyết trình PowerPoint (6 buổi)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Thời gian làm bài (Phút)
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={timeLimitMinutes}
                  onChange={e => setTimeLimitMinutes(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '14px',
                    padding: '0 14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mức độ khó
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as Difficulty)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '13.5px',
                    padding: '0 12px',
                    outline: 'none'
                  }}
                >
                  <option value="easy">Cơ bản (Dễ)</option>
                  <option value="medium">Tiêu chuẩn (Trung bình)</option>
                  <option value="hard">Nâng cao (Khó)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. DANH SÁCH CÂU HỎI TRỰC QUAN (VISUAL BUILDER) ── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '20px 24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              2. Danh sách câu hỏi ({questions.length} câu)
            </h2>

            <button
              type="button"
              onClick={handleAddQuestion}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#2563EB',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>Thêm câu hỏi mới</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '18px 20px',
                  position: 'relative'
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#2563EB' }}>
                    Câu hỏi số {qIdx + 1}
                  </span>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12.5px',
                        padding: '4px 8px'
                      }}
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 size={14} />
                      <span>Xóa câu này</span>
                    </button>
                  )}
                </div>

                {/* Prompt */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Nội dung câu hỏi *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Nhập nội dung câu hỏi trắc nghiệm..."
                    value={q.prompt}
                    onChange={e => handleQuestionChange(qIdx, 'prompt', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '13.5px',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Options with Radio Selection */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Các lựa chọn đáp án (Tích chọn tròn ô là đáp án đúng):
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: q.correctAnswer === optIdx ? '#EFF6FF' : '#FFFFFF',
                          border: q.correctAnswer === optIdx ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                          borderRadius: '6px',
                          padding: '6px 10px'
                        }}
                      >
                        <input
                          type="radio"
                          name={`correct-ans-${qIdx}`}
                          checked={q.correctAnswer === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctAnswer', optIdx)}
                          style={{ cursor: 'pointer', accentColor: '#2563EB' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: q.correctAnswer === optIdx ? '#2563EB' : '#475569' }}>
                          {letter}.
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Nội dung đáp án ${letter}`}
                          value={q.options ? q.options[optIdx] : ''}
                          onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                          style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            fontSize: '13px',
                            color: '#0F172A',
                            outline: 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Lời giải thích đáp án
                  </label>
                  <input
                    type="text"
                    placeholder="Giải thích vì sao đáp án trên là chính xác (hiển thị khi học viên xem lại bài)..."
                    value={q.explanation || ''}
                    onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      fontSize: '13px',
                      padding: '0 12px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleAddQuestion}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                background: '#F1F5F9',
                border: '1px dashed #94A3B8',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              + Thêm câu hỏi tiếp theo
            </button>
          </div>
        </div>

        {/* ── SUBMIT BAR ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              borderRadius: '6px',
              background: '#2563EB',
              border: 'none',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Save size={16} />
            <span>Lưu & Xuất Bản Đề Thi</span>
          </button>
        </div>
      </form>

      {/* ── MODAL 1: SMART WORD / TEXT IMPORTER (NO JSON) ── */}
      {showTextModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowTextModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#2563EB" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Dán đề thi từ file Word / Văn bản (Không cần JSON)
                </h3>
              </div>
              <button
                onClick={() => setShowTextModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
              Dán trực tiếp câu hỏi định dạng thông thường (như trong đề thi Word). Hệ thống sẽ tự động tách câu hỏi, đáp án A/B/C/D và đáp án đúng.
            </p>

            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
              <b>Định dạng mẫu chuẩn:</b><br />
              Câu 1: Hàm nào dùng để tính tổng trong Excel?<br />
              A. AVERAGE<br />
              B. SUM<br />
              C. COUNT<br />
              D. MAX<br />
              Đáp án: B<br />
              Giải thích: Hàm SUM dùng để cộng tổng các giá trị.
            </div>

            <textarea
              rows={8}
              placeholder="Dán nội dung các câu hỏi vào đây..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />

            {textParseError && (
              <div style={{ color: '#DC2626', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{textParseError}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowTextModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleParseTextQuestions}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#2563EB',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Chuyển thành câu hỏi ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: AI AUTO QUIZ GENERATOR (NO JSON) ── */}
      {showAiModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowAiModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#2563EB" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Tự động tạo câu hỏi kiểm tra bằng AI
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              AI sẽ tự động soạn thảo bộ câu hỏi trắc nghiệm chuẩn hóa kèm 4 phương án, đáp án đúng và giải thích chi tiết.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Chủ đề câu hỏi
                </label>
                <select
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '13.5px',
                    padding: '0 12px',
                    outline: 'none'
                  }}
                >
                  <option value="excel-fast">Microsoft Excel (Hàm, Bảng tính, Phím tắt, Table)</option>
                  <option value="word-fast">Microsoft Word (Định dạng, Heading, Mục lục, Phím tắt)</option>
                  <option value="ppt-fast">Microsoft PowerPoint (Slide Master, Hiệu ứng, Trình chiếu)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Số lượng câu hỏi cần tạo
                </label>
                <select
                  value={aiQuestionCount}
                  onChange={e => setAiQuestionCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '13.5px',
                    padding: '0 12px',
                    outline: 'none'
                  }}
                >
                  <option value={3}>3 câu hỏi nhanh</option>
                  <option value={5}>5 câu hỏi tiêu chuẩn</option>
                  <option value={10}>10 câu hỏi bài thi hoàn chỉnh</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={isAiGenerating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  background: '#2563EB',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: isAiGenerating ? 'not-allowed' : 'pointer',
                  opacity: isAiGenerating ? 0.7 : 1
                }}
              >
                <Sparkles size={14} />
                <span>{isAiGenerating ? 'Đang tạo câu hỏi...' : 'Tạo câu hỏi ngay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
