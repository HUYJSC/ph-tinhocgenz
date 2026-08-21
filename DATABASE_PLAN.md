# BẢN KẾ HOẠCH DỮ LIỆU & SCHEMA (DATABASE & DATA CONTRACT PLAN)
**Hệ thống:** TinHocGenZ AI Learning & Assessment Platform 2026
**Mô hình lưu trữ:** Client-first Fast Reactive State với kiến trúc đồng bộ Cloud / Firestore Ready

---

## 1. CÁC THỰC THỂ DỮ LIỆU CỐT LÕI (CORE DATA ENTITIES)

### 👤 1. `UserProfile` & `Account`
* `id`, `name`, `studentCode` / `teacherCode`, `role` (`student` | `teacher` | `content_editor` | `exam_manager` | `admin` | `super_admin`), `passwordHash`, `assignedTracks`, `enrolledTracks`, `onboardingCompleted`, `targetGoal`, `diagnosticScore`, `streakDays`, `xpPoints`, `lastActive`.

### 🎯 2. `Skill` & `MasteryRecord`
* `skillId`: Mã kỹ năng nguyên tử (VD: `excel_xlookup`, `word_styles`, `ppt_morph_transition`).
* `skillName`, `category`, `level` (1-5).
* `masteryScore`: Điểm thành thạo từ 0–100.
* `correctCount`, `wrongCount`, `lastReviewedAt`, `status` (`not_started` | `in_progress` | `need_review` | `mastered`).

### 🧠 3. `SmartReviewItem` (Spaced Repetition Error Vault)
* `id`, `studentId`, `questionId`, `skillId`, `prompt`, `options`, `correctAnswer`, `userAnswer`, `explanation`, `mistakeCount`, `lastMistakeDate`, `nextReviewIntervalDays`, `isResolved`.

### 🗺️ 4. `LearningPath` & `RoadmapNode`
* `id`, `studentId`, `track`, `nodes`: `[ { id, title, skillIds, estimatedMinutes, isCompleted, masteryPct, isCurrentTarget } ]`.

### 📝 5. `Exam` & `ExamAttempt`
* `id`, `title`, `category`, `timeLimitMinutes`, `passingScore`, `questions`, `shuffleQuestions`, `autosaveKey`.
* `ExamAttempt`: `id`, `studentId`, `score`, `percentage`, `passed`, `skillBreakdown: { [skillId]: number }`, `weakSkills: string[]`, `aiRecommendations: string[]`.

### 🚨 6. `StudentRiskProfile` (Early Warning System)
* `studentId`, `riskScore` (0–100), `riskLevel` (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`), `factors`: `[ 'inactive_7_days', 'low_mastery', 'dropped_quiz_scores' ]`, `suggestedTeacherAction`.

### 📜 7. `Certificate`
* `certificateId` (VD: `TGZ-MOS-2026-02831`), `studentName`, `studentCode`, `courseTitle`, `issueDate`, `verificationUrl`, `status` (`valid` | `revoked`).

### 📊 8. `LearningEvent`
* `id`, `userId`, `eventType`, `courseId`, `lessonId`, `skillId`, `questionId`, `metadata`, `timestamp`, `sessionId`, `device`.
