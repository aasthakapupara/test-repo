import { useState } from 'react';
import { User, Mail, Phone, Shield, Key, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

const UserProfile = () => {
    const { user } = useAuth();
    const [editMode, setEditMode] = useState(false);

    // Form States
    const [profileData, setProfileData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        mobile: user?.mobile || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Custom Hook
    const {
        loading,
        status,
        setStatus,
        passwordStatus,
        setPasswordStatus,
        updateProfile,
        changePassword
    } = useProfile(user);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileData);
            setEditMode(false);
        } catch (err) { /* Handled by hook */ }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordStatus({ type: 'error', message: 'New passwords do not match!' });
            return;
        }

        try {
            await changePassword(passwordData);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) { /* Handled by hook */ }
    };

    if (!user) return <div className="loading-spinner">Loading Profile...</div>;

    return (
        <div className="management-page animate-fade-in">
            <div className="page-header">
                <div className="header-content">
                    <h1>My Profile</h1>
                    <p>Manage your account settings and security preferences</p>
                </div>
            </div>

            <div className="grid-2-1">
                {/* Personal Information */}
                <div className="content-card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <User size={24} className="text-primary" />
                            <h2>Personal Information</h2>
                        </div>
                        <button
                            className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            onClick={() => {
                                setEditMode(!editMode);
                                setStatus(null);
                            }}
                        >
                            {editMode ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <form onSubmit={handleProfileSubmit} style={{ marginTop: '1.5rem' }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label><User size={16} /> First Name</label>
                                <input
                                    type="text"
                                    value={profileData.firstname}
                                    onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })}
                                    disabled={!editMode}
                                />
                            </div>
                            <div className="form-group">
                                <label><User size={16} /> Last Name</label>
                                <input
                                    type="text"
                                    value={profileData.lastname}
                                    onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                                    disabled={!editMode}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label><Mail size={16} /> Email Address</label>
                            <input type="email" value={user.email} disabled />
                            <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Email cannot be changed.</p>
                        </div>

                        <div className="form-group">
                            <label><Phone size={16} /> Mobile Number</label>
                            <input
                                type="tel"
                                value={profileData.mobile}
                                onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                                disabled={!editMode}
                            />
                        </div>

                        {status && (
                            <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1.5rem' }}>
                                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {status.message}
                            </div>
                        )}

                        {editMode && (
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Security Section */}
                <div className="content-card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield size={24} className="text-secondary" />
                        <h2>Security</h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} style={{ marginTop: '1.5rem' }}>
                        <div className="form-group">
                            <label><Key size={16} /> Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Key size={16} /> New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><Shield size={16} /> Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        {passwordStatus && (
                            <div className={`alert ${passwordStatus.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1.5rem' }}>
                                {passwordStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {passwordStatus.message}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem' }}>
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
