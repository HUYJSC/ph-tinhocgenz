import React, { useState } from 'react';
import { Shield, X, Save } from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { ALL_PERMISSION_GROUPS, UserPermission } from '../../types/rbac';
import { AuditLogService } from '../../services/auditLogService';
import { soundFx } from '../../utils/audio';

export interface PermissionManagerModalProps {
  targetUser: UserProfile;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSavePermissions: (userId: string, updatedPermissions: UserPermission[]) => void;
}

export const PermissionManagerModal: React.FC<PermissionManagerModalProps> = ({
  targetUser,
  currentUser,
  isOpen,
  onClose,
  onSavePermissions
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<UserPermission[]>(() => {
    return (targetUser.permissions as UserPermission[]) || [];
  });

  if (!isOpen) return null;

  const handleToggle = (permKey: UserPermission) => {
    soundFx.playClick();
    setSelectedPermissions(prev => {
      if (prev.includes(permKey)) {
        return prev.filter(k => k !== permKey);
      }
      return [...prev, permKey];
    });
  };

  const handleToggleGroup = (groupPermKeys: UserPermission[]) => {
    soundFx.playClick();
    const allChecked = groupPermKeys.every(k => selectedPermissions.includes(k));
    if (allChecked) {
      setSelectedPermissions(prev => prev.filter(k => !groupPermKeys.includes(k)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...groupPermKeys])));
    }
  };

  const handleSave = () => {
    soundFx.playCorrect();

    // Log to Audit trail
    AuditLogService.log({
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'permission_changed',
      entityType: 'user_permissions',
      entityId: targetUser.id,
      before: targetUser.permissions || [],
      after: selectedPermissions
    });

    onSavePermissions(targetUser.id, selectedPermissions);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#0057B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
                Phân Quyền Ủy Quyền (Delegated RBAC)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748B' }}>
                Tài khoản: <strong>{targetUser.name}</strong> • Vai trò: <span style={{ color: '#0057B8', fontWeight: 600 }}>{targetUser.role.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Permission Groups Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {ALL_PERMISSION_GROUPS.map(group => {
            const groupKeys = group.permissions.map(p => p.key);
            const isAllGroupChecked = groupKeys.every(k => selectedPermissions.includes(k));
            const isSomeGroupChecked = groupKeys.some(k => selectedPermissions.includes(k));

            return (
              <div
                key={group.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#FFFFFF'
                }}
              >
                {/* Group Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #F1F5F9',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {group.name}
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                      {group.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGroup(groupKeys)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0057B8',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isAllGroupChecked ? 'Bỏ chọn nhóm' : isSomeGroupChecked ? 'Chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>

                {/* Permission Checkboxes */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '10px'
                }}>
                  {group.permissions.map(perm => {
                    const isChecked = selectedPermissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: isChecked ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                          background: isChecked ? '#EFF6FF' : '#FAFCFF',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          color: isChecked ? '#0057B8' : '#334155',
                          fontWeight: isChecked ? 600 : 500,
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(perm.key)}
                          style={{
                            width: '15px',
                            height: '15px',
                            accentColor: '#0057B8',
                            cursor: 'pointer'
                          }}
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Đã chọn: <strong>{selectedPermissions.length}</strong> quyền
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#0057B8',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={15} />
              <span>Lưu phân quyền</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
