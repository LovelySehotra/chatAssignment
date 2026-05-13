import React, { useState } from 'react';
import { userApi } from '../api/userApi';
import type { UpdateUserPayload } from '../api/userApi';
import { ApiResponse } from '../components/ApiResponse';

export const UsersPage: React.FC = () => {
  // Get current user
  const [meLoading, setMeLoading] = useState(false);
  const [meError, setMeError] = useState<any>(null);
  const [meData, setMeData] = useState<any>(null);

  // Get all users
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState<any>(null);
  const [allData, setAllData] = useState<any>(null);

  // Update user
  const [updateUsername, setUpdateUsername] = useState('');
  const [updateAvatar, setUpdateAvatar] = useState('');
  const [updateBio, setUpdateBio] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<any>(null);
  const [updateData, setUpdateData] = useState<any>(null);

  // Delete user
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<any>(null);
  const [deleteData, setDeleteData] = useState<any>(null);

  const handleGetMe = async () => {
    setMeLoading(true); setMeError(null); setMeData(null);
    try {
      const res = await userApi.getMe();
      setMeData(res.data);
    } catch (err: any) { setMeError(err.data || err); }
    finally { setMeLoading(false); }
  };

  const handleGetAll = async () => {
    setAllLoading(true); setAllError(null); setAllData(null);
    try {
      const res = await userApi.getAllUsers();
      setAllData(res.data);
    } catch (err: any) { setAllError(err.data || err); }
    finally { setAllLoading(false); }
  };

  const handleUpdate = async () => {
    setUpdateLoading(true); setUpdateError(null); setUpdateData(null);
    try {
      const payload: UpdateUserPayload = {};
      if (updateUsername) payload.username = updateUsername;
      if (updateAvatar) payload.avatar = updateAvatar;
      if (updateBio) payload.bio = updateBio;
      const res = await userApi.updateUser(payload);
      setUpdateData(res.data);
    } catch (err: any) { setUpdateError(err.data || err); }
    finally { setUpdateLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This is irreversible.')) return;
    setDeleteLoading(true); setDeleteError(null); setDeleteData(null);
    try {
      await userApi.deleteUser();
      setDeleteData({ message: 'User deleted successfully (204 No Content)' });
    } catch (err: any) { setDeleteError(err.data || err); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="page">
      <h2>👥 Users</h2>
      <p className="page-desc">All user endpoints require authentication (Bearer token).</p>

      <div className="card-grid">
        {/* Get Me */}
        <div className="card">
          <h3>GET /api/users/me — Current User</h3>
          <button className="btn btn-primary" onClick={handleGetMe} disabled={meLoading}>
            {meLoading ? 'Loading...' : 'Get My Profile'}
          </button>
          <ApiResponse label="Response" loading={meLoading} error={meError} data={meData} />
        </div>

        {/* Get All Users */}
        <div className="card">
          <h3>GET /api/users — All Users</h3>
          <button className="btn btn-primary" onClick={handleGetAll} disabled={allLoading}>
            {allLoading ? 'Loading...' : 'Get All Users'}
          </button>
          <ApiResponse label="Response" loading={allLoading} error={allError} data={allData} />
        </div>

        {/* Update User */}
        <div className="card">
          <h3>PATCH /api/users — Update Profile</h3>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={updateUsername} onChange={e => setUpdateUsername(e.target.value)}
              placeholder="New username" />
          </div>
          <div className="form-group">
            <label>Avatar URL</label>
            <input type="text" value={updateAvatar} onChange={e => setUpdateAvatar(e.target.value)}
              placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <input type="text" value={updateBio} onChange={e => setUpdateBio(e.target.value)}
              placeholder="Updated bio..." />
          </div>
          <button className="btn btn-primary" onClick={handleUpdate} disabled={updateLoading}>
            {updateLoading ? 'Updating...' : 'Update Profile'}
          </button>
          <ApiResponse label="Response" loading={updateLoading} error={updateError} data={updateData} />
        </div>

        {/* Delete User */}
        <div className="card">
          <h3>DELETE /api/users — Delete Account</h3>
          <p className="warning-text">⚠️ This will permanently delete the logged-in user account.</p>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete My Account'}
          </button>
          <ApiResponse label="Response" loading={deleteLoading} error={deleteError} data={deleteData} />
        </div>
      </div>

      {/* Edge case notes */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>🧪 Test Cases</h3>
        <ul>
          <li>All requests without token → should get 401 Unauthenticated</li>
          <li>Expired token → should get 401 Token expired</li>
          <li>Username longer than 50 chars → should fail validation</li>
          <li>Bio longer than 500 chars → should fail validation</li>
          <li>Delete then try other requests → should get 404 User not found</li>
        </ul>
      </div>
    </div>
  );
};
