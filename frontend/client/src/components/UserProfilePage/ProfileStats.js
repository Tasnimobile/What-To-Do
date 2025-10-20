// src/components/UserProfilePage/ProfileStats.js
import React from "react";
import "./ProfileStats.css";

const ProfileStats = ({ userItineraries = [] }) => {
  const stats = {
    itineraries: userItineraries.length,
    saved: 0,
    recent: userItineraries.filter((itin) => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(itin.createdAt) > oneWeekAgo;
    }).length,
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
