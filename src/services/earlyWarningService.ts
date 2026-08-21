import { StudentRiskProfile, RiskLevel } from '../types/edtech';
import { StudentAccount } from '../types/auth';
import { MasteryService } from './masteryService';
import { SmartReviewService } from './smartReviewService';
import { AnalyticsService } from './analyticsService';

export class EarlyWarningService {
  /**
   * Compute Risk Profile for a single student
   * Algorithm factors:
   * 1. Inactivity Factor (Days since last event): Max 40 pts
   * 2. Low Mastery Factor (< 50% avg mastery): Max 30 pts
   * 3. Unresolved Mistakes Backlog (> 5 mistakes): Max 20 pts
   * 4. Zero Quiz/Exam Completions: Max 10 pts
   */
  static computeStudentRisk(student: StudentAccount): StudentRiskProfile {
    const events = AnalyticsService.getEventHistory(student.id);
    const masteryRecords = Object.values(MasteryService.getMasteryRecords(student.id));
    const unresolvedMistakes = SmartReviewService.getUnresolvedMistakes(student.id);

    let riskScore = 0;
    const factors: string[] = [];

    // Factor 1: Inactivity
    let lastActiveDaysAgo = 0;
    if (events.length > 0) {
      const lastEventDate = new Date(events[0].timestamp);
      const diffMs = Date.now() - lastEventDate.getTime();
      lastActiveDaysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    } else {
      lastActiveDaysAgo = 14; // Default if no events recorded
    }

    if (lastActiveDaysAgo >= 14) {
      riskScore += 40;
      factors.push(`Không hoạt động ${lastActiveDaysAgo} ngày`);
    } else if (lastActiveDaysAgo >= 7) {
      riskScore += 25;
      factors.push(`Không hoạt động ${lastActiveDaysAgo} ngày qua`);
    } else if (lastActiveDaysAgo >= 3) {
      riskScore += 10;
      factors.push(`Chưa vào học trong 3 ngày qua`);
    }

    // Factor 2: Mastery Score
    const avgMastery = masteryRecords.length > 0
      ? Math.round(masteryRecords.reduce((acc, curr) => acc + curr.masteryScore, 0) / masteryRecords.length)
      : 0;

    if (masteryRecords.length === 0) {
      riskScore += 20;
      factors.push('Chưa hoàn thành bài luyện tập nào');
    } else if (avgMastery < 45) {
      riskScore += 30;
      factors.push(`Điểm thành thạo kỹ năng rất thấp (${avgMastery}%)`);
    } else if (avgMastery < 65) {
      riskScore += 15;
      factors.push(`Điểm thành thạo trung bình yếu (${avgMastery}%)`);
    }

    // Factor 3: Unresolved Mistakes
    if (unresolvedMistakes.length >= 8) {
      riskScore += 20;
      factors.push(`Tồn đọng ${unresolvedMistakes.length} câu hỏi làm sai chưa ôn lại`);
    } else if (unresolvedMistakes.length >= 4) {
      riskScore += 10;
      factors.push(`Tồn đọng ${unresolvedMistakes.length} câu hỏi sai`);
    }

    // Cap at 100
    riskScore = Math.min(Math.max(riskScore, 0), 100);

    // Determine Risk Level
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 25) riskLevel = 'MEDIUM';

    // Suggested Teacher Action
    let suggestedAction = 'Tiếp tục theo dõi tiến độ bình thường.';
    if (riskLevel === 'CRITICAL') {
      suggestedAction = 'Gọi điện thoại hoặc gửi Zalo nhắc nhở lịch học và phụ đạo riêng 1-1.';
    } else if (riskLevel === 'HIGH') {
      suggestedAction = 'Gửi tin nhắn thông báo lộ trình ôn tập và giao bài tập trúng điểm yếu.';
    } else if (riskLevel === 'MEDIUM') {
      suggestedAction = 'Dặn dò học viên làm bài Mini Test và Smart Review trước ca học tới.';
    }

    return {
      studentId: student.id,
      studentName: student.name,
      studentCode: student.studentCode,
      enrolledTracks: student.enrolledTracks || (student.programTrack ? [student.programTrack] : []),
      riskScore,
      riskLevel,
      factors: factors.length > 0 ? factors : ['Tiến độ học tập và chuyên cần tốt'],
      lastActiveDaysAgo,
      averageMastery: avgMastery,
      recentScoresTrend: riskScore > 50 ? 'declining' : 'stable',
      unresolvedMistakesCount: unresolvedMistakes.length,
      suggestedAction
    };
  }

  /**
   * Batch evaluate all student accounts for Teacher Early Warning Dashboard
   */
  static evaluateAllStudents(students: StudentAccount[]): StudentRiskProfile[] {
    return students.map(s => this.computeStudentRisk(s)).sort((a, b) => b.riskScore - a.riskScore);
  }
}
