import 'package:flutter/material.dart';
import '../../../../core/storage/hive_storage.dart';

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> with WidgetsBindingObserver {
  int _currentQuestionIndex = 0;
  int _tabSwitchCount = 0;
  final Map<int, String> _userAnswers = {};

  final List<Map<String, dynamic>> _sampleQuestions = [
    {
      'id': 'q1',
      'content': 'Trong Microsoft Excel, hàm nào được dùng để tính tổng các ô thỏa mãn một điều kiện nhất định?',
      'options': ['SUM', 'SUMIF', 'COUNTIF', 'AVERAGEIF'],
      'correct': 'SUMIF',
    },
    {
      'id': 'q2',
      'content': 'Phím tắt nào dùng để cố định tham chiếu ô (tạo dấu \$) trong công thức Excel?',
      'options': ['F2', 'F4', 'Ctrl + F', 'F8'],
      'correct': 'F4',
    },
    {
      'id': 'q3',
      'content': 'Để trộn thư tự động trong Microsoft Word, người dùng sử dụng tính năng nào?',
      'options': ['Mail Merge', 'Track Changes', 'Macros', 'Page Setup'],
      'correct': 'Mail Merge',
    },
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) {
      // Phát hiện học viên rời ứng dụng (Anti-cheat)
      setState(() => _tabSwitchCount++);
      debugPrint('[AntiCheat] Phát hiện rời ứng dụng lần thứ: $_tabSwitchCount');
    }
  }

  void _submitQuiz() async {
    int correctCount = 0;
    for (int i = 0; i < _sampleQuestions.length; i++) {
      if (_userAnswers[i] == _sampleQuestions[i]['correct']) {
        correctCount++;
      }
    }

    final percentage = (correctCount / _sampleQuestions.length) * 100;

    // Lưu vào Hive offline queue phòng trường hợp mất mạng
    await HiveStorageService.queueOfflineAttempt({
      'exam_id': 'mobile-quick-test',
      'score': correctCount,
      'total': _sampleQuestions.length,
      'percentage': percentage,
      'tab_switch_count': _tabSwitchCount,
      'timestamp': DateTime.now().toIso8601String(),
    });

    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text('Kết Quả Bài Thi'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Số câu đúng: $correctCount / ${_sampleQuestions.length}'),
            Text('Tỷ lệ đạt: ${percentage.toStringAsFixed(1)}%'),
            if (_tabSwitchCount > 0)
              Text('Cảnh báo an ninh: Rời ứng dụng $_tabSwitchCount lần', style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 8),
            const Text('✅ Dữ liệu đã được lưu offline vào Hive và sẵn sàng đồng bộ backend.', style: TextStyle(fontSize: 12, color: Colors.green)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Về trang chủ'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentQ = _sampleQuestions[_currentQuestionIndex];

    return Scaffold(
      appBar: AppBar(
        title: Text('Câu ${_currentQuestionIndex + 1}/${_sampleQuestions.length}'),
        actions: [
          if (_tabSwitchCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 20),
                  const SizedBox(width: 4),
                  Text('Rời app: $_tabSwitchCount', style: const TextStyle(color: Colors.amber, fontSize: 12)),
                ],
              ),
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            LinearProgressIndicator(
              value: (_currentQuestionIndex + 1) / _sampleQuestions.length,
              backgroundColor: const Color(0xFFE2E8F0),
              color: const Color(0xFF2563EB),
            ),
            const SizedBox(height: 24),
            Text(
              currentQ['content'],
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, height: 1.5),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.separated(
                itemCount: (currentQ['options'] as List).length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (_, index) {
                  final option = currentQ['options'][index];
                  final isSelected = _userAnswers[_currentQuestionIndex] == option;

                  return InkWell(
                    onTap: () {
                      setState(() => _userAnswers[_currentQuestionIndex] = option);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
                        border: Border.all(
                          color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                          width: isSelected ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFF1F5F9),
                            ),
                            child: Center(
                              child: Text(
                                String.fromCharCode(65 + index),
                                style: TextStyle(
                                  color: isSelected ? Colors.white : const Color(0xFF475569),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              option,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Row(
              children: [
                if (_currentQuestionIndex > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _currentQuestionIndex--),
                      child: const Text('Câu trước'),
                    ),
                  ),
                if (_currentQuestionIndex > 0) const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      if (_currentQuestionIndex < _sampleQuestions.length - 1) {
                        setState(() => _currentQuestionIndex++);
                      } else {
                        _submitQuiz();
                      }
                    },
                    child: Text(_currentQuestionIndex == _sampleQuestions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
