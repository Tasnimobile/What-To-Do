// src/components/UserProfilePage/ProfileStats.js
import React from 'react';
import './ProfileStats.css';

const ProfileStats = () => {
    const stats = {
        itineraries: 0,
        saved: 0,
        recent: 0
    };

    return (
        <div className="profile-stats-small">
            <div className="stat-item-small">
                <div className="stat-number-small">{stats.itineraries}</div>
                <div className="stat-label-small">Created</div>
            </div>
            <div className="stat-item-small">
                <div className="stat-number-small">{stats.saved}</div>
                <div className="stat-label-small">Saved</div>
            </div>
            <div className="stat-item-small">
                <div className="stat-number-small">{stats.recent}</div>
                <div className="stat-label-small">Recent</div>
            </div>
        </div>
    );
};

export default ProfileStats;