import { AITutorMode, AITutorMessage } from '../types/edtech';
import { CurriculumTrack } from '../types/auth';

interface AIContext {
  studentName?: string;
  track?: CurriculumTrack;
  currentSkill?: string;
  recentMistakePrompt?: string;
  masteryScore?: number;
}

const TINHOCGENZ_KNOWLEDGE_BASE: Record<string, string> = {
  xlookup: `Hàm XLOOKUP trong Excel: Cú pháp =XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode]).
Ưu điểm: Không cần cố định vị trí cột như VLOOKUP, mặc định tìm chính xác (Exact match), tìm kiếm được từ phải sang trái.`,
  vlookup: `Hàm VLOOKUP trong Excel: Cú pháp =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup]).
Lưu ý: range_lookup = 0 (hoặc FALSE) để tìm chính xác. Cột tìm kiếm bắt buộc phải là cột đầu tiên bên trái của bảng.`,
  styles_word: `Kỹ năng Styles trong Microsoft Word: Sử dụng Styles (Heading 1, Heading 2, Normal) giúp định dạng văn bản nhất quán, tự động sinh Mục lục (Table of Contents) và chuyển đổi định dạng toàn tài liệu trong 1 click.`,
  morph_ppt: `Hiệu ứng Morph trong PowerPoint: Tạo chuyển động mượt mà giữa 2 slide liên tiếp có chung đối tượng. Để đổi dạng hoàn toàn hai hình dạng khác nhau, hãy đổi tên layer có tiền tố '!!' trong Selection Pane (VD: !!shape1).`,
  absolute_reference: `Tham chiếu Tuyệt đối trong Excel: Nhấn phím F4 (hoặc Fn+F4) để chuyển từ A1 thành $A$1. Dấu $ đứng trước cột/dòng nào thì sẽ khóa cứng cột/dòng đó khi sao chép công thức.`,
  ai_prompting: `Kỹ thuật Prompting cho Dân Văn Phòng: Áp dụng công thức CLEAR (Context + Logical Role + Explicit Instruction + Audience + Response Format) để yêu cầu AI tóm tắt văn bản, sinh bảng báo cáo hay viết email chuyên nghiệp.`
};

export class AITutorService {
  /**
   * Process a student query through the 3-Mode AI EdTech Engine
   */
  static async generateResponse(
    studentQuery: string,
    mode: AITutorMode,
    _context?: AIContext
  ): Promise<AITutorMessage> {
    const qLower = studentQuery.toLowerCase();

    // Mode 1: EXPLAIN (Giải thích kiến thức)
    if (mode === 'explain') {
      let explanation = '';
      if (qLower.includes('xlookup')) {
        explanation = `💡 **Giải Thích Chi Tiết Về XLOOKUP:**\n${TINHOCGENZ_KNOWLEDGE_BASE.xlookup}\n\n📌 **Mẹo thực hành:** Bạn chỉ cần chọn vùng giá trị tìm kiếm và vùng kết quả trả về, không cần đếm số thứ tự cột!`;
      } else if (qLower.includes('vlookup')) {
        explanation = `💡 **Giải Thích VLOOKUP Chuẩn:**\n${TINHOCGENZ_KNOWLEDGE_BASE.vlookup}\n\n⚠️ **Lỗi thường gặp:** Quên nhấn F4 để cố định bảng \`$A$1:$D$100\` hoặc quên đặt tham số cuối là \`0\`.`;
      } else if (qLower.includes('style') || qLower.includes('heading') || qLower.includes('mục lục')) {
        explanation = `💡 **Kỹ Năng Định Dạng Word Styles:**\n${TINHOCGENZ_KNOWLEDGE_BASE.styles_word}`;
      } else if (qLower.includes('morph') || qLower.includes('thuyết trình') || qLower.includes('slide')) {
        explanation = `💡 **Hiệu Ứng Morph PowerPoint:**\n${TINHOCGENZ_KNOWLEDGE_BASE.morph_ppt}`;
      } else if (qLower.includes('f4') || qLower.includes('tuyệt đối') || qLower.includes('cố định')) {
        explanation = `💡 **Tham Chiếu Tuyệt Đối ($A$1):**\n${TINHOCGENZ_KNOWLEDGE_BASE.absolute_reference}`;
      } else {
        explanation = `💡 **Góc Học Tập TinHocGenZ:**\nĐối với câu hỏi "${studentQuery}", trọng tâm bạn cần nhớ là: Nắm chắc bản chất cú pháp, phím tắt thực hành trên giao diện Microsoft Office và kiểm tra kỹ điều kiện tham số trước khi nhấn Enter!`;
      }

      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: explanation,
        mode: 'explain',
        suggestedAction: {
          label: 'Luyện 3 câu hỏi thực hành',
          actionType: 'take_quiz'
        },
        timestamp: new Date().toISOString()
      };
    }

    // Mode 2: HINT (Gợi ý từng bước - Tuyệt đối không cho đáp án)
    if (mode === 'hint') {
      let hintText = `🧭 **Gợi Ý Từng Bước (Không Tiết Lộ Đáp Án):**\n`;
      if (qLower.includes('hàm') || qLower.includes('công thức')) {
        hintText += `1. Hãy xác định điều kiện đầu vào của bài toán.\n2. Cần trả về giá trị gì?\n3. Hãy chú ý xem có cần khóa vùng dữ liệu bằng phím **F4** không nhé!`;
      } else if (qLower.includes('word') || qLower.includes('canh lề')) {
        hintText += `1. Nhớ lại thẻ menu (Tab) nào quản lý bố cục trang trong Word (Layout hay Home)?\n2. Đơn vị đo lường chuẩn nên dùng là cm hay inch?`;
      } else {
        hintText += `1. Đọc kỹ từ khóa chính trong câu hỏi.\n2. Loại trừ 2 phương án chắc chắn sai trước.\n3. Thử nhớ lại thao tác thực hành tương ứng trên phần mềm!`;
      }

      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: hintText,
        mode: 'hint',
        timestamp: new Date().toISOString()
      };
    }

    // Mode 3: QUIZ_CHECK (Kiểm tra xem học viên đã thực sự hiểu chưa)
    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `🎯 **Mini-Quiz Kiểm Tra Độ Hiểu Của Bạn:**\n\n**Câu hỏi:** Trong Excel, khi bạn viết công thức \`=XLOOKUP("NV01", A2:A10, C2:C10)\`, nếu không tìm thấy "NV01" và bạn không truyền tham số thứ 4, Excel sẽ trả về lỗi gì?\n\nA. #VALUE!\nB. #N/A\nC. 0\nD. #REF!\n\n*(Hãy trả lời A, B, C hoặc D để AI chấm điểm cho bạn nhé!)*`,
      mode: 'quiz_check',
      timestamp: new Date().toISOString()
    };
  }
}
