// src/components/UserProfilePage/UserProfilePage.js
import React, { useState, useEffect } from 'react';
import Header from '../HomePage/Header';
import ProfileInfo from './ProfileInfo';
import ProfileStats from './ProfileStats';
import ItineraryView from './ItineraryView';
import './UserProfilePage.css';

const UserProfilePage = ({ user, onBack, onUpdate, onNavigateToCreated, onViewItinerary, onNavigateToHome }) => { // Add onNavigateToHome prop
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itineraries');
    const [userItineraries, setUserItineraries] = useState([]);

    useEffect(() => {
        if (user) {
            setIsLoading(false);
            loadUserItineraries();
        } else {
            const timer = setTimeout(() => {
                if (!user) {
                    console.error('No user data available');
                    onBack();
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [user, onBack]);

    const loadUserItineraries = () => {
        try {
            const savedItineraries = localStorage.getItem('userItineraries');
            if (savedItineraries) {
                const allItineraries = JSON.parse(savedItineraries);
                const userCreated = allItineraries.filter(itinerary =>
                    itinerary.createdBy === (user?.id || 'current-user')
                );
                setUserItineraries(userCreated);
                console.log('User itineraries loaded:', userCreated);
            }
        } catch (error) {
            console.error('Error loading user itineraries:', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = (updatedUser) => {
        setIsEditing(false);
        onUpdate(updatedUser);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleNavigateToHome = () => {
        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const handleViewItinerary = (itinerary) => {
        if (onViewItinerary) {
            onViewItinerary(itinerary);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="user-profile-page">
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#71C19D'
                }}>
                    <div>Loading user data...</div>
                    <button
                        className="back-button"
                        onClick={onBack}
                        style={{ marginTop: '20px' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#71C19D">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile-page account-page">
            {/* Full Width Header */}
            <div className="profile-header-full">
                <Header
                    onBack={onBack}
                    user={user}
                    onNavigateToProfile={() => { }}
                    onNavigateToHome={handleNavigateToHome}
                    onNavigateToCreated={onNavigateToCreated}
                />
            </div>

            {/* Profile Content */}
            <div className="profile-content-main">
                {/* Edit Profile Button in Top Right Corner */}
                {!isEditing && (
                    <div className="edit-profile-top-right">
                        <button className="edit-profile-btn-small" onClick={handleEdit}>
                            Edit Profile
                        </button>
                    </div>
                )}

                {/* Profile Info Section */}
                <ProfileInfo
                    user={user}
                    isEditing={isEditing}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />

                {/* Profile Stats Section */}
                <ProfileStats userItineraries={userItineraries} />
            </div>

            {/* Itinerary View Options */}
            <ItineraryView
                activeTab={activeTab}
                onTabClick={handleTabClick}
                userItineraries={userItineraries}
                user={user}
                onViewItinerary={handleViewItinerary}
            />
        </div>
    );
};

export default UserProfilePage;