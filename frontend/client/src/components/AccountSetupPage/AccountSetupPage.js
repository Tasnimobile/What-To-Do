// src/components/AccountSetupPage/AccountSetupPage.js
import React, { useState } from 'react';
import './AccountSetupPage.css';

const AccountSetupPage = ({ user, onComplete, onBack }) => {
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        profilePicture: null
    });
    const [previewUrl, setPreviewUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('bio', formData.bio);
            if (formData.profilePicture) {
                formDataToSend.append('profilePicture', formData.profilePicture);
            }

            const res = await fetch("http://localhost:3000/api/user/setup", {
                method: "POST",
                credentials: "include",
                body: formDataToSend
            });

            const data = await res.json();

            if (res.ok && data.ok) {
                onComplete(data.user);
            } else {
                alert(data.errors?.join(", ") || "Setup failed");
            }
        } catch (err) {
            console.error("Setup error:", err);
            alert("Something went wrong. Please try again.");
        }
    };

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

    return (
        <div className="account-setup-page">
            <div className="account-setup-container">
                {/* Back Button */}
                <div className="back-button-container">
                    <button className="back-button" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        Back
                    </button>
                </div>

                <div className="setup-header">
                    <h1>Complete Your Profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                    {/* Profile Picture Upload */}
                    <div className="form-group">
                        <div className="profile-picture-upload">
                            <div className="profile-picture-preview">
                                {previewUrl ? (
                                    <div className="preview-container">
                                        <img src={previewUrl} alt="Profile preview" className="profile-preview" />
                                        <button type="button" className="remove-picture-btn" onClick={removeProfilePicture}>
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <label className="file-input-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input"
                                />
                                Choose Photo
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                            required
                            maxLength="30"
                        />
                        <div className="char-count">{formData.username.length}/30</div>
                    </div>

                    <div className="form-group">
                        <textarea
                            name="bio"
                            placeholder="Bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="form-textarea"
                            rows="3"
                            maxLength="150"
                        />
                        <div className="char-count">{formData.bio.length}/150</div>
                    </div>

                    <div className="button-container">
                        <button type="submit" className="setup-button">
                            Complete Setup
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSetupPage;