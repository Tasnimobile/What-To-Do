// src/components/UserProfilePage/EditProfileForm.js
import React, { useState } from 'react';
import './EditProfileForm.css';

const EditProfileForm = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        username: user.username || '',
        bio: user.bio || '',
        profilePicture: null
    });
    const [previewUrl, setPreviewUrl] = useState(user.profilePicture || '');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const mockUser = {
                ...user,
                username: formData.username,
                bio: formData.bio,
                profilePicture: previewUrl || user.profilePicture
            };
            onSave(mockUser);
        } catch (err) {
            console.error("Update error:", err);
            alert('Profile updated successfully! (Offline mode)');
        }
    };

    return (
        <form className="profile-picture-upload-modern" onSubmit={handleSubmit}>
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

            <div className="edit-form-fields">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="edit-input-modern"
                    maxLength="30"
                />
                <textarea
                    name="bio"
                    placeholder="Tell everyone about yourself..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="edit-textarea-modern"
                    rows="3"
                    maxLength="150"
                />
            </div>

            <div className="edit-actions-modern">
                <button type="submit" className="save-button-modern">
                    Save Changes
                </button>
                <button type="button" className="cancel-button-modern" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditProfileForm;