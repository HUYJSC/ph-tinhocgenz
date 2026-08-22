import { SubjectCategory } from './quiz';

export type FileSourceType = 'docx' | 'doc' | 'pdf' | 'image' | 'text';

export interface SecurityOptions {
  disableCopy: boolean;
  disableDownload: boolean; // CHẶN TUYỆT ĐỐI TẢI FILE ĐỀ THI
  watermarkStudent: boolean;
  fullscreenRequired?: boolean;
  disableInspectPrint?: boolean;
}

export interface SampleDataFile {
  id: string;
  name: string;
  size: string;
  fileType: 'excel' | 'word' | 'powerpoint' | 'zip' | 'other';
  downloadUrl?: string; // URL hoặc data URI để tải về máy
  previewData?: string; // Nội dung xem trước dữ liệu mẫu trực tiếp trên web
}

export interface VideoLecture {
  title: string;
  videoUrl: string; // Embed YouTube / Google Drive / MP4
  durationText?: string;
  description?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  category: SubjectCategory;
  teacherId: string;
  teacherName: string;
  targetClass: string;
  sourceFileName?: string;
  sourceFileType: FileSourceType;
  rawContent: string; // Extracted text or preview (Hiển thị an toàn, CHẶN TẢI XUỐNG 100%)
  parsedQuestions: Array<{
    id: string;
    number: number;
    prompt: string;
    points: number;
    sampleAnswer?: string;
  }>;
  startTime: string; // ISO string e.g. "2026-08-20T08:00"
  endTime: string;   // ISO string e.g. "2026-08-25T23:59"
  durationMinutes: number; // e.g. 45
  isOpen: boolean; // Manual or scheduled toggle
  allowLateSubmission: boolean;
  securityOptions: SecurityOptions;

  // New: Video Clip bài giảng & File dữ liệu mẫu (cho phép học viên xem/tải về)
  videoLecture?: VideoLecture;
  sampleDataFiles?: SampleDataFile[];

  createdAt: string;
}

export interface GoogleDriveConfig {
  driveFolderUrl: string;
  scriptWebhookUrl?: string;
  folderName: string;
  autoSyncEnabled: boolean;
  lastConnectedAt?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  schoolOrClass?: string;
  answers: { [questionId: string]: string };
  attachedFileName?: string;
  attachedFileSize?: string;
  attachedFileUrl?: string; // base64 or object
  driveFileUrl?: string; // Google Drive file link
  driveFolderUrl?: string; // Google Drive target folder link
  driveSyncStatus?: 'synced' | 'local' | 'cloud_link' | 'pending';
  timeSpentSeconds: number;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  score?: number;
  maxScore?: number;
  teacherFeedback?: string;
  gradedAt?: string;
}

export interface TeacherNotification {
  id: string;
  type: 'student_submitted' | 'student_started';
  assignmentId: string;
  submissionId: string;
  studentName: string;
  studentCode: string;
  assignmentTitle: string;
  timestamp: string;
  isRead: boolean;
}
