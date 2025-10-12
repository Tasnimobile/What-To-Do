// src/components/UserProfilePage/ProfileInfo.js
import React from 'react';
import './ProfileInfo.css';

const ProfileInfo = ({ user, isEditing, onSave, onCancel }) => {
    const [formData, setFormData] = React.useState({
        username: user.username || '',
        bio: user.bio || '',
        profilePicture: null
    });
    const [previewUrl, setPreviewUrl] = React.useState(user.profilePicture || '');

    React.useEffect(() => {
        setFormData({
            username: user.username || '',
            bio: user.bio || '',
            profilePicture: null
        });
        setPreviewUrl(user.profilePicture || '');
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }

            setFormData({
                ...formData,
                profilePicture: file
            });

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfilePicture = () => {
        setFormData({
            ...formData,
            profilePicture: null
        });
        setPreviewUrl('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedUser = {
            ...user,
            username: formData.username,
            bio: formData.bio,
            profilePicture: previewUrl || user.profilePicture
        };
        onSave(updatedUser);
    };

    const handleCancel = () => {
        setFormData({
            username: user.username || '',
            bio: user.bio || '',
            profilePicture: null
        });
        setPreviewUrl(user.profilePicture || '');
        onCancel();
    };

    return (
        <div className="profile-top-section">
            <div className="profile-picture-section-modern">
                <div className="profile-picture-container-modern">
                    {isEditing ? (
                        <div className="profile-picture-upload-modern">
                            <div className="profile-picture-preview-modern">
                                {previewUrl ? (
                                    <div className="preview-container-modern">
                                        <img src={previewUrl} alt="Profile preview" className="profile-preview-modern" />
                                        <button type="button" className="remove-picture-btn-modern" onClick={removeProfilePicture}>
                                            ×
                                        </button>
                                    </div>
                                ) : user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="profile-image-modern" />
                                ) : (
                                    <div className="no-profile-picture-modern">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="#71C19D">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <label className="file-input-label-modern">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input"
                                />
                                Change Photo
                            </label>
                        </div>
                    ) : (
                        <div className="profile-picture-display-modern">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="profile-image-modern" />
                            ) : (
                                <div className="no-profile-picture-modern">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="#71C19D">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* User Info beside profile photo */}
            <div className="profile-info-side">
                {isEditing ? (
                    <form className="edit-profile-form" onSubmit={handleSubmit}>
                        <div className="edit-form-content">
                            <div className="edit-fields-container">
                                <div className="edit-input-group">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="edit-input-line"
                                        maxLength="30"
                                    />
                                </div>

                                <div className="edit-input-group">
                                    <textarea
                                        name="bio"
                                        placeholder="Tell everyone about yourself..."
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="edit-textarea-line"
                                        rows="2"
                                        maxLength="150"
                                    />
                                </div>

                                <div className="email-section">
                                    <span className="email-text">{user.email}</span>
                                </div>
                            </div>

                            <div className="edit-actions-side">
                                <button type="submit" className="save-button-modern">
                                    Save
                                </button>
                                <button type="button" className="cancel-button-modern" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="username-display">
                            <h1 className="username-large">{user.username || 'Your Username'}</h1>
                        </div>

                        <div className="bio-section">
                            <p className="bio-text">{user.bio || 'No bio yet. Tell everyone about yourself!'}</p>
                        </div>

                        <div className="email-section">
                            <span className="email-text">{user.email}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileInfo;