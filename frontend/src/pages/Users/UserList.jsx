import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import AddEditUserModal from './AddEditUserModal';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from '../../components/common/Icons';
import UserAvatar from '../../components/common/UserAvatar';

export default function UserList() {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  // Reset Password Modal
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('ChangeMe123!');
  const [resetLoading, setResetLoading] = useState(false);

  const loadTeachers = async () => {
    try {
      const res = await api.get('/teachers?limit=200');
      setTeachers(res.items || []);
    } catch {}
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '20',
        q: search.trim(),
        role: roleFilter
      });

      const res = await api.get(`/users?${queryParams.toString()}`);
      setUsers(res.items);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeactivate = async () => {
    if (!deactivatingUser) return;
    setDeactivateLoading(true);
    try {
      await api.delete(`/users/${deactivatingUser.id}`);
      toast.success(`User ${deactivatingUser.email} deactivated`);
      setDeactivatingUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate user');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetLoading(true);
    try {
      await api.post(`/users/${resettingUser.id}/reset-password`, { newPassword });
      toast.success(`Password reset for ${resettingUser.email}`);
      setResettingUser(null);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="panel" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div className="toolbar">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="TEACHER">TEACHER</option>
          </select>

          <button
            className="btn btn-primary btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              setEditingUser(null);
              setIsAddModalOpen(true);
            }}
          >
            <PlusIcon /> Add System User
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={loadUsers} />}

      {/* Users Table */}
      <div className="panel">
        <div className="table-responsive">
          {loading ? (
            <PageLoader text="Loading user accounts..." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Faculty Link</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserAvatar src={u.photoUrl || u.teacher?.photoUrl} name={u.fullName} role={u.role} size={36} showRoleBadge={false} />
                        <strong style={{ fontSize: 14 }}>{u.fullName}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <Badge type={u.role} />
                    </td>
                    <td>
                      {u.teacher ? `${u.teacher.firstName} ${u.teacher.lastName} (${u.teacher.employeeNo})` : '—'}
                    </td>
                    <td>
                      <Badge status={u.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setResettingUser(u);
                            setNewPassword('ChangeMe123!');
                          }}
                        >
                          Reset Pass
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit User"
                          onClick={() => {
                            setEditingUser(u);
                            setIsAddModalOpen(true);
                          }}
                        >
                          <EditIcon />
                        </button>
                        {!u.active && (
                          <button
                            className="btn btn-sm"
                            title="Activate User"
                            onClick={async () => {
                              try {
                                await api.put(`/users/${u.id}`, { active: true });
                                toast.success(`User ${u.email} activated successfully!`);
                                loadUsers();
                              } catch (err) {
                                toast.error(err.message || 'Failed to activate user');
                              }
                            }}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 12,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            ⚡ Activate
                          </button>
                        )}
                        {u.active && (
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Deactivate"
                            onClick={() => setDeactivatingUser(u)}
                            style={{ color: 'var(--danger)' }}
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <AddEditUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          targetUser={editingUser}
          teachers={teachers}
          onSaved={loadUsers}
        />
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <Modal
          isOpen={Boolean(resettingUser)}
          onClose={() => setResettingUser(null)}
          title={`Reset Password for ${resettingUser.email}`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setResettingUser(null)} disabled={resetLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleResetPassword} disabled={resetLoading}>
                {resetLoading ? 'Resetting...' : 'Set Password'}
              </button>
            </>
          }
        >
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="text"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Deactivate User Dialog */}
      {deactivatingUser && (
        <ConfirmDialog
          isOpen={Boolean(deactivatingUser)}
          onClose={() => setDeactivatingUser(null)}
          onConfirm={handleDeactivate}
          title="Deactivate User Account"
          message={`Are you sure you want to deactivate ${deactivatingUser.fullName} (${deactivatingUser.email})? They will no longer be able to log in.`}
          confirmText="Deactivate"
          isDanger={true}
          loading={deactivateLoading}
        />
      )}
    </div>
  );
}
