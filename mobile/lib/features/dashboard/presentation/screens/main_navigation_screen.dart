import 'package:flutter/material.dart';
import '../../attendance/presentation/screens/qr_scanner_screen.dart';
import '../../quiz/presentation/screens/quiz_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  final bool isStaff;
  const MainNavigationScreen({super.key, this.isStaff = false});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.isStaff ? 'PH EDU • CỔNG HỌC VỤ' : 'PH DIGITAL EDUCATION',
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            tooltip: 'Quét mã QR điểm danh',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const QRScannerScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: widget.isStaff
            ? [
                _buildOverviewTab(),
                _buildScheduleTab(),
                _buildSubmissionsTab(),
                _buildAttendanceTab(),
                _buildProfileTab(),
              ]
            : [
                _buildStudentHomeTab(),
                _buildRoadmapTab(),
                _buildPracticeTab(),
                _buildAssignmentsTab(),
                _buildProfileTab(),
              ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: widget.isStaff
            ? const [
                NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Tổng quan'),
                NavigationDestination(icon: Icon(Icons.calendar_today_outlined), selectedIcon: Icon(Icons.calendar_today), label: 'Ca dạy'),
                NavigationDestination(icon: Icon(Icons.assignment_turned_in_outlined), selectedIcon: Icon(Icons.assignment_turned_in), label: 'Bài nộp'),
                NavigationDestination(icon: Icon(Icons.qr_code), selectedIcon: Icon(Icons.qr_code_2), label: 'Điểm danh'),
                NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Cá nhân'),
              ]
            : const [
                NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Trang chủ'),
                NavigationDestination(icon: Icon(Icons.map_outlined), selectedIcon: Icon(Icons.map), label: 'Lộ trình'),
                NavigationDestination(icon: Icon(Icons.psychology_outlined), selectedIcon: Icon(Icons.psychology), label: 'Luyện tập'),
                NavigationDestination(icon: Icon(Icons.description_outlined), selectedIcon: Icon(Icons.description), label: 'Bài tập'),
                NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Cá nhân'),
              ],
      ),
    );
  }

  Widget _buildStudentHomeTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Welcome Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Xin chào, Nguyễn Văn An (THGZ01)!', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              const Text('Lớp K26-WE01 • Tin Học Văn Phòng Cấp Tốc 3in1', style: TextStyle(color: Color(0xFFDBEAFE), fontSize: 13)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const QuizScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF1D4ED8),
                  minimumSize: const Size(double.infinity, 44),
                ),
                icon: const Icon(Icons.play_arrow),
                label: const Text('Vào luyện tập ngay (1 chạm)'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Quick Stats Row
        Row(
          children: [
            Expanded(child: _buildMetricCard('Điểm tích lũy', '1.250 PTS', Icons.star, const Color(0xFFF59E0B))),
            const SizedBox(width: 12),
            Expanded(child: _buildMetricCard('Chuỗi học tập', '7 Ngày', Icons.local_fire_department, const Color(0xFFEF4444))),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() => const Center(child: Text('Tổng quan học vụ giảng viên'));
  Widget _buildScheduleTab() => const Center(child: Text('Lịch dạy và ca học'));
  Widget _buildSubmissionsTab() => const Center(child: Text('Danh sách bài tập nộp'));
  Widget _buildAttendanceTab() => const Center(child: Text('Quản lý điểm danh QR'));
  Widget _buildRoadmapTab() => const Center(child: Text('Lộ trình học cá nhân'));
  Widget _buildPracticeTab() => const Center(child: Text('Ngân hàng đề thi Certiport'));
  Widget _buildAssignmentsTab() => const Center(child: Text('Bài tập thực hành'));
  Widget _buildProfileTab() => const Center(child: Text('Hồ sơ cá nhân & Chứng chỉ'));
}
