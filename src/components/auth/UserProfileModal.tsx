import React from 'react';
import { UserProfile as AuthUserProfile } from '../../types/auth';
import { UserProfile as UnifiedUserProfileEngine, UserUnifiedProfile } from '../user/UserProfile';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUserProfile;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenChangePassword
}) => {
  if (!isOpen) return null;

  const unifiedProfile: UserUnifiedProfile = {
    id: currentUser.id || 'current-user',
    name: currentUser.name || 'Người Dùng',
    code: currentUser.studentCode || currentUser.teacherCode || 'TGZ-ME',
    role: (currentUser.role || 'STUDENT').toUpperCase(),
    status: 'active',
    avatar: currentUser.avatar,
    departmentOrClass: currentUser.schoolOrClass,
    email: currentUser.email || 'hocvien@tinhocgenz.edu.vn',
    phone: currentUser.phone || '0988 123 456',
    createdAt: currentUser.createdAt || '01/09/2026',
    studentData: {
      totalCourses: 5,
      overallProgress: 75,
      totalTests: 16,
      totalCertificates: 2
    },
    teacherData: {
      totalSubjects: 10,
      totalStudents: 352,
      averageRating: 4.9,
      totalHours: 128
    }
  };

  return (
    <UnifiedUserProfileEngine
      isOpen={isOpen}
      onClose={onClose}
      user={unifiedProfile}
      onResetPassword={() => {
        onClose();
        onOpenChangePassword();
      }}
    />
  );
};
